(function () {
  "use strict";

  function startFlow() {
    if (!document.body || document.getElementById("emxFlowLayer")) return;

    document.body.classList.add("emx-flow-page");

    const canvas = document.createElement("canvas");
    canvas.id = "emxFlowLayer";
    canvas.className = "emx-flow-layer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);

    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer = { x: window.innerWidth * .62, y: window.innerHeight * .32 };
    let particles = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;

    function buildParticles() {
      const count = Math.max(34, Math.min(76, Math.round((width * height) / 24000)));
      particles = Array.from({ length: count }, function (_, index) {
        const accent = index % 7 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - .5) * (accent ? .42 : .24),
          vy: (Math.random() - .5) * (accent ? .42 : .24),
          radius: accent ? 2.2 + Math.random() * 1.5 : .7 + Math.random() * 1.05,
          color: accent ? "203,61,237" : "108,255,67"
        };
      });
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildParticles();
      draw(true);
    }

    function draw(still) {
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(width, height) * .58);
      glow.addColorStop(0, "rgba(181,55,255,.16)");
      glow.addColorStop(.43, "rgba(106,255,66,.055)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        if (!still) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -18 || particle.x > width + 18) particle.vx *= -1;
          if (particle.y < -18 || particle.y > height + 18) particle.vy *= -1;
        }

        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance > 135) continue;
          const alpha = (1 - distance / 135) * .15;
          context.beginPath();
          context.strokeStyle = "rgba(135,182,148," + alpha.toFixed(3) + ")";
          context.lineWidth = .7;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }

      particles.forEach(function (particle) {
        context.beginPath();
        context.fillStyle = "rgba(" + particle.color + ",.82)";
        context.shadowColor = "rgba(" + particle.color + ",.9)";
        context.shadowBlur = particle.radius > 2 ? 15 : 8;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;

      if (!still && document.visibilityState === "visible") animationFrame = window.requestAnimationFrame(function () { draw(false); });
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", function (event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && !animationFrame) draw(false);
      if (document.visibilityState !== "visible" && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    });

    resize();
    draw(false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startFlow, { once: true });
  else startFlow();
})();
