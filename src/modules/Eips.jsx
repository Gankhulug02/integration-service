import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Eips() {
  return (
    <div>
      <p className="module-lead" style={{ marginBottom: '1rem' }}>
        Four patterns cover most integration logic. All examples assume an <code>Order</code> POJO
        with <code>id</code>, <code>type</code>, <code>total</code>, and <code>items</code> fields.
      </p>

      <h2>1. Content-Based Router</h2>
      <p>
        Routes each message to a different destination depending on its content —
        <code> choice()</code> is Camel's if/else-if/else:
      </p>
      <CodeBlock
        lang="java"
        title="choice / when / otherwise"
        code={`from("direct:orders")
    .choice()
        .when(simple("\${body.type} == 'ELECTRONIC'"))
            .to("direct:electronic")
        .when(simple("\${body.total} >= 1000"))
            .to("direct:high-value")
        .otherwise()
            .to("direct:standard")
    .end();                       // closes the choice block`}
      />
      <Callout type="warn">
        Order matters: the <em>first</em> matching <code>when()</code> wins. And don't forget{' '}
        <code>.end()</code> if steps follow the choice — otherwise they attach to the{' '}
        <code>otherwise()</code> branch, a classic Camel gotcha.
      </Callout>

      <h2>2. Message Filter</h2>
      <p>A one-branch router: matching messages continue, the rest are silently dropped.</p>
      <CodeBlock
        lang="java"
        title="filter"
        code={`from("direct:orders")
    .filter(simple("\${body.total} > 0"))     // only valid totals pass
    .to("direct:process");

// predicate can also be a method call on a bean:
from("direct:orders")
    .filter().method(OrderRules.class, "isShippable")
    .to("direct:ship");`}
      />

      <h2>3. Splitter &amp; Aggregator</h2>
      <p>
        The splitter turns one exchange into many — each item of a collection, each line of a file,
        each element of a JSON array — and the rest of the route runs once per piece:
      </p>
      <CodeBlock
        lang="java"
        title="split"
        code={`// split a java.util.List body: one exchange per order item
from("direct:order-received")
    .split(simple("\${body.items}"))
        .log("reserving stock for item \${body.sku}")
        .to("direct:reserve-stock")
    .end();

// split a text file into lines (streaming: doesn't load whole file in memory)
from("file:big-files")
    .split(body().tokenize("\\n")).streaming()
        .to("direct:process-line")
    .end();`}
      />
      <p>
        The aggregator is the inverse: it collects related exchanges (grouped by a{' '}
        <strong>correlation expression</strong>) and merges them with an{' '}
        <code>AggregationStrategy</code>. A <strong>completion condition</strong> says when the group
        is done:
      </p>
      <CodeBlock
        lang="java"
        title="aggregate"
        code={`from("direct:stock-responses")
    .aggregate(header("orderId"), (oldEx, newEx) -> {
        if (oldEx == null) return newEx;           // first message in the group
        String merged = oldEx.getMessage().getBody(String.class)
                + "," + newEx.getMessage().getBody(String.class);
        oldEx.getMessage().setBody(merged);
        return oldEx;
    })
    .completionSize(3)              // ...or when 3 messages arrived
    .completionTimeout(5000)        // ...or 5s after the last one
    .log("all stock reserved for \${header.orderId}: \${body}")
    .to("direct:confirm-order");`}
      />
      <Callout type="tip">
        <code>split()</code> has a shortcut for the round-trip pattern: give the splitter an{' '}
        <code>AggregationStrategy</code> as a second argument and it re-combines the pieces itself
        when the inner steps finish (composed message processor).
      </Callout>

      <h2>4. Message Translator</h2>
      <p>Three levels of transformation, from declarative to fully custom:</p>
      <CodeBlock
        lang="java"
        title="transform / marshal / bean"
        code={`// (a) format conversion: bytes/JSON <-> POJO (needs camel-quarkus-jackson)
from("direct:in")
    .unmarshal().json(Order.class)     // JSON string -> Order
    .to("direct:enrich");

from("direct:out")
    .marshal().json()                  // POJO -> JSON string
    .to("kafka:orders-out");

// (b) inline expression transform
.transform(simple("Order \${body.id}: \${body.total} EUR"))

// (c) full control in a bean — Order in, Invoice out
.bean(InvoiceMapper.class, "toInvoice")`}
      />

      <h2>Putting it together</h2>
      <CodeBlock
        lang="java"
        title="A realistic order flow"
        code={`from("direct:new-order")
    .unmarshal().json(Order.class)                 // translator
    .filter(simple("\${body.items.size()} > 0"))    // filter
    .choice()                                       // content-based router
        .when(simple("\${body.total} >= 1000"))
            .setHeader("priority", constant("HIGH"))
        .otherwise()
            .setHeader("priority", constant("NORMAL"))
    .end()
    .split(simple("\${body.items}"))                // splitter
        .to("direct:reserve-stock")
    .end()
    .marshal().json()
    .to("log:org.acme.orders");`}
      />

      <Exercise
        title="Route payments by size and currency"
        lang="java"
        hint="Chain when() clauses in the right order — check currency first, then amount. Remember .end()."
        solution={`from("direct:payments")
    .unmarshal().json(Payment.class)
    .filter(simple("\${body.amount} > 0"))
    .choice()
        .when(simple("\${body.currency} != 'EUR'"))
            .to("direct:fx-conversion")
        .when(simple("\${body.amount} >= 10000"))
            .to("direct:manual-review")
        .otherwise()
            .to("direct:auto-approve")
    .end()
    .log("payment \${body.id} routed");`}
      >
        <p>
          Write a route consuming from <code>direct:payments</code> that: unmarshals JSON into{' '}
          <code>Payment.class</code>; drops payments with amount ≤ 0; sends non-EUR payments to{' '}
          <code>direct:fx-conversion</code>; sends EUR payments of 10,000 or more to{' '}
          <code>direct:manual-review</code>; sends everything else to{' '}
          <code>direct:auto-approve</code>; and finally logs the payment id (for all surviving
          messages).
        </p>
      </Exercise>
    </div>
  );
}
