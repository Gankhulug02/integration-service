import { Link } from 'react-router-dom';
import { MODULES } from '../modules/index.js';
import PathDiagram from '../components/PathDiagram.jsx';

export default function Landing({ completed }) {
  const nextModule = MODULES.find(m => !completed.includes(m.slug)) || MODULES[0];
  const allDone = completed.length === MODULES.length;

  return (
    <div className="content">
      <div className="hero">
        <h1>Integration Services with Quarkus &amp; Apache Camel</h1>
        <p>
          A hands-on course for developers new to integration and Enterprise Integration
          Patterns — including React/JS/TS developers, who get a dedicated primer. Nine modules
          take you from "what is a route?" to shipping a native-compiled integration service in
          a container.
        </p>
        <div className="badge-row">
          <span className="badge">☕ Java 17+</span>
          <span className="badge">🐫 Apache Camel</span>
          <span className="badge">⚡ Quarkus</span>
          <span className="badge">📬 EIPs</span>
          <span className="badge">🐳 Native containers</span>
        </div>
        <Link className="start-btn" to={'/module/' + nextModule.slug}>
          {allDone ? 'Review the course' : completed.length === 0 ? 'Start learning →' : 'Continue with Module ' + nextModule.num + ' →'}
        </Link>
      </div>

      <div className="path-card">
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.4rem' }}>
          Learning path — {completed.length}/{MODULES.length} complete
        </div>
        <PathDiagram completed={completed} />
      </div>

      <div className="feature-grid">
        <div className="feature">
          <h3>🧭 Pattern-first</h3>
          <p>EIPs are the vocabulary of integration. You'll learn the patterns, then the API — not the other way round.</p>
        </div>
        <div className="feature">
          <h3>⌨️ Runnable everything</h3>
          <p>Every code block is copy-paste-ready for a <code>quarkus dev</code> session. Copy, save, watch it hot-reload.</p>
        </div>
        <div className="feature">
          <h3>🏋️ Exercise per module</h3>
          <p>Each module ends with a task and a collapsible solution. Attempt first, peek second.</p>
        </div>
        <div className="feature">
          <h3>🚢 Ends in production</h3>
          <p>The course finishes with native compilation, containerization and a production checklist.</p>
        </div>
      </div>

      <h2 style={{ borderBottom: 'none' }}>Modules</h2>
      {MODULES.map(m => (
        <Link key={m.slug} to={'/module/' + m.slug} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
          <div className="feature" style={{ marginBottom: '0.7rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <span className={'nav-num' + (completed.includes(m.slug) ? ' done' : '')} style={{ marginTop: '0.15rem' }}>
              {completed.includes(m.slug) ? '✓' : m.num}
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>{m.title}</strong>
              <span style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-dim)' }}>{m.blurb}</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
