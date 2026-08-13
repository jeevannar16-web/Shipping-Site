export type Hub = {
  id: string
  name: string
  region: string
  lat: number
  lng: number
  throughput: string
  transit: string
  offices: number
  integration: string
}

export const HUBS: Hub[] = [
  {
    id: 'melbourne',
    name: 'Melbourne',
    region: 'Australia',
    lat: -37.8136,
    lng: 144.9631,
    throughput: '2.4M TEU / yr',
    transit: '38 hrs',
    offices: 12,
    integration: 'CargoWise, MachShip',
  },
  {
    id: 'auckland',
    name: 'Auckland',
    region: 'New Zealand',
    lat: -36.8485,
    lng: 174.7633,
    throughput: '1.1M TEU / yr',
    transit: '44 hrs',
    offices: 6,
    integration: 'CargoWise',
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    region: 'Hong Kong SAR',
    lat: 22.3193,
    lng: 114.1694,
    throughput: '18M TEU / yr',
    transit: '22 hrs',
    offices: 21,
    integration: 'CargoWise, MachShip',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    region: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    throughput: '37M TEU / yr',
    transit: '18 hrs',
    offices: 15,
    integration: 'CargoWise',
  },
  {
    id: 'losangeles',
    name: 'Los Angeles',
    region: 'Americas',
    lat: 34.0522,
    lng: -118.2437,
    throughput: '9.8M TEU / yr',
    transit: '31 hrs',
    offices: 34,
    integration: 'CargoWise, MachShip',
  },
  {
    id: 'london',
    name: 'London',
    region: 'Europe',
    lat: 51.5074,
    lng: -0.1278,
    throughput: '5.3M TEU / yr',
    transit: '27 hrs',
    offices: 28,
    integration: 'CargoWise',
  },
  {
    id: 'hamburg',
    name: 'Hamburg',
    region: 'Europe',
    lat: 53.5511,
    lng: 9.9937,
    throughput: '8.5M TEU / yr',
    transit: '25 hrs',
    offices: 19,
    integration: 'MachShip',
  },
]

export const SERVICES = [
  {
    title: 'Air Freight',
    tag: 'Priority uplift',
    desc: 'Time-critical air cargo solutions with dedicated charter capability across 120+ gateways.',
    stat: '120+ gateways',
  },
  {
    title: 'Ocean Freight',
    tag: 'LCL & FCL',
    desc: 'Full and less-than-container load solutions with guaranteed space programs on major lanes.',
    stat: '37M TEU capacity',
  },
  {
    title: 'Customs Brokerage',
    tag: 'Compliance',
    desc: 'End-to-end customs clearance, tariff engineering and duty optimisation in 40 markets.',
    stat: '40 markets',
  },
  {
    title: 'Warehousing & 3PL',
    tag: 'Distribution',
    desc: 'Smart warehousing with real-time inventory visibility, kitting and final-mile fulfilment.',
    stat: '1.2M m² space',
  },
  {
    title: 'Project Cargo',
    tag: 'Heavy lift',
    desc: 'Oversized and project logistics — route surveys, OOG handling and turnkey delivery.',
    stat: 'Global OOG fleet',
  },
  {
    title: 'Road Freight',
    tag: 'Last mile',
    desc: 'Cross-border road network connecting ports, hubs and distribution centres across continents.',
    stat: '90+ countries',
  },
]

export const INSIGHTS = [
  {
    title: 'Global supply chain resilience: 2026 outlook',
    category: 'Industry Insights',
    date: 'Aug 2026',
    read: '8 min read',
    accent: 'orange',
  },
  {
    title: 'Customs reform in Asia-Pacific — what importers need to know',
    category: 'Customs Advice',
    date: 'Jul 2026',
    read: '6 min read',
    accent: 'blue',
  },
  {
    title: 'United Carriers named Global Freight Forwarder of the Year',
    category: 'Awards',
    date: 'Jun 2026',
    read: '3 min read',
    accent: 'orange',
  },
  {
    title: 'Ocean rate volatility and smart hedging strategies',
    category: 'Market Intelligence',
    date: 'Jun 2026',
    read: '10 min read',
    accent: 'blue',
  },
  {
    title: 'Our net-zero logistics roadmap is now live',
    category: 'Sustainability',
    date: 'May 2026',
    read: '5 min read',
    accent: 'orange',
  },
  {
    title: 'Automating document processing with AI at the border',
    category: 'Technology',
    date: 'Apr 2026',
    read: '7 min read',
    accent: 'blue',
  },
]

export const TICKER_ITEMS = [
  'Global Network Operating at 99.4% Efficiency',
  '7 Strategic Hubs',
  '120+ Countries Served',
  'CargoWise Certified',
  'ISO 9001:2025',
  'Real-Time Visibility on MachShip',
]
