import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
    authenticateToken,
    authenticate_admin_token,
    authenticate_student_token,
    authenticate_examiner_token
} from "../middleware/authentication.js";

import {
    create_question,
    update_question,
    delete_question,
    all_questions_subject_wise_student,
    add_question_bookmark_student,
    delete_question_bookmark_student,
    all_questions_examiner,
} from "../controller/questions.js";
import {
    create_exam,
    update_exam,
    delete_exam,
    add_question_in_exam,
    delete_question_from_exam,
    fetch_exam_student,
    fetch_exam_examiner,
} from "../controller/exam.js";
import {
    create_session,
    admin_login,
    create_examiner,
    create_student,
    forgot_password,
    verify_otp,
    reset_password,
    create_admin,
    resend_otp,
} from "../controller/authentication.js";
import {
    get_past_exams,
    get_past_exams_5_student,
    get_upcoming_exams,
    get_upcoming_exams_5_student,
    get_upcoming_exams_student,
    get_past_exams_5_examiner,
    get_upcoming_exams_5_examiner,
    get_upcoming_exams_examiner,
    get_past_exams_examiner
} from "../controller/past_upcoming_exams.js";
import { exam_attempted_student, exams_result, show_exam } from "../controller/exams_result.js"
import { all_students, delete_student, get_student, student_performance, student_submit_answer, submit_exam_student, update_student } from "../controller/student.js";
import { all_examiners, delete_examiner, get_examiner, update_profile } from "../controller/examiner.js";


dotenv.config();
const router = express.Router();

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type", "Role"],
};

router.use(cors(corsOptions));

router.get("/", (req, res) => {
    return res.json("Hello!");
});

// Basic routes
router.post("/create-session", create_session);
router.post("/admin-login", admin_login);
router.post("/forgot-password", forgot_password);
router.post("/verify-otp", verify_otp);
router.post("/resend-otp", resend_otp);
router.post("/reset-password", authenticateToken, reset_password);

// Admin Routes
router.post("/create-student", authenticate_admin_token, create_student);
router.post("/create-examiner", authenticate_admin_token, create_examiner);
// router.post("/create-admin", create_admin);
router.post("/update-profile/:username", authenticate_admin_token, update_profile);
router.get("/all-students", authenticate_admin_token, all_students);
router.get("/all-examiners", authenticate_admin_token, all_examiners);
router.delete("/delete-student/:username", authenticate_admin_token, delete_student);
router.put("/update-student/:username", authenticate_admin_token, update_student);
router.delete("/delete-examiner/:username", authenticate_admin_token, delete_examiner);
router.put("/update-examiner/:username", authenticate_admin_token, update_profile);


router.get("/past-exams", get_past_exams);
router.get("/upcoming-exams", get_upcoming_exams);
router.get("/show-exam/:examId/:username", authenticateToken, show_exam);


// student related
router.get("/get-student/:username", authenticateToken, get_student);
router.get("/upcoming-exams-limit-5-student", authenticate_student_token, get_upcoming_exams_5_student);
router.get("/past-exams-limit-5-student", authenticate_student_token, get_past_exams_5_student);
router.get("/upcoming-exams-student", authenticate_student_token, get_upcoming_exams_student);
router.get("/student-performance", authenticate_student_token, student_performance);
router.get("/all-questions-student", authenticate_student_token, all_questions_subject_wise_student);
router.post("/add-bookmark-question", authenticate_student_token, add_question_bookmark_student);
router.post("/delete-bookmark-question", authenticate_student_token, delete_question_bookmark_student);

router.post("/student-submit-answer", authenticate_student_token, student_submit_answer);
router.post("/submit-exam-student", authenticate_student_token, submit_exam_student);

router.get("/exams-result", authenticate_student_token, exams_result);

router.get("/fetch-exam-student/:examId", fetch_exam_student);

// examiner related
router.get("/get-examiner/:username", authenticateToken, get_examiner);
router.get("/upcoming-exams-limit-5-examiner", authenticate_examiner_token, get_upcoming_exams_5_examiner);
router.get("/past-exams-limit-5-examiner", authenticate_examiner_token, get_past_exams_5_examiner);
router.get("/all-questions-examiner", authenticate_examiner_token, all_questions_examiner)
router.post("/create-question", authenticate_examiner_token, create_question);
router.put("/update-question/:id", authenticate_examiner_token, update_question);
router.delete("/delete-question/:id", authenticate_examiner_token, delete_question);
router.get("/upcoming-exams-examiner", authenticate_examiner_token, get_upcoming_exams_examiner);
router.get("/past-exams-examiner", authenticate_examiner_token, get_past_exams_examiner);
router.post("/create-exam", authenticate_examiner_token, create_exam);
router.put("/update-exam/:examId", authenticate_examiner_token, update_exam);
router.delete("/delete-exam/:examId", authenticate_examiner_token, delete_exam);
router.get("/exam-attempted-student/:examId", authenticate_examiner_token, exam_attempted_student);
router.post("/:examId/add-question", authenticate_examiner_token, add_question_in_exam);
router.delete("/:examId/delete-question/:questionId", authenticate_examiner_token, delete_question_from_exam);
router.get("/fetch-exam-examiner/:examId", authenticate_examiner_token, fetch_exam_examiner);

export default router;
