import { NavLink } from 'react-router-dom';
import { MODULES } from '../modules/index.js';

export default function Sidebar({ completed, open, onNavigate }) {
  return (
    <nav className={'sidebar' + (open ? ' open' : '')}>
      <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={onNavigate}>
        <div className="brand">
          <div className="brand-logo">🐫</div>
          <div>
            <div className="brand-title">Camel on Quarkus</div>
            <div className="brand-sub">Integration services course</div>
          </div>
        </div>
      </NavLink>

      <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={onNavigate}>
        <span className="nav-num">🏠</span> Course overview
      </NavLink>

      <div className="nav-section">Modules</div>
      {MODULES.map(m => (
        <NavLink key={m.slug} to={'/module/' + m.slug}
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={onNavigate}>
          <span className={'nav-num' + (completed.includes(m.slug) ? ' done' : '')}>
            {completed.includes(m.slug) ? '✓' : m.num}
          </span>
          {m.short}
        </NavLink>
      ))}

      <div className="nav-section">Study tools</div>
      <NavLink to="/flashcards" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={onNavigate}>
        <span className="nav-num">🃏</span> Flashcards
      </NavLink>
      <NavLink to="/exam" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={onNavigate}>
        <span className="nav-num">🎓</span> Final Exam
      </NavLink>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>Progress</span><span>{completed.length}/{MODULES.length}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: (completed.length / MODULES.length) * 100 + '%' }} />
        </div>
      </div>
    </nav>
  );
}
