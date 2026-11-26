import {
  BookedTour,
  LeadInquiry,
  PipelineStep,
  PropertyListing,
  QualificationCriterion,
  QualificationResult,
  QualificationTier,
  SmsMessage,
  VoiceTranscriptTurn,
} from '../types/operations';

export interface GroundedAnswer {
  replyText: string;
  groundedFields: string[];
  faqTag: string;
  bookedSlot: string | null;
  escalatedToHuman: boolean;
  escalationReason?: string;
}

function getFirstName(fullName: string): string {
  const cleaned = fullName.trim();
  if (!cleaned) return 'there';
  if (cleaned.startsWith('Dr. ')) {
    const parts = cleaned.split(' ');
    return parts.length >= 2 ? `Dr. ${parts[parts.length - 1]}` : cleaned;
  }
  return cleaned.split(' ')[0];
}

export function evaluateQualification(
  lead: LeadInquiry,
  property: PropertyListing
): QualificationResult {
  const combined = `${lead.timeline} ${lead.preApprovalOrIncome} ${lead.initialMessage}`.toLowerCase();
  const criteria: QualificationCriterion[] = [];
  let score = 55;

  // Timeline urgency
  if (
    /immediate|asap|week|21 day|30 day|30–45|jan|dec|next month|this month/.test(combined)
  ) {
    score += 18;
    criteria.push({
      label: 'Move-in / Closing Window',
      observation: `${lead.timeline} aligns with listing availability`,
      impact: 'Positive',
    });
  } else if (/60|90|spring|summer|flexible|exploring|looking/.test(combined)) {
    score += 5;
    criteria.push({
      label: 'Move-in / Closing Window',
      observation: `${lead.timeline} (mid-range horizon)`,
      impact: 'Neutral',
    });
  } else {
    criteria.push({
      label: 'Move-in / Closing Window',
      observation: lead.timeline || 'Not specified — queued for SMS confirmation',
      impact: 'Needs Review',
    });
  }

  // Financial / Pre-approval readiness
  if (/pre-approv|cash|verified|offer letter|4\.|5\.|3x|7\d\d|8\d\d|850k/.test(combined)) {
    score += 17;
    criteria.push({
      label: property.category === 'For Sale' ? 'Financing Readiness' : 'Income / Screening',
      observation: lead.preApprovalOrIncome,
      impact: 'Positive',
    });
  } else if (/unsure|need lender|working on|not yet/.test(combined)) {
    score -= 8;
    criteria.push({
      label: property.category === 'For Sale' ? 'Financing Readiness' : 'Income / Screening',
      observation: `${lead.preApprovalOrIncome} — requires pre-qualification follow-up`,
      impact: 'Needs Review',
    });
  } else {
    score += 6;
    criteria.push({
      label: property.category === 'For Sale' ? 'Financing Readiness' : 'Income / Screening',
      observation: lead.preApprovalOrIncome || 'Pending screening verification',
      impact: 'Neutral',
    });
  }

  // Tour intent & specificity
  if (/tour|showing|visit|see it|thursday|friday|saturday|sunday|evening|morning/.test(combined)) {
    score += 8;
    criteria.push({
      label: 'Tour Intent',
      observation: 'Explicit request to schedule property walkthrough',
      impact: 'Positive',
    });
  } else {
    criteria.push({
      label: 'Tour Intent',
      observation: 'Fact-finding inquiry — open tour slots offered proactively',
      impact: 'Neutral',
    });
  }

  score = Math.max(25, Math.min(98, score));
  let tier: QualificationTier = 'Warm';
  if (score >= 82) tier = 'Hot';
  else if (score < 62) tier = 'Nurture';

  const faqTags = detectFaqTags(lead.initialMessage);

  return {
    tier,
    score,
    intent:
      property.category === 'For Sale'
        ? 'Qualified Buyer Inquiry & Private Showing Request'
        : 'High-Intent Rental Inquiry & Guided Tour Request',
    faqTags: faqTags.length > 0 ? faqTags : ['Availability & Tour Scheduling'],
    recommendedAction:
      tier === 'Hot'
        ? `Immediate SMS (<30s) + offer top calendar slots with ${property.facts.coordinatorName}; voice fallback at T+90s if unread.`
        : tier === 'Warm'
        ? 'Instant grounded SMS reply + verify move-in/pre-approval criteria before locking agent calendar.'
        : 'Send property fact summary via SMS and enroll in 7-day supervised GoHighLevel nurture sequence.',
    humanEscalationRequired: false,
    criteria,
  };
}

function detectFaqTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (/pet|dog|cat|lab|breed|animal/.test(lower)) tags.push('Pet Policy');
  if (/park|garage|ev|charg|car|driveway/.test(lower)) tags.push('Parking & Garage');
  if (/hoa|cdd|utilit|water|electric|trash|lawn|internet|fiber|fee/.test(lower))
    tags.push('HOA & Utilities');
  if (/rent|price|deposit|cost|offer|credit|income|lease|financ|loan|pre-approv/.test(lower))
    tags.push('Terms & Pricing');
  if (/roof|hvac|amenit|pool|gym|washer|dryer|balcony|office|sqft/.test(lower))
    tags.push('Property Specs & Amenities');
  if (/school|neighborhood|hospital|beach|commute|zone/.test(lower))
    tags.push('Location & Schools');
  if (/tour|show|visit|thursday|friday|saturday|sunday|pm|am|book|schedule/.test(lower))
    tags.push('Tour Scheduling');
  return tags;
}

function matchRequestedTourSlot(
  message: string,
  property: PropertyListing
): { matchedSlot: string | null; isTourRequest: boolean; customRequestedLabel: string | null } {
  const lower = message.toLowerCase();
  const isTourRequest =
    /tour|show|visit|walkthrough|book|schedule|see the|come by|appointment/.test(lower) ||
    /(mon|tue|wed|thu|fri|sat|sun|tomorrow|thursday|friday|saturday|sunday).*(\d{1,2}\s?(am|pm)|morning|afternoon|evening)/.test(
      lower
    );

  if (!isTourRequest) {
    return { matchedSlot: null, isTourRequest: false, customRequestedLabel: null };
  }

  // Match against configured open slots first
  const dayChecks: Array<{ regex: RegExp; dayKey: string }> = [
    { regex: /thu/, dayKey: 'thu' },
    { regex: /fri/, dayKey: 'fri' },
    { regex: /sat/, dayKey: 'sat' },
    { regex: /sun/, dayKey: 'sun' },
  ];

  for (const check of dayChecks) {
    if (check.regex.test(lower)) {
      const slot = property.facts.availableTourSlots.find((s) =>
        s.toLowerCase().includes(check.dayKey)
      );
      if (slot) {
        return { matchedSlot: slot, isTourRequest: true, customRequestedLabel: null };
      }
    }
  }

  if (/evening|after 5|5:30|6:/.test(lower)) {
    const eveningSlot = property.facts.availableTourSlots.find((s) => /5:|6:|7:/.test(s));
    if (eveningSlot) {
      return { matchedSlot: eveningSlot, isTourRequest: true, customRequestedLabel: null };
    }
  }

  if (/morning|10:|11:/.test(lower)) {
    const morningSlot = property.facts.availableTourSlots.find((s) => /am/i.test(s));
    if (morningSlot) {
      return { matchedSlot: morningSlot, isTourRequest: true, customRequestedLabel: null };
    }
  }

  // Check if user requested a specific time outside listed slots
  const explicitTimeMatch = message.match(
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow)\s*(at)?\s*(\d{1,2}(:\d{2})?\s*(am|pm))?/i
  );
  if (explicitTimeMatch) {
    return {
      matchedSlot: property.facts.availableTourSlots[0],
      isTourRequest: true,
      customRequestedLabel: explicitTimeMatch[0],
    };
  }

  return {
    matchedSlot: property.facts.availableTourSlots[0],
    isTourRequest: true,
    customRequestedLabel: null,
  };
}

