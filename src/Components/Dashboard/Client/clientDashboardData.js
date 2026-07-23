/**
 * Frontend module: Components/Dashboard/Client/clientDashboardData.js
 *
 * Vai trò: Component client Dashboard Data: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
export const initialClientProjects = [
  {
    id: 'project-1',
    name: 'NLP Sentiment Analysis Model',
    description: 'Training a custom BERT model',
    expert: 'Elena K.',
    status: 'In Progress',
    budget: '$4,500'
  },
  {
    id: 'project-2',
    name: 'Computer Vision for Defect Detection',
    description: 'YOLOv8 implementation for manufacturing',
    expert: 'Marcus R.',
    status: 'Under Review',
    budget: '$8,200'
  },
  {
    id: 'project-3',
    name: 'Predictive Maintenance Dashboard',
    description: 'Time-series forecasting UI integration',
    expert: 'Sarah L.',
    status: 'Completed',
    budget: '$3,150'
  }
]

export const initialClientActivities = [
  {
    id: 'activity-1',
    title: 'Elena K. submitted milestone',
    description: 'NLP Sentiment Analysis Model is ready for review',
    time: '2 hours ago',
    tag: 'REVIEW',
    tagClass: 'tag-review'
  },
  {
    id: 'activity-2',
    title: 'Payment processed',
    description: '$1,500 payment was processed successfully',
    time: 'Yesterday',
    tag: 'PAID',
    tagClass: 'tag-new'
  },
  {
    id: 'activity-3',
    title: 'New proposal received',
    description: 'David Chen sent a proposal for your AI task',
    time: '2 days ago',
    tag: 'NEW',
    tagClass: 'tag-new'
  }
]