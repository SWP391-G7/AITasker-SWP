import "./Footer.css";

const defaultLinks = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Help Center", href: "#help" },
  { label: "API Documentation", href: "#api" },
];

function Footer({
  brand = "AITasker",
  copyright = "(c) 2026 AITasker. All rights reserved.",
  links = defaultLinks,
  variant = "default",
  className = "",
}) {
  return (
    <footer className={`site-footer site-footer-${variant} ${className}`.trim()}>
      <div className="container px-3 px-sm-5">
        <div className="site-footer-inner">
          <div className="footer-brand-block">
            <span className="footer-brand">{brand}</span>
            <span className="copyright-text">{copyright}</span>
          </div>

          <nav className="footer-links" aria-label="Footer links">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