export function generateGroundedResponse(
  message: string,
  lead: LeadInquiry,
  property: PropertyListing,
  isInitialOutreach: boolean
): GroundedAnswer {
  const lower = message.toLowerCase();
  const firstName = getFirstName(lead.fullName);
  const f = property.facts;

  const groundedFields: string[] = [];
  const answerSegments: string[] = [];

  // Guardrail check for unverified or policy-exception questions
  if (/airbnb|vrbo|subleas|short-term/.test(lower)) {
    groundedFields.push('Lease / HOA Covenant Restrictions');
    return {
      replyText: `Per the listing record for ${property.shortLabel}: ${f.specialNotes} If you have another lease structure question, I can loop in ${f.coordinatorName} (${f.coordinatorRole}) directly.`,
      groundedFields,
      faqTag: 'Sublease / Covenant Policy',
      bookedSlot: null,
      escalatedToHuman: false,
    };
  }

  if (/paint|remodel|negotiate|lower the rent|discount|waive|section 8|voucher/.test(lower)) {
    return {
      replyText: `That request isn't pre-approved in the structured listing record for ${property.shortLabel}, so I won't guess or make a verbal commitment. I've flagged this note in GoHighLevel for ${f.coordinatorName} (${f.coordinatorRole}) to review and respond directly. Meanwhile, would you still like to hold ${f.availableTourSlots[0]} for a walkthrough?`,
      groundedFields: ['Supervised Escalation Rule'],
      faqTag: 'Human Review Escalation',
      bookedSlot: null,
      escalatedToHuman: true,
      escalationReason: `Prospect asked about custom terms/exception ("${message.slice(0, 60)}") outside verified PMS/MLS facts.`,
    };
  }

  // Grounded topic matching strictly from property.facts
  if (/pet|dog|cat|lab|animal|breed/.test(lower)) {
    groundedFields.push('Pet Policy');
    answerSegments.push(`Pets: ${f.petPolicy}`);
  }

  if (/park|garage|ev|charg|car|driveway/.test(lower)) {
    groundedFields.push('Parking & Garage');
    answerSegments.push(`Parking: ${f.parking}`);
  }

  if (/hoa|cdd|utilit|water|electric|trash|lawn|internet|fiber|extra fee|monthly fee|on top/.test(lower)) {
    groundedFields.push('HOA & Utilities');
    answerSegments.push(`HOA & Utilities: ${f.hoaAndUtilities}`);
  }

  if (/rent|price|deposit|cost|lease|income|credit|offer letter|financ|loan|closing/.test(lower)) {
    groundedFields.push('Pricing & Terms');
    answerSegments.push(`${f.priceDisplay}. ${f.priceDetail} Terms: ${f.leaseOrFinancing}`);
  }

  if (/roof|hvac|amenit|pool|gym|washer|dryer|balcony|office|spec|feature/.test(lower)) {
    groundedFields.push('Amenities & Specs');
    answerSegments.push(`Key highlights: ${f.amenities.slice(0, 3).join('; ')}.`);
  }

  if (/school|neighborhood|hospital|beach|zone|district|location/.test(lower)) {
    groundedFields.push('Location & Schools');
    answerSegments.push(`Location & Schools: ${f.neighborhoodAndSchools}`);
  }

  if (/availab|move-in|open|still available|when/.test(lower) && answerSegments.length === 0) {
    groundedFields.push('Availability');
    answerSegments.push(`Status: ${f.availability} (${f.bedsBathsSqft} at ${f.priceDisplay}).`);
  }

  const tourCheck = matchRequestedTourSlot(message, property);

  if (isInitialOutreach) {
    const intro = `Hi ${firstName} — thanks for reaching out via ${lead.portalSource} about ${property.title} (${f.priceDisplay}).`;
    const coreInfo =
      answerSegments.length > 0
        ? answerSegments.join(' ')
        : `It is currently active (${f.availability}; ${f.bedsBathsSqft}).`;
    if (groundedFields.length === 0) groundedFields.push('Availability', 'Pricing');

    const slotOffer = `We have open ${
      property.category === 'For Sale' ? 'private showing' : 'tour'
    } times on ${f.availableTourSlots[0]} or ${f.availableTourSlots[1]}. Reply with your preferred time and I'll lock it on ${f.coordinatorName}'s calendar.`;

    return {
      replyText: `${intro} ${coreInfo} ${slotOffer}`,
      groundedFields,
      faqTag: groundedFields[0] || 'Initial Lead Response',
      bookedSlot: null,
      escalatedToHuman: false,
    };
  }

  // Follow-up SMS booking confirmation
  if (tourCheck.isTourRequest && tourCheck.matchedSlot) {
    groundedFields.push('Showing Calendar');
    const prefix = answerSegments.length > 0 ? `${answerSegments.join(' ')} ` : '';
    const slotNote = tourCheck.customRequestedLabel
      ? `Confirmed — I matched your request (${tourCheck.customRequestedLabel}) to our verified open window: ${tourCheck.matchedSlot} with ${f.coordinatorName}.`
      : `Confirmed — I've reserved ${tourCheck.matchedSlot} for your ${
          property.category === 'For Sale' ? 'private showing' : 'guided tour'
        } with ${f.coordinatorName}.`;

    return {
      replyText: `${prefix}${slotNote} Calendar invite and access details for ${property.address} are synced to GoHighLevel. Reply RESCHEDULE anytime if plans shift.`,
      groundedFields,
      faqTag: 'Tour Confirmed & Synced',
      bookedSlot: tourCheck.matchedSlot,
      escalatedToHuman: false,
    };
  }

  if (answerSegments.length > 0) {
    return {
      replyText: `${answerSegments.join(' ')} Would you like me to hold ${f.availableTourSlots[0]} or ${f.availableTourSlots[1]} for a walkthrough?`,
      groundedFields,
      faqTag: groundedFields[0],
      bookedSlot: null,
      escalatedToHuman: false,
    };
  }

  // Unmatched question guardrail — never fabricate facts
  return {
    replyText: `I checked the verified ${property.systemSource} listing sheet for ${property.shortLabel} and don't have an explicit entry for that detail. Rather than guessing, I've logged your question for ${f.coordinatorName} (${f.coordinatorRole}) to confirm directly. In the meantime, our next open showing is ${f.availableTourSlots[0]} — want me to reserve it?`,
    groundedFields: ['Verified Record Guardrail'],
    faqTag: 'Escalated to Coordinator',
    bookedSlot: null,
    escalatedToHuman: true,
    escalationReason: 'Detail not present in structured PMS/MLS listing record; routed to human coordinator.',
  };
}

