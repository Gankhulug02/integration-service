import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Intro() {
  return (
    <div>
      <h2>What is Apache Camel?</h2>
      <p>
        Apache Camel is an open-source <strong>integration framework</strong>: a toolkit for moving data
        between systems that were never designed to talk to each other. A REST API that must publish to
        Kafka, a directory of CSV files that must land in a database, an order service that must notify
        three downstream systems — these are integration problems, and Camel gives you a small,
        consistent vocabulary for solving all of them.
      </p>
      <p>That vocabulary has three core ideas:</p>
      <ul>
        <li><strong>Routes</strong> — a pipeline describing where messages come <em>from</em> and where they go <em>to</em>.</li>
        <li><strong>Components/Endpoints</strong> — adapters for concrete technologies (file, Kafka, JMS, SQL, HTTP… 300+ of them), addressed by URI like <code>kafka:orders</code> or <code>file:inbox</code>.</li>
        <li><strong>Enterprise Integration Patterns (EIPs)</strong> — named, reusable solutions for routing and transforming messages.</li>
      </ul>
      <p>Here is a complete, working Camel route — read it top to bottom like a sentence:</p>
      <CodeBlock
        lang="java"
        title="A taste of Camel"
        code={`from("file:orders/incoming")            // FROM: watch a directory
    .unmarshal().json(Order.class)       // TRANSFORM: JSON -> Order object
    .filter(simple("\${body.total} > 100")) // FILTER: only big orders
    .to("kafka:big-orders");             // TO: publish to Kafka`}
      />

      <h2>Enterprise Integration Patterns</h2>
      <p>
        EIPs come from the 2003 book <em>Enterprise Integration Patterns</em> by Gregor Hohpe and Bobby
        Woolf. It catalogued ~65 recurring messaging patterns and gave each a name and a diagram. Camel
        is essentially <strong>the reference implementation of that catalogue</strong>: nearly every
        pattern in the book exists as a first-class DSL construct. The ones you will use constantly:
      </p>
      <table>
        <thead>
          <tr><th>Pattern</th><th>Question it answers</th><th>Camel DSL</th></tr>
        </thead>
        <tbody>
          <tr><td>Content-Based Router</td><td>Where should this message go, based on its content?</td><td><code>choice() / when()</code></td></tr>
          <tr><td>Message Filter</td><td>Should this message continue at all?</td><td><code>filter()</code></td></tr>
          <tr><td>Splitter</td><td>How do I break one big message into many?</td><td><code>split()</code></td></tr>
          <tr><td>Aggregator</td><td>How do I combine many messages into one?</td><td><code>aggregate()</code></td></tr>
          <tr><td>Message Translator</td><td>How do I convert between formats?</td><td><code>transform() / marshal()</code></td></tr>
          <tr><td>Dead Letter Channel</td><td>What happens to messages that keep failing?</td><td><code>deadLetterChannel()</code></td></tr>
          <tr><td>Wire Tap</td><td>How do I copy a message elsewhere without disturbing the flow?</td><td><code>wireTap()</code></td></tr>
        </tbody>
      </table>
      <Callout type="tip">
        You don't need to memorize the catalogue. Learn the seven above and you can read 90% of
        real-world Camel routes. Module 5 implements the first five, and Module 7 covers Dead Letter Channel.
      </Callout>

      <h2>Why Quarkus + Camel?</h2>
      <p>
        Camel is runtime-agnostic — it runs on Spring Boot, standalone, or on Quarkus via the
        <strong> Camel Quarkus</strong> project, which packages every Camel component as a Quarkus
        extension. The combination is attractive for integration services specifically because they are
        usually deployed as many small, always-on (or scale-to-zero) containers:
      </p>
      <ul>
        <li><strong>Startup &amp; memory</strong> — Quarkus does configuration and wiring at <em>build time</em>. A JVM-mode Camel service starts in ~1s; compiled to a GraalVM native image it starts in tens of milliseconds and idles around 30&nbsp;MB RSS — ideal for Kubernetes and serverless.</li>
        <li><strong>Dev mode</strong> — <code>quarkus dev</code> hot-reloads your routes on save. Editing an integration flow feels like editing a script.</li>
        <li><strong>Unified configuration</strong> — Camel components are configured through the same <code>application.properties</code> and CDI mechanisms as the rest of Quarkus.</li>
        <li><strong>Native-image ready</strong> — Camel Quarkus extensions ship the reflection/serialization metadata GraalVM needs, so native builds mostly just work.</li>
      </ul>

      <h2>How this course works</h2>
      <p>
        Each module builds on the previous one around a running example: an <strong>order-processing
        integration service</strong>. You'll scaffold it in Module 3, wire real transports into it in
        Module 6, and ship it as a native container in Module 9. Every module ends with an exercise —
        try it before opening the solution — and a "mark complete" button that tracks your progress in
        the sidebar.
      </p>

      <Exercise
        title="Read a route"
        lang="java"
        hint="from = source, to = destination; everything between is processing, in order."
        solution={`// 1. Consume messages from the Kafka topic "payments"
// 2. Deserialize the JSON body into a Payment object
// 3. Drop payments of 0 or less (filter lets matching messages PASS)
// 4. Route by content: card payments to one queue, everything else to another
from("kafka:payments")
    .unmarshal().json(Payment.class)
    .filter(simple("\${body.amount} > 0"))
    .choice()
        .when(simple("\${body.method} == 'CARD'"))
            .to("jms:queue:card-payments")
        .otherwise()
            .to("jms:queue:other-payments");`}
      >
        <p>
          Without running anything, write down in plain English what the route in the solution does,
          step by step. Then open the solution and compare with the annotated version.
        </p>
      </Exercise>
    </div>
  );
}
