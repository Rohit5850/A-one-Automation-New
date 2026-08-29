export default function EmployeeCard({ employee }) {
  if (!employee) return null;

  const initials = employee.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-md">
      <div className="bg-slate-900 px-5 py-4 flex items-center gap-3">
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt={employee.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        )}
        <div>
          <p className="text-white font-semibold leading-tight">{employee.fullName}</p>
          <p className="text-slate-300 text-xs">{employee.employeeId}</p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Field label="Designation" value={employee.designation} />
        <Field label="Department" value={employee.department} />
        <Field label="Email" value={employee.email} />
        <Field label="Phone" value={employee.phone} />
        <Field
          label="Date of Joining"
          value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "-"}
        />
        <Field label="Status" value={employee.status} />
        <Field label="Blood Group" value={employee.bloodGroup} />
        <Field label="Emergency Contact" value={employee.emergencyContact} />
        {employee.address && <Field label="Address" value={employee.address} full />}
      </div>
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-slate-800">{value || "-"}</p>
    </div>
  );
}
