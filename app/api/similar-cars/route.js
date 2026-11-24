import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyType = searchParams.get("bodyType") || "";
    const make = searchParams.get("make") || "";
    const excludeId = searchParams.get("excludeId") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "4", 10), 8);

    // Find cars of same bodyType, then same make if not enough
    const cars = await db.car.findMany({
      where: {
        status: "AVAILABLE",
        id: { not: excludeId },
        OR: [
          { bodyType: bodyType },
          { make: make },
        ],
      },
      take: limit,
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        fuelType: true,
        transmission: true,
        bodyType: true,
        color: true,
        images: true,
        status: true,
        wishlisted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cars });
  } catch (error) {
    console.error("Similar cars API error:", error);
    return NextResponse.json({ cars: [] }, { status: 200 });
  }
}

