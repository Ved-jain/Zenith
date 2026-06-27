import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "../constants/routes";
import { useAuth } from "../auth/AuthContext";

function Register() {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.name || !formValues.email || !formValues.password) {
      setFormError("Name, email, and password are required.");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setFormError("Passwords must match.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      await register({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
      });
      navigate(DASHBOARD_ROUTES.OVERVIEW, { replace: true });
    } catch (submitError) {
      setFormError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Register</p>
        <h1>Create your Zenith workspace.</h1>
        <p>
          Use email and password authentication to access portfolio analytics,
          watchlists, stock detail pages, and order history.
        </p>
        <div className="auth-preview">
          <span>Included after signup</span>
          <strong>Health Score · Watchlist · Trading Analytics</strong>
        </div>
      </div>

      <form className="signup-panel auth-panel" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formValues.name}
            onChange={handleChange}
            required
          />
        </label>
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
            placeholder="Create a password"
            value={formValues.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formValues.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
        {(formError || error) && (
          <p className="form-error">{formError || error}</p>
        )}
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
        <p>
          Already have an account? <Link to={PUBLIC_ROUTES.LOGIN}>Login</Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
