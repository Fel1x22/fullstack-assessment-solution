export async function fetchLookup<T>(
  url: string,
  mapper: (raw: any) => T,
  signal?: AbortSignal,
): Promise<T[]> {
  const res = await fetch(url, { signal });
  if (!res.ok)
    throw new Error(`Request failed: ${res.status}`);
  const json = await res.json();
  const list = json.data?.data ?? json.data ?? [];
  return list.map(mapper);
}
