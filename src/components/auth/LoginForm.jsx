import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.email.includes("@")) {
      return "Email is invalid";
    }

    if (!formData.password.trim()) {
      return "Password is required";
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

      const result = await login(formData);

      console.log("Login success:", result);

      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your email or password.");
    }
  };

  return (
    <>
      <h2 className="form-title">Welcome back</h2>
      <p className="form-subtitle">Sign in to manage your AI workforce.</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">✉</span>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "◡" : "👁"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn">
          Log In
        </button>
      </form>

      <button className="forgot-btn" type="button">
        Forgot password?
      </button>

      <div className="divider">
        <span></span>
        <p>or</p>
        <span></span>
      </div>

      <button
        type="button"
        className="outline-btn"
        onClick={() => navigate("/register")}
      >
        Create new account
      </button>
    </>
  );
}

export default LoginForm;

