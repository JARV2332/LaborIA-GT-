/**
 * Rate limit por IP en memoria (por instancia serverless).
 * Suficiente para freemium básico; se resetea en cold starts.
 */

const buckets = new Map();

function pruneExpired(now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

/**
 * @param {string} key - p.ej. "chat:1.2.3.4"
 * @param {number} limit - máx. requests en la ventana
 * @param {number} windowMs - duración de la ventana
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, limit: number }}
 */
export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();

  if (buckets.size > 5000) pruneExpired(now);

  let entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit,
    };
  }

  entry.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
    limit,
  };
}

/** Extrae IP del request (Vercel / proxies). */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export function formatResetHint(resetAt) {
  const ms = Math.max(0, resetAt - Date.now());
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `en unos ${mins} min`;
  const hours = Math.ceil(mins / 60);
  if (hours < 48) return `en unas ${hours} h`;
  return "mañana";
}

export function buildLimitExceededPayload({ featureLabel, limit, resetAt }) {
  const email = process.env.UPGRADE_CONTACT_EMAIL || "soporte@laboria.gt";
  const cuando = formatResetHint(resetAt);

  return {
    error: `Ya usaste tus ${limit} ${featureLabel} gratis. Se renuevan ${cuando}. Si necesitás más acceso (plan ampliado), escribinos a ${email} y te lo habilitamos.`,
    code: "RATE_LIMIT",
    upgradeEmail: email,
    resetAt,
    limit,
  };
}
