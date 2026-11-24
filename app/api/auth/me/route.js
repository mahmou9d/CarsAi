import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        supabaseUserId: user.supabaseUserId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("API /api/auth/me error:", error);
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
