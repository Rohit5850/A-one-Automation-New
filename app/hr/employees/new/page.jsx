"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initial = {
  employeeId: "",
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  department: "",
  dateOfJoining: "",
  address: "",
  bloodGroup: "",
  emergencyContact: "",
  password: "",
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Kuch galat ho gaya");
      return;
    }

    router.push("/hr/dashboard");
  }

  const fields = [
    ["employeeId", "Employee ID", "text"],
    ["fullName", "Full Name", "text"],
    ["email", "Email (login ke liye)", "email"],
    ["password", "Initial Password", "text"],
    ["phone", "Phone", "text"],
    ["designation", "Designation", "text"],
    ["department", "Department", "text"],
    ["dateOfJoining", "Date of Joining", "date"],
    ["bloodGroup", "Blood Group", "text"],
    ["emergencyContact", "Emergency Contact", "text"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-8 space-y-4"
      >
        <h1 className="text-lg font-semibold text-slate-900">Add New Employee</h1>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {fields.map(([name, label, type]) => (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
              type={type}
              required={["employeeId", "fullName", "email", "password"].includes(name)}
              value={form[name]}
              onChange={(e) => update(name, e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
}
