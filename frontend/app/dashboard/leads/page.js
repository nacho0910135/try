"use client";

import { useEffect, useState } from "react";
import { getReceivedLeads, getSentLeads, updateLeadStatus } from "@/lib/api";
import { leadStatusLabels } from "@/lib/constants";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardLeadsPage() {
  const [received, setReceived] = useState(null);
  const [sent, setSent] = useState(null);

  const loadLeads = async () => {
    const [receivedData, sentData] = await Promise.all([
      getReceivedLeads(),
      getSentLeads()
    ]);

    setReceived(receivedData.items || []);
    setSent(sentData.items || []);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatus = async (leadId, status) => {
    await updateLeadStatus(leadId, status);
    await loadLeads();
  };

  if (!received || !sent) {
    return <LoadingState label="Cargando leads..." />;
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <span className="eyebrow">Leads recibidos</span>
        <div className="mt-5 space-y-4">
          {received.length ? (
            received.map((lead) => (
              <div key={lead._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-sm text-ink/55">
                      {lead.property?.title} • {lead.email}
                    </div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(event) => handleStatus(lead._id, event.target.value)}
                    className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  >
                    {Object.entries(leadStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-4 text-sm text-ink/70">{lead.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Aun no has recibido leads.</p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <span className="eyebrow">Leads enviados</span>
        <div className="mt-5 space-y-4">
          {sent.length ? (
            sent.map((lead) => (
              <div key={lead._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="font-semibold">{lead.property?.title}</div>
                <div className="mt-1 text-sm text-ink/55">
                  Para {lead.toUser?.name} • {lead.email}
                </div>
                <p className="mt-4 text-sm text-ink/70">{lead.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Aun no has enviado consultas.</p>
          )}
        </div>
      </section>
    </div>
  );
}

