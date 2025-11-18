import React, { useState, useEffect } from 'react';
import './Login.css';
import { Helmet } from 'react-helmet';
import logo from '../assets/logo.png';
import close from '../assets/eye-closed.svg';
import open from '../assets/eye-opened.svg';
import ForgetPassword from './forgetpassword.jsx'; // Import the ForgetPassword component
import config from "../../config.js";
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MoonLoader from "react-spinners/MoonLoader";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Loading from "../Loader/Loding.jsx"

const Login = ({ onClose }) => {
  // States for form fields and password visibility
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, validateUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isloaderon, setisloaderon] = useState(false);


  useEffect(() => {
    if (Cookies.get('token')) {
      navigate("/dashboard");
    }
  }, []);

  // Function triggered on form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    setisloaderon(true);


    if (!username || !password) {
      toast.error("Fields are missing");
      setLoading(false);
      setisloaderon(false);
      return;
    }


    try {
      const results = await axios.post(
        (config.BACKEND_API || "http://localhost:8000") +
        "/create-session",
        {
          emailUsername: username,
          password: password
        }
      );

    //   console.log(results);


      if (results.status === 200) {
        Cookies.set("token", results.data.token, { expires: 7 });
        Cookies.set("username", results.data.username, { expires: 7 });
        Cookies.set("role", results.data.role, { expires: 7 });
        setIsLoggedIn(true);

        // await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("Login Successful");
        setTimeout(() => {
          window.location.href = "/";
          window.location.reload();
        }, 1000);
      } else {
        toast.error(results.data.error);
      }
    }
    catch (e) {
      console.log(e);
      toast.error((e?.response?.data?.message) || ("Internal server error"));
    }

    setisloaderon(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgetPassword(true); // Show the forget password form
  };

  const handleCloseForgetPassword = () => {
    setShowForgetPassword(false); // Close the forget password form and return to login
  };

  return (
    <div>
      <Helmet>
        <title>Login</title>
        <link rel="icon" href={logo} type="image/x-icon" />
      </Helmet>

      <div className="login-container">
        {isloaderon && <Loading/>}
        {showForgetPassword ? (
          // Render ForgetPassword component when state is true
          <ForgetPassword onClose={handleCloseForgetPassword} />
        ) : (
          // Otherwise, render the Login form
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>

            {/* Username input */}
            <label htmlFor="username">Username</label>
            {/* <br /> */}
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            <br />

            {/* Password input with toggle visibility */}
            <label htmlFor="password">Password</label>
            {/* <br /> */}
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <img src={close} alt="Hide password" />
                ) : (
                  <img src={open} alt="Show password" />
                )}
              </button>
              <MoonLoader
                color="red"
                loading={loading}
                size={60}
              />
            </div>

            {/* Submit button */}
            <button type="submit" className="login-button">
              Login
            </button>
            <button type="button" onClick={onClose} className="close-button">
              Close
            </button>

            {/* Remember me and forgot password */}
            <div className="remember-forgot">
              <br />
              <p
                type="button"
                onClick={handleForgotPasswordClick}
                className="forgot-password"
              >
                Forgot Password?
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
