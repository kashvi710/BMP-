import React, { useState, useEffect } from 'react';
import './Adminlogin.css';
import { Helmet } from 'react-helmet';
import logo from '../assets/logo.png';
import close from '../assets/eye-closed.svg';
import open from '../assets/eye-opened.svg';
import { toast } from "react-toastify";
import axios from "axios";
import MoonLoader from "react-spinners/MoonLoader";
import config from "../../config.js";
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import Admindashboard from '../Admindashboard/AdminDashboard.jsx';
import Cookies from 'js-cookie';
import Loading from "../Loader/Loding.jsx"


const Login = () => {
  const [authorizationCode, setauthorizationCode] = useState('');
  const [showCode, setshowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, validateUser, isLoggedIn } = useAuth();
  const [isloaderon, setisloaderon] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if(Cookies.get("role") === "Student" || Cookies.get("role") === "Examiner"){
        navigate('/');
    }

  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the default form submission
  
    setisloaderon(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!authorizationCode) {
      toast.error("Code is missing");
      setisloaderon(false);
      return;
    }
  
    try {
      const results = await axios.post(
        (config.BACKEND_API || "http://localhost:8000") + "/admin-login",
        {
          password: authorizationCode,
        }
      );
  
      if (results.status === 200) {
        Cookies.set("token", results.data.token, { expires: 7 });
        Cookies.set("username", results.data.username, { expires: 7 });
        Cookies.set("role", results.data.role, { expires: 7 });
        setIsLoggedIn(true);
        toast.success("Login Successful");
        navigate("/admin");
      }else{
        
        toast.error(results.data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error((e?.response?.data?.message) || ("Internal server error"));
    }
  
    setisloaderon(false);
  };
  
  

  return (
    isLoggedIn && Cookies.get("role") === "Admin" ? 
    <>
      {isloaderon && <Loading/>}
      <Admindashboard />
    </>
    :
    <div className="login-container">
    {isloaderon && <Loading/>}
      <Helmet>
        <title>Administrator Login</title>
        <link rel="icon" href={logo} type="image/x-icon" />
      </Helmet>
      <form onSubmit={handleLogin} className="login-form">
        <h2>Administrator Login</h2>

        <label htmlFor="securitykey">Authorization Code</label>
        <div className="password-container">
          {/* Password input field */}
          <input
            type={showCode ? 'text' : 'password'}
            id="password"
            name="password"
            value={authorizationCode}
            onChange={(e) => setauthorizationCode(e.target.value)}
            placeholder="Enter Authorization Code"
            required
          />

          {/* Button to toggle password visibility */}
          <button
            type="button"
            onClick={() => setshowCode(!showCode)}
            className="eye-button"
          >
            {showCode ?
              <img src={close} alt="Hide password" /> :
              <img src={open} alt="Show password" />
            }
          </button>
        </div>

        {/* Submit button */}
        <button type="submit" className="login-button">
          Login
        </button>

        <MoonLoader
          color="red"
          loading={loading}
          size={60}
        />

        {/* Remember me and forgot password section */}
      </form>

    </div>
  );
}

export default Login;