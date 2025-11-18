// Homepage.jsx
import React, { useState , useEffect } from 'react';
import { Helmet } from 'react-helmet';
import logo from '../assets/logo.png';
import './Homepage.css';
import Login from '../Login/Login.jsx';
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Homepage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { setIsLoggedIn, validateUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    
    
    if (Cookies.get("token")) {
      navigate("/dashboard");
    }

    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  useEffect(() => {
    if (Cookies.get("token")) {
        navigate("/dashboard");
      }
  }, []);

  useEffect(() => {
    if (isLoginOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isLoginOpen])

  return (
    <div>
      <div className={`homepage ${isLoginOpen ? 'blur disable-background' : ''}`}>  
        <Helmet>
          <title>Online Examination System</title>
          <link rel="icon" href={logo} type="image/x-icon" />
        </Helmet>

        <header className="header">
          <div>
            <img src={logo} alt="Online Examination System Logo" className="logo" />
          </div>
          <h1>Online Examination System</h1>
          <nav className="navbar">
            <ul>
              <li><a href="#home">About</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li onClick={handleLoginClick}><a>Login</a></li> 
            </ul>
          </nav>
        </header>

        <section className="hero" id="home">
          <h2>Welcome to the Online Exams</h2>
          <p>Welcome to Online Examination System , a comprehensive online platform designed for creating, managing, and taking exams with ease. Perfect for educators, student and organization, our system offers a secure and intuitive environment for assessments of all kinds. With features like Secure Assessment ,
          Real-Time Results, Multiple Question Types and User-Friendly Interface. we simplify the examination process while ensuring reliability and data privacy. Online Examination System empowers you to deliver efficient, fair and insightful testing experiences for both examiners and students. Start enhancing your assessment journey today!</p>
          <button className="cta-btn" onClick={handleLoginClick}>Get Started</button>
        </section>

        <section id="features" className="features">
          <h3>Features</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <h4>Exam Scheduling</h4>
              <p>Schedule exams in advance with automated reminders for students.</p>
            </div>
            <div className="feature-item">
              <h4>Real-Time Results</h4>
              <p>Get your scores as soon as your exam finishes.</p>
            </div>
            <div className="feature-item">
              <h4>Multiple Question Types</h4>
              <p>Supports multiple-choice, true/false, and more.</p>
            </div>
            <div className="feature-item">
              <h4>User-Friendly Interface</h4>
              <p>Easily navigate through your exams with our intuitive UI.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <h3>Contact Us</h3>
          <p>For any inquiries, please reach out to us at: <strong>admin@daiict.ac.in</strong></p>
        </section>

        <footer className="ft">
          <p>&copy; 2024 Online Examination System. All rights reserved.</p>
        </footer>
      </div>
        {isLoginOpen && <Login onClose={handleCloseLogin} />}  
    </div>
  );
};

export default Homepage;
