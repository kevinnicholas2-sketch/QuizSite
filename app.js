/* ------------------------------------------------------------------
   EDIT YOUR QUIZ HERE
   Each question: q (text), options (array), answer (index of the right
   option in `options`), fact (shown after answering, optional).
   Options are shuffled every time, so order here doesn't matter.
   ------------------------------------------------------------------ */
const QUIZ_TITLE = "How Well Do You Know Kevin?";
const QUESTIONS = [
  {
    q: "What rank did Kevin hold when he retired from the U.S. Army?",
    options: ["Major", "Lieutenant Colonel", "Colonel", "Captain"],
    answer: 1,
    fact: "Retired U.S. Army Lieutenant Colonel."
  },
  {
    q: "Roughly how long did Kevin's Army career last?",
    options: ["About 5 years", "About 12 years", "Nearly three decades", "Over 40 years"],
    answer: 2,
    fact: "Nearly three decades of service."
  },
  {
    q: "Which of these places did Kevin serve in?",
    options: ["Antarctica", "Kosovo", "Brazil", "Australia"],
    answer: 1,
    fact: "His service included Iraq, Kosovo, and Europe."
  },
  {
    q: "When did Kevin retire from the Army?",
    options: ["June 2024", "March 2025", "October 2026", "January 2027"],
    answer: 2,
    fact: "Retirement: October 2026."
  },
  {
    q: "Which country is Kevin relocating to?",
    options: ["Spain", "Italy", "Portugal", "Greece"],
    answer: 2,
    fact: "Next stop: Portugal."
  },
  {
    q: "Where is Kevin training in AI and software engineering?",
    options: ["Noble Desktop in New York City", "A bootcamp in Austin", "West Point", "A community college in Kosovo"],
    answer: 0,
    fact: "Noble Desktop, New York City."
  },
  {
    q: "Which of these is one of Kevin's listed interests?",
    options: ["Competitive cooking", "Personal finance", "Deep-sea fishing", "Pottery"],
    answer: 1,
    fact: "Technology, travel, personal finance, and lifelong learning."
  },
  {
    q: "Kevin is learning Portuguese. What does the word “saudade” mean?",
    options: ["See you soon", "Thank you", "A deep, nostalgic longing", "Good morning"],
    answer: 2,
    fact: "One of the words on his learning list."
  }
];

const RESULT_TIERS = [
  { min: 1.0, title: "Best friend status", text: "Perfect score. You know Kevin's story inside and out." },
  { min: 0.75, title: "Close circle", text: "Impressive. You clearly pay attention to the details." },
  { min: 0.5, title: "Good acquaintance", text: "Not bad. A few more chats and you'll ace it." },
  { min: 0, title: "Time for coffee", text: "Looks like you two need to catch up." }
];

/* ------------------------------ app ------------------------------ */
const app = document.getElementById("app");
const bestEl = document.getElementById("best");
const STORE_KEY = "kevin-quiz-best";
const LETTERS = "ABCD";

let order, index, score, answers, locked;

const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } },
  set(v) { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } }
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const kid of kids) n.append(kid);
  return n;
}

function renderBest() {
  const b = store.get();
  bestEl.textContent = b ? `Best: ${b.score}/${b.total}` : "";
}

function showIntro() {
  app.replaceChildren(
    el("section", { class: "card" },
      el("p", { class: "kicker" }, "Bem-vindo"),
      el("h1", {}, QUIZ_TITLE),
      el("p", { class: "lead" }, `${QUESTIONS.length} questions about Kevin's life: the Army years, the learning, and the big move. Pick an answer to see if you got it right.`),
      el("button", { class: "btn", id: "start", onclick: start }, "Start the quiz")
    )
  );
  document.getElementById("start").focus();
}

function start() {
  order = shuffle(QUESTIONS.map((_, i) => i));
  index = 0; score = 0; answers = []; locked = false;
  showQuestion();
}

