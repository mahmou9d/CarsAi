"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { serializeCarData } from "@/lib/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Function to convert File to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

// Gemini AI integration for car image processing
export async function processCarImageWithAI(file) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // Convert image file to base64
    const base64Image = await fileToBase64(file);

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
          Analyze this car image and extract the following information:
          1. Make (manufacturer)
          2. Model
          3. Year (approximately)
          4. Color
          5. Body type (SUV, Sedan, Hatchback, etc.)
          6. Mileage
          7. Fuel type (your best guess)
          8. Transmission type (your best guess)
          9. Price (your best guess)
          10. Short Description as to be added to a car listing

          Format your response as a clean JSON object with these fields:
          {
            "make": "",
            "model": "",
            "year": 0000,
            "color": "",
            "price": 0,
            "mileage": 0,
            "bodyType": "",
            "fuelType": "",
            "transmission": "",
            "description": "",
            "confidence": 0.0
          }

          Important formatting rules:
          - "price" must contain numbers only. Do not include "$", commas, currency symbols, spaces, or any other characters.
            Example: 25000, NOT "$25,000".
          - "mileage" must contain numbers only. Do not include "km", "miles", commas, spaces, or any other characters.
            Example: 85000, NOT "85,000 km".
          - "year" must be a number.
          - "confidence" must be a number between 0 and 1.
          - If the price or mileage cannot be determined from the image, use 0.
          - Return valid JSON only. Do not include markdown, code fences, explanations, or any text outside the JSON object.

          For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
        `;

    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    // Parse the JSON response
    try {
      const carDetails = JSON.parse(cleanedText);

      // Validate the response format
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails),
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`,
        );
      }

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error();
    throw new Error("Gemini API error:" + error.message);
  }
}

// Add a car to the database with images
export async function addCar({ carData, images }) {
  try {
    const { user } = await getAuth();
    if (!user) throw new Error("Unauthorized");

    // Create a unique folder name for this car's images
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    // Initialize Supabase client for server-side operations
    // const cookieStore = await cookies();
    // const supabase = createClient(cookieStore);

    // Upload all images to Supabase storage
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];

      // تأكد إنه فعلاً File/Blob قبل المحاولة
      if (!file || typeof file.arrayBuffer !== "function") {
        console.warn("Skipping invalid image data");
        continue;
      }

      // حوّل الـ File لـ ArrayBuffer بعد كده لـ Buffer
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // استخرج الامتداد من نوع الملف أو اسمه
      const fileExtension = file.type?.split("/")[1] || "jpeg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from("carai")
        .upload(filePath, imageBuffer, {
          contentType: file.type || `image/${fileExtension}`,
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carai/${filePath}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No valid images were uploaded");
    }

    // Add the car to the database
    const car = await db.car.create({
      data: {
        id: carId, // Use the same ID we used for the folder
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
      },
    });

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error adding car:" + error.message);
  }
}

