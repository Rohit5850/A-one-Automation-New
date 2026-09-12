// Reverse geocoding helper for attendance GPS coordinates.
// Default provider: OpenStreetMap Nominatim (switchable with GEOCODING_BASE_URL).
// Attendance must never fail only because the place-name service is unavailable.

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

const globalState = globalThis.__attendanceGeocoder || {
  cache: new Map(),
  queue: Promise.resolve(),
  lastRequestAt: 0,
};
globalThis.__attendanceGeocoder = globalState;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Public Nominatim asks applications to stay at or below 1 request/second.
// Queueing here keeps normal single-server deployments inside that limit.
async function pacedFetch(url, options) {
  const task = globalState.queue.then(async () => {
    const waitMs = Math.max(0, 1100 - (Date.now() - globalState.lastRequestAt));
    if (waitMs) await sleep(waitMs);
    globalState.lastRequestAt = Date.now();
    return fetch(url, options);
  });

  // Keep the queue alive even if one request fails.
  globalState.queue = task.catch(() => null);
  return task;
}

export async function reverseGeocodeLocation(location) {
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return null;
  }

  const base = {
    lat: location.lat,
    lng: location.lng,
    accuracy: typeof location.accuracy === "number" ? Math.round(location.accuracy) : undefined,
  };

  // ~1 metre coordinate cache. Check-in and check-out at the same spot won't repeatedly geocode.
  const cacheKey = `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;
  const cached = globalState.cache.get(cacheKey);
  if (cached) return { ...base, ...cached };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const baseUrl = process.env.GEOCODING_BASE_URL || "https://nominatim.openstreetmap.org/reverse";
    const url = new URL(baseUrl);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(location.lat));
    url.searchParams.set("lon", String(location.lng));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("accept-language", "en");

    const res = await pacedFetch(url, {
      headers: {
        "User-Agent": process.env.GEOCODING_USER_AGENT || "A-One-Automation-Attendance/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res?.ok) return base;

    const data = await res.json();
    const a = data.address || {};

    const landmark = firstNonEmpty(
      data.name,
      a.amenity,
      a.office,
      a.shop,
      a.building,
      a.tourism,
      a.leisure,
      a.industrial,
      a.man_made
    );

    const road = firstNonEmpty(a.road, a.pedestrian, a.residential, a.footway);
    const placeName = [a.house_number, road].filter(Boolean).join(" ") || firstNonEmpty(
      a.neighbourhood,
      a.suburb,
      a.quarter,
      a.city_district,
      a.village,
      a.town,
      a.city
    );

    const details = {
      displayName: data.display_name || "",
      landmark,
      placeName,
      area: firstNonEmpty(a.neighbourhood, a.suburb, a.quarter, a.city_district),
      city: firstNonEmpty(a.city, a.town, a.village, a.municipality),
      district: firstNonEmpty(a.state_district, a.county, a.district),
      state: firstNonEmpty(a.state, a.region),
      postcode: a.postcode || "",
      country: a.country || "",
    };

    // Keep only a bounded in-memory cache.
    if (globalState.cache.size > 1000) {
      const oldestKey = globalState.cache.keys().next().value;
      globalState.cache.delete(oldestKey);
    }
    globalState.cache.set(cacheKey, details);

    return { ...base, ...details };
  } catch (err) {
    console.error("Reverse geocoding failed:", err?.message || err);
    return base;
  } finally {
    clearTimeout(timeout);
  }
}
