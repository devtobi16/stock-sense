import type { ThesisCardData, NarrativeEvent } from '../types';

export const mockTheses: Record<string, ThesisCardData> = {
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    bias: 'Bullish',
    confidence: 88,
    price: 942.89,
    change: 24.50,
    changePct: 2.62,
    summary: 'Market sentiment remains overwhelmingly positive as next-generation Blackwell chips enter full production. Despite valuation concerns, hyperscaler capex revisions upward confirm sustained demand for AI infrastructure.',
    keyDrivers: [
      'Blackwell architecture supply chain normalization',
      'Meta and Microsoft increasing Q3 capex guidance',
      'Sovereign AI investments accelerating in Middle East',
      'Margins expanding due to software (CUDA) lock-in'
    ],
    whatChanged: [
      { date: 'Today', text: 'Analyst upgrade: Target $1,200 (Goldman Sachs)' },
      { date: '2 days ago', text: 'TSMC confirms packaging bottleneck resolving' },
      { date: 'Last week', text: 'Q1 Earnings blowout, beat top-line by 8%' },
    ],
    bullCase: [
      'Unmatched hardware-software moat (CUDA)',
      'Data center transition from CPU to GPU is only in inning 3',
      'Pricing power remains inelastic'
    ],
    bearCase: [
      'P/E multiple assumes flawless execution for 5+ years',
      'Custom silicon (ASICs) from Big Tech threatening long-term margins',
      'Geopolitical risks regarding Taiwan supply chain'
    ]
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    bias: 'Neutral',
    confidence: 62,
    price: 189.84,
    change: 2.14,
    changePct: 1.14,
    summary: 'The narrative is shifting from a hardware growth story to an AI supercycle dependency. Services revenue provides a strong floor, but structural weakness in China and regulatory scrutiny in the EU weigh on near-term multiples.',
    keyDrivers: [
      'iPhone 16 AI features (Apple Intelligence) adoption rate',
      'DOJ antitrust lawsuit proceedings',
      'China market share defense against Huawei',
      'Services segment maintaining 70%+ gross margins'
    ],
    whatChanged: [
      { date: 'Today', text: 'WWDC announcements show deep OpenAI integration' },
      { date: '4 days ago', text: 'China iPhone sales down 4% YoY in April' },
      { date: '2 weeks ago', text: '$110B stock buyback authorized' },
    ],
    bullCase: [
      'Over 2 billion active devices ready for AI monetization',
      'Massive cash generation and historic buyback program',
      'Services growth offsetting hardware stagnation'
    ],
    bearCase: [
      'Late to the generative AI race compared to MSFT/GOOGL',
      'Regulatory risks to App Store fee structure globally',
      'Slowing upgrade cycles for flagship iPhones'
    ]
  },
  TSLA: {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    bias: 'Bearish',
    confidence: 74,
    price: 174.60,
    change: -2.30,
    changePct: -1.30,
    summary: 'Sentiment is heavily pressured by falling auto margins, intensified price wars in China, and a lack of clear timeline for the lower-cost Model 2. The narrative hinges entirely on the success of FSD v12 and the upcoming Robotaxi unveil.',
    keyDrivers: [
      'Global EV demand deceleration',
      'FSD (Full Self-Driving) v12 adoption and regulatory approval',
      'Robotaxi event expectations (August)',
      'Energy generation and storage growth'
    ],
    whatChanged: [
      { date: 'Today', text: 'Price cuts announced in European markets' },
      { date: '1 week ago', text: 'FSD subscription price reduced to $99/mo' },
      { date: '3 weeks ago', text: 'Q1 deliveries miss expectations by 12%' },
    ],
    bullCase: [
      'FSD data advantage is an insurmountable AI moat',
      'Energy business growing at 50%+ CAGR with high margins',
      'Robotaxi network could unlock software-like margins'
    ],
    bearCase: [
      'Core auto business margins compressing severely',
      'BYD and legacy auto catching up in price and features',
      'Key executive departures raising execution concerns'
    ]
  },
  MSFT: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corp.',
    bias: 'Bullish',
    confidence: 85,
    price: 420.21,
    change: 3.45,
    changePct: 0.83,
    summary: 'Microsoft maintains its position as the safest AI play. Copilot monetization is accelerating enterprise productivity, while Azure continues to take market share from AWS driven by OpenAI workloads.',
    keyDrivers: [
      'M365 Copilot enterprise adoption and seat expansion',
      'Azure AI revenue growth acceleration',
      'Activision Blizzard integration execution',
      'PC market refresh cycle driven by "AI PCs"'
    ],
    whatChanged: [
      { date: 'Yesterday', text: 'Announced new Copilot+ Surface devices' },
      { date: '1 week ago', text: 'OpenAI releases GPT-4o, boosting Azure capabilities' },
      { date: 'Last month', text: 'Q3 earnings: Azure growth accelerates to 31%' },
    ],
    bullCase: [
      'Unmatched distribution network for AI via Office 365',
      'Azure AI is the preferred enterprise cloud for AI workloads',
      'Diverse revenue streams protect against sector specific downturns'
    ],
    bearCase: [
      'Valuation is historically stretched (35x forward P/E)',
      'Copilot ROI for enterprises may take longer than expected',
      'Regulatory scrutiny over OpenAI partnership structure'
    ]
  },
  AMZN: {
    ticker: 'AMZN',
    companyName: 'Amazon.com Inc.',
    bias: 'Bullish',
    confidence: 79,
    price: 185.04,
    change: 3.22,
    changePct: 1.77,
    summary: 'A compelling turnaround story. Cost-cutting measures in the retail segment are yielding historic margin expansion. Meanwhile, AWS growth is stabilizing and beginning to re-accelerate as cloud optimization headwinds fade.',
    keyDrivers: [
      'AWS revenue re-acceleration driven by Bedrock and Q',
      'North America retail operating margin expansion',
      'Advertising revenue continuing 20%+ growth',
      'CapEx efficiency in fulfillment network'
    ],
    whatChanged: [
      { date: 'Today', text: 'AWS announces expanded partnership with Anthropic' },
      { date: '2 weeks ago', text: 'Q1 earnings: Retail margins hit record highs' },
      { date: '1 month ago', text: 'Transition to regional fulfillment network complete' },
    ],
    bullCase: [
      'Retail margins have structural room to expand further',
      'Advertising business is highly profitable and taking share',
      'AWS remains the default cloud for the majority of startups'
    ],
    bearCase: [
      'Consumer discretionary spending slowdown could hit retail',
      'AWS losing AI narrative mindshare to Microsoft Azure',
      'FTC antitrust lawsuit presents long-term overhang'
    ]
  }
};

