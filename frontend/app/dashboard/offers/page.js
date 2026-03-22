"use client";

import { useEffect, useState } from "react";
import { getReceivedOffers, getSentOffers, updateOfferStatus } from "@/lib/api";
import { offerStatusLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DashboardOffersPage() {
  const [received, setReceived] = useState(null);
  const [sent, setSent] = useState(null);

  const loadOffers = async () => {
    const [receivedData, sentData] = await Promise.all([getReceivedOffers(), getSentOffers()]);
    setReceived(receivedData.items || []);
    setSent(sentData.items || []);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleStatus = async (offerId, status) => {
    await updateOfferStatus(offerId, status);
    await loadOffers();
  };

  if (!received || !sent) {
    return <LoadingState label="Cargando ofertas..." />;
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <span className="eyebrow">Ofertas recibidas</span>
        <div className="mt-5 space-y-4">
          {received.length ? (
            received.map((offer) => (
              <div key={offer._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {formatCurrency(offer.amount, offer.currency)} - {offer.name}
                    </div>
                    <div className="text-sm text-ink/55">
                      {offer.property?.title} - {offer.email}
                    </div>
                    {offer.phone ? (
                      <div className="mt-1 text-sm text-ink/55">{offer.phone}</div>
                    ) : null}
                  </div>
                  <select
                    value={offer.status}
                    onChange={(event) => handleStatus(offer._id, event.target.value)}
                    className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  >
                    {Object.entries(offerStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {offer.message ? <p className="mt-4 text-sm text-ink/70">{offer.message}</p> : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Aun no has recibido ofertas.</p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <span className="eyebrow">Ofertas enviadas</span>
        <div className="mt-5 space-y-4">
          {sent.length ? (
            sent.map((offer) => (
              <div key={offer._id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="font-semibold">
                  {formatCurrency(offer.amount, offer.currency)} - {offer.property?.title}
                </div>
                <div className="mt-1 text-sm text-ink/55">
                  Para {offer.toUser?.name} - {offer.email} - {offerStatusLabels[offer.status]}
                </div>
                {offer.message ? <p className="mt-4 text-sm text-ink/70">{offer.message}</p> : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Aun no has enviado ofertas.</p>
          )}
        </div>
      </section>
    </div>
  );
}
