const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// ============================================
// 1. TEST API
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Fee Payment Tracker Backend is running!"
  });
});


// ============================================
// 2. SEARCH STUDENTS
// GET /api/students?search=Kanimozhi
// ============================================

app.get("/api/students", async (req, res) => {
  try {
    const search = req.query.search || "";

    const result = await pool.query(
      `
      SELECT id, name, email, phone
      FROM students
      WHERE name ILIKE $1
         OR email ILIKE $1
         OR phone ILIKE $1
      ORDER BY name
      `,
      [`%${search}%`]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
});


// ============================================
// 3. GET FEE SUMMARY + PAYMENT HISTORY
// GET /api/students/:id/fees
// ============================================

app.get("/api/students/:id/fees", async (req, res) => {
  try {
    const studentId = req.params.id;

    // Get student + total fee
    const studentResult = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.email,
        s.phone,
        sf.total_fee
      FROM students s
      JOIN student_fees sf
        ON s.id = sf.student_id
      WHERE s.id = $1
      `,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const student = studentResult.rows[0];

    // Calculate total paid
    const paymentResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS paid_amount
      FROM fee_payments
      WHERE student_id = $1
      `,
      [studentId]
    );

    const paidAmount = Number(paymentResult.rows[0].paid_amount);
    const totalFee = Number(student.total_fee);

    const pendingAmount = totalFee - paidAmount;

    // Get payment history
    const historyResult = await pool.query(
      `
      SELECT
        id,
        amount,
        payment_date,
        note
      FROM fee_payments
      WHERE student_id = $1
      ORDER BY payment_date DESC, id DESC
      `,
      [studentId]
    );

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone
      },
      totalFee: totalFee,
      paidAmount: paidAmount,
      pendingAmount: pendingAmount,
      paymentHistory: historyResult.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch fee details"
    });
  }
});


// ============================================
// 4. RECORD PAYMENT
// POST /api/students/:id/payments
// ============================================

app.post("/api/students/:id/payments", async (req, res) => {
  const client = await pool.connect();

  try {
    const studentId = req.params.id;

    const {
      amount,
      paymentDate,
      note
    } = req.body;

    // Validate amount
    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero"
      });
    }

    // Start transaction
    await client.query("BEGIN");

    // Get total fee
    const feeResult = await client.query(
      `
      SELECT total_fee
      FROM student_fees
      WHERE student_id = $1
      FOR UPDATE
      `,
      [studentId]
    );

    if (feeResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Student fee record not found"
      });
    }

    const totalFee = Number(feeResult.rows[0].total_fee);

    // Get already paid amount
    const paidResult = await client.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS paid_amount
      FROM fee_payments
      WHERE student_id = $1
      `,
      [studentId]
    );

    const paidAmount = Number(paidResult.rows[0].paid_amount);

    const pendingAmount = totalFee - paidAmount;

    // Prevent overpayment
    if (paymentAmount > pendingAmount) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Payment cannot be greater than pending amount of ₹${pendingAmount.toFixed(2)}`
      });
    }

    // Insert payment
    const paymentResult = await client.query(
      `
      INSERT INTO fee_payments
      (student_id, amount, payment_date, note)
      VALUES ($1, $2, $3, $4)
      RETURNING id, student_id, amount, payment_date, note
      `,
      [
        studentId,
        paymentAmount,
        paymentDate,
        note || null
      ]
    );

    // Commit transaction
    await client.query("COMMIT");

    const newPaidAmount = paidAmount + paymentAmount;
    const newPendingAmount = totalFee - newPaidAmount;

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: paymentResult.rows[0],
      totalFee: totalFee,
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to record payment"
    });

  } finally {
    client.release();
  }
});


// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});