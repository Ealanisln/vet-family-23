// src/app/(main)/page.tsx
import VetSEO from '@/components/SEO/VetSeo';
import Reviews from "../../components/Reviews/index";
import Servicios from "../../components/Servicios/index";
import Business from "../../components/Business/index";
import HomeDelivery from "../../components/HomeDelivery/index";
import Location from "../../components/Location/";
import Contact from "../../components/Contact";
import GaleriaFotos from "@/components/GaleriaFotos/GaleriaFotos";
import FloatingWhatsApp from "@/components/FloatingWhatsapp/FloatingWhatsapp";
// import { AlertBanner } from "@/components/AlertBanner";
import VetFamilyHero from "@/components/Banner/Banner";
// import AnniversaryBanner from '@/components/AnniversaryBanner/Anniversary';

export default async function Home() {
  return (
    <>
      <VetSEO />
      {/* <AnniversaryBanner />  */}
      <FloatingWhatsApp />
      <VetFamilyHero />
      {/* <AlertBanner /> */}
      <Reviews />
      <Servicios />
      <GaleriaFotos />
      <Business />
      <HomeDelivery />
      <Contact />
      <Location />
    </>
  );
}