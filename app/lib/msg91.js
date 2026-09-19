import { normalizeIndianPhone } from "./identityValidation";

export const MSG91_VERIFY_ACCESS_TOKEN_URL = "https://control.msg91.com/api/v5/widget/verifyAccessToken";

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

export function verifiedPhoneFromMsg91(payload) {
  const candidates = collectStrings(payload);
  for (const value of candidates) {
    const digits = String(value).replace(/\D/g, "");
    if (/^91[6-9]\d{9}$/.test(digits)) return digits.slice(2);
    if (/^[6-9]\d{9}$/.test(digits)) return digits;
  }
  return "";
}

export async function verifyMsg91AccessToken(accessToken) {
  const authkey = process.env.MSG91_AUTH_KEY?.trim();
  const token = String(accessToken || "").trim();

  if (!authkey) {
    throw new Error("MSG91 server Auth Key is not configured");
  }

  if (!token) {
    throw new Error("MSG91 access token is required");
  }

  const response = await fetch(MSG91_VERIFY_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authkey: authkey,
      "access-token": token,
    }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  console.log("MSG91 VERIFY STATUS:", response.status);
  console.log("MSG91 VERIFY RESULT:", result);

  if (!response.ok) {
    throw new Error("MSG91 access token verification failed");
  }

  const text = JSON.stringify(result).toLowerCase();

  const explicitlyFailed =
    result?.type === "error" ||
    result?.success === false ||
    result?.hasError === true ||
    result?.status === "fail" ||
    /invalid|failed|failure|expired/.test(text);

  if (explicitlyFailed) {
    throw new Error(
      result?.message || "MSG91 access token is invalid or expired"
    );
  }

  return result;
}

export function assertMsg91PhoneMatches(payload, requestedPhone) {
  const expected = normalizeIndianPhone(requestedPhone);
  const verified = verifiedPhoneFromMsg91(payload);
  if (!expected || !verified || verified !== expected) {
    throw new Error("MSG91 verified mobile does not match login mobile");
  }
  return verified;
}
