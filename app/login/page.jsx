"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("identifier");
  const [mode, setMode] = useState("account");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [providers, setProviders] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * IMPORTANT:
   * useSearchParams() intentionally use nahi kiya gaya.
   * Isse /login production prerender ke waqt Suspense issue nahi aayega.
   */
  useEffect(() => {
    let mounted = true;

    async function loadProviders() {
      try {
        const response = await fetch("/api/auth/providers", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (mounted) {
          setProviders(data || {});
        }
      } catch (err) {
        console.error("Unable to load auth providers:", err);
      }
    }

    loadProviders();

    // Browser par hi query string read hogi.
    try {
      const params = new URLSearchParams(window.location.search);

      if (params.get("error")) {
        setError(
          "Is account se login allow nahi hai. Registered employee email use karein."
        );
      }
    } catch (err) {
      console.error("Unable to read login query:", err);
    }

    return () => {
      mounted = false;
    };
  }, []);

  async function finishRoleLogin() {
    const res = await fetch("/api/auth/persist-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.role) {
      throw new Error("Session save nahi ho paya");
    }

    if (data.role === "hr") {
      router.push("/hr/dashboard");
    } else {
      router.push("/employee/dashboard");
    }

    router.refresh();
  }

  async function loginPassword(e) {
    e.preventDefault();
    setError("");

    if (step === "identifier") {
      const cleanIdentifier = identifier.trim();

      if (!cleanIdentifier) {
        setError("Email ya username enter karein.");
        return;
      }

      setIdentifier(cleanIdentifier);
      setStep("password");
      return;
    }

    if (!password) {
      setError("Password enter karein.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Email/username ya password galat hai.");
        return;
      }

      await finishRoleLogin();
    } catch (err) {
      console.error("Password login error:", err);
      setError(err?.message || "Login nahi ho paya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setError("");

    const clean = phone.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);

    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError("Valid 10-digit Indian mobile number enter karein.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/mobile/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: clean,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "OTP send nahi ho paya");
        return;
      }

      setOtpSent(true);
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("OTP send nahi ho paya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  }

  async function loginOtp(e) {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
    const cleanOtp = otp.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Valid registered mobile number enter karein.");
      return;
    }

    if (!cleanOtp) {
      setError("OTP enter karein.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("mobile-otp", {
        phone: cleanPhone,
        code: cleanOtp,
        redirect: false,
      });

      if (!res || res.error) {
        setError(
          "OTP invalid/expired hai ya mobile registered nahi hai."
        );
        return;
      }

      await finishRoleLogin();
    } catch (err) {
      console.error("Mobile login error:", err);
      setError(err?.message || "Mobile login nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  function social(id, label, icon) {
    return (
      <button
        type="button"
        onClick={() => {
          setError("");

          if (providers[id]) {
            signIn(id, {
              callbackUrl: "/auth/complete",
            });
          } else {
            setError(`${label} login server par configure nahi hai.`);
          }
        }}
        className="w-full h-[52px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-[15px] text-slate-700 flex items-center justify-center gap-3 transition"
      >
        <span className="text-xl font-semibold">{icon}</span>
        {label}
      </button>
    );
  }

  return (
    <main className="min-h-screen lg:h-screen grid lg:grid-cols-[minmax(0,1fr)_540px] bg-white overflow-auto lg:overflow-hidden">

      {/* LEFT INDUSTRIAL IMAGE */}
      <section
        className="hidden lg:block relative bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-landscape.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-sky-900/5" />
      </section>

      {/* LOGIN SECTION */}
      <section className="min-h-screen lg:min-h-0 flex items-center justify-center px-6 sm:px-12 py-10 bg-white">
        <div className="w-full max-w-[390px]">

          {/* MOBILE BRAND */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#6546c7] text-white flex items-center justify-center font-black text-xl">
              A
            </div>

            <div>
              <div className="font-semibold text-slate-900">
                A-One Automation
              </div>

              <div className="text-xs text-slate-500">
                Employee Workspace
              </div>
            </div>
          </div>

          <h1 className="text-[22px] font-medium text-slate-950 mb-6">
            Login to A-One Automation
          </h1>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* EMAIL / USERNAME LOGIN */}
          {mode === "account" ? (
            <form onSubmit={loginPassword} className="space-y-3">

              <input
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={step === "password"}
                autoComplete="username"
                className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7] focus:ring-1 focus:ring-[#6546c7] disabled:bg-slate-50"
                placeholder="Email or Username"
              />

              {step === "password" && (
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7] focus:ring-1 focus:ring-[#6546c7]"
                  placeholder="Password"
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] rounded bg-[#5b46b9] hover:bg-[#513cac] text-white font-medium disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : step === "identifier"
                  ? "Continue"
                  : "Login"}
              </button>

              {step === "password" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setPassword("");
                    setError("");
                  }}
                  className="w-full text-sm text-[#5b46b9] py-1"
                >
                  Use another account
                </button>
              )}
            </form>
          ) : (

            /* MOBILE OTP LOGIN */
            <form onSubmit={loginOtp} className="space-y-3">

              <div className="flex h-[58px] border border-slate-300 rounded focus-within:border-[#6546c7]">
                <span className="px-3 flex items-center border-r border-slate-200 text-slate-500">
                  +91
                </span>

                <input
                  value={phone}
                  disabled={otpSent}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  className="min-w-0 flex-1 px-3 outline-none disabled:bg-slate-50"
                  placeholder="Mobile Number"
                />
              </div>

              {otpSent && (
                <input
                  autoFocus
                  value={otp}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="one-time-code"
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  className="w-full h-[58px] border border-slate-300 rounded px-4 outline-none focus:border-[#6546c7]"
                  placeholder="Enter OTP"
                />
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full h-[54px] rounded bg-[#5b46b9] text-white font-medium disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !otp}
                  className="w-full h-[54px] rounded bg-[#5b46b9] text-white font-medium disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode("account");
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-[#5b46b9] py-1"
              >
                Back to Email / Username
              </button>
            </form>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-8 text-sm text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>Or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* LOGIN OPTIONS */}
          <div className="space-y-3">

            <button
              type="button"
              onClick={() => {
                setMode("mobile");
                setStep("identifier");
                setError("");
              }}
              className="w-full h-[52px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-[15px] text-slate-700 flex items-center justify-center gap-3"
            >
              <span className="text-xl">▯</span>
              Continue with Mobile
            </button>

            {social(
              "azure-ad",
              "Continue with Microsoft",
              "⊞"
            )}

            {social(
              "google",
              "Continue with Google",
              "G"
            )}

            <button
              type="button"
              onClick={() => {
                setMode("account");
                setStep("identifier");
                setError("");
              }}
              className="w-full h-[52px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-[15px] text-slate-700 flex items-center justify-center gap-3"
            >
              <span className="text-xl font-bold text-[#6546c7]">
                A
              </span>

              Continue with Username
            </button>
          </div>

          {/* FOOTER */}
          <div className="mt-10 flex items-center justify-center gap-3 text-xs text-slate-500">
            <div className="text-3xl font-black tracking-tight text-[#6546c7]">
              A1
            </div>

            <span>
              Secure login for registered employees only
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}