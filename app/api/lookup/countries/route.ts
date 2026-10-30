import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.byteful.com/1.0/public/user/country/search", {
    headers: { "X-API-Private-Key": `${process.env.PRIVATE_KEY}`,
    "X-API-PUBLIC-KEY": `${process.env.PUBLIC_KEY}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream_error", message: "Could not load countries" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ data });
}