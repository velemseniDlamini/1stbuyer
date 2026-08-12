import type { LanguageCode } from './i18n'

export type BuyingGoal = 'first-time' | 'trade-in' | 'replacing' | 'additional' | 'browsing'

export type EmploymentStatus =
  | 'Permanently employed'
  | 'Contract employed'
  | 'Self-employed'
  | 'Unemployed'

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  memberSince: string
  province: string
  city: string
  employmentStatus: EmploymentStatus
  // Net (take-home) monthly income — after tax and deductions, not gross.
  monthlyIncome: number
  buyingGoal: BuyingGoal
  creditScore: number
  creditBureau: string
  buyingPower: number
  journeyProgress: number
  savedListings: number
  dateOfBirth: string | null
  licenseIssuedDate: string | null
  expenseRent: number
  expenseChildSupport: number
  expenseLoanRepayments: number
  expenseGroceries: number
  expenseOther: number
  selectedCarId: string | null
  rightsAcknowledged: boolean
  rightsAcknowledgedAt: string | null
  language: LanguageCode
}

export function totalMonthlyExpenses(user: UserProfile): number {
  return (
    user.expenseRent +
    user.expenseChildSupport +
    user.expenseLoanRepayments +
    user.expenseGroceries +
    user.expenseOther
  )
}

export function disposableIncome(user: UserProfile): number {
  return user.monthlyIncome - totalMonthlyExpenses(user)
}

export const user: UserProfile = {
  id: 'demo',
  firstName: 'Thabo',
  lastName: 'Mokoena',
  memberSince: 'Jan 2026',
  province: 'Gauteng',
  city: 'Johannesburg',
  employmentStatus: 'Permanently employed',
  monthlyIncome: 32000,
  buyingGoal: 'first-time',
  creditScore: 712,
  creditBureau: 'TransUnion',
  buyingPower: 285000,
  journeyProgress: 43,
  savedListings: 5,
  dateOfBirth: '1996-04-12',
  licenseIssuedDate: '2015-06-01',
  expenseRent: 8500,
  expenseChildSupport: 0,
  expenseLoanRepayments: 2200,
  expenseGroceries: 3500,
  expenseOther: 1500,
  selectedCarId: null,
  rightsAcknowledged: false,
  rightsAcknowledgedAt: null,
  language: 'en',
}

export const creditHistory = [
  { month: 'Aug', score: 668 },
  { month: 'Sep', score: 675 },
  { month: 'Oct', score: 684 },
  { month: 'Nov', score: 690 },
  { month: 'Dec', score: 701 },
  { month: 'Jan', score: 712 },
]

export type CreditBand = {
  label: string
  range: string
  min: number
  rate: string
  color: string
}

export const creditBands: CreditBand[] = [
  { label: 'Excellent', range: '700+', min: 700, rate: 'Prime −0.5% to Prime +1%', color: 'var(--success)' },
  { label: 'Good', range: '650–699', min: 650, rate: 'Prime +1% to Prime +2.5%', color: 'var(--gold)' },
  { label: 'Fair', range: '600–649', min: 600, rate: 'Prime +2.5% to Prime +4%', color: 'var(--warning)' },
  { label: 'Poor', range: '550–599', min: 550, rate: 'Prime +4% to Prime +6%', color: '#fb923c' },
  { label: 'Very Poor', range: '<550', min: 0, rate: 'Cash purchase recommended', color: 'var(--destructive)' },
]

export function bandFor(score: number): CreditBand {
  return creditBands.find((b) => score >= b.min) ?? creditBands[creditBands.length - 1]
}

export const scoreFactors = [
  { label: 'Payment history', value: 92, weight: 'High impact' },
  { label: 'Credit utilisation', value: 68, weight: 'High impact' },
  { label: 'Length of credit history', value: 74, weight: 'Medium impact' },
  { label: 'Recent inquiries', value: 81, weight: 'Low impact' },
]

export const PRIME_RATE = 11.75

export type Stage = {
  id: number
  key: string
  title: string
  tagline: string
  description: string
  time: string
  status: 'completed' | 'current' | 'locked'
  actions: { label: string; done: boolean }[]
  href?: string
}

