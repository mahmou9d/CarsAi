"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Sign in user with email & password
 */
export async function signInAction({ email, password }) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Ensure user exists in our Prisma DB
    const authUser = data.user;
    if (authUser) {
      let dbUser = await db.user.findFirst({
        where: {
          OR: [
            { supabaseUserId: authUser.id },
            { email: authUser.email },
          ],
        },
      });

      if (!dbUser) {
        const name =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User";

        dbUser = await db.user.create({
          data: {
            supabaseUserId: authUser.id,
            email: authUser.email,
            name,
          },
        });
      } else if (!dbUser.supabaseUserId) {
        dbUser = await db.user.update({
          where: { id: dbUser.id },
          data: { supabaseUserId: authUser.id },
        });
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("signInAction error:", err);
    return { success: false, error: err.message || "Sign in failed" };
  }
}

/**
 * Register a new user with full name, email and password
 */
export async function signUpAction({ name, email, password }) {
  try {
    if (!email || !password || !name) {
      return { success: false, error: "Name, email and password are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already registered in Prisma
    const existingPrismaUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    // Create user in Supabase with pre-confirmed email so they can log in instantly
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
        },
      });

    if (createError) {
      // If user already exists in Supabase Auth, attempt sign-in instead or return friendly error
      if (createError.message.toLowerCase().includes("already registered")) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in.",
        };
      }
      return { success: false, error: createError.message };
    }

    const authUser = createData.user;

    // Create or link in Prisma database
    if (existingPrismaUser) {
      await db.user.update({
        where: { id: existingPrismaUser.id },
        data: {
          supabaseUserId: authUser.id,
          name: cleanName || existingPrismaUser.name,
        },
      });
    } else {
      await db.user.create({
        data: {
          supabaseUserId: authUser.id,
          email: cleanEmail,
          name: cleanName,
          role: "USER",
        },
      });
    }

    // Sign the user in by establishing session cookie
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInError) {
      return {
        success: true,
        message: "Account created successfully. Please sign in.",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("signUpAction error:", err);
    return { success: false, error: err.message || "Registration failed" };
  }
}

/**
 * Sign out user and clear session cookies
 */
export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("signOutAction error:", err);
    return { success: false, error: err.message };
  }
}
