import Banner from './components/Banner/index';
// import Construction from './components/Construction/index';
import People from './components/People/index';
import Features from './components/Features/index';
import Blog from './components/Blog/index';
import Business from './components/Business/index';
import Payment from './components/Payment/index';
import Location from './components/Location/index';


export default function Home() {
  return (
    <main>
      {/* <Construction /> */}
      <Banner />
      <People />
      <Features />
      <Blog />
      <Business />
      <Payment />
      <Location />
    </main>
  )
}