// journey_stages content is shared/global reference data — every user reads
// the same rows. Per-user progress is derived here from real, verifiable
// completion signals rather than a single stored percentage:
//   - "know-yourself" is complete only once validateKnowYourself() passes
//     (see lib/journey-validation.ts) — real fields, not a button click.
//   - "know-rights" is complete only once the user has ticked the
//     acknowledgment checkbox on that stage.
//   - Stages beyond that have no defined real trigger yet, so the next one
//     is shown as "current" (reachable) and the rest stay "locked" rather
//     than faking progress with an arbitrary percentage.
export function deriveStageStatuses(
  stages: Stage[],
  opts: { knowYourselfComplete: boolean; rightsComplete: boolean },
): Stage[] {
  const sorted = [...stages].sort((a, b) => a.id - b.id)
  let currentAssigned = false

  function statusFor(index: number, forcedComplete?: boolean): Stage['status'] {
    if (forcedComplete !== undefined) {
      if (forcedComplete) return 'completed'
      if (!currentAssigned) {
        currentAssigned = true
        return 'current'
      }
      return 'locked'
    }
    if (!currentAssigned) {
      currentAssigned = true
      return 'current'
    }
    return 'locked'
  }

  return sorted.map((stage, i) => {
    let status: Stage['status']
    if (stage.key === 'know-yourself') {
      status = statusFor(i, opts.knowYourselfComplete)
    } else if (stage.key === 'know-rights') {
      status = opts.knowYourselfComplete ? statusFor(i, opts.rightsComplete) : 'locked'
    } else {
      status = opts.knowYourselfComplete && opts.rightsComplete ? statusFor(i) : 'locked'
    }
    return { ...stage, status }
  })
}

export const journeyStages: Stage[] = [
  {
    id: 1,
    key: 'know-yourself',
    title: 'Know Yourself',
    tagline: 'Discovery',
    description: 'Build your financial profile and discover your realistic buying power.',
    time: '10 min',
    status: 'completed',
    actions: [
      { label: 'Complete financial health questionnaire', done: true },
      { label: 'Connect your credit score', done: true },
      { label: 'Set your buying goal', done: true },
    ],
    href: '/know-yourself',
  },
  {
    id: 2,
    key: 'know-rights',
    title: 'Know Your Rights',
    tagline: 'Education',
    description: 'Learn what dealerships can and cannot do under the CPA and NCA.',
    time: '15 min',
    status: 'completed',
    actions: [
      { label: 'CPA rights module', done: true },
      { label: 'NCA protections module', done: true },
      { label: 'Red Flag Detector quiz', done: true },
    ],
    href: '/rights',
  },
  {
    id: 3,
    key: 'know-market',
    title: 'Know The Market',
    tagline: 'Research',
    description: 'Compare vehicles, depreciation and total cost of ownership for SA.',
    time: '20 min',
    status: 'current',
    actions: [
      { label: 'Compare 3 vehicles', done: true },
      { label: 'Run depreciation calculator', done: false },
      { label: 'Estimate total cost of ownership', done: false },
    ],
    href: '/explore',
  },
  {
    id: 4,
    key: 'know-deal',
    title: 'Know Your Deal',
    tagline: 'Financing',
    description: 'Pre-qualify, compare interest rates and understand balloon payments.',
    time: '15 min',
    status: 'locked',
    actions: [
      { label: 'Finance pre-qualification', done: false },
      { label: 'Deposit impact analysis', done: false },
      { label: 'Affordability stress test', done: false },
    ],
    href: '/finance',
  },
  {
    id: 5,
    key: 'find-car',
    title: 'Find Your Car',
    tagline: 'Dealerships',
    description: 'Find trusted, CPA-compliant dealerships and compare their offers.',
    time: 'Ongoing',
    status: 'locked',
    actions: [
      { label: 'Find nearby dealerships', done: false },
      { label: 'Book a test drive', done: false },
      { label: 'Compare dealer offers', done: false },
    ],
    href: '/explore',
  },
  {
    id: 6,
    key: 'seal-deal',
    title: 'Seal The Deal',
    tagline: 'Documentation',
    description: 'Upload documents, analyse quotations and generate negotiation points.',
    time: '30 min',
    status: 'locked',
    actions: [
      { label: 'Upload required documents', done: false },
      { label: 'Analyse quotation for red flags', done: false },
      { label: 'Generate negotiation points', done: false },
    ],
    href: '/documents',
  },
  {
    id: 7,
    key: 'protect-ride',
    title: 'Protect Your Ride',
    tagline: 'Insurance & Aftercare',
    description: 'Compare insurance, manage your policy and track your warranty.',
    time: '20 min',
    status: 'locked',
    actions: [
      { label: 'Compare insurance quotes', done: false },
      { label: 'Activate 6-month CPA warranty tracker', done: false },
      { label: 'Set roadworthy renewal reminder', done: false },
    ],
    href: '/insurance',
  },
]

