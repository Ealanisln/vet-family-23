import Banner from "../../components/Banner/index";
import { CarouselSpacing } from "../../components/Caroussel/index";
import Reviews from "../../components/Reviews/index";
import Servicios from "../../components/Servicios/index";
import Business from "../../components/Business/index";
import HomeDelivery from "../../components/HomeDelivery/index";
import Location from "../../components/Location/";
import Contact, { FormProps } from "../../components/Contact";
import GaleriaFotos from "@/components/GaleriaFotos/GaleriaFotos";
// import Specials from "@/components/Specials";
import FloatingWhatsApp from "@/components/FloatingWhatsapp/FloatingWhatsapp";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/";
import FloatingSsr from "@/components/FloatingWhatsapp/FloatingSsr";

export default async function Home() {
  const formProps: FormProps = {
    result: false,
    isChecked: false,
    callTime: [],
    loading: false,
  };

  return (
    <main>
      <FloatingWhatsApp />
      <Banner />
      {/* <Specials /> */}
      <Reviews />
      <Servicios />
      <GaleriaFotos />
      <Business />
      <HomeDelivery />
      <Contact {...formProps} />
      <Location />
    </main>
  );
}
