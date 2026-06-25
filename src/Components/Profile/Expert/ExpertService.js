export const expertServices = [
  {
    id: 1,
    title: "Custom ChatGPT Integration for Customer Support",
    category: "Customer Support",
    rating: "5.0",
    price: "$1,200",
    imageClass: "service-visual-automation",
  },
  {
    id: 2,
    title: "NLP Sentiment Analysis Model Training",
    category: "Natural Language Processing",
    rating: "4.9",
    price: "$2,500",
    imageClass: "service-visual-analytics",
  },
  {
    id: 3,
    title: "AI Automation Workflow for Enterprise",
    category: "Enterprise",
    rating: "5.0",
    price: "$1,800",
    imageClass: "service-visual-network",
  },
];

const serviceVisualClasses = [
  "service-visual-automation",
  "service-visual-analytics",
  "service-visual-network",
];

const formatServicePrice = (value) => {
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

// API data: convert services from GET /api/profile/:userId into the profile service list shape.
export const getExpertServicesFromApi = (services = []) =>
  services.map((service, index) => ({
    id: service.id,
    title: service.title || "Untitled service",
    category: service.tags || "AI Service",
    rating: service.avgRating ? Number(service.avgRating).toFixed(1) : "New",
    price: formatServicePrice(service.price),
    imageClass: serviceVisualClasses[index % serviceVisualClasses.length],
  }));
