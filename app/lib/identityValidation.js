import dns from "node:dns/promises";

export function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

export function isEmailSyntaxValid(value = "") {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function hasMailDomain(value = "") {
  const email = normalizeEmail(value);
  if (!isEmailSyntaxValid(email)) return false;
  const domain = email.split("@")[1];
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch (err) {
    // A definite DNS "no such domain / no mail records" is invalid. If the
    // hosting environment temporarily blocks DNS, do not lock HR out of employee creation.
    if (["ENOTFOUND", "ENODATA", "ESERVFAIL", "ENOTIMP"].includes(err?.code)) return false;
    return true;
  }
}

export function normalizeIndianPhone(value = "") {
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isValidIndianMobile(value = "") {
  return /^[6-9]\d{9}$/.test(normalizeIndianPhone(value));
}

export function toE164Indian(value = "") {
  const phone = normalizeIndianPhone(value);
  return isValidIndianMobile(phone) ? `+91${phone}` : null;
}

export function normalizeUsername(value = "") {
  return String(value).trim().toLowerCase();
}

export function isValidUsername(value = "") {
  return /^[a-z0-9][a-z0-9._-]{3,29}$/.test(normalizeUsername(value));
}
