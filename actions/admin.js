"use server";

import { serializeCarData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAdmin() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}

/**
 * Get all test drives for admin with filters
 */
export async function getAdminTestDrives({ search = "", status = "" }) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Build where conditions
    let where = {};

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get bookings
    const bookings = await db.testDriveBooking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
      // "desc" = تنازلي (من الأحدث للأقدم)
      // "asc" = تصاعدي (من الأصغر للأكبر)
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      userId: booking.userId,
      user: booking.user,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update test drive status
 */
export async function updateTestDriveStatus(bookingId, newStatus) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    // Get the booking
    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      };
    }

    // Update status
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    // Revalidate paths
    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test drive status updated successfully",
    };
  } catch (error) {
    throw new Error("Error updating test drive status:" + error.message);
  }
}

export async function getDashboardData() {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Fetch all necessary data in parallel
    const [
      cars,
      testDrives,
      inquiries,
      savedCars,
      dealership,
      recentCars,
      recentTestDrives,
      recentInquiries,
      tradeIns,
      services,
    ] = await Promise.all([
      db.car.findMany({
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
          status: true,
          featured: true,
          images: true,
          createdAt: true,
        },
      }),

      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
          bookingDate: true,
          createdAt: true,
        },
      }),

      db.carInquiry.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
          createdAt: true,
        },
      }),

      db.userSavedCar.findMany({
        select: {
          carId: true,
        },
      }),

      db.dealershipInfo.findFirst({
        include: {
          workingHours: true,
        },
      }),

      db.car.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          price: true,
          createdAt: true,
        },
      }),

      db.testDriveBooking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          car: { select: { make: true, model: true, year: true } },
          user: { select: { name: true, email: true } },
        },
      }),

      db.carInquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          car: { select: { make: true, model: true, year: true } },
        },
      }),

      db.tradeInRequest.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      }),

      db.serviceBooking.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter((car) => car.status === "AVAILABLE");
    const soldCars = cars.filter((car) => car.status === "SOLD");
    const unavailableCars = cars.filter((car) => car.status === "UNAVAILABLE");
    const featuredCars = cars.filter((car) => car.featured === true).length;

    // Financial calculations
    const inventoryValuation = availableCars.reduce(
      (sum, c) => sum + parseFloat(c.price.toString()),
      0
    );
    const totalSalesVolume = soldCars.reduce(
      (sum, c) => sum + parseFloat(c.price.toString()),
      0
    );
    const avgPrice =
      availableCars.length > 0 ? inventoryValuation / availableCars.length : 0;

    // Makes Breakdown
    const makesMap = {};
    cars.forEach((c) => {
      makesMap[c.make] = (makesMap[c.make] || 0) + 1;
    });
    const makesBreakdown = Object.entries(makesMap)
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count);

    // Body Types Breakdown
    const bodyTypesMap = {};
    cars.forEach((c) => {
      bodyTypesMap[c.bodyType] = (bodyTypesMap[c.bodyType] || 0) + 1;
    });
    const bodyTypesBreakdown = Object.entries(bodyTypesMap)
      .map(([bodyType, count]) => ({ bodyType, count }))
      .sort((a, b) => b.count - a.count);

    // Fuel Types Breakdown
    const fuelMap = {};
    cars.forEach((c) => {
      const fuel = c.fuelType || "Other";
      fuelMap[fuel] = (fuelMap[fuel] || 0) + 1;
    });
    const fuelBreakdown = Object.entries(fuelMap)
      .map(([fuelType, count]) => ({ fuelType, count }))
      .sort((a, b) => b.count - a.count);

    // Transmission Breakdown
    const transmissionMap = {};
    cars.forEach((c) => {
      const trans = c.transmission || "Other";
      transmissionMap[trans] = (transmissionMap[trans] || 0) + 1;
    });
    const transmissionBreakdown = Object.entries(transmissionMap)
      .map(([transmission, count]) => ({ transmission, count }))
      .sort((a, b) => b.count - a.count);

    // Price Tiers Breakdown
    const priceTiers = [
      { label: "Under $25K", count: 0, min: 0, max: 25000 },
      { label: "$25K - $50K", count: 0, min: 25000, max: 50000 },
      { label: "$50K - $100K", count: 0, min: 50000, max: 100000 },
      { label: "Over $100K", count: 0, min: 100000, max: Infinity },
    ];
    cars.forEach((c) => {
      const price = parseFloat(c.price.toString());
      const tier = priceTiers.find((t) => price >= t.min && price < t.max);
      if (tier) tier.count++;
    });

    // Mileage Tiers Breakdown
    const mileageTiers = [
      { label: "< 20K km", count: 0, min: 0, max: 20000 },
      { label: "20K - 60K km", count: 0, min: 20000, max: 60000 },
      { label: "60K - 120K km", count: 0, min: 60000, max: 120000 },
      { label: "120K+ km", count: 0, min: 120000, max: Infinity },
    ];
    cars.forEach((c) => {
      const km = c.mileage || 0;
      const tier = mileageTiers.find((t) => km >= t.min && km < t.max);
      if (tier) tier.count++;
    });

    // 6 Months Timeline Trends
    const now = new Date();
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });

      const carsCount = cars.filter((c) => {
        const cd = new Date(c.createdAt);
        return cd >= d && cd < nextMonth;
      }).length;

      const testDrivesCount = testDrives.filter((td) => {
        const tdd = new Date(td.createdAt || td.bookingDate);
        return tdd >= d && tdd < nextMonth;
      }).length;

      const inquiriesCount = inquiries.filter((inq) => {
        const inqd = new Date(inq.createdAt);
        return inqd >= d && inqd < nextMonth;
      }).length;

      monthlyTrends.push({
        month: monthLabel,
        cars: carsCount,
        testDrives: testDrivesCount,
        inquiries: inquiriesCount,
      });
    }

    // Top In-Demand Cars (by inquiries + test drives)
    const demandMap = {};
    testDrives.forEach((td) => {
      if (td.carId) {
        demandMap[td.carId] = demandMap[td.carId] || { testDrives: 0, inquiries: 0 };
        demandMap[td.carId].testDrives++;
      }
    });
    inquiries.forEach((inq) => {
      if (inq.carId) {
        demandMap[inq.carId] = demandMap[inq.carId] || { testDrives: 0, inquiries: 0 };
        demandMap[inq.carId].inquiries++;
      }
    });

    const topDemandedCars = cars
      .map((car) => {
        const stats = demandMap[car.id] || { testDrives: 0, inquiries: 0 };
        const totalScore = stats.testDrives * 2 + stats.inquiries;
        return {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: parseFloat(car.price.toString()),
          image: car.images && car.images[0] ? car.images[0] : null,
          status: car.status,
          testDrivesCount: stats.testDrives,
          inquiriesCount: stats.inquiries,
          totalScore,
        };
      })
      .filter((c) => c.totalScore > 0 || c.testDrivesCount > 0 || c.inquiriesCount > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    // Wishlist Demand Statistics
    const wishlistMap = {};
    savedCars.forEach((sc) => {
      wishlistMap[sc.carId] = (wishlistMap[sc.carId] || 0) + 1;
    });

    const topWishlistedCars = cars
      .filter((c) => wishlistMap[c.id])
      .map((c) => ({
        id: c.id,
        make: c.make,
        model: c.model,
        year: c.year,
        price: parseFloat(c.price.toString()),
        image: c.images && c.images[0] ? c.images[0] : null,
        status: c.status,
        savesCount: wishlistMap[c.id],
      }))
      .sort((a, b) => b.savesCount - a.savesCount)
      .slice(0, 5);

    // Inventory Aging (Days on Lot for AVAILABLE cars)
    const currentTime = Date.now();
    let totalDaysOnLot = 0;
    let freshStock = 0; // < 15 days
    let normalStock = 0; // 15 - 45 days
    let agingStock = 0; // 45 - 90 days
    let staleStock = 0; // 90+ days

    const agedCarsList = availableCars.map((c) => {
      const days = Math.max(
        0,
        Math.floor((currentTime - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );
      totalDaysOnLot += days;
      if (days < 15) freshStock++;
      else if (days <= 45) normalStock++;
      else if (days <= 90) agingStock++;
      else staleStock++;

      return {
        id: c.id,
        make: c.make,
        model: c.model,
        year: c.year,
        price: parseFloat(c.price.toString()),
        image: c.images && c.images[0] ? c.images[0] : null,
        daysOnLot: days,
      };
    });

    const avgDaysOnLot =
      availableCars.length > 0 ? Math.round(totalDaysOnLot / availableCars.length) : 0;
    const oldestStock = agedCarsList
      .sort((a, b) => b.daysOnLot - a.daysOnLot)
      .slice(0, 5);

    // Available cars list for Loan & Deal Calculator
    const availableCarsList = availableCars.map((c) => ({
      id: c.id,
      make: c.make,
      model: c.model,
      year: c.year,
      price: parseFloat(c.price.toString()),
    }));

    const dealershipDetails = dealership
      ? {
          name: dealership.name,
          address: dealership.address,
          phone: dealership.phone,
          email: dealership.email,
          workingHours: (dealership.workingHours || []).map((wh) => ({
            id: wh.id,
            dayOfWeek: wh.dayOfWeek,
            openTime: wh.openTime,
            closeTime: wh.closeTime,
            isOpen: wh.isOpen,
          })),
        }
      : null;

    // Test drive statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter((td) => td.status === "PENDING").length;
    const confirmedTestDrives = testDrives.filter((td) => td.status === "CONFIRMED").length;
    const completedTestDrives = testDrives.filter((td) => td.status === "COMPLETED").length;
    const cancelledTestDrives = testDrives.filter((td) => td.status === "CANCELLED").length;
    const noShowTestDrives = testDrives.filter((td) => td.status === "NO_SHOW").length;

    // Test drive conversion rate
    const completedTestDriveCarIds = testDrives
      .filter((td) => td.status === "COMPLETED")
      .map((td) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) => car.status === "SOLD" && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    // Inquiries stats
    const totalInquiries = inquiries.length;
    const newInquiries = inquiries.filter((inq) => inq.status === "NEW").length;
    const contactedInquiries = inquiries.filter((inq) => inq.status === "CONTACTED").length;
    const resolvedInquiries = inquiries.filter((inq) => inq.status === "RESOLVED").length;

    // Trade-In stats
    const totalTradeIns = tradeIns.length;
    const pendingTradeIns = tradeIns.filter((ti) => ti.status === "PENDING").length;
    const inReviewTradeIns = tradeIns.filter((ti) => ti.status === "IN_REVIEW").length;
    const offerMadeTradeIns = tradeIns.filter((ti) => ti.status === "OFFER_MADE").length;
    const acceptedTradeIns = tradeIns.filter((ti) => ti.status === "ACCEPTED").length;
    const completedTradeIns = tradeIns.filter((ti) => ti.status === "COMPLETED").length;

    // Service Booking stats
    const totalServices = services.length;
    const pendingServices = services.filter((s) => s.status === "PENDING").length;
    const confirmedServices = services.filter((s) => s.status === "CONFIRMED").length;
    const inProgressServices = services.filter((s) => s.status === "IN_PROGRESS").length;
    const readyServices = services.filter((s) => s.status === "READY_FOR_PICKUP").length;
    const completedServices = services.filter((s) => s.status === "COMPLETED").length;

    return {
      success: true,
      data: {
        financials: {
          inventoryValuation,
          totalSalesVolume,
          avgPrice,
        },
        makesBreakdown,
        bodyTypesBreakdown,
        fuelBreakdown,
        transmissionBreakdown,
        priceTiers,
        mileageTiers,
        monthlyTrends,
        topDemandedCars,
        wishlistDemand: {
          totalSaves: savedCars.length,
          topWishlistedCars,
        },
        inventoryAging: {
          avgDaysOnLot,
          fresh: freshStock,
          normal: normalStock,
          aging: agingStock,
          stale: staleStock,
          oldestStock,
        },
        availableCarsList,
        dealership: dealershipDetails,
        cars: {
          total: totalCars,
          available: availableCars.length,
          sold: soldCars.length,
          unavailable: unavailableCars.length,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        inquiries: {
          total: totalInquiries,
          new: newInquiries,
          contacted: contactedInquiries,
          resolved: resolvedInquiries,
        },
        tradeIns: {
          total: totalTradeIns,
          pending: pendingTradeIns,
          inReview: inReviewTradeIns,
          offerMade: offerMadeTradeIns,
          accepted: acceptedTradeIns,
          completed: completedTradeIns,
        },
        services: {
          total: totalServices,
          pending: pendingServices,
          confirmed: confirmedServices,
          inProgress: inProgressServices,
          ready: readyServices,
          completed: completedServices,
        },
        recentActivity: {
          cars: recentCars.map((c) => ({
            ...c,
            price: parseFloat(c.price.toString()),
            createdAt: c.createdAt.toISOString(),
          })),
          testDrives: recentTestDrives.map((td) => ({
            id: td.id,
            bookingDate: td.bookingDate.toISOString(),
            startTime: td.startTime,
            status: td.status,
            car: td.car ? `${td.car.year} ${td.car.make} ${td.car.model}` : "Car",
            customerName: td.user?.name || "Customer",
            createdAt: td.createdAt.toISOString(),
          })),
          inquiries: recentInquiries.map((inq) => ({
            id: inq.id,
            name: inq.name,
            email: inq.email,
            status: inq.status,
            car: inq.car ? `${inq.car.year} ${inq.car.make} ${inq.car.model}` : "General",
            createdAt: inq.createdAt.toISOString(),
          })),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all customer inquiries for admin
 */
export async function getAdminInquiries({ search = "", status = "" } = {}) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    let where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { car: { make: { contains: search, mode: "insensitive" } } },
        { car: { model: { contains: search, mode: "insensitive" } } },
      ];
    }

    const inquiries = await db.carInquiry.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: inquiries.map((inq) => ({
        ...inq,
        car: inq.car
          ? {
              ...inq.car,
              price: parseFloat(inq.car.price.toString()),
            }
          : null,
        createdAt: inq.createdAt.toISOString(),
        updatedAt: inq.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update an inquiry status and optional admin notes
 */
export async function updateInquiryStatus(inquiryId, status, adminNotes = null) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const data = { status };
    if (adminNotes !== null) {
      data.adminNotes = adminNotes;
    }

    await db.carInquiry.update({
      where: { id: inquiryId },
      data,
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an inquiry
 */
export async function deleteInquiry(inquiryId) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    await db.carInquiry.delete({
      where: { id: inquiryId },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users with activity counts for admin
 */
export async function getAdminUsers({ search = "", role = "" } = {}) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    let where = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, allUsersCount, adminCount] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          _count: {
            select: {
              testDrives: true,
              savedCars: true,
              inquiries: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.user.count(),
      db.user.count({ where: { role: "ADMIN" } }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt.toISOString(),
      testDrivesCount: u._count.testDrives,
      savedCarsCount: u._count.savedCars,
      inquiriesCount: u._count.inquiries,
    }));

    return {
      success: true,
      data: {
        users: formattedUsers,
        stats: {
          total: allUsersCount,
          admins: adminCount,
          clients: allUsersCount - adminCount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update user role from admin panel
 */
export async function updateUserRoleAdmin(userId, role) {
  try {
    const { user: currentAdmin } = await getAuth();
    if (!currentAdmin || currentAdmin.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    if (userId === currentAdmin.id && role !== "ADMIN") {
      throw new Error("You cannot remove your own admin privileges.");
    }

    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get comprehensive business reports & financial analytics
 */
export async function getReportsData() {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const [cars, testDrives, inquiries, users] = await Promise.all([      db.car.findMany({        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          price: true,
          mileage: true,
          status: true,
          bodyType: true,
          fuelType: true,
          transmission: true,
          createdAt: true,
        },
      }),
      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          bookingDate: true,
          createdAt: true,
          carId: true,
        },
      }),
      db.carInquiry.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
          carId: true,
        },
      }),
      db.user.findMany({
        select: {
          id: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Financial & Inventory KPIs
    const availableCars = cars.filter((c) => c.status === "AVAILABLE");
    const soldCars = cars.filter((c) => c.status === "SOLD");
    const unavailableCars = cars.filter((c) => c.status === "UNAVAILABLE");

    const activeInventoryValue = availableCars.reduce(
      (sum, c) => sum + parseFloat(c.price.toString()),
      0
    );
    const realizedSoldRevenue = soldCars.reduce(
      (sum, c) => sum + parseFloat(c.price.toString()),
      0
    );
    const averageVehiclePrice =
      availableCars.length > 0 ? activeInventoryValue / availableCars.length : 0;
    const averageMileage =
      availableCars.length > 0
        ? Math.round(
            availableCars.reduce((sum, c) => sum + (c.mileage || 0), 0) /
              availableCars.length
          )
        : 0;

    // Brand / Make Breakdown
    const brandMap = {};
    cars.forEach((car) => {
      const brand = car.make || "Unknown";
      if (!brandMap[brand]) {
        brandMap[brand] = {
          make: brand,
          totalUnits: 0,
          availableUnits: 0,
          soldUnits: 0,
          totalValue: 0,
          avgPrice: 0,
        };
      }
      brandMap[brand].totalUnits += 1;
      const price = parseFloat(car.price.toString());
      brandMap[brand].totalValue += price;
      if (car.status === "AVAILABLE") brandMap[brand].availableUnits += 1;
      if (car.status === "SOLD") brandMap[brand].soldUnits += 1;
    });

    const brandStats = Object.values(brandMap)
      .map((b) => ({
        ...b,
        avgPrice: b.totalUnits > 0 ? Math.round(b.totalValue / b.totalUnits) : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    // Body Type Breakdown
    const bodyTypeMap = {};
    availableCars.forEach((car) => {
      const type = car.bodyType || "Other";
      bodyTypeMap[type] = (bodyTypeMap[type] || 0) + 1;
    });
    const bodyTypeStats = Object.entries(bodyTypeMap).map(([type, count]) => ({
      type,
      count,
      percentage:
        availableCars.length > 0
          ? Math.round((count / availableCars.length) * 100)
          : 0,
    })).sort((a, b) => b.count - a.count);

    // Fuel Type Breakdown
    const fuelTypeMap = {};
    availableCars.forEach((car) => {
      const fuel = car.fuelType || "Other";
      fuelTypeMap[fuel] = (fuelTypeMap[fuel] || 0) + 1;
    });
    const fuelTypeStats = Object.entries(fuelTypeMap).map(([type, count]) => ({
      type,
      count,
      percentage:
        availableCars.length > 0
          ? Math.round((count / availableCars.length) * 100)
          : 0,
    })).sort((a, b) => b.count - a.count);

    // Price Tiers Breakdown
    const priceTiers = [
      { label: "Under $25k (Budget)", min: 0, max: 25000, count: 0, total: 0 },
      { label: "$25k - $50k (Mid-Range)", min: 25000, max: 50000, count: 0, total: 0 },
      { label: "$50k - $100k (Premium)", min: 50000, max: 100000, count: 0, total: 0 },
      { label: "$100k+ (Luxury & Exotic)", min: 100000, max: Infinity, count: 0, total: 0 },
    ];

    availableCars.forEach((car) => {
      const price = parseFloat(car.price.toString());
      const tier = priceTiers.find((t) => price >= t.min && price < t.max);
      if (tier) {
        tier.count += 1;
        tier.total += price;
      }
    });

    // Conversion Funnel
    const totalInquiries = inquiries.length;
    const totalBookings = testDrives.length;
    const completedBookings = testDrives.filter(
      (td) => td.status === "COMPLETED"
    ).length;
    const totalSold = soldCars.length;

    const leadToBookingRate =
      totalInquiries > 0
        ? Math.round((totalBookings / totalInquiries) * 100)
        : 0;
    const bookingToSaleRate =
      completedBookings > 0
        ? Math.round((totalSold / completedBookings) * 100)
        : 0;

    return {
      success: true,
      data: {
        financials: {
          activeInventoryValue,
          realizedSoldRevenue,
          averageVehiclePrice: Math.round(averageVehiclePrice),
          averageMileage,
          totalInventoryCount: cars.length,
          availableCount: availableCars.length,
          soldCount: soldCars.length,
          unavailableCount: unavailableCars.length,
          totalRegisteredUsers: users.length,
        },
        brandStats,
        bodyTypeStats,
        fuelTypeStats,
        priceTiers,
        funnel: {
          totalInquiries,
          totalBookings,
          completedBookings,
          totalSold,
          leadToBookingRate,
          bookingToSaleRate,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get unified activity logs & audit trail
 */
export async function getActivityLogs({ category = "ALL" } = {}) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const [cars, testDrives, inquiries, users, tradeIns, services] = await Promise.all([
      db.car.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          price: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.testDriveBooking.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        include: {
          car: { select: { make: true, model: true, year: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      db.carInquiry.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        include: {
          car: { select: { make: true, model: true, year: true } },
        },
      }),
      db.user.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      db.tradeInRequest.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          referenceNumber: true,
          fullName: true,
          make: true,
          model: true,
          year: true,
          status: true,
          finalOffer: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.serviceBooking.findMany({
        take: 30,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          referenceNumber: true,
          customerName: true,
          carMake: true,
          carModel: true,
          serviceType: true,
          status: true,
          preferredDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const events = [];

    // Car events
    cars.forEach((car) => {
      const priceNum = parseFloat(car.price.toString()).toLocaleString();
      const carLabel = `${car.year} ${car.make} ${car.model}`;

      if (car.status === "SOLD") {
        events.push({
          id: `car-sold-${car.id}`,
          type: "CAR_SOLD",
          category: "INVENTORY",
          title: "Vehicle Marked as Sold",
          description: `${carLabel} was marked as SOLD for $${priceNum}`,
          severity: "success",
          timestamp: car.updatedAt.toISOString(),
          meta: { carId: car.id, label: carLabel },
        });
      } else {
        events.push({
          id: `car-listed-${car.id}`,
          type: "CAR_LISTED",
          category: "INVENTORY",
          title: "Vehicle Inventory Update",
          description: `${carLabel} (${car.status}) listed at $${priceNum}`,
          severity: "info",
          timestamp: car.createdAt.toISOString(),
          meta: { carId: car.id, label: carLabel },
        });
      }
    });

    // Test drive events
    testDrives.forEach((td) => {
      const carName = td.car ? `${td.car.year} ${td.car.make} ${td.car.model}` : "Vehicle";
      const customer = td.user?.name || td.user?.email || "Customer";
      const dateStr = new Date(td.bookingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      let severity = "info";
      let title = "Test Drive Scheduled";
      if (td.status === "CONFIRMED") {
        severity = "success";
        title = "Test Drive Confirmed";
      } else if (td.status === "COMPLETED") {
        severity = "success";
        title = "Test Drive Completed";
      } else if (td.status === "CANCELLED") {
        severity = "alert";
        title = "Test Drive Cancelled";
      }

      events.push({
        id: `td-${td.id}`,
        type: `TEST_DRIVE_${td.status}`,
        category: "TEST_DRIVE",
        title,
        description: `${customer} scheduled ${carName} for ${dateStr} at ${td.startTime}`,
        severity,
        timestamp: td.updatedAt.toISOString(),
        meta: { bookingId: td.id, carName, status: td.status },
      });
    });

    // Inquiry events
    inquiries.forEach((inq) => {
      const carName = inq.car ? `${inq.car.year} ${inq.car.make} ${inq.car.model}` : "General Inventory";
      let severity = "info";
      let title = "Customer Inquiry Received";
      if (inq.status === "RESOLVED") {
        severity = "success";
        title = "Inquiry Resolved";
      } else if (inq.status === "CONTACTED") {
        severity = "warning";
        title = "Inquiry Followed Up";
      }

      events.push({
        id: `inq-${inq.id}`,
        type: `INQUIRY_${inq.status}`,
        category: "INQUIRY",
        title,
        description: `Lead from ${inq.name} regarding ${carName}: "${inq.message?.slice(0, 70)}..."`,
        severity,
        timestamp: inq.updatedAt.toISOString(),
        meta: { inquiryId: inq.id, customer: inq.name, status: inq.status },
      });
    });

    // User registrations
    users.forEach((u) => {
      events.push({
        id: `user-${u.id}`,
        type: "USER_REGISTERED",
        category: "USER",
        title: u.role === "ADMIN" ? "Admin Access Granted" : "New User Registration",
        description: `${u.name || "User"} (${u.email}) joined the CarsAi platform`,
        severity: u.role === "ADMIN" ? "warning" : "info",
        timestamp: u.createdAt.toISOString(),
        meta: { userId: u.id, email: u.email, role: u.role },
      });
    });

    // Trade-In events
    tradeIns.forEach((ti) => {
      const vehicleLabel = `${ti.year} ${ti.make} ${ti.model}`;
      const statusMap = {
        PENDING: { sev: "info", title: "Trade-In Request Received" },
        IN_REVIEW: { sev: "warning", title: "Trade-In Under Review" },
        OFFER_MADE: { sev: "warning", title: "Trade-In Offer Sent to Customer" },
        ACCEPTED: { sev: "success", title: "Trade-In Offer Accepted" },
        REJECTED: { sev: "alert", title: "Trade-In Offer Rejected" },
        COMPLETED: { sev: "success", title: "Trade-In Deal Completed" },
      };
      const { sev, title } = statusMap[ti.status] || { sev: "info", title: "Trade-In Updated" };
      events.push({
        id: `ti-${ti.id}`,
        type: `TRADE_IN_${ti.status}`,
        category: "TRADE_IN",
        title,
        description: `${ti.fullName} submitted ${vehicleLabel} for appraisal (Ref: ${ti.referenceNumber})`,
        severity: sev,
        timestamp: ti.updatedAt.toISOString(),
        meta: { tradeInId: ti.id, ref: ti.referenceNumber, status: ti.status },
      });
    });

    // Service Booking events
    services.forEach((sv) => {
      const vehicleLabel = sv.carModel ? `${sv.carMake} ${sv.carModel}` : sv.carMake;
      const statusMap = {
        PENDING: { sev: "info", title: "Service Appointment Requested" },
        CONFIRMED: { sev: "success", title: "Service Appointment Confirmed" },
        IN_PROGRESS: { sev: "warning", title: "Vehicle In Service Bay" },
        READY_FOR_PICKUP: { sev: "success", title: "Vehicle Ready for Pickup" },
        COMPLETED: { sev: "success", title: "Service Completed" },
        CANCELLED: { sev: "alert", title: "Service Appointment Cancelled" },
      };
      const { sev, title } = statusMap[sv.status] || { sev: "info", title: "Service Updated" };
      events.push({
        id: `svc-${sv.id}`,
        type: `SERVICE_${sv.status}`,
        category: "SERVICE",
        title,
        description: `${sv.customerName} booked ${sv.serviceType} for ${vehicleLabel} (Ref: ${sv.referenceNumber})`,
        severity: sev,
        timestamp: sv.updatedAt.toISOString(),
        meta: { serviceId: sv.id, ref: sv.referenceNumber, status: sv.status },
      });
    });

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter if needed
    const filteredEvents =
      category === "ALL"
        ? events
        : events.filter((e) => e.category === category);

    return {
      success: true,
      data: filteredEvents.slice(0, 80),
    };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
