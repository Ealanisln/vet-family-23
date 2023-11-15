import Banner from './components/Banner/index';
import People from './components/People/index';
import Features from './components/Features/index';
import Business from './components/Business/index';
import Payment from './components/Payment/index';
import Location from './components/Location/index';


export default function Home() {
  return (
    <main>
      <Banner />
      <People />
      <Features />
      <Business />
      <Payment />
      <Location />
    </main>
  )
}
