import { useEffect, useRef, useState } from "react";
import { track } from "./pegada.ts";

// O "R" do favicon (viewBox 256), desenhado com partículas.
const PATHS = [
  "M124.455 24.2156C131.987 23.2743 145.097 25.5783 152.258 27.9583C171.753 34.4803 187.895 48.438 197.184 66.8046C214.96 102.495 202.905 144.59 166.664 162.649L206 230.97L181.588 230.964C179.513 228.028 175.656 220.822 173.741 217.47L158.737 191.25L149.949 176.094C145.032 167.652 144.915 169.284 144.964 159.357L144.998 147.501C150.525 146.418 154.361 145.279 159.42 142.538C170.453 136.536 178.656 126.391 182.223 114.333C186.14 100.789 183.672 86.2689 176.959 74.0566C174.037 68.8375 170.338 64.0962 165.987 59.9974C155.464 50.1605 140.505 44.6703 126.139 45.1789C111.278 45.7998 97.2669 52.2899 87.1687 63.2299C80.2517 70.7077 75.4843 79.9217 73.3726 89.8943C71.8119 97.4004 72.1983 106.226 72.2265 113.959L72.248 140.473L72.1495 200.93C72.1627 210.57 71.8988 221.445 72.2462 231C65.3521 230.858 58.0657 230.982 51.1418 230.988C50.9643 202.31 50.9535 173.632 51.1092 144.956L51.1209 115.346C51.1248 104.408 50.5985 94.7135 52.9655 83.9442C55.6961 71.9659 61.2957 60.8333 69.2813 51.5079C83.9926 34.5521 102.205 25.7492 124.455 24.2156Z",
  "M88.9228 230.966L88.9915 145.915C88.9844 131.476 89.0324 116.98 88.9749 102.549C88.8834 79.4512 106.344 61.7709 129.565 62.2459C139.85 62.5314 149.593 66.929 156.621 74.4574C165.421 83.7247 167.379 93.5824 167.053 105.811H146.261C146.042 100.451 145.371 93.9257 141.826 89.6028C133.786 79.8036 118.079 81.563 112.284 92.8232C110.621 96.0541 110.309 98.3482 110.008 101.967L110.028 131.791C110.028 135.687 110.254 142.991 109.968 146.623L110.104 147.288C111.304 147.47 115.092 147.373 116.454 147.371L128.969 147.351L128.932 168.236C123.509 167.848 115.486 168.18 109.885 168.133C110.179 169.764 110.043 175.738 110.035 177.7L110.014 196.053L110.014 219.813C110.014 222.131 110.198 228.852 109.94 230.771C109.611 231.004 109.777 230.947 109.464 230.998C103.24 230.739 95.2917 230.972 88.9228 230.966Z",
];
// Centro e altura do desenho dentro do viewBox
const GLYPH = { cx: 128.5, cy: 127, height: 208 };
// Cores dos projetos: algumas partículas ganham uma delas
const ACCENTS = ["#16a34a", "#c8452f", "#2f45f5", "#a3d10a"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  r: number;
  phase: number;
  color: string | null;
};

// O canvas passa 18% para fora da área do monograma, para as partículas terem espaço
// para voar sem bater numa borda invisível.
const BLEED = 0.18;
const FILL = 0.86 / (1 + 2 * BLEED);

