import React, { useEffect, useState } from "react";
import "./ExamResults.css";
import Examreport from '../ResultPage/Examreport.jsx'
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import Loading from "../Loader/Loding.jsx"


// Sample student data
// const studentData = [
//   { id: "202201242", name: "John Doe", marksEarned: 85,  batch: "2024" },
//   { id: "202201247", name: "Jane Smith", marksEarned: 90, batch: "2024" },
//   { id: "202201241", name: "Alice Brown", marksEarned: 78, batch: "2023" },
//   { id: "202201243", name: "Bob Johnson", marksEarned: 88, batch: "2023" },
//   { id: "202201244", name: "John Doe", marksEarned: 85,  batch: "2024" },
  
// ];

const ExamResult = ({ exam }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [filteredStudents, setfilteredStudents] = useState([]);
  const [currUser, setCurrUser] = useState(null);
  const [isloaderon, setisloaderon] = useState(false);


  useEffect(() => {
        setfilteredStudents(studentData.filter((student) =>
            student.username.toLowerCase().includes(searchTerm.toLowerCase())
          ));
    
  }, [searchTerm]);

  const [isExamreportopen,setisExamreportopen] = useState(false);

  useEffect(() => {
    if(exam?.examId){
        if (
            !Cookies.get("token") ||
            !Cookies.get("role") ||
            Cookies.get("role") === "Admin"
        ) {
            navigate("/");
        } else {
            fetch_exam_result();
        }
    }else{
        return <></>;
    }
  }, []);

  const fetch_exam_result = async () => {
    setisloaderon(true);
    try {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
        };

        const result = await axios.get(
            (config.BACKEND_API || "http://localhost:8000") +
                `/exam-attempted-student/${exam.examId}`,
            { headers }
        );

        // console.log(result);

        if (result.status !== 200) {
            toast.error(result.data.message);
            setisloaderon(false);
            return;
        }

        setStudentData(Object.values(result.data.results));
        setfilteredStudents(Object.values(result.data.results));
    } catch (e) {
        console.log(e);
        toast.error(e?.response?.data?.message || "Internal server error");
    }
    setisloaderon(false);
};

  const getTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
};
  
  return (
    <div className="exam-result-container">
      {isloaderon && <Loading/>}
      { !isExamreportopen &&
      <>
      <h2>Exam Results</h2>
      <div className="exam-information-div">
        <h3> Exam Title : <span>{exam?.title}</span></h3>
        <h3> Subject : <span>{exam?.subject}</span></h3> 
        <h3>Duration : <span>{exam?.duration} minutes</span></h3>
        <h3>Starttime : <span>{exam?.startTime && getTime(exam.startTime)}</span></h3>
        <h3>No. of Question: <span>{exam?.questions ? exam.questions.length : 0}</span></h3>
        <h3>Total Marks :<span>{exam?.total_points}</span></h3>
      </div>
      <input
        type="text"
        placeholder="Search by Student ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <table className="exam-result-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Marks Earned</th>
            {/* <th>Total Marks</th> */}
            <th>Batch</th>
          </tr>
        </thead>
        <tbody className="table-content" >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={student.username} >
                <td onClick={()=> {setisExamreportopen(true), setCurrUser(student)}} className="studentid-result"
                onclick>{student.username}</td>
                <td>{student.name}</td>
                <td>{student.obtainedPoints}</td>
                {/* <td>{student.totalMarks}</td> */}
                <td>{student.batch}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results">
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </>
      }
      {isExamreportopen && 
        <>
      <Examreport exam={exam} username={currUser.username} obtainedPoints={currUser.obtainedPoints}/>
      <button className="create-examiner-button" style={{zIndex:"10"}} onClick={()=>setisExamreportopen(false)}>
              Close
      </button>
      </>
      }
    </div>
  );
};

export default ExamResult;
