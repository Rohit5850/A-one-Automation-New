import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import { normalizeIndianPhone, toE164Indian } from "@/app/lib/identityValidation";

export async function POST(req) {
  try {
    const { phone: rawPhone } = await req.json();
    const phone = normalizeIndianPhone(rawPhone);
    const e164 = toE164Indian(phone);
    if (!e164) return NextResponse.json({ error: "Valid 10-digit Indian mobile number enter karein" }, { status: 400 });
    await dbConnect();
    const user = await User.findOne({ phone, isActive: true }).select("_id isLocked");
    if (!user) return NextResponse.json({ error: "Ye mobile number kisi active account me registered nahi hai" }, { status: 404 });
    if (user.isLocked) return NextResponse.json({ error: "ID locked hai. HR se unlock karwayein." }, { status: 423 });
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const service = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!sid || !token || !service) return NextResponse.json({ error: "Mobile OTP service abhi configure nahi hai" }, { status: 503 });
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({ To: e164, Channel: "sms" });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${service}/Verifications`, {
      method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body,
    });
    if (!response.ok) return NextResponse.json({ error: "OTP send nahi ho paya. Thodi der baad try karein." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send mobile OTP error", err);
    return NextResponse.json({ error: "OTP send nahi ho paya" }, { status: 500 });
  }
}
