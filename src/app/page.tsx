import { PersistentNav } from '@/components/nav/PersistentNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import { Chapter01Conversation } from '@/components/chapters/Chapter01Conversation';
import { Chapter02Disassembly } from '@/components/chapters/Chapter02Disassembly';
import { Chapter03Organize } from '@/components/chapters/Chapter03Organize';
import { Chapter04Workspace } from '@/components/chapters/Chapter04Workspace';
import { Chapter05People } from '@/components/chapters/Chapter05People';
import { Chapter06Ecosystem } from '@/components/chapters/Chapter06Ecosystem';
import { Chapter07Scale } from '@/components/chapters/Chapter07Scale';
import { Chapter08GiveItTheWork } from '@/components/chapters/Chapter08GiveItTheWork';

export default function Home() {
  return (
    <main id="main-content">
      <PersistentNav />
      <Chapter01Conversation />
      <Chapter02Disassembly />
      <Chapter03Organize />
      <Chapter04Workspace />
      <Chapter05People />
      <Chapter06Ecosystem />
      <Chapter07Scale />
      <Chapter08GiveItTheWork />
      <SiteFooter />
    </main>
  );
}
