/**
 * Frontend module: Components/ClientExpertSearch/ClientExpertHero.jsx
 *
 * Vai trò: Component Client Expert Hero: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Client Expert Hero” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ClientExpertHero = ({ isExpertMode }) => (
  <section className="expert-hero">
    <div>
      <h2>
        {isExpertMode ? "Discover " : "Hire "}
        <span style={{
          background: 'linear-gradient(to right, #60a5fa, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {isExpertMode ? "Clients" : "World-Class AI Experts"}
        </span>
      </h2>
      <p>
        {isExpertMode
          ? "Browse clients and companies looking for AI specialists, project partners, and technical delivery support."
          : "Connect with machine learning engineers, data scientists, and AI architects to accelerate your innovation."}
      </p>
    </div>
  </section>
);

export default ClientExpertHero;
