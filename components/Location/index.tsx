"use client";

import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import Link from "next/link";
import Image from "next/image";

export interface FormProps {
  result: boolean;
  isChecked: boolean;
  callTime: { time: string; isChecked: boolean }[];

  loading: boolean;
}

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
      <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h3 className="text-4xl sm:text-5xl font-semibold text-black text-center my-10">
          Nuesta ubicación:
        </h3>
        <Link href="https://maps.app.goo.gl/XiLPjx4ZuchBSnMs6">
          <h4 className="text-black opacity-90 text-2xl sm:text-3xl font-normal text-center pb-10">
            Calle Poetas No. 144 • Col. Panorama. <br />
            León Guanajuato.
          </h4>
        </Link>

        <div className="flex items-baseline justify-center">
          <Link
            href={"https://wa.link/u5njd1"}
            className="flex gap-2 pt-4 mx-auto lg:mx-0"
          >
            <h4 className="text-green opacity-90 text-xl">
              Whatsapp • 477-260-5743
            </h4>
            <Image
              src="/assets/location/whats.svg"
              alt="whatsapp-logo"
              width={30}
              height={30}
            />
          </Link>
        </div>

        <div className="flex items-baseline justify-center pb-12">
          <a
            href={`tel:477-332-7152`}
            className="flex gap-2 pt-4 mx-auto lg:mx-0"
          >
            <h4 className="text-green opacity-90 text-xl">
              Clínica • 477-332-7152
            </h4>
            <Image
              src="/assets/location/phone.svg"
              alt="phone-logo"
              width={30}
              height={30}
            />
          </a>
        </div>

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
