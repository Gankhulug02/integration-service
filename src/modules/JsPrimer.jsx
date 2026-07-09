import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function JsPrimer() {
  return (
    <div>
      <Callout type="info">
        Coming from React, Node or TypeScript? This module translates the Java world into terms you
        already know. If you're already a Java developer, skip straight to Module 2.
      </Callout>

      <h2>What is Java (for a TypeScript developer)?</h2>
      <p>
        Java is a statically typed, compiled language that runs on the <strong>JVM</strong> (Java
        Virtual Machine) — the backend runtime the way Node.js is a runtime for JS. The mental model
        from TypeScript transfers well, with one key difference: in TS, types are erased at build
        time; in Java, they're enforced by the compiler <em>and</em> exist at runtime. Classes and
        interfaces aren't an optional style — they're the unit of everything.
      </p>
      <p>The ecosystem maps almost one-to-one:</p>
      <table>
        <thead><tr><th>JS/TS world</th><th>Java world</th></tr></thead>
        <tbody>
          <tr><td><code>npm</code> / <code>pnpm</code> / <code>yarn</code></td><td><strong>Maven</strong> (or Gradle) — dependency manager + build tool</td></tr>
          <tr><td><code>package.json</code></td><td><code>pom.xml</code> — dependencies, plugins, build config</td></tr>
          <tr><td><code>node_modules/</code></td><td><code>~/.m2/</code> — one global cache, no per-project copies</td></tr>
          <tr><td><code>npm run build</code></td><td><code>mvn package</code> — produces a <code>.jar</code> (≈ a deployable bundle)</td></tr>
          <tr><td>Node.js runtime</td><td>JVM</td></tr>
          <tr><td><code>vite</code> / <code>nodemon</code> dev server</td><td><code>quarkus dev</code> — hot reload on save</td></tr>
          <tr><td>NestJS decorators (<code>@Injectable()</code>)</td><td>Annotations (<code>@ApplicationScoped</code>) + CDI dependency injection</td></tr>
          <tr><td>Single-threaded event loop</td><td>Many threads by default (Quarkus offers a reactive event-loop mode too)</td></tr>
        </tbody>
      </table>
      <CodeBlock
        lang="java"
        title="Java in 20 seconds, TS accent"
        code={`// TypeScript:  export class OrderService { create(order: Order): Receipt {...} }
// Java — same idea, types required everywhere, one public class per file:

@ApplicationScoped                        // ≈ @Injectable() in NestJS
public class OrderService {

    public Receipt create(Order order) {  // (Order order) ≈ (order: Order)
        return new Receipt(order.id());
    }
}`}
      />

      <h2>What is Quarkus?</h2>
      <p>
        Quarkus is a modern Java framework built for containers and cloud. A fair one-line pitch for
        a JS developer: <strong>the programming model of NestJS, the dev experience of Vite, and an
        optional "compile to a single native binary" mode</strong> à la Bun. What makes it different
        from older Java frameworks (Spring, Java EE):
      </p>
      <ul>
        <li><strong>Build-time magic instead of runtime magic</strong> — classpath scanning, DI wiring and config parsing happen when you build, not on every boot. Result: ~1s startup in JVM mode, ~30ms as a native binary.</li>
        <li><strong>Live reload</strong> — <code>quarkus dev</code> recompiles and reloads on every save, like a Vite dev server, plus a dev UI at <code>localhost:8080/q/dev</code>.</li>
        <li><strong>Dev Services</strong> — need Kafka or Postgres in dev? Quarkus silently starts throwaway Docker containers for you. It's the docker-compose file you never wrote.</li>
        <li><strong>Extensions</strong> — packages (like npm modules) that also hook into the build to make libraries fast and native-image friendly. Camel ships as ~300 of them.</li>
      </ul>

      <h2>What is an integration service?</h2>
      <p>
        An integration service is a backend service whose <em>entire job</em> is moving data between
        systems that don't naturally talk to each other: take orders from a REST API, validate them,
        write them to a database, publish events to Kafka, drop a CSV for the finance system. No UI,
        often barely any "business logic" of its own — it routes, transforms, and shuttles.
      </p>
      <p>
        You've already written miniature versions of this. Every time a handler fetches from one API,
        reshapes the response and posts it somewhere else, that's integration — as ad-hoc glue code:
      </p>
      <CodeBlock
        lang="javascript"
        title="Integration as glue code (Node/Express)"
        code={`app.post('/orders', async (req, res) => {
  const order = req.body;
  if (order.total <= 0) return res.status(400).end();

  await db.insert('orders', order);            // system 1: database
  await kafka.send('order-events', order);     // system 2: message broker

  res.json({ status: 'accepted' });
});
// Fine — until you need retries with backoff, a dead-letter queue,
// file drops, per-step metrics and tests for each connection.
// All of that is now yours to hand-roll, in every handler.`}
      />
      <p>
        A dedicated integration framework like Camel gives you the same flow as a declarative
        pipeline — think RxJS operators, but where each step can be a different <em>system</em> — with
        retries, error channels, metrics and testability built in:
      </p>
      <CodeBlock
        lang="java"
        title="The same flow as a Camel route"
        code={`from("platform-http:/orders")              // ≈ app.post('/orders')
    .unmarshal().json(Order.class)          // ≈ req.body + validation typing
    .filter(simple("\${body.total} > 0"))    // ≈ the if-guard
    .to("sql:INSERT INTO orders ...")       // system 1
    .to("kafka:order-events");              // system 2
// retries, backoff and dead-lettering: added in ~5 lines (Module 7)`}
      />

      <h2>Why does this stack exist? (the purpose)</h2>
      <ul>
        <li><strong>Protocol &amp; format bridging</strong> — REST speaks JSON over HTTP, the warehouse system reads XML files, finance wants rows in a database. Someone has to translate; better one well-tested service than glue scattered everywhere.</li>
        <li><strong>Decoupling</strong> — the order API doesn't need to know Kafka exists. Swap the broker, the API never changes. Systems evolve independently.</li>
        <li><strong>Reliability as a feature, not an afterthought</strong> — what happens when the database is down for 30 seconds? Integration frameworks answer this with retries, backoff and dead-letter queues you <em>configure</em> instead of write.</li>
        <li><strong>A shared vocabulary</strong> — the EIP patterns (Module 2) mean "content-based router" or "splitter" is a precise term any integration developer understands, like "reducer" or "middleware" in your world.</li>
      </ul>
      <Callout type="tip">
        Why should a React/TS developer care? Because this is what usually lives behind your BFF.
        When your <code>fetch()</code> succeeds but the order never reaches the warehouse, an
        integration service — its routes, retries and dead-letter queue — is where the answer is.
        Understanding it makes you dangerous at debugging the whole path, not just the browser half.
      </Callout>

      <Exercise
        title="Translate the glue code"
        lang="java"
        hint="Every await-a-system line becomes a .to(...) step; the if-guard becomes .filter(...). Order of steps = order of lines."
        solution={`from("platform-http:/signups")
    .unmarshal().json(Signup.class)
    .filter(simple("\${body.email} != null"))
    .to("sql:INSERT INTO signups (email, plan) VALUES (:#\${body.email}, :#\${body.plan})")
    .to("kafka:signup-events");

// Node original for comparison:
// app.post('/signups', async (req, res) => {
//   if (!req.body.email) return res.status(400).end();
//   await db.insert('signups', req.body);
//   await kafka.send('signup-events', req.body);
//   res.json({ ok: true });
// });`}
      >
        <p>
          Sketch (pseudo-code is fine — you'll learn the real syntax in Modules 3–4) a Camel route
          for this Express handler: <code>POST /signups</code> receives JSON, rejects bodies without
          an <code>email</code>, inserts the signup into a database table, then publishes it to the
          Kafka topic <code>signup-events</code>.
        </p>
      </Exercise>

      <p>
        Ready for the real thing? Continue with <Link to="/module/intro">Module 2 — Introduction</Link>,
        where Camel and the EIP catalogue get a proper treatment.
      </p>
    </div>
  );
}
