"use server";

import { db } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Save an official multi-point inspection report for a vehicle
 */
export async function saveCarInspection({
  carId,
  inspectorName,
  score,
  grade,
  certification,
  passedItems = 0,
  attentionItems = 0,
  failedItems = 0,
  checklistData,
  notes = "",
}) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Admin authorization required" };
    }

    if (!carId) {
      return { success: false, error: "Target vehicle ID is required" };
    }

    // Verify car exists
    const car = await db.car.findUnique({
      where: { id: carId },
      select: { id: true, make: true, model: true, year: true },
    });

    if (!car) {
      return { success: false, error: "Vehicle not found in showroom database" };
    }

    const report = await db.inspectionReport.create({
      data: {
        carId,
        inspectorName: inspectorName || user.name || "Certified Inspector",
        score: parseInt(score, 10) || 0,
        grade: grade || "Standard Passed",
        certification: certification || "CarsAi Multi-Point Checked",
        passedItems: parseInt(passedItems, 10) || 0,
        attentionItems: parseInt(attentionItems, 10) || 0,
        failedItems: parseInt(failedItems, 10) || 0,
        checklistData: checklistData || [],
        notes: notes || null,
      },
    });

    revalidatePath("/admin/cars/inspection");
    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${carId}`);
    revalidatePath("/admin");

    return {
      success: true,
      data: {
        id: report.id,
        createdAt: report.createdAt.toISOString(),
      },
      message: `Inspection certification officially saved for ${car.year} ${car.make} ${car.model}!`,
    };
  } catch (error) {
    console.error("Error saving car inspection:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get inspection history for a car
 */
export async function getCarInspections(carId) {
  try {
    if (!carId) return { success: true, data: [] };

    const reports = await db.inspectionReport.findMany({
      where: { carId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: reports.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error getting car inspections:", error);
    return { success: false, error: error.message };
  }
}

