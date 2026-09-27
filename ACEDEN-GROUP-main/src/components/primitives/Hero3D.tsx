'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useReducedMotion } from 'framer-motion';

/**
 * Hero3D — a genuine WebGL 3D element behind Chapter 01.
 *
 * STEP 2, SUBSTEP 5 — MATERIAL/LIGHTING REBUILD (real-object pass).
 * The node/line "request entering the system" concept and overall
 * composition are unchanged from the prior build; what changed is
 * everything about how it's actually rendered, because the earlier
 * version was flat MeshBasicMaterial dots with a fake additive-halo
 * "glow" — readable as exactly the generic-network cliche the brief
 * explicitly asks to avoid, not as something "physically believable"
 * or "beautifully lit." This rebuild brings Hero3D up to the same
 * real-material/real-light standard Chapters 05-07 already use:
 *
 *  - MeshPhysicalMaterial nodes (metalness/roughness/clearcoat) lit by
 *    a PMREM-generated RoomEnvironment, the same env-lighting rig
 *    PeopleField3D/EcosystemDepth3D/ScaleDepth3D all already use, so
 *    every node now has a real specular highlight and reflection
 *    instead of being a flat-shaded sphere.
 *  - A proper 3-point light rig (hemisphere fill + key + rim), tuned
 *    for THIS scene's light-paper backdrop rather than copying the
 *    dark chapters' rig verbatim — warmer, lower-contrast, so the
 *    nodes read against paper instead of looking lit for a black room.
 *  - A real UnrealBloomPass (EffectComposer) on the accent nodes'
 *    emissive glow, replacing the old fake halo-sphere trick.
 *
 * Same opt-outs as before: skipped under prefers-reduced-motion
 * (HeroGlow's static gradient still carries the moment for those
 * visitors), and fails silently if WebGL isn't available.
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

    // ---- environment lighting (real reflections for the physical materials below) ----
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRoom = new RoomEnvironment();
    const envTexture = pmrem.fromScene(envRoom, 0.045).texture;
    scene.environment = envTexture;

    // ---- 3-point rig, tuned warm/low-contrast for a light paper backdrop
    // (Chapters 05-07's violet/ember rig is built for a near-black room —
    // copying it here would light these nodes as if for a dark scene). ----
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xd8d2c4, 0.9));
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffe8c2, 0.5);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // ---- bloom (real post-processing, replaces the old fake halo-sphere hack) ----
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.55, 0.86);
    composer.addPass(bloomPass);

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

    const nodeGeometry = new THREE.SphereGeometry(0.075, 20, 20);
    const materials: THREE.Material[] = [];
    positions.forEach((pos, i) => {
      const isAccent = accentIndices.has(i);
      const color = isAccent ? (i % 2 === 0 ? COLOR_RED : COLOR_GOLD) : COLOR_INK_MUTED;
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: isAccent ? 0.35 : 0.15,
        roughness: isAccent ? 0.22 : 0.55,
        clearcoat: isAccent ? 0.85 : 0.3,
        clearcoatRoughness: 0.2,
        envMapIntensity: isAccent ? 1.4 : 0.8,
        emissive: isAccent ? color : 0x000000,
        emissiveIntensity: isAccent ? 0.65 : 0,
        transparent: true,
        opacity: isAccent ? 1 : 0.8,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.copy(pos);
      group.add(mesh);
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
    const lineMaterial = new THREE.LineBasicMaterial({ color: COLOR_LINE, transparent: true, opacity: 0.18 });
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
      composer.setSize(clientWidth, clientHeight);
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
      composer.render();
      frameId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (fine) window.removeEventListener('mousemove', handlePointerMove);
      nodeGeometry.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      materials.forEach((m) => m.dispose());
      envTexture.dispose();
      pmrem.dispose();
      composer.dispose();
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
