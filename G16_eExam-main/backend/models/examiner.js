import mongoose from "mongoose";

const examinerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    prepared_exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Exam'
    }],

    prepared_questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Question'
    }],
});

const Examiner = mongoose.model('Examiner', examinerSchema);

export default Examiner;