export function Monogram({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Até o canvas começar, o HTML (pré-renderizado no build) mostra um R estático de pontinhos
  const [live, setLive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let radius = 0;
    let particles: Particle[] = [];
    let ink = "#000";
    let frame = 0;
    let visible = true;
    const pointer = { x: -1e4, y: -1e4 };

    const readInk = () => {
      ink = getComputedStyle(canvas).color;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const size = Math.min(width, height);
      const scale = (size * FILL) / GLYPH.height;
      const off = document.createElement("canvas");
      off.width = Math.ceil(width);
      off.height = Math.ceil(height);
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.translate(width / 2 - GLYPH.cx * scale, height / 2 - GLYPH.cy * scale);
      o.scale(scale, scale);
      for (const d of PATHS) o.fill(new Path2D(d));
      const data = o.getImageData(0, 0, off.width, off.height).data;

      const step = Math.max(5, Math.round(size / 87));
      radius = size * 0.15;
      particles = [];
      for (let y = step / 2; y < off.height; y += step) {
        for (let x = step / 2; x < off.width; x += step) {
          if (data[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3] < 128) continue;
          const angle = Math.random() * Math.PI * 2;
          // Começam perto do lugar, por cima do R estático, e se assentam
          const far = size * 0.05 * (0.4 + Math.random());
          particles.push({
            hx: x,
            hy: y,
            x: reduced ? x : width / 2 + Math.cos(angle) * far,
            y: reduced ? y : height / 2 + Math.sin(angle) * far,
            vx: 0,
            vy: 0,
            r: step * (0.3 + Math.random() * 0.14),
            phase: Math.random() * Math.PI * 2,
            color:
              Math.random() < 0.07 ? ACCENTS[Math.floor(Math.random() * ACCENTS.length)] : null,
          });
        }
      }
    };

    // Um caminho por cor: bem mais leve do que um fill() por partícula
    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const color of [null, ...ACCENTS]) {
        ctx.fillStyle = color ?? ink;
        ctx.beginPath();
        for (const p of particles) {
          if (p.color !== color) continue;
          const wobble = reduced ? 0 : Math.sin(t / 900 + p.phase) * 0.6;
          ctx.moveTo(p.x + wobble + p.r, p.y - wobble);
          ctx.arc(p.x + wobble, p.y - wobble, p.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    // Física em passos fixos de 1/60 s, para andar na mesma velocidade em telas de
    // 60 Hz ou 120 Hz e não travar quando o navegador entrega poucos quadros.
    const STEP = 1000 / 60;
    let last = 0;
    let pending = 0;
    const physics = () => {
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius && dist > 0.01) {
          const force = (1 - dist / radius) ** 2 * 6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx = (p.vx + (p.hx - p.x) * 0.03) * 0.86;
        p.vy = (p.vy + (p.hy - p.y) * 0.03) * 0.86;
        p.x += p.vx;
        p.y += p.vy;
      }
    };

    const tick = (t: number) => {
      pending = Math.min(pending + (last ? t - last : STEP), STEP * 8);
      last = t;
      while (pending >= STEP) {
        physics();
        pending -= STEP;
      }
      draw(t);
      if (visible) frame = requestAnimationFrame(tick);
      else frame = last = 0;
    };

    const start = () => {
      if (!reduced && !frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };
    // No toque, o "cursor" some quando o dedo sai da tela
    // Clique duplo ou triplo no R não pode selecionar o texto ao lado
    const noSelect = (event: MouseEvent) => event.preventDefault();
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onLeave();
    };
    // Clique espalha tudo, e as partículas voltam sozinhas
    let tracked = 0;
    const onDown = (event: PointerEvent) => {
      onMove(event);
      // Conta quem brinca com o R, no máximo um evento a cada 2 s
      if (event.timeStamp - tracked > 2000 || !tracked) {
        tracked = event.timeStamp;
        track("monograma_espalhado");
      }
      for (const p of particles) {
        const angle = Math.atan2(p.y - pointer.y, p.x - pointer.x) + (Math.random() - 0.5);
        const speed = 8 + Math.random() * 18;
        p.vx += Math.cos(angle) * speed;
        p.vy += Math.sin(angle) * speed;
      }
    };

    readInk();
    build();
    setLive(true);
    if (reduced) draw(0);
    else start();

    const resize = new ResizeObserver(() => {
      build();
      if (reduced) draw(0);
    });
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    seen.observe(canvas);
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readInk();
      if (reduced) draw(0);
    };
    scheme.addEventListener("change", onScheme);
    if (!reduced) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerup", onUp);
      addEventListener("pointercancel", onUp);
      document.documentElement.addEventListener("pointerleave", onLeave);
      wrap.addEventListener("pointerdown", onDown);
      wrap.addEventListener("mousedown", noSelect);
    }

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      seen.disconnect();
      scheme.removeEventListener("change", onScheme);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("mousedown", noSelect);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square cursor-crosshair touch-manipulation select-none [-webkit-touch-callout:none] ${className ?? ""}`}
    >
      <svg
        aria-hidden
        viewBox="7.57 6.07 241.86 241.86"
        className={`pointer-events-none absolute inset-0 size-full text-(--fg) transition-opacity duration-700 ${live ? "opacity-0" : ""}`}
      >
        <defs>
          <pattern id="monogram-dots" width="3.78" height="3.78" patternUnits="userSpaceOnUse">
            <circle cx="1.89" cy="1.89" r="1.4" fill="currentColor" />
          </pattern>
        </defs>
        {PATHS.map((d) => (
          <path key={d.slice(0, 16)} d={d} fill="url(#monogram-dots)" />
        ))}
      </svg>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="O monograma R, feito de partículas que fogem do cursor"
        className="pointer-events-none absolute -top-[18%] -left-[18%] size-[136%] text-(--fg)"
      />
    </div>
  );
}
