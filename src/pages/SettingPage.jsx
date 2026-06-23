import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const SettingPage = ({ isOpen, onClose, user, role = "Client", onLogout, onSwitchRole }) => {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // Normalize stored user fields so every navbar can reuse this modal.
  const profile = useMemo(() => {
    const displayName = user?.fullName || user?.name || (role === "Expert" ? "Expert User" : "Client User");
    const email = user?.email || `${displayName.toLowerCase().replace(/\s+/g, ".")}@example.com`;

    return {
      displayName,
      email,
      avatarLetter: displayName.trim().charAt(0).toUpperCase() || "U",
    };
  }, [role, user]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.classList.add("settings-modal-open");
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("settings-modal-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetRole = role === "expert" ? "Client" : "Expert";

  return (
    <div className="settings-modal-backdrop" role="dialog" aria-modal="true" aria-label="Account settings">
      <div className="settings-modal-shell" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
        <section className="settings-modal-panel">
          <button className="settings-close-btn" type="button" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>

          <div className="settings-card">
            <div className="settings-section-title">
              <UserRound size={18} />
              <h2>1. Account Details</h2>
            </div>

            <div className="settings-account-row">
              <div className="settings-account-info">
                <div className="settings-avatar">{profile.avatarLetter}</div>
                <div>
                  <h3>{profile.displayName}</h3>
                  <p>{profile.email}</p>
                </div>
              </div>
              <button className="settings-primary-btn" type="button">Edit Profile</button>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section-title">
              <ShieldCheck size={18} />
              <h2>2. Security & Privacy</h2>
            </div>

            <div className="settings-action-row">
              <div>
                <h3>Change Password</h3>
                <p>Update your password regularly to keep your account secure.</p>
              </div>
              <button className="settings-outline-btn" type="button">Update</button>
            </div>

            <div className="settings-divider" />

            <div className="settings-action-row">
              <div>
                <h3>Two-Factor Authentication (2FA)</h3>
                <p>Add an extra layer of security to your account.</p>
              </div>
              <button
                className={`settings-toggle ${isTwoFactorEnabled ? "active" : ""}`}
                type="button"
                onClick={() => setIsTwoFactorEnabled((value) => !value)}
                aria-pressed={isTwoFactorEnabled}
              >
                <span />
              </button>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-section-title">
              <CreditCard size={18} />
              <h2>3. Payment Methods</h2>
            </div>
            <p className="settings-muted">Manage your billing and payment options for active projects.</p>
            <button className="settings-add-payment" type="button">+ Add New Payment Method</button>
          </div>

          <div className="settings-card settings-role-card">
            <div>
              <div className="settings-section-title">
                <RefreshCw size={18} />
                <h2>4. Change Role</h2>
              </div>
              <p className="settings-muted">Currently browsing as <strong>{role}</strong>.</p>
            </div>
            <button className="settings-outline-btn" type="button" onClick={onSwitchRole}>
              Switch to {targetRole} View
            </button>
          </div>

          <button className="settings-logout-btn" type="button" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </section>
      </div>

      <style>{`
        body.settings-modal-open {
          overflow: hidden;
        }

        .settings-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(2, 6, 23, 0.64);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: var(--font-family);
          color: var(--text-main);
        }

        .settings-modal-shell {
          width: 100%;
          max-height: 100%;
          display: flex;
          justify-content: center;
          overflow-y: auto;
        }

        .settings-modal-panel {
          position: relative;
          width: min(760px, 100%);
          padding: 0;
        }

        .settings-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 1;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.78);
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .settings-close-btn:hover,
        .settings-outline-btn:hover {
          border-color: rgba(96, 165, 250, 0.34);
          background: rgba(59, 130, 246, 0.1);
          color: #ffffff;
        }

        .settings-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(8, 13, 26, 0.86));
          border: 1px solid rgba(148, 163, 184, 0.26);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          padding: 24px 20px;
          margin-bottom: 20px;
        }

        .settings-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          margin-bottom: 18px;
        }

        .settings-section-title h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0;
        }

        .settings-account-row,
        .settings-action-row,
        .settings-role-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .settings-account-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .settings-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
          border: 2px solid rgba(219, 234, 254, 0.22);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          font-size: 1.05rem;
          font-weight: 800;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
        }

        .settings-card h3 {
          margin: 0 0 5px;
          color: var(--text-main);
          font-size: 0.86rem;
          font-weight: 800;
        }

        .settings-card p {
          margin: 0;
          color: #bfdbfe;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .settings-muted {
          color: #bfdbfe;
        }

        .settings-primary-btn,
        .settings-outline-btn,
        .settings-add-payment {
          min-height: 36px;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 0.82rem;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
        }

        .settings-primary-btn {
          border: 1px solid rgba(147, 197, 253, 0.38);
          background: #a8c7ff;
          color: #082145;
        }

        .settings-primary-btn:hover {
          background: #bfdbfe;
          transform: translateY(-1px);
        }

        .settings-outline-btn {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(15, 23, 42, 0.68);
          color: #ffffff;
        }

        .settings-divider {
          height: 1px;
          background: rgba(148, 163, 184, 0.18);
          margin: 16px 0;
        }

        .settings-toggle {
          width: 42px;
          height: 22px;
          border: 0;
          border-radius: 999px;
          padding: 3px;
          background: rgba(71, 85, 105, 0.8);
          cursor: pointer;
        }

        .settings-toggle span {
          display: block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #94a3b8;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .settings-toggle.active {
          background: rgba(59, 130, 246, 0.36);
        }

        .settings-toggle.active span {
          transform: translateX(20px);
          background: #bfdbfe;
        }

        .settings-add-payment {
          width: 100%;
          margin-top: 14px;
          min-height: 50px;
          border: 1px dashed rgba(147, 197, 253, 0.74);
          background: rgba(15, 23, 42, 0.32);
          color: #93c5fd;
        }

        .settings-add-payment:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #ffffff;
        }

        .settings-logout-btn {
          border: 0;
          background: transparent;
          color: #ff4d4f;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          font-size: 0.86rem;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .settings-modal-backdrop {
            align-items: flex-start;
            padding: 16px;
          }

          .settings-card {
            padding: 22px 16px;
          }

          .settings-account-row,
          .settings-action-row,
          .settings-role-card {
            align-items: stretch;
            flex-direction: column;
          }

          .settings-primary-btn,
          .settings-outline-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingPage;
