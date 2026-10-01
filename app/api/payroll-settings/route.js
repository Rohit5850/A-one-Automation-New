import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import dbConnect from "@/app/lib/dbConnect";
import PayrollSettings from "@/app/models/PayrollSettings";
async function requireHrSession() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "hr" ? session : null;
}
const defaultSettings = {
    key: "default",
    pfEnabled: false,
    pfWageBase: "basic",
    pfCeilingMode: "cap",
    pfEmployeePercent: 0,
    pfEmployerPercent: 0,
    pfWageCeiling: 0,
    esicEnabled: false,
    esicWageBase: "gross",
    esicCeilingMode: "eligibility",
    esicEmployeePercent: 0,
    esicEmployerPercent: 0,
    esicWageCeiling: 0,
};
export async function GET() {
    const session = await requireHrSession();
    if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const settings = await PayrollSettings.findOne({ key: "default" }).lean();
    return NextResponse.json({ settings: settings || defaultSettings });
}
export async function PUT(req) {
    const session = await requireHrSession();
    if (!session) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const numberField = (key) => {
        const value = Number(body[key] ?? 0);
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`${key} valid non-negative number hona chahiye`);
        }
        return value;
    };
    try {
        const update = {
            pfEnabled: !!body.pfEnabled,
            pfWageBase: ["basic", "gross"].includes(body.pfWageBase)
                ? body.pfWageBase
                : "basic",
            pfCeilingMode: ["cap", "eligibility"].includes(body.pfCeilingMode)
                ? body.pfCeilingMode
                : "cap",
            pfEmployeePercent: numberField("pfEmployeePercent"),
            pfEmployerPercent: numberField("pfEmployerPercent"),
            pfWageCeiling: numberField("pfWageCeiling"),
            esicEnabled: !!body.esicEnabled,
            esicWageBase: ["basic", "gross"].includes(body.esicWageBase)
                ? body.esicWageBase
                : "gross",
            esicCeilingMode: ["cap", "eligibility"].includes(body.esicCeilingMode)
                ? body.esicCeilingMode
                : "eligibility",
            esicEmployeePercent: numberField("esicEmployeePercent"),
            esicEmployerPercent: numberField("esicEmployerPercent"),
            esicWageCeiling: numberField("esicWageCeiling"),
            updatedBy: session.user.id,
        };
        await dbConnect();
        const settings = await PayrollSettings.findOneAndUpdate({ key: "default" }, {
            $set: update,
            $setOnInsert: { key: "default" },
        }, {
            new: true,
            upsert: true,
            runValidators: true,
        });
        return NextResponse.json({ settings });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
