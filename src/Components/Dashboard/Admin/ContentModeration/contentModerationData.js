import expertDavid from '../../../LandingPages/image/expert_david.png'
import expertElena from '../../../LandingPages/image/expert_elena.png'
import expertMarcus from '../../../LandingPages/image/expert_marcus.png'

export const moderationItems = [
  {
    id: 'mod-1',
    title: 'Unverified "Sentient AI" Consulting Service',
    description:
      'Listing claims to provide consulting services for an AI model that bypasses global ethical safeguards and operates outside of legal review.',
    severity: 'high',
    severityLabel: 'High Severity',
    category: 'Service Listings',
    policy: 'Misinformation',
    type: 'Service Listing',
    time: 'Flagged 22 mins ago',
    image: expertMarcus,
  },
  {
    id: 'mod-2',
    title: 'Expert Bio: Dr. Aris Thorne',
    description:
      'The bio contains external links to unverified cryptocurrency platforms and promises guaranteed returns on AI-driven trading systems.',
    severity: 'medium',
    severityLabel: 'Medium Severity',
    category: 'Expert Bios',
    policy: 'External Links',
    type: 'Expert Profile',
    time: 'Flagged 1 hour ago',
    image: expertElena,
  },
  {
    id: 'mod-3',
    title: 'Job Post: "Need AI to write my college thesis"',
    description:
      'Potential violation of academic integrity policies. The client is asking for a complete academic paper to be generated without personal contribution.',
    severity: 'low',
    severityLabel: 'Low Severity',
    category: 'Job Posts',
    policy: 'Academic Honesty',
    type: 'Job Post',
    time: 'Flagged 3 hours ago',
    image: expertDavid,
  },
]

export const moderationFilters = ['All Types', 'Job Posts', 'Service Listings', 'Expert Bios']

export const moderationStats = [
  { label: 'Pending Queue', value: '142', note: '+12% since yesterday', tone: 'is-success' },
  { label: 'High Severity', value: '24', note: 'Requires immediate action', tone: 'is-danger' },
  { label: 'Resolved Today', value: '89', note: 'Average: 110/day', tone: 'is-success' },
  { label: 'Avg Response Time', value: '4.2h', note: 'Target: < 2h' },
]
