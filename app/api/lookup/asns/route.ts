import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country_id"); // optional
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (country && !/^[a-zA-Z]{2}$/.test(country)) {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid country code" },
      { status: 400 }
    );
  }

  // Without a country the list is huge, so require a search term
  if (!country && q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const url = new URL("https://api.byteful.com/1.0/public/user/asn/search");
  if (country) url.searchParams.set("country_id", `${country.toLowerCase()}`);
  if (q) url.searchParams.set("like_asn_name", `%${q}%`);

  console.log(url.toString());

  const res = await fetch(url, {
    headers: {
      "X-API-Private-Key": `${process.env.PRIVATE_KEY}`,
      "X-API-PUBLIC-KEY": `${process.env.PUBLIC_KEY}`,
    },
  });

  if (!res.ok) {
    console.error("Byteful asn error", res.status, await res.text(), url.toString());
    return NextResponse.json(
      { error: "upstream_error", message: "Could not load ASNs" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ data });
}