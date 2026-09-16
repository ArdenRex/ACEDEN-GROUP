'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * PeopleField3D — Chapter 05's own genuine WebGL layer.
 *
 * STEP 55 (material rebuild): the transmission-based "glass" material
 * from Step 52 was producing a mottled, staticky surface in practice —
 * real-time transmission resamples whatever's already been drawn behind
 * each mesh, and with a transparent canvas over a CSS background (no
 * scene content back there) plus a dozen-plus overlapping transmissive
 * meshes, that resampling is what was reading as visual noise rather
 * than glass. This pass drops transmission entirely in favor of an
 * opaque metalness/roughness/clearcoat recipe lit by a proper
 * three-point rig (warm key, cool rim, hemisphere fill) plus the same
 * PMREM environment map — a "polished gem" rather than "glass," and a
 * far more robust one at this object count. Geometry and the
 * convergence choreography are unchanged from Step 52/53.
 *
 * STEP 53 (ambient field pass, still current): the palette is
 * mostly-neutral ink with a minority violet tint, count is sparse and
 * deliberate, and positions are rejection-sampled so gems can't land on
 * top of each other or inside the cluster area — see AMBIENT_PALETTE
 * and samplePosition below.
 *
 * The convergence narrative is unchanged: three named forms (Priya,
 * Sarah, Alex) travel from a spread start point to the shared cluster
 * point on the exact scroll windows the 2D marks already use
 * (CLUSTER_START/CLUSTER_END, see Chapter05People.tsx), so depth is
 * still added to the chapter's real event, not decorating it.
 *
 * DRIVEN BY SCROLL, NOT AN INTERNAL CLOCK — reads scrollYProgress.get()
 * every frame, exactly like EcosystemDepth3D, so it stays scrubbable
 * and reversible along with everything else in the chapter.
 *
 * OPT-OUTS: skipped under prefers-reduced-motion (the chapter's 2D
 * AmbientOrbs/SecondaryGrid/aurora layers still carry the chapter's
 * atmosphere for those visitors); fails silently if WebGL is
 * unavailable; never captures pointer events.
 */

const AMBIENT_COUNT = 11;
const FIELD_WIDTH = 15;
const FIELD_HEIGHT = 9;
const FIELD_DEPTH = 7;
// No ambient gem is allowed to spawn within this radius of the cluster
// point — keeps the area where Priya/Sarah/Alex actually converge clear
// of background clutter, so the named marks stay the obvious focal
// point instead of competing with a nearby stray gem.
const CLUSTER_EXCLUSION_RADIUS = 2.6;

// Chapter 05's jewel palette — the gems are tinted from the same violet/
// red family as the chapter's 2D layer, so the 3D field reads as part
// of one designed scene rather than a separate object dropped on top.
const COLOR_INK = 0xf3efe7;
const COLOR_VIOLET = 0x7c4dff;
const COLOR_EMBER = 0xe2493d;
// STEP 53: the ambient field's palette is mostly-neutral now — four
// parts clear ink-toned glass to one part violet — instead of the STEP
// 52 five-color mix (ink/violet/blue/ink/gold) that, at this shape count
// and this camera distance, read as a scatter of different-colored soap
// bubbles rather than a single considered material. Blue and gold are
// dropped from the ambient field entirely: gold now belongs only to the
// travelers' arrival moment, and blue was redundant with violet at this
// scale. Color stays rare on purpose, same reasoning as NETWORK_ORBS.
const AMBIENT_PALETTE = [COLOR_INK, COLOR_INK, COLOR_INK, COLOR_VIOLET, COLOR_INK];

interface Traveler {
  start: THREE.Vector3;
  window: [number, number];
  color: number;
}

const CLUSTER_POINT = new THREE.Vector3(0.4, -0.3, 0.6);

const TRAVELERS: Traveler[] = [
  { start: new THREE.Vector3(-4.4, 1.8, -1.2), window: [0.22, 0.3], color: COLOR_INK },
  { start: new THREE.Vector3(3.6, 0.6, 0.8), window: [0.48, 0.55], color: COLOR_VIOLET },
  { start: new THREE.Vector3(-2.2, -2.4, -0.6), window: [0.68, 0.74], color: COLOR_EMBER },
];

const CLUSTER_START = 0.68;
const CLUSTER_END = 0.85;

function windowT(progress: number, [a, b]: [number, number]): number {
  if (progress <= a) return 0;
  if (progress >= b) return 1;
  return (progress - a) / (b - a);
}