export const tips = [
  {
    tag: 'CPA Section 56',
    text: 'Used cars from a registered dealer carry an implied 6-month warranty on engine, gearbox and essential components — even if the contract says "voetstoots".',
  },
  {
    tag: 'NCA',
    text: 'Credit providers must assess your affordability. If credit was granted recklessly, a court can set the agreement aside or restructure your repayments.',
  },
  {
    tag: 'eNaTIS',
    text: 'You must lodge your change of ownership within 21 days of purchase at your Registering Authority. A Roadworthy Certificate is valid for 60 days.',
  },
  {
    tag: 'Deposit',
    text: 'A minimum deposit of around 10% is typical. A bigger deposit lowers your monthly instalment and the total interest you pay.',
  },
]

export type Provider = {
  id: number
  name: string
  tagline: string
  monthly: number
  bestFor: string
  features: string[]
  rating: number
  coverage: 'Comprehensive' | 'Third-Party F&T' | 'Third-Party'
}

export const insuranceProviders: Provider[] = [
  { id: 1, name: 'Discovery Insure', tagline: 'Vitality Drive rewards', monthly: 1180, bestFor: 'Best Rewards', features: ['Telematics up to 50% back', 'Vehicle panic button', 'Fuel & data rewards'], rating: 4.5, coverage: 'Comprehensive' },
  { id: 2, name: 'OUTsurance', tagline: 'You always get something OUT', monthly: 1090, bestFor: 'Best Value', features: ['OUTbonus every 3 years', '24/7 roadside', 'Fixed premiums'], rating: 4.6, coverage: 'Comprehensive' },
  { id: 3, name: 'King Price', tagline: 'Premiums that decrease', monthly: 940, bestFor: 'Cheapest Start', features: ['Decreasing premiums', 'Chilli pay-per-k', 'Up to 70% savings'], rating: 4.2, coverage: 'Comprehensive' },
  { id: 4, name: 'MiWay', tagline: 'Digital-first insurer', monthly: 1010, bestFor: 'Best App', features: ['Pay-as-you-drive', 'Micashback', 'Fully digital claims'], rating: 4.3, coverage: 'Comprehensive' },
  { id: 5, name: 'Santam', tagline: 'Insurance good and proper', monthly: 1260, bestFor: 'Best Coverage', features: ['100+ years experience', 'MultiBonus', '48-hour response'], rating: 4.4, coverage: 'Comprehensive' },
  { id: 6, name: 'Momentum Insure', tagline: 'Safety Returns', monthly: 1150, bestFor: 'Best for Families', features: ['Up to 30% cashback', 'Safety panic button', 'Excess buster'], rating: 4.1, coverage: 'Comprehensive' },
]

// Real dealership branches — extracted from the listing pages themselves
// (each Super Group Dealerships listing states its actual selling branch).
// No rating, review count, CPA/NCR compliance status, or "years trading" is
// shown for these because none of that is verifiable from the source data —
// fabricating it would misrepresent a real business.
export type Dealer = {
  id: string
  name: string
  city: string
  province: string
  brands: string[]
  website: string
}

