import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_QUESTIONS } from '../data/quizzes.js';
import { MODULES } from '../modules/index.js';

const EXAM_SIZE = 12;
const PASS_RATIO = 0.7;

function sample() {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, EXAM_SIZE);
}

const moduleTitle = slug => {
  const m = MODULES.find(m => m.slug === slug);
  return m ? `${m.num}. ${m.short}` : slug;
};

export default function Exam() {
  const [questions, setQuestions] = useState(sample);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  const passed = score >= Math.ceil(questions.length * PASS_RATIO);

  const retake = () => {
    setQuestions(sample());
    setAnswers({});
    setSubmitted(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="content">
      <div className="module-meta">Study tools</div>
      <h1>Final Exam</h1>
      <p className="module-lead">
        {EXAM_SIZE} questions drawn randomly from all {ALL_QUESTIONS.length} in the course.
        Pick an answer for each, then submit. {Math.round(PASS_RATIO * 100)}% to pass — retake
        for a fresh set anytime.
      </p>

      {submitted && (
        <div className={'exam-banner ' + (passed ? 'pass' : 'fail')}>
          {passed ? '🎓 Passed!' : '📚 Not yet.'} You scored <strong>{score}/{questions.length}</strong>
          {passed
            ? ' — you have a solid grasp of Camel on Quarkus.'
            : ' — check the explanations below, revisit the flagged modules, and retake.'}
          <button className="quiz-reset" onClick={retake}>Retake with new questions</button>
        </div>
      )}

      {questions.map((q, qi) => {
        const picked = answers[qi];
        return (
          <div className="quiz-q exam-q" key={qi}>
            <div className="quiz-question">
              {qi + 1}. {q.q}
              <span className="exam-tag">{moduleTitle(q.slug)}</span>
            </div>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let cls = 'quiz-opt';
                if (!submitted && picked === oi) cls += ' selected';
                if (submitted) {
                  if (oi === q.answer) cls += ' correct';
                  else if (oi === picked) cls += ' wrong';
                  else cls += ' dim';
                }
                return (
                  <button key={oi} className={cls} disabled={submitted}
                    onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}>
                    <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && picked !== q.answer && (
              <div className="quiz-explain">
                ✗ {q.explain}{' '}
                <Link to={'/module/' + q.slug}>Review {moduleTitle(q.slug)} →</Link>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <div className="exam-submit-row">
          <button className="complete-btn" disabled={answered < questions.length}
            onClick={() => { setSubmitted(true); window.scrollTo(0, 0); }}>
            Submit exam
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            {answered}/{questions.length} answered
          </span>
        </div>
      )}
    </div>
  );
}
