import React, { useEffect, useState } from "react";
import "./Upcomingexam.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config.js";
import axios from "axios";
import Cookies from "js-cookie";
import Loading from "../Loader/Loding.jsx"


const CountdownTimer = ({ startTime, onExamStarted }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const targetTime = new Date(startTime);
            const difference = targetTime - now;

            if (difference > 0) {
                const days = Math.floor(difference / (24 * 1000 * 60 * 60));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / (1000 * 60)) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft(null); // Event time passed
                if (onExamStarted) {
                    onExamStarted();  // Notify the parent component that the exam can be started
                }
            }
        };

        const timerId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timerId); // Cleanup interval on unmount
    }, [startTime, onExamStarted]);

    if (!timeLeft) {
        return <div>Exam has started!</div>;
    }

    return (
        <div>
            <p>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                {timeLeft.seconds}s
            </p>
        </div>
    );
};


const Upcomingexam = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [examStarted, setExamStarted] = useState({});
    const [isloaderon, setisloaderon] = useState(false);


    useEffect(() => {
        if (!Cookies.get("token") || Cookies.get("role") !== "Student") {
            navigate("/");
        }

        fetch_exams();
    }, []);

    useEffect(() => {
        // console.log(examStarted);
        // console.log(exams);
        
    }, [exams]);

    const fetch_exams = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/upcoming-exams-student",
                { headers }
            );

            if (result.status !== 200) {
                toast.error(result?.message || "Internal server error");
                setisloaderon(false);
                return;
            }
            setExams(Object.values(result.data.upcomingExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal Server Error");
        }
        setisloaderon(false);

    };

    const getDate = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString();
    };

    const getTime = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
    };

    const startExam = (exam) => {
        navigate(`/exams/${exam.examId}/start`);
    };

    // Function to handle the timer completion and change the button text
    const handleExamStarted = (examId) => {
        setExamStarted((prevState) => ({
            ...prevState,
            [examId]: true, // Mark the exam as ready to start
        }));
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
                    <div className="uheader-item">Detail</div>
                </div>
                {
                    exams.length === 0 && <div>No Upcoming Exams found</div>
                }
                {exams.map((exam, index) => (
                    <div key={index} className="utable-row">
                        <div className="utable-cell">{exam.title}</div>
                        <div className="utable-cell">{exam.creator}</div>
                        <div className="utable-cell">
                            {getDate(exam.startTime)}
                        </div>
                        <div className="utable-cell">
                            {getTime(exam.startTime)}
                        </div>
                        <div className="utable-cell">{exam.duration}</div>
                        <div className="utable-cell">
                            <CountdownTimer
                                startTime={exam.startTime}
                                onExamStarted={() => handleExamStarted(exam.examId)}
                            />
                        </div>
                        <div className="utable-cell detail-cell">
                            <button
                                className="ubutton"
                                onClick={() => startExam(exam)}
                            >
                                {examStarted[exam.examId] === true ? "Start" : "👁 View"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="urecords-info">
                Records: 1 to {exams.length} of {exams.length}
            </div>
        </div>
    );
};


export default Upcomingexam;
