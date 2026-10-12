# Step 5.3 — Material quality
Audit result: Ch05 (PeopleField3D), Ch06 (EcosystemDepth3D), Ch07 (ScaleDepth3D) ALREADY use MeshPhysicalMaterial (metalness 0.12-0.78, roughness 0.12-0.35, clearcoat/emissive accents), a PMREM RoomEnvironment reflection map, ACES tone mapping, fog and a 3-point warm rig (palette now orange since 4.1). Nothing to add there.
Gap fixed: Ch03 (Organize3D) cards, darkened in 5.1, had no environment map, so the metal could not catch highlights. Added a RoomEnvironment PMREM map (scene.environmentIntensity 0.5, disposed on cleanup). No new dependency (three/examples ships with three).
Not done: bevelled geometry on Ch03 cards (flat boxes) and contact shadows beyond the existing shadow sprites — would change geometry/perf; flag for 5.7 if wanted.
Checks: tsc, lint, build. Not screenshotted (WebGL).
