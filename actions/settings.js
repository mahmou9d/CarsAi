"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// Get dealership info with working hours
export async function getDealershipInfo() {
  try {
    const { user } = await getAuth();
    if (!user) throw new Error("Unauthorized");

    // Get the dealership record
    let dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    // If no dealership exists, create a default one
    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          // Default values will be used from schema
          workingHours: {
            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: false,
              },
            ],
          },
        },
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    }

    // Format the data
    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    throw new Error("Error fetching dealership info:" + error.message);
  }
}

// Save working hours
export async function saveWorkingHours(workingHours) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get current dealership info
    const dealership = await db.dealershipInfo.findFirst();

    if (!dealership) {
      throw new Error("Dealership info not found");
    }

    // Update working hours - first delete existing hours
    await db.workingHour.deleteMany({
      where: { dealershipId: dealership.id },
    });

    // Then create new hours
    for (const hour of workingHours) {
      await db.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }

    // Revalidate paths
    revalidatePath("/admin/settings");
    revalidatePath("/"); // Homepage might display hours

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error saving working hours:" + error.message);
  }
}

// Get all users
export async function getUsers() {
  try {
    const { user: adminUser } = await getAuth();
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all users
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    throw new Error("Error fetching users:" + error.message);
  }
}

// Update user role
export async function updateUserRole(userId, role) {
  try {
    const { user: adminUser } = await getAuth();
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update user role
    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate paths
    revalidatePath("/admin/settings");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error updating user role:" + error.message);
  }
}

// Update dealership profile details
export async function updateDealershipProfile({ name, address, phone, email }) {
  try {
    const { user: adminUser } = await getAuth();
    if (!adminUser || adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    let dealership = await db.dealershipInfo.findFirst();

    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          name: name || "CarsAi",
          address: address || "Egypt Cairo",
          phone: phone || "01009014597",
          email: email || "support@carsai.com",
        },
      });
    } else {
      dealership = await db.dealershipInfo.update({
        where: { id: dealership.id },
        data: {
          name: name?.trim() || dealership.name,
          address: address?.trim() || dealership.address,
          phone: phone?.trim() || dealership.phone,
          email: email?.trim() || dealership.email,
        },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error updating dealership profile:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
