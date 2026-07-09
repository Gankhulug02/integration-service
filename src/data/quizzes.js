/**
 * Multiple-choice questions, keyed by module slug.
 * Shape: { q, options[4], answer: index into options, explain }
 * Modules render these via <Quiz/>; the final exam samples from all of them.
 */
export const QUIZZES = {
  'js-primer': [
    {
      q: 'What is the Java-world equivalent of package.json?',
      options: ['application.properties', 'pom.xml', 'MANIFEST.MF', 'build.js'],
      answer: 1,
      explain: 'pom.xml declares dependencies, plugins and build config for Maven — the same role package.json plays for npm.',
    },
    {
      q: 'Which JS-world tool is the closest analogy to `quarkus dev`?',
      options: ['webpack (production bundling)', 'ESLint (static analysis)', 'A Vite dev server (hot reload on save)', 'Jest (test runner)'],
      answer: 2,
      explain: 'quarkus dev recompiles and reloads the app on every save — the same feedback loop as a Vite/nodemon dev server.',
    },
    {
      q: 'What is the primary job of an integration service?',
      options: [
        'Rendering server-side HTML for web clients',
        'Moving, transforming and routing data between systems that don\'t naturally talk to each other',
        'Storing business data with strong consistency guarantees',
        'Authenticating users across microservices',
      ],
      answer: 1,
      explain: 'Integration services shuttle data between APIs, brokers, files and databases — routing and translating, with little business logic of their own.',
    },
  ],
  intro: [
    {
      q: 'What are Enterprise Integration Patterns (EIPs)?',
      options: [
        'A Java EE specification for message-driven beans',
        'A catalogue of named, reusable solutions to recurring messaging problems',
        'Kafka-specific configuration presets',
        'A UML diagram standard for microservices',
      ],
      answer: 1,
      explain: 'The 2003 Hohpe/Woolf book catalogued ~65 recurring messaging patterns; Camel implements nearly all of them as DSL constructs.',
    },
    {
      q: 'Which EIP does Camel\'s choice()/when()/otherwise() implement?',
      options: ['Splitter', 'Aggregator', 'Content-Based Router', 'Wire Tap'],
      answer: 2,
      explain: 'choice() routes each message to a different destination based on its content — the Content-Based Router pattern.',
    },
    {
      q: 'Why is Quarkus a particularly good runtime for Camel integration services?',
      options: [
        'It is the only runtime Camel supports',
        'It does wiring at build time, giving fast startup and low memory — ideal for many small containers',
        'It removes the need for testing',
        'It automatically clusters routes across pods',
      ],
      answer: 1,
      explain: 'Build-time wiring means ~1s JVM startup or ~30ms native startup and small memory footprints — a great fit for container deployments.',
    },
  ],
  setup: [
    {
      q: 'You add from("kafka:orders") to a route. What does the rule of thumb say you need?',
      options: [
        'Nothing — camel-quarkus-core covers all components',
        'The camel-quarkus-kafka extension in the pom',
        'A kafka.yaml file in src/main/resources',
        'A @KafkaClient annotation on the RouteBuilder',
      ],
      answer: 1,
      explain: 'One extension per endpoint scheme: every URI scheme you use (kafka:, file:, sql:…) needs its camel-quarkus-* extension.',
    },
    {
      q: 'How does Quarkus discover your RouteBuilder classes?',
      options: [
        'You list them in application.properties',
        'You register them in a camel-context.xml file',
        'As CDI beans (e.g. @ApplicationScoped) — no registration needed',
        'They must be named *Route.java',
      ],
      answer: 2,
      explain: 'Any RouteBuilder that is a CDI bean is picked up automatically — no XML, no manual registration.',
    },
    {
      q: 'What does `quarkus dev` give you while working through this course?',
      options: [
        'A production-optimized build',
        'Hot reload of routes on save, in under a second',
        'Automatic deployment to Kubernetes',
        'A GraalVM native image',
      ],
      answer: 1,
      explain: 'Dev mode recompiles and reloads on save — edit a route, save, and watch the new behavior immediately.',
    },
  ],
  basics: [
    {
      q: 'What is the Exchange in Camel?',
      options: [
        'The thread pool that runs routes',
        'The envelope that travels the route, carrying the message (body + headers) plus properties',
        'A Kafka-specific acknowledgment object',
        'The registry of all endpoints',
      ],
      answer: 1,
      explain: 'Each step receives the Exchange, may change its body/headers/properties, and passes it on.',
    },
    {
      q: 'What does the direct: component do?',
      options: [
        'Sends messages over raw TCP',
        'Connects routes synchronously in memory within the same service',
        'Writes messages directly to disk',
        'Bypasses error handling',
      ],
      answer: 1,
      explain: 'direct: is an in-memory, synchronous bridge — ideal for splitting a big flow into small, individually testable routes.',
    },
    {
      q: 'In simple("${body.total} > 100"), what does ${body.total} do?',
      options: [
        'Reads an environment variable named body.total',
        'Calls getTotal() on the message body via getter access',
        'Looks up a header named body.total',
        'It is invalid syntax — simple cannot access fields',
      ],
      answer: 1,
      explain: 'The simple language supports getter navigation: ${body.total} calls body.getTotal().',
    },
    {
      q: 'What is the structure of a Camel endpoint URI?',
      options: [
        'protocol://host:port/path only',
        'scheme:contextPath?option=value&option=value',
        'component#endpoint@options',
        'A JSON object with type and config fields',
      ],
      answer: 1,
      explain: 'Example: file:orders/incoming?noop=true — scheme (component), context path, then component-specific options.',
    },
  ],
  eips: [
    {
      q: 'In a choice() block with multiple when() clauses, which branch runs?',
      options: [
        'All branches whose predicate matches',
        'Only the first when() whose predicate matches',
        'The branch with the most specific predicate',
        'otherwise() always runs in addition',
      ],
      answer: 1,
      explain: 'choice() is if / else-if / else: the first matching when() wins and the rest are skipped.',
    },
    {
      q: 'Why add .streaming() to a splitter over a large file?',
      options: [
        'It processes pieces without loading the whole payload into memory',
        'It parallelizes across all CPU cores automatically',
        'It skips malformed lines',
        'It is required for tokenize() to work at all',
      ],
      answer: 0,
      explain: 'Without streaming, the splitter materializes everything up front; with it, pieces are read lazily — essential for big files.',
    },
    {
      q: 'Which three things does an aggregator need?',
      options: [
        'A topic name, a consumer group, and a partition key',
        'A correlation expression, an AggregationStrategy, and a completion condition',
        'A timer, a filter, and a transformer',
        'Only an AggregationStrategy',
      ],
      answer: 1,
      explain: 'Correlation groups related messages, the strategy merges them, and completion (size/timeout/predicate) says when the group is done.',
    },
    {
      q: 'You forget .end() after a choice() and add more steps. What happens?',
      options: [
        'Compilation fails',
        'The extra steps run for every message regardless of branch',
        'The extra steps attach to the otherwise() branch only',
        'Camel throws at startup',
      ],
      answer: 2,
      explain: 'A classic gotcha: without .end(), subsequent steps belong to the last branch instead of the main flow.',
    },
  ],
  integrations: [
    {
      q: 'What does restConfiguration().bindingMode(RestBindingMode.json) enable?',
      options: [
        'Gzip compression on all endpoints',
        'Automatic JSON ↔ POJO conversion for REST request/response bodies',
        'JSON schema validation',
        'HTTPS enforcement',
      ],
      answer: 1,
      explain: 'With binding mode json (plus camel-quarkus-jackson), .type(Order.class) requests arrive as POJOs and responses are serialized back.',
    },
    {
      q: 'By default, what does the file consumer do with a file after processing it?',
      options: [
        'Deletes it',
        'Leaves it untouched',
        'Moves it into a .camel/ subdirectory',
        'Renames it with a .done suffix',
      ],
      answer: 2,
      explain: 'The default is move-to-.camel/. Use noop=true to leave files in place or delete=true to remove them.',
    },
    {
      q: 'In sql:INSERT ... VALUES (:#${body.id}), what is :#${body.id}?',
      options: [
        'A SQL comment',
        'A named parameter bound from the exchange at runtime',
        'String concatenation (SQL injection risk)',
        'A database sequence reference',
      ],
      answer: 1,
      explain: 'The SQL component binds :# parameters from headers/body safely — no string concatenation, no injection.',
    },
    {
      q: 'What are Quarkus Dev Services?',
      options: [
        'A paid support subscription',
        'Auto-started throwaway containers (Kafka, Postgres…) for dev and test when no config is provided',
        'A dashboard for monitoring routes',
        'Mock implementations of Camel components',
      ],
      answer: 1,
      explain: 'Omit broker/DB config in dev mode and Quarkus starts real services in containers automatically — like a docker-compose you never wrote.',
    },
  ],
  errors: [
    {
      q: 'What does the Dead Letter Channel pattern do?',
      options: [
        'Encrypts failed messages',
        'Retries a failing message, then parks it on a dedicated endpoint for inspection',
        'Silently discards all errors',
        'Restarts the whole route on failure',
      ],
      answer: 1,
      explain: 'Retry a few times with backoff; when retries are exhausted, move the message to a DLQ instead of failing forever.',
    },
    {
      q: 'Why call useOriginalMessage() on a dead letter channel?',
      options: [
        'It improves performance',
        'The DLQ receives the message as originally received, not half-transformed by the failing route',
        'It preserves Kafka offsets',
        'It enables message encryption',
      ],
      answer: 1,
      explain: 'Without it, the DLQ gets the body as it was at the failing step — often useless for replay.',
    },
    {
      q: 'What does handled(true) do inside onException()?',
      options: [
        'Logs the exception and rethrows it',
        'Swallows the exception so the caller gets your fallback response instead of an error',
        'Marks the message for redelivery',
        'Sends the message to the DLQ',
      ],
      answer: 1,
      explain: 'handled(true) stops propagation — ideal for business errors like validation, where retrying makes no sense.',
    },
    {
      q: 'redeliveryDelay(1000) + backOffMultiplier(2) + useExponentialBackOff() produces which retry delays?',
      options: ['1s, 1s, 1s, 1s…', '1s, 2s, 4s, 8s…', '2s, 4s, 6s, 8s…', '1s, 3s, 5s, 7s…'],
      answer: 1,
      explain: 'Exponential backoff doubles the delay each attempt: 1s, 2s, 4s, 8s… (capped by maximumRedeliveryDelay).',
    },
  ],
  testing: [
    {
      q: 'What is AdviceWith used for?',
      options: [
        'Generating test data',
        'Rewriting a route in tests — e.g. replacing the Kafka consumer with direct: and mocking outputs',
        'Measuring route performance',
        'Validating YAML DSL syntax',
      ],
      answer: 1,
      explain: 'AdviceWith surgically modifies a route by id (replaceFromWith, mockEndpoints, weaveByToUri) so tests never touch real brokers.',
    },
    {
      q: 'Why override isUseAdviceWith() to return true?',
      options: [
        'To enable parallel test execution',
        'So the Camel context waits to start until after your AdviceWith modifications',
        'To disable all error handlers in tests',
        'To make mocks assert automatically',
      ],
      answer: 1,
      explain: 'Routes must be modified before they start; you then call startRouteDefinitions() once advice is applied.',
    },
    {
      q: 'How do you assert that NO message reaches a mock endpoint?',
      options: [
        'mock.expectedMessageCount(0) plus mock.setAssertPeriod(...) to wait and be sure',
        'mock.assertNothing()',
        'try/catch around assertIsSatisfied()',
        'It is not possible with MockEndpoint',
      ],
      answer: 0,
      explain: 'expectedMessageCount(0) alone passes immediately; setAssertPeriod makes the mock wait to be confident nothing arrives.',
    },
  ],
  deploy: [
    {
      q: 'How do you build a native image without installing GraalVM locally?',
      options: [
        'mvn package -Dnative -Dquarkus.native.container-build=true',
        'quarkus build --no-graal',
        'docker run graalvm/native-image .',
        'It is impossible — GraalVM must be installed',
      ],
      answer: 0,
      explain: 'container-build=true runs the native compiler inside a container; only Docker/Podman is needed on your machine.',
    },
    {
      q: 'Your app works in JVM mode but Jackson (un)marshalling fails in native mode only. Likely fix?',
      options: [
        'Increase heap memory',
        'Annotate the POJOs with @RegisterForReflection',
        'Switch from Jackson to Gson',
        'Disable the native optimizer',
      ],
      answer: 1,
      explain: 'Native images strip unreachable code and reflection metadata; @RegisterForReflection keeps your POJOs reflectable.',
    },
    {
      q: 'Which trade-off is TRUE for native images vs JVM mode?',
      options: [
        'Native starts faster and uses less memory, but peak throughput is slightly lower',
        'Native is better in every dimension',
        'Native uses more memory but starts faster',
        'JVM mode cannot be containerized',
      ],
      answer: 0,
      explain: 'Native: ~20–50ms startup, ~25–50MB RSS — but no JIT, so long-running throughput is slightly below JVM mode.',
    },
  ],
};

/** Flat pool of all questions, tagged with their module slug (used by the final exam). */
export const ALL_QUESTIONS = Object.entries(QUIZZES).flatMap(([slug, qs]) =>
  qs.map(q => ({ ...q, slug }))
);
