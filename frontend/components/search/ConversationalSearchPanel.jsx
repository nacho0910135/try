"use client";

import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { parseConversationalSearch } from "@/lib/conversational-search";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const examplesByLanguage = {
  es: [
    "Alquiler pet friendly cerca de la UCR por $900",
    "Casa en venta en Santa Ana con 3 habitaciones y 2 banos",
    "Lote en Guanacaste cerca de Tamarindo",
    "Roomies estudiantil sin deposito cerca de UNA Heredia"
  ],
  en: [
    "Pet-friendly rental near UCR for $900",
    "House for sale in Santa Ana with 3 bedrooms and 2 bathrooms",
    "Lot in Guanacaste near Tamarindo",
    "Student roommate rental with no deposit near UNA Heredia"
  ]
};

export function ConversationalSearchPanel({ onApply }) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [summaryTokens, setSummaryTokens] = useState([]);
  const examples = examplesByLanguage[language] || examplesByLanguage.es;

  const handleApply = (nextPrompt = prompt) => {
    const result = parseConversationalSearch(nextPrompt, language);
    setPrompt(nextPrompt);
    setSummaryTokens(result.summaryTokens);
    onApply?.(result);
  };

  return (
    <div className="surface-elevated space-y-5 border border-pine/10 bg-[linear-gradient(135deg,rgba(45,106,79,0.1),rgba(255,255,255,0.98))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pine/70">
            {language === "en" ? "Guided search" : "Busqueda guiada"}
          </div>
          <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold text-ink">
            <Sparkles className="h-5 w-5 text-pine" />
            {language === "en"
              ? "Describe what you want and let the map react"
              : "Describe lo que buscas y deja que el mapa responda"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/65">
            {language === "en"
              ? "Use natural language to set property type, operation, area, budget, roommates, pets, and context layers in one step."
              : "Usa lenguaje natural para fijar tipo de propiedad, operacion, zona, presupuesto, roomies, mascotas y capas de contexto en un solo paso."}
          </p>
        </div>
        <div className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-pine shadow-soft">
          {language === "en" ? "Map-first assistant" : "Asistente map-first"}
        </div>
      </div>

      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={
          language === "en"
            ? "Example: Pet-friendly rental near UCR with 2 bedrooms under $900"
            : "Ejemplo: Alquiler pet friendly cerca de la UCR con 2 habitaciones por menos de $900"
        }
        className="min-h-[118px] bg-white/92 shadow-soft"
      />

      <div className="surface-soft flex flex-wrap gap-2 p-3">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleApply(example)}
            className="rounded-full border border-pine/12 bg-white/85 px-3 py-1.5 text-xs font-semibold text-ink/75 transition hover:border-pine/30 hover:text-pine"
          >
            {example}
          </button>
        ))}
      </div>

      {summaryTokens.length ? (
        <div className="flex flex-wrap gap-2">
          {summaryTokens.map((token) => (
            <span
              key={token}
              className="rounded-full bg-pine/12 px-3 py-1.5 text-xs font-semibold text-pine shadow-soft"
            >
              {token}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="success"
          className="gap-2"
          onClick={() => handleApply()}
          disabled={!prompt.trim()}
        >
          <Wand2 className="h-4 w-4" />
          {language === "en" ? "Apply smart search" : "Aplicar busqueda inteligente"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPrompt("");
            setSummaryTokens([]);
            onApply?.(
              parseConversationalSearch("", language)
            );
          }}
        >
          {language === "en" ? "Clear assistant" : "Limpiar asistente"}
        </Button>
      </div>
    </div>
  );
}
