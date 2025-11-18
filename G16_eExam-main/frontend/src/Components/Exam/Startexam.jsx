import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Startexam.css";
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
    }, [startTime]);

    if (!timeLeft) {
        return <div>Exam has started!</div>;
    }

    return (
            <p>
            <strong>Time Left:</strong> {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                {timeLeft.seconds}s
            </p>
    );
};

const StartExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [consentGiven, setConsentGiven] = useState(false);
    const [showError, setShowError] = useState(false);
    const [testCountdown, setTestCountdown] = useState(null);
    const [exam, setExam] = useState({});
    const [startBtn, setStartBtn] = useState(false);
    const [isLoaderOn, setIsLoaderOn] = useState(false);

    useEffect(() => {
        if (!Cookies.get("token") || Cookies.get("role") !== "Student") {
            navigate("/");
        }
        fetchExam();
    }, []);

    const fetchExam = async () => {
        setIsLoaderOn(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    `/fetch-exam-student/${examId}`,
                { headers }
            );

            if (result.status !== 200) {
                toast.error(result?.data?.message || "Internal server error");
                setIsLoaderOn(false);
                return;
            }

            setExam(result.data.exam);
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal Server Error");
            navigate(-1);
        }
        setIsLoaderOn(false);
    };

    const handleConsentChange = () => {
        setConsentGiven(!consentGiven);
        setShowError(false);
    };

    const startTest = () => {
        if (!consentGiven) {
            setShowError(true);
            return;
        }
        setTestCountdown(10);
    };

    useEffect(() => {
        if (testCountdown === 0) {
            navigate(`/exams/${examId}`);
        } else if (testCountdown > 0) {
            const timer = setInterval(() => {
                setTestCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [testCountdown, navigate]);

    return (
        <div className="start-exam-container">
            {isLoaderOn && <Loading />}
            <div className="exam-container">
                <h1 className="heading">{exam?.title}</h1>
                <div className="professor-name">
                    <p>
                        <strong>Created by:</strong> {exam?.creator}
                    </p>
                </div>
                <div className="info">
                    <p>
                        <strong>User:</strong> {Cookies.get("username")}
                    </p>
                    <p>
                        <strong>Exam Duration:</strong> {exam?.duration} minutes
                    </p>
                    <div>
                        <CountdownTimer
                            startTime={exam.startTime}
                            onExamStarted={() => setStartBtn(true)} // Enable button after start time
                        />
                    </div>
                </div>
                <div className="instructions">
                    <p>
                        <strong>Instructions:</strong>
                    </p>
                    <ul>
                        {exam?.instructions &&
                            exam?.instructions.map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                    </ul>
                </div>

                <div className="consent">
                    <div className="checkbox">
                        <input
                            type="checkbox"
                            checked={consentGiven}
                            onChange={handleConsentChange}
                        />
                    </div>
                    <div>
                        <label>
                            I agree to the terms and conditions, including that
                            I will not engage in any form of academic dishonesty
                            or use unauthorized assistance during the test.
                        </label>
                    </div>
                </div>
                {showError && (
                    <div className="error-message">
                        Please agree to the terms and conditions before starting
                        the test.
                    </div>
                )}
                {testCountdown !== null ? (
                    <div className="countdown">
                        The test will start in <strong>{testCountdown}</strong>{" "}
                        seconds.
                    </div>
                ) : (
                    <button
                        className="start-btn"
                        onClick={startTest}
                        disabled={!startBtn} // Disable until exam starts
                    >
                        Start Test
                    </button>
                )}
            </div>
            <footer className="footer">
                <p>
                    For technical support, contact:{" "}
                    <a href="mailto:admin@daiict.ac.in">admin@daiict.ac.in</a>
                </p>
                <p>&copy;Dhirubhai Ambani Institute Of Information and Communication Technology</p>
            </footer>
        </div>
    );
};


export default StartExam;
