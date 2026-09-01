"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FIELDS = [
  ["fullName", "Full Name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["designation", "Designation", "text"],
  ["department", "Department", "text"],
  ["bloodGroup", "Blood Group", "text"],
  ["emergencyContact", "Emergency Contact", "text"],
];

export default function EditEmployeePage({ params }) {
  const { id } = use(params); // Next.js 15+/16: page params are async
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLoadError(data.error || `Load failed (${res.status})`);
          return;
        }
        if (!data.employee) {
          setLoadError("Employee data nahi mila.");
          return;
        }
        setForm(data.employee);
      })
      .catch((err) => {
        console.error("Failed to load employee:", err);
        setLoadError("Network/server error - employee load nahi ho paya.");
      });
  }, [id]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Update nahi ho paya");
      return;
    }

    router.push("/hr/dashboard");
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 max-w-lg">
          {loadError}
        </p>
        <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800 mt-3 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!form) {
    return <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-8 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Edit Employee</h1>
          <Link href="/hr/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-500">Employee ID (fixed)</label>
          <input
            disabled
            value={form.employeeId}
            className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        {FIELDS.map(([name, label, type]) => (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
              type={type}
              value={form[name] || ""}
              onChange={(e) => update(name, e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Address</label>
          <textarea
            value={form.address || ""}
            onChange={(e) => update("address", e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