export const dealers: Dealer[] = [
  { id: 'suzuki-boksburg', name: 'Suzuki Boksburg', city: 'Boksburg', province: 'Gauteng', brands: ['Hyundai'], website: 'https://supergroupdealerships.co.za' },
  { id: 'grand-central-motors-fca', name: 'Grand Central Motors FCA', city: 'Midrand', province: 'Gauteng', brands: ['Hyundai', 'Jeep'], website: 'https://supergroupdealerships.co.za' },
  { id: 'tommy-martin-eagle-canyon', name: 'Tommy Martin Eagle Canyon', city: 'Honeydew, Randburg', province: 'Gauteng', brands: ['Ford', 'Volkswagen', 'BMW', 'Chery'], website: 'https://supergroupdealerships.co.za' },
  { id: 'mercedes-benz-stellenbosch', name: 'Mercedes-Benz Stellenbosch', city: 'Stellenbosch', province: 'Western Cape', brands: ['Ford'], website: 'https://supergroupdealerships.co.za' },
  { id: 'jlr-east-rand', name: 'Jaguar Land Rover East Rand', city: 'East Rand', province: 'Gauteng', brands: ['GWM'], website: 'https://supergroupdealerships.co.za' },
  { id: 'vw-rustenburg', name: 'Volkswagen Rustenburg', city: 'Rustenburg', province: 'North West', brands: ['Audi'], website: 'https://supergroupdealerships.co.za' },
  { id: 'mercedes-benz-paarl', name: 'Mercedes-Benz Paarl', city: 'Paarl', province: 'Western Cape', brands: ['Mercedes-Benz'], website: 'https://supergroupdealerships.co.za' },
  // Real dealers verified via CMH's careers sitemap (cmh.co.za) and Toyota
  // SA's official dealer-locator sitemap (toyota.co.za) — both permit
  // ClaudeBot in robots.txt — to cover the provinces Super Group doesn't
  // operate in.
  { id: 'cmh-kempster-ford-durban-south', name: 'CMH Kempster Ford Durban South', city: 'Durban', province: 'KwaZulu-Natal', brands: ['Ford'], website: 'https://cmh.co.za' },
  { id: 'cfao-toyota-port-elizabeth', name: 'CFAO Mobility Toyota Port Elizabeth', city: 'Gqeberha', province: 'Eastern Cape', brands: ['Toyota'], website: 'https://www.toyota.co.za' },
  { id: 'cfao-toyota-bloemfontein', name: 'CFAO Mobility Toyota Bloemfontein', city: 'Bloemfontein', province: 'Free State', brands: ['Toyota'], website: 'https://www.toyota.co.za' },
  { id: 'upington-toyota', name: 'Upington Toyota', city: 'Upington', province: 'Northern Cape', brands: ['Toyota'], website: 'https://www.toyota.co.za' },
  { id: 'cfao-toyota-limpopo', name: 'CFAO Mobility Toyota Limpopo', city: 'Polokwane', province: 'Limpopo', brands: ['Toyota'], website: 'https://www.toyota.co.za' },
  { id: 'motus-toyota-nelspruit', name: 'Motus Toyota Nelspruit', city: 'Mbombela', province: 'Mpumalanga', brands: ['Toyota'], website: 'https://www.toyota.co.za' },
]

export type Car = {
  id: string
  title: string
  brand: string
  year: number
  mileage: number
  price: number
  marketValue: number
  fuel: string
  transmission: string
  dealerId: string
  image: string
  listingUrl?: string
}

