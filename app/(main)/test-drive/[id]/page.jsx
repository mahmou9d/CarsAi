import { getCarById } from "@/actions/car-listing";
import { notFound } from "next/navigation";
import { TestDriveForm } from "./_components/test-drive-form";

export async function generateMetadata() {
  return {
    title: `Book Test Drive | CarsAi`,
    description: `Schedule a test drive in few seconds`,
  };
}

export default async function TestDrivePage({ params }) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl md:text-6xl mb-2 text-slate-900 font-extrabold tracking-tighter pr-2 pb-2 ">
        Book a Test <span className="text-[#E4141B]">Drive</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Pick a date and time that works for you.
      </p>
      <TestDriveForm
        car={result.data}
        testDriveInfo={result.data.testDriveInfo}
      />
    </div>
  );
}
