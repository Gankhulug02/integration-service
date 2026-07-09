import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Testing() {
  return (
    <div>
      <h2>Test dependencies</h2>
      <CodeBlock
        lang="markup"
        title="pom.xml (test scope)"
        code={`<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-junit5</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-junit5</artifactId>   <!-- CamelQuarkusTestSupport -->
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-mock</artifactId>     <!-- mock: endpoints -->
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <scope>test</scope>
</dependency>`}
      />

      <h2>Style 1 — black box: @QuarkusTest + REST Assured</h2>
      <p>
        For routes exposed over HTTP, test the whole service from the outside. Quarkus boots the
        real application (Dev Services can supply Kafka/DB containers automatically):
      </p>
      <CodeBlock
        lang="java"
        title="OrderApiTest.java"
        code={`@QuarkusTest
class OrderApiTest {

    @Test
    void acceptsValidOrder() {
        given()
            .contentType("application/json")
            .body("{\\"id\\":\\"o-1\\",\\"type\\":\\"ELECTRONIC\\",\\"total\\":499.0}")
        .when()
            .post("/api/orders")
        .then()
            .statusCode(200)
            .body("status", is("accepted"));
    }

    @Test
    void rejectsEmptyOrder() {
        given().contentType("application/json").body("{}")
        .when().post("/api/orders")
        .then().statusCode(400);
    }
}`}
      />

      <h2>Style 2 — route-level: CamelQuarkusTestSupport</h2>
      <p>
        <code>CamelQuarkusTestSupport</code> is Camel Quarkus's port of the classic{' '}
        <code>CamelTestSupport</code>: it gives you the <code>ProducerTemplate</code> to inject
        messages, <code>MockEndpoint</code> to assert on outputs, and <strong>AdviceWith</strong> to
        rewrite endpoints so tests don't touch real brokers:
      </p>
      <CodeBlock
        lang="java"
        title="OrderRoutingTest.java"
        code={`@QuarkusTest
class OrderRoutingTest extends CamelQuarkusTestSupport {

    @Override
    public boolean isUseAdviceWith() {
        return true;                       // context won't start until we say so
    }

    @Test
    void highValueOrdersAreRoutedForReview() throws Exception {
        // rewrite the route under test: swap real endpoints for mocks
        AdviceWith.adviceWith(context, "order-routing", a -> {
            a.replaceFromWith("direct:test-in");          // no Kafka needed
            a.mockEndpoints("direct:manual-review");      // mock:direct:manual-review
        });
        startRouteDefinitions();

        MockEndpoint review = getMockEndpoint("mock:direct:manual-review");
        review.expectedMessageCount(1);
        review.expectedHeaderReceived("priority", "HIGH");

        template.sendBody("direct:test-in",
            "{\\"id\\":\\"o-9\\",\\"type\\":\\"STANDARD\\",\\"total\\":25000.0}");

        review.assertIsSatisfied();       // waits up to 10s
    }
}`}
      />
      <Callout type="tip">
        This is why Module 4 recommended composing flows from small <code>direct:</code> routes and
        giving every route a <code>.routeId()</code> — each one becomes independently testable, and
        AdviceWith needs the id to find it.
      </Callout>

      <h2>MockEndpoint assertions worth knowing</h2>
      <CodeBlock
        lang="java"
        title="MockEndpoint cheat sheet"
        code={`mock.expectedMessageCount(3);
mock.expectedBodiesReceived("a", "b", "c");        // exact bodies, in order
mock.expectedBodiesReceivedInAnyOrder("b", "a");
mock.expectedHeaderReceived("priority", "HIGH");
mock.allMessages().body().isNotNull();
mock.setResultWaitTime(2000);                       // shrink the default 10s wait
mock.assertIsSatisfied();

// and for negative tests:
mock.expectedMessageCount(0);
mock.setAssertPeriod(500);   // wait 500ms to be sure nothing arrives`}
      />

      <h2>Testing error handling</h2>
      <CodeBlock
        lang="java"
        title="Force a failure, assert the DLQ"
        code={`@Test
void failedOrdersLandInDlq() throws Exception {
    AdviceWith.adviceWith(context, "order-processing", a -> {
        a.replaceFromWith("direct:test-in");
        a.weaveByToUri("sql:*").replace()                 // make the DB step blow up
            .throwException(new java.sql.SQLTransientException("db down"));
        a.mockEndpoints("kafka:orders.DLQ");
    });
    startRouteDefinitions();

    MockEndpoint dlq = getMockEndpoint("mock:kafka:orders.DLQ");
    dlq.expectedMessageCount(1);

    template.sendBody("direct:test-in", validOrderJson());

    dlq.assertIsSatisfied();
}`}
      />

      <Exercise
        title="Test the filter"
        lang="java"
        hint="Two sends, one expectation: expectedMessageCount(1) plus expectedBodiesReceived for the passing message. Mock the output endpoint with mockEndpoints()."
        solution={`@QuarkusTest
class PaymentFilterTest extends CamelQuarkusTestSupport {

    @Override
    public boolean isUseAdviceWith() { return true; }

    @Test
    void dropsNonPositivePayments() throws Exception {
        AdviceWith.adviceWith(context, "payment-filter", a -> {
            a.mockEndpoints("direct:process");
        });
        startRouteDefinitions();

        MockEndpoint out = getMockEndpoint("mock:direct:process");
        out.expectedMessageCount(1);
        out.allMessages().body().contains("\\"amount\\":50");

        template.sendBody("direct:payments", "{\\"id\\":\\"p1\\",\\"amount\\":50}");
        template.sendBody("direct:payments", "{\\"id\\":\\"p2\\",\\"amount\\":-10}");

        out.assertIsSatisfied();
    }
}`}
      >
        <p>
          The route <code>payment-filter</code> consumes <code>direct:payments</code>, unmarshals
          JSON, filters out amounts ≤ 0, and forwards survivors to <code>direct:process</code>.
          Write a test that sends one valid and one invalid payment and proves exactly one message —
          the valid one — reaches the output.
        </p>
      </Exercise>
    </div>
  );
}
