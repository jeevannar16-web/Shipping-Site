export type Country = {
  id: string
  name: string
  lat: number
  lng: number
}

export const COUNTRIES: Country[] = [
  { id: 'au', name: 'Australia', lat: -33.8688, lng: 151.2093 },
  { id: 'nz', name: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { id: 'hk', name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { id: 'cn', name: 'China', lat: 31.2304, lng: 121.4737 },
  { id: 'vn', name: 'Vietnam', lat: 10.8231, lng: 106.6297 },
  { id: 'us', name: 'United States', lat: 34.0522, lng: -118.2437 },
  { id: 'th', name: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { id: 'de', name: 'Germany', lat: 53.5511, lng: 9.9937 },
  { id: 'gb', name: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
]

export const STATS = [
  { value: 2500, suffix: '+', label: 'Shipments per month' },
  { value: 98.2, suffix: '%', label: 'On-time delivery rate', decimals: 1 },
  { value: 8, suffix: '+', label: 'Years in operation' },
]

export const SERVICES = [
  {
    title: 'Air Freight',
    desc: 'Express, priority, and deferred options across global trade lanes — managed end to end for speed and schedule integrity.',
    tag: 'Speed',
  },
  {
    title: 'Ocean Freight',
    desc: 'FCL, LCL, and specialised cargo movements, with structured carrier selection and routing for cost and reliability.',
    tag: 'Reliability',
  },
  {
    title: 'Customs Brokerage',
    desc: 'In-house licensed brokerage covering classification, compliance, and quarantine — full control, no outsourcing.',
    tag: 'Compliance',
  },
  {
    title: 'Warehousing & 3PL',
    desc: 'Scalable storage, pick and pack, and distribution — fully integrated with freight and transport operations.',
    tag: 'Scale',
  },
  {
    title: 'Project Cargo',
    desc: 'Specialist handling for oversized and complex shipments — from permits to engineered load configurations.',
    tag: 'Specialist',
  },
  {
    title: 'Domestic & Linehaul Transport',
    desc: 'Local, metro, and interstate transport managed for consistent service levels and full delivery visibility.',
    tag: 'Coverage',
  },
]

export const FEATURES = [
  {
    title: 'Real-Time Freight Tracking',
    desc: 'Know exactly where your cargo is at every milestone. Live visibility means faster decisions and zero guesswork.',
  },
  {
    title: 'Global Network Coverage',
    desc: 'From APAC lanes to international corridors, our partner network spans every major trade route your business relies on.',
  },
  {
    title: '24/7 Customer Support',
    desc: 'Real people, always available. Whether it is a routine update or an urgent issue, we pick up the phone and we own the outcome.',
  },
]

export const WHY_US = [
  {
    title: 'One Point of Contact',
    desc: 'No more chasing multiple vendors. One team manages your entire shipment from origin to destination.',
  },
  {
    title: 'Full Supply Chain Visibility',
    desc: 'Track your freight in real time and get proactive updates before issues become delays.',
  },
  {
    title: 'Compliance You Can Trust',
    desc: 'Our licensed customs brokers keep your shipments moving within every regulatory requirement across APAC.',
  },
  {
    title: 'Competitive, Transparent Pricing',
    desc: 'No hidden fees. Clear, competitive pricing backed by responsive sales support throughout the shipment.',
  },
  {
    title: 'Fast Issue Resolution',
    desc: 'When something unexpected happens, we do not point fingers — we solve it. Our team acts immediately to protect your timeline.',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'My business would not function without this team. Extremely talented with immense experience tailoring each consignment based on its merits. We have our dedicated account managers that know our business, are responsive and provide personalised service which we never had with bigger companies. UC for the win.',
    name: 'Thomas Munro',
    role: 'Director',
    org: 'Picha Group',
  },
  {
    quote:
      'As a first-time supplier shipping equipment to support one of the major Australian infrastructure projects I came up against uncharted territories. It was a three-month discovery and mobilisation period until the first shipment left its origin airborne for Melbourne. Our first-time-right delivery to my customer\u2019s 3PL was no coincidence.',
    name: 'Francis Fung',
    role: 'APAC Supply Chain Operations Director, US Fortune 500 Telecom and Communications Supplier',
    org: 'CommScope',
  },
  {
    quote:
      'I worked closely with Chris over several years to build a seamless, cost-effective supply chain for one of Australia\u2019s largest fashion retail companies. Chris was not only able to help us streamline our operations throughout Asia and shorten our time to market, but through his willingness to negotiate great rates, also provide significant cost savings.',
    name: 'Alex Hughes',
    role: 'Senior Management',
    org: 'Factory X',
  },
]

export const AIRLINES = [
  'Air China',
  'Vietnam Airlines',
  'British Airways',
  'Fiji Airways',
  'Malaysia Airlines',
  'China Southern',
  'Qatar Airways',
  'China Eastern',
  'Qantas',
  'Air New Zealand',
  'Etihad',
  'Cathay Pacific',
  'Singapore Airlines',
  'Emirates',
  'Air India',
  'Thai Airways',
]

export const SHIPPING_LINES = [
  'CMA CGM',
  'Wallenius Wilhelmsen',
  'Sinotrans',
  'NYK Line',
  'K-Line',
  'COSCO',
  'Evergreen Line',
  'Yang Ming',
  'PIL',
  'MSC',
  'HMM',
  'Maersk',
  'APL',
  'Hapag-Lloyd',
]

export const INSIGHTS = [
  {
    title: 'Reduced Import Delays & Storage Costs Across 700+ Containers',
    category: 'Case Studies',
    date: 'Jul 8, 2026',
    accent: 'orange',
  },
  {
    title: 'Cost-Optimised and Speed to Market Import Program for New Truck Launch in Australia',
    category: 'Case Studies',
    date: 'Jul 10, 2026',
    accent: 'blue',
  },
  {
    title: 'Grid-Scale Battery Project Logistics Delivery for Renewable Energy Infrastructure',
    category: 'Case Studies',
    date: 'Jul 10, 2026',
    accent: 'orange',
  },
  {
    title: 'Time-Critical Oversized Sewer Tank Delivery to Residential Estate Development',
    category: 'Case Studies',
    date: 'Jul 10, 2026',
    accent: 'blue',
  },
  {
    title: 'Global shipping rates soar as retailers race to beat looming tariffs',
    category: 'Global',
    date: 'Jul 13, 2026',
    accent: 'orange',
  },
  {
    title: 'US Tariffs: Refunds, Section 301 Duties and Importer Advice',
    category: 'Customs Advice',
    date: 'Aug 2026',
    accent: 'blue',
  },
]

export const FAQS = [
  {
    q: 'What does United Carriers do?',
    a: 'United Carriers is a global freight forwarding and logistics provider delivering end-to-end supply chain solutions, including airfreight, seafreight, customs brokerage, warehousing, and transport.',
  },
  {
    q: 'What industries do you specialise in?',
    a: 'We support a broad range of industries including retail, fashion, food & beverage, industrial, project cargo, and technology.',
  },
  {
    q: 'What shipping methods do you offer?',
    a: 'We offer airfreight, seafreight (FCL & LCL), breakbulk, RO/RO, and multimodal transport solutions.',
  },
  {
    q: 'Do you provide customs clearance services?',
    a: 'Yes, we offer in-house customs brokerage to manage import and export clearances efficiently.',
  },
  {
    q: 'Can you handle oversized or heavy cargo?',
    a: 'Yes, we specialise in project cargo including out-of-gauge (OOG) and heavy lift shipments.',
  },
  {
    q: 'How do I request a quote?',
    a: 'You can contact us via our website, email, or phone with your shipment details.',
  },
]

export const NAV_LINKS = [
  { label: 'About', href: '#about', num: '01' },
  { label: 'Services', href: '#services', num: '02' },
  { label: 'Why Us', href: '#why-us', num: '03' },
  { label: 'Insights', href: '#insights', num: '04' },
  { label: 'FAQ', href: '#faq', num: '05' },
  { label: 'Contact', href: '#contact', num: '06' },
]

export const CONTACT = {
  email: 'contact@unitedcarriers.com',
  phone: '1300 000 082',
  phoneHref: 'tel:1300000082',
  address: '2A International Square, Tullamarine VIC 3043, Australia',
  hours: 'Monday - Friday / 8:30AM - 5PM',
  countries: ['Australia', 'New Zealand', 'Hong Kong', 'China'],
}
