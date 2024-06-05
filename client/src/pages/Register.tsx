import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { registerUser } from "../services/api";
import { User } from "../models/User";
import "../styles/Auth.css";
import alpaca from "../img/alp.png";

export const Register = () => {
  const location = useLocation();
  const selectedProduct = location.state?.selectedProduct;

  const [formData, setFormData] = useState<User>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
  });

  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptTerms(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("You must accept the terms and conditions to register.");
      return;
    }

    try {
      const response = await registerUser(formData);
      console.log("Registration successful:", response.data);
      setErrorMessage("");
      setSuccessMessage("Registration successful!");
    } catch (error: any) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      setErrorMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <img className="alpaca-img" src={alpaca} alt="alpaca" />

        <h1>Register</h1>
        {selectedProduct && <h2>Your chosen level: {selectedProduct.name}</h2>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {successMessage && (
          <p style={{ color: "green" }}>
            {successMessage} <Link to="/login">Login here</Link>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={handleCheckboxChange}
            />
            <p>I accept the terms and conditions for storing personal data.</p>
          </div>
          <button type="submit">Register & Pay</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