export const mockTimelines: Record<string, NarrativeEvent[]> = {
  NVDA: [
    { date: 'Oct 2022', event: 'ChatGPT launches', impact: 'Catalyzes global generative AI arms race, spiking GPU demand.', sentiment: 'Positive', type: 'Signal' },
    { date: 'May 2023', event: 'Q1 2024 Earnings blowout', impact: 'Guidance raises by 50% ($11B vs $7B exp). Wall Street realizes AI demand is real.', sentiment: 'Positive', type: 'Signal' },
    { date: 'Aug 2023', event: 'US restricts AI chip exports to China', impact: 'Temporary fear of revenue loss, but excess demand from rest-of-world absorbs the hit.', sentiment: 'Neutral', type: 'Noise' },
    { date: 'Feb 2024', event: 'Q4 2024 Earnings', impact: 'Revenue up 265% YoY. Jensen Huang declares AI has hit "tipping point".', sentiment: 'Positive', type: 'Signal' },
    { date: 'Mar 2024', event: 'GTC 2024: Blackwell architecture revealed', impact: 'Cements technological lead with 30x performance increase for LLM inference.', sentiment: 'Positive', type: 'Signal' },
    { date: 'May 2024', event: 'Meta/MSFT increase CapEx', impact: 'Confirms hyperscalers are not slowing down GPU purchases.', sentiment: 'Positive', type: 'Signal' },
  ],
  AAPL: [
    { date: 'Jun 2023', event: 'Vision Pro announced', impact: 'Enters spatial computing, but high price limits near-term revenue impact.', sentiment: 'Neutral', type: 'Noise' },
    { date: 'Sep 2023', event: 'China bans iPhones for gov officials', impact: 'Sparks fears of structural decline in most important growth market.', sentiment: 'Negative', type: 'Signal' },
    { date: 'Feb 2024', event: 'Apple Car project cancelled', impact: 'Frees up billions in R&D to pivot focus entirely to generative AI.', sentiment: 'Positive', type: 'Signal' },
    { date: 'Mar 2024', event: 'DOJ files antitrust lawsuit', impact: 'Long-term threat to ecosystem lock-in, but immediate financial impact is zero.', sentiment: 'Negative', type: 'Noise' },
    { date: 'May 2024', event: 'Record $110B Buyback', impact: 'Puts a floor on the stock price despite anemic top-line growth.', sentiment: 'Positive', type: 'Signal' },
    { date: 'Jun 2024', event: 'WWDC: Apple Intelligence', impact: 'Validates AI strategy; potential spark for massive iPhone upgrade supercycle.', sentiment: 'Positive', type: 'Signal' },
  ]
};
