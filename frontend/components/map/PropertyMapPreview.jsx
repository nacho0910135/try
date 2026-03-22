"use client";

import Map, { Marker, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";
import { resolveMapStyle } from "@/lib/map-style";

export function PropertyMapPreview({ property }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = resolveMapStyle(process.env.NEXT_PUBLIC_MAPBOX_STYLE);

  if (!token) {
    return (
      <div className="surface flex min-h-[280px] items-center justify-center p-6 text-center text-sm text-ink/60">
        Configura `NEXT_PUBLIC_MAPBOX_TOKEN` para habilitar el mapa de detalle.
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <Map
        mapboxAccessToken={token}
        mapLib={mapboxgl}
        mapStyle={mapStyle}
        initialViewState={{
          longitude: property.location.coordinates[0],
          latitude: property.location.coordinates[1],
          zoom: 12
        }}
        style={{ width: "100%", minHeight: 280 }}
      >
        <NavigationControl position="top-right" />
        <Marker
          longitude={property.location.coordinates[0]}
          latitude={property.location.coordinates[1]}
          anchor="bottom"
        >
          <div className="rounded-full bg-terracotta p-3 text-white shadow-soft">
            <MapPin className="h-4 w-4" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
