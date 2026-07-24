import expertSarah from '../../LandingPages/image/expert_sarah.png'

export const initialModerations = [
  { id: 'mod-1', target: 'Content ID: #AI-9021', reason: 'Potential Spam', type: 'content' },
  { id: 'mod-2', target: 'User: Alex Rivers', reason: 'Inappropriate Bio', type: 'user', name: 'Alex Rivers', avatar: expertSarah },
  { id: 'mod-3', target: 'Content ID: #JOB-4412', reason: 'Misleading Category', type: 'content' }
]

export const initialDisputes = [
  { id: 'disp-1', title: 'Payment Withheld', caseId: '#D-44102', client: 'TechCorp', expert: 'Sarah K.', tag: 'URGENT', tagClass: 'tag-urgent' },
  { id: 'disp-2', title: 'Deadline Missed', caseId: '#D-44098', client: 'GlobalSoft', expert: 'Mike D.', tag: 'UNDER REVIEW', tagClass: 'tag-review' },
  { id: 'disp-3', title: 'Quality Claim', caseId: '#D-44115', client: 'SoloDev', expert: 'AI-Agency', tag: 'NEW', tagClass: 'tag-new' }
]
