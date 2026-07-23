/**
 * Frontend module: Components/Dashboard/Expert/expertDashboardData.js
 *
 * Vai trò: Component expert Dashboard Data: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
export const contracts = [
  { id: 'con-1', name: 'LLM Optimization for Edge', client: 'TechCorp AI', progress: '2/3 Done', deadline: 'In 2 days', status: 'URGENT', tagClass: 'tag-urgent' },
  { id: 'con-2', name: 'Custom RAG Development', client: 'DataMind', progress: '1/5 Done', deadline: 'Jun 14, 2026', status: 'ACTIVE', tagClass: 'tag-review' },
  { id: 'con-3', name: 'Medical AI Fine-Tuning', client: 'HealthLab', progress: '4/4 Done', deadline: 'Ready for review', status: 'REVIEW', tagClass: 'tag-new' }
]

export const invitations = [
  { id: 'inv-1', role: 'Distributed Neural Network Architect', budget: '$200/hr', duration: '3 months' },
  { id: 'inv-2', role: 'Fine-Tuning Lead for Medical AI', budget: '$180/hr', duration: '2 months' },
  { id: 'inv-3', role: 'RAG Pipeline Consultant', budget: '$6,500 fixed', duration: '4 weeks' }
]

export const skills = ['Python', 'PyTorch', 'LLM Fine-Tuning', 'LangChain', 'Docker', 'RAG Pipelines']
