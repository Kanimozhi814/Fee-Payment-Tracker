import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function App() {
const [search, setSearch] = useState("");
const [students, setStudents] = useState([]);
const [selectedStudent, setSelectedStudent] = useState(null);
const [feeDetails, setFeeDetails] = useState(null);

const [amount, setAmount] = useState("");
const [paymentDate, setPaymentDate] = useState("");
const [note, setNote] = useState("");

const [loadingStudents, setLoadingStudents] = useState(false);
const [loadingFee, setLoadingFee] = useState(false);
const [savingPayment, setSavingPayment] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

useEffect(() => {
const today = new Date().toISOString().split("T")[0];
setPaymentDate(today);
}, []);

const searchStudents = async () => {
try {
setError("");
setSuccess("");
setLoadingStudents(true);

  const response = await fetch(
    `${API_URL}/api/students?search=${encodeURIComponent(search)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to search students");
  }

  setStudents(data);
} catch (err) {
  setError(err.message);
  setStudents([]);
} finally {
  setLoadingStudents(false);
}

};

useEffect(() => {
searchStudents();
}, []);

const selectStudent = async (student) => {
try {
setError("");
setSuccess("");
setLoadingFee(true);

  setSelectedStudent(student);

  const response = await fetch(
    `${API_URL}/api/students/${student.id}/fees`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load fee details");
  }

  setFeeDetails(data);
  setAmount("");
  setNote("");
} catch (err) {
  setError(err.message);
  setFeeDetails(null);
} finally {
  setLoadingFee(false);
}

};

const recordPayment = async (e) => {
e.preventDefault();

setError("");
setSuccess("");

if (!selectedStudent) {
  setError("Please select a student first.");
  return;
}

const paymentAmount = Number(amount);

if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
  setError("Payment amount must be greater than zero.");
  return;
}

if (paymentAmount > Number(feeDetails.pendingAmount)) {
  setError(
    `Payment cannot be greater than pending amount of ₹${Number(
      feeDetails.pendingAmount
    ).toFixed(2)}`
  );
  return;
}

try {
  setSavingPayment(true);

  const response = await fetch(
    `${API_URL}/api/students/${selectedStudent.id}/payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: paymentAmount,
        paymentDate,
        note,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to record payment");
  }

  setSuccess("Payment recorded successfully!");
  setAmount("");
  setNote("");

  const feeResponse = await fetch(
    `${API_URL}/api/students/${selectedStudent.id}/fees`
  );

  const latestFeeDetails = await feeResponse.json();

  if (feeResponse.ok) {
    setFeeDetails(latestFeeDetails);
  }
} catch (err) {
  setError(err.message);
} finally {
  setSavingPayment(false);
}

};

return (
<div className="min-h-screen bg-slate-100 px-4 py-8">
<div className="mx-auto max-w-6xl">

    <div className="mb-8">
      <h1 className="text-4xl font-bold text-slate-800">
        Fee Payment Tracker
      </h1>

      <p className="mt-2 text-slate-600">
        Search students, view fee balance and record payments.
      </p>
    </div>

    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-slate-800">
        Search Student
      </h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchStudents();
            }
          }}
          placeholder="Search by name, email or phone"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          onClick={searchStudents}
          disabled={loadingStudents}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loadingStudents ? "Searching..." : "Search"}
        </button>
      </div>

      {students.length > 0 && (
        <div className="mt-5 space-y-3">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => selectStudent(student)}
              className="block w-full rounded-lg border border-slate-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50"
            >
              <p className="font-semibold text-slate-800">
                {student.name}
              </p>

              <p className="text-sm text-slate-500">
                {student.email} • {student.phone}
              </p>
            </button>
          ))}
        </div>
      )}

      {!loadingStudents && students.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No students found.
        </p>
      )}
    </div>

    {error && (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        ❌ {error}
      </div>
    )}

    {success && (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
        ✅ {success}
      </div>
    )}

    {selectedStudent && feeDetails && (
      <>
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-800">
            {feeDetails.student.name}
          </h2>

          <p className="mt-1 text-slate-500">
            {feeDetails.student.email} • {feeDetails.student.phone}
          </p>
          <button
  onClick={() => {
    setSelectedStudent(null);
    setFeeDetails(null);
    setAmount("");
    setNote("");
    setSuccess("");
    setError("");
  }}
  className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
>
  Clear Student
</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-slate-500">
              Total Fee
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
              ₹{Number(feeDetails.totalFee).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-slate-500">
              Paid Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ₹{Number(feeDetails.paidAmount).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-slate-500">
              Pending Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              ₹{Number(feeDetails.pendingAmount).toLocaleString("en-IN")}
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-800">
            Record Payment
          </h2>

          <form
            onSubmit={recordPayment}
            className="mt-5 grid gap-5 md:grid-cols-3"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Date
              </label>

              <input
                type="date"
                value={paymentDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note (Optional)
              </label>

              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Example: Third payment"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={savingPayment}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPayment
                  ? "Recording Payment..."
                  : "Record Payment"}
              </button>
            </div>

          </form>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-800">
            Payment History
          </h2>

          {feeDetails.paymentHistory.length === 0 ? (
            <p className="mt-4 text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>

                <tbody>
                  {feeDetails.paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(
                          payment.payment_date
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {payment.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}
        </div>
      </>
    )}

    {loadingFee && (
      <div className="mt-6 rounded-lg bg-white p-6 text-center shadow">
        Loading fee details...
      </div>
    )}

  </div>
</div>

);
}

export default App;