import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Basics() {
  return (
    <div>
      <h2>The moving parts</h2>
      <p>Five concepts explain everything you'll write in Camel:</p>
      <table>
        <thead><tr><th>Concept</th><th>What it is</th></tr></thead>
        <tbody>
          <tr><td><strong>CamelContext</strong></td><td>The runtime container holding all routes, components, and registries. On Quarkus it's created and started for you.</td></tr>
          <tr><td><strong>Route</strong></td><td>One flow: exactly one <code>from()</code> (the consumer) followed by a chain of steps.</td></tr>
          <tr><td><strong>Endpoint</strong></td><td>A concrete source/destination, addressed by URI: <code>scheme:context?option=value</code>.</td></tr>
          <tr><td><strong>Exchange</strong></td><td>The envelope that travels the route. Carries the <strong>Message</strong> (body + headers) plus exchange properties and any exception.</td></tr>
          <tr><td><strong>Processor</strong></td><td>Any step that works on the exchange — your own code or a built-in EIP.</td></tr>
        </tbody>
      </table>

      <h2>Endpoint URIs</h2>
      <CodeBlock
        lang="java"
        title="Anatomy of an endpoint URI"
        code={`//   scheme : context path      ? options
//   ------   ----------------     ----------------------------
from("file  : orders/incoming    ? include=.*\\\\.json&moveFailed=.error")

// real examples
from("timer:tick?period=1000")                    // fire every second
from("kafka:orders?groupId=order-svc")            // consume a topic
to("sql:select * from orders where id = :#id")    // run a query
to("log:org.acme?level=DEBUG&showHeaders=true")   // log the exchange`}
      />
      <Callout type="warn">
        Endpoint URI options are the #1 place to consult the docs. Every component page on{' '}
        <a href="https://camel.apache.org/components/" target="_blank" rel="noreferrer">camel.apache.org/components</a>{' '}
        lists its options. Camel fails fast at startup on unknown options — a typo like{' '}
        <code>perod=1000</code> is caught immediately.
      </Callout>

      <h2>Exchange, body and headers</h2>
      <p>
        Each step receives the exchange, may change it, and passes it on. The three things you touch
        most: the <strong>body</strong> (payload), <strong>headers</strong> (per-message metadata such
        as file name or Kafka key), and <strong>exchange properties</strong> (metadata that survives
        for the whole route).
      </p>
      <CodeBlock
        lang="java"
        title="Working with the exchange"
        code={`from("file:orders/incoming?noop=true")
    .routeId("order-intake")                       // name shows up in logs/metrics
    .log("Picked up \${header.CamelFileName}")      // headers via simple language
    .setHeader("receivedAt", simple("\${date:now:yyyy-MM-dd'T'HH:mm:ss}"))
    .process(exchange -> {                          // arbitrary Java
        String body = exchange.getMessage().getBody(String.class);
        exchange.getMessage().setHeader("charCount", body.length());
    })
    .to("direct:validate");`}
      />
      <p>Three ways to run custom logic, in order of preference:</p>
      <CodeBlock
        lang="java"
        title="Processor vs bean"
        code={`// 1. Bean binding — best: plain testable class, Camel binds body/headers to params
.bean(OrderValidator.class, "validate")

@ApplicationScoped
public class OrderValidator {
    public Order validate(Order order, @Header("receivedAt") String when) {
        // return value becomes the new body
        return order;
    }
}

// 2. Inline lambda processor — fine for one-liners
.process(e -> e.getMessage().setBody("ok"))

// 3. Implementing org.apache.camel.Processor — verbose, rarely needed`}
      />

      <h2>The simple language</h2>
      <p>
        The expressions in quotes — <code>{'${body}'}</code>, <code>{'${header.CamelFileName}'}</code> —
        are Camel's built-in <strong>simple</strong> expression language. You'll use it inside{' '}
        <code>log()</code>, <code>filter()</code>, <code>choice()</code>, and <code>setHeader()</code>:
      </p>
      <CodeBlock
        lang="java"
        title="simple language cheat sheet"
        code={`simple("\${body}")                          // the message body
simple("\${body.total}")                     // getter access: body.getTotal()
simple("\${header.type}")                    // a header
simple("\${body.total} > 100")               // predicates for filter/when
simple("\${body.type} == 'ELECTRONIC'")      // string comparison
simple("\${bodyAs(String).length()} > 0")    // convert then call methods`}
      />

      <h2>Connecting routes: direct</h2>
      <p>
        The <code>direct:</code> component is an in-memory, synchronous bridge between routes in the
        same service. Use it to break a big flow into small, individually testable routes:
      </p>
      <CodeBlock
        lang="java"
        title="Composing routes"
        code={`from("file:orders/incoming")
    .to("direct:process");

from("direct:process")          // callable from any route (and from tests!)
    .log("processing \${body}")
    .to("direct:store");

from("direct:store")
    .to("log:store");`}
      />

      <h2>The same route in YAML DSL</h2>
      <p>
        Camel routes can also be declared in YAML (extension <code>camel-quarkus-yaml-dsl</code>,
        files in <code>src/main/resources/camel/</code>). Same semantics, different syntax — useful
        when routes should be editable without recompiling. This course uses Java everywhere, but you
        should be able to read YAML:
      </p>
      <CodeBlock
        lang="yaml"
        title="src/main/resources/camel/order-intake.camel.yaml"
        code={`- route:
    id: order-intake
    from:
      uri: file:orders/incoming
      parameters:
        noop: true
      steps:
        - log: "Picked up \${header.CamelFileName}"
        - setHeader:
            name: receivedAt
            simple: "\${date:now:yyyy-MM-dd'T'HH:mm:ss}"
        - to: direct:validate`}
      />

      <Exercise
        title="Build a two-route pipeline"
        lang="java"
        hint="Use .setBody(simple(...)) with \${bodyAs(String).toUpperCase()} or a lambda processor, and .setHeader() with the length."
        solution={`@ApplicationScoped
public class GreetingRoutes extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:greet?period=3000")
            .setBody(constant("hello camel"))
            .to("direct:shout");

        from("direct:shout")
            .setBody(simple("\${bodyAs(String).toUpperCase()}"))
            .setHeader("length", simple("\${bodyAs(String).length()}"))
            .log("shouting: \${body} (length=\${header.length})");
    }
}`}
      >
        <p>
          Write two routes: the first fires every 3 seconds and sends the body{' '}
          <code>"hello camel"</code> to <code>direct:shout</code>; the second uppercases the body,
          stores its length in a header named <code>length</code>, and logs both.
        </p>
      </Exercise>
    </div>
  );
}
