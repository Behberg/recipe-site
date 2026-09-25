// Kitchen timers shared by every page.
//
// - Any element with data-timer="<seconds>" starts a timer when clicked.
// - Several timers can run at once; they are saved in localStorage, so they keep running
//   while you browse other recipes or reload the page.
// - When a full-screen <dialog> (cooking mode) is open, the timer stack moves inside it,
//   otherwise the modal's top layer would cover it.
// - When time is up: repeating chime, vibration and a blinking tab title until dismissed.

import { toast } from './favorites';

interface Timer {
  id: string;
  label: string;
  recipe?: string;
  url?: string;
  total: number; // seconds
  endAt: number; // ms timestamp while running
  left?: number; // ms remaining while paused
  done?: boolean;
}

const KEY = 'dzervene:taimeri';
let timers: Timer[] = [];
let root: HTMLElement;
let tick: number | undefined;
let audio: AudioContext | undefined;
let alarm: number | undefined;
const baseTitle = document.title;

const load = (): Timer[] => {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
};
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(timers));
  } catch {
    /* storage blocked: timers still work on this page */
  }
};

const remaining = (t: Timer) => (t.left != null ? t.left : t.endAt - Date.now());
const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/** Browsers only allow sound after a user gesture, so the audio context is unlocked on the click that starts a timer. */
function unlockAudio() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    audio ??= new Ctx();
    if (audio.state === 'suspended') audio.resume();
  } catch {
    /* no audio support */
  }
}

function chime() {
  if (!audio) return;
  try {
    if (audio.state === 'suspended') audio.resume();
    [0, 0.28, 0.56].forEach((t, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = 'sine';
      o.frequency.value = i === 2 ? 1175 : 880;
      const at = audio!.currentTime + t;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.35, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
      o.connect(g).connect(audio!.destination);
      o.start(at);
      o.stop(at + 0.28);
    });
  } catch {
    /* ignore */
  }
}

function startAlarm() {
  if (alarm) return;
  let n = 0;
  const ring = () => {
    chime();
    navigator.vibrate?.([250, 120, 250]);
    document.title = n++ % 2 ? baseTitle : '⏰ Gatavs!';
    // Stop ringing after about a minute even if nobody reacts.
    if (n > 30) stopAlarm();
  };
  ring();
  alarm = window.setInterval(ring, 2000);
}

function stopAlarm() {
  window.clearInterval(alarm);
  alarm = undefined;
  document.title = baseTitle;
}

const ICON_PLAY =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.5-6.8a.8.8 0 0 0 0-1.4L9.2 4.5a.8.8 0 0 0-1.2.7z" fill="currentColor"/></svg>';
const ICON_PAUSE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 5v14M16 5v14"/></svg>';
const ICON_X =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

const els = new Map<string, HTMLElement>();

/**
 * Updates timers in place. Elements are created once per timer and only their text and
 * progress change on each tick, so the entry animation plays once and nothing flickers.
 */
function render() {
  root.hidden = timers.length === 0;
  const alive = new Set(timers.map((t) => t.id));
  for (const [id, el] of els) {
    if (!alive.has(id)) {
      el.remove();
      els.delete(id);
    }
  }
  timers.forEach((t, i) => {
    let el = els.get(t.id);
    if (!el) {
      el = document.createElement('div');
      el.dataset.id = t.id;
      el.innerHTML = `<span class="ktimer-ring" aria-hidden="true"></span>
        <span class="ktimer-text"><span class="ktimer-label"></span><strong class="ktimer-time"></strong></span>
        <span class="ktimer-actions"></span>`;
      // Text via textContent so recipe titles can never inject markup.
      el.querySelector('.ktimer-label')!.textContent = t.recipe ? `${t.label} · ${t.recipe}` : t.label;
      els.set(t.id, el);
    }
    if (root.children[i] !== el) root.insertBefore(el, root.children[i] ?? null);

    const state = t.done ? 'done' : t.left != null ? 'paused' : 'running';
    if (el.dataset.state !== state) {
      el.dataset.state = state;
      el.className = 'ktimer' + (t.done ? ' is-done' : '') + (state === 'paused' ? ' is-paused' : '');
      el.querySelector('.ktimer-actions')!.innerHTML = t.done
        ? '<button type="button" class="ktimer-btn ktimer-ok" data-act="dismiss">Labi</button>'
        : `<button type="button" class="ktimer-btn" data-act="toggle" aria-label="${state === 'paused' ? 'Turpināt' : 'Pauze'}">${
            state === 'paused' ? ICON_PLAY : ICON_PAUSE
          }</button><button type="button" class="ktimer-btn" data-act="cancel" aria-label="Atcelt taimeri">${ICON_X}</button>`;
    }
    const left = remaining(t);
    const pct = t.done ? 100 : Math.min(100, Math.max(0, 100 - (left / (t.total * 1000)) * 100));
    el.style.setProperty('--p', `${pct.toFixed(1)}%`);
    const time = el.querySelector<HTMLElement>('.ktimer-time')!;
    const text = t.done ? 'Gatavs!' : fmt(left);
    if (time.textContent !== text) time.textContent = text;
  });
}

function update() {
  let changed = false;
  for (const t of timers) {
    if (!t.done && t.left == null && t.endAt <= Date.now()) {
      t.done = true;
      changed = true;
      toast(`⏰ ${t.label}: laiks beidzies!`);
    }
  }
  if (changed) save();
  if (timers.some((t) => t.done)) startAlarm();
  else stopAlarm();
  render();
  const running = timers.some((t) => !t.done && t.left == null);
  if (!running) {
    window.clearInterval(tick);
    tick = undefined;
  } else if (!tick) {
    tick = window.setInterval(update, 250);
  }
}

export function startTimer(seconds: number, label: string, recipe?: string) {
  unlockAudio();
  timers.push({
    id: Math.random().toString(36).slice(2),
    label,
    recipe,
    url: location.pathname,
    total: seconds,
    endAt: Date.now() + seconds * 1000,
  });
  // Keep the stack short on small screens.
  if (timers.length > 4) timers.shift();
  save();
  update();
  toast(`⏱️ Taimeris palaists: ${Math.round(seconds / 60)} min`);
}

/** Moves the timer stack into an open modal dialog (or back to <body> with null). */
function setHost(host: HTMLElement | null) {
  (host ?? document.body).appendChild(root);
  root.classList.toggle('in-dialog', !!host);
}

export function initTimers() {
  root = document.createElement('div');
  root.className = 'ktimers no-print';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.hidden = true;
  document.body.appendChild(root);

  timers = load();

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const starter = target.closest<HTMLElement>('[data-timer]');
    if (starter) {
      startTimer(Number(starter.dataset.timer), starter.dataset.timerLabel || 'Taimeris', starter.dataset.timerRecipe);
      return;
    }
    const btn = target.closest<HTMLButtonElement>('.ktimer [data-act]');
    if (!btn) return;
    const id = btn.closest<HTMLElement>('.ktimer')!.dataset.id;
    const t = timers.find((x) => x.id === id);
    if (!t) return;
    unlockAudio();
    if (btn.dataset.act === 'toggle') {
      if (t.left != null) {
        t.endAt = Date.now() + t.left;
        delete t.left;
      } else {
        t.left = Math.max(0, t.endAt - Date.now());
      }
    } else {
      timers = timers.filter((x) => x !== t);
    }
    save();
    update();
  });

  document.addEventListener('timers:host', (e) => setHost((e as CustomEvent<HTMLElement | null>).detail));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      timers = load();
      update();
    }
  });
  // Phones pause JS in the background: re-check the moment the page is visible again.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && update());

  update();
}
