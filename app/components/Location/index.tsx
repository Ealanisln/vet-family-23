/**
 * v0 by Vercel.
 * @see https://v0.dev/t/IPuoxEsMUwF
 */
export default function Component() {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#46B2B4] dark:bg-[#2a6165]">
        <div className="container grid max-w-5xl items-center justify-center gap-4 px-4 text-center md:gap-8 md:px-6 lg:grid-cols-2 lg:text-left xl:max-w-6xl xl:gap-10">
          <div className="space-y-4 md:space-y-6 border-r-2 border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white dark:text-gray-200">
                Nuestra ubicación
              </h2>
              <p className="max-w-[500px] text-slate-800 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-[#B44846]">
                Visítanos en León Guanajuato! 
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-white dark:text-gray-200">Dirección</h4>
              <p className="text-sm text-slate-50 dark:text-slate-50">Calle Poetas 144, Col. Panorama</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-white dark:text-gray-200">Contacto</h4>
              <p className="text-sm text-slate-50 dark:text-slate-50">(555) 555-5555</p>
            </div>
          </div>
          <div className="w-full h-[300px] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-200 ease-in-out">
            <img
              alt="Map of our location"
              className="object-cover object-center"
              height="300"
              src="/placeholder.svg"
              style={{
                aspectRatio: "500/300",
                objectFit: "cover",
              }}
              width="500"
            />
          </div>
        </div>
      </section>
    )
  }
  
  