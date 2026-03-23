"use client";

import { HandCoins } from "lucide-react";
import { useState } from "react";
import { createPayPalDonationOrder } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "./LanguageProvider";

export function DonateButton({ className = "", compact = false }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    try {
      setLoading(true);
      const data = await createPayPalDonationOrder({ amount: 10 });
      window.location.href = data.order.approvalUrl;
    } catch (error) {
      window.alert(
        error.response?.data?.message ||
          (language === "en"
            ? "We could not open PayPal right now."
            : "No pudimos abrir PayPal en este momento.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDonate}
      disabled={loading}
      className={`${compact ? "px-3 py-2 text-xs sm:px-3.5" : ""} ${className}`.trim()}
      title={language === "en" ? "Support BienesRaicesCR" : "Apoyar BienesRaicesCR"}
    >
      <HandCoins className={`h-4 w-4 ${compact ? "" : "mr-2"}`} />
      <span className={compact ? "hidden sm:inline" : ""}>
        {loading ? (language === "en" ? "Opening..." : "Abriendo...") : language === "en" ? "Donate" : "Donar"}
      </span>
    </Button>
  );
}
