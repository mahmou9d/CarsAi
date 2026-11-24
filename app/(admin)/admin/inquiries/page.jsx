import { getAdminInquiries } from "@/actions/admin";
import { InquiriesList } from "./_components/inquiries-list";

export const metadata = {
  title: "Customer Inquiries | CarsAi Admin",
  description: "Manage customer vehicle inquiries and sales leads",
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const initialData = await getAdminInquiries();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track, respond to, and convert customer vehicle inquiries into sales
          </p>
        </div>
      </div>

      <InquiriesList initialData={initialData} />
    </div>
  );
}

