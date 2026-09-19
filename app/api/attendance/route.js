import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Employee from "@/app/models/Employee";
import { reverseGeocodeLocation } from "@/app/lib/reverseGeocode";
import { todayDateKey } from "@/app/lib/payrollRules";
import { automaticWorkStatus, sessionMetrics } from "@/app/lib/attendanceMetrics";

function todayStr() {
  return todayDateKey();
}

function hideLocation(record) {
  const obj = record?.toObject ? record.toObject() : { ...record };
  delete obj.checkInLocation;
  delete obj.checkOutLocation;
  if (Array.isArray(obj.sessions)) {
    obj.sessions = obj.sessions.map(({ checkInLocation, checkOutLocation, ...session }) => session);
  }
  return obj;
}


function withSessionMetrics(record) {
  const obj = record?.toObject ? record.toObject() : { ...record };
  return { ...obj, ...sessionMetrics(obj) };
}
function rawLocationFrom(body) {
  return body.location && typeof body.location.lat === "number" && typeof body.location.lng === "number"
    ? {
        lat: body.location.lat,
        lng: body.location.lng,
        accuracy: typeof body.location.accuracy === "number" ? body.location.accuracy : undefined,
      }
    : undefined;
}

// Old records had only checkIn/checkOut. Convert them in-memory the first time
// they are punched again so old data remains usable without a migration script.
function ensureLegacySession(record) {
  if (!record) return;
  if ((!record.sessions || record.sessions.length === 0) && record.checkIn) {
    record.sessions = [
      {
        checkIn: record.checkIn,
        checkOut: record.checkOut || null,
        checkInLocation: record.checkInLocation,
        checkOutLocation: record.checkOutLocation,
      },
    ];
  }
}

async function employeeLocationRule(targetEmployeeId) {
  const employee = await Employee.findById(targetEmployeeId).select(
    "fieldWorker webAttendanceEnabled showLocationToEmployee status"
  );
  if (!employee || employee.status !== "active") {
    return { error: "Employee account is inactive" };
  }

  // GPS is required for Field/Site Workers. If HR enables Employee Location View,
  // GPS is also required from that point onward so there is an actual location
  // to show in the employee attendance history.
  return {
    employee,
    webAttendanceEnabled: employee.webAttendanceEnabled !== false,
    locationRequired: !!employee.fieldWorker || !!employee.showLocationToEmployee,
    canSeeLocation: !!employee.showLocationToEmployee,
  };
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { searchParams } = new URL(req.url);

    const filter = {};
    if (session.user.role === "employee") {
      filter.employee = session.user.employeeId;
    } else if (session.user.role === "hr") {
      const queryEmployeeId = searchParams.get("employeeId");
      if (queryEmployeeId) filter.employee = queryEmployeeId;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const year = searchParams.get("year");
    if (year && /^\d{4}$/.test(year)) {
      filter.date = { $gte: `${year}-01-01`, $lte: `${year}-12-31` };
    }

    // The employee attendance screen uses this as the authoritative punch state.
    // This fixes refresh / logout-login cases where the monthly calendar can be stale
    // while the database already has an active Check-In.
    if (searchParams.get("today") === "1") {
      filter.date = todayStr();
      const record = await Attendance.findOne(filter);

      if (session.user.role === "employee") {
        const rule = await employeeLocationRule(session.user.employeeId);
        if (rule.error) return NextResponse.json({ error: rule.error }, { status: 403 });

        const enriched = record ? withSessionMetrics(record) : null;
        return NextResponse.json({
          record: enriched && !rule.canSeeLocation ? hideLocation(enriched) : enriched,
          showLocationToEmployee: rule.canSeeLocation,
          locationRequired: rule.locationRequired,
        });
      }

      return NextResponse.json({ record: record ? withSessionMetrics(record) : null });
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).limit(year ? 366 : 1830);
    const enrichedRecords = records.map(withSessionMetrics);

    if (session.user.role === "employee") {
      const rule = await employeeLocationRule(session.user.employeeId);
      if (rule.error) return NextResponse.json({ error: rule.error }, { status: 403 });
      if (!rule.canSeeLocation) {
        return NextResponse.json({
          records: enrichedRecords.map(hideLocation),
          showLocationToEmployee: false,
          locationRequired: rule.locationRequired,
        });
      }
      return NextResponse.json({
        records: enrichedRecords,
        showLocationToEmployee: true,
        locationRequired: rule.locationRequired,
      });
    }

    return NextResponse.json({ records: enrichedRecords });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Check in. If a previous session was already checked out today, a NEW session
// is appended. If a session is still active, a second check-in is rejected.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    let targetEmployeeId;
    if (session.user.role === "employee") {
      targetEmployeeId = session.user.employeeId;
    } else if (session.user.role === "hr") {
      if (!body.employeeId) {
        return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
      }
      targetEmployeeId = body.employeeId;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const rawLocation = rawLocationFrom(body);
    let visibility = true;

    if (session.user.role === "employee") {
      const rule = await employeeLocationRule(targetEmployeeId);
      if (rule.error) return NextResponse.json({ error: rule.error }, { status: 403 });
      visibility = rule.canSeeLocation;
      if (!rule.webAttendanceEnabled) return NextResponse.json({ error: "Web Check In/Out HR ne disable kiya hai" }, { status: 403 });
      if (rule.locationRequired && !rawLocation) {
        return NextResponse.json(
          { error: "Please select Allow for location. Only then Check-In or Check-Out is allowed." },
          { status: 400 }
        );
      }
    }

    const location = rawLocation ? await reverseGeocodeLocation(rawLocation) : undefined;
    const date = todayStr();
    const now = new Date();
    let record = await Attendance.findOne({ employee: targetEmployeeId, date });

    if (record) {
      ensureLegacySession(record);
      const activeSession = record.sessions?.find((s) => s.checkIn && !s.checkOut);
      if (activeSession) {
        return NextResponse.json(
          { error: "Already checked in. Please Check-Out before checking in again." },
          { status: 400 }
        );
      }

      record.sessions.push({ checkIn: now, checkInLocation: location });
      if (!record.checkIn) record.checkIn = now;
      if (!record.checkInLocation && location) record.checkInLocation = location;
      record.checkOut = null; // day currently has an active session
      if (record.statusSource !== "manual") {
        record.status = "pending";
        record.statusSource = "auto";
        record.reason = "";
        record.leaveType = null;
      }
      await record.save();
    } else {
      record = await Attendance.create({
        employee: targetEmployeeId,
        date,
        checkIn: now,
        checkOut: null,
        status: "pending",
        statusSource: "auto",
        checkInLocation: location,
        sessions: [{ checkIn: now, checkInLocation: location }],
      });
    }

    return NextResponse.json(
      { record: session.user.role === "employee" && !visibility ? hideLocation(record) : record },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ error: "Could not mark attendance" }, { status: 500 });
  }
}

