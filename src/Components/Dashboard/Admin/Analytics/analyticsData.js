/**
 * Frontend module: Components/Dashboard/Admin/Analytics/analyticsData.js
 *
 * Vai trò: Component analytics Data: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import expertSarah from '../../../LandingPages/image/expert_sarah.png'
import expertMarcus from '../../../LandingPages/image/expert_marcus.png'

export const analyticsKpis = [
  { label: 'Total Revenue', value: '$142,850.00', trend: '+12.4%', tone: 'is-success', progress: 64, icon: 'revenue' },
  { label: 'Completion Rate', value: '94.8%', trend: '+5.2%', tone: 'is-success', progress: 92, icon: 'completion' },
  { label: 'Active Experts', value: '1,240', trend: '+1.2%', tone: 'is-danger', progress: 48, icon: 'experts' },
  { label: 'Avg Task Price', value: '$324.50', trend: '+8.9%', tone: 'is-success', progress: 52, icon: 'price' },
]

export const revenueBars = [
  { label: 'June', value: 34 },
  { label: 'July', value: 47 },
  { label: 'August', value: 38 },
  { label: 'September', value: 72, active: true },
  { label: 'October', value: 58 },
]

export const retentionMetrics = [
  { label: 'Client Retention', value: '88%', progress: 88, tone: 'blue' },
  { label: 'Expert Retention', value: '92%', progress: 92, tone: 'teal' },
  { label: 'Churn Rate', value: '4.2%', progress: 4, tone: 'rose' },
]

export const topExperts = [
  {
    id: 'expert-1',
    avatar: expertMarcus,
    name: 'Dr. Aris Thorne',
    specialization: 'Natural Language Processing',
    completion: '98.2%',
    revenue: '$12,450',
    status: 'Top Tier',
  },
  {
    id: 'expert-2',
    avatar: expertSarah,
    name: 'Sarah Jenkins',
    specialization: 'Computer Vision',
    completion: '95.5%',
    revenue: '$9,820',
    status: 'Rising Star',
  },
]