export function buildPipelineSteps(
  lead: LeadInquiry,
  property: PropertyListing,
  qualification: QualificationResult
): { steps: PipelineStep[]; totalResponseSeconds: number } {
  const baseSeed =
    lead.propertyId === 'jax-townhome'
      ? 14.2
      : lead.propertyId === 'meridian-multifamily'
      ? 11.8
      : 16.4;

  const s1 = Number((baseSeed * 0.14).toFixed(1));
  const s2 = Number((baseSeed * 0.42).toFixed(1));
  const s3 = Number((baseSeed * 0.78).toFixed(1));
  const s4 = baseSeed;

  const steps: PipelineStep[] = [
    {
      id: 'stage-webhook',
      stepNumber: 1,
      title: 'MLS / PMS Webhook Trigger & Lead Payload Parsed',
      component: `${lead.portalSource} → n8n Webhook`,
      summary: `Ingested inbound lead for ${property.recordId} (${lead.fullName}) and fetched structured property sheet from ${property.systemSource}.`,
      detailLine: `Contact deduplicated · Record ${property.recordId} loaded · 0 missing required fields`,
      elapsedSeconds: s1,
      status: 'pending',
    },
    {
      id: 'stage-router',
      stepNumber: 2,
      title: 'n8n Orchestration Router & Claude Qualification',
      component: 'n8n Workflow → Claude Structured Output',
      summary: `Classified as ${qualification.tier} (${qualification.score}/100) · Extracted topics: ${qualification.faqTags.join(', ')}.`,
      detailLine: `Strict grounding enabled (fact-sheet only) · Guardrail escalation active`,
      elapsedSeconds: s2,
      status: 'pending',
    },
    {
      id: 'stage-sms',
      stepNumber: 3,
      title: 'Instant Outbound SMS Dispatched (<30s) & Voice Fallback',
      component: 'GoHighLevel SMS + Voice Trigger',
      summary: `Delivered personalized, fact-grounded SMS to ${lead.phone} in ${s3}s. Outbound voice call armed at T+90s if no reply.`,
      detailLine: `A2P 10DLC verified sender · Tone: plain operational · No fabricated terms`,
      elapsedSeconds: s3,
      status: 'pending',
    },
    {
      id: 'stage-calendar',
      stepNumber: 4,
      title: 'Grounded Property FAQ & Calendar Sync Ready',
      component: 'GoHighLevel Calendar ↔ PMS / MLS Sync',
      summary: `Checked ${property.facts.coordinatorName}'s live availability (${property.facts.availableTourSlots.length} open windows) and prepared one-reply booking sync.`,
      detailLine: `Next open slot: ${property.facts.availableTourSlots[0]} · Pipeline stage updated`,
      elapsedSeconds: s4,
      status: 'pending',
    },
  ];

  return { steps, totalResponseSeconds: s4 };
}

