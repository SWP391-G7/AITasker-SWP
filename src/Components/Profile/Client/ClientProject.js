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
