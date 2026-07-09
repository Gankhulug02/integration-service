import JsPrimer from './JsPrimer.jsx';
import Intro from './Intro.jsx';
import Setup from './Setup.jsx';
import Basics from './Basics.jsx';
import Eips from './Eips.jsx';
import Integrations from './Integrations.jsx';
import Errors from './Errors.jsx';
import Testing from './Testing.jsx';
import Deploy from './Deploy.jsx';

/** Course registry — order defines module numbering, routes, and the path diagram. */
export const MODULES = [
  { slug: 'js-primer',    num: 1, title: 'Coming from JavaScript/TypeScript', short: 'JS/TS Primer',   blurb: 'Java, Maven, Quarkus and “integration service” explained through Node/TypeScript analogies — start here if you come from the frontend world.', Component: JsPrimer },
  { slug: 'intro',        num: 2, title: 'Introduction',           short: 'Intro',          blurb: 'What Apache Camel is, the EIP catalogue, and why Quarkus is a great runtime for it.', Component: Intro },
  { slug: 'setup',        num: 3, title: 'Project Setup',          short: 'Setup',          blurb: 'JDK, Maven and the Quarkus CLI; scaffolding a project with camel-quarkus extensions; your first route in dev mode.', Component: Setup },
  { slug: 'basics',       num: 4, title: 'Camel Basics',           short: 'Camel Basics',   blurb: 'Routes, endpoint URIs, the Exchange, processors and beans, the simple language — in Java and YAML DSL.', Component: Basics },
  { slug: 'eips',         num: 5, title: 'Core EIPs',              short: 'Core EIPs',      blurb: 'Content-based router, filter, splitter & aggregator, and message translator — with runnable examples.', Component: Eips },
  { slug: 'integrations', num: 6, title: 'Integrations',           short: 'Integrations',   blurb: 'REST/JSON, file, Kafka/JMS and databases via Camel SQL — same route logic, different endpoints.', Component: Integrations },
  { slug: 'errors',       num: 7, title: 'Error Handling',         short: 'Error Handling', blurb: 'Dead letter channel, redelivery policies with backoff, onException and doTry/doCatch.', Component: Errors },
  { slug: 'testing',      num: 8, title: 'Testing',                short: 'Testing',        blurb: 'CamelQuarkusTestSupport, MockEndpoint, AdviceWith and black-box @QuarkusTest with REST Assured.', Component: Testing },
  { slug: 'deploy',       num: 9, title: 'Packaging & Deployment', short: 'Deploy',         blurb: 'Fast-jar vs GraalVM native image, containerization, and a production checklist.', Component: Deploy },
];
