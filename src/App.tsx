import { useCallback, useEffect, useRef, useState } from 'react';
import { PROPERTIES, SAMPLE_LEADS } from './data/properties';
import {
  buildPipelineSteps,
  buildVoiceTranscript,
  createBookedTour,
  evaluateQualification,
  generateGroundedResponse,
} from './engine/qualifierEngine';
import {
  BookedTour,
  LeadInquiry,
  PipelineStep,
  PropertyListing,
  QualificationResult,
  SmsMessage,
} from './types/operations';
import { HeaderBar } from './components/HeaderBar';
import { KpiTelemetryStrip } from './components/KpiTelemetryStrip';
import { LeadPropertyPanel } from './components/LeadPropertyPanel';
import { ExecutionWorkspacePanel } from './components/ExecutionWorkspacePanel';
import { ArchitectureDrawer } from './components/ArchitectureDrawer';

function formatClockNow(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function App() {
  const initialProperty = PROPERTIES[0];
  const initialLead = SAMPLE_LEADS[initialProperty.id];

  const [activePropertyId, setActivePropertyId] = useState<string>(initialProperty.id);
  const [activeLead, setActiveLead] = useState<LeadInquiry>(initialLead);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // Operational metrics & session state
  const [activeLeadsQueued, setActiveLeadsQueued] = useState<number>(PROPERTIES.length);
  const [faqsAnswered, setFaqsAnswered] = useState<number>(0);
  const [toursScheduled, setToursScheduled] = useState<number>(0);
  const [escalationsCount, setEscalationsCount] = useState<number>(0);
  const [bookedTourIds, setBookedTourIds] = useState<Record<string, BookedTour>>({});

  // Live simulation pipeline state
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(0);
  const [targetResponseSeconds, setTargetResponseSeconds] = useState<number>(14.2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [qualification, setQualification] = useState<QualificationResult>(() =>
    evaluateQualification(initialLead, initialProperty)
  );
  const [lastFaqTag, setLastFaqTag] = useState<string>('Initial Lead Response');

  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const activeProperty: PropertyListing =
    PROPERTIES.find((p) => p.id === activePropertyId) ?? PROPERTIES[0];
  const currentBookedTour = bookedTourIds[activeLead.id] ?? null;

  const clearScheduledTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runSimulationForLead = useCallback(
    (lead: LeadInquiry, property: PropertyListing) => {
      clearScheduledTimers();

      const qual = evaluateQualification(lead, property);
      const { steps, totalResponseSeconds } = buildPipelineSteps(lead, property, qual);
      const initialAnswer = generateGroundedResponse(lead.initialMessage, lead, property, true);

      setQualification(qual);
      setTargetResponseSeconds(totalResponseSeconds);
      setLastFaqTag(initialAnswer.faqTag);
      setLiveTimerSeconds(0);
      setIsSimulating(true);

      // Start with stage 1 running
      setPipelineSteps(
        steps.map((s, idx) => ({
          ...s,
          status: idx === 0 ? 'running' : 'pending',
        }))
      );

      // Show inbound lead message right away
      const nowLabel = formatClockNow();
      setMessages([
        {
          id: `sys-start-${Date.now()}`,
          sender: 'system',
          body: `Webhook ingested from ${lead.portalSource} · ${property.recordId}`,
          timestamp: nowLabel,
        },
        {
          id: `lead-init-${Date.now()}`,
          sender: 'lead',
          body: lead.initialMessage,
          timestamp: nowLabel,
        },
      ]);

      // Smooth accelerated stopwatch synced to 2.2s visual playback reaching actual sub-30s value
      const visualTotalMs = 2200;
      const startTime = performance.now();

      intervalRef.current = window.setInterval(() => {
        const elapsedMs = performance.now() - startTime;
        const progress = Math.min(1, elapsedMs / visualTotalMs);
        setLiveTimerSeconds(Number((totalResponseSeconds * progress).toFixed(1)));
        if (progress >= 1 && intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 50);

      // Stage transitions across the 2.2s playback
      const stageTimes = [500, 1050, 1650, 2200];

      stageTimes.forEach((ms, stageIdx) => {
        const timerId = window.setTimeout(() => {
          setPipelineSteps((prev) =>
            prev.map((step, idx) => {
              if (idx <= stageIdx) return { ...step, status: 'completed' };
              if (idx === stageIdx + 1) return { ...step, status: 'running' };
              return step;
            })
          );

          // At stage 3 (index 2), dispatch instant outbound SMS
          if (stageIdx === 2) {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-init-${Date.now()}`,
                sender: 'ai',
                body: initialAnswer.replyText,
                timestamp: formatClockNow(),
                groundedFields: initialAnswer.groundedFields,
                escalatedToHuman: initialAnswer.escalatedToHuman,
              },
            ]);
            setFaqsAnswered((count) => count + 1);
          }

          // At final stage, settle simulation
          if (stageIdx === 3) {
            setLiveTimerSeconds(totalResponseSeconds);
            setIsSimulating(false);
          }
        }, ms);

        timersRef.current.push(timerId);
      });
    },
    [clearScheduledTimers]
  );

  // Trigger initial simulation on mount
  useEffect(() => {
    runSimulationForLead(initialLead, initialProperty);
    return () => clearScheduledTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (propertyId: string) => {
    const nextProp = PROPERTIES.find((p) => p.id === propertyId) ?? PROPERTIES[0];
    const nextLead = SAMPLE_LEADS[nextProp.id];
    setIsCustomMode(false);
    setActivePropertyId(nextProp.id);
    setActiveLead(nextLead);
    runSimulationForLead(nextLead, nextProp);
  };

  const handleSubmitCustomLead = (customLead: LeadInquiry) => {
    const targetProp = PROPERTIES.find((p) => p.id === customLead.propertyId) ?? PROPERTIES[0];
    setIsCustomMode(false);
    setActivePropertyId(targetProp.id);
    setActiveLead(customLead);
    setActiveLeadsQueued((prev) => prev + 1);
    runSimulationForLead(customLead, targetProp);
  };

  const handleReplaySimulation = () => {
    runSimulationForLead(activeLead, activeProperty);
  };

  const handleBookSlotDirect = (slotLabel: string) => {
    const newBooking = createBookedTour(activeProperty, slotLabel);
    setBookedTourIds((prev) => {
      const alreadyBookedForLead = Boolean(prev[activeLead.id]);
      if (!alreadyBookedForLead) {
        setToursScheduled((count) => count + 1);
      }
      return { ...prev, [activeLead.id]: newBooking };
    });

    setLastFaqTag('Tour Confirmed & Synced');
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-book-${Date.now()}`,
        sender: 'system',
        body: `Tour booked (${slotLabel}) · Synced to GoHighLevel Calendar & ${activeProperty.systemSource} (${newBooking.confirmationCode})`,
        timestamp: formatClockNow(),
      },
    ]);
  };

  const handleSendSmsFollowUp = (text: string) => {
    const nowLabel = formatClockNow();
    const userMsg: SmsMessage = {
      id: `lead-msg-${Date.now()}`,
      sender: 'lead',
      body: text,
      timestamp: nowLabel,
    };
    setMessages((prev) => [...prev, userMsg]);

    const answer = generateGroundedResponse(text, activeLead, activeProperty, false);

    const replyTimer = window.setTimeout(() => {
      const aiMsg: SmsMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        body: answer.replyText,
        timestamp: formatClockNow(),
        groundedFields: answer.groundedFields,
        escalatedToHuman: answer.escalatedToHuman,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLastFaqTag(answer.faqTag);

      if (answer.escalatedToHuman) {
        setEscalationsCount((c) => c + 1);
        setQualification((prev) => ({
          ...prev,
          humanEscalationRequired: true,
          escalationReason: answer.escalationReason,
        }));
      } else {
        setFaqsAnswered((c) => c + 1);
      }

      if (answer.bookedSlot) {
        handleBookSlotDirect(answer.bookedSlot);
      }
    }, 380);

    timersRef.current.push(replyTimer);
  };

  const voiceTurns = buildVoiceTranscript(
    activeLead,
    activeProperty,
    qualification,
    currentBookedTour
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-[#F8FAFC]">
      <HeaderBar
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onReplaySimulation={handleReplaySimulation}
        isSimulating={isSimulating}
      />

      <KpiTelemetryStrip
        liveTimerSeconds={liveTimerSeconds}
        isSimulating={isSimulating}
        activeLeadsQueued={activeLeadsQueued}
        faqsAnswered={faqsAnswered}
        toursScheduled={toursScheduled}
        escalationsCount={escalationsCount}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-6 sm:px-8">
        {/* Two-Column Operational Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <LeadPropertyPanel
              properties={PROPERTIES}
              activeProperty={activeProperty}
              activeLead={activeLead}
              isCustomMode={isCustomMode}
              onSelectPreset={handleSelectPreset}
              onToggleCustomMode={setIsCustomMode}
              onSubmitCustomLead={handleSubmitCustomLead}
            />
          </div>

          <div className="lg:col-span-7">
            <ExecutionWorkspacePanel
              lead={activeLead}
              property={activeProperty}
              pipelineSteps={pipelineSteps}
              isSimulating={isSimulating}
              messages={messages}
              voiceTurns={voiceTurns}
              qualification={qualification}
              bookedTour={currentBookedTour}
              onSendSmsFollowUp={handleSendSmsFollowUp}
              onBookSlotDirect={handleBookSlotDirect}
              onOpenArchitecture={() => setIsArchitectureOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Quiet Demonstration Disclosure Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0B0F17]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 text-xs text-[#64748B]">
          <div>
            <span className="font-medium text-[#94A3B8]">Demonstration MVP</span>
            <span aria-hidden="true" className="mx-2 text-[#334155]">·</span>
            <span>
              Interactive sample workflow built by AI Ops Expert (aiopsexpert.com) using simulated portal data and structured listing facts.
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#64748B]">
            Operations First, AI Second · Supervised Grounding
          </div>
        </div>
      </footer>

      <ArchitectureDrawer
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        lead={activeLead}
        property={activeProperty}
        qualification={qualification}
        bookedTour={currentBookedTour}
        responseTimeSeconds={targetResponseSeconds}
        lastFaqTag={lastFaqTag}
      />
    </div>
  );
}
