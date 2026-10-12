'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useReducedMotion } from 'framer-motion';

/**
 * Organize3D — a real WebGL 3D element for Chapter 03.
 *
 * STEP 40, fourth pass on explicit follow-up ("still some of the
 * elements are touching panels"). Step 39 fixed the depth-perspective
 * bug but still used hand-measured percentage guesses for where the
 * subheading, panel row, and closing line actually sit — and those
 * guesses were still off enough that cards reached the panels. Rather
 * than guess a fourth time, this version MEASURES the real rendered
 * positions: Chapter03Organize.tsx passes down refs to the title
 * block, an invisible div matching the panel row's true bounds, and
 * the closing block, and this component reads their actual
 * getBoundingClientRect() after mount to compute the two safe gaps.
 * If a ref isn't provided or the measured gap comes out too small to
 * safely hold anything (short viewport, unusual zoom), that band is
 * simply left empty rather than forcing an overlap.
 *
 * OPT-OUTS: same precedent as Hero3D — skipped under
 * prefers-reduced-motion, and fails silently if WebGL is unavailable.
 */

const CARD_COUNT = 12;
const ACCENT_COUNT = 3;

const CAMERA_FOV = 45;
const CAMERA_Z = 10;
const HALF_FOV_RAD = (CAMERA_FOV / 2) * (Math.PI / 180);

// Extra breathing room added beyond each measured element's own
// edge, and the minimum gap size worth populating at all.
const GAP_MARGIN_FRACTION = 0.035;
const MIN_GAP_FRACTION = 0.05;

/**
 * Screen-fraction → world-Y, aware of a card's actual depth. A
 * perspective camera's visible vertical extent grows with distance,
 * so a card sitting further back needs a different Y than one
 * sitting closer to land at the same on-screen position — this takes
 * each card's own z into account rather than assuming z=0 for all.
 */
function bandY(fraction: number, z: number) {
  const effHalfHeight = (CAMERA_Z - z) * Math.tan(HALF_FOV_RAD);
  return effHalfHeight * (1 - 2 * fraction);
}

// Reduced from the first pass's ±2.2 so depth stays a subtle
// parallax rather than something that needs to be compensated hard.
const Z_SPREAD = 1.2;

// Mirrors tokens.css — WebGL needs real color values (see Hero3D's own note on this).
const COLOR_SURFACE = 0x1d1812;
const COLOR_SURFACE_SIDE = 0x0e0b08;
const COLOR_INK_MUTED = 0x9a8c7a;
const COLOR_RED = 0xff7900;
const COLOR_GOLD = 0xffb347;

function roundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  return shape;
}

