
import './Marketplace.css';

const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.role || 'client';
  } catch {
    return 'client';
  }
};

const MarketplaceHero = () => {
  const isExpert = getCurrentRole() === 'expert';

  return (
    <section className="marketplace-hero">
      <div className="container">
        <h1>
          {isExpert ? 'Browse Client ' : 'Explore the '}
          <span>{isExpert ? 'AI Tasks' : 'AI Marketplace'}</span>
        </h1>
        <p>
          {isExpert
            ? 'Find client projects that need AI expertise, review the task scope, and choose work that matches your skills.'
            : 'Discover high-performance AI services from vetted experts to accelerate your product development and automate complex workflows.'}
        </p>
      </div>
    </section>
  );
};

export default MarketplaceHero;
