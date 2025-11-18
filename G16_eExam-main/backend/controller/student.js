import Student from '../models/student.js';
import Question from '../models/question.js';
import Exam from '../models/exam.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

export const student_performance = async (req, res) => {
    try {
        const username = req?.user?.username;

        if(!username){
            return res.status(404).json({ message: "No Username Found" });
        }

        const student = await Student.findOne({ username: username })
            .populate({
                path: 'givenExams.exam',
                select: 'total_points'
            });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        let totalPointsPossible = 0;
        let totalPointsEarned = 0;

        // Iterate through each exam
        if(student?.givenExams && student.givenExams)
        student.givenExams.forEach((examRecord) => {
            totalPointsPossible += examRecord.exam.total_points;

            totalPointsEarned += examRecord.obtained_score;
        });

        // Calculate performance percentage
        const percentage = totalPointsPossible > 0 
            ? (totalPointsEarned / totalPointsPossible) * 100 
            : 0;

        // Send response
        return res.json({
            totalPointsPossible,
            totalPointsEarned,
            percentage: percentage.toFixed(2) + "%"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const student_submit_answer = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const { examId, questionId, answer } = req.body;

        // Fetch student, question, and exam data
        const student = await Student.findOne({ username });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const question = await Question.findOne({ questionId }); // Corrected query
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const examData = await Exam.findOne({ examId }); // Corrected query
        if (!examData) {
            return res.status(404).json({ message: "Exam not found" });
        }

        if(examData.batch !== student.batch || examData.branch !== student.branch){
            return res.status(404).json({ message: "Exam is not for your batch/branch" });
        }

        const startTime = new Date(examData.startTime);
        const endTime = new Date(
            startTime.getTime() + examData.duration * 60000
        ); 
        const currentTime = new Date();

        if(currentTime < startTime || currentTime > endTime + 60000){
            return res.status(401).json({ message: "Exam is either ended or not started yet"});
        }


        // Find the exam in the student's data
        let examIndex = student.givenExams.findIndex(e => String(e.exam) === String(examData._id));
        let exam = examIndex >= 0 ? student.givenExams[examIndex] : null;

        // If the exam doesn't exist, add a new entry
        if (!exam) {
            exam = {
                exam: examData._id,
                questions: [],
                obtained_score: 0,
            };
            student.givenExams.push(exam);
            examIndex = student.givenExams.length - 1; // Update the index
        }

        if(exam.submitted){
            return res.status(401).json({ message: "Exam was already submitted"});
        }

        const questionIndex = exam.questions.findIndex(q => String(q.question) === String(question._id));
        const questionEntry = questionIndex >= 0 ? exam.questions[questionIndex] : null;

        // Handle the case where the answer is null
        if (answer === null) {
            if (questionEntry) {
                // Remove the question entry and adjust the obtained score
                exam.questions.splice(questionIndex, 1);

                if (questionEntry.answer === question.answer) {
                    exam.obtained_score -= question.points;
                }
            }
        } else {
            if (!questionEntry) {
                // Add a new question and update the score
                exam.questions.push({
                    question: question._id,
                    answer,
                });

                if (question.answer === answer) {
                    exam.obtained_score += question.points;
                }
            } else {
                // Update the existing answer and adjust the score
                if (questionEntry.answer === question.answer) {
                    exam.obtained_score -= question.points;
                }

                exam.questions[questionIndex].answer = answer;

                if (answer === question.answer) {
                    exam.obtained_score += question.points;
                }
            }
        }

        // Explicitly assign the updated exam back to the student's data
        student.givenExams[examIndex] = exam;

        // Save the updated student data
        await student.save();

        res.json({ message: "Answer updated successfully", updatedExam: exam });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



export const all_students = async (req, res) => {
    try{
        const students = await User.find({role: "Student"}).select("-password");

        return res.status(200).json({ students: students, message: "Students fetched successfully"});
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const delete_student = async (req, res) => {
    try {
        const { username } = req.params; 

        if(!username){
            return res.status(404).json({message: "Username not found"});
        }

        await Student.deleteOne({ username: username });

        await User.deleteOne({ username: username });

        return res.status(200).json({ message: "Student and associated User deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const get_student = async (req, res) => {
    try{
        const { username } = req.params;

        if((req.user.role !== "Admin" && username !== req.user.username) || req.user.role === "Examiner"){
            return res.status(400).json({ message: 'Unathorized Access' });
        }

        const user = await User.findOne({ username }).select("-password");
        const student = await Student.findOne({ username }).select("-username -givenExams");

        if(!user || !student){
            return res.status(404).json({message: "Student not found"});
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
            const day = String(date.getDate()).padStart(2, '0');        // Add leading zero
          
            return `${year}-${month}-${day}`;
        };

        const response = {
            "firstname": user.firstname,
            "lastname": user.lastname,
            "middlename": user.middlename,
            "email": user.email,
            "mobileno": user.mobileno,
            "dob": formatDate(user.dob),
            "gender": user.gender,
            "batch": student.batch,
            "branch": student.branch,
            "graduation": student.graduation,
        };

        // console.log(response);
        

        return res.status(200).json({user: response, message: "Profile Feched Successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const update_student = async (req, res) => {
    try {
        const { username } = req.params;
        const { firstname, lastname, middlename, dob, mobileno, email, gender, batch, branch, graduation } = req.body;
        

        if(!username || !firstname || !lastname || !dob || !mobileno || !email || !gender || !batch || !branch || !graduation){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        if(req.user.role !== "Admin" && username !== req.user.username){
            return res.status(400).json({ message: 'Unathorized Access' });
        }

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check mobile number length (assuming mobile number should be exactly 10 digits)
        const mobilenoRegex = /^\d{10}$/;
        if (!mobilenoRegex.test(mobileno)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        // DOB validation (expecting format 'YYYY-MM-DD')
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dob)) {
            return res.status(400).json({ message: 'Invalid date of birth format. Use YYYY-MM-DD.' });
        }

        const [year, month, day] = dob.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

        // Check for valid day, month, and year in dob
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return res.status(400).json({ message: 'Invalid date of birth values.' });
        }

        const user = await User.findOneAndUpdate({username}, {
            firstname,
            lastname,
            middlename,
            dob:date,
            mobileno,
            email,
            gender
        }, { new: true });

        const student = await Student.findOneAndUpdate({username}, {
            batch: batch,
            branch: branch,
            graduation: graduation,
        });

        await student.save();

        return res.status(200).json({ message: "Student updated successfully", user: user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


export const submit_exam_student = async (req, res) => {
    try {

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const student = await Student.findOne({ username });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { examId } = req.body;

        // Find the exam by ID without fetching questions
        const examData = await Exam.findOne({ examId });

        if (!examData) {
            return res.status(404).json({ message: "Exam not found." });
        }

        const startTime = new Date(examData.startTime);
        const endTime = new Date(
            startTime.getTime() + examData.duration * 60000
        ); 
        const currentTime = new Date();

        if(currentTime < startTime || currentTime > endTime + 60000){
            return res.status(401).json({ message: "Exam is either ended or not started yet"});
        }

        // Find the exam in the student's data
        let examIndex = student.givenExams.findIndex(e => String(e.exam) === String(examData._id));
        let exam = examIndex >= 0 ? student.givenExams[examIndex] : null;

        if (!exam) {
            exam = {
                exam: examData._id,
                questions: [],
                obtained_score: 0,
            };
            student.givenExams.push(exam);
            examIndex = student.givenExams.length - 1; // Update the index
        }

        if(exam.submitted){
            return res.status(401).json({ message: "Exam was already submitted"});
        }

        exam.submitted = true;

        student.givenExams[examIndex] = exam;

        await student.save();

        return res.status(200).json({ 
            message: "Exam submitted Successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to submit exam" });
    }
}