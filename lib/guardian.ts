export type GuardianReply = {
  answer: string
  citation?: string
  steps?: string[]
  link?: { label: string; href: string }
}

type Rule = {
  keywords: string[]
  reply: GuardianReply
}

const rules: Rule[] = [
  {
    keywords: ['voetstoots', 'as is', 'as-is', 'warranty', 'guarantee', 'defect', 'faulty'],
    reply: {
      answer:
        'Good news — when you buy a used car from a registered dealer, a "voetstoots" (as-is) clause does NOT cancel your rights. Dealers owe you an implied 6-month warranty on the engine, gearbox and essential components, whether the defect was obvious or hidden.',
      citation: 'CPA Section 55 & 56 (Act 68 of 2008)',
      steps: [
        'Report the defect to the dealer in writing within 6 months.',
        'The dealer must repair, replace or refund — your choice.',
        'Keep all correspondence; the burden of proof is on the dealer.',
      ],
      link: { label: 'Know Your Rights', href: '/rights' },
    },
  },
  {
    keywords: ['balloon', 'residual'],
    reply: {
      answer:
        'A balloon (residual) payment lowers your monthly instalment by deferring a big lump sum to the end of the term. On a 30% balloon over a R390k car, you could still owe around R117,000 at the end — and you pay interest on that amount the whole time. Great for cash flow, risky if you cannot settle or refinance later.',
      citation: 'NCA affordability disclosure requirements',
      steps: [
        'Always ask for a quote WITH and WITHOUT a balloon to compare.',
        'Check the total cost of credit, not just the monthly figure.',
        'Plan how you will settle the balloon: cash, refinance or trade-in.',
      ],
      link: { label: 'Open Finance Calculator', href: '/finance' },
    },
  },
  {
    keywords: ['interest', 'prime', 'rate', 'apr'],
    reply: {
      answer:
        'Vehicle finance is priced as Prime plus a margin based on your credit score. The current prime rate is 11.75%. With your score of 712 (Excellent) you should qualify for roughly Prime −0.5% to Prime +1%. If a dealer quotes Prime +2.5%, that is negotiable — push back.',
      citation: 'NCA — reasonable interest & full cost disclosure',
      steps: [
        'Get your credit score before negotiating.',
        'Ask the F&I desk for their best rate in writing.',
        'Shop the deal at your own bank too — dealers do not always win.',
      ],
      link: { label: 'Check your credit', href: '/credit' },
    },
  },
  {
    keywords: ['document', 'documents', 'need', 'require', 'fica', 'paperwork'],
    reply: {
      answer:
        'For vehicle finance in South Africa you typically need: a bar-coded SA ID or valid passport + visa, a valid driver\'s license, proof of residence younger than 3 months, your latest payslip, 3 months of bank statements, and the signed sale agreement. FICA requires proof of identity and residence for the transaction.',
      citation: 'NCA & FICA documentation requirements',
      steps: [
        'Upload each document to the Document Center for a completeness check.',
        'Make sure your proof of residence is younger than 3 months.',
        'Generate a "Finance Application Pack" to send to the dealer.',
      ],
      link: { label: 'Open Document Center', href: '/documents' },
    },
  },
  {
    keywords: ['trade', 'trade-in', 'tradein', 'settlement', 'owe'],
    reply: {
      answer:
        'Before trading in, request a settlement letter from your current finance house so you know exactly what you owe. If the trade-in offer is less than your outstanding balance, you will need to pay in the difference or roll it into the new deal (which increases your debt). Compare the trade-in value against a private sale — private usually fetches more.',
      citation: 'NCA settlement & eNaTIS ownership transfer',
      steps: [
        'Get your outstanding settlement figure in writing.',
        'Value your car against the TransUnion Auto Dealers\' Guide.',
        'Complete the Notification of Change of Ownership (yellow form).',
      ],
      link: { label: 'Explore vehicles', href: '/explore' },
    },
  },
  {
    keywords: ['insurance', 'cover', 'comprehensive', 'premium', 'raf'],
    reply: {
      answer:
        'You must have valid insurance before you drive away — and if the car is financed, comprehensive cover is compulsory. The Road Accident Fund (RAF), funded by the fuel levy, only covers personal injury, NOT damage to your vehicle. In Gauteng, insurers price in higher theft risk, so a tracker usually lowers your premium.',
      citation: 'RAF Act & standard finance house requirements',
      steps: [
        'Compare at least 3 comprehensive quotes.',
        'Fit an approved tracker to reduce your premium.',
        'Confirm your cover start date matches your delivery date.',
      ],
      link: { label: 'Compare insurance', href: '/insurance' },
    },
  },
  {
    keywords: ['reckless', 'afford', 'affordability', 'over-indebted', 'debt counsel'],
    reply: {
      answer:
        'Credit providers are legally required to assess whether you can actually afford the repayments. If they grant credit without doing this properly, it is "reckless lending" — a court can set aside the agreement, suspend your debt, or restructure the repayments. If you are over-indebted, you also have the right to debt counselling.',
      citation: 'NCA Section 80–83 (reckless credit)',
      steps: [
        'Run the affordability stress test in the Finance Calculator.',
        'Keep your total debt repayments well under 30% of gross income.',
        'If a deal feels unaffordable, walk away — that is your right.',
      ],
      link: { label: 'Stress-test a deal', href: '/finance' },
    },
  },
  {
    keywords: ['roadworthy', 'rwc', 'natis', 'enatis', 'register', 'transfer', 'ownership'],
    reply: {
      answer:
        'Ownership transfers are recorded on eNaTIS. A Roadworthy Certificate (RWC) is required before transfer and is valid for 60 days for a private vehicle. The seller completes the Notification of Change of Ownership ("yellow form"), and you must lodge the registration within 21 days at your Registering Authority.',
      citation: 'National Road Traffic Act / eNaTIS',
      steps: [
        'Get an independent DEKRA or AA roadworthy inspection.',
        'Collect the signed yellow form from the seller.',
        'Lodge your registration within 21 days to avoid penalties.',
      ],
    },
  },
  {
    keywords: ['red flag', 'scam', 'trick', 'pressure', 'dodgy', 'hidden fee'],
    reply: {
      answer:
        'Common dealer red flags: pushing you to sign today, bundling an "admin fee" well above the ~R3,500 norm, marking up credit life insurance, adding extras you did not request, and hiding the balloon risk. Under the CPA all costs must be transparently disclosed. Upload any quotation and I will flag the issues for you.',
      citation: 'CPA & NCA cost-disclosure rules',
      steps: [
        'Never sign under time pressure.',
        'Ask for an itemised quotation and question every fee.',
        'Run it through the Quotation Analyser.',
      ],
      link: { label: 'Analyse a quotation', href: '/documents' },
    },
  },
]

const fallback: GuardianReply = {
  answer:
    'I\'m Guardian — your car-buying advocate for South Africa. I can explain your CPA and NCA rights, break down finance terms like balloon payments and prime rate, tell you which documents you need, help with trade-ins, and flag dealer tricks. Ask me anything, or tap a suggestion below.',
  steps: [
    'Try: "What documents do I need for finance?"',
    'Try: "Explain balloon payments"',
    'Try: "What are my rights on a used car?"',
  ],
}

export function askGuardian(message: string): GuardianReply {
  const text = message.toLowerCase()
  let best: { rule: Rule; score: number } | null = null
  for (const rule of rules) {
    const score = rule.keywords.reduce((acc, k) => (text.includes(k) ? acc + 1 : acc), 0)
    if (score > 0 && (!best || score > best.score)) best = { rule, score }
  }
  return best ? best.rule.reply : fallback
}

export const suggestedQuestions = [
  'What are my rights on a used car?',
  'Explain balloon payments',
  'What documents do I need?',
  'Is my interest rate fair?',
  'How does a trade-in work?',
  'What insurance do I need?',
]
