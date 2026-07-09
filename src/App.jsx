import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MODULES } from './modules/index.js';
import Sidebar from './components/Sidebar.jsx';
import Landing from './pages/Landing.jsx';
import ModulePage from './pages/ModulePage.jsx';
import Exam from './pages/Exam.jsx';
import Flashcards from './pages/Flashcards.jsx';

const STORAGE_KEY = 'camel-quarkus-course-progress';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  // progress lives in component state; mirrored to localStorage (when available)
  // so it survives closing the tab. State remains the source of truth.
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)); } catch { /* private mode etc. */ }
  }, [completed]);

  const toggleComplete = useCallback(slug => {
    setCompleted(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <HashRouter>
      <ScrollToTop />
      <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle navigation">☰</button>
      <div className={'scrim' + (sidebarOpen ? ' show' : '')} onClick={closeSidebar} />
      <div className="layout">
        <Sidebar completed={completed} open={sidebarOpen} onNavigate={closeSidebar} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Landing completed={completed} />} />
            {MODULES.map(m => (
              <Route key={m.slug} path={'/module/' + m.slug}
                element={<ModulePage module={m} completed={completed} toggleComplete={toggleComplete} />} />
            ))}
            <Route path="/exam" element={<Exam />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
