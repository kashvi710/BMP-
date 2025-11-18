import React, { useEffect, useState } from "react";
import "./Upcomingexam.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config.js";
import axios from "axios";
import Cookies from "js-cookie";
import Loading from "../Loader/Loding.jsx"


const CountdownTimer = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
      const calculateTimeLeft = () => {
          const now = new Date();
          const targetTime = new Date(startTime);
          const difference = targetTime - now;

          if (difference > 0) {

              const days = Math.floor((difference / (24 *1000 * 60 * 60)));
              const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
              const minutes = Math.floor((difference / (1000 * 60)) % 60);
              const seconds = Math.floor((difference / 1000) % 60);
              setTimeLeft({days, hours, minutes, seconds });
          } else {
              setTimeLeft(null); // Event time passed
          }
      };

      const timerId = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timerId); // Cleanup interval on unmount
  }, [startTime]);

  if (!timeLeft) {
      return <div>Exam has started!</div>;
  }

  return (
      <div>
          <p>
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
      </div>
  );
};

const UpcomingexamAdmin = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isloaderon, setisloaderon] = useState(false);


  useEffect(() => {

    if ((!Cookies.get("token")) || Cookies.get("role") !== "Admin") {
      navigate("/");
    }

    fetch_exams();

  }, []);

  const fetch_exams = async () => {
    setisloaderon(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      };

      const result = await axios.get((config.BACKEND_API || "http://localhost:8000") + "/upcoming-exams", { headers });

      if (result.status !== 200) {
        toast.error((result?.message) || ("Internal server error"));
        setisloaderon(false);
        return;
      }
      setExams(Object.values(result.data.upcomingExams));
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Internal Server Error");
    }
    setisloaderon(false);

  }

  const getDate = (datetime) => {
      const date = new Date(datetime);
      return date.toLocaleDateString();
  }

  const getTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }); 
};


  return (
    <div className="uexam-list-container">
    {isloaderon && <Loading/>}
      <h2 className="uhead">Upcoming Exams</h2>
      <div className="exam-table">
        <div className="utable-header">
          <div className="uheader-item">Exam</div>
          <div className="uheader-item">Examiner</div>
          <div className="uheader-item">Date</div>
          <div className="uheader-item">Start Time</div>
          <div className="uheader-item">Duration</div>
          <div className="uheader-item">Start In</div>
        </div>
        {exams.length ? exams.map((exam, index) => (
          <div key={index} className="utable-row">
            <div className="utable-cell">{exam.title}</div>
            <div className="utable-cell">{exam.creator}</div>
            <div className="utable-cell">{getDate(exam.startTime)}</div>
            <div className="utable-cell">{getTime(exam.startTime)}</div>
            <div className="utable-cell">{exam.duration} minutes</div>
            <div className="utable-cell">
            <CountdownTimer startTime={exam.startTime} />
            </div>
          </div>
        )) : <div>No Upcoming Exams Found</div>}
      </div>
    </div>
  );
};

export default UpcomingexamAdmin;
