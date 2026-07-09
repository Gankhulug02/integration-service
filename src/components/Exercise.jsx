import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';

export default function Exercise({ title, children, solution, lang = 'java', hint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="exercise">
      <div className="exercise-header">{'🏋️'} Exercise — {title}</div>
      <div className="exercise-body">
        {children}
        {hint && <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}><strong>Hint:</strong> {hint}</p>}
        <button className={'solution-btn' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
          {open ? 'Hide solution' : 'Show solution'}
        </button>
        {open && <CodeBlock lang={lang} title="Solution" code={solution} />}
      </div>
    </div>
  );
}
