"use client";

import { useEffect, useState } from "react";
import {
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserVerification
} from "@/lib/api";
import { roleLabels } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

const verificationLabels = {
  "not-requested": "Sin solicitud",
  pending: "Pendiente",
  verified: "Verificada",
  rejected: "Rechazada"
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

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

  const handleVerification = async (user, status) => {
    await updateAdminUserVerification(user._id, {
      status,
      reviewNote: reviewNotes[user._id] || ""
    });
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-ink/55">
                  {user.email} - {roleLabels[user.role] || user.role}
                </div>
                <div className="mt-2 text-xs text-ink/55">
                  Verificacion:{" "}
                  <strong>{verificationLabels[user.verification?.status || "not-requested"]}</strong>
                  {user.verification?.requestedBadge ? ` - ${user.verification.requestedBadge}` : ""}
                </div>
                {user.verification?.requestNote ? (
                  <div className="mt-2 text-sm text-ink/65">
                    Solicitud: {user.verification.requestNote}
                  </div>
                ) : null}
                {user.verification?.reviewNote ? (
                  <div className="mt-1 text-sm text-ink/55">
                    Revision: {user.verification.reviewNote}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={user.isActive ? "secondary" : "accent"}
                  onClick={() => toggleUserStatus(user)}
                >
                  {user.isActive ? "Desactivar" : "Activar"}
                </Button>
                <Button variant="success" onClick={() => handleVerification(user, "verified")}>
                  Aprobar verificacion
                </Button>
                <Button variant="danger" onClick={() => handleVerification(user, "rejected")}>
                  Rechazar
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <label className="field-label">Nota de revision</label>
              <textarea
                value={reviewNotes[user._id] || ""}
                onChange={(event) =>
                  setReviewNotes((current) => ({
                    ...current,
                    [user._id]: event.target.value
                  }))
                }
                className="field-input min-h-[90px]"
                placeholder="Comentario para la revision de verificacion."
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
