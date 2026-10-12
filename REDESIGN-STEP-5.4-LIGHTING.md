# Step 5.4 — Lighting review (no code change)
Per scene, against the plan's list (key / fill / orange rim / environment / restrained bloom / ambient / contact shadows):
- Ch01 Hero3D: unlit basic materials + additive halos (glow raised in 3.4). No lights needed.
- Ch03 Organize3D: warm ambient, warm key, warm fill, strong orange rim (5.1), RoomEnvironment reflections at 0.5 (5.3). No bloom. Contact-shadow sprite exists but is dark-on-black so effectively invisible; the amber halo sprite does the grounding.
- Ch05 PeopleField3D: hemisphere fill 0xFFA860/0x1A0E05, key 0xFFF2DF 1.4, rim 0xFF8A33 0.9, arrival point light, PMREM env (envMapIntensity 2.2-2.6). No bloom.
- Ch06 EcosystemDepth3D: same warm rig (fill 0.9 / key 1.0 / rim 0.6), travelling point light, fog 0x0D0B09, UnrealBloom strength 0.32 (+ pulse 0.22), threshold 0.82.
- Ch07 ScaleDepth3D: same rig (0.9 / 1.05 / 0.6), fog, bloom 0.30 threshold 0.8.
Verdict: all five already have a controlled warm rig and restrained bloom (<= ~0.54 peak, high thresholds so only emissive accents glow). Changing values blind, without seeing them on a GPU, risks washing out or darkening the scenes, so I changed nothing this step.
To tune on your side: Ch03 brightness = ambient 0.55 / env 0.5 in Organize3D.tsx; Ch05-07 rim = the 0xFF8A33 DirectionalLight intensity; bloom = UnrealBloomPass 1st number.
