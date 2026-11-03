const MODES = [
  { name: "โฟกัส",   minutes: 25 },
  { name: "พักสั้น", minutes: 5 },
  { name: "พักยาว",  minutes: 15 },
];

const $ = (id) => document.getElementById(id);
const el = {
  time: $("time"), track: $("trackName"), no: $("trackNo"),
  status: $("status"), bar: $("bar"), play: $("playBtn"),
};

let index = 0;
let remaining = MODES[0].minutes * 60; // วินาที
let endAt = null;                      // เวลาเป้าหมาย (กัน timer เพี้ยนตอนปิดจอ)
let tick = null;

function render() {
  const total = MODES[index].minutes * 60;
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  el.time.textContent = `${m}:${s}`;
  el.track.textContent = MODES[index].name;
  el.no.textContent = `0${index + 1}/0${MODES.length}`;
  el.bar.style.width = `${((total - remaining) / total) * 100}%`;
  el.status.textContent = endAt ? "กำลังเล่น" : "หยุดอยู่";
  el.play.textContent = endAt ? "⏸" : "▶";
  el.play.setAttribute("aria-label", endAt ? "หยุดชั่วคราว" : "เริ่ม");
  document.title = endAt ? `${m}:${s} · ${MODES[index].name}` : "Pomodoro Timer";
}

function stop() {
  clearInterval(tick);
  tick = null;
  endAt = null;
}

function start() {
  endAt = Date.now() + remaining * 1000;
  tick = setInterval(() => {
    remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (remaining === 0) { beep(); stop(); go(index + 1); return; }
    render();
  }, 250);
  render();
}

function go(i) {
  stop();
  index = (i + MODES.length) % MODES.length;
  remaining = MODES[index].minutes * 60;
  render();
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.15;
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.15);
    });
  } catch (e) { /* เบราว์เซอร์ไม่รองรับเสียง ข้ามไป */ }
}

el.play.addEventListener("click", () => (endAt ? (stop(), render()) : start()));
$("prevBtn").addEventListener("click", () => go(index - 1));
$("nextBtn").addEventListener("click", () => go(index + 1));
$("resetBtn").addEventListener("click", () => go(index));

render();
