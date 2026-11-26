interface KpiTelemetryStripProps {
  liveTimerSeconds: number;
  isSimulating: boolean;
  activeLeadsQueued: number;
  faqsAnswered: number;
  toursScheduled: number;
  escalationsCount: number;
}

function formatStopwatch(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const whole = Math.floor(clamped);
  const tenths = Math.floor((clamped - whole) * 10);
  const paddedWhole = String(whole).padStart(2, '0');
  return `00:${paddedWhole}.${tenths}s`;
}

export function KpiTelemetryStrip({
  liveTimerSeconds,
  isSimulating,
  activeLeadsQueued,
  faqsAnswered,
  toursScheduled,
  escalationsCount,
}: KpiTelemetryStripProps) {
  return (
    <section
      aria-label="Operational Performance Telemetry"
      className="border-b border-[#1E293B] bg-[#121826]"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-[#1E293B] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {/* Metric 1: Speed-to-Lead */}
        <div className="px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#94A3B8]">
              Speed-to-Lead Response
            </span>
            <span
              className={`text-[11px] font-mono ${
                isSimulating ? 'text-[#38BDF8]' : 'text-[#10B981]'
              }`}
            >
              {isSimulating ? 'Executing' : 'Under 30s SLA'}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold tracking-tight text-[#F8FAFC] tabular-nums">
              {formatStopwatch(liveTimerSeconds)}
            </span>
            <span className="text-xs text-[#64748B]">
              webhook to SMS
            </span>
          </div>
        </div>

        {/* Metric 2: Active Portal Leads Queued */}
        <div className="px-5 py-4 sm:px-7 sm:border-l sm:border-[#1E293B] lg:border-l-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#94A3B8]">
              Active Portal Leads Queued
            </span>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              Zillow · Apt · MLS
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold tracking-tight text-[#F8FAFC] tabular-nums">
              {String(activeLeadsQueued).padStart(2, '0')}
            </span>
            <span className="text-xs text-[#64748B]">
              multi-portal intake
            </span>
          </div>
        </div>

        {/* Metric 3: Property FAQs Grounded */}
        <div className="px-5 py-4 sm:px-7 sm:border-t sm:border-[#1E293B] lg:border-t-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#94A3B8]">
              Property FAQs Resolved
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8]">
              Fact-Sheet Grounded
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold tracking-tight text-[#F8FAFC] tabular-nums">
              {String(faqsAnswered).padStart(2, '0')}
            </span>
            <span className="text-xs text-[#64748B]">
              {escalationsCount > 0
                ? `${escalationsCount} flagged for coordinator`
                : '0 unverified claims'}
            </span>
          </div>
        </div>

        {/* Metric 4: Tours Scheduled & Synced */}
        <div className="px-5 py-4 sm:px-7 sm:border-t sm:border-l sm:border-[#1E293B] lg:border-t-0 lg:border-l-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#94A3B8]">
              Tours Scheduled &amp; Synced
            </span>
            <span className="text-[11px] font-mono text-[#6366F1]">
              GHL + PMS / MLS
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold tracking-tight text-[#F8FAFC] tabular-nums">
              {String(toursScheduled).padStart(2, '0')}
            </span>
            <span className="text-xs text-[#64748B]">
              confirmed on calendar
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
