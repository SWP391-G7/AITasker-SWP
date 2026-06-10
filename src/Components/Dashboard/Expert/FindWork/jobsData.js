export const jobCategories = [
  'All Technologies',
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'Data Engineering',
  'AI Strategy'
];

export const budgetOptions = [
  '$500+',
  '$1,000+',
  '$5,000+',
  '$10,000+'
];

export const durationOptions = [
  'Any Duration',
  '< 1 Month',
  '1-3 Months',
  '3-6 Months',
  '6+ Months'
];

export const jobListings = [
  {
    id: 'job-featured',
    isFeatured: true,
    iconType: 'hexagon',
    title: 'RAG System Optimization for Enterprise Legal AI',
    company: 'Starlight Analytics',
    postedAt: '2h ago',
    description: 'We are seeking an expert to optimize our existing Retrieval-Augmented Generation (RAG) pipeline to reduce latency and improve citation accuracy for legal documents.',
    tags: ['Python', 'Pinecone', 'LangChain', 'GPT-4'],
    budget: '$4,500 - $7,000',
    duration: '2-3 Months',
    buttonText: 'View Details',
    buttonType: 'outline'
  },
  {
    id: 'job-top-right',
    iconType: 'eye',
    title: 'Custom CV Model for Medical Imaging',
    company: 'MediScan AI',
    postedAt: '10 min ago',
    description: 'Looking for an expert to develop and fine-tune a YOLOv8 model for detecting anomalies in high-resolution MRI scans.',
    tags: ['YOLOv8', 'PyTorch', 'Healthcare'],
    budget: '$12,000 Fixed',
    duration: '1 Month',
    buttonText: 'View Details',
    buttonType: 'outline'
  },
  {
    id: 'job-bottom-left',
    iconType: 'message',
    title: 'Customer Support LLM Agent',
    company: 'Global Retail Systems',
    postedAt: '1h ago',
    description: 'Build a conversational agent using Claude 3.5 Sonnet to handle Tier-1 customer support inquiries for a multi-national retail chain.',
    tags: ['Claude 3.5', 'API Integration', 'Customer Care'],
    budget: '$3,200 Est.',
    duration: '4 Weeks',
    buttonText: 'View Details',
    buttonType: 'outline'
  },
  {
    id: 'job-bottom-right',
    iconType: 'database',
    title: 'Syntethic Data Generation',
    company: 'SecureFin AI',
    postedAt: '3h ago',
    description: 'Create a high-quality synthetic dataset of 50,000 retail transaction records for training fraud detection models.',
    tags: ['Synthetic Data', 'Fraud Detection', 'SQL'],
    budget: '$1,500',
    duration: '2 Weeks',
    buttonText: 'View Details',
    buttonType: 'outline'
  }
];