// Fetch all cars with simple search or filters
export async function getCars(query = "") {
  try {
    const search = typeof query === "string" ? query : query?.search || "";
    const status = typeof query === "object" ? query?.status : "";
    const sortBy = typeof query === "object" ? query?.sortBy || "newest" : "newest";

    // Build where conditions
    let where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine orderBy
    let orderBy = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    else if (sortBy === "priceAsc") orderBy = { price: "asc" };
    else if (sortBy === "priceDesc") orderBy = { price: "desc" };
    else if (sortBy === "yearDesc") orderBy = { year: "desc" };
    else if (sortBy === "mileageAsc") orderBy = { mileage: "asc" };

    // Execute main query
    const cars = await db.car.findMany({
      where,
      orderBy,
    });

    const serializedCars = cars.map(serializeCarData);

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Delete a car by ID
export async function deleteCar(id) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

    // First, fetch the car to get its images
    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Delete the car from the database
    await db.car.delete({
      where: { id },
    });

    // Delete the images from Supabase storage
    try {
      // const cookieStore = cookies();
      // const supabase = createClient(cookieStore);

      // Extract file paths from image URLs
      // Supabase عايز المسار الداخلي فقط داخل الـ bucket
      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          `الريجكس هيكمل لحد النهاية ويشمل ?cache=1 في النتيجة — وده مش مطلوب ❌.
          لو اللينك فيه مسافات أو رموز غريبة (encoded) زي %20 أو +
          ممكن الريجكس يتصرف بشكل غير متوقع.
          لو اللينك مش valid أصلًا، JavaScript هتتعامل معاه كنص عادي بدون فحص.`;
          const pathMatch = url.pathname.match(/\/carai\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      // Delete files from storage if paths were extracted
      if (filePaths.length > 0) {
        const { error } = await supabaseAdmin.storage
          .from("carai")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images:", error);
          // We continue even if image deletion fails
        }
      }
    } catch (storageError) {
      console.error("Error with storage operations:", storageError);
      // Continue with the function even if storage operations fail
    }

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update car status or featured status
export async function updateCarStatus(id, { status, featured }) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    // Update the car
    await db.car.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get car by ID for admin edit
export async function getCarByIdAdmin(id) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    const car = await db.car.findUnique({
      where: { id },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    return {
      success: true,
      data: serializeCarData(car),
    };
  } catch (error) {
    console.error("Error fetching car for edit:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update complete car details
export async function updateCar({ id, carData, existingImages = [], newImages = [] }) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    const existingCar = await db.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new Error("Car not found");
    }

    // Determine which images to delete from Supabase storage
    const keptImagesSet = new Set(existingImages);
    const imagesToDelete = existingCar.images.filter((img) => !keptImagesSet.has(img));

    if (imagesToDelete.length > 0) {
      try {
        const filePathsToDelete = imagesToDelete
          .map((imageUrl) => {
            try {
              const url = new URL(imageUrl);
              const pathMatch = url.pathname.match(/\/carai\/(.*)/);
              return pathMatch ? pathMatch[1] : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        if (filePathsToDelete.length > 0) {
          await supabaseAdmin.storage.from("carai").remove(filePathsToDelete);
        }
      } catch (storageError) {
        console.error("Error removing deleted images from storage:", storageError);
      }
    }

    // Upload new images to Supabase storage
    const uploadedNewImageUrls = [];
    const folderPath = `cars/${id}`;

    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        if (!file || typeof file.arrayBuffer !== "function") continue;

        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const fileExtension = file.type?.split("/")[1] || "jpeg";
        const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
        const filePath = `${folderPath}/${fileName}`;

        const { error } = await supabaseAdmin.storage
          .from("carai")
          .upload(filePath, imageBuffer, {
            contentType: file.type || `image/${fileExtension}`,
          });

        if (error) {
          console.error("Error uploading new image:", error);
          throw new Error(`Failed to upload image: ${error.message}`);
        }

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carai/${filePath}`;
        uploadedNewImageUrls.push(publicUrl);
      }
    }

    const finalImages = [...existingImages, ...uploadedNewImageUrls];

    if (finalImages.length === 0) {
      throw new Error("A car must have at least one image");
    }

    // Update car in database
    const updatedCar = await db.car.update({
      where: { id },
      data: {
        make: carData.make,
        model: carData.model,
        year: parseInt(carData.year, 10),
        price: parseFloat(carData.price),
        mileage: parseInt(carData.mileage, 10),
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats ? parseInt(carData.seats, 10) : null,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: finalImages,
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${id}`);
    revalidatePath("/cars");
    revalidatePath("/");

    return {
      success: true,
      data: serializeCarData(updatedCar),
    };
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Submit car inquiry from customer
export async function submitCarInquiry({
  carId,
  name,
  email,
  phone,
  message,
  preferredContact = "EMAIL",
}) {
  try {
    if (!name || !email || !message) {
      throw new Error("Name, email, and message are required");
    }

    // Optional user authentication
    const { user: dbUser } = await getAuth();

    const inquiry = await db.carInquiry.create({
      data: {
        carId: carId || null,
        userId: dbUser?.id || null,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
        preferredContact: preferredContact || "EMAIL",
        status: "NEW",
      },
    });

    return {
      success: true,
      message:
        "Thank you! Your inquiry has been submitted. Our team will contact you shortly.",
      data: inquiry,
    };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return {
      success: false,
      error: error.message || "Failed to submit inquiry",
    };
  }
}

// Quick price update for admin
export async function updateCarPrice(id, newPrice) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error("Please enter a valid positive price");
    }

    await db.car.update({
      where: { id },
      data: { price: priceNum },
    });

    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${id}`);
    revalidatePath("/cars");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating car price:", error);
    return { success: false, error: error.message };
  }
}

// Bulk update car statuses
export async function bulkUpdateCarStatus(carIds, newStatus) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    if (!Array.isArray(carIds) || carIds.length === 0) {
      throw new Error("No cars selected");
    }

    await db.car.updateMany({
      where: { id: { in: carIds } },
      data: { status: newStatus },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/admin");
    revalidatePath("/cars");
    revalidatePath("/");

    return { success: true, count: carIds.length };
  } catch (error) {
    console.error("Error bulk updating cars:", error);
    return { success: false, error: error.message };
  }
}

// Bulk delete cars
export async function bulkDeleteCars(carIds) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    if (!Array.isArray(carIds) || carIds.length === 0) {
      throw new Error("No cars selected");
    }

    await db.car.deleteMany({
      where: { id: { in: carIds } },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/admin");
    revalidatePath("/cars");
    revalidatePath("/");

    return { success: true, count: carIds.length };
  } catch (error) {
    console.error("Error bulk deleting cars:", error);
    return { success: false, error: error.message };
  }
}

// Clone an existing car entry
export async function cloneCar(carId) {
  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Admin privileges required");
    }

    const source = await db.car.findUnique({
      where: { id: carId },
    });

    if (!source) throw new Error("Car not found");

    const cloned = await db.car.create({
      data: {
        make: source.make,
        model: `${source.model} (Copy)`,
        year: source.year,
        price: source.price,
        mileage: source.mileage,
        color: source.color,
        fuelType: source.fuelType,
        transmission: source.transmission,
        bodyType: source.bodyType,
        seats: source.seats,
        description: source.description,
        status: "AVAILABLE",
        featured: false,
        images: source.images || [],
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");

    return { success: true, data: serializeCarData(cloned) };
  } catch (error) {
    console.error("Error cloning car:", error);
    return { success: false, error: error.message };
  }
}
