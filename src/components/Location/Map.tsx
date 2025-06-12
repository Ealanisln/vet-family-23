"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

export function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);

  // Exact coordinates from the Google Maps image: Poetas 144, Panorama, León de los Aldamas, Gto.
  const vetLocation = {
    lat: 21.149511162191708,
    lng: -101.70312782990445,
  };

  // Google Maps Embed URL for fallback
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.5!2d-101.70312782990445!3d21.149511162191708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzU4LjIiTiAxMDHCsDQyJzExLjMiVw!5e0!3m2!1ses!2smx!4v1700000000000!5m2!1ses!2smx`;

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if API key exists
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          throw new Error("API key not found");
        }

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;

        // Enhanced Map Options
        const mapOptions: google.maps.MapOptions = {
          center: vetLocation,
          zoom: 17,
          mapId: "VET_FAMILY_MAP_ID",
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "simplified" }]
            },
            {
              featureType: "road",
              elementType: "labels",
              stylers: [{ visibility: "simplified" }]
            }
          ],
          gestureHandling: 'cooperative',
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          }
        };

        // Initialize the map
        const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

        // Custom pin element with veterinary styling
        const pinElement = new PinElement({
          background: "#14B8A6",
          borderColor: "#0F766E",
          glyphColor: "#FFFFFF",
          scale: 1.2,
        });

        // Create the marker
        const marker = new AdvancedMarkerElement({
          map: map,
          position: vetLocation,
          title: "Vet Family - Clínica Veterinaria",
          content: pinElement.element,
        });

        // Info window content
        const infoWindowContent = `
          <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #14B8A6, #06B6D4); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L7.5 15.5C6.7 15.3 6 15.9 6 16.8V22H8V17.5L11 18V22H13V18L16 17.5V22H18V16.8C18 15.9 17.3 15.3 16.5 15.5L13 16V11C14.1 11 15 10.1 15 9H21Z"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Vet Family</h3>
                <p style="margin: 0; font-size: 12px; color: #6B7280;">Clínica Veterinaria</p>
              </div>
            </div>
            <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.4;">
              <strong>📍 Dirección:</strong><br>
              Poetas 144, Panorama<br>
              León de los Aldamas, Guanajuato
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #374151;">
              <strong>📞 Teléfono:</strong> 477-332-7152
            </p>
            <p style="margin: 8px 0; font-size: 14px; color: #374151;">
              <strong>🕒 Horarios:</strong> Lun-Vie 9:00-21:00
            </p>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <a href="tel:477-332-7152" style="padding: 6px 12px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
                Llamar
              </a>
              <a href="https://wa.link/u5njd1" target="_blank" style="padding: 6px 12px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
                WhatsApp
              </a>
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          ariaLabel: "Vet Family - Información de la clínica veterinaria",
        });

        // Show info window by default
        infoWindow.open(map, marker);

        // Add click event to marker
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        // Add a circle to show service area (optional)
        new google.maps.Circle({
          strokeColor: "#14B8A6",
          strokeOpacity: 0.3,
          strokeWeight: 2,
          fillColor: "#14B8A6",
          fillOpacity: 0.1,
          map: map,
          center: vetLocation,
          radius: 2000, // 2km radius
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError("Error al cargar el mapa con API. Usando mapa alternativo...");
        setUseEmbedFallback(true);
        setIsLoading(false);
      }
    };

    // Try to load the advanced map first, fallback to embed if it fails
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Map taking too long to load, switching to embed fallback");
        setUseEmbedFallback(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    initMap();

    return () => clearTimeout(timer);
  }, []);

  // Embed fallback component
  if (useEmbedFallback) {
    return (
      <div className="relative">
        <iframe
          src={embedUrl}
          className="w-full h-96 lg:h-[500px] rounded-2xl shadow-inner border-0"
          style={{ minHeight: "400px" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Vet Family - Ubicación"
        />
        
        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Navigation className="w-4 h-4 text-teal-600" />
            <span className="font-medium">Vet Family</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Poetas 144, Panorama
          </p>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${vetLocation.lat},${vetLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 group"
            title="Obtener direcciones"
          >
            <Navigation className="w-5 h-5 group-hover:text-teal-600 transition-colors" />
          </a>
          
          <a
            href="https://maps.app.goo.gl/XiLPjx4ZuchBSnMs6"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
            title="Ver en Google Maps"
          >
            <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    );
  }

  if (error && !useEmbedFallback) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <MapPin className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el mapa</h3>
        <p className="text-gray-600 text-center mb-4 max-w-sm">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setUseEmbedFallback(true);
              setError(null);
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
          >
            Usar mapa alternativo
          </button>
          <a
            href="https://maps.app.goo.gl/XiLPjx4ZuchBSnMs6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en Google Maps
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
        <div className="relative">
          <MapPin className="w-12 h-12 text-teal-500 mb-4" />
          <div className="absolute inset-0 animate-ping">
            <MapPin className="w-12 h-12 text-teal-400 opacity-75" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando mapa</h3>
        <p className="text-gray-600 text-center max-w-sm">
          Preparando la ubicación de nuestra clínica veterinaria...
        </p>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 lg:h-[500px] rounded-2xl shadow-inner"
        style={{ minHeight: "400px" }}
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Navigation className="w-4 h-4 text-blue-600" />
          <span className="font-medium">Vet Family</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Poetas 144, Panorama
        </p>
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${vetLocation.lat},${vetLocation.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 transition-all duration-200 group"
          title="Obtener direcciones"
        >
          <Navigation className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
        </a>
        
        <a
          href="https://maps.app.goo.gl/XiLPjx4ZuchBSnMs6"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
          title="Ver en Google Maps"
        >
          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );
}
