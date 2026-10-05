-- Fee Payment Tracker Database Schema

-- 1. Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL
);

-- 2. Student fees table
CREATE TABLE IF NOT EXISTS student_fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL UNIQUE,
    total_fee NUMERIC(12,2) NOT NULL CHECK (total_fee >= 0),

    CONSTRAINT fk_student_fees_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);

-- 3. Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    note TEXT,

    CONSTRAINT fk_fee_payments_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);

-- Index for faster payment history lookup
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id
ON fee_payments(student_id);

-- Index for latest payment ordering
CREATE INDEX IF NOT EXISTS idx_fee_payments_date
ON fee_payments(payment_date DESC);