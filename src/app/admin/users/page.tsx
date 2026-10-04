import { setUserRole } from "@/actions/admin";
import { SubmitButton } from "@/components/form";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, contact: true, city: true, role: true },
  });

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Mobile</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.contact}</td>
                <td className="p-3">{u.city}</td>
                <td className="p-3">{u.role === "ADMIN" ? "Admin" : "Customer"}</td>
                <td className="p-3 text-right">
                  {u.id !== admin.id && (
                    <form action={setUserRole}>
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={u.role === "ADMIN" ? "CUSTOMER" : "ADMIN"}
                      />
                      <SubmitButton className="btn btn-secondary">
                        {u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                      </SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
