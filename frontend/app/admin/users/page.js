"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, updateAdminUserStatus } from "@/lib/api";
import { roleLabels } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);

  const loadUsers = async () => {
    const data = await getAdminUsers();
    setUsers(data.items || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (user) => {
    await updateAdminUserStatus(user._id, !user.isActive);
    await loadUsers();
  };

  if (!users) {
    return <LoadingState label="Cargando usuarios..." />;
  }

  return (
    <section className="surface p-6">
      <span className="eyebrow">Usuarios</span>
      <h1 className="mt-4 font-serif text-4xl font-semibold">Gestion de usuarios</h1>
      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <div key={user._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-ink/55">
                  {user.email} • {roleLabels[user.role] || user.role}
                </div>
              </div>
              <Button
                variant={user.isActive ? "secondary" : "accent"}
                onClick={() => toggleUserStatus(user)}
              >
                {user.isActive ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

