import { formatDateDMY } from "@/app/lib/displayFormat";
export default function EmployeeCard({ employee }) {
  if (!employee) return null;

  const initials = employee.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-3xl shadow-[0_22px_60px_-32px_rgba(15,23,42,0.4)] shadow-sm overflow-hidden max-w-md">
      <div className="bg-slate-900 px-5 py-4 flex items-center gap-3">
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt={employee.fullName}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        )}
        <div>
          <p className="text-white font-semibold leading-tight">{employee.title ? `${employee.title === "mr" ? "Mr." : employee.title === "mrs" ? "Mrs." : "Miss"} ` : ""}{employee.fullName}</p>
          <p className="text-slate-300 text-xs">{employee.employeeId}</p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <Field label="Designation" value={employee.designation} />
        <Field label="Department" value={employee.department} />
        <Field label="Email" value={employee.email} />
        <Field label="Phone" value={employee.phone} />
        <Field
          label="Date of Joining"
          value={employee.dateOfJoining ? formatDateDMY(employee.dateOfJoining) : "-"}
        />
        <div><p className="text-slate-400 text-xs uppercase tracking-wide">Status</p><p className={`mt-1 font-semibold ${employee.status === "inactive" ? "text-red-600" : "text-emerald-600"}`}>{employee.status === "inactive" ? "INACTIVE" : "ACTIVE"}</p></div>
        <Field label="Blood Group" value={employee.bloodGroup} />
        <Field label="Emergency Contact" value={employee.emergencyContact} />
        {employee.address && <Field label="Address" value={employee.address} full />}
      </div>
    </div>
  );
}

function Field({ label, value, full }) {
  const isEmail = label === "Email";
  return (
    <div className={`${full ? "sm:col-span-2" : ""} min-w-0`}>
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p
        className={`text-slate-800 mt-1 leading-5 ${isEmail ? "break-all sm:break-words" : "break-words"}`}
        title={value || "-"}
      >
        {value || "-"}
      </p>
    </div>
  );
}
