import { notFound } from "next/navigation";
import { Sidebar } from "./admin/_components/sidebar";
import { getAdmin } from "@/actions/admin";
import Header from "@/components/Header";

export default async function AdminLayout({ children }) {
  const admin = await getAdmin();
console.log(admin.authorized)
  // If user not found in our db or not an admin, redirect to 404
  if (!admin.authorized) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0  md:w-56 md:z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 min-h-screen">{children}</main>
    </div>
  );
}
