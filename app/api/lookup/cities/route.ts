import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("country_id");

  const res = await fetch(`https://api.byteful.com/1.0/public/user/city/search?like_subdivision_id=${countryId}%`, {
    headers: { "X-API-Private-Key": `${process.env.PRIVATE_KEY}`,
    "X-API-PUBLIC-KEY": `${process.env.PUBLIC_KEY}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream_error", message: "Could not load cities" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ data });
}