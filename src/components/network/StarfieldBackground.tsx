import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface EphemeralStar {
  x: number;
  y: number;
  size: number;
  maxOpacity: number;
  phase: 'fadein' | 'visible' | 'fadeout' | 'dormant';
  timer: number;
  fadeDuration: number;
  visibleDuration: number;
  dormantDuration: number;
}

export const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let ephemeralStars: EphemeralStar[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initStars();
    };

    const initStars = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Moving stars
      stars = Array.from({ length: 220 }, () => {
        const angle = (Math.random() * 0.6 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.1 + 0.03,
          angle,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        };
      });

      // Ephemeral stars (fade in/out lifecycle)
      ephemeralStars = Array.from({ length: 80 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 1,
        maxOpacity: Math.random() * 0.5 + 0.3,
        phase: (['fadein', 'visible', 'fadeout', 'dormant'] as const)[Math.floor(Math.random() * 4)],
        timer: Math.floor(Math.random() * 200),
        fadeDuration: Math.floor(Math.random() * 100 + 150),
        visibleDuration: Math.floor(Math.random() * 100 + 100),
        dormantDuration: Math.floor(Math.random() * 200 + 200),
      }));
    };

    let time = 0;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // Nebula gradients
      const nebula1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.4);
      nebula1.addColorStop(0, 'hsla(240, 50%, 15%, 0.2)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, w, h);

      const nebula2 = ctx.createRadialGradient(w * 0.75, h * 0.7, 0, w * 0.75, h * 0.7, w * 0.35);
      nebula2.addColorStop(0, 'hsla(280, 40%, 12%, 0.15)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);

      const nebula3 = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.1, w * 0.3);
      nebula3.addColorStop(0, 'hsla(215, 60%, 12%, 0.15)');
      nebula3.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, w, h);

      // Moving stars
      for (const star of stars) {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        if (star.x > w) star.x = 0;
        if (star.x < 0) star.x = w;
        if (star.y > h) star.y = 0;
        if (star.y < 0) star.y = h;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.opacity + twinkle * 0.2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(1, alpha))})`;
        ctx.fill();
      }

      // Ephemeral stars (born and die)
      for (const es of ephemeralStars) {
        es.timer++;
        let opacity = 0;

        switch (es.phase) {
          case 'fadein':
            opacity = (es.timer / es.fadeDuration) * es.maxOpacity;
            if (es.timer >= es.fadeDuration) { es.phase = 'visible'; es.timer = 0; }
            break;
          case 'visible':
            opacity = es.maxOpacity + Math.sin(time * 0.03) * 0.05;
            if (es.timer >= es.visibleDuration) { es.phase = 'fadeout'; es.timer = 0; }
            break;
          case 'fadeout':
            opacity = (1 - es.timer / es.fadeDuration) * es.maxOpacity;
            if (es.timer >= es.fadeDuration) { es.phase = 'dormant'; es.timer = 0; }
            break;
          case 'dormant':
            if (es.timer >= es.dormantDuration) {
              es.phase = 'fadein';
              es.timer = 0;
              es.x = Math.random() * w;
              es.y = Math.random() * h;
            }
            break;
        }

        if (opacity > 0.01) {
          const clampedOpacity = Math.max(0, Math.min(1, opacity));
          
          // Glow
          ctx.beginPath();
          ctx.arc(es.x, es.y, es.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${clampedOpacity * 0.08})`;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(es.x, es.y, es.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${clampedOpacity})`;
          ctx.fill();
        }
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[2]"
      style={{ willChange: 'transform' }}
    />
  );
};
