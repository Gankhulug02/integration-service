import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Setup() {
  return (
    <div>
      <h2>Prerequisites</h2>
      <table>
        <thead><tr><th>Tool</th><th>Version</th><th>Check with</th></tr></thead>
        <tbody>
          <tr><td>JDK</td><td>17 or 21 (LTS)</td><td><code>java -version</code></td></tr>
          <tr><td>Apache Maven</td><td>3.9+</td><td><code>mvn -version</code></td></tr>
          <tr><td>Quarkus CLI</td><td>latest (optional but recommended)</td><td><code>quarkus version</code></td></tr>
          <tr><td>Docker / Podman</td><td>any recent</td><td><code>docker version</code> — needed for Dev Services &amp; native container builds (Modules 6, 9)</td></tr>
        </tbody>
      </table>
      <CodeBlock
        lang="bash"
        title="Install the Quarkus CLI"
        code={`# via SDKMAN! (Linux/macOS)
sdk install quarkus

# via Homebrew (macOS)
brew install quarkusio/tap/quarkus

# via JBang (any OS)
jbang app install --fresh --force quarkus@quarkusio`}
      />

      <h2>Scaffold the project</h2>
      <p>
        Camel functionality arrives as Quarkus <strong>extensions</strong>, one per Camel component,
        named <code>camel-quarkus-*</code>. Start with the core plus a few basics:
      </p>
      <CodeBlock
        lang="bash"
        title="Create the app"
        code={`quarkus create app org.acme:camel-orders \\
    --extension='camel-quarkus-core,camel-quarkus-timer,camel-quarkus-log,camel-quarkus-direct'

cd camel-orders`}
      />
      <p>Or with plain Maven if you skipped the CLI:</p>
      <CodeBlock
        lang="bash"
        title="Maven alternative"
        code={`mvn io.quarkus.platform:quarkus-maven-plugin:create \\
    -DprojectGroupId=org.acme \\
    -DprojectArtifactId=camel-orders \\
    -Dextensions='camel-quarkus-core,camel-quarkus-timer,camel-quarkus-log,camel-quarkus-direct'`}
      />
      <p>The generated project is a standard Maven layout:</p>
      <div className="file-tree">{`camel-orders/
├── pom.xml                      # quarkus-bom + camel-quarkus extensions
├── src/main/java/org/acme/     # your RouteBuilder classes go here
├── src/main/resources/
│   └── application.properties   # all configuration
└── src/test/java/org/acme/     # tests (Module 8)`}</div>
      <p>
        In <code>pom.xml</code>, extensions are ordinary dependencies managed by the Quarkus platform
        BOM — no versions needed on individual extensions:
      </p>
      <CodeBlock
        lang="markup"
        title="pom.xml (excerpt)"
        code={`<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-core</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-timer</artifactId>
</dependency>`}
      />
      <Callout type="info">
        Add more extensions any time with <code>quarkus ext add camel-quarkus-kafka</code> (or by
        editing the pom). Rule of thumb: <strong>one extension per endpoint scheme</strong> you use in a
        route — <code>from("kafka:…")</code> needs <code>camel-quarkus-kafka</code>.
      </Callout>

      <h2>Your first route</h2>
      <p>
        Create a class extending <code>RouteBuilder</code>. Quarkus discovers it via CDI — no
        registration, no XML:
      </p>
      <CodeBlock
        lang="java"
        title="src/main/java/org/acme/HelloRoute.java"
        code={`package org.acme;

import jakarta.enterprise.context.ApplicationScoped;
import org.apache.camel.builder.RouteBuilder;

@ApplicationScoped
public class HelloRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:hello?period=2000")           // fire every 2 seconds
            .setBody(constant("Camel is running on Quarkus!"))
            .to("log:org.acme?level=INFO");       // write body to the log
    }
}`}
      />
      <CodeBlock
        lang="bash"
        title="Run it"
        code={`quarkus dev        # or: mvn quarkus:dev

# console output, every 2 seconds:
# INFO  [org.acme] ... Body: Camel is running on Quarkus!`}
      />
      <Callout type="tip">
        Leave <code>quarkus dev</code> running for the rest of the course. Change the timer period or
        the message, save, and watch the route reload in under a second — no restart.
      </Callout>

      <Exercise
        title="Personalize the timer route"
        lang="java"
        hint="The simple language can read exchange properties: \${exchangeProperty.CamelTimerCounter}. The timer component sets that property on each fire."
        solution={`@ApplicationScoped
public class HelloRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:hello?period=5000&repeatCount=10")
            .setBody(simple("Tick #\${exchangeProperty.CamelTimerCounter}"))
            .to("log:org.acme?level=INFO");
    }
}
// repeatCount=10 stops the timer after 10 fires;
// CamelTimerCounter is an exchange property set by the timer component.`}
      >
        <p>
          Modify <code>HelloRoute</code> so that it (a) fires every 5 seconds instead of 2,
          (b) stops after 10 messages, and (c) logs which tick number it is on.
          Check the <a href="https://camel.apache.org/components/next/timer-component.html" target="_blank" rel="noreferrer">timer component docs</a> for the option names.
        </p>
      </Exercise>
    </div>
  );
}
