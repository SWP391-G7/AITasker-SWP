export const conversations = [
  {
    id: 'chat-1',
    name: 'Alex Rivera',
    role: 'Startup Founder',
    project: 'Neural-Net Integration',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    lastMessage: 'The latest model weights look promising...',
    time: '2m ago',
    unread: 0,
    status: 'online',
    milestone: 'Milestone 2/4',
    progress: 65,
    nextPayment: '$2,450.00',
    sharedFiles: [
      { name: 'architecture_v2.png', date: 'Oct 12, 2023', type: 'image' },
      { name: 'dataset_metadata.csv', date: 'Oct 11, 2023', type: 'file' }
    ],
    messages: [
      { 
        id: 1, 
        sender: 'client', 
        text: 'Hi! I just reviewed the latest training logs for the Neural-Net Integration. The accuracy ramp-up on the validation set is impressive. Can we jump into the hyperparameter tuning phase by Wednesday?', 
        time: '10:42 AM' 
      },
      { 
        id: 2, 
        sender: 'expert', 
        text: "Absolutely, Alex. I've already prepared three optimization scenarios. I'll share the summary file here so you can look it over before our call.", 
        time: '10:45 AM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'expert',
        type: 'file',
        fileName: 'tuning_scenarios_v1.pdf',
        fileSize: '2.4 MB',
        time: '10:46 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-2',
    name: 'Sarah Chen',
    role: 'Lead Analyst',
    project: 'Data Visualization Suite',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'Can we adjust the dashboard API?',
    time: '1h ago',
    unread: 0,
    status: 'offline',
    milestone: 'Milestone 1/3',
    progress: 30,
    nextPayment: '$1,200.00',
    sharedFiles: [],
    messages: [
      { id: 1, sender: 'client', text: 'Can we adjust the dashboard API?', time: '1h ago' }
    ]
  },
  {
    id: 'chat-3',
    name: 'James Wilson',
    role: 'Project Head',
    project: 'LLM Training Module',
    avatar: 'https://i.pravatar.cc/150?u=james',
    lastMessage: 'The milestone has been approved.',
    time: 'Yesterday',
    unread: 0,
    status: 'online',
    milestone: 'Milestone 4/4',
    progress: 100,
    nextPayment: '$5,000.00',
    sharedFiles: [],
    messages: [
      { id: 1, sender: 'client', text: 'The milestone has been approved.', time: 'Yesterday' }
    ]
  }
];