export function buildVoiceTranscript(
  lead: LeadInquiry,
  property: PropertyListing,
  qualification: QualificationResult,
  bookedTour: BookedTour | null
): VoiceTranscriptTurn[] {
  const firstName = getFirstName(lead.fullName);
  const targetSlot = bookedTour ? bookedTour.slotLabel : property.facts.availableTourSlots[0];
  const f = property.facts;

  return [
    {
      id: 'v-1',
      speaker: 'System Action',
      timestamp: '00:00',
      text: `Outbound voice fallback triggered via GoHighLevel Voice API to ${lead.phone} (Lead Score: ${qualification.tier} · ${qualification.score}/100).`,
    },
    {
      id: 'v-2',
      speaker: 'AI Concierge',
      timestamp: '00:06',
      text: `Hi ${firstName}, this is the AI leasing assistant calling on behalf of ${f.coordinatorName} regarding your ${lead.portalSource} inquiry for ${property.title}. Do you have 30 seconds to confirm a couple details and lock in a showing?`,
    },
    {
      id: 'v-3',
      speaker: 'Lead',
      timestamp: '00:18',
      text: `Yes, hi — I just saw your text too. Just wanted to make sure the timing and ${
        property.category === 'For Sale' ? 'HOA details' : 'parking and pet rules'
      } line up before we drive over.`,
    },
    {
      id: 'v-4',
      speaker: 'AI Concierge',
      timestamp: '00:26',
      text:
        property.category === 'For Sale'
          ? `Confirmed from the MLS record: ${f.hoaAndUtilities} ${f.amenities[0]}. Since you noted "${lead.preApprovalOrIncome}", we have ${targetSlot} open with ${f.coordinatorName}. Should I book that window?`
          : `Confirmed directly from our ${property.systemSource} listing sheet: ${f.parking} And for pets: ${f.petPolicy} We have ${targetSlot} open with ${f.coordinatorName} — would you like me to reserve it?`,
    },
    {
      id: 'v-5',
      speaker: 'Lead',
      timestamp: '00:44',
      text: `That matches what we need. Go ahead and put us down for ${targetSlot}.`,
    },
    {
      id: 'v-6',
      speaker: 'System Action',
      timestamp: '00:49',
      text: `Appointment booked (${targetSlot}) → Synced to GoHighLevel Calendar & ${property.systemSource} (${property.recordId}). Confirmation SMS + calendar invite sent.`,
    },
  ];
}

