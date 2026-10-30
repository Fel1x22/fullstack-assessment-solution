import { useEffect, useState } from "react";
import { fetchLookup } from "@/lib/api";
import type { Country } from "@/types/lookup";

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchLookup<Country>(
      "/api/lookup/countries",
      (c) => ({
        id: String(c.country_id),
        name: c.country_name,
      }),
      controller.signal,
    )
      .then(setCountries)
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { countries, loading };
}
