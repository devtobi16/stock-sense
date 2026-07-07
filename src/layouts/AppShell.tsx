import { motion } from 'framer-motion';
import type { PageId } from '../types';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';

interface AppShellProps {
  activePage: PageId;
  onNavigate: (page: PageId, ticker?: string) => void;
  children: React.ReactNode;
}

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: "easeOut" } as any,
};

export default function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f9fafb]">
      {/* Left Sidebar (Fixed) */}
      <LeftSidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Center Panel (Scrollable Main Content) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f9fafb] border-r border-slate-200 shadow-[inset_-2px_0_12px_rgba(0,0,0,0.02)]">
        <motion.div
          key={activePage}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
          className="min-h-full max-w-[1000px] mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* Right Panel (Fixed Analyst Chat) */}
      <RightPanel />
    </div>
  );
}
