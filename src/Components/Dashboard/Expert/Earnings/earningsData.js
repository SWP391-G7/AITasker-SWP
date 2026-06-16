export const earningsStats = [
  {
    id: 'stat-1',
    label: 'Available for Withdrawal',
    value: '$12,450.00',
    trend: '+12% VS LAST MO',
    trendType: 'up',
    icon: 'bank'
  },
  {
    id: 'stat-2',
    label: 'Pending in Escrow',
    value: '$4,200.00',
    trend: '3 ACTIVE JOBS',
    trendType: 'neutral',
    icon: 'lock'
  },
  {
    id: 'stat-3',
    label: 'Avg. Project Revenue',
    value: '$850.25',
    trend: null,
    trendType: 'up',
    icon: 'chart'
  }
];

export const incomeSummary = {
  gross: '$15,200.00',
  fees: '-$1,520.00',
  net: '$13,680.00',
  nextPayout: 'June 15, 2024'
};

export const transactions = [
  {
    id: '#ai-90221',
    project: 'Neural Network Optimization',
    date: 'Jun 12, 2024',
    status: 'COMPLETED',
    statusType: 'success',
    amount: '+$2,450.00',
    iconType: 'neural'
  },
  {
    id: '#ai-90220',
    project: 'LLM Fine-tuning Service',
    date: 'Jun 10, 2024',
    status: 'IN ESCROW',
    statusType: 'active',
    amount: '+$1,200.00',
    iconType: 'database'
  },
  {
    id: '#ai-90214',
    project: 'Data Visualization Suite',
    date: 'Jun 08, 2024',
    status: 'COMPLETED',
    statusType: 'success',
    amount: '+$890.00',
    iconType: 'chart'
  }
];