// Real current listings scraped from Super Group Dealerships
// (supergroupdealerships.co.za), a real South African dealer group whose
// robots.txt explicitly permits ClaudeBot. marketValue is set equal to price
// since these are live asking prices, not averages — no artificial discount
// is implied. Images are the dealer's own signed CloudFront listing photos
// (these signed URLs expire eventually and will need re-scraping).
export const cars: Car[] = [
  { id: 'c1', title: 'Hyundai Tucson 2.0 Premium Auto', brand: 'Hyundai', year: 2017, mileage: 117795, price: 214900, marketValue: 214900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'suzuki-boksburg', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/f83dcccc880eaafcbe3822666141a76c.jpg?Expires=1788508830&Signature=hvWE6RdWQJwYR1YHqh2ubJNqQc6TThJ6lYUvQ6-XB~R74jTSrRzq0L0EIzOQ6t45ZMRrwQOjBqCJ1X1CJBfNGDfMt5H1IaH8YDVJPuRpkiBjG0voXPPd7AP7YT0bFAuqX0jqzH86x~AwGhzR5L8Pe54RN1fRBYhI1v9yIcZyEaIDSdGkabdNM5Sc-bLTh0spqlSJxffxmbMKV2v9EXVx5hUB-LkqlXtP4lQ7PbrQav~GJYdJxAyTTVAg-eRu1Me6M01UO~~~pYCSibPoxyI9Nnkg5Wimhwh8zoZC1WMqIJGsqk4kSzfeXeMJ9lTIZEpgJ5YoVAqDEH9vG7X52aznww__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/hyundai/tucson/681-a086ucpr363036/' },
  { id: 'c2', title: 'Hyundai i20 1.4 Fluid A/T', brand: 'Hyundai', year: 2018, mileage: 78419, price: 199900, marketValue: 199900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'suzuki-boksburg', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/1a40990f971ae5dcb5728b87625afd7a.jpg?Expires=1788422959&Signature=CwOqCv4kSbc-MoqZ8Mx0smiykp574Gqla31gZm1lUQv-KNIAccsCm~fR73aC8crjJHq8Q1YULNjmQ5gVv4D1yexTHEB86wf-S8aEgS~cfTcCH5-X5lS~GOI~7PZh8Jil0~Gtt2Zs8w8cLt03jg4FlfWN7Fgbh~FtyUERjB26QbJnV62q952KwMqkygt0BZGCAuh~DHjCtlDK6jq24LWsRuavMQ54uIPuSq8qm7Dygt0RTHhPzpEdNiUUxuOxxwdXImpNPX0azkLjeBA3oOngxONCaUYItk2ME5BVhHE268mcZtoP17-amXn0A~yZ3M4VEFT6EsoBnCCLt5qmjerW6Q__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/hyundai/i20/681-a086ucpr516563/' },
  { id: 'c3', title: 'Hyundai Creta 1.6 Executive', brand: 'Hyundai', year: 2020, mileage: 76003, price: 229995, marketValue: 229995, fuel: 'Petrol', transmission: 'Manual', dealerId: 'grand-central-motors-fca', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/6edef8114c021b6eeeb03ec271c38495.jpg?Expires=1787478044&Signature=utpKP5Bqy4nvWLgxrhU8~7zKTzmYsQfHrxwgzmVlTH5v-xdeccoSGat1Xbl4jhPNX10osq9IE6TJI~f7UiSlfaas6BZtR9eSJuikkkO1K-opYMCCX6NdHr4-fRe9gO1ARVrL1Mpq5G14TKlEv4dt-BJbcrq83PZflLDGYsBom~C0CbBtjmmte51RMRWHL7cvDc-3pxjd6b4gj8atsmwOAS-blZc0XXSIACPQOh0ZoLemoX0BML16Qdv1Gg4G3dgU638Zf6g~0jqD00NSgjAooHtVe91b8y~otGa0fudRPgVt0~5l-byD9HFCCBXIyCTd8SgTLsSVTvUz8e2gu4QsOw__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/hyundai/creta/698-a085ucpr657302/' },
  { id: 'c4', title: 'Ford Ranger 3.0T V6 Double Cab Raptor 4WD', brand: 'Ford', year: 2024, mileage: 42967, price: 989900, marketValue: 989900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'tommy-martin-eagle-canyon', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/3a649b990660098b2fead9efb0dae903.jpg?Expires=1787130129&Signature=ZtyRlRoSCStj5~f0zRXXo1NVkEZSb0e76~5cfN3xV4LnEKIKP-EzOCh0j85kka1gNRn-9IDR229r-wrhG-Xn8exbN8GFct6I9dUmhTnMHytfbxsWPve7o~QtyzlVS8m3WidaNsNEehZJxz5eXtp3Q0Mb~pcK8YYaZo3v3Ur9GXoXoZX5MNJR0dPgnDpDMG-Oms8bXUVHiOq99HKRoSrsaZhvWJY45x8A1162qbCtkoZenOdpDXCmjJ6RMA~Cc9NQ22jCyhUjbmI4xKNV5P6fKuBhWX7tiXN3Blzi99f54T2EeK0b5St73cYOL6HXmFW8lbxoYvPFsuLV1Nep~HSYag__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/ford/ranger/678-a065demg73606/' },
  { id: 'c5', title: 'Volkswagen Polo Vivo 1.4', brand: 'Volkswagen', year: 2024, mileage: 40200, price: 195800, marketValue: 195800, fuel: 'Petrol', transmission: 'Manual', dealerId: 'tommy-martin-eagle-canyon', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/b1b5d21649d4baee3506bc46b6f4d399.jpg?Expires=1787155307&Signature=qjPAqVOMcXO~je1yrMPMTxdhOGg26y0EZL7Xcxm1Q05a3PPDOR9GyS0Upe6cHJN8UeVqL1pD9uxPHJvd7dxmr2PZh0ims~JFwYQKb5YqyQ15qdzxKXW7rjz97Mx4dnhBDDhoL5M6UmCk4vYWulPmeaNXDdrJcIOgvPHKNjP4JIHlDJ3gYKzxjlz2Ndp8r-tOI5AbGCc0ZL9-tAHwUxbLcM88XE4kLl0UY85ujvthNTJmDA8JWROfgFVxIXVG-xerR1FEH3V4ppSq61SnwYIOdoy0W11HaMxS2KO6fyscuwRKfXvaqviorIb8JlwUjlJ34ZAqlBxjGmZJDAg8gDZijw__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/volkswagen/polo-vivo/678-a065dem002871/' },
  { id: 'c6', title: 'BMW 1 Series 118i M Sport A/T (F40)', brand: 'BMW', year: 2024, mileage: 63500, price: 589900, marketValue: 589900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'tommy-martin-eagle-canyon', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/918fd7ef1f7ea0de2e125afac12b2f29.jpg?Expires=1787130387&Signature=UFazZa1esLqiP~HQ2SGznd~heBv1jCk5v5peQsRONZAlst7DZ2j6qafkFSSBhGPaPxOkyDzqlfpqmT~JgNsoGSTlSqZl-KNcQk5qOZ3inUhbx4stfVnksxHwJqcrWvnxCcSo8m~9pTOGZnmc0b12KtloUe38B~tBVDRlAclF6ZMk~glIKtNHvMtaWj38xaHIBgPIx1xE0bZvjuGR5uGxVVBdMJ0sS6zCd2mqWbKrRvOac~oHRGnoxmilVi4aeaK65AcAsA2MrntMEDRiq0Bvn3C3SXy-G0xmynZnCsnSCjKars0LomHaY1~-APOBBg4uaHGvCHw-DYvDHnaGejtWew__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/bmw/1-series/678-a065ucprm91440/' },
  { id: 'c7', title: 'Ford Figo Hatch 1.5 Trend Auto', brand: 'Ford', year: 2020, mileage: 49000, price: 199900, marketValue: 199900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'mercedes-benz-stellenbosch', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/bd6deba1cfd74b9f984d973d3dfe4635.jpg?Expires=1787432808&Signature=d83Bu3iNwAFqdnYVHux-iT2XYdTZj~oaDpR6hbJnZuMk9S094cIdeKAanBARt6od6qzlXiT5bwZ3t5kBJd7fu1e6SaUCfjdFUbN4cGKCnYEk2a1wuO5R74hSCFpy~0lkLR6Y~ct~MoH84TH9sByTnM-PbmpRBExN4I0qKwK-DP6UdbSD974URaqmfNj0RwgDRlv6LtVsBVQYHbyn5cSaBfNQ7XbyBqk0fZF76pUfiUUFscI0R61g9Ueu~LgEVpMTqLExx3rG9WCLYypnpwd7bj5lE2AISYHxY2WNFTcbWiCUTNv5LgkmhDUilqZytYGFHXTV1agZwVUnKEuO1xhXfA__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/ford/figo/782-386575/' },
  { id: 'c8', title: 'Jeep Grand Cherokee L 3.6L Limited', brand: 'Jeep', year: 2023, mileage: 34613, price: 689995, marketValue: 689995, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'grand-central-motors-fca', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/41a6ab34ffa43c7c899bfdfee1e8e2a0.jpg?Expires=1788422434&Signature=Xq6H9huX1SjtNOXxJpH140DigM~m1d~K3tq-oMAmOkYS0Cft9~hTDjAt7XqCHf1KN4tIibkfuZ8spZHuMOm8lSQaNbEst2mdcPDtKu2XBto9FXn~e~A117~k~Nvw~meZTFEZbuAEUxD~zzoMA1Fn47MUNPJN3S2ZOC61gyPQ7FJGoDD1uw7xpoEnGV5PFLDJLl~7Ez5XbZ9mxRGPTqV-XCRJswaSoftIQQ3JqqulTn8lYhS~xqnYfiv5WdzBO3pf9ZUDOrhPdpmBbvq4T~OHUz39cQkuzoMJDA-ndcrRTUb1UvDSgJwYoChVuRHWAmqOFDlQqiKiPyDtU0mZVjXagQ__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/jeep/grand-cherokee/698-a085dem634613/' },
  { id: 'c9', title: 'GWM P-Series 2.0TD SX S/C P/U', brand: 'GWM', year: 2024, mileage: 128755, price: 214900, marketValue: 214900, fuel: 'Diesel', transmission: 'Manual', dealerId: 'jlr-east-rand', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/qsUG0TPhRuljhqKq5FZtgvBt2UVe9EbJqVGZwDTd.jpg?Expires=1788526989&Signature=LYvpyLUL8mvKj2m22inD8FRZwxSnIdz--7f53yoV94YIo0m4n~RszyZdbz-41IX974LD8Zfk9768YR3GX32f8jNWfwVcP2IS-OgDmDCfB-yhzib1JqfV~cBammNkgmXANr8m5ZwCTcfGJRWoSLXDru7Z7Q8yOhcHfQk6P5xTGCVihATwQZhslEHsQ-4Ju4a~gMVyGU6f1Gg9RRUb1qK~4G57jaxthnYQ2utmN5E8wijGyBcCThlZa05lrAYsEdgphDPXDHAfFQ5NiWEFrW-IgzAmieQU3ZmK8jp5M3Lzrqj-vEVGqii~Uj62AOB1DnUUAcl5VF0wCbPh9aA5nYZolw__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/gwm/p-series/694-25dem19112/' },
  { id: 'c10', title: 'Audi SQ8 TFSI Quattro Black Edition', brand: 'Audi', year: 2025, mileage: 17000, price: 1849900, marketValue: 1849900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'vw-rustenburg', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/fsgSWFRBHPV2HQnk31LDLX3HCPDnpRVMFnthvVxd.jpg?Expires=1788167321&Signature=NCm76M-jOIVCU5QTUhbhem3l0b1mu8YvY1MxiqaFJI8xJ-eMrLwDRP7HWd-WcX2BVptSEW3i6HCDVC5BwTRZtKJ~Rxtm7J1GINUrr22f5DJhaGd4bFD4C9KLiVvL9bfozufDjqmfQGjNmIkPsWuWSwi~X73aNB~0qpkqeRJmFF~dAmmh3qMqCEMEz2U9Z9pAJcYfU1MLveSy~pA-qsGDAjQYYiApg6sfiooHu05fL9QLI5Zuv~rEcgu6DbJZQKABaXVsM3hhfmCDpbAI0ZGJeiWEwm85oYN3SVJ3dWqKw5R5kCNcQa~ocDC3zHL9OneJVRPJT2nUlZa~P9h6DklR2w__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/audi/sq8/676-55dem11019/' },
  { id: 'c11', title: 'Chery Tiggo 8 Pro Max 2.0TGDi 390T Executive AWD', brand: 'Chery', year: 2025, mileage: 23600, price: 479900, marketValue: 479900, fuel: 'Petrol', transmission: 'Automatic', dealerId: 'tommy-martin-eagle-canyon', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/9e60e419791fdb8753e6bd2162dcfb59.jpg?Expires=1787566619&Signature=AdxnRo49ruwwOQbc0sQGTag2UWDB9md4Sz4LX6lSLWDwcFpsRN7D5gONrXg4WnBU05-Aw8x0fO31vqFnTahRip14NSYHGiDn9nS4c25exOjuerf9S3W2fb9pkbwwgIt7We8el~cVOiuz8r31gTDFUe5yZynFkx8~G0d-spU617olNUsiKiHADApLBxbRqFFWBges5z0sQWSiLLFpUXvzyjhqxBSdWwgVKcMxA0JqK-2tRXe7I0FIHAhC~RDD3PYBShvVCGW0VNwUvu9qTqBcaJWGLghOW2kuEaW59xkIIluJ9Q97PKjubNzhlqXA78BJ8Zbo6x18NAoEJHTnt25iMA__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/chery/tiggo-8-pro/678-a065dem044332a/' },
  { id: 'c12', title: 'Mercedes-Benz V-Class V300d Exclusive', brand: 'Mercedes-Benz', year: 2022, mileage: 84749, price: 1439900, marketValue: 1439900, fuel: 'Diesel', transmission: 'Automatic', dealerId: 'mercedes-benz-paarl', image: 'https://d2kns8mn2a7yzy.cloudfront.net/listing_images/ou4Cpc1t8jBljiowW48fXZEk2eRAsG2jIgeZtyDE.jpg?Expires=1788526088&Signature=UHFmRnRoUFy0blh9ZNNWLlho2JaS1umiJvaU7QIizUXn-KWIxwR3uKfhUi4M-ai2yLG6aw6-wxCipwsCAqhgdI~7m8UH4G0v9PaRXyPlFlbvYyHbPn~wjmpYhRO0aMKEw2nXnyVwo4JWb4nofm3YDg3zHJPyTG3fh31q~BNE2jA73I1ejGa96nmsOapIozqDFNw1Zta7kzNfHfSJjAeihDhNzuk9nwBaMyq-0midvvuQjg4yWaQvLyfAb43i0Owols173-fDq~g3tZwd2BX5AeYeLGlFy5J7PaCB1U5M~urRhMFLYeCDDIkQu8s2vVWenl95eiLgWfsAGZ8SDYJ9EA__&Key-Pair-Id=K204EG3K3V2RPS', listingUrl: 'https://supergroupdealerships.co.za/showroom/mercedes-benz/v-class/781-250598/' },
]

export type DocItem = {
  id: string
  name: string
  type: string
  status: 'valid' | 'expiring' | 'expired' | 'analysing'
  expiry?: string
  note?: string
}

export const documents: DocItem[] = [
  { id: 'doc1', name: 'SA Smart ID Card', type: 'Identity', status: 'valid', note: 'Verified' },
  { id: 'doc2', name: "Driver's License", type: 'Identity', status: 'valid', note: 'Valid until 2028' },
  { id: 'doc3', name: 'Proof of Residence', type: 'Residence', status: 'expiring', expiry: '9 days', note: 'Municipal account' },
  { id: 'doc4', name: 'Payslip — December', type: 'Income', status: 'valid', note: 'Latest of 3' },
  { id: 'doc5', name: 'Bank Statement — Oct', type: 'Income', status: 'expired', expiry: 'Older than 3 months', note: 'Re-upload needed' },
  { id: 'doc6', name: 'Vehicle Sale Agreement', type: 'Contract', status: 'analysing', note: 'AI analysis running' },
]

export const requiredDocs = [
  'Bar-coded SA ID or valid passport + visa',
  "Valid driver's license",
  'Proof of residence (not older than 3 months)',
  'Latest payslip',
  '3 months bank statements',
  'Signed sale agreement',
]

export const provinces = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Northern Cape',
]

export type QuotationFee = {
  label: string
  amount: number
  benchmark: number
  flag: 'ok' | 'high'
}

export type Quotation = {
  vehicle: string
  vehiclePrice: number
  deposit: number
  termMonths: number
  interestRate: number
  balloonPct: number
  fees: QuotationFee[]
  redFlags: string[]
}

export const quotation: Quotation = {
  vehicle: 'Toyota Corolla Cross 1.8 XS (2023)',
  vehiclePrice: 389900,
  deposit: 39000,
  termMonths: 72,
  interestRate: 14.25,
  balloonPct: 30,
  fees: [
    { label: 'Vehicle price', amount: 389900, benchmark: 405000, flag: 'ok' },
    { label: 'Initiation fee', amount: 1207, benchmark: 1207, flag: 'ok' },
    { label: 'Admin fee', amount: 5500, benchmark: 3500, flag: 'high' },
    { label: 'Credit life insurance', amount: 8900, benchmark: 4200, flag: 'high' },
    { label: 'Tracking device', amount: 2400, benchmark: 2400, flag: 'ok' },
  ],
  redFlags: [
    'Interest rate of 14.25% is Prime +2.5%. With your score of 712 you qualify for Prime +0.5% — negotiate down.',
    'Admin fee of R5,500 is R2,000 above the industry standard of R3,500.',
    'Credit life insurance is marked up ~2x. You may source your own cover (NCA Section 106).',
    'A 30% balloon leaves ~R117,000 owing at the end of the term. Ask for a quote without a balloon.',
  ],
}