// Check out the currently open session. After this, the employee may check in
// again the same day; the gap becomes break time.
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    let targetEmployeeId;
    if (session.user.role === "employee") {
      targetEmployeeId = session.user.employeeId;
    } else if (session.user.role === "hr") {
      if (!body.employeeId) {
        return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
      }
      targetEmployeeId = body.employeeId;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const rawLocation = rawLocationFrom(body);
    let visibility = true;

    if (session.user.role === "employee") {
      const rule = await employeeLocationRule(targetEmployeeId);
      if (rule.error) return NextResponse.json({ error: rule.error }, { status: 403 });
      visibility = rule.canSeeLocation;
      if (!rule.webAttendanceEnabled) return NextResponse.json({ error: "Web Check In/Out HR ne disable kiya hai" }, { status: 403 });
      if (rule.locationRequired && !rawLocation) {
        return NextResponse.json(
          { error: "Please select Allow for location. Only then Check-In or Check-Out is allowed." },
          { status: 400 }
        );
      }
    }

    const record = await Attendance.findOne({ employee: targetEmployeeId, date: todayStr() });
    if (!record) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }

    ensureLegacySession(record);
    const activeSession = [...(record.sessions || [])].reverse().find((s) => s.checkIn && !s.checkOut);
    if (!activeSession) {
      return NextResponse.json(
        { error: "No active Check-In found. Please Check-In first." },
        { status: 400 }
      );
    }

    const location = rawLocation ? await reverseGeocodeLocation(rawLocation) : undefined;
    const now = new Date();
    activeSession.checkOut = now;
    if (location) activeSession.checkOutLocation = location;
    record.checkOut = now;
    if (location) record.checkOutLocation = location;
    if (record.statusSource !== "manual") {
      const metrics = sessionMetrics(record.toObject());
      record.status = automaticWorkStatus(metrics.workedMs, false);
      record.statusSource = "auto";
      record.leaveType = null;
      record.reason = "";
    }
    await record.save();

    return NextResponse.json({
      record: session.user.role === "employee" && !visibility ? hideLocation(record) : record,
    });
  } catch (err) {
    console.error("PATCH /api/attendance error:", err);
    return NextResponse.json({ error: "Could not mark check-out" }, { status: 500 });
  }
}
