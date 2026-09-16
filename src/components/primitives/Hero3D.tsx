'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

/**
 * Hero3D — a genuine WebGL 3D element behind Chapter 01 (beauty
 * pass, "make it actually 3D, not just CSS depth tricks"), scaled up
 * significantly in the bold pass, then pushed further still on
 * explicit follow-up direction ("still looks the same"): node count
 * and accent count both raised again, full node/halo opacity, and the
 * radial mask opened wider so far more of the cluster is visible
 * rather than vignetted down to a small center patch.
 *
 * Not a generic decorative 3D shape: a slowly rotating cluster of
 * small glowing nodes, thin lines drawn between the ones that sit
 * close together — the same "task/signal" vocabulary already used
 * everywhere else on the site (SignalDot, the NetworkSignal lines in
 * Chapter 05, the traveling-word signals right here in Chapter 01),
 * just given real depth instead of staying flat. Most nodes are ink-
 * toned and quiet; a larger minority are picked out in the site's
 * actual accent colors (red/gold) so the object reads as belonging
 * to this brand, not an arbitrary Three.js demo dropped in.
 *
 * MOTION: one continuous slow rotation (a full turn takes minutes,
 * not seconds — this is atmosphere, not a spinner) plus a gentle
 * pointer-driven tilt on fine pointers, eased toward the target each
 * frame rather than snapping — same restrained, no-bounce motion
 * language as AmbientLight's pointer lean.
 *
 * OPT-OUTS: skipped entirely under prefers-reduced-motion (its whole
 * point is motion — HeroGlow's static gradient still carries the
 * hero's color on its own for these visitors, same precedent as
 * AmbientDust/AmbientLight both returning null). Also skips itself
 * gracefully if WebGL isn't available, rather than throwing.
 *
 * Renders behind the sticky content div (natural DOM order, no
 * explicit z-index — same approach HeroGlow already uses) and never
 * captures pointer events, so it never interferes with the real UI
 * sitting in front of it.
 */

const NODE_COUNT = 90;
const CONNECT_DISTANCE = 3;
const ACCENT_NODE_COUNT = 20;

// Mirrors tokens.css — three/WebGL needs real color values, same
// reasoning as lib/motion.ts's surfaceColor pair.
const COLOR_INK_MUTED = 0x6b6660;
const COLOR_RED = 0xa6332b;
const COLOR_GOLD = 0xd98e2b;
const COLOR_LINE = 0xa39d93;

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // No WebGL available — fail silently, HeroGlow's gradient still carries the moment.
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 8;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ---- nodes ----
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i += 1) {
      // Points distributed through a soft sphere volume (not just the
      // shell), so the cluster reads as a real 3D cloud from every
      // rotation angle rather than a flat ring.
      const r = 4 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.7,
          r * Math.cos(phi),
        ),
      );
    }

    const accentIndices = new Set<number>();
    while (accentIndices.size < ACCENT_NODE_COUNT) {
      accentIndices.add(Math.floor(Math.random() * NODE_COUNT));
    }

    const nodeGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const haloGeometry = new THREE.SphereGeometry(0.22, 12, 12);
    positions.forEach((pos, i) => {
      const isAccent = accentIndices.has(i);
      const color = isAccent ? (i % 2 === 0 ? COLOR_RED : COLOR_GOLD) : COLOR_INK_MUTED;
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isAccent ? 1 : 0.55,
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.copy(pos);
      group.add(mesh);

      // Soft additive-blended halo behind each accent node — a cheap
      // stand-in for real bloom post-processing, giving the accent
      // colors an actual glow instead of a flat dot.
      if (isAccent) {
        const haloMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.26,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.position.copy(pos);
        group.add(halo);
      }
    });

    // ---- connecting lines between nearby nodes ----
    const lineVertices: number[] = [];
    for (let i = 0; i < positions.length; i += 1) {
      const a = positions[i];
      if (!a) continue;
      for (let j = i + 1; j < positions.length; j += 1) {
        const b = positions[j];
        if (!b) continue;
        if (a.distanceTo(b) < CONNECT_DISTANCE) {
          lineVertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: COLOR_LINE, transparent: true, opacity: 0.22 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(lines);

    // ---- pointer lean (fine pointer only) ----
    let targetX = 0;
    let targetY = 0;
    const fine = window.matchMedia('(pointer: fine)').matches;
    function handlePointerMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetY = nx * 0.25;
      targetX = ny * 0.15;
    }
    if (fine) window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // ---- resize ----
    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // ---- render loop ----
    let frameId: number;
    function tick() {
      group.rotation.y += 0.0015;
      group.rotation.x += (targetX - group.rotation.x) * 0.02;
      // Blend the pointer-driven y-lean on top of the continuous spin
      // rather than overwriting it, so it never darts back to zero.
      group.rotation.y += (targetY * 0.15 - group.rotation.y * 0.002);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (fine) window.removeEventListener('mousemove', handlePointerMove);
      nodeGeometry.dispose();
      haloGeometry.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-100 [mask-image:radial-gradient(ellipse_85%_85%_at_55%_45%,black_60%,transparent_98%)]"
    />
  );
}
