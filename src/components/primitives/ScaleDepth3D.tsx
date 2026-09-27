'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * ScaleDepth3D — Chapter 07's 3D layer. NEW FILE, Step 61 (sub-step 1
 * of a from-scratch build — Chapter 07 had no WebGL layer before this).
 *
 * ----------------------------------------------------------------
 * A THIRD, DELIBERATELY DIFFERENT SHAPE LANGUAGE
 * ----------------------------------------------------------------
 * Chapter 05: round, organic, deformed-icosahedron "gems."
 * Chapter 06: flat hexagonal chips + hex-cross-section tube conduits.
 * Chapter 07 (this file): plain rectangular boxes — flat, orthogonal
 * "crate" cards, nothing round and nothing hexagonal anywhere in this
 * file. Chosen because Chapter 07's actual subject is volume: real
 * pieces of work (Onboarding Docs, Approve Invoice, etc.) arriving
 * from outside the field and being organized (§8/§18/§19/§21 in that
 * chapter's own doc comment) — a physical crate/card is the literal
 * shape of "a piece of work," not a decorative gem or a circuit chip.
 *
 * ----------------------------------------------------------------
 * THE 3D TRANSITION IS THE CHAPTER'S OWN CHAOS->ORDER ARC, NOT A
 * SEPARATE EFFECT
 * ----------------------------------------------------------------
 * Chapter07Scale's 2D path grammar is two-segment: a straight
 * "continuation" leg (length controlled by `turn`), then a curved
 * redirect into the settled position (the elbow is the recognition
 * moment). This file duplicates that exact math (redirectPoint/
 * quadCtrl/pathAt below, copied from Chapter07Scale.tsx so the 3D
 * crate and the 2D dot trace the identical curve) and adds the one
 * thing 2D can't: during the straight leg, each crate tumbles freely
 * and sits at a randomized, exaggerated depth (arriving "from
 * anywhere," genuinely chaotic in 3D, not just position) — then
 * across the curved redirect leg, rotation eases back to a level,
 * aligned orientation and depth eases to one shared settle-plane
 * close to the camera, so every arrived item ends up visually
 * flush with every other one. The chapter's actual theme — more
 * volume arriving with *less* visible chaos over time — is expressed
 * as a literal 3D fact (things stop tumbling and land on the same
 * plane), not just described.
 *
 * The eighth, paused item (approaches, stops short, handed to
 * Chapter 08) gets the same crate treatment but never reaches the
 * redirect leg — it stays mid-tumble, mid-depth, unresolved in 3D
 * exactly as it is in 2D.
 *
 * DRIVEN BY SCROLL, NOT AN INTERNAL CLOCK: reads scrollYProgress.get()
 * every frame — scrubbable and reversible, same as every other 3D
 * layer on the site.
 *
 * OPT-OUTS: skipped entirely under prefers-reduced-motion (the 2D
 * static end-state in Chapter07Scale already covers those visitors).
 * Fails gracefully, silently, if WebGL isn't available. Never
 * captures pointer events.
 *
 * NOT INCLUDED YET: bloom/post-processing. Step 59/60 on Chapter 06
 * showed bloom needs the base geometry confirmed first — added here
 * only in a follow-up sub-step, once this foundation is approved.
 *
 * STEP 62 (sub-step 2 — polish, "ultra hyper realistic," more 3D
 * effects): approved as-is, so nothing about the shape language
 * changes here — three additions on top of it:
 *   1. RoundedBoxGeometry instead of a sharp-edged BoxGeometry for
 *      every crate — a beveled edge is most of what separates a
 *      "rendered cube" from a "manufactured card," and it's the
 *      single biggest realism lever available without changing the
 *      shape itself.
 *   2. A real bloom pass, tuned from Chapter 06's mistake (lower
 *      strength, higher threshold from the start this time, not
 *      discovered by shipping an overexposed version first).
 *   3. A settle-pulse ring: a thin hex-cross-section torus that
 *      flashes and expands exactly as each crate crosses its own
 *      elbow (t == turn) — the chapter's 2D "recognition moment"
 *      (ItemPath's elbowScale) now has a real 3D counterpart, purely
 *      a function of scroll progress so it stays scrubbable/
 *      reversible like everything else here.
 */

const SLAB_COUNT = 180;
const ACCENT_COUNT = 12;
const FIELD_WIDTH = 16;
const FIELD_HEIGHT = 9;

const COLOR_INK = 0xf3efe7;
const COLOR_RED = 0xe2493d;
const COLOR_GOLD = 0xd98e2b;
const COLOR_VIOLET = 0x7c4dff;

interface Pt {
  x: number;
  y: number;
}

export interface WorkItem3D {
  id: string;
  accent?: boolean;
  turn: number;
  bend: number;
  window: [number, number];
  depth: number;
  start: Pt;
  end: Pt;
}

export interface Paused3D {
  start: Pt;
  pause: Pt;
  window: [number, number];
}

// ---- duplicated from Chapter07Scale.tsx's own path grammar, on
// purpose (see file doc comment) — the 3D crate must trace the exact
// same curve the 2D dot does. ----
function redirectPoint(start: Pt, end: Pt, turn: number): Pt {
  const horizontalEntry = start.x < 0 || start.x > 100;
  if (horizontalEntry) {
    return { x: start.x + (end.x - start.x) * turn, y: start.y + (end.y - start.y) * turn * 0.18 };
  }
  return { x: start.x + (end.x - start.x) * turn * 0.18, y: start.y + (end.y - start.y) * turn };
}
function quadCtrl(from: Pt, to: Pt, bend: number): Pt {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: mid.x + (-dy / len) * bend, y: mid.y + (dx / len) * bend };
}
function pathAt(t: number, start: Pt, redirect: Pt, ctrl: Pt, end: Pt, split: number): Pt {
  if (t <= split) {
    const lt = t / split;
    return { x: start.x + (redirect.x - start.x) * lt, y: start.y + (redirect.y - start.y) * lt };
  }
  const qt = (t - split) / (1 - split);
  return {
    x: (1 - qt) ** 2 * redirect.x + 2 * (1 - qt) * qt * ctrl.x + qt ** 2 * end.x,
    y: (1 - qt) ** 2 * redirect.y + 2 * (1 - qt) * qt * ctrl.y + qt ** 2 * end.y,
  };
}

function windowT(progress: number, [a, b]: [number, number]): number {
  if (progress <= a) return 0;
  if (progress >= b) return 1;
  return (progress - a) / (b - a);
}
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}
function ease(t: number) {
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ScaleDepth3D({
  scrollYProgress,
  items,
  paused,
}: {
  scrollYProgress: MotionValue<number>;
  items: WorkItem3D[];
  paused: Paused3D;
}) {
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
      return undefined;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x121116, 6, 16);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 9;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRoom = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envRoom, 0.04).texture;
    scene.environment = envTexture;

    const fillLight = new THREE.HemisphereLight(0x8a6cff, 0x140a33, 0.9);
    scene.add(fillLight);
    const keyLight = new THREE.DirectionalLight(0xfff2df, 1.05);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x7c8fff, 0.6);
    rimLight.position.set(-4, -2, -3.5);
    scene.add(rimLight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Tuned conservatively from the start (Chapter 06's Step 59 shipped
    // too hot and had to be pulled back in Step 60) — low strength,
    // high threshold, so only genuinely bright emissive surfaces
    // (rims, the settle-pulse rings) catch it.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.5, 0.8);
    composer.addPass(bloomPass);

    const group = new THREE.Group();
    scene.add(group);

    function pctToWorld(pt: Pt, z: number): THREE.Vector3 {
      return new THREE.Vector3((pt.x / 100 - 0.5) * FIELD_WIDTH, -(pt.y / 100 - 0.5) * FIELD_HEIGHT, z);
    }

    // STEP 64: direct user feedback — crates weren't lining up over
    // their headings. Root cause: pctToWorld's X/Y mapping is a flat
    // plane, but the camera is a real PerspectiveCamera, so an object
    // placed at that X/Y and then pushed to a nonzero Z (every crate,
    // for the depth/chaos effect) visibly drifts off that intended
    // screen position — perspective spreads out anything nearer the
    // camera. This computes the X/Y on the reference z=0 plane (where
    // it truly matches the heading below it and the extra icon-offset
    // is applied), then scales X/Y by the same ratio the camera's
    // perspective divide will apply at the object's real Z, so its
    // projected screen center lands in exactly the same place
    // regardless of how far forward/back the depth effect pushes it.
    function projectAligned(pt: Pt, yOffset: number, z: number): THREE.Vector3 {
      const base = pctToWorld(pt, 0);
      const factor = (camera.position.z - z) / camera.position.z;
      return new THREE.Vector3(base.x * factor, (base.y + yOffset) * factor, z);
    }

    // ---- ambient slabs: thin flat rectangular cards drifting through
    // the field — a third ambient shape, distinct from Ch05's round
    // dust and Ch06's cylindrical filaments. STEP 63: switched from an
    // unlit flat color to a real lit material (so they actually catch
    // the key/rim lights and env map like the crates do, instead of
    // reading as flat colored confetti), and each slab's color is now
    // a genuine gradient — lerped between a cool violet and a warm
    // gold based on its own depth in the field, with the red/gold
    // accent subset layered on top of that gradient rather than
    // replacing it.
    const accentIndices = new Set<number>();
    while (accentIndices.size < ACCENT_COUNT) {
      accentIndices.add(Math.floor(Math.random() * SLAB_COUNT));
    }
    const slabGeometry = new THREE.BoxGeometry(0.09, 0.06, 0.006);
    const slabColorNear = new THREE.Color(COLOR_GOLD);
    const slabColorFar = new THREE.Color(COLOR_VIOLET);
    const slabs: THREE.Mesh[] = [];
    const slabBaseOpacities: number[] = [];
    const slabPhases: number[] = [];
    for (let i = 0; i < SLAB_COUNT; i += 1) {
      const isAccent = accentIndices.has(i);
      const z = (Math.random() - 0.5) * 7;
      const depthT = clamp01((z + 3.5) / 7);
      const gradientColor = new THREE.Color().lerpColors(slabColorFar, slabColorNear, depthT);
      const color = isAccent ? (i % 2 === 0 ? new THREE.Color(COLOR_RED) : new THREE.Color(COLOR_GOLD)) : gradientColor;
      const baseOpacity = isAccent ? 0.55 : 0.32;
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.4,
        roughness: 0.35,
        envMapIntensity: 0.9,
        emissive: color,
        emissiveIntensity: isAccent ? 0.25 : 0.08,
        transparent: true,
        opacity: baseOpacity,
      });
      const mesh = new THREE.Mesh(slabGeometry, material);
      mesh.position.set((Math.random() - 0.5) * FIELD_WIDTH * 1.3, (Math.random() - 0.5) * FIELD_HEIGHT * 1.3, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const scale = 0.8 + Math.random() * 1.4;
      mesh.scale.setScalar(scale);
      group.add(mesh);
      slabs.push(mesh);
      slabBaseOpacities.push(baseOpacity);
      slabPhases.push(Math.random() * Math.PI * 2);
    }

    // How far above each settled item's heading its crate sits (world
    // units) — direct user feedback: crates were centered on top of
    // the label/meta text and overlapping it. Applied to both the
    // in-flight and settled positions so the crate consistently
    // tracks just above the item's own path rather than snapping up
    // only once arrived.
    const CRATE_Y_OFFSET = 0.62;

    // ---- work-item crates: one flat rectangular "card" per real
    // item, tracing the identical two-segment path the 2D version
    // draws, tumbling while "in flight" and locking flat/aligned once
    // past its own redirect elbow.
    interface CrateObj {
      item: WorkItem3D;
      group: THREE.Group;
      bodyGeometry: THREE.BufferGeometry;
      bodyMaterial: THREE.MeshPhysicalMaterial;
      rimGeometry: THREE.BufferGeometry;
      rimMaterial: THREE.LineBasicMaterial;
      ringGeometry: THREE.BufferGeometry;
      ringMaterial: THREE.MeshBasicMaterial;
      ringMesh: THREE.Mesh;
      redirect: Pt;
      ctrl: Pt;
      seed: number;
    }
    function buildCrate(color: number, accentColor: boolean): {
      group: THREE.Group;
      bodyGeometry: THREE.BufferGeometry;
      bodyMaterial: THREE.MeshPhysicalMaterial;
      rimGeometry: THREE.BufferGeometry;
      rimMaterial: THREE.LineBasicMaterial;
    } {
      const bodyGeometry = new RoundedBoxGeometry(0.85, 0.5, 0.09, 2, 0.05);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x201d26,
        metalness: 0.72,
        roughness: 0.24,
        clearcoat: 0.7,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.3,
        emissive: accentColor ? COLOR_RED : 0x000000,
        emissiveIntensity: accentColor ? 0.08 : 0,
        transparent: true,
        opacity: 0,
      });
      // The rim traces a plain rectangle, not the rounded body's own
      // bevel facets — EdgesGeometry on the rounded geometry directly
      // would outline every tiny bevel segment and read as a busy
      // wireframe instead of one clean edge, so a separate flat-box
      // source (disposed right after) is used just for this outline.
      const rimSourceGeometry = new THREE.BoxGeometry(0.85, 0.5, 0.09);
      const rimGeometry = new THREE.EdgesGeometry(rimSourceGeometry);
      rimSourceGeometry.dispose();
      const rimMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const crateGroup = new THREE.Group();
      crateGroup.add(new THREE.Mesh(bodyGeometry, bodyMaterial));
      crateGroup.add(new THREE.LineSegments(rimGeometry, rimMaterial));
      group.add(crateGroup);
      return { group: crateGroup, bodyGeometry, bodyMaterial, rimGeometry, rimMaterial };
    }

    const crates: CrateObj[] = items.map((item, i) => {
      const redirect = redirectPoint(item.start, item.end, item.turn);
      const ctrl = quadCtrl(redirect, item.end, item.bend);
      const built = buildCrate(item.accent ? COLOR_RED : COLOR_INK, !!item.accent);
      built.group.scale.setScalar(0.001);
      // Settle-pulse ring: hex-cross-section torus (kept consistent
      // with the site's "faceted, not round" language even for this
      // effect), flashes and expands right at this item's own elbow.
      const ringGeometry = new THREE.TorusGeometry(0.45, 0.02, 6, 24);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: item.accent ? COLOR_RED : COLOR_GOLD,
        transparent: true,
        opacity: 0,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ringMesh);
      return { item, ...built, ringGeometry, ringMaterial, ringMesh, redirect, ctrl, seed: i * 1.7 + 0.4 };
    });

    const pausedRedirect = { x: paused.start.x + (paused.pause.x - paused.start.x) * 0.999, y: paused.start.y + (paused.pause.y - paused.start.y) * 0.999 };
    const pausedCrate = buildCrate(COLOR_INK, false);
    pausedCrate.group.scale.setScalar(0.001);

    // ---- resize ----
    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      composer.setSize(clientWidth, clientHeight);
      bloomPass.setSize(clientWidth, clientHeight);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // ---- render loop ----
    let frameId: number;
    let elapsed = 0;
    function tick() {
      // STEP 65 (final polish — slow motion down a little for clarity):
      // elapsed accumulates at ~0.55x its previous rate, which
      // proportionally slows the tumble/breathe motion below that's
      // multiplied by it; the ambient-slab rotation increments aren't
      // gated by elapsed, so those are scaled the same way separately.
      elapsed += 0.0033;
      const progress = scrollYProgress.get();

      slabs.forEach((mesh, i) => {
        const breathe = 0.85 + 0.15 * Math.sin(elapsed + slabPhases[i]!);
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = slabBaseOpacities[i]! * breathe;
        mesh.rotation.x += 0.0008 * (i % 2 === 0 ? 1 : -1);
        mesh.rotation.y += 0.00055;
      });

      crates.forEach((c) => {
        const t = windowT(progress, c.item.window);
        if (t <= 0) {
          c.bodyMaterial.opacity = 0;
          c.rimMaterial.opacity = 0;
          c.ringMaterial.opacity = 0;
          return;
        }
        const eased = ease(clamp01(t));
        const pos = pathAt(eased, c.item.start, c.redirect, c.ctrl, c.item.end, c.item.turn);

        // Chaos while in flight (t < turn): exaggerated, randomized
        // depth and free tumbling. Order once redirected (t >= turn):
        // depth and rotation ease to one shared, flat settle-plane —
        // the chapter's own "more volume, less chaos" arc, as a 3D fact.
        const inFlightT = clamp01(t / c.item.turn);
        const settleT = t <= c.item.turn ? 0 : ease(clamp01((t - c.item.turn) / (1 - c.item.turn)));
        const chaosDepth = 2.2 + 2.6 * Math.sin(elapsed * 0.6 + c.seed * 3);
        const settleDepth = c.item.depth * 0.9;
        const z = lerp(chaosDepth, settleDepth, settleT);
        const world = projectAligned(pos, CRATE_Y_OFFSET, z);
        c.group.position.copy(world);

        const tumble = (1 - settleT) * (elapsed * (1.1 + (c.seed % 1)));
        c.group.rotation.set(tumble * 0.9, tumble * 1.3, (1 - settleT) * c.seed * 0.6);

        const revealT = ease(clamp01(inFlightT > 0 ? Math.min(1, t / 0.06) : 0));
        c.group.scale.setScalar(lerp(0.001, 1, revealT));
        c.bodyMaterial.opacity = 0.92 * revealT;
        c.rimMaterial.opacity = (0.35 + settleT * 0.45) * revealT;
        c.bodyMaterial.envMapIntensity = 1.3 + settleT * 0.6;

        // Settle-pulse ring: a narrow bump centered exactly on this
        // item's own elbow (t === turn), purely a function of t so it
        // scrubs both directions with scroll like everything else.
        const elbowDist = Math.abs(t - c.item.turn);
        const elbowPulse = Math.max(0, 1 - elbowDist / 0.06);
        c.ringMesh.position.copy(world);
        c.ringMesh.scale.setScalar(0.6 + elbowPulse * 1.1);
        c.ringMaterial.opacity = elbowPulse * 0.8 * revealT;
      });

      {
        const t = windowT(progress, paused.window);
        if (t > 0) {
          const eased = ease(clamp01(t));
          const pos = pathAt(eased, paused.start, pausedRedirect, pausedRedirect, paused.pause, 0.999);
          const chaosDepth = 2.0 + 1.4 * Math.sin(elapsed * 0.5);
          const world = projectAligned(pos, 0, chaosDepth);
          pausedCrate.group.position.copy(world);
          const tumble = elapsed * 0.8;
          pausedCrate.group.rotation.set(tumble * 0.7, tumble * 1.0, 0.3);
          const revealT = ease(clamp01(t / 0.08));
          pausedCrate.group.scale.setScalar(lerp(0.001, 0.85, revealT));
          pausedCrate.bodyMaterial.opacity = 0.7 * revealT;
          pausedCrate.rimMaterial.opacity = 0.4 * revealT;
        }
      }

      group.rotation.y = progress * 0.18;

      composer.render();
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      slabGeometry.dispose();
      slabs.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
      });
      crates.forEach((c) => {
        c.bodyGeometry.dispose();
        c.bodyMaterial.dispose();
        c.rimGeometry.dispose();
        c.rimMaterial.dispose();
        c.ringGeometry.dispose();
        c.ringMaterial.dispose();
      });
      pausedCrate.bodyGeometry.dispose();
      pausedCrate.bodyMaterial.dispose();
      pausedCrate.rimGeometry.dispose();
      pausedCrate.rimMaterial.dispose();
      envTexture.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, scrollYProgress, items, paused]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-90"
    />
  );
}
