import { PersistentNav } from '@/components/nav/PersistentNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import { Chapter01Conversation } from '@/components/chapters/Chapter01Conversation';
import { ChapterPhilosophy } from '@/components/chapters/ChapterPhilosophy';
import { Chapter02Disassembly } from '@/components/chapters/Chapter02Disassembly';
import { Chapter03Organize } from '@/components/chapters/Chapter03Organize';
import { Chapter05People } from '@/components/chapters/Chapter05People';
import { Chapter06Ecosystem } from '@/components/chapters/Chapter06Ecosystem';
import { Chapter04Workspace } from '@/components/chapters/Chapter04Workspace';
import { Chapter08GiveItTheWork } from '@/components/chapters/Chapter08GiveItTheWork';
import { ChapterProductPreview } from '@/components/chapters/ChapterProductPreview';
import { Chapter07Scale } from '@/components/chapters/Chapter07Scale';
import { ChapterFinalCTA } from '@/components/chapters/ChapterFinalCTA';

// Step 2, substep 2 — reordered to the brief's 12-section flow:
// Hero -> Philosophy -> Understand -> Organize -> Coordinate ->
// Connect -> Keep Moving -> Interactive Demo -> Pricing -> Footer.
// Every chapter keeps its own id/component name (chapter-02 is still
// "Understand" etc.) — only the DOM order changed, so nothing that
// targets these ids by name (nav anchors, ScrollProgressRail) breaks.
// Dedicated Product Preview + Final CTA sections are a later substep;
// Ch.07 (Pricing) and Ch.08 (Interactive Demo) already carry that
// content for now.
export default function Home() {
  return (
    <main id="main-content">
      <PersistentNav />
      <Chapter01Conversation />
      <ChapterPhilosophy />
      <Chapter02Disassembly />
      <Chapter03Organize />
      <Chapter05People />
      <Chapter06Ecosystem />
      <Chapter04Workspace />
      <Chapter08GiveItTheWork />
      <ChapterProductPreview />
      <Chapter07Scale />
      <ChapterFinalCTA />
      <SiteFooter />
    </main>
  );
}
