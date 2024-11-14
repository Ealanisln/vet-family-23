"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");

      // init a marker
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      const position = {
        lat: 21.149511162191708,
        lng: -101.70312782990445,
      };

      // Map Options
      const mapOptions: google.maps.MapOptions = {
        center: position,
        zoom: 17,
        mapId: "MY_NEXTJS_MAP_ID",
      };

      // Setup the map
      const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

      // Put up the marker
      const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Vet for Family",
      });
    };

    initMap();
  }, []);

  return <div style={{ height: "600px" }} ref={mapRef} />;
}
