"use client";

import { useEffect, useState } from "react";
import  FloatingSsr  from "./FloatingSsr";

export default function FloatingWhatsapp() {
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);
  return (
    <div>
      {isSSR ? null : (
        <FloatingSsr
          phoneNumber="524772605743"
          accountName="Vet for Family"
          allowEsc
          notification
        />
      )}
    </div>
  );
}
