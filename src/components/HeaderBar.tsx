import { Layers, RotateCcw } from 'lucide-react';

interface HeaderBarProps {
  onOpenArchitecture: () => void;
  onReplaySimulation: () => void;
  isSimulating: boolean;
}

export function HeaderBar({
  onOpenArchitecture,
  onReplaySimulation,
  isSimulating,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1E293B] bg-[#0B0F17]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-baseline gap-3 min-w-0 shrink-0">
          <span className="font-[var(--font-display)] text-base font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap">
            AI OPS EXPERT
          </span>
          <a
            href="https://aiopsexpert.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline text-xs font-mono text-[#94A3B8] hover:text-[#38BDF8] transition-colors whitespace-nowrap"
          >
            aiopsexpert.com
          </a>
        </div>

        {/* Zone 2: Unboxed Portfolio Context */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs text-[#94A3B8] min-w-0 truncate">
          <span className="font-medium text-[#38BDF8] whitespace-nowrap">
            Interactive Demo
          </span>
          <span aria-hidden="true" className="text-[#334155]">
            ·
          </span>
          <span className="whitespace-nowrap">
            Upwork Portfolio MVP — Real Estate &amp; Property Ops
          </span>
          <span aria-hidden="true" className="text-[#334155]">
            ·
          </span>
          <span className="whitespace-nowrap text-[#64748B]">
            Supervised AI Architecture
          </span>
        </div>

        {/* Zone 3: Primary Operational Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-2 rounded-md border border-[#1E293B] bg-[#121826] px-3.5 py-2 text-xs font-medium text-[#F8FAFC] transition-colors duration-150 hover:border-[#38BDF8]/60 hover:text-[#38BDF8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-[#6366F1]" aria-hidden="true" />
            <span>System Architecture</span>
          </button>

          <button
            type="button"
            onClick={onReplaySimulation}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 rounded-md bg-[#38BDF8] px-3.5 py-2 text-xs font-semibold text-[#0B0F17] transition-colors duration-150 hover:bg-[#7DD3FC] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isSimulating ? 'Running Pipeline' : 'Replay Simulation'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
