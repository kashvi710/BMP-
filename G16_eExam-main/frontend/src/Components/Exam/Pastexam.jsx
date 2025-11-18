import React from 'react';
import './Pastexam.css';

const Pastexam = ({ results }) => {


  return (
    <div className="pastexam-container">
      <h2>Past Exams</h2>
      <div className="pastexam-table">
        <div className="table-header">
          <div className="header-item">Exam</div>
          <div className="header-item">Date</div>
          <div className="header-item">Score</div>
          <div className="header-item">Status</div>
          <div className="header-item">Detail</div>
        </div>
        <div className="past-exam-list-div">
          {results.map((result, index) => (
            <div className="table-row" key={index}>
              <div className="table-cell">{result.examName}</div>
              <div className="table-cell">{result.date}</div>
              <div className="table-cell">{result.score}</div>
              <div className="table-cell">{result.status}</div>
              <div className="table-cell detail-cell">
                <button className="pbutton" onClick={() => console.log('Viewing details for:', result.examName)}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="records-info">Records: 1 to {results.length} of {results.length}</div>
      {

      }
    </div>
  );
};

export default Pastexam;
