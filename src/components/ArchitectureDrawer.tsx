import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, X } from 'lucide-react';
import {
  BookedTour,
  LeadInquiry,
  PropertyListing,
  QualificationResult,
} from '../types/operations';
import { buildDynamicArchitecturePayloads } from '../engine/qualifierEngine';

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadInquiry;
  property: PropertyListing;
  qualification: QualificationResult;
  bookedTour: BookedTour | null;
  responseTimeSeconds: number;
  lastFaqTag: string;
}

interface ArchNode {
  id: string;
  step: string;
  title: string;
  platform: string;
  latencyBudget: string;
  role: string;
  guardrail: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'portal',
    step: '01',
    title: 'Portal Lead Capture',
    platform: 'Zillow · Apartments.com · MLS',
    latencyBudget: '< 2.0s',
    role: 'Captures raw prospect contact details, listing identifier, and free-text inquiry via webhook or parsed email relay.',
    guardrail: 'Deduplicates by phone/email and attaches source attribution tag before entering orchestration.',
  },
  {
    id: 'n8n',
    step: '02',
    title: 'Orchestration & Context',
    platform: 'n8n Self-Hosted / Cloud',
    latencyBudget: '< 3.5s',
    role: 'Validates payload schema, queries live AppFolio / Yardi / MLS listing record, and pulls coordinator calendar slots.',
    guardrail: 'Zero-guess policy: if listing record is inactive or missing, bypasses AI and notifies coordinator immediately.',
  },
  {
    id: 'claude',
    step: '03',
    title: 'Qualification & FAQ Reasoning',
    platform: 'Claude Structured JSON',
    latencyBudget: '< 5.0s',
    role: 'Scores Hot/Warm/Nurture readiness, extracts FAQ tags, and drafts concise plain-language SMS grounded exclusively in structured listing fields.',
    guardrail: 'Supervised AI: custom concessions, legal/Fair Housing questions, or missing facts trigger mandatory human escalation.',
  },
  {
    id: 'ghl',
    step: '04',
    title: 'Multi-Channel Engagement',
    platform: 'GoHighLevel CRM + SMS/Voice',
    latencyBudget: '< 4.0s',
    role: 'Upserts contact, dispatches A2P 10DLC SMS within 30 seconds, arms T+90s voice fallback, and reserves calendar slots.',
    guardrail: 'Respects quiet hours, opt-out compliance (STOP), and logs full conversation audit trail inside client-owned CRM.',
  },
  {
    id: 'pms',
    step: '05',
    title: 'Two-Way System Sync',
    platform: 'AppFolio · Yardi · MLS',
    latencyBudget: '< 2.0s',
    role: 'Writes back lead qualification tier, FAQ topics, and confirmed tour appointments to eliminate manual double-entry.',
    guardrail: 'Idempotent sync keys prevent duplicate guest cards or overlapping calendar holds.',
  },
];

export function ArchitectureDrawer({
  isOpen,
  onClose,
  lead,
  property,
  qualification,
  bookedTour,
  responseTimeSeconds,
  lastFaqTag,
}: ArchitectureDrawerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('claude');
  const [activeJsonTab, setActiveJsonTab] = useState<'webhook' | 'claude' | 'ghl'>('webhook');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const payloads = buildDynamicArchitecturePayloads(
    lead,
    property,
    qualification,
    bookedTour,
    responseTimeSeconds,
    lastFaqTag
  );

  const activeJsonObject =
    activeJsonTab === 'webhook'
      ? payloads.webhookPayload
      : activeJsonTab === 'claude'
      ? payloads.claudeOutput
      : payloads.ghlSyncPayload;

  const formattedJson = JSON.stringify(activeJsonObject, null, 2);
  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) ?? ARCH_NODES[2];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="System Architecture and Webhook Inspector"
      className="fixed inset-0 z-50 flex justify-end bg-[#0B0F17]/80 backdrop-blur-xs"
    >
      {/* Clickable backdrop */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Drawer Panel */}
      <div className="relative flex h-full w-full max-w-3xl flex-col border-l border-[#1E293B] bg-[#0B0F17] overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1E293B] bg-[#121826] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">
              System Architecture — GoHighLevel · n8n · Claude · Webhook
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Operations-first architecture: structured PMS/MLS data governs every response. Clients own all workflows and CRM records.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture inspector"
            className="rounded-md border border-[#1E293B] p-1.5 text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Interactive Node Pipeline */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                End-to-End Orchestration Flow
              </h3>
              <span className="font-mono text-xs text-[#38BDF8]">
                Click any node to inspect SLA &amp; guardrail
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {ARCH_NODES.map((node, index) => {
                const isSelected = node.id === selectedNodeId;
                return (
                  <div key={node.id} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`flex h-full w-full flex-col justify-between rounded-md border p-3 text-left transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[#38BDF8] bg-[#172033]'
                          : 'border-[#1E293B] bg-[#121826] hover:border-[#334155]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] text-[#6366F1]">
                            {node.step}
                          </span>
                          <span className="font-mono text-[10px] text-[#94A3B8] tabular-nums">
                            {node.latencyBudget}
                          </span>
                        </div>
                        <div className="mt-1.5 text-xs font-semibold text-[#F8FAFC] leading-snug">
                          {node.title}
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-[#94A3B8] leading-tight">
                        {node.platform}
                      </div>
                    </button>
                    {index < ARCH_NODES.length - 1 && (
                      <ArrowRight
                        className="hidden sm:block h-3.5 w-3.5 shrink-0 text-[#334155]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Node Operational Spec */}
            <div className="mt-3 rounded-md border border-[#1E293B] bg-[#121826] p-4 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#F8FAFC]">
                  {selectedNode.step}. {selectedNode.title} ({selectedNode.platform})
                </span>
                <span className="font-mono text-[#38BDF8] tabular-nums">
                  Latency Budget: {selectedNode.latencyBudget}
                </span>
              </div>
              <p className="text-[#CBD5E1] leading-relaxed">
                <strong className="font-medium text-[#F8FAFC]">Function: </strong>
                {selectedNode.role}
              </p>
              <p className="text-[#94A3B8] leading-relaxed">
                <strong className="font-medium text-[#10B981]">Operational Guardrail: </strong>
                {selectedNode.guardrail}
              </p>
            </div>
          </div>

          {/* Live Dynamic JSON Payload Inspector */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  Live Dynamic Payload Inspector
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Updates in real time for <span className="text-[#F8FAFC]">{lead.fullName}</span> ·{' '}
                  <span className="font-mono text-[#38BDF8]">{property.recordId}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#1E293B] bg-[#121826] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8]/60 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                    <span className="text-[#10B981]">Copied JSON</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* JSON Tabs */}
            <div
              role="tablist"
              aria-label="Payload Views"
              className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-[#1E293B] bg-[#121826] p-1.5"
            >
              {(
                [
                  { id: 'webhook', label: '1. Inbound Portal Webhook' },
                  { id: 'claude', label: '2. Claude Qualification Output' },
                  { id: 'ghl', label: '3. GoHighLevel & Calendar Sync' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeJsonTab === tab.id}
                  onClick={() => setActiveJsonTab(tab.id)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeJsonTab === tab.id
                      ? 'bg-[#172033] text-[#38BDF8]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre className="max-h-[340px] overflow-auto rounded-b-md border border-[#1E293B] bg-[#080C12] p-4 font-mono text-xs leading-relaxed text-[#CBD5E1]">
              <code>{formattedJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
