import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Integrations() {
  return (
    <div>
      <p className="module-lead" style={{ marginBottom: '1rem' }}>
        Swapping transports is Camel's superpower: the route logic stays identical, only the
        endpoint URIs (and one extension per scheme) change.
      </p>

      <h2>REST + JSON</h2>
      <p>
        Extensions: <code>camel-quarkus-rest</code>, <code>camel-quarkus-platform-http</code>,{' '}
        <code>camel-quarkus-jackson</code>. The REST DSL defines HTTP endpoints served by Quarkus's
        built-in HTTP server; <code>bindingMode(json)</code> auto-converts request/response bodies:
      </p>
      <CodeBlock
        lang="java"
        title="REST DSL"
        code={`@ApplicationScoped
public class OrderApi extends RouteBuilder {

    @Override
    public void configure() {
        restConfiguration()
            .bindingMode(RestBindingMode.json);   // auto JSON <-> POJO

        rest("/api/orders")
            .post().type(Order.class).to("direct:create-order")
            .get("/{id}").outType(Order.class).to("direct:get-order");

        from("direct:create-order")
            .log("creating order \${body.id}")
            .to("direct:process");

        from("direct:get-order")
            .setBody(header("id"))
            .bean(OrderRepository.class, "findById");
    }
}`}
      />
      <CodeBlock
        lang="bash"
        title="Try it"
        code={`curl -X POST localhost:8080/api/orders \\
     -H 'Content-Type: application/json' \\
     -d '{"id":"o-1","type":"ELECTRONIC","total":499.0}'`}
      />

      <h2>File</h2>
      <p>
        Extension: <code>camel-quarkus-file</code>. The consumer polls a directory; options control
        what happens to processed files:
      </p>
      <CodeBlock
        lang="java"
        title="File in, file out"
        code={`// consume: process each new .json file, archive it afterwards
from("file:orders/incoming?include=.*\\\\.json&move=.done&moveFailed=.error")
    .unmarshal().json(Order.class)
    .to("direct:process");

// produce: write one file per message, named by header
from("direct:archive")
    .marshal().json()
    .to("file:orders/archive?fileName=\${header.orderId}.json");`}
      />
      <Callout type="warn">
        Default consumer behavior <em>moves</em> files to <code>.camel/</code> after processing. Use{' '}
        <code>noop=true</code> to leave them untouched (with idempotent tracking), or{' '}
        <code>delete=true</code> to remove them.
      </Callout>

      <h2>Kafka (and JMS)</h2>
      <p>
        Extension: <code>camel-quarkus-kafka</code>. Configure the broker once in{' '}
        <code>application.properties</code>; URIs then only name the topic:
      </p>
      <CodeBlock
        lang="properties"
        title="application.properties"
        code={`camel.component.kafka.brokers=localhost:9092

# In dev/test you can skip even this: Quarkus Dev Services
# starts a Kafka broker in a container automatically.`}
      />
      <CodeBlock
        lang="java"
        title="Kafka routes"
        code={`// consumer — groupId gives you consumer-group semantics
from("kafka:orders?groupId=order-service&autoOffsetReset=earliest")
    .unmarshal().json(Order.class)
    .to("direct:process");

// producer — set the record key via header for partitioning
from("direct:publish-event")
    .setHeader(KafkaConstants.KEY, simple("\${body.id}"))
    .marshal().json()
    .to("kafka:order-events");`}
      />
      <p>
        JMS looks the same with a different scheme. Use <code>camel-quarkus-jms</code> plus a
        connection-factory extension such as <code>quarkus-artemis-jms</code>:
      </p>
      <CodeBlock
        lang="java"
        title="JMS route"
        code={`from("jms:queue:orders?concurrentConsumers=5")
    .to("direct:process");

from("direct:notify")
    .to("jms:topic:order-events");   // topic = pub/sub, queue = point-to-point`}
      />

      <h2>Database (Camel SQL / JDBC)</h2>
      <p>
        Extension: <code>camel-quarkus-sql</code> plus a Quarkus JDBC driver
        (e.g. <code>quarkus-jdbc-postgresql</code>). The SQL component uses the default Quarkus
        datasource; <code>:#{'${...}'}</code> binds named parameters from the exchange:
      </p>
      <CodeBlock
        lang="properties"
        title="application.properties"
        code={`quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=orders
quarkus.datasource.password=secret
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/orders
# again: omit URL/credentials in dev mode and Dev Services starts Postgres for you`}
      />
      <CodeBlock
        lang="java"
        title="SQL routes"
        code={`// insert — parameters bound from the Order body
from("direct:store-order")
    .to("sql:INSERT INTO orders (id, type, total) " +
        "VALUES (:#\${body.id}, :#\${body.type}, :#\${body.total})");

// query — result is a List<Map<String,Object>>
from("direct:find-order")
    .to("sql:SELECT * FROM orders WHERE id = :#\${header.orderId}")
    .log("found: \${body}");

// polling consumer — turn table rows into messages
from("sql:SELECT * FROM outbox WHERE sent = false?delay=5000" +
     "&onConsume=UPDATE outbox SET sent = true WHERE id = :#id")
    .to("direct:publish-event");`}
      />

      <h2>The payoff</h2>
      <CodeBlock
        lang="java"
        title="One flow, four transports"
        code={`// REST in -> validate -> DB + Kafka out. Each arrow is one line.
from("direct:create-order")           // called by the REST DSL above
    .bean(OrderValidator.class)
    .to("direct:store-order")         // SQL insert
    .to("direct:publish-event")       // Kafka producer
    .transform(simple("{\\"status\\":\\"accepted\\",\\"id\\":\\"\${body.id}\\"}"));`}
      />

      <Exercise
        title="File-to-Kafka bridge"
        lang="java"
        hint="file consumer options: include + move/moveFailed. Set the Kafka key with KafkaConstants.KEY before marshalling."
        solution={`from("file:import/customers?include=.*\\\\.json&move=.processed&moveFailed=.failed")
    .unmarshal().json(Customer.class)
    .filter(simple("\${body.email} != null"))
    .setHeader(KafkaConstants.KEY, simple("\${body.id}"))
    .marshal().json()
    .to("kafka:customers");`}
      >
        <p>
          Build a route that watches <code>import/customers</code> for <code>.json</code> files,
          unmarshals each into <code>Customer.class</code>, drops customers without an email, and
          publishes the rest to the Kafka topic <code>customers</code> keyed by customer id.
          Processed files should move to <code>.processed</code>, failed ones to{' '}
          <code>.failed</code>.
        </p>
      </Exercise>
    </div>
  );
}