/** Soft radial-gradient sprite used behind each card as a stand-in for a drop shadow / ambient glow — cheap, no post-processing needed. */
function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Soft dark radial-gradient sprite used as a grounding contact shadow — separate from the light glow above, since a shadow needs normal (darkening) blending rather than additive. This is most of what sells a card as "resting in space" rather than pasted flat. */
function makeShadowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(22,21,26,0.55)');
    gradient.addColorStop(1, 'rgba(22,21,26,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Organize3D({
  titleRef,
  panelRowRef,
  closingRef,
}: {
  titleRef?: RefObject<HTMLDivElement | null>;
  panelRowRef?: RefObject<HTMLDivElement | null>;
  closingRef?: RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    // ---- measure the real gaps before placing anything ----
    // See file header: this replaces a third round of hand-guessed
    // percentages with the actual rendered positions.
    function fractionOf(rect: DOMRect | null, containerRect: DOMRect, edge: 'top' | 'bottom') {
      if (!rect || containerRect.height === 0) return null;
      const px = edge === 'top' ? rect.top : rect.bottom;
      return (px - containerRect.top) / containerRect.height;
    }

    const containerRect = container.getBoundingClientRect();
    const titleBottom = fractionOf(titleRef?.current?.getBoundingClientRect() ?? null, containerRect, 'bottom');
    const panelTop = fractionOf(panelRowRef?.current?.getBoundingClientRect() ?? null, containerRect, 'top');
    const panelBottom = fractionOf(panelRowRef?.current?.getBoundingClientRect() ?? null, containerRect, 'bottom');
    const closingTop = fractionOf(closingRef?.current?.getBoundingClientRect() ?? null, containerRect, 'top');

    function safeGap(lo: number | null, hi: number | null): [number, number] | null {
      if (lo === null || hi === null) return null;
      const a = lo + GAP_MARGIN_FRACTION;
      const b = hi - GAP_MARGIN_FRACTION;
      if (b - a < MIN_GAP_FRACTION) return null;
      return [a, b];
    }

    const topGap = safeGap(titleBottom, panelTop);
    const bottomGap = safeGap(panelBottom, closingTop);
    // If neither gap could be measured (e.g. refs not passed), there's
    // nothing safe to place cards into — skip the scene entirely
    // rather than fall back to a guess that has already been wrong
    // three times.
    if (!topGap && !bottomGap) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
    camera.position.z = CAMERA_Z;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Soft environment reflections so the dark metal cards catch highlights
    // (same approach as the other scenes; no external HDRI).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.5;
    container.appendChild(renderer.domElement);

    // ---- lights: gives MeshStandardMaterial something to shade against ----
    scene.add(new THREE.AmbientLight(0xffd9b0, 0.55));
    const keyLight = new THREE.DirectionalLight(0xfff0dc, 1.3);
    keyLight.position.set(-4, 6, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffa860, 0.4);
    fillLight.position.set(5, -3, 4);
    scene.add(fillLight);
    // Faint warm rim light from behind/below, so a rotating card's
    // trailing edge catches a highlight instead of going flat dark —
    // this is most of what reads as "real object" rather than
    // "cutout" once the card turns away from the key light.
    const rimLight = new THREE.DirectionalLight(0xff7a1a, 1.1);
    rimLight.position.set(2, -6, -6);
    scene.add(rimLight);

    const cardShape = roundedRectShape(1.5, 0.95, 0.16);
    const cardGeometry = new THREE.ExtrudeGeometry(cardShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
    });
    const edges = new THREE.EdgesGeometry(cardGeometry, 25);
    const glowTexture = makeGlowTexture();
    const shadowTexture = makeShadowTexture();

    const faceMaterial = new THREE.MeshStandardMaterial({
      color: COLOR_SURFACE,
      roughness: 0.45,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92,
    });
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: COLOR_SURFACE_SIDE,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92,
    });

    const availableBands = [topGap, bottomGap].filter((g): g is [number, number] => g !== null);

    const accentIndices = new Set<number>();
    while (accentIndices.size < ACCENT_COUNT) {
      accentIndices.add(Math.floor(Math.random() * CARD_COUNT));
    }

    interface CardEntry {
      group: THREE.Group;
      baseY: number;
      bobSpeed: number;
      bobOffset: number;
      spinSpeed: number;
    }
    const cards: CardEntry[] = [];

    for (let i = 0; i < CARD_COUNT; i += 1) {
      const isAccent = accentIndices.has(i);
      const group = new THREE.Group();

      // Cloned + slightly hue/lightness-jittered per card so the set
      // doesn't read as one stamped-out asset repeated — closer to
      // how real paper stock varies card to card.
      const faceMat = faceMaterial.clone();
      const faceColor = faceMat.color.clone();
      faceColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
      faceMat.color = faceColor;
      const sideMat = sideMaterial.clone();

      const mesh = new THREE.Mesh(cardGeometry, [faceMat, sideMat]);
      group.add(mesh);

      const edgeColor = isAccent ? (i % 2 === 0 ? COLOR_RED : COLOR_GOLD) : COLOR_INK_MUTED;
      const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: isAccent ? 0.95 : 0.55 });
      group.add(new THREE.LineSegments(edges, edgeMaterial));

      // Grounding contact shadow — sits behind and slightly below the
      // card, darkens rather than glows, so the card reads as resting
      // in light rather than pasted flat against the page.
      const shadowMaterial = new THREE.SpriteMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      const shadow = new THREE.Sprite(shadowMaterial);
      shadow.scale.set(2.6, 1.5, 1);
      shadow.position.set(0.12, -0.22, -0.4);
      group.add(shadow);

      // Soft glow/light-halo sprite sitting just behind the card.
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: isAccent ? edgeColor : 0xffb347,
        transparent: true,
        opacity: isAccent ? 0.4 : 0.14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.set(3.2, 2.4, 1);
      glow.position.z = -0.35;
      group.add(glow);

      // Place into one of the measured-safe gaps — see file header.
      // If only one band survived measurement, every card goes there
      // rather than forcing half of them into an unsafe spot.
      const band = availableBands[i % availableBands.length];
      if (!band) continue;
      const [fracLo, fracHi] = band;
      const x = (Math.random() * 2 - 1) * 6.2;
      const z = (Math.random() * 2 - 1) * Z_SPREAD;
      const fraction = fracLo + Math.random() * (fracHi - fracLo);
      const y = bandY(fraction, z);
      group.position.set(x, y, z);
      // Tilt kept modest — a steeply tilted card's rendered bounding
      // box grows well past its own footprint, which is exactly what
      // let cards poke into the text bands last time even with a
      // "safe" center position.
      group.rotation.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.15);
      const scale = 0.6 + Math.random() * 0.3;
      group.scale.setScalar(scale);

      scene.add(group);
      cards.push({
        group,
        baseY: y,
        bobSpeed: 0.22 + Math.random() * 0.22,
        bobOffset: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.06,
      });
    }

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
    // Render gate: stop drawing while scrolled off-screen or in a hidden tab.
    let gateVisible = true;
    let gateRunning = false;
    let t = 0;
    function tick() {
      t += 0.016;
      for (const c of cards) {
        c.group.position.y = c.baseY + Math.sin(t * c.bobSpeed + c.bobOffset) * 0.1;
        c.group.rotation.y += c.spinSpeed * 0.02;
      }
      renderer.render(scene, camera);
      gateRunning = gateVisible && !document.hidden;
      if (gateRunning) frameId = requestAnimationFrame(tick);
    }
    tick();
    const gateResume = () => {
      if (!gateRunning && gateVisible && !document.hidden) tick();
    };
    const gateObserver = new IntersectionObserver(([entry]) => {
      gateVisible = entry?.isIntersecting ?? true;
      gateResume();
    });
    gateObserver.observe(container);
    document.addEventListener('visibilitychange', gateResume);
    // Let the browser restore the WebGL context after a loss instead of staying blank.
    const onContextLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelAnimationFrame(frameId);
      gateObserver.disconnect();
      document.removeEventListener('visibilitychange', gateResume);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      resizeObserver.disconnect();
      cardGeometry.dispose();
      edges.dispose();
      faceMaterial.dispose();
      sideMaterial.dispose();
      glowTexture.dispose();
      shadowTexture.dispose();
      cards.forEach((c) => {
        c.group.children.forEach((child) => {
          if (child instanceof THREE.LineSegments || child instanceof THREE.Sprite || child instanceof THREE.Mesh) {
            const mat = child.material as THREE.Material | THREE.Material[];
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable containers; only prefersReducedMotion should re-run this setup.
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
