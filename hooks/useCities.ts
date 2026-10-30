import { useEffect, useState } from "react";
import { fetchLookup } from "@/lib/api";
import type { City } from "@/types/lookup";

export function useCities(countryId: string) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchLookup<City>(
      `/api/lookup/cities?country_id=${encodeURIComponent(countryId)}`,
      (c) => ({ name: c.city_name, alias: c.city_alias }),
      controller.signal,
    )
      .then(setCities)
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [countryId]);

  return { cities, loading };
}
