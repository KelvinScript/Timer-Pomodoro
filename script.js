/* ── Alarme sonoro (Web Audio API) ── */
function playAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const beeps = [0, 0.35, 0.7];
  beeps.forEach((delay) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0.6, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.28);
  });
}
/* ── Constantes ── */
const CIRCUMFERENCE = 2 * Math.PI * 108; // ~678.6

/* ── Estado ── */
let focusMins = 25;
let breakMins = 5;
let mode      = 'focus'; // 'focus' | 'break'
let running   = false;
let remaining = focusMins * 60;
let total     = focusMins * 60;
let interval  = null;
let sessions  = 0;

/* ── Elementos do DOM ── */
const timeDisplay  = document.getElementById('time-display');
const phaseLabel   = document.getElementById('phase-label');
const ring         = document.getElementById('progress-ring');
const playIcon     = document.getElementById('play-icon');
const focusValEl   = document.getElementById('focus-val');
const breakValEl   = document.getElementById('break-val');
const sessionCount = document.getElementById('sessions');
const btnFocus     = document.getElementById('btn-focus');
const btnBreak     = document.getElementById('btn-break');

/* ── Helpers ── */
function fmt(s) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function updateRing() {
  const pct = remaining / total;
  ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
  ring.style.stroke = mode === 'focus' ? '#00e676' : '#69f0ae';
}

function render() {
  timeDisplay.textContent = fmt(remaining);
  updateRing();
}

/* ── Troca de modo ── */
function setMode(m) {
  mode    = m;
  running = false;
  clearInterval(interval);
  playIcon.className = 'ti ti-player-play';

  if (m === 'focus') {
    remaining = total = focusMins * 60;
    phaseLabel.textContent = 'foco';
    btnFocus.classList.add('active');
    btnBreak.classList.remove('active');
  } else {
    remaining = total = breakMins * 60;
    phaseLabel.textContent = 'descanso';
    btnBreak.classList.add('active');
    btnFocus.classList.remove('active');
  }

  render();
}

/* ── Tick do timer ── */
function tick() {
  if (remaining > 0) {
    remaining--;
    render();
  } else {
    clearInterval(interval);
    running = false;
    playIcon.className = 'ti ti-player-play';
    playAlarm();

    if (mode === 'focus') {
      sessions++;
      sessionCount.textContent = sessions;
      setMode('break');
      setTimeout(() => {
        interval = setInterval(tick, 1000);
        running  = true;
        playIcon.className = 'ti ti-player-pause';
      }, 1000);
    } else {
      setMode('focus');
    }
  }
}

/* ── Controles principais ── */
document.getElementById('play-btn').onclick = () => {
  if (running) {
    clearInterval(interval);
    running = false;
    playIcon.className = 'ti ti-player-play';
  } else {
    interval = setInterval(tick, 1000);
    running  = true;
    playIcon.className = 'ti ti-player-pause';
  }
};

document.getElementById('restart-btn').onclick = () => {
  clearInterval(interval);
  running = false;
  playIcon.className = 'ti ti-player-play';
  remaining = total;
  render();
};

document.getElementById('skip-btn').onclick = () => {
  clearInterval(interval);
  running = false;
  playIcon.className = 'ti ti-player-play';
  if (mode === 'focus') {
    sessions++;
    sessionCount.textContent = sessions;
    setMode('break');
  } else {
    setMode('focus');
  }
};

btnFocus.onclick = () => setMode('focus');
btnBreak.onclick = () => setMode('break');

/* ── Ajuste de minutos ── */
document.getElementById('focus-up').onclick = () => {
  focusMins = Math.min(60, focusMins + 1);
  focusValEl.textContent = focusMins;
  if (mode === 'focus' && !running) setMode('focus');
};

document.getElementById('focus-down').onclick = () => {
  focusMins = Math.max(1, focusMins - 1);
  focusValEl.textContent = focusMins;
  if (mode === 'focus' && !running) setMode('focus');
};

document.getElementById('break-up').onclick = () => {
  breakMins = Math.min(30, breakMins + 1);
  breakValEl.textContent = breakMins;
  if (mode === 'break' && !running) setMode('break');
};

document.getElementById('break-down').onclick = () => {
  breakMins = Math.max(1, breakMins - 1);
  breakValEl.textContent = breakMins;
  if (mode === 'break' && !running) setMode('break');
};

/* ── Inicialização ── */
ring.style.strokeDasharray  = CIRCUMFERENCE;
ring.style.strokeDashoffset = 0;
render();
