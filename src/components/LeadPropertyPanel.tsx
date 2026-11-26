import React, { useState } from 'react';
import { Building2, Check, Plus, Send } from 'lucide-react';
import { LeadInquiry, PortalSource, PropertyListing } from '../types/operations';

interface LeadPropertyPanelProps {
  properties: PropertyListing[];
  activeProperty: PropertyListing;
  activeLead: LeadInquiry;
  isCustomMode: boolean;
  onSelectPreset: (propertyId: string) => void;
  onToggleCustomMode: (enabled: boolean) => void;
  onSubmitCustomLead: (lead: LeadInquiry) => void;
}

const PORTAL_OPTIONS: PortalSource[] = [
  'Zillow Rental Manager',
  'Apartments.com',
  'MLS / Realtor.com',
  'Zillow Premier Agent',
];

export function LeadPropertyPanel({
  properties,
  activeProperty,
  activeLead,
  isCustomMode,
  onSelectPreset,
  onToggleCustomMode,
  onSubmitCustomLead,
}: LeadPropertyPanelProps) {
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState({
    fullName: 'Jordan Mercer',
    phone: '(904) 555-0167',
    email: 'j.mercer@harborops.example',
    portalSource: 'Zillow Rental Manager' as PortalSource,
    propertyId: activeProperty.id,
    timeline: 'Move-in within 30 days',
    preApprovalOrIncome: 'Verifiable 3.8x rent · 725 credit',
    initialMessage:
      'Hi, is this property still available? We have one 35 lb dog and need covered parking. Can we tour Thursday at 4 PM?',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.fullName.trim() || !formState.initialMessage.trim()) return;

    const customLead: LeadInquiry = {
      id: `lead-custom-${Date.now()}`,
      propertyId: formState.propertyId,
      isCustom: true,
      fullName: formState.fullName.trim(),
      phone: formState.phone.trim() || '(904) 555-0199',
      email: formState.email.trim() || 'prospect@example.com',
      portalSource: formState.portalSource,
      timeline: formState.timeline.trim() || 'Flexible move-in',
      preApprovalOrIncome: formState.preApprovalOrIncome.trim() || 'Pending verification',
      initialMessage: formState.initialMessage.trim(),
      receivedAtLabel: `Just now · Custom Webhook #WH-${Math.floor(1000 + Math.random() * 8999)}`,
    };
    onSubmitCustomLead(customLead);
  };

  const facts = activeProperty.facts;

  return (
    <div className="flex flex-col border border-[#1E293B] rounded-lg bg-[#121826] overflow-hidden">
      {/* Panel Header & Lead Switcher */}
      <div className="border-b border-[#1E293B] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-[#F8FAFC]">
              Inbound Portal Lead &amp; Property Context
            </h1>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Select a live scenario or inject a custom portal webhook payload.
            </p>
          </div>
          <span className="font-mono text-xs text-[#64748B]">
            {activeProperty.recordId}
          </span>
        </div>

        {/* Segmented Scenario Selector */}
        <div
          role="tablist"
          aria-label="Lead Scenarios"
          className="mt-4 grid grid-cols-2 gap-1.5 rounded-md bg-[#0B0F17] p-1 sm:grid-cols-4"
        >
          {properties.map((prop) => {
            const isSelected = !isCustomMode && activeProperty.id === prop.id;
            return (
              <button
                key={prop.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectPreset(prop.id)}
                className={`rounded px-2.5 py-2 text-left text-xs font-medium transition-colors duration-150 truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
                  isSelected
                    ? 'bg-[#172033] text-[#38BDF8] ring-1 ring-[#38BDF8]/40'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
                title={prop.shortLabel}
              >
                {prop.shortLabel}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={isCustomMode}
            onClick={() => {
              setFormState((prev) => ({ ...prev, propertyId: activeProperty.id }));
              onToggleCustomMode(true);
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
              isCustomMode
                ? 'bg-[#6366F1] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Custom Lead</span>
          </button>
        </div>
      </div>

      {/* Custom Lead Form OR Active Lead Summary */}
      {isCustomMode ? (
        <form onSubmit={handleFormSubmit} className="border-b border-[#1E293B] p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F8FAFC]">
              Simulate Custom Inbound Portal Inquiry
            </h2>
            <button
              type="button"
              onClick={() => onToggleCustomMode(false)}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-name" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Prospect Name
              </label>
              <input
                id="lead-name"
                type="text"
                required
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lead-portal" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Source Portal
              </label>
              <select
                id="lead-portal"
                value={formState.portalSource}
                onChange={(e) =>
                  setFormState({ ...formState, portalSource: e.target.value as PortalSource })
                }
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              >
                {PORTAL_OPTIONS.map((portal) => (
                  <option key={portal} value={portal}>
                    {portal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-phone" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Mobile Phone (SMS / Voice)
              </label>
              <input
                id="lead-phone"
                type="text"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm font-mono text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lead-property" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Target Listing
              </label>
              <select
                id="lead-property"
                value={formState.propertyId}
                onChange={(e) => setFormState({ ...formState, propertyId: e.target.value })}
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortLabel} ({p.facts.priceDisplay})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-timeline" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Move-In / Closing Timeline
              </label>
              <input
                id="lead-timeline"
                type="text"
                value={formState.timeline}
                onChange={(e) => setFormState({ ...formState, timeline: e.target.value })}
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lead-finance" className="block text-xs font-medium text-[#94A3B8] mb-1">
                Pre-Approval / Income Status
              </label>
              <input
                id="lead-finance"
                type="text"
                value={formState.preApprovalOrIncome}
                onChange={(e) =>
                  setFormState({ ...formState, preApprovalOrIncome: e.target.value })
                }
                className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead-question" className="block text-xs font-medium text-[#94A3B8] mb-1">
              Initial Inquiry / Question
            </label>
            <textarea
              id="lead-question"
              rows={2}
              required
              value={formState.initialMessage}
              onChange={(e) => setFormState({ ...formState, initialMessage: e.target.value })}
              className="w-full rounded-md border border-[#1E293B] bg-[#0B0F17] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#38BDF8] px-4 py-2.5 text-xs font-semibold text-[#0B0F17] transition-colors duration-150 hover:bg-[#7DD3FC] cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Trigger Inbound Webhook &amp; Run Qualifier</span>
          </button>
        </form>
      ) : (
        <div className="border-b border-[#1E293B] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-sm font-semibold text-[#F8FAFC]">{activeLead.fullName}</h2>
              <span className="text-xs text-[#38BDF8]">{activeLead.portalSource}</span>
            </div>
            <span className="font-mono text-[11px] text-[#64748B]">
              {activeLead.receivedAtLabel}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
            <span className="font-mono text-[#F8FAFC]">{activeLead.phone}</span>
            <span aria-hidden="true" className="text-[#334155]">·</span>
            <span>{activeLead.email}</span>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
            <div>
              <dt className="text-[#64748B]">Timeline</dt>
              <dd className="mt-0.5 font-medium text-[#F8FAFC]">{activeLead.timeline}</dd>
            </div>
            <div>
              <dt className="text-[#64748B]">Screening / Financing</dt>
              <dd className="mt-0.5 font-medium text-[#F8FAFC]">
                {activeLead.preApprovalOrIncome}
              </dd>
            </div>
          </dl>

          <p className="mt-3.5 rounded-md bg-[#0B0F17] px-3.5 py-2.5 text-sm leading-relaxed text-[#CBD5E1] border border-[#1E293B]">
            “{activeLead.initialMessage}”
          </p>
        </div>
      )}

      {/* Grounded Property Fact Sheet */}
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">
            Grounded Property Fact Sheet
          </h2>
          <span className="text-xs text-[#94A3B8]">
            Source: <span className="font-mono text-[#38BDF8]">{activeProperty.systemSource}</span>
          </span>
        </div>

        {/* Listing Visual Header */}
        <div className="relative overflow-hidden rounded-md border border-[#1E293B] bg-[#0B0F17] aspect-[16/9]">
          {!imgError[activeProperty.id] ? (
            <img
              src={activeProperty.imageUrl}
              alt={activeProperty.title}
              referrerPolicy="no-referrer"
              onError={() =>
                setImgError((prev) => ({ ...prev, [activeProperty.id]: true }))
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#121826] to-[#0B0F17] p-4 text-center">
              <Building2 className="h-8 w-8 text-[#38BDF8]/70 mb-2" aria-hidden="true" />
              <span className="text-sm font-medium text-[#F8FAFC]">{activeProperty.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[#38BDF8]">
                {activeProperty.category} · {facts.bedsBathsSqft}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-[#F8FAFC] truncate">
                {activeProperty.title}
              </div>
              <div className="text-xs text-[#CBD5E1] truncate">{activeProperty.address}</div>
            </div>
            <div className="font-mono text-base font-semibold text-[#F8FAFC] tabular-nums shrink-0">
              {facts.priceDisplay}
            </div>
          </div>
        </div>

        {/* Structured Fact Rows */}
        <dl className="mt-4 divide-y divide-[#1E293B] text-xs">
          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Availability</dt>
            <dd className="text-[#F8FAFC] leading-relaxed">{facts.availability}</dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Pricing &amp; Terms</dt>
            <dd className="text-[#CBD5E1] leading-relaxed">
              <span className="text-[#F8FAFC]">{facts.priceDetail}</span> {facts.leaseOrFinancing}
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Pet Policy</dt>
            <dd className="text-[#CBD5E1] leading-relaxed">{facts.petPolicy}</dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Parking &amp; EV</dt>
            <dd className="text-[#CBD5E1] leading-relaxed">{facts.parking}</dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">HOA &amp; Utilities</dt>
            <dd className="text-[#CBD5E1] leading-relaxed">{facts.hoaAndUtilities}</dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Key Amenities</dt>
            <dd className="text-[#CBD5E1] space-y-1">
              {facts.amenities.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-[#38BDF8] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Location &amp; Notes</dt>
            <dd className="text-[#CBD5E1] leading-relaxed">
              {facts.neighborhoodAndSchools} {facts.specialNotes}
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-2.5 sm:grid-cols-[130px_1fr] sm:gap-3">
            <dt className="font-medium text-[#94A3B8]">Tour Windows</dt>
            <dd className="text-[#CBD5E1]">
              <div className="text-[#F8FAFC]">{facts.showingHours}</div>
              <div className="mt-1 font-mono text-[11px] text-[#38BDF8]">
                Open: {facts.availableTourSlots.join(' · ')}
              </div>
              <div className="mt-1 text-[11px] text-[#64748B]">
                Coordinator: {facts.coordinatorName} ({facts.coordinatorRole})
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
