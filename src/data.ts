export const BRAND = {
  name: 'Jeevan Global Logistics',
  short: 'Jeevan',
  tagline: 'Every leg of the journey.',
  email: 'jeevannar16@gmail.com',
  address: 'Kathmandu, Nepal',
  hours: 'Monday - Friday / 9AM - 6PM',
  countries: ['Nepal', 'India', 'China'],
}

export type Country = {
  id: string
  name: string
  lat: number
  lng: number
}

export const COUNTRIES: Country[] = [
  { id: 'np', name: 'Nepal', lat: 27.7172, lng: 85.324 },
  { id: 'in', name: 'India', lat: 28.6139, lng: 77.209 },
  { id: 'cn', name: 'China', lat: 31.2304, lng: 121.4737 },
  { id: 'ae', name: 'UAE', lat: 25.2048, lng: 55.2708 },
  { id: 'us', name: 'United States', lat: 34.0522, lng: -118.2437 },
  { id: 'gb', name: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { id: 'de', name: 'Germany', lat: 53.5511, lng: 9.9937 },
  { id: 'au', name: 'Australia', lat: -33.8688, lng: 151.2093 },
  { id: 'jp', name: 'Japan', lat: 35.6762, lng: 139.6503 },
]

export type Hub = {
  id: string
  country: string
  region: string
  timezone: string
  capabilities: string[]
}

export const HUBS: Hub[] = [
  {
    id: 'np',
    country: 'Nepal',
    region: 'South Asia',
    timezone: 'Asia/Kathmandu',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Warehousing & 3PL', 'Road Freight'],
  },
  {
    id: 'in',
    country: 'India',
    region: 'South Asia',
    timezone: 'Asia/Kolkata',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Road Freight'],
  },
  {
    id: 'cn',
    country: 'China',
    region: 'East Asia',
    timezone: 'Asia/Shanghai',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Warehousing & 3PL'],
  },
  {
    id: 'ae',
    country: 'UAE',
    region: 'Middle East',
    timezone: 'Asia/Dubai',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage'],
  },
  {
    id: 'us',
    country: 'United States',
    region: 'Americas',
    timezone: 'America/Los_Angeles',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Warehousing & 3PL'],
  },
  {
    id: 'gb',
    country: 'United Kingdom',
    region: 'Europe',
    timezone: 'Europe/London',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage'],
  },
  {
    id: 'de',
    country: 'Germany',
    region: 'Europe',
    timezone: 'Europe/Berlin',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Project Cargo'],
  },
  {
    id: 'au',
    country: 'Australia',
    region: 'Oceania',
    timezone: 'Australia/Sydney',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage', 'Warehousing & 3PL'],
  },
  {
    id: 'jp',
    country: 'Japan',
    region: 'East Asia',
    timezone: 'Asia/Tokyo',
    capabilities: ['Air Freight', 'Ocean Freight', 'Customs Brokerage'],
  },
]

export const NETWORK_REGIONS = ['South Asia', 'East Asia', 'Middle East', 'Americas', 'Europe', 'Oceania']

export const STATS = [
  { value: 100, suffix: '+', label: 'Shipments per month' },
  { value: 98, suffix: '%', label: 'On-time delivery rate' },
  { value: 2, suffix: '+', label: 'Years in operation' },
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
    desc: 'From regional lanes to international corridors, our partner network spans every major trade route your business relies on.',
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
    desc: 'Our licensed customs brokers keep your shipments moving within every regulatory requirement.',
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
    quote: 'Your client testimonial here. Replace this with a real review from a customer or partner who has shipped with you.',
    name: 'Your Client Name',
    role: 'Your role / title',
    org: 'Company Name',
  },
  {
    quote: 'Your client testimonial here. Replace this with a real review from a customer or partner who has shipped with you.',
    name: 'Your Client Name',
    role: 'Your role / title',
    org: 'Company Name',
  },
  {
    quote: 'Your client testimonial here. Replace this with a real review from a customer or partner who has shipped with you.',
    name: 'Your Client Name',
    role: 'Your role / title',
    org: 'Company Name',
  },
]

export const AIRLINES = [
  'Airline Partner 1',
  'Airline Partner 2',
  'Airline Partner 3',
  'Airline Partner 4',
  'Airline Partner 5',
  'Airline Partner 6',
  'Airline Partner 7',
  'Airline Partner 8',
]

export const SHIPPING_LINES = [
  'Shipping Line 1',
  'Shipping Line 2',
  'Shipping Line 3',
  'Shipping Line 4',
  'Shipping Line 5',
  'Shipping Line 6',
  'Shipping Line 7',
  'Shipping Line 8',
]

export const INSIGHTS = [
  {
    title: 'Your first insight title goes here',
    category: 'Case Studies',
    date: 'Jan 2026',
    accent: 'orange',
  },
  {
    title: 'Your second insight title goes here',
    category: 'Global',
    date: 'Feb 2026',
    accent: 'blue',
  },
  {
    title: 'Your third insight title goes here',
    category: 'Case Studies',
    date: 'Mar 2026',
    accent: 'orange',
  },
  {
    title: 'Your fourth insight title goes here',
    category: 'Customs Advice',
    date: 'Apr 2026',
    accent: 'blue',
  },
  {
    title: 'Your fifth insight title goes here',
    category: 'Global',
    date: 'May 2026',
    accent: 'orange',
  },
  {
    title: 'Your sixth insight title goes here',
    category: 'Case Studies',
    date: 'Jun 2026',
    accent: 'blue',
  },
]

