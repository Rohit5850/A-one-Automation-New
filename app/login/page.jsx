"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
const MSG91_WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "";
const MSG91_WIDGET_TOKEN = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN || "";
function getAccessToken(data) {
    if (!data)
        return "";
    if (typeof data === "string")
        return data;
    return data.accessToken || data["access-token"] || data.token || data.data?.accessToken || data.data?.["access-token"] || data.data?.token || (data.type === "success" ? data.message : "") || "";
}
function msg91Error(error, fallback) {
    if (typeof error === "string" && error.trim())
        return error;
    return error?.message || error?.error || fallback;
}
export default function LoginPage() {
    const router = useRouter();
    const sdkReady = useRef(false);
    const sdkLoading = useRef(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState("identifier");
    const [mode, setMode] = useState("account");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendBusy, setResendBusy] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("reset") === "success")
            setError("");
        if (params.get("error"))
            setError("Is account se login allow nahi hai. Registered employee email use karein.");
    }, []);
    const initMsg91 = useCallback(() => {
        if (sdkReady.current || sdkLoading.current || mode !== "mobile")
            return;
        if (typeof window === "undefined" || typeof window.initSendOTP !== "function")
            return;
        if (!MSG91_WIDGET_ID || !MSG91_WIDGET_TOKEN)
            return;
        sdkLoading.current = true;
        try {
            // Keep this configuration aligned with MSG91's official Web SDK
            // Custom UI example. The SDK requires success/failure callbacks during
            // initialization even when verifyOtp has its own callbacks.
            const configuration = {
                widgetId: MSG91_WIDGET_ID,
                tokenAuth: MSG91_WIDGET_TOKEN,
                identifier: "",
                exposeMethods: true,
                captchaRenderId: "",
                success: (data) => {
                    console.log("MSG91 success response", data);
                },
                failure: (err) => {
                    console.error("MSG91 failure reason", err);
                },
            };
            window.initSendOTP(configuration);
            sdkReady.current = true;
        }
        catch (err) {
            sdkReady.current = false;
            console.error("MSG91 init error", err);
            setError("MSG91 OTP service initialize nahi ho payi. Page refresh karke try karein.");
        }
        finally {
            sdkLoading.current = false;
        }
    }, [mode]);
    useEffect(() => {
        if (mode !== "mobile" || !sdkLoaded)
            return;
        const frame = window.requestAnimationFrame(initMsg91);
        return () => window.cancelAnimationFrame(frame);
    }, [mode, sdkLoaded, initMsg91]);
    async function finishRoleLogin() {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        const sessionData = await sessionRes.json().catch(() => ({}));
        if (sessionData?.user?.mustChangePassword) {
            router.push("/auth/change-password");
            router.refresh();
            return;
        }
        const res = await fetch("/api/auth/persist-role", { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.role)
            throw new Error("Session save nahi ho paya");
        router.push(data.role === "hr" ? "/hr/dashboard" : "/employee/dashboard");
        router.refresh();
    }
    async function loginPassword(e) {
        e.preventDefault();
        setError("");
        if (step === "identifier") {
            if (!identifier.trim())
                return setError("Email enter karein.");
            setStep("password");
            return;
        }
        setLoading(true);
        const res = await signIn("credentials", { email: identifier, password, redirect: false });
        if (res?.error) {
            setLoading(false);
            setError("Login failed. Employee: 3 wrong attempts par HR unlock required. HR: 3 wrong attempts par 15-minute temporary lock; Forgot Password se turant recover kar sakte hain.");
            return;
        }
        try {
            await finishRoleLogin();
        }
        catch (e) {
            setError(e.message);
            setLoading(false);
        }
    }
    async function sendOtp() {
        setError("");
        const clean = phone.replace(/\D/g, "").slice(0, 10);
        setPhone(clean);
        if (!/^[6-9]\d{9}$/.test(clean))
            return setError("Valid 10-digit Indian mobile number enter karein.");
        if (!MSG91_WIDGET_ID || !MSG91_WIDGET_TOKEN)
            return setError("MSG91 OTP configuration missing hai.");
        initMsg91();
        if (!sdkReady.current || typeof window.sendOtp !== "function")
            return setError("OTP service load ho raha hai. 2-3 second baad dobara try karein.");
        setLoading(true);
        try {
            const preflight = await fetch("/api/auth/mobile/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: clean }) });
            const preflightData = await preflight.json().catch(() => ({}));
            if (!preflight.ok)
                throw new Error(preflightData.error || "Mobile verify nahi ho paya");
            await new Promise((resolve, reject) => window.sendOtp(preflightData.identifier || `91${clean}`, resolve, reject));
            setOtp("");
            setOtpSent(true);
        }
        catch (err) {
            setError(msg91Error(err, "OTP send nahi ho paya. Thodi der baad try karein."));
        }
        finally {
            setLoading(false);
        }
    }
    async function resendOtp() {
        setError("");
        setResendBusy(true);
        try {
            if (typeof window.retryOtp !== "function")
                throw new Error("OTP service ready nahi hai");
            await new Promise((resolve, reject) => window.retryOtp("11", resolve, reject));
        }
        catch (err) {
            setError(msg91Error(err, "OTP resend nahi ho paya."));
        }
        finally {
            setResendBusy(false);
        }
    }
    async function loginOtp(e) {
        e.preventDefault();
        setError("");
        if (!/^\d{4,9}$/.test(otp))
            return setError("Valid OTP enter karein.");
        if (typeof window.verifyOtp !== "function")
            return setError("OTP service ready nahi hai. Page refresh karke try karein.");
        setLoading(true);
        try {
            const verified = await new Promise((resolve, reject) => window.verifyOtp(otp, resolve, reject));
            const accessToken = getAccessToken(verified);
            if (!accessToken)
                throw new Error("MSG91 verification token nahi mila");
            const res = await signIn("mobile-otp", { phone, accessToken, redirect: false });
            if (res?.error)
                throw new Error("OTP verification fail hui ya mobile registered/active nahi hai.");
            await finishRoleLogin();
        }
        catch (err) {
            setError(msg91Error(err, "OTP invalid/expired hai ya mobile registered nahi hai."));
            setLoading(false);
        }
    }
    return (<>
      <Script id="msg91-otp-sdk" src="https://verify.msg91.com/otp-provider.js" strategy="afterInteractive" onLoad={() => setSdkLoaded(true)} onReady={() => setSdkLoaded(true)} onError={() => setError("MSG91 OTP service load nahi ho payi.")}/>
      <main className="min-h-screen lg:h-screen grid lg:grid-cols-[minmax(0,1fr)_540px] bg-white overflow-auto lg:overflow-hidden">
        <section className="hidden lg:block relative bg-cover bg-center" style={{ backgroundImage: "url('/login-landscape.png')" }}><div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-sky-900/5"/></section>
        <section className="min-h-screen lg:min-h-0 flex items-center justify-center px-6 sm:px-12 py-10 bg-white">
          <div className="w-full max-w-[390px]">
            <div className="lg:hidden mb-10 flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-[#6546c7] text-white flex items-center justify-center font-black text-xl">A</div><div><div className="font-semibold text-slate-900">A-One Automation</div><div className="text-xs text-slate-500">Employee Workspace</div></div></div>
            <h1 className="text-[22px] font-medium text-slate-950 mb-6">Login to A-One Automation</h1>
            {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

            {mode === "account" ? (<form onSubmit={loginPassword} className="space-y-3">
                <input autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={step === "password"} className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7] focus:ring-1 focus:ring-[#6546c7] disabled:bg-slate-50" type="email" placeholder="Email"/>
                {step === "password" && <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7] focus:ring-1 focus:ring-[#6546c7]" placeholder="Password"/>}
                <button disabled={loading} className="w-full h-[54px] rounded bg-[#5b46b9] hover:bg-[#513cac] text-white font-medium disabled:opacity-60">{loading ? "Please wait..." : step === "identifier" ? "Continue" : "Login"}</button>
                {step === "password" && <><button type="button" onClick={() => { setStep("identifier"); setPassword(""); setError(""); }} className="w-full text-sm text-[#5b46b9] py-1">Use another account</button><a href="/auth/forgot-password" className="block text-center text-sm text-[#5b46b9] py-1">Forgot Password?</a></>}
              </form>) : (<form onSubmit={loginOtp} className="space-y-3">
                <div className="flex h-[58px] border border-slate-300 rounded focus-within:border-[#6546c7]"><span className="px-3 flex items-center border-r border-slate-200 text-slate-500">+91</span><input value={phone} disabled={otpSent} inputMode="numeric" maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="min-w-0 flex-1 px-3 outline-none disabled:bg-slate-50" placeholder="Mobile Number"/></div>
                {otpSent && <input autoFocus value={otp} inputMode="numeric" maxLength={9} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7]" placeholder="Enter OTP"/>}
                {!otpSent ? <button type="button" onClick={sendOtp} disabled={loading} className="w-full h-[54px] rounded bg-[#5b46b9] text-white font-medium disabled:opacity-60">{loading ? "Sending..." : "Send OTP"}</button> : <><button disabled={loading || !otp} className="w-full h-[54px] rounded bg-[#5b46b9] text-white font-medium disabled:opacity-60">{loading ? "Verifying..." : "Verify & Login"}</button><div className="flex justify-between text-sm"><button type="button" disabled={resendBusy} onClick={resendOtp} className="text-[#5b46b9] disabled:opacity-50">{resendBusy ? "Resending..." : "Resend OTP"}</button><button type="button" onClick={() => { setOtpSent(false); setOtp(""); setError(""); }} className="text-slate-500">Change number</button></div></>}
                <button type="button" onClick={() => { setMode("account"); setOtpSent(false); setOtp(""); setError(""); }} className="w-full text-sm text-[#5b46b9] py-1">Back to Email</button>
              </form>)}

            <div className="flex items-center gap-4 my-8 text-sm text-slate-500"><div className="h-px flex-1 bg-slate-200"/><span>Or</span><div className="h-px flex-1 bg-slate-200"/></div>
            <div className="space-y-3"><button type="button" onClick={() => { setMode("mobile"); setStep("identifier"); setError(""); }} className="w-full h-[52px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-[15px] text-slate-700 flex items-center justify-center gap-3"><span className="text-xl">▯</span>Continue with Mobile</button><button type="button" onClick={() => { setMode("account"); setStep("identifier"); setError(""); }} className="w-full h-[52px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-[15px] text-slate-700 flex items-center justify-center gap-3"><span className="text-xl font-bold text-[#6546c7]">@</span>Continue with Email</button></div>
            <div className="mt-10 flex items-center justify-center gap-3 text-xs text-slate-500"><div className="text-3xl font-black tracking-tight text-[#6546c7]">A1</div><span>Secure login for registered employees only</span></div>
          </div>
        </section>
      </main>
    </>);
}
