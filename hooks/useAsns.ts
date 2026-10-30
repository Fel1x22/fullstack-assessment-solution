import { useEffect, useState } from "react";
import { fetchLookup } from "@/lib/api";
import type { Asn } from "@/types/lookup";

export function useAsns(countryId: string, query: string) {
  const [asns, setAsns] = useState<Asn[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryId && query.trim().length < 2) {
      setAsns([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    //TODO: Implement debouncing here intead of using a timeout. This would avoid unecessary API calls when the user is typing quickly, reducing load on the server, whilst maintaining a good user experience.
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (countryId) params.set("country_id", countryId);
      if (query) params.set("q", query);

      fetchLookup<Asn>(
        `/api/lookup/asns?${params}`,
        (a) => ({ id: String(a.asn_id), name: a.asn_name }),
        controller.signal,
      )
        .then(setAsns)
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
            setAsns([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [countryId, query]);

  return { asns, loading };
}