export const FAQS = [
  {
    q: 'What services do you offer?',
    a: 'Replace this with a clear answer about your services — air freight, ocean freight, customs, warehousing, and more.',
  },
  {
    q: 'Which countries do you ship to?',
    a: 'Replace this with a clear answer about the destinations you cover.',
  },
  {
    q: 'How is freight pricing calculated?',
    a: 'Replace this with a clear answer about how you price shipments.',
  },
  {
    q: 'Do you provide customs clearance?',
    a: 'Replace this with a clear answer about your customs services.',
  },
  {
    q: 'Can you handle oversized or heavy cargo?',
    a: 'Replace this with a clear answer about project cargo and heavy lift.',
  },
  {
    q: 'How do I request a quote?',
    a: 'Replace this with a clear answer about how customers can request a quote.',
  },
]

export const NAV_LINKS = [
  { label: 'About', href: '#about', num: '01' },
  { label: 'Services', href: '#services', num: '02' },
  { label: 'Why Us', href: '#why-us', num: '03' },
  { label: 'Network', href: '#network', num: '04' },
  { label: 'Insights', href: '#insights', num: '05' },
  { label: 'Contact', href: '#contact', num: '06' },
]

export const CONTACT = {
  email: 'jeevannar16@gmail.com',
  address: 'Kathmandu, Nepal',
  hours: 'Monday - Friday / 9AM - 6PM',
  countries: ['Nepal', 'India', 'China'],
}

export const NEWS_TICKER = [
  'JEEVAN GLOBAL LOGISTICS EXPANDS APAC NETWORK',
  'US TARIFFS: REFUNDS. SECTION 301 DUTIES AND IMPORTS',
  'NEW: KATHMANDU OPERATIONAL HQ LIVE 24/7',
  'AIR FREIGHT RATES OUT OF APAC STABILIZE',
  'CUSTOMS DIGITAL CLEARANCE NOW IN 3 MARKETS',
  'PROJECT CARGO TEAM DEPLOYS FOR ENERGY SECTOR',
]

export const PRELOADER_COUNTRIES = [
  'NEPAL',
  'INDIA',
  'CHINA',
  'HONG KONG',
  'AUSTRALIA',
  'USA',
  'UNITED KINGDOM',
  'GERMANY',
  'JAPAN',
  'UAE',
]

export const PRELOADER_SERVICES = [
  'OCEAN FREIGHT',
  'AIR FREIGHT',
  'CUSTOMS BROKERAGE',
  'WAREHOUSING & 3PL',
  'PROJECT CARGO',
  'DOMESTIC & LINEHAUL',
]

export const HOME_STATS = [
  { value: 9, suffix: '', label: 'Countries' },
  { value: 5, suffix: '', label: 'Freight Modes' },
  { value: 24, suffix: '/7', label: 'Support' },
  { value: 774, suffix: '+', label: 'Shipments / month' },
  { value: 95, suffix: '%', label: 'On-time' },
]

export const INDUSTRIES = [
  { title: 'Retail & FMCG', desc: 'High-frequency distribution and demanding lead times across APAC retail lanes.' },
  { title: 'Manufacturing', desc: 'MRO, raw material and finished goods flows for production reliability.' },
  { title: 'Energy & Infrastructure', desc: 'Project cargo and oversized equipment with engineered routing.' },
  { title: 'Healthcare', desc: 'Temperature-controlled, time-critical movement of medical goods.' },
  { title: 'Agriculture', desc: 'Seasonal, perishable cargo handled with careful scheduling.' },
  { title: 'Defence & Sensitive Cargo', desc: 'Specialist, discreet logistics under strict compliance.' },
]

export const LOCATIONS = [
  { type: 'HEAD OFFICE', city: 'KATHMANDU', code: 'NEPAL', detail: 'Operational HQ · 24/7' },
  { type: 'GATEWAY', city: 'INDIA', code: 'NEW DELHI', detail: 'Air + ocean gateway' },
  { type: 'GATEWAY', city: 'CHINA', code: 'SHANGHAI', detail: 'Ocean + project cargo' },
  { type: 'GATEWAY', city: 'HONG KONG', code: 'HKG', detail: 'Airfreight hub' },
]

export const REASONS = [
  'Air Freight',
  'Sea Freight',
  'Brokerage',
  'Consolidation Programs',
  '3PL',
  'Crossdock / By-pass',
  'Domestic & Interstate',
  'APAC Emerging Markets',
  'Tariff / Compliance Audits',
  'Careers',
  'Partnership',
  'Other',
]

export const INSIGHT_CATEGORIES = [
  { label: 'CASE STUDIES', count: 3 },
  { label: 'CUSTOMS ADVICE', count: 2 },
  { label: 'GLOBAL', count: 3 },
  { label: 'ASIA PACIFIC', count: 4 },
  { label: 'AMERICAS', count: 2 },
  { label: 'LINKEDIN', count: 6 },
]
