const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('#motion-toggle');
let motion = !reduced.matches;
let visible = !document.hidden;

function setMotion(enabled) {
  motion = enabled;
  document.body.classList.toggle('motion-paused', !enabled);
  toggle.setAttribute('aria-pressed', String(enabled));
  toggle.textContent = enabled ? 'Motion on' : 'Motion off';

}
toggle.addEventListener('click', () => setMotion(!motion));
reduced.addEventListener('change', event => setMotion(!event.matches));

// A separate, lightweight star field keeps the galaxy behind every control.
const galaxy = document.querySelector('#galaxy');
const context = galaxy.getContext('2d');
let width = 1, height = 1, galaxyFrame = 0, lastFrame = 0, elapsed = 0;
let seed = 7621;
function random() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
const stars = Array.from({ length: 220 }, () => ({ x: random(), y: random(), r: .3 + random() * 1.2, phase: random() * 6.28, speed: .2 + random() }));
function drawGalaxy(now = 0) {
  galaxyFrame = 0;
  if (motion && visible) galaxyFrame = requestAnimationFrame(drawGalaxy);
  if (!context || (motion && now - lastFrame < 33)) return;
  const delta = Math.min((now - lastFrame) / 1000, .05);
  lastFrame = now;
  if (motion && visible) elapsed += delta;
  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    const x = (star.x * width + elapsed * star.speed * 3) % width;
    const y = (star.y * height - elapsed * star.speed * 1.2 + height * 10) % height;
    context.globalAlpha = .3 + .5 * (.5 + .5 * Math.sin(elapsed * .65 + star.phase));
    context.fillStyle = star.phase < 2 ? '#b5ffb6' : '#cfbdff';
    context.beginPath(); context.arc(x, y, star.r, 0, Math.PI * 2); context.fill();
  }
  // A tilted spiral of fine starlight forms the distant galaxy.
  context.save(); context.translate(width * .74, height * .42); context.rotate(-.45);
  for (let i = 0; i < 380; i++) {
    const arm = i % 3, distance = 15 + (i / 380) * Math.min(width * .5, 640);
    const angle = distance * .013 + arm * Math.PI * 2 / 3 + elapsed * .015;
    context.globalAlpha = .08 + (1 - i / 380) * .24;
    context.fillStyle = arm === 0 ? '#9fffbd' : '#b791ff';
    context.beginPath(); context.arc(Math.cos(angle) * distance, Math.sin(angle) * distance * .4, .7 + i % 3 * .3, 0, Math.PI * 2); context.fill();
  }
  context.restore(); context.globalAlpha = 1;
}
function resizeGalaxy() {
  cancelAnimationFrame(galaxyFrame);
  width = innerWidth; height = innerHeight;
  const ratio = Math.min(devicePixelRatio, 1.5);
  galaxy.width = width * ratio; galaxy.height = height * ratio;
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  lastFrame = 0; drawGalaxy();
}
function resumeGalaxy() { cancelAnimationFrame(galaxyFrame); lastFrame = 0; drawGalaxy(); }
window.addEventListener('resize', resizeGalaxy);
document.addEventListener('visibilitychange', () => { visible = !document.hidden; resumeGalaxy(); });
toggle.addEventListener('click', resumeGalaxy);
reduced.addEventListener('change', resumeGalaxy);
resizeGalaxy();


setMotion(motion);
