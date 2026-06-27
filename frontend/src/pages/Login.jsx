import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../constants/routes";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.email || !formValues.password) {
      setFormError("Email and password are required.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      await login(formValues);
      navigate(location.state?.from || DASHBOARD_ROUTES.OVERVIEW, {
        replace: true,
      });
    } catch (submitError) {
      setFormError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Login</p>
        <h1>Return to your portfolio desk.</h1>
        <p>
          Sign in to review portfolio health, tracked stocks, orders, and
          trading activity in the same focused workspace.
        </p>
        <div className="auth-preview">
          <span>Protected workspace</span>
          <strong>Overview · Portfolio · Orders</strong>
        </div>
      </div>

      <form className="signup-panel auth-panel" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formValues.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="Your password"
            value={formValues.password}
            onChange={handleChange}
            required
          />
        </label>
        {(formError || error) && (
          <p className="form-error">{formError || error}</p>
        )}
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        <p>
          New here? <Link to={PUBLIC_ROUTES.REGISTER}>Create an account</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
