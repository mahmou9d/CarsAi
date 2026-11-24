import { getAdminUsers } from "@/actions/admin";
import { UsersList } from "./_components/users-list";

export const metadata = {
  title: "Customers & Users | CarsAi Admin",
  description: "Manage registered users, customers, and administrative permissions",
};

export default async function AdminUsersPage() {
  const usersData = await getAdminUsers();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers & Users
          </h1>
          <p className="text-sm text-slate-500">
            View registered clients, monitor customer activity, and manage team roles
          </p>
        </div>
      </div>

      <UsersList initialData={usersData} />
    </div>
  );
}

