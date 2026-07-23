/**
 * Frontend module: Components/Profile/Client/ClientProject.js
 *
 * Vai trò: Component Client Project: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
export const clientProjects = [
  {
    id: 1,
    title: "AI Customer Support Assistant",
    status: "Open",
    budget: "$1,500",
    proposals: 12,
    imageClass: "service-visual-automation",
  },
  {
    id: 2,
    title: "Sales Forecasting Dashboard",
    status: "In Review",
    budget: "$2,800",
    proposals: 8,
    imageClass: "service-visual-analytics",
  },
  {
    id: 3,
    title: "Document Intelligence Workflow",
    status: "Planning",
    budget: "$2,200",
    proposals: 5,
    imageClass: "service-visual-network",
  },
];

const projectVisualClasses = [
  "service-visual-automation",
  "service-visual-analytics",
  "service-visual-network",
];

// Chuyển đổi dữ liệu cho “format project budget” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatProjectBudget = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value ? String(value) : "Not specified";
  }

  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

// API data: convert projects from GET /api/profile/:userId into the profile project list shape.
export const getClientProjectsFromApi = (projects = []) =>
  projects.map((project, index) => ({
    id: project.id,
    title: project.title || "Untitled project",
    status: project.status || "Open",
    budget:
      project.budgetMin || project.budgetMax
        ? `${formatProjectBudget(project.budgetMin)} - ${formatProjectBudget(project.budgetMax)}`
        : "Not specified",
    proposalsLabel: project.requiredSkill ? `Skill: ${project.requiredSkill}` : "No required skill",
    imageClass: projectVisualClasses[index % projectVisualClasses.length],
  }));
