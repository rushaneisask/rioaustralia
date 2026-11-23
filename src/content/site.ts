/**
 * ALL site copy lives in this file. Components never hard-code text.
 *
 * HONESTY RULES (see CLAUDE.md, and CLAUDE.local.md for the owner-confirmed facts):
 * - Only claim what the owner has confirmed. Commitments about the future are fine,
 *   present-tense claims must be true today.
 * - No reviews, testimonials, ratings, stats, or named clients.
 * - Anything unknown is null + a TODO, never an invented value.
 */

export type Division = {
  slug: string;
  name: string;
  short: string;
  brand: "cleaning";
  summary: string;
  href: string;
};

export type MethodStepId = "dust" | "wipe" | "bins" | "vacuum" | "mop";

export const site = {
  name: "RIO Australia",
  legalName: null as string | null, // TODO: add the registered company name once confirmed
  url: "https://rioaustralia.com.au",
  tagline: "Commercial cleaning, done properly.",
  description:
    "RIO Australia provides commercial cleaning for offices, medical and dental clinics and real estate agencies across south-east Melbourne, from Cranbourne to Mornington. Police-checked cleaners, fixed weekly schedules, free on-site quotes.",
  foundedDate: "2020-07-02",
  foundedLabel: "Since 2020",
  region: "South-east Melbourne & the Mornington Peninsula",

  contact: {
    phone: "0421 799 458",
    phoneHref: "tel:+61421799458",
    smsHref: "sms:+61421799458",
    email: null as string | null, // TODO: add once the business email exists (e.g. admin@rioaustralia.com.au)
    abn: null as string | null, // TODO: add the ABN once confirmed
    hours: null as string | null, // TODO: confirm phone hours before showing any
  },

  nav: [
    { label: "Cleaning", href: "/cleaning/" },
    { label: "Our method", href: "/cleaning/#method" },
    { label: "Service areas", href: "/cleaning/#areas" },
    { label: "FAQ", href: "/cleaning/#faq" },
  ],
  navCta: { label: "Get a free quote", href: "/contact/" },

  /* ---------------------------------------------------------------- */
  /* Group hub ( / )                                                    */
  /* ---------------------------------------------------------------- */
  home: {
    seoTitle: "RIO Australia | Commercial Cleaning in South-East Melbourne",
    eyebrow: "RIO Australia · Since 2020",
    title: ["Spaces that feel", "fresh every", "morning."],
    titleAccentIndex: 1,
    lead:
      "We keep offices, clinics and agencies spotless on a fixed weekly schedule, so your team and your clients walk into a clean, calm space every day.",
    primaryCta: { label: "Get a free quote", href: "/contact/" },
    secondaryCta: { label: "See how we clean", href: "/cleaning/#method" },
    trustPoints: [
      "Police-checked cleaners",
      "Free on-site quote",
      "1 to 5 cleans a week",
    ],

    standsFor: {
      eyebrow: "What RIO stands for",
      title: "Reliable people. Repeatable results.",
      lead:
        "Cleaning only works when it happens the same way, every time. Everything we do is built around that.",
      pillars: [
        {
          title: "Reliable",
          body: "Fixed days, fixed scope, the same trained cleaners. You never have to chase us or wonder if we came.",
        },
        {
          title: "Thorough",
          body: "A set order on every visit: high surfaces down to floors, so dust never lands on something already cleaned.",
        },
        {
          title: "Honest",
          body: "A free walkthrough of your site, a written quote and a clear scope. What we quote is what we clean.",
        },
      ],
    },

    divisions: {
      eyebrow: "Our services",
      title: "Commercial cleaning",
      lead:
        "RIO Australia's cleaning team looks after workplaces across south-east Melbourne and the Mornington Peninsula.",
      cta: "Explore commercial cleaning",
    },

    who: {
      eyebrow: "Who we clean for",
      title: "Built for places that can't look anything less than clean.",
      items: [
        {
          title: "Offices",
          body: "Law firms, accountants, finance and every kind of office: desks, kitchens, meeting rooms and washrooms.",
        },
        {
          title: "Medical & dental clinics",
          body: "Waiting rooms, consult rooms and washrooms cleaned with care, on the schedule your clinic runs to.",
        },
        {
          title: "Real estate & agencies",
          body: "Shopfront agencies where the first impression happens at the front door and the front window.",
        },
      ],
      note:
        "Today our cleaners look after bank branches across the Mornington Peninsula, as well as medical centres and offices in between.",
    },

    how: {
      eyebrow: "How it works",
      title: "From first call to first clean.",
    },

    finalCta: {
      title: "Let's walk through your site.",
      body: "We'll visit, look at what needs doing and give you a written quote, free and with no obligation.",
      primary: { label: "Request a free quote", href: "/contact/" },
      secondary: { label: "Call 0421 799 458", href: "tel:+61421799458" },
    },
  },

  /* ---------------------------------------------------------------- */
  /* Cleaning division ( /cleaning )                                    */
  /* ---------------------------------------------------------------- */
  cleaning: {
    seoTitle: "Commercial Cleaning Cranbourne to Mornington | RIO Australia",
    seoDescription:
      "Office, medical, dental and real estate agency cleaning across south-east Melbourne and the Mornington Peninsula. 1 to 5 cleans a week, police-checked cleaners, free on-site quotes.",
    eyebrow: "RIO Australia Cleaning",
    title: ["Commercial cleaning", "that never skips", "a step."],
    titleAccentIndex: 2,
    lead:
      "Regular cleaning for offices, medical and dental clinics and real estate agencies, from Cranbourne down to Mornington. One to five cleans a week, done the same thorough way every time.",
    primaryCta: { label: "Get a free quote", href: "/contact/" },
    secondaryCta: { label: "Watch our method", href: "#method" },

    services: {
      eyebrow: "Services",
      title: "What we clean.",
      items: [
        {
          id: "commercial",
          title: "Commercial cleaning",
          body: "Scheduled cleaning from one to five times a week. Desks, kitchens, washrooms, bins and floors, cleaned in the same order every visit.",
          points: ["1 to 5 cleans per week", "Offices, clinics & agencies", "Written scope for your site"],
        },
        {
          id: "steam",
          title: "Steam cleaning",
          body: "High-temperature steam that lifts ground-in grime and refreshes surfaces that a regular clean can't reach.",
          points: ["Deep refresh between regular cleans", "Book once-off or add to your schedule"],
        },
        {
          id: "windows",
          title: "Window cleaning",
          body: "Streak-free glass inside and out, including shopfronts and windows up to 10 metres high.",
          points: ["Up to 10 m in height", "Shopfronts & office glass"],
        },
      ],
    },

    method: {
      eyebrow: "Our method",
      title: "Top to bottom. Every single visit.",
      lead:
        "Dust falls, so we clean from high to low and finish on the floor. Scroll to watch a full clean of an office.",
      steps: [
        {
          id: "dust" as MethodStepId,
          label: "Dust",
          title: "Dust first, from high to low.",
          body: "Shelves, monitors, sills and desk tops are dusted before anything is wiped, so nothing settles on a clean surface.",
        },
        {
          id: "wipe" as MethodStepId,
          label: "Wipe",
          title: "Every desk, wiped clean.",
          body: "Desks, benches and touch points are wiped down with fresh microfibre, leaving surfaces clear and streak-free.",
        },
        {
          id: "bins" as MethodStepId,
          label: "Bins",
          title: "Bins emptied, liners replaced.",
          body: "Every bin is emptied and given a fresh liner, so the room smells as clean as it looks.",
        },
        {
          id: "vacuum" as MethodStepId,
          label: "Vacuum",
          title: "Carpets vacuumed edge to edge.",
          body: "Carpet is vacuumed in even passes, under desks and along the edges where dust collects.",
        },
        {
          id: "mop" as MethodStepId,
          label: "Mop",
          title: "Floors mopped last.",
          body: "Hard floors are mopped once everything above them is done, and left dry, clean and ready for the morning.",
        },
      ],
      done: "Ready for the morning.",
    },

    process: {
      eyebrow: "Getting started",
      title: "Simple from the first call.",
      steps: [
        {
          title: "Call or request a quote",
          body: "Tell us about your site: what kind of business, roughly how big, and how often you'd like it cleaned.",
        },
        {
          title: "Free on-site walkthrough",
          body: "We visit your site, look at every room and talk through what matters most to you.",
        },
        {
          title: "Written quote & scope",
          body: "You get a clear written quote listing what we clean and how often. No surprises.",
        },
        {
          title: "Your first clean",
          body: "We start on the agreed day and check in after the first visit to make sure everything is right.",
        },
        {
          title: "The same high standard, every week",
          body: "Your regular schedule runs on fixed days, and you can reach us directly any time something needs attention.",
        },
      ],
    },

    assurances: {
      eyebrow: "Our commitments",
      title: "What you can count on.",
      items: [
        {
          title: "Police-checked, trained cleaners",
          body: "Everyone who cleans your site is police-checked and trained in our method.",
        },
        {
          title: "Certificate of currency up front",
          body: "You'll have our public liability certificate of currency before anyone starts on your site.",
        },
        {
          title: "Free, no-obligation quote",
          body: "We walk your site and quote in writing, free. You only commit once you're happy.",
        },
        {
          title: "Fixed schedule, clear scope",
          body: "Agreed days and a written scope mean you always know what's being cleaned and when.",
        },
        {
          title: "Fixed contracts, done properly",
          body: "We focus on regular commercial clients, so your site gets consistent attention every week.",
        },
        {
          title: "Talk to us directly",
          body: "Call or text 0421 799 458. No call centre, no ticket numbers.",
        },
      ],
    },

    areas: {
      eyebrow: "Service areas",
      title: "Cranbourne to Mornington.",
      lead:
        "We clean across south-east Melbourne and the Mornington Peninsula. If you're nearby but not listed, ask us anyway.",
      list: [
        "Cranbourne",
        "Cranbourne North",
        "Cranbourne East",
        "Clyde North",
        "Lynbrook",
        "Lyndhurst",
        "Carrum Downs",
        "Skye",
        "Langwarrin",
        "Frankston",
        "Seaford",
        "Pearcedale",
        "Baxter",
        "Somerville",
        "Tyabb",
        "Hastings",
        "Mount Eliza",
        "Mornington",
        "Mount Martha",
      ],
    },

    faq: {
      eyebrow: "FAQ",
      title: "Questions businesses ask us.",
      items: [
        {
          q: "How much does commercial cleaning cost?",
          a: "It depends on your site: its size, the number of rooms and washrooms, what needs cleaning and how many times a week. We visit for free, look at everything and give you a written quote.",
        },
        {
          q: "How often can you clean?",
          a: "Anywhere from once to five times a week. Most offices and clinics choose a schedule that matches how busy they are.",
        },
        {
          q: "Are your cleaners police-checked?",
          a: "Yes. Everyone who cleans for RIO Australia is police-checked and trained in our cleaning method.",
        },
        {
          q: "Can I see your insurance?",
          a: "Yes. You'll receive our public liability certificate of currency before anyone starts work on your site.",
        },
        {
          q: "Which areas do you cover?",
          a: "South-east Melbourne and the Mornington Peninsula, from Cranbourne and the surrounding suburbs down to Mornington and Mount Martha.",
        },
        {
          q: "Do you clean windows on upper floors?",
          a: "We clean windows up to 10 metres high, inside and out, including shopfronts.",
        },
        {
          q: "Do you clean homes or holiday rentals?",
          a: "No. We focus on regular commercial cleaning contracts for offices, clinics and agencies, so we can give those sites our full attention.",
        },
      ],
    },

    finalCta: {
      title: "Ready for a cleaner workplace?",
      body: "Book a free on-site walkthrough and get a written quote for your site.",
      primary: { label: "Request a free quote", href: "/contact/" },
      secondary: { label: "Call 0421 799 458", href: "tel:+61421799458" },
    },
  },

  /* ---------------------------------------------------------------- */
  /* Contact ( /contact )                                               */
  /* ---------------------------------------------------------------- */
  contactPage: {
    seoTitle: "Get a Free Cleaning Quote | RIO Australia",
    seoDescription:
      "Request a free on-site walkthrough and written quote for commercial cleaning in south-east Melbourne and the Mornington Peninsula.",
    eyebrow: "Free quote",
    title: "Tell us about your site.",
    lead:
      "Share a few details and we'll get back to you to book a free on-site walkthrough. Prefer to talk? Call or text us.",
    sideTitle: "Rather talk?",
    sideBody: "Call or text and speak with us directly. No call centre.",
    form: {
      name: "Your name",
      business: "Business name",
      phone: "Phone",
      email: "Email",
      businessType: "Type of business",
      businessTypes: ["Office", "Medical clinic", "Dental clinic", "Real estate agency", "Other"],
      suburb: "Suburb",
      size: "Approximate size",
      sizeHint: "Floor area in m², or number of rooms and washrooms",
      frequency: "Cleans per week",
      frequencies: ["1", "2", "3", "4", "5", "Not sure yet"],
      services: "Services you're interested in",
      message: "Anything else we should know?",
      messageHint: "Access times, special areas, current issues",
      submit: "Send my quote request",
      sending: "Sending…",
      required: "Required",
      successTitle: "Thanks, we've got it.",
      successBody: "We'll be in touch shortly to book your free walkthrough.",
      fallbackTitle: "One more step",
      fallbackBody:
        "Online sending isn't switched on yet. Tap below to send your details to us by text message, or call us directly.",
      fallbackSms: "Send by text message",
      fallbackEmail: "Send by email",
      errorBody: "Something went wrong sending your request. Please call or text us instead.",
      errors: {
        name: "Please enter your name.",
        phoneOrEmail: "Please give us a phone number or email so we can reply.",
        email: "That email doesn't look right.",
        suburb: "Please enter your suburb.",
        tooFast: "That was quick! Please check your details and try again.",
      },
    },
  },

  footer: {
    blurb:
      "Commercial cleaning for offices, clinics and agencies across south-east Melbourne and the Mornington Peninsula.",
    rights: "All rights reserved.",
  },

  notFound: {
    title: "This page has been tidied away.",
    body: "The page you're looking for doesn't exist. Let's get you back somewhere clean.",
    cta: "Back to home",
  },
} as const;

export const divisions: Division[] = [
  {
    slug: "cleaning",
    name: "RIO Australia Cleaning",
    short: "Cleaning",
    brand: "cleaning",
    summary:
      "Scheduled commercial cleaning, steam cleaning and window cleaning for offices, clinics and agencies.",
    href: "/cleaning/",
  },
];
