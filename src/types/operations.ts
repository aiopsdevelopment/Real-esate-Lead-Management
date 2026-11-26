export type ListingCategory = 'Rental' | 'For Sale';

export type PortalSource =
  | 'Zillow Rental Manager'
  | 'Apartments.com'
  | 'MLS / Realtor.com'
  | 'Zillow Premier Agent';

export type QualificationTier = 'Hot' | 'Warm' | 'Nurture';

export interface PropertyFacts {
  priceDisplay: string;
  priceDetail: string;
  availability: string;
  bedsBathsSqft: string;
  petPolicy: string;
  petAllowed: boolean;
  parking: string;
  leaseOrFinancing: string;
  hoaAndUtilities: string;
  amenities: string[];
  neighborhoodAndSchools: string;
  specialNotes: string;
  showingHours: string;
  availableTourSlots: string[];
  coordinatorName: string;
  coordinatorRole: string;
}

export interface PropertyListing {
  id: string;
  recordId: string;
  systemSource: 'AppFolio PMS' | 'Yardi Voyager PMS' | 'NEFAR MLS';
  shortLabel: string;
  title: string;
  address: string;
  category: ListingCategory;
  imageUrl: string;
  facts: PropertyFacts;
  samplePrompts: string[];
}

export interface LeadInquiry {
  id: string;
  propertyId: string;
  isCustom?: boolean;
  fullName: string;
  phone: string;
  email: string;
  portalSource: PortalSource;
  timeline: string;
  preApprovalOrIncome: string;
  initialMessage: string;
  receivedAtLabel: string;
}

export type PipelineStageStatus = 'pending' | 'running' | 'completed';

export interface PipelineStep {
  id: string;
  stepNumber: number;
  title: string;
  component: string;
  summary: string;
  detailLine: string;
  elapsedSeconds: number;
  status: PipelineStageStatus;
}

export interface SmsMessage {
  id: string;
  sender: 'lead' | 'ai' | 'system';
  body: string;
  timestamp: string;
  groundedFields?: string[];
  escalatedToHuman?: boolean;
}

export interface VoiceTranscriptTurn {
  id: string;
  speaker: 'AI Concierge' | 'Lead' | 'System Action';
  timestamp: string;
  text: string;
}

export interface QualificationCriterion {
  label: string;
  observation: string;
  impact: 'Positive' | 'Neutral' | 'Needs Review';
}

export interface QualificationResult {
  tier: QualificationTier;
  score: number;
  intent: string;
  faqTags: string[];
  recommendedAction: string;
  humanEscalationRequired: boolean;
  escalationReason?: string;
  criteria: QualificationCriterion[];
}

export interface BookedTour {
  id: string;
  slotLabel: string;
  tourType: 'In-Person Guided Tour' | 'Private Buyer Showing';
  assignedCoordinator: string;
  calendarSyncStatus: 'Confirmed in GoHighLevel' | 'Awaiting Slot Confirmation';
  pmsSyncStatus: 'Synced' | 'Pending';
  confirmationCode: string;
}

export interface LiveSessionState {
  lead: LeadInquiry;
  property: PropertyListing;
  pipelineSteps: PipelineStep[];
  responseTimeSeconds: number;
  isSimulating: boolean;
  messages: SmsMessage[];
  voiceTurns: VoiceTranscriptTurn[];
  qualification: QualificationResult;
  bookedTour: BookedTour | null;
  faqsAnsweredCount: number;
  lastFaqTag: string;
}
