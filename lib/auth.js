import { createClient } from "./supabase/server";
import { db } from "./prisma";

/**
 * Gets the currently authenticated user from Supabase session
 * and syncs with the Prisma database.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    // 1. Check if user already exists by supabaseUserId
    let dbUser = await db.user.findFirst({
      where: {
        OR: [
          { supabaseUserId: authUser.id },
          { email: authUser.email },
        ],
      },
    });

    if (dbUser) {
      // If found by email but supabaseUserId is not set, link it
      if (!dbUser.supabaseUserId) {
        dbUser = await db.user.update({
          where: { id: dbUser.id },
          data: { supabaseUserId: authUser.id },
        });
      }
      return dbUser;
    }

    // 2. Create new user in database
    const name =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "User";

    const imageUrl =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      null;

    const newUser = await db.user.create({
      data: {
        supabaseUserId: authUser.id,
        email: authUser.email,
        name,
        imageUrl,
      },
    });

    return newUser;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

/**
 * Replacement for Clerk's auth() in Server Actions.
 * Returns { userId, user } where userId is the Supabase Auth ID.
 */
export async function getAuth() {
  const dbUser = await getCurrentUser();
  return {
    userId: dbUser?.supabaseUserId || null,
    dbUserId: dbUser?.id || null,
    user: dbUser,
  };
}
