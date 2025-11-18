import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitConfirmationModal.css";
import config from "../../config.js";
import axios from "axios";
import Cookies from "js-cookie";
import Loading from "../Loader/Loding.jsx"


const SubmitConfirmationModal = ({ onCancel, autoSubmit, examId, toast }) => {
    const navigate = useNavigate();
    const [isloaderon, setisloaderon] = useState(false);


    const handleConfirmClick = () => {
        submit_exam();

        setTimeout(() => {
            navigate("/dashboard");
        }, 1000);
    };

    const submit_exam = async () => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.post(
                (config.BACKEND_API || "http://localhost:8000") +
                    `/submit-exam-student`,
                {
                    examId,
                },
                { headers }
            );
            // console.log(result);

            if (result.status !== 200) {
                toast.error(result?.data?.message || "Internal server error");
                setisloaderon(false);
                return;
            }
            if(autoSubmit){
                toast.warning("Tab Switched");
            } 

            toast.success(result.data.message);
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal Server Error");
        }
        setisloaderon(false);
    };

    useEffect(() => {
        if (autoSubmit) {
            handleConfirmClick();
        }
    }, [autoSubmit]);
    if (!autoSubmit) {
        return (
            <div className="modal-overlay">
                {isloaderon && <Loading/>}
                <div className="submit-modal">
                    <h2>Confirm Submission</h2>
                    <p>Are you sure you want to submit your test?</p>
                    <div className="modal-buttons">
                        <button onClick={handleConfirmClick}>
                            Yes, Submit
                        </button>
                        <button onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default SubmitConfirmationModal;