export function createBookedTour(
  property: PropertyListing,
  slotLabel: string
): BookedTour {
  const codeNum = Math.floor(4100 + (property.id.length * 137 + slotLabel.length * 53) % 5800);
  return {
    id: `tour-${codeNum}`,
    slotLabel,
    tourType:
      property.category === 'For Sale' ? 'Private Buyer Showing' : 'In-Person Guided Tour',
    assignedCoordinator: `${property.facts.coordinatorName} (${property.facts.coordinatorRole})`,
    calendarSyncStatus: 'Confirmed in GoHighLevel',
    pmsSyncStatus: 'Synced',
    confirmationCode: `GHL-${codeNum}`,
  };
}

export function buildDynamicArchitecturePayloads(
  lead: LeadInquiry,
  property: PropertyListing,
  qualification: QualificationResult,
  bookedTour: BookedTour | null,
  responseTimeSeconds: number,
  lastFaqTag: string
) {
  const webhookPayload = {
    event: 'portal.lead.created',
    received_at: new Date().toISOString(),
    source_portal: lead.portalSource,
    pms_mls_record_id: property.recordId,
    source_system: property.systemSource,
    prospect: {
      full_name: lead.fullName,
      phone_e164: lead.phone,
      email: lead.email,
      stated_timeline: lead.timeline,
      screening_or_financing: lead.preApprovalOrIncome,
    },
    inquiry_body: lead.initialMessage,
    routing_policy: {
      sla_target_seconds: 30,
      grounding_mode: 'strict_structured_fact_sheet',
      human_fallback_owner: property.facts.coordinatorName,
    },
  };

  const claudeOutput = {
    model: 'claude-3-7-sonnet (structured-json)',
    grounding_verified: !qualification.humanEscalationRequired,
    qualification: {
      tier: qualification.tier,
      readiness_score: qualification.score,
      primary_intent: qualification.intent,
      detected_faq_tags: qualification.faqTags,
      latest_topic_tag: lastFaqTag,
    },
    guardrail_check: {
      hallucination_risk: 'blocked_by_schema',
      unverified_claim_escalation: qualification.humanEscalationRequired,
      escalation_reason: qualification.escalationReason ?? null,
    },
    next_best_action: qualification.recommendedAction,
  };

  const ghlSyncPayload = {
    crm_provider: 'GoHighLevel v2 API',
    contact_upsert: {
      name: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      pipeline_stage: bookedTour ? 'Tour Scheduled' : 'SMS Engaged — Awaiting Slot',
      tags: [
        lead.portalSource.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        `tier-${qualification.tier.toLowerCase()}`,
        property.recordId.toLowerCase(),
      ],
    },
    telemetry: {
      speed_to_lead_seconds: responseTimeSeconds,
      sms_dispatched: true,
      voice_fallback_armed: !bookedTour,
    },
    calendar_appointment: bookedTour
      ? {
          status: 'confirmed',
          confirmation_code: bookedTour.confirmationCode,
          slot: bookedTour.slotLabel,
          tour_type: bookedTour.tourType,
          assigned_user: property.facts.coordinatorName,
          pms_mls_writeback: `${property.systemSource} · ${bookedTour.pmsSyncStatus}`,
        }
      : {
          status: 'slots_offered',
          offered_windows: property.facts.availableTourSlots,
          assigned_user: property.facts.coordinatorName,
        },
  };

  return { webhookPayload, claudeOutput, ghlSyncPayload };
}
