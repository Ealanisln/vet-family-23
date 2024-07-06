"use client";

import { useEffect, useState } from "react";
import FloatingSsr from "./FloatingSsr";

export default function FloatingWhatsapp() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <FloatingSsr
      phoneNumber="524772605743"
      accountName="Vet for Family"
      allowEsc
      notification
    />
  );
}