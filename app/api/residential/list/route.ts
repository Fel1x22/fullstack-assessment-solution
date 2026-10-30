import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";

const PROXY_HOST = "residential.byteful.com";
const PROXY_PORT = 8000;

const DEFAULT_COUNT = 100;
const MIN_COUNT = 1;
const MAX_COUNT = 1000;

const FORMATS = [
  "http",
  "https",
  "socks5",
  "socks5h",
] as const;
const SESSION_TYPES = ["sticky", "rotating"] as const;

const SESSION_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SESSION_ID_LENGTH = 16;

type ListFormat = (typeof FORMATS)[number];
type SessionType = (typeof SESSION_TYPES)[number];

type ErrorCode =
  | "invalid_json"
  | "invalid_body"
  | "missing_parameter"
  | "invalid_parameter"
  | "method_not_allowed";

interface ListParams {
  userId: string;
  password: string;
  count: number;
  format: ListFormat;
  sessionType: SessionType;
  countryId?: string;
  cityAlias?: string;
  asnId?: number;
}

class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

function errorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
) {
  return NextResponse.json(
    { error: code, message },
    { status },
  );
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireString(
  body: Record<string, unknown>,
  name: string,
): string {
  const value = body[name];
  if (value === undefined) {
    throw new ApiError(
      "missing_parameter",
      `${name} is required`,
    );
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(
      "invalid_parameter",
      `${name} must be a non-empty string`,
    );
  }
  return value;
}

function optionalString(
  body: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = body[name];

  if (value === undefined || value === null)
    return undefined;

  if (typeof value !== "string") {
    throw new ApiError(
      "invalid_parameter",
      `${name} must be a string`,
    );
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function optionalEnum<T extends string>(
  body: Record<string, unknown>,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = body[name];
  if (value === undefined) return fallback;
  if (
    typeof value !== "string" ||
    !allowed.includes(value as T)
  ) {
    throw new ApiError(
      "invalid_parameter",
      `${name} must be one of: ${allowed.join(", ")}`,
    );
  }
  return value as T;
}

function optionalPositiveInt(
  body: Record<string, unknown>,
  name: string,
): number | undefined {
  const value = body[name];

  if (value === undefined || value === null)
    return undefined;

  let num: number;
  if (typeof value === "number") {
    num = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    if (!/^\d+$/.test(trimmed)) {
      throw new ApiError(
        "invalid_parameter",
        `${name} must be a positive integer`,
      );
    }
    num = Number(trimmed);
  } else {
    throw new ApiError(
      "invalid_parameter",
      `${name} must be a positive integer`,
    );
  }

  if (!Number.isSafeInteger(num) || num < 1) {
    throw new ApiError(
      "invalid_parameter",
      `${name} must be a positive integer`,
    );
  }
  return num;
}

function parseParams(body: unknown): ListParams {
  if (!isPlainObject(body)) {
    throw new ApiError(
      "invalid_body",
      "Request body must be a JSON object",
    );
  }

  const userId = requireString(body, "proxy_user_id");
  const password = requireString(
    body,
    "proxy_user_password",
  );

  let count = DEFAULT_COUNT;
  if (body.list_count !== undefined) {
    const value = body.list_count;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < MIN_COUNT ||
      value > MAX_COUNT
    ) {
      throw new ApiError(
        "invalid_parameter",
        `list_count must be from ${MIN_COUNT} to ${MAX_COUNT}`,
      );
    }
    count = value;
  }

  const format = optionalEnum(
    body,
    "list_format",
    FORMATS,
    "http",
  );
  const sessionType = optionalEnum(
    body,
    "list_session_type",
    SESSION_TYPES,
    "sticky",
  );

  const countryId = optionalString(body, "country_id");
  if (
    countryId !== undefined &&
    !/^[a-z]{2}$/.test(countryId)
  ) {
    throw new ApiError(
      "invalid_parameter",
      "country_id must be a lowercase ISO 3166-1 alpha-2 code, for example us",
    );
  }

  const cityAlias = optionalString(body, "city_alias");
  if (cityAlias !== undefined && countryId === undefined) {
    throw new ApiError(
      "invalid_parameter",
      "city_alias requires country_id",
    );
  }

  const asnId = optionalPositiveInt(body, "asn_id");

  return {
    userId,
    password,
    count,
    format,
    sessionType,
    countryId,
    cityAlias,
    asnId,
  };
}

function randomSessionId(): string {
  let id = "";
  for (let i = 0; i < SESSION_ID_LENGTH; i++) {
    id +=
      SESSION_ALPHABET[randomInt(SESSION_ALPHABET.length)];
  }
  return id;
}

/**
 * Username layout: <user>[_c_<country>][_city_<alias>][_asn_<id>][_s_<session>]
 * e.g. alice_c_gb_city_norwich_s_DDINPY7TQ0781XEO
 */
function buildUsername(
  p: ListParams,
  sessionId?: string,
): string {
  const parts = [p.userId];
  if (p.countryId) parts.push("c", p.countryId);
  if (p.cityAlias) parts.push("city", p.cityAlias);
  if (p.asnId !== undefined)
    parts.push("asn", String(p.asnId));
  if (sessionId) parts.push("s", sessionId);
  return parts.join("_");
}

function buildProxy(
  p: ListParams,
  sessionId?: string,
): string {
  const user = encodeURIComponent(
    buildUsername(p, sessionId),
  );
  const pass = encodeURIComponent(p.password);
  return `${p.format}://${user}:${pass}@${PROXY_HOST}:${PROXY_PORT}`;
}

function generateList(p: ListParams): string[] {
  if (p.sessionType === "rotating") {
    const proxy = buildProxy(p);
    return Array.from({ length: p.count }, () => proxy);
  }

  const sessions = new Set<string>();
  while (sessions.size < p.count) {
    sessions.add(randomSessionId());
  }
  return Array.from(sessions, (sid) => buildProxy(p, sid));
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(
        "invalid_json",
        "Request body must be valid JSON",
      );
    }

    const params = parseParams(body);

    return NextResponse.json(
      {
        data: generateList(params),
        message: "Residential list successfully generated.",
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return errorResponse(
        err.code,
        err.message,
        err.status,
      );
    }
    console.error(
      "Unexpected error in /api/residential/list",
      err,
    );
    return errorResponse(
      "invalid_body",
      "Unable to process request",
      400,
    );
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    {
      error: "method_not_allowed",
      message: "Use POST for this endpoint",
    },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