// Smoothstep, so travel eases in/out rather than moving linearly.
function ease(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * A gently deformed icosahedron — "organic gem" rather than a perfect
 * geometric primitive. Displacement is a handful of overlapping sine
 * waves over each vertex's direction from center (cheap, no noise
 * library needed), so every instance is a unique soft, rounded, faceted
 * blob instead of a repeated identical shape.
 */
function createGemGeometry(seed: number): THREE.IcosahedronGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 4);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const dir = v.clone().normalize();
    const bump =
      1 +
      0.07 * Math.sin(dir.x * 2.4 + seed) * Math.cos(dir.y * 1.9 + seed * 1.7) +
      0.045 * Math.sin(dir.y * 3.2 + seed * 2.1) * Math.cos(dir.z * 2.6 + seed);
    v.multiplyScalar(bump);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function PeopleField3D({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.z = 9;

    // Real environment reflections without an external HDRI — three's
    // own RoomEnvironment gives the glass material soft, plausible
    // highlights and reflections to pick up (a physical material with
    // no environment map at all reads as flat plastic, not glass).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRoom = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envRoom, 0.04).texture;
    scene.environment = envTexture;

    const group = new THREE.Group();
    scene.add(group);

    // ---- lighting ----
    // Three-point rig, tuned for the new opaque/reflective material
    // (see below) rather than transmission — reflections are the whole
    // job now, so light direction and contrast matter more than before.
    const fillLight = new THREE.HemisphereLight(0x8a6cff, 0x140a33, 1.1);
    scene.add(fillLight);
    // Warm key light for real specular highlights across each gem.
    const keyLight = new THREE.DirectionalLight(0xfff2df, 1.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    // Cool rim light from behind/below — the piece that was missing
    // before: without it, the gems' far edge had no separation from the
    // dark background and lost their silhouette. A classic three-point
    // addition, not a decorative extra.
    const rimLight = new THREE.DirectionalLight(0x7c8fff, 0.9);
    rimLight.position.set(-4, -2.5, -3.5);
    scene.add(rimLight);
    // Arrival light — dark until the cluster window, then blooms into
    // a warm ember glow at the cluster point, the same payoff
    // ClusterGlow gives the 2D layer, but here it's a real light
    // casting on every nearby gem rather than a flat sprite.
    const arrivalLight = new THREE.PointLight(COLOR_EMBER, 0, 14, 2);
    arrivalLight.position.copy(CLUSTER_POINT);
    scene.add(arrivalLight);

    // ---- ambient field: sparse polished gems, not a particle cloud ----
    interface AmbientObj {
      mesh: THREE.Mesh;
      geometry: THREE.BufferGeometry;
      material: THREE.MeshPhysicalMaterial;
      basePos: THREE.Vector3;
      phase: number;
      spin: number;
    }
    const ambient: AmbientObj[] = [];
    const placed: THREE.Vector3[] = [];
    // Rejection-sample each position: clear of the cluster point (see
    // CLUSTER_EXCLUSION_RADIUS) and reasonably spaced from every gem
    // already placed. Plain Math.random() scatter was landing gems
    // right on top of each other often enough, at only 18 draws, to
    // read as clumps rather than a deliberate sparse field — this
    // keeps the same organic randomness but rules out the worst
    // overlaps without hand-placing every point.
    function samplePosition(): THREE.Vector3 {
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const candidate = new THREE.Vector3(
          (Math.random() - 0.5) * FIELD_WIDTH,
          (Math.random() - 0.5) * FIELD_HEIGHT,
          (Math.random() - 0.5) * FIELD_DEPTH,
        );
        if (candidate.distanceTo(CLUSTER_POINT) < CLUSTER_EXCLUSION_RADIUS) continue;
        const tooClose = placed.some((p) => p.distanceTo(candidate) < 2.2);
        if (tooClose) continue;
        return candidate;
      }
      // Fall back to whatever the last attempt produced rather than
      // looping forever — a single close pair is a minor imperfection,
      // not worth blocking scene setup over.
      return new THREE.Vector3(
        (Math.random() - 0.5) * FIELD_WIDTH,
        (Math.random() - 0.5) * FIELD_HEIGHT,
        (Math.random() - 0.5) * FIELD_DEPTH,
      );
    }
    for (let i = 0; i < AMBIENT_COUNT; i += 1) {
      const seed = i * 1.37 + 0.5;
      const geometry = createGemGeometry(seed);
      const color = AMBIENT_PALETTE[i % AMBIENT_PALETTE.length]!;
      // STEP 55: `transmission` (see-through glass) is removed outright,
      // not retuned. Three.js renders transmission by resampling
      // whatever's already been drawn behind each mesh that frame —
      // with a transparent WebGL canvas layered over a CSS gradient
      // (nothing three.js itself has drawn there) and more than a
      // dozen overlapping transmissive meshes, that resampling is what
      // was producing the mottled, staticky, wrong-colored surface
      // in the screenshot — a rendering artifact, not a material
      // choice that needed retuning. This material is fully opaque
      // instead: metalness+roughness+clearcoat lit by a proper
      // three-point rig and a PMREM environment map, which is a far
      // more robust recipe for "looks genuinely 3D and premium" than
      // real-time transmission at this shape count ever was.
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.12,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        ior: 1.6,
        envMapIntensity: 2.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const basePos = samplePosition();
      placed.push(basePos);
      mesh.position.copy(basePos);
      const scale = 0.09 + Math.random() * 0.12;
      mesh.scale.setScalar(scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(mesh);
      ambient.push({ mesh, geometry, material, basePos, phase: Math.random() * Math.PI * 2, spin: 0.05 + Math.random() * 0.08 });
    }

    // ---- the three named travelers ----
    // Larger, more saturated gems than the ambient field so Priya/Sarah/
    // Alex stay the clear focal points as they converge. `transparent` +
    // `opacity` are kept here (unlike the ambient field) purely to fade
    // each traveler in as it starts moving — plain alpha blending, not
    // transmission, so it doesn't carry the same artifact risk.
    const travelerGeometry = createGemGeometry(9.4);
    const travelers = TRAVELERS.map((t, i) => {
      const material = new THREE.MeshPhysicalMaterial({
        color: t.color,
        metalness: 0.15,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        ior: 1.6,
        envMapIntensity: 2.6,
        emissive: t.color,
        emissiveIntensity: 0.06,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(travelerGeometry, material);
      mesh.position.copy(t.start);
      mesh.scale.setScalar(0.001);
      group.add(mesh);
      return { def: t, mesh, material, phase: i * 2.1 };
    });

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
    let elapsed = 0;
    function tick() {
      // STEP 65 (final polish — slow everything down a little so the
      // motion reads clearly instead of busy): elapsed now accumulates
      // at ~0.55x its previous rate, which proportionally slows every
      // elapsed-driven drift/pulse below it in one place. Per-frame
      // rotation increments aren't gated by elapsed, so those are
      // separately scaled by the same ~0.55x just below.
      elapsed += 0.0033;
      const progress = scrollYProgress.get();

      // Ambient gems drift and slowly tumble on independent loops — a
      // living field, not a static one, but never enough motion to
      // read as busy the way the old particle count did.
      ambient.forEach((a) => {
        a.mesh.position.y = a.basePos.y + Math.sin(elapsed * 0.4 + a.phase) * 0.25;
        a.mesh.position.x = a.basePos.x + Math.cos(elapsed * 0.3 + a.phase) * 0.18;
        a.mesh.rotation.x += a.spin * 0.0055;
        a.mesh.rotation.y += a.spin * 0.0077;
      });

      const arrivalT = windowT(progress, [CLUSTER_START, CLUSTER_END]);
      arrivalLight.intensity = Math.sin(Math.min(arrivalT, 1) * Math.PI) * 6.5;

      travelers.forEach(({ def, mesh, material, phase }) => {
        const t = ease(windowT(progress, def.window));
        mesh.position.lerpVectors(def.start, CLUSTER_POINT, t);
        const arrived = progress >= def.window[1];
        // Scale in as the traveler starts moving (a glass form growing
        // into being reads more natural than a hard-edged fade), settle
        // to a slightly smaller resting scale once arrived so it
        // recedes behind the 2D marks that take over visually there.
        const targetScale = t <= 0 ? 0.001 : arrived ? 0.28 : 0.4 + 0.03 * Math.sin(elapsed * 2.4 + phase);
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.12));
        material.opacity = t <= 0 ? 0 : arrived ? 0.85 : 0.96;
        mesh.rotation.y += 0.0022;
        mesh.rotation.x += 0.0014;
      });

      // Slow, subtle camera drift tied to scroll — never a spin, just
      // enough to sell real depth and let the environment reflections
      // shift believably across the glass surfaces as the visitor moves.
      group.rotation.y = progress * 0.16;
      camera.position.x = Math.sin(progress * Math.PI) * 0.4;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      ambient.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      travelerGeometry.dispose();
      travelers.forEach(({ material }) => material.dispose());
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, scrollYProgress]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
