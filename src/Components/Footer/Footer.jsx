/**
 * Frontend module: Components/Footer/Footer.jsx
 *
 * Vai trò: Component Footer: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Link } from "react-router-dom";
import "./Footer.css";

const defaultLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Help Center", to: "/help" },
  { label: "API Documentation", to: "/api-docs" },
];

// React component “Footer” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
              <Link key={link.to} to={link.to} className="footer-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
