import { useState } from 'react';

/**
 * Multiple-choice quiz with instant feedback.
 * Each question locks after the first pick; explanation + running score shown.
 */
export default function Quiz({ questions, title = 'Check your knowledge' }) {
  const [answers, setAnswers] = useState({}); // question index -> picked option index

  const answered = Object.keys(answers).length;
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);

  const pick = (qi, oi) => {
    if (answers[qi] === undefined) setAnswers(prev => ({ ...prev, [qi]: oi }));
  };

  return (
    <div className="quiz">
      <div className="quiz-header">📝 {title}</div>
      <div className="quiz-body">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const isAnswered = picked !== undefined;
          return (
            <div className="quiz-q" key={qi}>
              <div className="quiz-question">{qi + 1}. {q.q}</div>
              <div className="quiz-options">
                {q.options.map((opt, oi) => {
                  let cls = 'quiz-opt';
                  if (isAnswered) {
                    if (oi === q.answer) cls += ' correct';
                    else if (oi === picked) cls += ' wrong';
                    else cls += ' dim';
                  }
                  return (
                    <button key={oi} className={cls} onClick={() => pick(qi, oi)} disabled={isAnswered}>
                      <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className={'quiz-explain' + (picked === q.answer ? ' right' : '')}>
                  {picked === q.answer ? '✓ Correct. ' : '✗ Not quite. '}{q.explain}
                </div>
              )}
            </div>
          );
        })}
        {answered === questions.length && (
          <div className="quiz-score">
            Score: <strong>{score}/{questions.length}</strong>
            {score === questions.length ? ' — perfect! 🎉' : score >= questions.length * 0.7 ? ' — solid.' : ' — worth re-reading the module above.'}
            <button className="quiz-reset" onClick={() => setAnswers({})}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
