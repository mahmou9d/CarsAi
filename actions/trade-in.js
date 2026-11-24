"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { getAdmin } from "@/actions/admin";
import { db } from "@/lib/prisma";

// Helper to serialize trade-in record for client components
function serializeTradeIn(item) {
  if (!item) return null;
  return {
    ...item,
    estimatedMarket: item.estimatedMarket ? parseFloat(item.estimatedMarket.toString()) : null,
    instantCash: item.instantCash ? parseFloat(item.instantCash.toString()) : null,
    tradeInCredit: item.tradeInCredit ? parseFloat(item.tradeInCredit.toString()) : null,
    finalOffer: item.finalOffer ? parseFloat(item.finalOffer.toString()) : null,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  };
}

/**
 * Creates a new Trade-In / Appraisal request (logged-in user or guest)
 */
export async function createTradeInRequest({
  vehicle,
  contact,
  valuation,
}) {
  try {
    if (!vehicle?.make || !vehicle?.model || !vehicle?.year || !vehicle?.mileage) {
      return { success: false, error: "Please provide all required vehicle details" };
    }
    if (!contact?.fullName || !contact?.email || !contact?.phone) {
      return { success: false, error: "Please provide all required contact details" };
    }

    // Optional auth: link to user if logged in
    let userId = null;
    try {
      const auth = await getAuth();
      if (auth?.user?.id) {
        userId = auth.user.id;
      }
    } catch {
      // Guest submission is allowed
    }

    // Generate readable reference code: e.g. APP-842193
    const referenceNumber = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    const record = await db.tradeInRequest.create({
      data: {
        referenceNumber,
        userId,
        fullName: contact.fullName.trim(),
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone.trim(),
        city: contact.city || "Cairo",
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        year: parseInt(vehicle.year, 10),
        mileage: parseInt(vehicle.mileage, 10),
        condition: vehicle.condition || "GOOD",
        notes: contact.notes ? contact.notes.trim() : null,
        estimatedMarket: valuation?.estimatedMarket ? Number(valuation.estimatedMarket) : null,
        instantCash: valuation?.instantCash ? Number(valuation.instantCash) : null,
        tradeInCredit: valuation?.tradeInCredit ? Number(valuation.tradeInCredit) : null,
        status: "PENDING",
      },
    });

    revalidatePath("/sell-or-trade");
    revalidatePath("/reservations");
    revalidatePath("/admin/trade-ins");

    return {
      success: true,
      data: serializeTradeIn(record),
    };
  } catch (error) {
    console.error("Error creating trade-in request:", error);
    return {
      success: false,
      error: error.message || "Failed to submit appraisal request",
    };
  }
}

/**
 * Get all trade-in requests for current logged-in user
 */
export async function getUserTradeIns() {
  try {
    const { user } = await getAuth();
    if (!user) return { success: true, data: [] };

    // Find requests by userId OR by matching user's email
    const records = await db.tradeInRequest.findMany({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: records.map(serializeTradeIn),
    };
  } catch (error) {
    console.error("Error fetching user trade-ins:", error);
    return { success: false, error: error.message || "Failed to fetch requests" };
  }
}

/**
 * Public lookup: track request status by reference code and phone
 */
export async function getTradeInByCode(referenceNumber, phone) {
  try {
    if (!referenceNumber) {
      return { success: false, error: "Please enter your reference number" };
    }

    const cleanRef = referenceNumber.trim().toUpperCase();
    const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : "";

    const record = await db.tradeInRequest.findUnique({
      where: { referenceNumber: cleanRef },
    });

    if (!record) {
      return { success: false, error: "No request found with this reference number" };
    }

    // If phone provided, verify last 4 digits match
    if (cleanPhone) {
      const recordPhoneDigits = record.phone.replace(/\D/g, "");
      if (
        !recordPhoneDigits.endsWith(cleanPhone) &&
        !cleanPhone.endsWith(recordPhoneDigits) &&
        recordPhoneDigits !== cleanPhone
      ) {
        return {
          success: false,
          error: "Phone number does not match this appraisal record",
        };
      }
    }

    return {
      success: true,
      data: serializeTradeIn(record),
    };
  } catch (error) {
    console.error("Error tracking trade-in:", error);
    return { success: false, error: error.message || "Failed to track request" };
  }
}

/**
 * Customer action: accept or decline an offer made by the dealership
 */
export async function respondToTradeInOffer(requestId, decision) {
  try {
    const validDecisions = ["ACCEPTED", "REJECTED"];
    if (!validDecisions.includes(decision)) {
      return { success: false, error: "Invalid decision" };
    }

    const existing = await db.tradeInRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return { success: false, error: "Request not found" };
    }

    if (existing.status !== "OFFER_MADE") {
      return {
        success: false,
        error: "Cannot respond to an offer that is not in OFFER_MADE status",
      };
    }

    const updated = await db.tradeInRequest.update({
      where: { id: requestId },
      data: {
        status: decision === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
        clientDecision: decision,
      },
    });

    revalidatePath("/reservations");
    revalidatePath("/admin/trade-ins");

    return {
      success: true,
      data: serializeTradeIn(updated),
    };
  } catch (error) {
    console.error("Error responding to offer:", error);
    return { success: false, error: error.message || "Failed to submit response" };
  }
}

/**
 * Admin action: get all trade-in requests
 */
export async function getAdminTradeIns(filters = {}) {
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
        { fullName: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { make: { contains: s, mode: "insensitive" } },
        { model: { contains: s, mode: "insensitive" } },
      ];
    }

    const records = await db.tradeInRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: records.map(serializeTradeIn),
    };
  } catch (error) {
    console.error("Error fetching admin trade-ins:", error);
    return { success: false, error: error.message || "Failed to load requests" };
  }
}

/**
 * Admin action: update status, set final offer, add notes
 */
export async function updateTradeInStatus(requestId, {
  status,
  finalOffer,
  adminNotes,
}) {
  try {
    const adminCheck = await getAdmin();
    if (!adminCheck.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const data = {};
    if (status) data.status = status;
    if (finalOffer !== undefined && finalOffer !== "") {
      data.finalOffer = Number(finalOffer);
    }
    if (adminNotes !== undefined) {
      data.adminNotes = adminNotes;
    }

    const updated = await db.tradeInRequest.update({
      where: { id: requestId },
      data,
    });

    revalidatePath("/admin/trade-ins");
    revalidatePath("/reservations");

    return {
      success: true,
      data: serializeTradeIn(updated),
    };
  } catch (error) {
    console.error("Error updating trade-in status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

