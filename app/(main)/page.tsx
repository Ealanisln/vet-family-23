import Banner from "../../components/Banner/index";
import Reviews from "../../components/Reviews/index";
import Servicios from "../../components/Servicios/index";
import Business from "../../components/Business/index";
import HomeDelivery from "../../components/HomeDelivery/index";
import Location from "../../components/Location/";
import Contact, { FormProps } from "../../components/Contact";

export default async function Home() {
  const formProps: FormProps = {
    result: false,
    isChecked: false,
    callTime: [],
    loading: false,
  };

  return (
    <main>
      <Banner />
      <Reviews />
      <Servicios />
      <Business />
      <HomeDelivery />
      <Contact {...formProps} />
      <Location />
    </main>
  );
}
