"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
];

export async function askCarAssistant({ message, history = [], currentCarId = null }) {
  try {
    if (!message || typeof message !== "string" || !message.trim()) {
      return { success: false, error: "Message is required" };
    }

    const trimmedMsg = message.trim();

    // Fetch real cars from database to provide live context
    let cars = [];
    let inventoryContext = "";
    try {
      cars = await db.car.findMany({
        where: { status: "AVAILABLE" },
        take: 8,
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
        },
        orderBy: { createdAt: "desc" },
      });

      if (cars.length > 0) {
        inventoryContext =
          "Real Available Cars in Stock:\n" +
          cars
            .map(
              (c) =>
                `- ${c.year} ${c.make} ${c.model} (${c.bodyType || "Car"}, ${c.fuelType || "Petrol"}, ${c.transmission || "Automatic"}) - Price: $${Number(c.price).toLocaleString()} USD, Mileage: ${Number(c.mileage).toLocaleString()} mi. Link: /cars/${c.id}`
            )
            .join("\n");
      }
    } catch (dbErr) {
      console.warn("Could not fetch inventory context:", dbErr.message);
    }

    // If customer is currently viewing a specific car
    let currentCarContext = "";
    if (currentCarId) {
      try {
        const currentCar = await db.car.findUnique({
          where: { id: currentCarId },
        });
        if (currentCar) {
          currentCarContext = `The customer is currently viewing this vehicle: ${currentCar.year} ${currentCar.make} ${currentCar.model}, Price: $${Number(currentCar.price).toLocaleString()}, Mileage: ${currentCar.mileage} mi, Fuel: ${currentCar.fuelType}, Transmission: ${currentCar.transmission}, Color: ${currentCar.color}. Description: ${currentCar.description || "Certified vehicle in pristine condition."}`;
        }
      } catch (cErr) {
        console.warn("Could not fetch current car context:", cErr.message);
      }
    }

    const systemPrompt = `
You are the friendly, knowledgeable, and professional AI Automotive Concierge for "CarsAi", a premier certified used & new car dealership in Egypt and the Middle East.

Key Dealership Facts & Services:
- Certified 150-Point Master Technician Inspection on every vehicle before delivery.
- Free test drives bookable 100% online: navigate to /cars -> select vehicle -> click "Book Test Drive".
- Instant online trade-in & vehicle appraisal available at /sell-or-trade.
- Custom financing & loan EMI monthly payment calculator available at /finance.
- Compare up to 4 vehicles side-by-side highlighting specifications and prices at /compare.
- Showroom Location: Cairo, Egypt. Phone: +20 100 901 4597. Working hours: 9 AM to 6 PM daily.
- 5-day / 500-mile money-back guarantee, certified vehicle history reports, nationwide delivery.

${currentCarContext ? currentCarContext + "\n\n" : ""}
${inventoryContext ? inventoryContext + "\n\n" : ""}

Rules for replies:
1. Always respond in fluent, polished, and friendly English.
2. When mentioning vehicles from our inventory, always include their markdown link, e.g. [2022 Toyota Camry](/cars/<id>) and the price.
3. Keep answers concise, clear, and actionable (2-4 sentences or structured bullet points).
4. Guide customers to relevant pages: /cars, /finance, /sell-or-trade, /compare when helpful.
`;

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: true,
        reply: generateFallbackReply(trimmedMsg, cars),
      };
    }

    // Call Gemini with model fallback cascade and fast timeout
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const recentHistory = (history || [])
        .filter((h) => h && typeof h.content === "string")
        .slice(-4)
        .map((h) => `${h.role === "user" ? "Customer" : "Assistant"}: ${h.content}`);

      const fullPrompt = `${systemPrompt}\n\n${
        recentHistory.length > 0 ? "Conversation History:\n" + recentHistory.join("\n") + "\n\n" : ""
      }Customer: ${trimmedMsg}\nAssistant:`;

      const callModel = async (modelName, timeoutMs = 4000) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const generatePromise = model
          .generateContent(fullPrompt)
          .then((res) => res.response.text());

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), timeoutMs)
        );

        return Promise.race([generatePromise, timeoutPromise]);
      };

      let replyText = null;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          replyText = await callModel(modelName, 3500);
          if (replyText && replyText.trim()) {
            break;
          }
        } catch (mErr) {
          console.warn(`Model ${modelName} failed or timed out:`, mErr.message);
        }
      }

      if (replyText && replyText.trim()) {
        return {
          success: true,
          reply: replyText.trim(),
        };
      }
    } catch (aiErr) {
      console.warn("Gemini AI API call failed or timed out, using fallback:", aiErr.message);
    }

    // Fallback if AI service timed out or was temporarily unavailable
    return {
      success: true,
      reply: generateFallbackReply(trimmedMsg, cars),
    };
  } catch (error) {
    console.error("Assistant error:", error);
    return {
      success: true,
      reply: generateFallbackReply(message, []),
    };
  }
}

