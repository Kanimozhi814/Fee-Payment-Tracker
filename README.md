**# Fee Payment Tracker**

A full-stack fee payment tracking module built using React, Tailwind CSS, Node.js, Express.js, and PostgreSQL.

**## Project Overview**

Fee Payment Tracker allows an administrator to:

\- Search for students

\- Select a student

\- View total fee, paid amount, and pending amount

\- Record a payment

\- View payment history

\- Prevent zero, negative, and overpayments

\- Keep payment history available after page refresh

The backend is the source of truth for fee calculations.

**## Technologies Used**

**### Frontend**

\- React

\- Vite

\- Tailwind CSS

**### Backend**

\- Node.js

\- Express.js

**### Database**

\- PostgreSQL

**## Project Structure**

\`\`\`text

Fee-Payment-Tracker/

│

├── backend/

│   ├── .env

│   ├── .gitignore

│   ├── db.js

│   ├── package.json

│   ├── package-lock.json

│   └── server.js

│

├── frontend/

│   ├── src/

│   ├── package.json

│   └── ...

│

└── README.md

Features

Student Search

Students can be searched using name, email, or phone number.

Fee Summary

The application displays:

Total Fee

Paid Amount

Pending Amount

Paid and pending amounts are calculated by the backend.

Record Payment

The administrator can enter:

Payment amount

Payment date

Optional note

Payment Validation

The application prevents:

Zero payment

Negative payment

Payment greater than the pending amount

Payment History

Every payment is stored separately and displayed in latest-payment-first order.

Database

The application uses PostgreSQL with the following tables:

students

student_fees

fee_payments

Each payment is stored separately to preserve payment history.

Environment Variables

Create a .env file inside the backend folder.

Example:

PORT=5000

DATABASE_URL=your_postgresql_connection_string

Do not commit the .env file to Git.

Backend Setup

Open a terminal and navigate to the backend folder:

cd backend

Install dependencies:

npm install

Start the backend:

node server.js

Backend runs at:

[http://localhost:5000](http://localhost:5000)

Frontend Setup

Open another terminal and navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Start the frontend:

npm run dev

Frontend runs at:

[http://localhost:5173](http://localhost:5173)

API Endpoints

Get Students

GET /api/students

Search example:

GET /api/students?search=Kanimozhi

Get Student Fee Details

GET /api/students/\:id/fees

Example:

GET /api/students/1/fees

Record Payment

POST /api/students/\:id/payments

Example request body:

{

  "amount": 5000,

  "paymentDate": "2026-10-05",

  "note": "Fourth payment"

}

Validation Examples

Zero Payment

Payment amount 0 is rejected.

Negative Payment

Negative payment values are rejected.

Overpayment

A payment greater than the current pending amount is rejected.

Testing Completed

The following scenarios were tested:

Student search

Student selection

Fee summary

Valid payment recording

Paid amount update

Pending amount update

Payment history

Overpayment prevention

Zero payment validation

Negative payment validation

Payment history persistence after refresh

Project Scope

This project focuses on the core fee tracking workflow.

The following features are intentionally not included:

Authentication

Role management

Notifications

Deployment

Advanced UI libraries..ipo crt ah iruka