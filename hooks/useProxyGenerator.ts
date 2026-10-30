import { useState } from "react";
import { FALLBACK, friendlyError } from "@/lib/errors";

export function useProxyGenerator() {
  const [proxies, setProxies] = useState<string[]>([]);
  const [error, setError] = useState("");

  async function generate(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form));
    const payload: Record<string, unknown> = { ...data };

    if (data.asn_id) payload.asn_id = Number(data.asn_id);
    payload.list_count = data.list_count
      ? Number(data.list_count)
      : 100;

    try {
      const res = await fetch("/api/residential/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("API error:", res.status, json);
        throw new Error(
          friendlyError(json?.error, res.status),
        );
      }

      setError("");
      setProxies(json.data ?? []);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Couldn't reach the server. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : FALLBACK,
      );
      setProxies([]);
    }
  }

  return { proxies, error, setError, generate };
}
