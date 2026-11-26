import { LeadInquiry, PropertyListing } from '../types/operations';

export const PROPERTIES: PropertyListing[] = [
  {
    id: 'jax-townhome',
    recordId: 'PMS-JAX-4412',
    systemSource: 'AppFolio PMS',
    shortLabel: 'Jax Beach Townhome',
    title: '124 Beachwalk Ln — Coastal 3BR Townhome',
    address: '124 Beachwalk Ln, Jacksonville Beach, FL 32250',
    category: 'Rental',
    imageUrl: '/src/assets/images/property_jax_townhome_1795723476109.jpg',
    facts: {
      priceDisplay: '$3,450 / mo',
      priceDetail: 'Security deposit $3,450 (1 month rent). $75 application fee per adult.',
      availability: 'Available Dec 15, 2026 (move-in flexible through Jan 5, 2027)',
      bedsBathsSqft: '3 Bed · 2.5 Bath · 1,940 sq ft',
      petPolicy:
        'Up to 2 pets permitted (dogs or cats, max 60 lbs each). $350 one-time non-refundable pet fee per pet + $35/mo pet rent. Restricted breeds per HOA insurance policy.',
      petAllowed: true,
      parking:
        'Attached 2-car private garage + 2-car paver driveway (4 spaces total). No overnight street parking per HOA rules.',
      leaseOrFinancing:
        '12-month or 18-month lease. Minimum 3x monthly rent verifiable gross income and 660+ credit score.',
      hoaAndUtilities:
        'HOA dues, exterior lawn care, and weekly trash collection included in rent. Tenant pays electric (Beaches Energy), water/sewer, and fiber internet.',
      amenities: [
        'Attached 2-car garage with epoxy floor',
        'Second-floor covered balcony with glass rail',
        'Quartz kitchen island & stainless appliances',
        'In-unit full-size washer & dryer',
        '5-block walk to public beach access',
      ],
      neighborhoodAndSchools:
        'South Jacksonville Beach residential enclave. Assigned schools: Seabreeze Elementary, Fletcher Middle, Fletcher High.',
      specialNotes:
        'No short-term subleasing (Airbnb/VRBO strictly prohibited by HOA covenants). Smoke-free residence.',
      showingHours: 'Mon–Sat 9:00 AM – 6:00 PM EST (30-min guided tours)',
      availableTourSlots: [
        'Thu Dec 3 · 4:00 PM EST',
        'Fri Dec 4 · 11:30 AM EST',
        'Sat Dec 5 · 10:00 AM EST',
      ],
      coordinatorName: 'Hannah Brooks',
      coordinatorRole: 'Senior Leasing Coordinator',
    },
    samplePrompts: [
      'Is it pet friendly for a 45 lb lab?',
      "What's the parking setup?",
      'Can I tour Thursday at 4 PM?',
      'Are utilities or lawn care included?',
    ],
  },
  {
    id: 'meridian-multifamily',
    recordId: 'YRD-MRD-0408',
    systemSource: 'Yardi Voyager PMS',
    shortLabel: 'The Meridian (Class A)',
    title: 'The Meridian — Unit 408 (Class A Multifamily)',
    address: '410 Riverfront Plaza, Unit 408, Jacksonville, FL 32202',
    category: 'Rental',
    imageUrl: '/src/assets/images/property_class_a_multifamily_1795723477750.jpg',
    facts: {
      priceDisplay: '$2,790 / mo',
      priceDetail: '$500 security deposit with approved credit. 1 month free on 14-month lease.',
      availability: 'Immediate move-in available (turn-ready today)',
      bedsBathsSqft: '2 Bed · 2 Bath · 1,285 sq ft · 4th Floor Corner',
      petPolicy:
        'Pet-friendly community: up to 2 pets, no weight limit for non-restricted breeds. $300 pet fee + $25/mo pet rent. On-site dog wash & courtyard pet run.',
      petAllowed: true,
      parking:
        'Structured access-controlled garage: 1 reserved space included ($0). Second space $110/mo. 8 Level-2 EV charging stations on Garage Level P1.',
      leaseOrFinancing:
        '12-, 14-, or 15-month leases. Verifiable income 3x rent (offer letters accepted for relocating medical/corporate professionals).',
      hoaAndUtilities:
        'Flat $95/mo amenity & utility bundle covers 1Gbps building fiber, valet trash, and pest control. Resident pays individual submetered electric & water.',
      amenities: [
        'Resort courtyard pool & fire-pit lounge',
        '24/7 commercial fitness studio & Peloton room',
        'Level-2 EV charging stations (P1 garage)',
        'Private co-working suites & package lockers',
        'Floor-to-ceiling balcony overlooking courtyard',
      ],
      neighborhoodAndSchools:
        'Downtown Southbank / Riverfront district — 6 minutes to Baptist Medical Center & MD Anderson.',
      specialNotes:
        'Evening self-guided smart-lock tours available until 7:30 PM with ID verification; agent-led tours until 6:00 PM.',
      showingHours: 'Daily 9:00 AM – 7:30 PM EST (Agent-led until 6:00 PM)',
      availableTourSlots: [
        'Thu Dec 3 · 5:30 PM EST',
        'Fri Dec 4 · 6:15 PM EST',
        'Sat Dec 5 · 1:00 PM EST',
      ],
      coordinatorName: 'Devon Alvarez',
      coordinatorRole: 'Leasing Operations Manager',
    },
    samplePrompts: [
      'Do you have EV charging and covered parking?',
      'Can I book an evening tour Thursday at 5:30 PM?',
      'Are medical residency offer letters accepted?',
      'What monthly fees are on top of base rent?',
    ],
  },
  {
    id: 'ponte-vedra-sfr',
    recordId: 'MLS-NEF-2094812',
    systemSource: 'NEFAR MLS',
    shortLabel: 'Ponte Vedra SFR ($785K)',
    title: '213 Sycamore Ridge Dr — 4BR Craftsman Residence',
    address: '213 Sycamore Ridge Dr, Ponte Vedra, FL 32081',
    category: 'For Sale',
    imageUrl: '/src/assets/images/property_sfr_listing_1795723479832.jpg',
    facts: {
      priceDisplay: '$785,000',
      priceDetail: 'List price · Seller open to 30-day closing. Recent inspection summary available.',
      availability: 'Active MLS Listing · Vacant & ready for immediate closing',
      bedsBathsSqft: '4 Bed · 3 Bath · 2,860 sq ft · 0.24-acre lot',
      petPolicy:
        'Fee-simple single-family ownership. Community HOA allows up to 3 household pets; fenced backyard ready.',
      petAllowed: true,
      parking:
        'Oversized 2-car attached garage (24 ft deep) + wide asphalt driveway accommodating 4 additional vehicles.',
      leaseOrFinancing:
        'Conventional, VA, or Cash offers accepted. Proof of funds or lender pre-approval letter required prior to private buyer showing.',
      hoaAndUtilities:
        'HOA dues $145/month (covers community pavilion, walking trails, and common landscaping). No CDD fee. Estimated St. Johns County property tax ~$6,840/yr.',
      amenities: [
        'Architectural shingle roof replaced in 2023 (transferable warranty)',
        'Dual-zone Carrier HVAC (2022) & tankless gas water heater',
        'Covered front porch & screened rear lanai',
        'First-floor primary suite & dedicated home office',
        'Top-rated St. Johns County A-rated school corridor',
      ],
      neighborhoodAndSchools:
        'Sycamore Ridge (Nocatee border). Zoned for Ocean Palms Elementary, Landrum Middle, and Ponte Vedra High School.',
      specialNotes:
        'Listing broker provides full Seller Disclosure & 2023 Roof Certification upon showing confirmation.',
      showingHours: 'Tue–Sun 9:00 AM – 5:30 PM EST (By confirmed appointment)',
      availableTourSlots: [
        'Fri Dec 4 · 2:00 PM EST',
        'Sat Dec 5 · 10:30 AM EST',
        'Sun Dec 6 · 1:30 PM EST',
      ],
      coordinatorName: 'Claire Thornton',
      coordinatorRole: 'Listing Operations Specialist',
    },
    samplePrompts: [
      'What are the HOA dues and roof age?',
      'Which schools is the home zoned for?',
      'Can we schedule a private showing Saturday at 10:30 AM?',
      'Is there a CDD fee on this property?',
    ],
  },
];

