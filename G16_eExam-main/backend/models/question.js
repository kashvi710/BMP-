import mongoose from "mongoose";
import Counter from "./counter.js";

const questionSchema = new mongoose.Schema({
    questionId: {
        type : Number,
    },

    desc: {
        type: String,
    },

    options : [{
        type : String,
    }],
    
    points : {
        type : Number,
        required : true
    },

    creator : {
        type : String,
        required : true
    },

    creatorUsername : {
        type : String,
        required : true
    },

    difficulty : {
        type : String,
        enum : ['Easy', 'Medium', 'Hard'],
        required : true
    },


    answer: {
        type: Number,
        required : true
    },

    subject : {
        type : String
    }
},{
    timestamps: true
});

// Pre-save hook to increment and assign the ID
questionSchema.pre('save', async function (next) {
    const question = this;
    
    if (question.isNew) { // Only for new documents
      try {
        // Find the counter and increment it
        const counter = await Counter.findByIdAndUpdate(
          { _id: 'questionId' },     
          { $inc: { seq: 1 } },       
          { new: true, upsert: true }  
        );
        
        question.questionId = counter.seq;   
        next();
      } catch (error) {
        next(error); // Pass any errors to the next middleware
      }
    } else {
      next();
    }
  });

const Question = mongoose.model('Question',questionSchema);

export default Question;