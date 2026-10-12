# Step 1.2 — Existing Website Inventory + Reference Mapping (audit only; no source changed)

Exact text baseline: see REDESIGN-CONTENT-SNAPSHOT.md (generated from source; heuristic, may miss strings held in data constants such as lib/signalExtraction.ts; will be re-checked in Step 11.6).

## Single page, section order (src/app/page.tsx)
| # | Component | Anchor | Scroll height | Visual engine | Key existing text (exact) | Closest reference section |
|---|-----------|--------|---------------|---------------|---------------------------|---------------------------|
| 0 | PersistentNav | — | fixed | CSS | "Login", "Try it" (aria "Try AI Workflow Coordinator") | Header nav |
| 1 | Chapter01Conversation | #chapter-01 | ~400dvh | Hero3D | Typed request, words "Sarah", "Friday", "high priority"; "AI Workflow Coordinator"; "Alex · 9:41 AM"; "Scroll" | Hero (headline left, glowing 3D focal object, floating message/task cards) |
| 2 | Chapter02Disassembly | #chapter-02 | 340dvh | SVG/CSS | "A request is more than a sentence." / "People, timing, urgency and work can be understood without forcing the person to structure the request first." | "From conversation to completion" workflow card strip |
| 3 | Chapter03Organize | #chapter-03 | 380dvh | Organize3D | "The work finds its own place." / "No folders to file into, no tags to remember — every new request recognizes what it already belongs with." / "Understanding isn't the end." / "Related work finds its group. Now it needs somewhere real to live." | Feature showcase (large 3D object left, text right) |
| 4 | Chapter04Workspace | #chapter-04 | 460dvh | CSS/DOM board | Board: To Do, In Progress, Completed, Cancelled; "Launch Checklist", quote "Sarah finished the onboarding docs. Can she review the launch checklist tomorrow?" | Hero's Task Detected / Tasks panels (dark glass product cards) |
| 5 | Chapter05People | #chapter-05 | long | PeopleField3D | "Work finds the people who move it forward." / The human network (Priya, Sarah, Alex) | Feature list with circular orange icons + glowing 3D |
| 6 | Chapter06Ecosystem | #chapter-06 | long | EcosystemDepth3D | "The work doesn't live in one place. Your workflow doesn't have to either." Slack, Email, Microsoft Teams, Jira, Notion, Trello | Integration strip + hero floating app icons |
| 7 | Chapter07Scale | #chapter-07 (data-theme=dark) | 520dvh | ScaleDepth3D | "More work. Not more chaos." / "One workspace · 7-day free trial" | "Intelligent Workflows" cinematic orb / large visual |
| 8 | Chapter08GiveItTheWork | #chapter-08 | long | DOM + 3D backdrop | "Give the coordinator something to organize." / textarea / "Extract structured work" / "That's the idea." / "Try the real coordinator" / "7-day free trial · $20/month per workspace" | Final CTA (glowing orb, orange CTA) |
| 9 | SiteFooter | — | — | CSS | "One place for the work that was scattered across a dozen tools and threads." Start free trial / Login / Back to top | Multi-column footer |

## Reference sections with NO existing counterpart (will NOT be created, per content lock)
Case studies (metrics), "From Idea to Impact" process timeline, Tech stack grid, Testimonials, FAQ, Services cards, newsletter form. The reference's fictional text/stats/logos (FlowMind, Microsoft, Figma, +320%, etc.) are never used.

## Functional components (must keep working)
- Nav/footer/Ch08 CTAs: getSignupUrl()/getLoginUrl() from lib/env.ts (NEXT_PUBLIC_APP_URL).
- Ch08 interactive extractor (textarea, extract, copy-to-clipboard, state machine).
- Ch01 signal extraction + word recognition (lib/signalExtraction.ts), nav visibility store (lib/navStore.ts), Ch04 MiniTaskBoard (dnd-kit), skip link, scroll progress rail, custom cursor.
- Every chapter has a static fallback for mobile/reduced-motion.

## Existing visual inconsistencies / risks noted
- Light "paper" palette + red accent vs reference black/orange: full token inversion needed; Ch07 already has a dark family to build on.
- Many hardcoded rgba()/inline values inside chapters (e.g. Ch04 rgba(243,239,231,…)) bypass tokens — to be tokenised in Phase 2.
- Pinned scenes (340–520dvh) differ from the reference's compact stacked rhythm; the reference's vertical rhythm can only be approximated unless sections are restructured (allowed only "if strictly necessary").
- layout.tsx themeColor is #faf7f1 (light) and OG images likely light-themed: to update with the palette.
