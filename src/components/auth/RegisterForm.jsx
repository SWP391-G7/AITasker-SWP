import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { register } from "../../Services/authService";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Full name is required";
    }

    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.email.includes("@")) {
      return "Email is invalid";
    }

    if (!formData.password.trim()) {
      return "Password is required";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Confirm password does not match";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validateError = validateForm();

    if (validateError) {
      setError(validateError);
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || "Register failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="form-title">Create your account</h2>
      <p className="form-subtitle">Join AITasker and start working smarter.</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">
            <User size={19} />
          </span>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <span className="input-icon">
            <Mail size={19} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <span className="input-icon">
            <Lock size={19} />
          </span>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <div className="input-group">
          <span className="input-icon">
            <Lock size={19} />
          </span>

          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowConfirmPassword((value) => !value)}
            disabled={isLoading}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="bottom-text">
        Already have an account?{" "}
        <button type="button" onClick={() => navigate("/login")} disabled={isLoading}>
          Log in
        </button>
      </div>
    </>
  );
}

export default RegisterForm;
