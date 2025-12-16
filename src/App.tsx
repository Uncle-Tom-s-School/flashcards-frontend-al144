import React, { useEffect, useState } from 'react';
import './App.css';

interface Card {
  question: string;
  answer: string;
  points: number;
}

const DEFAULT_CARDS: Card[] = [
  { question: "Mi a JavaScript?", answer: "Magas szintű, dinamikus, böngészőben és szerveroldalon futó programozási nyelv.", points: 3 },
  { question: "Mi a különbség a var, let és const között?", answer: "A var függvény-scope, a let és const blokk-scope; a const értéke nem írható felül.", points: 1 },
  { question: "Mi az a scope?", answer: "Az a terület, ahol egy változó elérhető — globális, függvény- vagy blokk-scope.", points: 2 },
  { question: "Mi az immutabilitás?", answer: "Az állapot nem módosítása meglévő objektumon belül.", points: -1 },
  { question: "Mi az eseményhurok (event loop)?", answer: "A JS egyetlen szálú módon kezeli a feladatokat és callbackeket.", points: 5 },
  { question: "Mi az a Promise?", answer: "Egy aszinkron művelet állapotát reprezentáló objektum.", points: 3 },
  { question: "Mi a destrukturálás (destructuring)?", answer: "Objektum vagy tömb elemeinek egyszerű változókba szedése.", points: 5 },
  { question: "Mire jók a template literálok?", answer: "Többsoros string és beágyazott kifejezések használata `${}` szintaxissal.", points: 1 },
  { question: "Mi a különbség a == és === között?", answer: "A == konvertál, a === típus és érték alapján hasonlít.", points: 3 },
  { question: "Mi a REST?", answer: "Webszolgáltatás-architektúra, JS fetch/API hívásokkal éri el.", points: -2 },
  { question: "Miért hasznos az immutábilis állapotfrissítés?", answer: "Kisebb mellékhatás, jobb teljesítmény és egyszerűbb követhetőség.", points: 0 },
  { question: "Mi az a NaN és hogyan ellenőrizhető?", answer: "Not-a-Number érték, Number.isNaN() segítségével ellenőrizhető.", points: 4 }
];

const STORAGE_KEY = 'flashcards_v1';

export default function FlashcardsApp() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const id = 'fa-cdn-flashcards';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setCards(parsed);
          return;
        }
      } catch (e) { /* ignore */ }
    }
    fetch('/cards.json')
      .then(r => { if (!r.ok) throw new Error('no'); return r.json(); })
      .then(data => { if (Array.isArray(data) && data.length) setCards(data); else setCards(DEFAULT_CARDS); })
      .catch(() => setCards(DEFAULT_CARDS));
  }, []);

  useEffect(() => {
    if (!cards) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  if (!cards) return <div className="loading">Betöltés...</div>;

  const card = cards[index];

  const flip = () => setFlipped(f => !f);
  const next = () => { setIndex(i => (i+1) % cards.length); setFlipped(false); };
  const prev = () => { setIndex(i => (i-1+cards.length)%cards.length); setFlipped(false); };
  const mark = (delta: number) => {
    setCards(prev => {
      if (!prev) return prev;
      const copy = [...prev];
      copy[index].points = copy[index].points + delta;
      return copy;
    });
    setFlipped(false);
  };

  return (
    <div className="app-container">
      <div className="card-area">
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={flip}>
          <div className="flashcard-inner">
            <div className="flashcard-face flashcard-front">
              <div className="flashcard-header">
                {index + 1}
              </div>
              <div className="flashcard-question">
                {card.question}
              </div>
            </div>
            <div className="flashcard-face flashcard-back">
              <div className="flashcard-header">
                {card.points}
              </div>
              <div className="flashcard-answer">
                {card.answer}
              </div>
              <div className="flashcard-actions">
                <button className="action-button accept" onClick={(e) => { e.stopPropagation(); mark(1); }}>
                  <i className="fa-regular fa-circle-check"></i>
                </button>
                <button className="action-button reject" onClick={(e) => { e.stopPropagation(); mark(-1); }}>
                  <i className="fa-regular fa-circle-xmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((index + 1) / cards.length) * 100}%` }}></div>
          </div>
          <div className="progress-text">
            {index + 1} / {cards.length}
          </div>
        </div>
      </div>
      <div className="bottom-buttons">
        <button className="bottom-button" onClick={() => { setIndex(0); setFlipped(false); }}>Új gyakorlás indítása</button>
        <button className="bottom-button primary" disabled>Új kártyák hozzáadása</button>
      </div>
    </div>
  );
}
