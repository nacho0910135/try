"use client";

import { useEffect, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapPin } from "lucide-react";
import Map, { GeolocateControl, Marker, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { formatCurrency } from "@/lib/utils";
import { mapDefaultCenter } from "@/lib/constants";

export function SearchMap({
  properties = [],
  selectedPropertyId,
  onSelectProperty,
  onBoundsChange,
  onPolygonChange
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/light-v11";
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  useEffect(() => {
    if (!token || !mapRef.current || drawRef.current) {
      return;
    }

    const map = mapRef.current.getMap();
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    drawRef.current = draw;
    map.addControl(draw, "top-left");

    const syncPolygon = () => {
      const [feature] = draw.getAll().features;
      const polygon = feature?.geometry?.coordinates?.[0] || null;
      onPolygonChange?.(polygon);
    };

    map.on("draw.create", syncPolygon);
    map.on("draw.update", syncPolygon);
    map.on("draw.delete", syncPolygon);

    return () => {
      map.off("draw.create", syncPolygon);
      map.off("draw.update", syncPolygon);
      map.off("draw.delete", syncPolygon);
      map.removeControl(draw);
      drawRef.current = null;
    };
  }, [token, onPolygonChange]);

  if (!token) {
    return (
      <div className="surface flex min-h-[520px] flex-col items-center justify-center gap-3 p-8 text-center">
        <h3 className="text-lg font-semibold">Activa Mapbox para ver el mapa interactivo</h3>
        <p className="max-w-md text-sm text-ink/60">
          Configura `NEXT_PUBLIC_MAPBOX_TOKEN` en el frontend para usar bounds, pines y dibujo de zonas.
        </p>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapLib={mapboxgl}
        mapStyle={mapStyle}
        initialViewState={mapDefaultCenter}
        minZoom={5}
        onMoveEnd={(event) => {
          const bounds = event.target.getBounds();

          onBoundsChange?.({
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
          });
        }}
        style={{ width: "100%", minHeight: 520 }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation={false}
          showUserHeading
        />

        {properties.map((property) => (
          <Marker
            key={property._id}
            longitude={property.location.coordinates[0]}
            latitude={property.location.coordinates[1]}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => onSelectProperty?.(property._id)}
              className={`rounded-full px-3 py-2 text-xs font-semibold shadow-soft ${
                selectedPropertyId === property._id
                  ? "bg-terracotta text-white"
                  : "bg-white text-ink"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{formatCurrency(property.price, property.currency)}</span>
              </div>
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}