export const SAMPLE_LEADS: Record<string, LeadInquiry> = {
  'jax-townhome': {
    id: 'lead-1001',
    propertyId: 'jax-townhome',
    fullName: 'Marcus Vance',
    phone: '(904) 555-0184',
    email: 'm.vance@atlanticlogistics.example',
    portalSource: 'Zillow Rental Manager',
    timeline: 'Move-in Jan 1, 2027 (Relocating)',
    preApprovalOrIncome: 'Verified 4.2x rent · Credit 740+',
    initialMessage:
      'Hi, relocating to Jax Beach in January. Is 124 Beachwalk Ln still open? We have a 45 lb yellow lab and need two garage spots. Hoping to tour this week.',
    receivedAtLabel: 'Just now · Webhook #WH-9841',
  },
  'meridian-multifamily': {
    id: 'lead-1002',
    propertyId: 'meridian-multifamily',
    fullName: 'Dr. Elena Rostova',
    phone: '(904) 555-0149',
    email: 'erostova.md@coastalhealth.example',
    portalSource: 'Apartments.com',
    timeline: 'Move-in within 21 days',
    preApprovalOrIncome: 'Signed hospital offer letter (5.1x rent)',
    initialMessage:
      'Interested in Unit 408 at The Meridian. Starting at Baptist Medical next month—do you have EV charging in the garage and any evening tours available?',
    receivedAtLabel: 'Just now · Webhook #WH-9842',
  },
  'ponte-vedra-sfr': {
    id: 'lead-1003',
    propertyId: 'ponte-vedra-sfr',
    fullName: 'David & Sarah Lin',
    phone: '(904) 555-0192',
    email: 'dlin.family@northflorida.example',
    portalSource: 'MLS / Realtor.com',
    timeline: 'Ready to close in 30–45 days',
    preApprovalOrIncome: 'Pre-approved Conventional up to $850K',
    initialMessage:
      'We are pre-approved up to $850K and want to know the monthly HOA dues, roof age, and whether we can book a private showing Saturday morning.',
    receivedAtLabel: 'Just now · Webhook #WH-9843',
  },
};
