import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Deploy() {
  return (
    <div>
      <h2>JVM mode</h2>
      <p>
        The default build produces a <em>fast-jar</em>: a layout optimized for container layering
        and quick startup:
      </p>
      <CodeBlock
        lang="bash"
        title="Package and run (JVM)"
        code={`mvn package
java -jar target/quarkus-app/quarkus-run.jar

# containerize with the generated Dockerfile
docker build -f src/main/docker/Dockerfile.jvm -t camel-orders:jvm .
docker run -p 8080:8080 camel-orders:jvm`}
      />

      <h2>Native image</h2>
      <p>
        GraalVM native compilation turns the service into a single static binary: everything
        reachable is compiled ahead of time, the rest is stripped. Camel Quarkus extensions register
        the required reflection metadata for you — this is the main practical reason to use them
        rather than raw <code>camel-*</code> jars:
      </p>
      <CodeBlock
        lang="bash"
        title="Native build"
        code={`# with a local GraalVM/Mandrel installation
mvn package -Dnative

# no GraalVM installed? build inside a container (only Docker/Podman needed)
mvn package -Dnative -Dquarkus.native.container-build=true

./target/camel-orders-1.0.0-SNAPSHOT-runner
# ... started in 0.031s`}
      />
      <table>
        <thead><tr><th></th><th>JVM mode</th><th>Native</th></tr></thead>
        <tbody>
          <tr><td>Startup</td><td>~1–2 s</td><td>~20–50 ms</td></tr>
          <tr><td>Memory (RSS, idle)</td><td>~150–250 MB</td><td>~25–50 MB</td></tr>
          <tr><td>Peak throughput</td><td>slightly higher (JIT)</td><td>slightly lower</td></tr>
          <tr><td>Build time</td><td>seconds</td><td>minutes</td></tr>
        </tbody>
      </table>
      <Callout type="info">
        Typical figures for a small Camel service — measure your own. Rule of thumb: native wins for
        scale-to-zero, high-density, and CLI-style workloads; JVM mode wins for long-running,
        throughput-critical services.
      </Callout>

      <h2>Native gotchas for Camel apps</h2>
      <ul>
        <li><strong>Reflection</strong> — POJOs used with Jackson need registration. Annotate them with <code>@RegisterForReflection</code> if (un)marshalling fails at runtime in native mode only.</li>
        <li><strong>Dynamic endpoints</strong> — components resolved purely at runtime (e.g. URIs assembled from strings for a component you never declared) can't be detected at build time. Keep every scheme you use in the pom.</li>
        <li><strong>Test first</strong> — run integration tests against the native binary with <code>mvn verify -Dnative</code> (<code>@QuarkusIntegrationTest</code>).</li>
      </ul>
      <CodeBlock
        lang="java"
        title="Reflection registration"
        code={`import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class Order {
    public String id;
    public String type;
    public double total;
}`}
      />

      <h2>Container image</h2>
      <CodeBlock
        lang="bash"
        title="Native container"
        code={`# 1. native binary built in a container (linux/amd64)
mvn package -Dnative -Dquarkus.native.container-build=true

# 2. minimal runtime image (~50 MB total)
docker build -f src/main/docker/Dockerfile.native-micro -t camel-orders:native .
docker run -p 8080:8080 camel-orders:native`}
      />
      <p>
        Or let Quarkus do both steps and push, via the container-image extension:
      </p>
      <CodeBlock
        lang="properties"
        title="application.properties"
        code={`# quarkus ext add container-image-jib
quarkus.container-image.build=true
quarkus.container-image.group=my-registry/team
quarkus.container-image.push=true

# quarkus ext add kubernetes  -> also generates k8s manifests in target/kubernetes/
quarkus.kubernetes.replicas=2`}
      />

      <h2>Production checklist</h2>
      <ul>
        <li><code>quarkus ext add smallrye-health</code> — Camel routes feed <code>/q/health</code> readiness/liveness automatically.</li>
        <li><code>quarkus ext add micrometer-registry-prometheus</code> — per-route metrics (exchanges, failures, timings) at <code>/q/metrics</code>.</li>
        <li>Externalize broker/DB credentials via environment variables — <code>quarkus.datasource.password={'${DB_PASSWORD}'}</code>; never bake secrets into the image.</li>
        <li>Set <code>camel.main.shutdown-timeout</code> so in-flight exchanges drain gracefully on pod termination.</li>
      </ul>

      <Exercise
        title="Ship it"
        lang="bash"
        hint="Steps: native container build, docker build with Dockerfile.native-micro, docker run mapping 8080, then curl /q/health/ready."
        solution={`# 1. build the native binary without a local GraalVM
mvn package -Dnative -Dquarkus.native.container-build=true

# 2. build the runtime image
docker build -f src/main/docker/Dockerfile.native-micro -t camel-orders:1.0 .

# 3. run it
docker run -d --name orders -p 8080:8080 camel-orders:1.0

# 4. verify readiness (Camel context + routes are checked)
curl -s localhost:8080/q/health/ready
# {"status":"UP","checks":[{"name":"camel-routes","status":"UP"}, ...]}`}
      >
        <p>
          Write the exact command sequence to: build a native image without installing GraalVM
          locally, package it into the micro runtime container, run it exposing port 8080, and
          verify the Camel routes are up via the health endpoint.
        </p>
      </Exercise>

      <Callout type="tip">
        <strong>You made it.</strong> You can now scaffold a Camel Quarkus service, compose routes
        with EIPs, wire in REST/file/Kafka/SQL, handle failures deliberately, test routes in
        isolation, and ship a 30&nbsp;MB container that boots in milliseconds. Next stops:{' '}
        <a href="https://camel.apache.org/camel-quarkus/latest/" target="_blank" rel="noreferrer">Camel Quarkus docs</a>,{' '}
        <a href="https://camel.apache.org/components/" target="_blank" rel="noreferrer">the component catalogue</a>, and the{' '}
        <a href="https://www.enterpriseintegrationpatterns.com/" target="_blank" rel="noreferrer">EIP site</a>.
      </Callout>
    </div>
  );
}
