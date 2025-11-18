import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label,
} from "recharts";
import Examreport from "../ResultPage/Examreport";
import "./PerformanceResultPage.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../Loader/Loding.jsx"


const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#d0ed57",
];

const PerformanceResultPage = () => {
    const [averageScore, setAverageScore] = useState(0);
    const [performanceData, setPerformanceData] = useState([]);
    const [finalPercentage, setFinalPercentage] = useState(0);
    const [pastExams, setPastExams] = useState([]);
    const navigate = useNavigate();
    const [isexamreportopen, setisexamreportopen] = useState(false);
    const [currExam, setCurrExam] = useState(null);
    const [isloaderon, setisloaderon] = useState(false);


    useEffect(() => {
        if (!Cookies.get("token") || Cookies.get("role") !== "Student") {
            navigate("/");
        }

        fetch_past_exams();
    }, []);

    useEffect(() => {
        if (pastExams.length > 0) {
            const totalScore = pastExams.reduce(
                (acc, exam) => acc + exam.obtainedPoints,
                0
            );

            const avgScore = totalScore / pastExams.length;
            setAverageScore(avgScore);

            const maxScore = pastExams.reduce(
                (acc, exam) => acc + exam.totalPoints,
                0
            );

            const percentage = (totalScore / maxScore) * 100;
            setFinalPercentage(percentage.toFixed(2));

            const chartData = pastExams.map((exam, index) => ({
                name: `Exam ${index + 1}`,
                score: exam.obtainedPoints,
                average: avgScore,
            }));
            setPerformanceData(chartData);
        }
    }, [pastExams]);

    const fetch_past_exams = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/exams-result",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setPastExams(Object.values(result.data.pastExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    return (
        <div>
        {isloaderon && <Loading/>}

            {!isexamreportopen && (
                <div>
                    <div className="overall-performance">
                        <h2>Overall Performance</h2>
                        <p>Average Score: {averageScore.toFixed(2)}</p>
                        <div className="charts-container">
                            <ResponsiveContainer width="60%" height={300}>
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8884d8"
                                        name="Exam Score"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="average"
                                        stroke="#82ca9d"
                                        name="Average Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="chart-container-progress-circle">
                                <div
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "50%",
                                        background:
                                            `conic-gradient(#3F72AF 0% ${finalPercentage}%, #e0e0e0 ${finalPercentage}%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            borderRadius: "50%",
                                            background:
                                                "conic-gradient(white 0% 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span>{finalPercentage}%</span>
                                    </div>
                                </div>
                                <br />
                                <p>Overall Performance</p>
                            </div>
                        </div>
                    </div>
                    <div className="result-page">
                        <div className="exam-result">
                            <h3>Exam Result</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Exam</th>
                                            <th>Marks Obtained</th>
                                            <th>Total Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pastExams.map((result, index) => (
                                            <tr key={index}>
                                                <td
                                                    className="student-dashboard-td"
                                                    onClick={() =>
                                                        {
                                                            setisexamreportopen(true);
                                                            setCurrExam(result);
                                                        }
                                                    }
                                                >
                                                    {result.title}
                                                </td>
                                                <td>{result.obtainedPoints}</td>
                                                <td>{result.totalPoints}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isexamreportopen && (
                <div>
                    <Examreport exam={currExam} />
                    <button
                        className="create-examiner-button"
                        onClick={() => setisexamreportopen(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default PerformanceResultPage;
