"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "w-full",
  height: "500px",
};

function GoogleMaps() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const onLoad = (map: google.maps.Map) => {
    // Handle map load event here if needed
    console.log("loaded");
  };

  return isLoaded ? (
    <div className="bg-babyblue" id="ubicacion">
       <div className="mx-auto max-w-2xl py-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
          Nuesta ubicación:
        </h3>
        <h5 className="text-black opacity-60 text-lg font-normal text-center pb-10">
          Calle Poetas No. 144 • Col. Panorama. <br />
          León Guanajuato. 
        </h5>
        
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: 21.149511162191708,
          lng: -101.70312782990445,
        }}
        zoom={18}
        onLoad={onLoad}
      >
        <Marker
          position={{
            lat: 21.149511162191708,
            lng: -101.70312782990445,
          }}
          visible={true}
          clickable={false}
        />
      </GoogleMap>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default GoogleMaps;
