"use client";

import * as React from "react";

const SIZE = 144;
const NODE_COUNT = 48;
const NEIGHBORS = 3;
const RADIUS = 52;
const CAMERA = 220;

type Vec3 = [number, number, number];

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function spherePoints(n: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return [Math.cos(theta) * r, y, Math.sin(theta) * r];
  });
}

/** Links each node to its nearest neighbors, deduplicated. */
function nearestEdges(points: Vec3[], k: number): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      });
  });
  return edges;
}

interface Pulse {
  edge: number;
  t: number;
  speed: number;
}

/**
 * A slowly rotating 3D "neural network" globe: nodes on a sphere linked to
 * their neighbors, with signals firing along the links. Drawn on a canvas
 * with a simple perspective projection; colors come from the theme's
 * --accent token so it follows light/dark mode.
 */
export function NeuralOrb() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = spherePoints(NODE_COUNT);
    const edges = nearestEdges(points, NEIGHBORS);
    const pulses: Pulse[] = [];
    // The canvas's CSS `color` is var(--accent); reading the computed value
    // resolves light-dark() into a concrete rgb() the canvas can use.
    const readAccent = () => parseRgb(getComputedStyle(canvas).color);
    let accent = readAccent();
    let frame = 0;
    let raf = 0;

    const project = ([x, y, z]: Vec3, rotY: number, rotX: number) => {
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const scale = CAMERA / (CAMERA + z2 * RADIUS);
      return {
        x: SIZE / 2 + x1 * RADIUS * scale,
        y: SIZE / 2 + y1 * RADIUS * scale,
        // 0 at the back of the sphere, 1 at the front.
        depth: (1 - z2) / 2,
        scale,
      };
    };

    const draw = () => {
      frame++;
      // Re-read the accent occasionally in case the theme changes mid-run.
      if (frame % 60 === 0) {
        accent = readAccent();
      }
      const speed = reducedMotion ? 0.1 : 1;
      const rotY = frame * 0.008 * speed;
      const rotX = 0.35 + Math.sin(frame * 0.004 * speed) * 0.2;
      const projected = points.map((p) => project(p, rotY, rotX));

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Soft core glow.
      const glow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, RADIUS);
      glow.addColorStop(0, withAlpha(accent, 0.28 + Math.sin(frame * 0.05) * 0.08));
      glow.addColorStop(1, withAlpha(accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        ctx.strokeStyle = withAlpha(accent, 0.08 + ((pa.depth + pb.depth) / 2) * 0.35);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Signals travelling along random links.
      if (pulses.length < 10 && Math.random() < 0.25 * speed) {
        pulses.push({ edge: Math.floor(Math.random() * edges.length), t: 0, speed: 0.02 + Math.random() * 0.03 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.t += pulse.speed * speed;
        if (pulse.t >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const [a, b] = edges[pulse.edge];
        const pa = projected[a];
        const pb = projected[b];
        const x = pa.x + (pb.x - pa.x) * pulse.t;
        const y = pa.y + (pb.y - pa.y) * pulse.t;
        const depth = pa.depth + (pb.depth - pa.depth) * pulse.t;
        ctx.shadowColor = withAlpha(accent, 1);
        ctx.shadowBlur = 8;
        ctx.fillStyle = withAlpha(accent, 0.4 + depth * 0.6);
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + depth * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Nodes, back to front so nearer ones sit on top.
      [...projected]
        .sort((a, b) => a.depth - b.depth)
        .forEach((p) => {
          ctx.fillStyle = withAlpha(accent, 0.25 + p.depth * 0.75);
          ctx.beginPath();
          ctx.arc(p.x, p.y, (1 + p.depth * 1.8) * p.scale, 0, Math.PI * 2);
          ctx.fill();
        });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: SIZE, height: SIZE, color: "var(--accent)" }}
    />
  );
}

type Rgb = [number, number, number];

function parseRgb(color: string): Rgb {
  const [r, g, b] = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return r === undefined ? [79, 70, 229] : [r, g, b];
}

function withAlpha([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
