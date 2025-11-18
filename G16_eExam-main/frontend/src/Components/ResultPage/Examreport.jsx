import React, { useEffect, useState } from "react";
import "./Examreport.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../Loader/Loding.jsx"


const ExamResultCard = ({ exam, username, obtainedPoints }) => {
    const navigate = useNavigate();
    const [examDetails, setExamDetails] = useState(null);
    const [isloaderon, setisloaderon] = useState(false);


    useEffect(() => {
        if (!Cookies.get("token") || !Cookies.get("token")) {
            navigate("/");
        }
        fetch_exam_details();
    }, []);

    const fetch_exam_details = async () => {
      setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    `/show-exam/${exam?.examId}/${username || Cookies.get("username")}`,
                { headers }
            );

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }
            
            setExamDetails(result.data);
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    }


  return (
    <div id="card-container">
    {isloaderon && <Loading/>}
      <div id="exam-card">
        <h2>{exam?.title}</h2>
        <p><strong>Subject:</strong> {exam?.subject}</p>
        <p><strong>Student ID:</strong> {Cookies.get("username")}</p>
        <p><strong>Obtained Marks:</strong> {exam?.obtainedPoints || obtainedPoints}/{exam?.totalPoints || exam?.total_points}</p>

        <div id="questions-section">
          <h3>Questions and Responses</h3>
          {examDetails?.questions && examDetails.questions.map((q, index) => (
            <div key={index} id="question-card">
              <p><strong>Question {index + 1}:</strong> {q.description}</p>
              <ul id="options-list">
                {q.options.map((option, optIndex) => (
                  <li
                    key={optIndex}
                    className={`option 
                    ${option === q.options[q.correctAnswer] ? "correct-answer" : ""}`}
                  >
                    {option}
                    {option === q.options[q.selectedAnswer] && (
                      <span id="tickmark"> (✔ Student)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamResultCard;
