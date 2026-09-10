import { getSavedCars } from "@/actions/car-listing";
import { SavedCarsList } from "./_components/saved-cars-list";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Saved Cars | CarsAi",
  description: "View your saved cars and favorites",
};

export default async function SavedCarsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  // Fetch saved cars on the server
  const savedCarsResult = await getSavedCars();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl md:text-6xl mb-2 text-slate-900 font-extrabold tracking-tighter pr-2 pb-2 ">
        Your Saved <span className="text-[#E4141B]">Cars</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Keep track of the cars you&apos;re interested in.
      </p>
      <SavedCarsList initialData={savedCarsResult} />
    </div>
  );
}
