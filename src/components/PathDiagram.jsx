import { useNavigate } from 'react-router-dom';
import { MODULES } from '../modules/index.js';

// snake layout: 4 top (left->right), 4 middle (right->left), 1 bottom
const POS = [
  { x: 115, y: 85 }, { x: 305, y: 85 }, { x: 495, y: 85 }, { x: 685, y: 85 },
  { x: 685, y: 235 }, { x: 495, y: 235 }, { x: 305, y: 235 }, { x: 115, y: 235 },
  { x: 115, y: 385 },
];

export default function PathDiagram({ completed }) {
  const navigate = useNavigate();
  const nextIdx = MODULES.findIndex(m => !completed.includes(m.slug));

  const segments = [];
  for (let i = 0; i < MODULES.length - 1; i++) {
    const a = POS[i], b = POS[i + 1];
    const done = completed.includes(MODULES[i].slug) && completed.includes(MODULES[i + 1].slug);
    segments.push({
      d: a.y === b.y
        ? `M ${a.x + 30} ${a.y} L ${b.x - 30} ${b.y}`
        : `M ${a.x} ${a.y + 30} L ${b.x} ${b.y - 30}`,
      done,
    });
  }

  return (
    <svg viewBox="0 0 800 470" style={{ width: '100%', height: 'auto' }} role="img" aria-label="Learning path diagram">
      {segments.map((s, i) => (
        <path key={i} d={s.d} fill="none"
          stroke={s.done ? 'var(--green)' : 'var(--border)'}
          strokeWidth="3" strokeDasharray={s.done ? 'none' : '6 6'} />
      ))}
      {MODULES.map((m, i) => {
        const done = completed.includes(m.slug);
        const isNext = i === nextIdx;
        return (
          <g key={m.slug} className="path-node" onClick={() => navigate('/module/' + m.slug)}
             style={{ cursor: 'pointer' }}>
            <circle className="ring" cx={POS[i].x} cy={POS[i].y} r="27"
              fill={done ? 'var(--green)' : 'var(--panel-2)'}
              stroke={done ? 'var(--green)' : isNext ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={isNext ? 3 : 2} />
            <text x={POS[i].x} y={POS[i].y + 6} textAnchor="middle"
              fontSize="17" fontWeight="800"
              fill={done ? '#052e1f' : isNext ? 'var(--accent-soft)' : 'var(--text)'}>
              {done ? '✓' : m.num}
            </text>
            <text x={POS[i].x} y={POS[i].y + 52} textAnchor="middle" fontSize="13.5"
              fill={done ? 'var(--green)' : 'var(--text)'} fontWeight="600">
              {m.short}
            </text>
            {isNext && (
              <text x={POS[i].x} y={POS[i].y - 40} textAnchor="middle" fontSize="11"
                fill="var(--accent)" fontWeight="700" letterSpacing="1">NEXT</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