// Fallback intelligent English responder with real DB cars
function generateFallbackReply(msg = "", cars = []) {
  const lower = typeof msg === "string" ? msg.toLowerCase() : "";

  // Test drive queries
  if (
    lower.includes("test drive") ||
    lower.includes("schedule") ||
    lower.includes("book") ||
    lower.includes("drive") ||
    lower.includes("تجربة") ||
    lower.includes("حجز")
  ) {
    return `You can book a 100% free test drive for any vehicle in our showroom! 🚗\nSimply visit any car's details page, click **Book Test Drive**, and choose your preferred date and time slot. Our Cairo showroom welcomes you daily from 9 AM to 6 PM.`;
  }

  // Finance / Price queries
  if (
    lower.includes("finance") ||
    lower.includes("loan") ||
    lower.includes("rate") ||
    lower.includes("installment") ||
    lower.includes("interest") ||
    lower.includes("emi") ||
    lower.includes("تقسيط")
  ) {
    return `We offer flexible auto financing terms from 24 up to 84 months with competitive APR! 💳\nYou can use our interactive [Car Finance Calculator](/finance) to calculate your exact monthly payment based on your down payment and loan term.`;
  }

  // Trade-in / Sell car queries
  if (
    lower.includes("sell") ||
    lower.includes("trade") ||
    lower.includes("value") ||
    lower.includes("worth") ||
    lower.includes("بيع") ||
    lower.includes("استبدال")
  ) {
    return `We buy your current vehicle or offer instant trade-in credit toward any car in our showroom! 🔄\nGet a guaranteed cash valuation in under 2 minutes at our [Sell or Trade-in](/sell-or-trade) portal.`;
  }

  // Inspection / Warranty queries
  if (
    lower.includes("inspection") ||
    lower.includes("warranty") ||
    lower.includes("certified") ||
    lower.includes("check") ||
    lower.includes("فحص") ||
    lower.includes("ضمان")
  ) {
    return `Every vehicle at CarsAi undergoes our rigorous **150-Point Certified Inspection** covering the engine, transmission, frame integrity, brakes, and electrical systems. 🛡️\nWe also back every car with a 5-day / 500-mile money-back guarantee. You can inspect the full report on each car's details page.`;
  }

  // Compare cars
  if (
    lower.includes("compare") ||
    lower.includes("difference") ||
    lower.includes("versus") ||
    lower.includes("vs") ||
    lower.includes("مقارنة")
  ) {
    return `You can compare up to 4 vehicles side-by-side with difference highlights at our [Vehicle Comparison](/compare) page! ⚖️`;
  }

  // Cars in stock queries
  if (
    lower.includes("car") ||
    lower.includes("inventory") ||
    lower.includes("stock") ||
    lower.includes("available") ||
    lower.includes("show") ||
    lower.includes("list") ||
    lower.includes("سيار") ||
    lower.includes("عرب")
  ) {
    if (cars.length > 0) {
      const topCars = cars.slice(0, 4);
      const carList = topCars
        .map(
          (c) =>
            `- [${c.year} ${c.make} ${c.model}](/cars/${c.id}) - $${Number(c.price).toLocaleString()} USD (${c.bodyType || "Sedan"})`
        )
        .join("\n");
      return `Here are some of our top certified vehicles currently available:\n\n${carList}\n\nBrowse our full showroom at [All Cars](/cars).`;
    }
  }

  // General greeting fallback
  return `Welcome to CarsAi! 🚗 I'm your AI Automotive Concierge. I can help you find available cars, schedule free test drives, calculate loan payments, or appraise your trade-in. How may I assist you today?`;
}
