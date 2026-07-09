import { Link } from 'react-router-dom';
import { MODULES } from '../modules/index.js';
import Quiz from '../components/Quiz.jsx';
import { QUIZZES } from '../data/quizzes.js';

export default function ModulePage({ module, completed, toggleComplete }) {
  const idx = MODULES.findIndex(m => m.slug === module.slug);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];
  const done = completed.includes(module.slug);
  const { Component } = module;

  return (
    <div className="content">
      <div className="module-meta">Module {module.num} of {MODULES.length}</div>
      <h1>{module.title}</h1>
      <p className="module-lead">{module.blurb}</p>
      <Component />
      {QUIZZES[module.slug] && <Quiz questions={QUIZZES[module.slug]} />}
      <div className="complete-row">
        <button className={'complete-btn' + (done ? '' : ' undone')} onClick={() => toggleComplete(module.slug)}>
          {done ? '✓ Completed' : 'Mark module as complete'}
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          {done ? 'Nice work — progress saved in the sidebar.' : 'Finished the exercise? Check this off to track your progress.'}
        </span>
      </div>
      <div className="pager">
        {prev ? (
          <Link to={'/module/' + prev.slug}>
            <span className="dir">← Previous</span><br />{prev.num}. {prev.title}
          </Link>
        ) : (
          <Link to="/"><span className="dir">← Back to</span><br />Course overview</Link>
        )}
        {next ? (
          <Link to={'/module/' + next.slug} className="next">
            <span className="dir">Next →</span><br />{next.num}. {next.title}
          </Link>
        ) : (
          <Link to="/" className="next"><span className="dir">Finish →</span><br />Course overview</Link>
        )}
      </div>
    </div>
  );
}
