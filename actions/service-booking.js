"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { getAdmin } from "@/actions/admin";
import { db } from "@/lib/prisma";

// Helper to serialize service booking for client components
function serializeService(item) {
  if (!item) return null;
  return {
    ...item,
    preferredDate: item.preferredDate ? item.preferredDate.toISOString().slice(0, 10) : null,
    estimatedCost: item.estimatedCost ? parseFloat(item.estimatedCost.toString()) : null,
    finalCost: item.finalCost ? parseFloat(item.finalCost.toString()) : null,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  };
}

/**
 * Creates a new Certified Service / Maintenance booking (user or guest)
 */
export async function createServiceBooking({
  customerName,
  customerPhone,
  customerEmail,
  carMake,
  carModel,
  carYear,
  serviceType,
  servicePackage,
  preferredDate,
  preferredTime,
  notes,
  estimatedCost,
}) {
  try {
    if (!customerName || !customerPhone || !preferredDate) {
      return { success: false, error: "Please provide your name, phone, and appointment date" };
    }

    // Optional auth: link to user if logged in
    let userId = null;
    try {
      const auth = await getAuth();
      if (auth?.user?.id) {
        userId = auth.user.id;
      }
    } catch {
      // Guest booking allowed
    }

    // Generate readable booking reference: e.g. SRV-719302
    const referenceNumber = `SRV-${Math.floor(100000 + Math.random() * 900000)}`;

    const record = await db.serviceBooking.create({
      data: {
        referenceNumber,
        userId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : null,
        carMake: carMake ? carMake.trim() : "Other",
        carModel: carModel ? carModel.trim() : null,
        carYear: carYear ? parseInt(carYear, 10) : null,
        serviceType: serviceType || "Scheduled Maintenance",
        servicePackage: servicePackage || null,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || "Morning (09:00 AM - 12:00 PM)",
        notes: notes ? notes.trim() : null,
        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
        status: "PENDING",
      },
    });

    revalidatePath("/services");
    revalidatePath("/reservations");
    revalidatePath("/admin/services");

    return {
      success: true,
      data: serializeService(record),
    };
  } catch (error) {
    console.error("Error creating service booking:", error);
    return {
      success: false,
      error: error.message || "Failed to book service appointment",
    };
  }
}

/**
 * Get all service appointments for logged-in user
 */
export async function getUserServiceBookings() {
  try {
    const { user } = await getAuth();
    if (!user) return { success: true, data: [] };

    const records = await db.serviceBooking.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ customerEmail: user.email.toLowerCase() }] : []),
          ...(user.phone ? [{ customerPhone: user.phone }] : []),
        ],
      },
      orderBy: { preferredDate: "desc" },
    });

    return {
      success: true,
      data: records.map(serializeService),
    };
  } catch (error) {
    console.error("Error fetching user service bookings:", error);
    return { success: false, error: error.message || "Failed to fetch service bookings" };
  }
}

/**
 * Public lookup: track service appointment status by reference code and phone
 */
export async function getServiceBookingByCode(referenceNumber, phone) {
  try {
    if (!referenceNumber) {
      return { success: false, error: "Please enter your booking reference code" };
    }

    const cleanRef = referenceNumber.trim().toUpperCase();
    const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : "";

    const record = await db.serviceBooking.findUnique({
      where: { referenceNumber: cleanRef },
    });

    if (!record) {
      return { success: false, error: "No booking found with this reference code" };
    }

    if (cleanPhone) {
      const recordPhoneDigits = record.customerPhone.replace(/\D/g, "");
      if (
        !recordPhoneDigits.endsWith(cleanPhone) &&
        !cleanPhone.endsWith(recordPhoneDigits) &&
        recordPhoneDigits !== cleanPhone
      ) {
        return {
          success: false,
          error: "Phone number does not match this service appointment",
        };
      }
    }

    return {
      success: true,
      data: serializeService(record),
    };
  } catch (error) {
    console.error("Error tracking service appointment:", error);
    return { success: false, error: error.message || "Failed to track appointment" };
  }
}

/**
 * Admin action: get all service bookings with filters
 */
export async function getAdminServiceBookings(filters = {}) {
  try {
    const adminCheck = await getAdmin();
    if (!adminCheck.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const where = {};
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    if (filters.search) {
      const s = filters.search.trim();
      where.OR = [
        { referenceNumber: { contains: s, mode: "insensitive" } },
        { customerName: { contains: s, mode: "insensitive" } },
        { customerPhone: { contains: s, mode: "insensitive" } },
        { carMake: { contains: s, mode: "insensitive" } },
      ];
    }

    const records = await db.serviceBooking.findMany({
      where,
      orderBy: { preferredDate: "desc" },
    });

    return {
      success: true,
      data: records.map(serializeService),
    };
  } catch (error) {
    console.error("Error fetching admin service bookings:", error);
    return { success: false, error: error.message || "Failed to load bookings" };
  }
}

/**
 * Admin action: update status, assign technician, final cost, notes
 */
export async function updateServiceBookingStatus(bookingId, {
  status,
  technicianName,
  finalCost,
  adminNotes,
  inspectionPassed,
}) {
  try {
    const adminCheck = await getAdmin();
    if (!adminCheck.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const data = {};
    if (status) data.status = status;
    if (technicianName !== undefined) data.technicianName = technicianName;
    if (finalCost !== undefined && finalCost !== "") {
      data.finalCost = Number(finalCost);
    }
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (inspectionPassed !== undefined) data.inspectionPassed = Boolean(inspectionPassed);

    const updated = await db.serviceBooking.update({
      where: { id: bookingId },
      data,
    });

    revalidatePath("/admin/services");
    revalidatePath("/reservations");

    return {
      success: true,
      data: serializeService(updated),
    };
  } catch (error) {
    console.error("Error updating service booking status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

