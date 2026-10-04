(() => {
  'use strict';
  const video = document.getElementById('store-header-video');
  const button = document.getElementById('store-header-toggle');
  const intro = document.getElementById('store-entry-intro');
  if (!video || !button) return;
  function update() {
    button.textContent = video.paused ? 'Play header' : 'Pause header';
    button.setAttribute('aria-pressed', String(!video.paused));
  }
  function play() { video.muted = true; video.play().catch(update); }
  button.addEventListener('click', () => { if (video.paused) play(); else video.pause(); });
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('error', () => { button.hidden = true; });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!intro || intro.hidden) play();
  else {
    const observer = new MutationObserver(() => {
      if (intro.hidden) { observer.disconnect(); play(); }
    });
    observer.observe(intro, {attributes:true, attributeFilter:['hidden']});
  }
})();
