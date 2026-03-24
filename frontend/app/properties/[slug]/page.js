import { notFound } from "next/navigation";
import PropertyDetailPageClient from "@/components/property/PropertyDetailPageClient";
import {
  buildPropertyMetadata,
  buildPropertyStructuredData,
  fetchPropertySeoData
} from "@/lib/property-seo";

export async function generateMetadata({ params }) {
  const data = await fetchPropertySeoData(params.slug);

  if (!data?.property) {
    return {
      title: "Propiedad no encontrada | BienesRaicesCR",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return buildPropertyMetadata(data.property);
}

export default async function PropertyDetailPage({ params }) {
  const data = await fetchPropertySeoData(params.slug);

  if (!data?.property) {
    notFound();
  }

  const structuredData = buildPropertyStructuredData(data.property);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PropertyDetailPageClient slug={params.slug} initialProperty={data.property} />
    </>
  );
}
