import React from "react";
import Links from "./Links";
import { Map } from "./Map";

const index = () => {
  return (
    <>
      <Links />
      <div className="mx-auto max-w-2xl pt-8 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <Map />
      </div>
    </>
  );
};

export default index;
