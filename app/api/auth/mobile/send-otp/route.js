import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import { normalizeIndianPhone } from "@/app/lib/identityValidation";

// Pre-flight check before the browser asks MSG91 to send an OTP. This prevents
// OTP spend for unknown, inactive, or HR-locked accounts. MSG91 itself sends
// the OTP through its Web SDK after this endpoint returns ok.
export async function POST(req) {
  try {
    const { phone: rawPhone } = await req.json();
    const phone = normalizeIndianPhone(rawPhone);
    if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "Valid 10-digit Indian mobile number enter karein" }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ phone, isActive: true }).select("_id isLocked");
    if (!user) return NextResponse.json({ error: "Ye mobile number kisi active account me registered nahi hai" }, { status: 404 });
    if (user.isLocked) return NextResponse.json({ error: "ID locked hai. HR se unlock karwayein." }, { status: 423 });

    return NextResponse.json({ ok: true, identifier: `91${phone}` });
  } catch (err) {
    console.error("mobile OTP preflight error", err);
    return NextResponse.json({ error: "Mobile verification start nahi ho paya" }, { status: 500 });
  }
}
