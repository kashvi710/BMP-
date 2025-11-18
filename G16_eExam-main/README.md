# eExam: Online Examination System

---
## Overview
eExam is a comprehensive platform designed to streamline online examinations. It provides core functionalities for admins, examiners, and students, along with advanced features and result generation capabilities.


---

## Group Members
- Mahaliya Meet Prakashbhai (202201204)
- Vaghani Devang Sanjaybhai (202201208)
- Prajapati Mihir Dineshkumar (202201210)
- Dharmik Harshali Binalkumar (202201214)
- Saroliya Gunjan Pankajbhai (202201225)
- Nishank Kansara (202201227)
- Chaudhari Yashbhai (202201229)
- Ramani Divyesh Prakashbhai (202201241)
- Davda Dev Bhupendrakumar (202201242)
- Vagh Mehul Mansurbhai (202201251)

---

## Features

### Admin Core Features
- Login
- Create Student/Examiner Accounts
- Manage Student/Examiner Accounts
- Reset Password
- View Exams

### Examiner Core Features
- Login
- Create Exams
- Add New Questions to the Question Bank
- Reset Password

### Student Core Features
- Login
- View Upcoming Exams
- Attempt an Exam
- View Exam Results
- Reset Password

### Advanced Features
- Examiner: Schedule/Manage Exams
- Student: Practice Questions from the Question Bank
- Student: Bookmark Questions

### Result Generation
- Examiner: View Exam Performance Reports
- Student: View Exam Performance Results

---

## Tech Stack
- **Frontend**:
  - React.js
  - HTML/CSS
  - JavaScript

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB for database

- **Authentication**:
  - JWT (JSON Web Tokens)

- **Deployment**:
  - Deployed on *Heroku/AWS* (add your deployment details)

---

## Demo
- **YouTube Demo**: [eExam_Demo](https://youtu.be/1LJDCQ3Ihsc)
- **Live Website**: [eExam_web](https://eexam-five.vercel.app/)

---

## Prerequisites
- Node.js
- React.js
- MongoDB (local or cloud database)

---

## Testing

### Unit Testing
- **Tools Used**: Mocha, Sinon, Chai, Supertest  
  Unit tests cover individual functions and components to ensure they behave as expected in isolation.  

### Mutation Testing
- **Tools Used**: Stryker  
  Mutation testing validates the robustness of your test suite by introducing mutations and checking if tests detect them.

### Load Testing
- **Tools Used**: Apache JMeter  
  Simulates a high number of concurrent users to assess the system's performance and scalability under stress.

### Black Box Testing
- Focuses on testing system functionality without internal knowledge of code implementation. Ensures that inputs produce expected outputs.

### GUI Testing
- **Tools Used**: Selenium or Cypress  
  Automates interactions with the graphical user interface to ensure all UI components function correctly and provide a good user experience.
