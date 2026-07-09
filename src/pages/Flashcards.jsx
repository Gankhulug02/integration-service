import { useState } from 'react';
import { FLASHCARDS } from '../data/flashcards.js';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

/**
 * Flashcard trainer: flip to reveal, "Got it" removes a card from the round,
 * "Again" keeps it in rotation — repeat until the deck is empty.
 */
export default function Flashcards() {
  const [deck, setDeck] = useState(() => shuffle(FLASHCARDS.map((_, i) => i)));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const restart = () => {
    setDeck(shuffle(FLASHCARDS.map((_, i) => i)));
    setPos(0);
    setFlipped(false);
    setDoneCount(0);
  };

  if (deck.length === 0) {
    return (
      <div className="content">
        <div className="module-meta">Study tools</div>
        <h1>Flashcards</h1>
        <div className="flash-done">
          🎉 Deck cleared — all {FLASHCARDS.length} cards marked as known.
          <button className="complete-btn" onClick={restart} style={{ marginLeft: '1rem' }}>Start over</button>
        </div>
      </div>
    );
  }

  const card = FLASHCARDS[deck[pos % deck.length]];

  const next = keep => {
    setFlipped(false);
    if (keep) {
      // keep the card in rotation, move on
      setPos(p => (p + 1) % deck.length);
    } else {
      // remove the current card from the round
      const idx = pos % deck.length;
      const newDeck = deck.filter((_, i) => i !== idx);
      setDeck(newDeck);
      setDoneCount(c => c + 1);
      setPos(p => (newDeck.length === 0 ? 0 : p % newDeck.length));
    }
  };

  return (
    <div className="content">
      <div className="module-meta">Study tools</div>
      <h1>Flashcards</h1>
      <p className="module-lead">
        Flip the card, then be honest: <em>Got it</em> removes it from this round,{' '}
        <em>Again</em> keeps it in rotation. Clear the deck to finish.
      </p>

      <div className="flash-progress">
        {doneCount}/{FLASHCARDS.length} known · {deck.length} remaining
      </div>

      <div className={'flashcard' + (flipped ? ' flipped' : '')} onClick={() => setFlipped(f => !f)}
        role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); } }}>
        <div className="flash-label">{flipped ? 'definition — click to see term' : 'term — click to reveal'}</div>
        <div className="flash-text">{flipped ? card.back : card.front}</div>
      </div>

      <div className="flash-controls">
        <button className="flash-btn again" onClick={() => next(true)}>↻ Again</button>
        <button className="flash-btn got" onClick={() => next(false)}>✓ Got it</button>
        <button className="flash-btn" onClick={restart}>Shuffle &amp; restart</button>
      </div>
    </div>
  );
}
