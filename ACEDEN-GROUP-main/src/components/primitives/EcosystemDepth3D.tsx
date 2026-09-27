'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useReducedMotion, type MotionValue } from 'framer-motion';

/**
 * EcosystemDepth3D — Chapter 06's 3D layer.
 *
 * ----------------------------------------------------------------
 * STEP 60 (rebuild — "not even similar to Chapter 05"): everything
 * before this step used the same shape family as Chapter 05's
 * PeopleField3D — deformed-icosahedron "gems," round point dust.
 * Direct feedback after seeing it live: that reads as the same 3D
 * language as Chapter 05 regardless of the code being separate, and
 * the previous bloom pass blew those round gems out into plain glowing
 * balls on top of it. Both problems are fixed by throwing out every
 * round/organic shape in this file, not by tuning bloom further.
 *
 * NEW SHAPE LANGUAGE — a circuit/light-tube network, chosen because
 * Chapter 06 is literally about systems being wired together:
 *   - Every solid object in this scene is hexagonal-prism-based (a
 *     flat "chip" cross-section) or tube-based (a "conduit" cross-
 *     section that is itself a 6-sided tube, not round) — never a
 *     sphere, never an organic bumped-icosahedron "gem."
 *   - Ambient dust is thin glowing filament rods, not round points.
 *   - The six real systems are flat hex chips with a glowing wire-
 *     frame rim (THREE.EdgesGeometry), not lit gems.
 *   - Each hop between systems draws a hex-cross-section conduit
 *     tube along the exact same curve the 2D NetworkHop line uses,
 *     arcing through real Z mid-hop, with a small hex "packet" chip
 *     riding along it — the 3D transition is the conduit lighting up
 *     and the packet traveling through it, not a gem flying a path.
 * Same rule as before still applies and is still true here: §12 —
 * the six systems and this layer's ambient chips never move into one
 * cluster; positions only drift, staying spread across the viewport.
 *
 * DRIVEN BY SCROLL, NOT AN INTERNAL CLOCK: reads scrollYProgress.get()
 * every frame, same as before — scrubbable and reversible.
 *
 * OPT-OUTS: skipped entirely under prefers-reduced-motion (FieldTexture's
 * AmbientOrbs+SecondaryGrid still carry the chapter's atmosphere for
 * these visitors). Fails gracefully, silently, if WebGL isn't
 * available. Never captures pointer events.
 *
 * Fog (matched to --color-surface-dark) and a bloom pass both carry
 * over from Step 59, recalibrated (lower strength, higher threshold)
 * for the new, less reflective hex/metal materials so nothing blows
 * out to flat white the way the round gems did.
 */

const FILAMENT_COUNT = 200;
const ACCENT_COUNT = 14;
const FIELD_WIDTH = 16;
const FIELD_HEIGHT = 9;
const FIELD_DEPTH = 6;

const COLOR_INK_MUTED = 0x9a948c;
const COLOR_INK = 0xf3efe7;
const COLOR_RED = 0xe2493d;
const COLOR_GOLD = 0xd98e2b;
const COLOR_VIOLET = 0x7c4dff;

// The ambient chip layer: sparse on purpose — atmosphere behind six
// named systems, not a second thing competing for attention.
const CHIP_COUNT = 9;
const CHIP_PALETTE = [COLOR_INK, COLOR_INK, COLOR_VIOLET, COLOR_INK, COLOR_GOLD];

/** A flat hexagonal-prism "chip" — the base shape for every solid
 * object in this layer (ambient chips, system anchors, hop packets).
 * radius controls the hex face size, depth is how thick the chip is
 * front-to-back once rotated to face the camera. */
function createChipGeometry(radius: number, depth: number): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radius, radius, depth, 6, 1);
}

