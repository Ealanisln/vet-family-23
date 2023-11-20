import Image from 'next/image';
import Link from 'next/link';

const Business = () => {

    return (
        <div className="mx-auto max-w-7xl pt-20 sm:pb-24 px-6">

            <div className='grid grid-cols-1 lg:grid-cols-12 space-x-1'>

                <div className='col-span-6 flex flex-col justify-center'>
                    <h2 className='text-midnightblue text-4xl sm:text-5xl font-semibold text-center lg:text-start lh-143'>Tu Mascota, Nuestro Huésped de Honor</h2>
                    <h3 className='text-black text-lg font-normal text-center lg:text-start lh-173 opacity-75 pt-3'>Brindamos un alojamiento seguro y amoroso para perros y gatos, donde cada peludo huésped es tratado con cuidado excepcional y atención personalizada.</h3>
                    {/* <Link href={'/'} className="text-electricblue text-lg font-medium flex gap-2 pt-4 mx-auto lg:mx-0">
                        Learn more <Image src="/assets/people/arrow-right.svg" alt="arrow-right" width={24} height={24} />
                    </Link> */}
                </div>

                <div className='col-span-6 flex justify-center mt-10 lg:mt-0'>
                    <Image src="/assets/business/hotel.png" alt="business" width={1000} height={805} className='rounded-3xl' />
                </div>

            </div>
        </div>

    )
}

export default Business;
