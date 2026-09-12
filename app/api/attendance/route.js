import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import Attendance from "@/app/models/Attendance";
import Employee from "@/app/models/Employee";
import { reverseGeocodeLocation } from "@/app/lib/reverseGeocode";

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// GET /api/attendance
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const { searchParams } = new URL(req.url);

    let filter = {};
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

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(year ? 366 : 1830);

    return NextResponse.json({ records });
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/attendance -> marks today's check-in.
//   - employee role: marks for themselves
//   - hr role: must pass { employeeId } (the employee's Mongo _id) in the body
// This explicitly handles all 3 cases correctly: no record yet, a record that
// already has a check-in, and a record that exists but was reset (checkIn is null).
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

    const date = todayStr();
    await dbConnect();

    let record = await Attendance.findOne({ employee: targetEmployeeId, date });

    if (record && record.checkIn) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
    }

    const rawLocation =
      body.location && typeof body.location.lat === "number" && typeof body.location.lng === "number"
        ? {
            lat: body.location.lat,
            lng: body.location.lng,
            accuracy: typeof body.location.accuracy === "number" ? body.location.accuracy : undefined,
          }
        : undefined;

    // Always read the CURRENT employee setting. If HR turns Field/Site Worker ON later,
    // GPS becomes mandatory from the very next employee check-in/check-out. Turning it OFF
    // restores the old normal flow immediately. HR manual attendance is not affected.
    if (session.user.role === "employee") {
      const employee = await Employee.findById(targetEmployeeId).select("fieldWorker status");
      if (!employee || employee.status !== "active") {
        return NextResponse.json({ error: "Employee account is inactive" }, { status: 403 });
      }
      if (employee.fieldWorker && !rawLocation) {
        return NextResponse.json(
          { error: "Field/Site Worker ke liye GPS location required hai. Location permission allow karke dubara try karein." },
          { status: 400 }
        );
      }
    }

    const location = rawLocation ? await reverseGeocodeLocation(rawLocation) : undefined;

    if (record) {
      // Record exists (e.g. after a reset) but has no check-in yet - set it explicitly.
      record.checkIn = new Date();
      record.status = body.status || record.status || "present";
      if (location) record.checkInLocation = location;
      await record.save();
    } else {
      record = await Attendance.create({
        employee: targetEmployeeId,
        date,
        checkIn: new Date(),
        status: body.status || "present",
        checkInLocation: location,
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    console.error("POST /api/attendance error:", err);
    return NextResponse.json({ error: "Could not mark attendance" }, { status: 500 });
  }
}

// PATCH /api/attendance -> marks today's check-out.
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

    const rawLocation =
      body.location && typeof body.location.lat === "number" && typeof body.location.lng === "number"
        ? {
            lat: body.location.lat,
            lng: body.location.lng,
            accuracy: typeof body.location.accuracy === "number" ? body.location.accuracy : undefined,
          }
        : undefined;

    if (session.user.role === "employee") {
      const employee = await Employee.findById(targetEmployeeId).select("fieldWorker status");
      if (!employee || employee.status !== "active") {
        return NextResponse.json({ error: "Employee account is inactive" }, { status: 403 });
      }
      if (employee.fieldWorker && !rawLocation) {
        return NextResponse.json(
          { error: "Field/Site Worker ke liye GPS location required hai. Location permission allow karke dubara try karein." },
          { status: 400 }
        );
      }
    }

    const location = rawLocation ? await reverseGeocodeLocation(rawLocation) : undefined;

    const update = { checkOut: new Date() };
    if (location) update.checkOutLocation = location;

    // IMPORTANT: always wrap updates in $set. Without it, MongoDB treats the
    // update as a full document REPLACEMENT and silently wipes every other
    // field (employee, date, checkIn, status) - this was the bug causing
    // records to vanish from history.
    const record = await Attendance.findOneAndUpdate(
      { employee: targetEmployeeId, date: todayStr() },
      { $set: update },
      { new: true }
    );

    if (!record) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }
    return NextResponse.json({ record });
  } catch (err) {
    console.error("PATCH /api/attendance error:", err);
    return NextResponse.json({ error: "Could not mark check-out" }, { status: 500 });
  }
}