function showQuestion() {
  const q = QUESTIONS[order[index]];
  const opts = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
  locked = false;

  const list = el("ul", { class: "opts" });
  opts.forEach((o, i) => {
    const btn = el("button", { class: "opt", type: "button", "data-i": i, onclick: () => choose(btn, o, opts, q) },
      el("span", { class: "key", "aria-hidden": "true" }, LETTERS[i]), o.text);
    list.append(el("li", {}, btn));
  });

  const feedback = el("div", { class: "feedback", id: "feedback" });
  const next = el("button", { class: "btn", id: "next", disabled: "", onclick: advance },
    index === QUESTIONS.length - 1 ? "See my score" : "Next question");

  app.replaceChildren(
    el("section", { class: "card" },
      el("div", { class: "meta" }, el("span", {}, `Question ${index + 1} of ${QUESTIONS.length}`), el("span", {}, `Score: ${score}`)),
      el("div", { class: "progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": QUESTIONS.length, "aria-valuenow": index },
        el("span", { style: `width:${(index / QUESTIONS.length) * 100}%` })),
      el("h2", {}, q.q),
      list, feedback, next
    )
  );
  app.querySelector(".opt").focus();
}

function choose(btn, picked, opts, q) {
  if (locked) return;
  locked = true;
  if (picked.correct) score++;
  answers.push({ q: q.q, picked: picked.text, right: opts.find(o => o.correct).text, ok: picked.correct });

  app.querySelectorAll(".opt").forEach((b, i) => {
    b.disabled = true;
    if (opts[i].correct) b.classList.add("correct");
  });
  if (!picked.correct) btn.classList.add("wrong");

  const fb = document.getElementById("feedback");
  fb.className = "feedback " + (picked.correct ? "ok" : "bad");
  fb.replaceChildren(
    el("strong", {}, picked.correct ? "Correct!" : "Not quite."),
    el("span", {}, q.fact || "")
  );
  const next = document.getElementById("next");
  next.disabled = false;
  next.focus();
}

function advance() {
  if (index < QUESTIONS.length - 1) { index++; showQuestion(); } else { showResults(); }
}

function showResults() {
  const total = QUESTIONS.length;
  const ratio = score / total;
  const tier = RESULT_TIERS.find(t => ratio >= t.min);
  const prev = store.get();
  const isBest = !prev || ratio > prev.score / prev.total;
  if (isBest) store.set({ score, total });
  renderBest();

  const review = el("ul", { class: "review" });
  answers.forEach(a => {
    review.append(el("li", { class: a.ok ? "good" : "miss" },
      el("span", { class: "mark", "aria-label": a.ok ? "Correct" : "Missed" }, a.ok ? "✓" : "✗"),
      el("div", {}, a.q, el("small", {}, a.ok ? a.right : `You said: ${a.picked}. Answer: ${a.right}`))
    ));
  });

  app.replaceChildren(
    el("section", { class: "card" },
      el("p", { class: "kicker" }, isBest ? "New best score" : "Your result"),
      el("h2", {}, tier.title),
      el("div", { class: "score" }, `${score}`, el("small", {}, ` / ${total}`)),
      el("p", { class: "lead" }, tier.text),
      review,
      el("div", { class: "actions" },
        el("button", { class: "btn", id: "again", onclick: start }, "Play again"),
        el("button", { class: "btn ghost", onclick: showIntro }, "Back to start")
      )
    )
  );
  document.getElementById("again").focus();
}

// keyboard: 1-4 / A-D pick an answer, Enter advances (buttons handle Enter natively)
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const opts = app.querySelectorAll(".opt");
  if (!opts.length || locked) return;
  const k = e.key.toUpperCase();
  const i = "1234".includes(k) ? Number(k) - 1 : LETTERS.indexOf(k);
  if (i >= 0 && i < opts.length) opts[i].click();
});

renderBest();
showIntro();