function pulseFactor(progress: number, windows: [number, number][]): number {
  for (const [a, b] of windows) {
    if (progress < a) continue;
    if (progress <= b) {
      const mid = (a + b) / 2;
      const t = progress <= mid ? (progress - a) / (mid - a || 1) : 1 - (progress - mid) / (b - mid || 1);
      return Math.max(0, Math.min(1, t));
    }
  }
  return 0;
}

interface SystemAnchor {
  id: string;
  base: { x: number; y: number };
  drift: { x: number; y: number };
  revealStart: number;
  revealEnd: number;
  pulseWindows: [number, number][];
  color: number;
}

interface HopDef {
  from: { x: number; y: number };
  to: { x: number; y: number };
  ctrl: { x: number; y: number };
  drawWindow: [number, number];
}

function windowT(progress: number, [a, b]: [number, number]): number {
  if (progress <= a) return 0;
  if (progress >= b) return 1;
  return (progress - a) / (b - a);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}
function ease(t: number) {
  return t * t * (3 - 2 * t);
}

export function EcosystemDepth3D({
  scrollYProgress,
  pulseWindows,
  systems,
  hops,
  breakStart,
  breakEnd,
}: {
  scrollYProgress: MotionValue<number>;
  pulseWindows: [number, number][];
  systems: SystemAnchor[];
  hops: HopDef[];
  breakStart: number;
  breakEnd: number;
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
    scene.fog = new THREE.Fog(0x121116, 6, 15);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 9;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRoom = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envRoom, 0.04).texture;
    scene.environment = envTexture;

    const fillLight = new THREE.HemisphereLight(0x8a6cff, 0x140a33, 0.9);
    scene.add(fillLight);
    const keyLight = new THREE.DirectionalLight(0xfff2df, 1.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x7c8fff, 0.6);
    rimLight.position.set(-4, -2, -3.5);
    scene.add(rimLight);
    // Follows whichever hop packet is currently traveling its conduit.
    const travelLight = new THREE.PointLight(COLOR_RED, 0, 10, 2);
    scene.add(travelLight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Recalibrated from Step 59: lower strength, higher threshold —
    // the flat hex/metal chips are far less reflective than the old
    // clearcoat gems were, so bloom needs to work harder to find
    // anything to catch (mainly the glowing rim edges and packets)
    // instead of the whole scene blowing out to white.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.5, 0.82);
    composer.addPass(bloomPass);

    const group = new THREE.Group();
    scene.add(group);

    // ---- ambient filaments: thin glowing rods, replacing round dust
    // points entirely — a field of short light-strands, never spheres.
    const accentIndices = new Set<number>();
    while (accentIndices.size < ACCENT_COUNT) {
      accentIndices.add(Math.floor(Math.random() * FILAMENT_COUNT));
    }
    const filamentGeometry = new THREE.CylinderGeometry(0.006, 0.006, 1, 5, 1);
    const filaments: THREE.Mesh[] = [];
    const filamentBaseOpacities: number[] = [];
    const filamentPhases: number[] = [];
    for (let i = 0; i < FILAMENT_COUNT; i += 1) {
      const isAccent = accentIndices.has(i);
      const color = isAccent ? (i % 2 === 0 ? COLOR_RED : COLOR_GOLD) : COLOR_INK_MUTED;
      const baseOpacity = isAccent ? 0.55 : 0.22;
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: baseOpacity });
      const mesh = new THREE.Mesh(filamentGeometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * FIELD_WIDTH,
        (Math.random() - 0.5) * FIELD_HEIGHT,
        (Math.random() - 0.5) * FIELD_DEPTH,
      );
      mesh.scale.set(1, 0.12 + Math.random() * 0.22, 1);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(mesh);
      filaments.push(mesh);
      filamentBaseOpacities.push(baseOpacity);
      filamentPhases.push(Math.random() * Math.PI * 2);
    }

    // ---- ambient chips: sparse, flat hex panels with a glowing wire
    // rim — the substance layer, spread across the same flat volume
    // the filaments use (never a cluster), spaced apart via rejection
    // sampling.
    interface ChipObj {
      group: THREE.Group;
      panelGeometry: THREE.BufferGeometry;
      panelMaterial: THREE.MeshPhysicalMaterial;
      rimGeometry: THREE.BufferGeometry;
      rimMaterial: THREE.LineBasicMaterial;
      basePos: THREE.Vector3;
      phase: number;
      spin: number;
      baseEnvIntensity: number;
    }
    const chips: ChipObj[] = [];
    const chipPositions: THREE.Vector3[] = [];
    function sampleChipPosition(): THREE.Vector3 {
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const candidate = new THREE.Vector3(
          (Math.random() - 0.5) * FIELD_WIDTH,
          (Math.random() - 0.5) * FIELD_HEIGHT,
          (Math.random() - 0.5) * FIELD_DEPTH,
        );
        const tooClose = chipPositions.some((p) => p.distanceTo(candidate) < 2.6);
        if (tooClose) continue;
        return candidate;
      }
      return new THREE.Vector3(
        (Math.random() - 0.5) * FIELD_WIDTH,
        (Math.random() - 0.5) * FIELD_HEIGHT,
        (Math.random() - 0.5) * FIELD_DEPTH,
      );
    }
    for (let i = 0; i < CHIP_COUNT; i += 1) {
      const color = CHIP_PALETTE[i % CHIP_PALETTE.length]!;
      const scale = 0.42 + Math.random() * 0.3;
      const panelGeometry = createChipGeometry(0.5, 0.1);
      const baseEnvIntensity = 1.1;
      const panelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1c1a22,
        metalness: 0.75,
        roughness: 0.3,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25,
        envMapIntensity: baseEnvIntensity,
      });
      const rimGeometry = new THREE.EdgesGeometry(panelGeometry);
      const rimMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
      const chipGroup = new THREE.Group();
      chipGroup.add(new THREE.Mesh(panelGeometry, panelMaterial));
      chipGroup.add(new THREE.LineSegments(rimGeometry, rimMaterial));
      chipGroup.rotation.x = Math.PI / 2;
      const basePos = sampleChipPosition();
      chipPositions.push(basePos);
      chipGroup.position.copy(basePos);
      chipGroup.scale.setScalar(scale);
      group.add(chipGroup);
      chips.push({
        group: chipGroup,
        panelGeometry,
        panelMaterial,
        rimGeometry,
        rimMaterial,
        basePos,
        phase: Math.random() * Math.PI * 2,
        spin: 0.03 + Math.random() * 0.05,
        baseEnvIntensity,
      });
    }

    // ---- system anchors: one hex chip per real system, at that
    // system's own field position, revealed on that system's own
    // window — never a logo, never all six appearing together.
    interface AnchorObj {
      def: SystemAnchor;
      group: THREE.Group;
      panelGeometry: THREE.BufferGeometry;
      panelMaterial: THREE.MeshPhysicalMaterial;
      rimGeometry: THREE.BufferGeometry;
      rimMaterial: THREE.LineBasicMaterial;
      baseEnvIntensity: number;
      targetScale: number;
    }
    function pctToWorld(pt: { x: number; y: number }, z: number): THREE.Vector3 {
      return new THREE.Vector3((pt.x / 100 - 0.5) * FIELD_WIDTH, -(pt.y / 100 - 0.5) * FIELD_HEIGHT, z);
    }
    const anchorPanelGeometry = createChipGeometry(0.5, 0.1);
    const anchors: AnchorObj[] = systems.map((def, i) => {
      const baseEnvIntensity = 1.3;
      const panelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x201d26,
        metalness: 0.78,
        roughness: 0.24,
        clearcoat: 0.5,
        clearcoatRoughness: 0.18,
        envMapIntensity: baseEnvIntensity,
        emissive: def.color,
        emissiveIntensity: 0.04,
        transparent: true,
        opacity: 0,
      });
      const anchorRimGeometry = new THREE.EdgesGeometry(anchorPanelGeometry);
      const rimMaterial = new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 0 });
      const anchorGroup = new THREE.Group();
      anchorGroup.add(new THREE.Mesh(anchorPanelGeometry, panelMaterial));
      anchorGroup.add(new THREE.LineSegments(anchorRimGeometry, rimMaterial));
      anchorGroup.rotation.x = Math.PI / 2;
      // A slight forward-of-the-field z per anchor (not identical for
      // all six) so they read as sitting just in front of the ambient
      // layer, with a touch of their own depth variety.
      anchorGroup.position.copy(pctToWorld(def.base, 1.1 + (i % 3) * 0.35));
      anchorGroup.scale.setScalar(0.001);
      group.add(anchorGroup);
      return {
        def,
        group: anchorGroup,
        panelGeometry: anchorPanelGeometry,
        panelMaterial,
        rimGeometry: anchorRimGeometry,
        rimMaterial,
        baseEnvIntensity,
        targetScale: 0.62,
      };
    });

    // ---- hop conduits: one hex-cross-section tube per hop, tracing
    // the exact same curve the 2D signal line uses, arced through
    // real Z mid-hop — the conduit itself is the 3D transition, lit
    // up and faded by its own drawWindow, with a small hex packet
    // riding along it to sell the signal actually moving through it.
    interface ConduitObj {
      def: HopDef;
      curve: THREE.CatmullRomCurve3;
      tubeMesh: THREE.Mesh;
      tubeMaterial: THREE.MeshPhysicalMaterial;
      packetMesh: THREE.Mesh;
      packetMaterial: THREE.MeshPhysicalMaterial;
    }
    const packetGeometry = createChipGeometry(0.16, 0.06);
    const conduits: ConduitObj[] = hops.map((def) => {
      const from3D = pctToWorld(def.from, 0.4);
      const to3D = pctToWorld(def.to, 0.4);
      const mid3D = pctToWorld(def.ctrl, 2.5);
      const curve = new THREE.CatmullRomCurve3([from3D, mid3D, to3D]);
      const tubeGeometry = new THREE.TubeGeometry(curve, 48, 0.035, 6, false);
      const tubeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2a2530,
        metalness: 0.4,
        roughness: 0.35,
        emissive: COLOR_RED,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0,
      });
      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tubeMesh);

      const packetMaterial = new THREE.MeshPhysicalMaterial({
        color: COLOR_RED,
        metalness: 0.3,
        roughness: 0.2,
        emissive: COLOR_RED,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0,
      });
      const packetMesh = new THREE.Mesh(packetGeometry, packetMaterial);
      packetMesh.rotation.x = Math.PI / 2;
      group.add(packetMesh);

      return { def, curve, tubeMesh, tubeMaterial, packetMesh, packetMaterial };
    });

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

    // ---- render loop, driven by scrollYProgress each frame ----
    let frameId: number;
    let elapsed = 0;
    function tick() {
      // STEP 65 (final polish — slow motion down a little for clarity):
      // elapsed accumulates at ~0.55x its previous rate; the per-frame
      // rotation increments just below are scaled the same way since
      // they aren't gated by elapsed.
      elapsed += 0.0033;
      const progress = scrollYProgress.get();
      const pulse = pulseFactor(progress, pulseWindows);

      filaments.forEach((mesh, i) => {
        const breathe = 0.85 + 0.15 * Math.sin(elapsed + filamentPhases[i]!);
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = filamentBaseOpacities[i]! * breathe + pulse * 0.3;
      });

      chips.forEach((c) => {
        c.group.position.y = c.basePos.y + Math.sin(elapsed * 0.35 + c.phase) * 0.22;
        c.group.position.x = c.basePos.x + Math.cos(elapsed * 0.28 + c.phase) * 0.16;
        c.group.rotation.z += c.spin * 0.0055;
        // The synchronization payoff, in this layer: every chip's rim
        // flares slightly brighter during the same pulse windows the
        // six 2D system nodes already flash on.
        c.panelMaterial.envMapIntensity = c.baseEnvIntensity + pulse * 0.8;
        c.rimMaterial.opacity = 0.4 + pulse * 0.4;
      });

      anchors.forEach((a) => {
        const worldPos =
          progress <= breakStart
            ? pctToWorld(a.def.base, a.group.position.z)
            : progress >= breakEnd
              ? pctToWorld(a.def.drift, a.group.position.z)
              : pctToWorld(
                  {
                    x: lerp(a.def.base.x, a.def.drift.x, (progress - breakStart) / (breakEnd - breakStart)),
                    y: lerp(a.def.base.y, a.def.drift.y, (progress - breakStart) / (breakEnd - breakStart)),
                  },
                  a.group.position.z,
                );
        a.group.position.x = worldPos.x;
        a.group.position.y = worldPos.y;

        const revealT = ease(clamp01((progress - a.def.revealStart) / (a.def.revealEnd - a.def.revealStart || 1)));
        a.group.scale.setScalar(lerp(0.001, a.targetScale, revealT));
        a.group.rotation.z += 0.0025;

        const anchorPulse = pulseFactor(progress, a.def.pulseWindows);
        a.panelMaterial.opacity = 0.92 * revealT;
        a.panelMaterial.envMapIntensity = a.baseEnvIntensity + anchorPulse * 1.1;
        a.panelMaterial.emissiveIntensity = 0.04 + anchorPulse * 0.22;
        a.rimMaterial.opacity = (0.5 + anchorPulse * 0.5) * revealT;
      });

      // Each conduit fades in/out across its own drawWindow, and its
      // packet slides along the identical curve, oriented by the same
      // arc the 2D NetworkHop line already draws — a real 3D
      // transition riding along the real signal path. Only ever one
      // is in-window at a time (hops are sequential), so travelLight
      // simply follows whichever conduit is currently lit.
      let activeLightPos: THREE.Vector3 | null = null;
      let activeLightStrength = 0;
      conduits.forEach(({ curve, tubeMaterial, packetMesh, packetMaterial, def }) => {
        const t = windowT(progress, def.drawWindow);
        const envelope = t <= 0 || t >= 1 ? 0 : Math.min(1, t / 0.08, (1 - t) / 0.08);
        tubeMaterial.opacity = envelope * 0.6;
        tubeMaterial.emissiveIntensity = 0.4 + envelope * 0.6;

        const eased = ease(clamp01(t));
        const packetPos = curve.getPointAt(clamp01(eased));
        packetMesh.position.copy(packetPos);
        packetMesh.rotation.z += 0.0275;
        packetMaterial.opacity = envelope;

        if (envelope > activeLightStrength) {
          activeLightStrength = envelope;
          activeLightPos = packetPos;
        }
      });
      if (activeLightPos) {
        travelLight.position.copy(activeLightPos);
      }
      travelLight.intensity = activeLightStrength * 8;

      // Very slight parallax tied to scroll position, not a spin —
      // this is background atmosphere, never a hero object competing
      // for attention.
      group.rotation.y = progress * 0.25;

      bloomPass.strength = 0.32 + pulse * 0.22;

      composer.render();
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      filamentGeometry.dispose();
      filaments.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
      });
      chips.forEach((c) => {
        c.panelGeometry.dispose();
        c.panelMaterial.dispose();
        c.rimGeometry.dispose();
        c.rimMaterial.dispose();
      });
      anchorPanelGeometry.dispose();
      anchors.forEach((a) => {
        a.panelMaterial.dispose();
        a.rimGeometry.dispose();
        a.rimMaterial.dispose();
      });
      packetGeometry.dispose();
      conduits.forEach((c) => {
        c.tubeMesh.geometry.dispose();
        c.tubeMaterial.dispose();
        c.packetMaterial.dispose();
      });
      envTexture.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, scrollYProgress, pulseWindows, systems, hops, breakStart, breakEnd]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-90"
    />
  );
}
