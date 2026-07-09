import CodeBlock from '../components/CodeBlock.jsx';
import Callout from '../components/Callout.jsx';
import Exercise from '../components/Exercise.jsx';

export default function Errors() {
  return (
    <div>
      <h2>What happens when a step throws?</h2>
      <p>
        By default Camel uses the <strong>DefaultErrorHandler</strong>: the exception propagates back
        to the consumer, the exchange fails, and — depending on the consumer — the message may be
        redelivered by the broker (JMS/Kafka) or moved aside (file). No retries happen inside the
        route unless you configure them. For real services you almost always want an explicit
        strategy.
      </p>

      <h2>Dead Letter Channel</h2>
      <p>
        The EIP for "stop failing forever": retry a few times, then park the message somewhere a
        human (or another process) can inspect it:
      </p>
      <CodeBlock
        lang="java"
        title="deadLetterChannel + redelivery policy"
        code={`@Override
public void configure() {

    errorHandler(deadLetterChannel("kafka:orders.DLQ")   // parking spot
        .maximumRedeliveries(5)          // try 5 more times...
        .redeliveryDelay(1000)           // ...starting 1s apart...
        .backOffMultiplier(2)            // ...doubling each time (1s,2s,4s,8s,16s)
        .useExponentialBackOff()
        .maximumRedeliveryDelay(30000)   // capped at 30s
        .useOriginalMessage()            // DLQ gets the ORIGINAL body, not a half-transformed one
        .onRedelivery(e -> e.getMessage()
            .setHeader("retryAttempt",
                e.getIn().getHeader(Exchange.REDELIVERY_COUNTER))));

    from("kafka:orders?groupId=order-service")
        .unmarshal().json(Order.class)
        .bean(OrderValidator.class)      // may throw
        .to("direct:store-order");       // may throw
}`}
      />
      <Callout type="tip">
        <code>useOriginalMessage()</code> matters: without it, the DLQ receives the body as it was at
        the failing step — possibly half-transformed and useless for replay.
      </Callout>

      <h2>onException — per-exception policies</h2>
      <p>
        <code>errorHandler()</code> is the blanket rule; <code>onException()</code> overrides it for
        specific exception types. <code>handled(true)</code> swallows the exception so the caller
        gets your fallback response instead of an error:
      </p>
      <CodeBlock
        lang="java"
        title="onException"
        code={`// validation errors: never retry, answer 400-style immediately
onException(OrderValidationException.class)
    .handled(true)
    .maximumRedeliveries(0)
    .log("rejected: \${exception.message}")
    .setHeader(Exchange.HTTP_RESPONSE_CODE, constant(400))
    .transform(simple("{\\"error\\":\\"\${exception.message}\\"}"));

// transient infra errors: retry hard before giving up
onException(java.sql.SQLTransientException.class)
    .maximumRedeliveries(10)
    .redeliveryDelay(2000)
    .useExponentialBackOff();`}
      />

      <h2>doTry / doCatch / doFinally</h2>
      <p>For fine-grained handling around a few steps, mirroring Java's try/catch:</p>
      <CodeBlock
        lang="java"
        title="Scoped error handling"
        code={`from("direct:enrich")
    .doTry()
        .to("http://pricing-service/quote")
    .doCatch(java.net.ConnectException.class)
        .log("pricing service down, using cached price")
        .bean(PriceCache.class, "lastKnown")
    .doFinally()
        .to("direct:audit")
    .end();`}
      />

      <h2>Choosing a strategy</h2>
      <table>
        <thead><tr><th>Situation</th><th>Reach for</th></tr></thead>
        <tbody>
          <tr><td>Whole-service default for async flows (Kafka/JMS/file)</td><td><code>errorHandler(deadLetterChannel(...))</code> with exponential backoff</td></tr>
          <tr><td>Business errors that should never be retried (validation)</td><td><code>onException(...).handled(true).maximumRedeliveries(0)</code></td></tr>
          <tr><td>Transient errors worth extra patience (DB failover, timeouts)</td><td><code>onException(...)</code> with a bigger retry budget</td></tr>
          <tr><td>Optional step with a local fallback</td><td><code>doTry()/doCatch()</code> around just that step</td></tr>
        </tbody>
      </table>
      <Callout type="warn">
        Redelivery here is <em>in-memory within one service instance</em>. If the process dies
        mid-retry, the message is only safe if the consumer is transactional (JMS) or
        offset-committed after processing (Kafka). For cross-restart guarantees, combine Camel
        retries with broker-level redelivery.
      </Callout>

      <Exercise
        title="Design the error policy for the order route"
        lang="java"
        hint="errorHandler(...) for the blanket rule; onException for the two special cases; handled(true) only where the message must NOT reach the DLQ."
        solution={`errorHandler(deadLetterChannel("kafka:orders.DLQ")
    .maximumRedeliveries(3)
    .redeliveryDelay(500)
    .backOffMultiplier(2)
    .useExponentialBackOff()
    .useOriginalMessage());

// bad data: no retries, log and drop (handled -> no DLQ, no rethrow)
onException(com.fasterxml.jackson.core.JsonProcessingException.class)
    .handled(true)
    .log("malformed order discarded: \${exception.message}");

// slow DB: bigger retry budget than the default
onException(java.sql.SQLTransientException.class)
    .maximumRedeliveries(8)
    .redeliveryDelay(1000)
    .useExponentialBackOff();

from("kafka:orders?groupId=order-service")
    .unmarshal().json(Order.class)
    .to("direct:store-order");`}
      >
        <p>
          Write the error-handling configuration for a Kafka order consumer with these rules:
          malformed JSON is logged and discarded (never retried, never DLQ'd); SQL transient errors
          retry up to 8 times with exponential backoff; everything else retries 3 times (500&nbsp;ms,
          doubling) and then lands on <code>kafka:orders.DLQ</code> with the original message.
        </p>
      </Exercise>
    </div>
  );
}
