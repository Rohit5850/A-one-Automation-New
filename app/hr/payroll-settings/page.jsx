"use client";
import { useEffect, useState } from "react";
const numberFields = [
    ["pfEmployeePercent", "Employee PF %"],
    ["pfEmployerPercent", "Employer PF %"],
    ["pfWageCeiling", "PF Wage Ceiling ₹"],
    ["esicEmployeePercent", "Employee ESIC %"],
    ["esicEmployerPercent", "Employer ESIC %"],
    ["esicWageCeiling", "ESIC Wage Ceiling ₹"],
];
export default function PayrollSettingsPage() {
    const [form, setForm] = useState(null);
    const [message, setMessage] = useState("");
    useEffect(() => {
        fetch("/api/payroll-settings")
            .then((response) => response.json())
            .then((data) => setForm(data.settings));
    }, []);
    if (!form) {
        return <div className="p-6">Loading...</div>;
    }
    async function save(event) {
        event.preventDefault();
        setMessage("");
        const response = await fetch("/api/payroll-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await response.json();
        setMessage(response.ok
            ? "Settings saved. Payroll/Salary Slip ab in HR-defined rates ko use karega."
            : data.error || "Save failed");
    }
    return (<div className="p-4 sm:p-8">
      <form onSubmit={save} className="max-w-2xl mx-auto bg-white rounded-2xl border p-6 space-y-5">
        <h1 className="text-xl font-semibold">PF / ESIC Settings</h1>
        <p className="text-sm text-slate-500">
          Rates HR decide karega. System koi statutory percentage hard-code nahi
          karta.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex gap-2">
            <input type="checkbox" checked={!!form.pfEnabled} onChange={(event) => setForm({ ...form, pfEnabled: event.target.checked })}/>
            PF Enabled
          </label>

          <label className="flex gap-2">
            <input type="checkbox" checked={!!form.esicEnabled} onChange={(event) => setForm({ ...form, esicEnabled: event.target.checked })}/>
            ESIC Enabled
          </label>

          <label className="text-sm">
            PF Wage Base
            <select value={form.pfWageBase || "basic"} onChange={(event) => setForm({ ...form, pfWageBase: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
              <option value="basic">Basic Earned</option>
              <option value="gross">Gross Earnings</option>
            </select>
          </label>

          <label className="text-sm">
            ESIC Wage Base
            <select value={form.esicWageBase || "gross"} onChange={(event) => setForm({ ...form, esicWageBase: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
              <option value="basic">Basic Earned</option>
              <option value="gross">Gross Earnings</option>
            </select>
          </label>

          <label className="text-sm">
            PF Ceiling Rule
            <select value={form.pfCeilingMode || "cap"} onChange={(event) => setForm({ ...form, pfCeilingMode: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
              <option value="cap">Cap wage at ceiling</option>
              <option value="eligibility">Apply only when wage ≤ ceiling</option>
            </select>
          </label>

          <label className="text-sm">
            ESIC Ceiling Rule
            <select value={form.esicCeilingMode || "eligibility"} onChange={(event) => setForm({ ...form, esicCeilingMode: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
              <option value="eligibility">Apply only when wage ≤ ceiling</option>
              <option value="cap">Cap wage at ceiling</option>
            </select>
          </label>

          {numberFields.map(([key, label]) => (<label key={key} className="text-sm">
              {label}
              <input type="number" min="0" step="0.01" value={form[key] ?? 0} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2"/>
            </label>))}
        </div>

        {message && <p className="text-sm">{message}</p>}

        <button className="rounded-xl bg-slate-900 text-white px-5 py-2.5">
          Save Settings
        </button>
      </form>
    </div>);
}
