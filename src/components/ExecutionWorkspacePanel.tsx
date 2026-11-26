import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  PhoneCall,
  Play,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  BookedTour,
  LeadInquiry,
  PipelineStep,
  PropertyListing,
  QualificationResult,
  SmsMessage,
  VoiceTranscriptTurn,
} from '../types/operations';

interface ExecutionWorkspacePanelProps {
  lead: LeadInquiry;
  property: PropertyListing;
  pipelineSteps: PipelineStep[];
  isSimulating: boolean;
  messages: SmsMessage[];
  voiceTurns: VoiceTranscriptTurn[];
  qualification: QualificationResult;
  bookedTour: BookedTour | null;
  onSendSmsFollowUp: (text: string) => void;
  onBookSlotDirect: (slotLabel: string) => void;
  onOpenArchitecture: () => void;
}

export function ExecutionWorkspacePanel({
  lead,
  property,
  pipelineSteps,
  isSimulating,
  messages,
  voiceTurns,
  qualification,
  bookedTour,
  onSendSmsFollowUp,
  onBookSlotDirect,
  onOpenArchitecture,
}: ExecutionWorkspacePanelProps) {
  const [activeChannel, setActiveChannel] = useState<'sms' | 'voice'>('sms');
  const [draftInput, setDraftInput] = useState('');
  const [visibleVoiceTurns, setVisibleVoiceTurns] = useState<number>(voiceTurns.length);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const voiceTimerRef = useRef<number[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  useEffect(() => {
    // Reset voice playback when lead or voiceTurns change
    voiceTimerRef.current.forEach((t) => window.clearTimeout(t));
    voiceTimerRef.current = [];
    setIsPlayingVoice(false);
    setVisibleVoiceTurns(voiceTurns.length);
  }, [lead.id, voiceTurns.length]);

  useEffect(() => {
    return () => {
      voiceTimerRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftInput.trim();
    if (!trimmed || isSimulating) return;
    onSendSmsFollowUp(trimmed);
    setDraftInput('');
  };

  const handleReplayVoice = () => {
    voiceTimerRef.current.forEach((t) => window.clearTimeout(t));
    voiceTimerRef.current = [];
    setIsPlayingVoice(true);
    setVisibleVoiceTurns(1);

    voiceTurns.forEach((_, idx) => {
      if (idx === 0) return;
      const timer = window.setTimeout(() => {
        setVisibleVoiceTurns(idx + 1);
        if (idx === voiceTurns.length - 1) {
          setIsPlayingVoice(false);
          if (!bookedTour) {
            onBookSlotDirect(property.facts.availableTourSlots[0]);
          }
        }
      }, idx * 850);
      voiceTimerRef.current.push(timer);
    });
  };

  const tierStyle =
    qualification.tier === 'Hot'
      ? 'text-[#10B981]'
      : qualification.tier === 'Warm'
      ? 'text-[#F59E0B]'
      : 'text-[#94A3B8]';

  return (
    <div className="flex flex-col gap-5">
      {/* Section 1: Live Execution Pipeline */}
      <section
        aria-label="Live Execution Pipeline"
        className="rounded-lg border border-[#1E293B] bg-[#121826] overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">
              Live Execution Pipeline
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Deterministic orchestration from portal webhook receipt to sub-30s prospect engagement.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="text-xs font-medium text-[#38BDF8] hover:text-[#7DD3FC] transition-colors cursor-pointer whitespace-nowrap"
          >
            Inspect JSON Payloads →
          </button>
        </div>

        <ol className="divide-y divide-[#1E293B]">
          {pipelineSteps.map((step) => {
            const isDone = step.status === 'completed';
            const isRunning = step.status === 'running';

            return (
              <li
                key={step.id}
                className={`px-5 py-3.5 transition-colors duration-150 ${
                  isRunning ? 'bg-[#172033]/75' : 'bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2
                          className="h-4 w-4 text-[#10B981]"
                          aria-label="Completed"
                        />
                      ) : isRunning ? (
                        <Loader2
                          className="h-4 w-4 animate-spin text-[#38BDF8]"
                          aria-label="Running"
                        />
                      ) : (
                        <Clock className="h-4 w-4 text-[#475569]" aria-label="Queued" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-mono text-xs text-[#64748B]">
                          0{step.stepNumber}.
                        </span>
                        <h3
                          className={`text-sm font-medium ${
                            isDone || isRunning ? 'text-[#F8FAFC]' : 'text-[#64748B]'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <span className="text-xs text-[#6366F1] font-mono">
                          {step.component}
                        </span>
                      </div>

                      <p
                        className={`mt-1 text-xs leading-relaxed ${
                          isDone || isRunning ? 'text-[#CBD5E1]' : 'text-[#475569]'
                        }`}
                      >
                        {step.summary}
                      </p>

                      {isDone && (
                        <p className="mt-1 font-mono text-[11px] text-[#64748B]">
                          {step.detailLine}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`font-mono text-xs tabular-nums ${
                        isDone
                          ? 'text-[#38BDF8]'
                          : isRunning
                          ? 'text-[#F8FAFC]'
                          : 'text-[#475569]'
                      }`}
                    >
                      {isDone
                        ? `+${step.elapsedSeconds.toFixed(1)}s`
                        : isRunning
                        ? 'Running'
                        : 'Pending'}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#64748B]">
                      {isDone ? 'Verified' : isRunning ? 'In flight' : 'Queued'}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Section 2: Multi-Channel Engagement Stream */}
      <section
        aria-label="Multi-Channel Engagement Stream"
        className="flex flex-col rounded-lg border border-[#1E293B] bg-[#121826] overflow-hidden"
      >
        {/* Channel Header & Segmented Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] px-5 py-3.5">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">
              Multi-Channel Engagement Stream
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#94A3B8]">
              <span>
                Qualification:{' '}
                <strong className={`font-semibold ${tierStyle}`}>
                  {qualification.tier} ({qualification.score}/100)
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#334155]">·</span>
              <span>
                Tour:{' '}
                <strong className="font-medium text-[#F8FAFC]">
                  {bookedTour ? bookedTour.slotLabel : 'Awaiting slot selection'}
                </strong>
              </span>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Engagement Channels"
            className="inline-flex items-center rounded-md bg-[#0B0F17] p-1 border border-[#1E293B]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeChannel === 'sms'}
              onClick={() => setActiveChannel('sms')}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                activeChannel === 'sms'
                  ? 'bg-[#172033] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Two-Way SMS Thread</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeChannel === 'voice'}
              onClick={() => setActiveChannel('voice')}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                activeChannel === 'voice'
                  ? 'bg-[#172033] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Voice Call &amp; Qualification</span>
            </button>
          </div>
        </div>

        {/* Confirmed Tour Banner (only when booked) */}
        {bookedTour && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] bg-[#0F1B24] px-5 py-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CalendarCheck2 className="h-4 w-4 text-[#10B981] shrink-0" aria-hidden="true" />
              <div>
                <span className="font-semibold text-[#F8FAFC]">
                  {bookedTour.tourType} Confirmed — {bookedTour.slotLabel}
                </span>
                <span className="ml-2 text-[#94A3B8]">
                  Assigned to {bookedTour.assignedCoordinator}
                </span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#10B981]">
              {bookedTour.confirmationCode} · {bookedTour.calendarSyncStatus}
            </div>
          </div>
        )}

        {activeChannel === 'sms' ? (
          <div className="flex flex-col">
            {/* SMS Transcript Area */}
            <div className="max-h-[380px] min-h-[260px] overflow-y-auto p-5 space-y-4 bg-[#0B0F17]/50">
              {messages.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-xs text-[#64748B]">
                  Waiting for pipeline step 3 to dispatch outbound SMS...
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div
                        key={msg.id}
                        className="flex items-center justify-center gap-2 py-1 text-center font-mono text-[11px] text-[#64748B]"
                      >
                        <span className="h-px flex-1 bg-[#1E293B]" />
                        <span>{msg.body}</span>
                        <span className="h-px flex-1 bg-[#1E293B]" />
                      </div>
                    );
                  }

                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAi ? 'items-end' : 'items-start'}`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[11px] text-[#64748B]">
                        <span className="font-medium text-[#94A3B8]">
                          {isAi ? 'AI Ops Concierge (GoHighLevel SMS)' : lead.fullName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                          isAi
                            ? 'bg-[#172033] text-[#F8FAFC] border border-[#38BDF8]/30'
                            : 'bg-[#121826] text-[#CBD5E1] border border-[#1E293B]'
                        }`}
                      >
                        {msg.body}
                      </div>

                      {isAi && msg.groundedFields && msg.groundedFields.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                          {msg.escalatedToHuman ? (
                            <>
                              <AlertTriangle
                                className="h-3 w-3 text-[#F59E0B] shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[#F59E0B]">
                                Supervised Escalation · Routed to {property.facts.coordinatorName}
                              </span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck
                                className="h-3 w-3 text-[#38BDF8] shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[#64748B]">
                                Grounded ({property.systemSource}):{' '}
                                <span className="text-[#94A3B8]">
                                  {msg.groundedFields.join(' · ')}
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Interactive Prompt Bar & Quick Tour Booking */}
            <div className="border-t border-[#1E293B] bg-[#121826] p-4 space-y-3">
              {/* Quick Test Follow-ups */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium text-[#94A3B8]">
                    Test live SMS follow-up (strictly grounded in active property sheet):
                  </span>
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() =>
                      onSendSmsFollowUp('Can you waive the security deposit or negotiate $300 off?')
                    }
                    className="text-[11px] font-medium text-[#F59E0B] hover:text-[#FBBF24] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Test Guardrail Escalation →
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {property.samplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => onSendSmsFollowUp(prompt)}
                      className="rounded border border-[#1E293B] bg-[#0B0F17] px-2.5 py-1.5 text-xs text-[#CBD5E1] transition-colors duration-150 hover:border-[#38BDF8]/50 hover:text-[#38BDF8] disabled:opacity-50 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live SMS Reply Input */}
              <form onSubmit={handleSendSubmit} className="flex items-center gap-2">
                <label htmlFor="sms-followup-input" className="sr-only">
                  Simulate prospect SMS reply
                </label>
                <input
                  id="sms-followup-input"
                  type="text"
                  disabled={isSimulating}
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                  placeholder={`Reply as ${lead.fullName} (e.g., "Is it pet friendly?" or "Book ${property.facts.availableTourSlots[0]}")`}
                  className="flex-1 rounded-md border border-[#1E293B] bg-[#0B0F17] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSimulating || !draftInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#38BDF8] px-4 py-2.5 text-xs font-semibold text-[#0B0F17] transition-colors duration-150 hover:bg-[#7DD3FC] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Send SMS</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Voice Call Flow & Qualification View */
          <div className="divide-y divide-[#1E293B]">
            {/* Qualification Breakdown */}
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#94A3B8]">
                    Claude Structured Lead Qualification
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className={`text-xl font-bold font-[var(--font-display)] ${tierStyle}`}>
                      {qualification.tier} Priority
                    </span>
                    <span className="font-mono text-sm text-[#F8FAFC] tabular-nums">
                      Score {qualification.score} / 100
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#CBD5E1]">{qualification.intent}</p>
                </div>

                {!bookedTour && (
                  <button
                    type="button"
                    onClick={() => onBookSlotDirect(property.facts.availableTourSlots[0])}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#6366F1] px-3.5 py-2 text-xs font-semibold text-[#F8FAFC] transition-colors hover:bg-[#818CF8] whitespace-nowrap cursor-pointer"
                  >
                    <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Book {property.facts.availableTourSlots[0]}</span>
                  </button>
                )}
              </div>

              {/* Evaluation Criteria Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[#64748B]">
                      <th className="py-2 pr-3 font-medium">Criterion</th>
                      <th className="py-2 px-3 font-medium">Extracted Signal</th>
                      <th className="py-2 pl-3 text-right font-medium">Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/70">
                    {qualification.criteria.map((c) => (
                      <tr key={c.label}>
                        <td className="py-2.5 pr-3 font-medium text-[#F8FAFC] whitespace-nowrap">
                          {c.label}
                        </td>
                        <td className="py-2.5 px-3 text-[#CBD5E1]">{c.observation}</td>
                        <td
                          className={`py-2.5 pl-3 text-right font-mono whitespace-nowrap ${
                            c.impact === 'Positive'
                              ? 'text-[#10B981]'
                              : c.impact === 'Needs Review'
                              ? 'text-[#F59E0B]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {c.impact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 pt-3 border-t border-[#1E293B] text-xs text-[#94A3B8]">
                <span className="font-medium text-[#F8FAFC]">Routing Decision: </span>
                {qualification.recommendedAction}
              </div>
            </div>

            {/* Outbound Voice Call Flow Script */}
            <div className="p-5 bg-[#0B0F17]/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC]">
                    Outbound Voice Call-Flow Script (T+90s Fallback)
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Triggered automatically if a Hot lead does not reply to SMS within 90 seconds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReplayVoice}
                  disabled={isPlayingVoice}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1E293B] bg-[#121826] px-3 py-1.5 text-xs font-medium text-[#38BDF8] hover:border-[#38BDF8]/60 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isPlayingVoice ? 'Simulating Call...' : 'Simulate Voice Call'}</span>
                </button>
              </div>

              <ol className="space-y-3">
                {voiceTurns.slice(0, visibleVoiceTurns).map((turn) => {
                  const isSystem = turn.speaker === 'System Action';
                  const isAi = turn.speaker === 'AI Concierge';

                  return (
                    <li
                      key={turn.id}
                      className={`rounded-md border px-3.5 py-2.5 text-xs leading-relaxed ${
                        isSystem
                          ? 'border-[#1E293B] bg-[#0B0F17] font-mono text-[#94A3B8]'
                          : isAi
                          ? 'border-[#38BDF8]/25 bg-[#172033]/70 text-[#F8FAFC]'
                          : 'border-[#1E293B] bg-[#121826] text-[#CBD5E1]'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className={`font-semibold ${
                            isSystem
                              ? 'text-[#6366F1]'
                              : isAi
                              ? 'text-[#38BDF8]'
                              : 'text-[#F8FAFC]'
                          }`}
                        >
                          {turn.speaker}
                        </span>
                        <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                          {turn.timestamp}
                        </span>
                      </div>
                      <p>{turn.text}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
