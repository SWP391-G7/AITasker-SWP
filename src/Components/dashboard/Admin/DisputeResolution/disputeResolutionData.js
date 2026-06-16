export const disputeStats = [
  { label: 'Active Disputes', value: '24', note: '+12% increase this week', tone: 'is-info' },
  { label: 'Under Review', value: '08', note: 'Avg. response 4h' },
  { label: 'Resolved Today', value: '14', note: 'High efficiency rate', tone: 'is-success' },
  { label: 'Escalated', value: '02', note: 'Needs immediate action', tone: 'is-danger' },
]

export const disputeFilters = ['All Cases', 'Under Review', 'Resolved']

export const disputeCases = [
  {
    id: 'disp-8921',
    title: 'LLM Training Data Inconsistency',
    status: 'Under Review',
    statusTone: 'review',
    client: 'Nexa Corp',
    expert: 'Dr. Alan Turing',
    value: '$2,400.00',
    meta: 'Opened 2 hours ago - Priority: High',
    iconTone: 'blue',
  },
  {
    id: 'disp-8914',
    title: 'Python Script Deployment Failure',
    status: 'Resolved',
    statusTone: 'resolved',
    client: 'StartUpX',
    expert: 'CodeMaster AI',
    value: '$450.00',
    meta: 'Resolved 14 hours ago - Payout issued',
    iconTone: 'slate',
  },
  {
    id: 'disp-8902',
    title: 'Data Privacy Violation Claim',
    status: 'Escalated',
    statusTone: 'escalated',
    client: 'SecureLink',
    expert: 'DataAnalytica',
    value: '$12,000.00',
    meta: 'Critical Level - Reviewing legal logs',
    iconTone: 'rose',
  },
]

export const evidenceFiles = [
  { name: 'Contract_v2_signed.pdf', meta: '2.4 MB - PDF Document' },
  { name: 'Error_Log_Screenshot.png', meta: '1.1 MB - PNG Image' },
]
