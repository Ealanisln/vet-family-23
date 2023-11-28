import Link from "next/link";
import Image from "next/image";

interface links {
  link: string;
  url: string;
}

interface socialLinks {
  imgSrc: string;
  link: string;
  width: number;
}

const socialLinks: socialLinks[] = [
  {
    imgSrc: "/assets/footer/facebook.svg",
    link: "https://www.facebook.com/people/Family-Vet-23/100067098365828/",
    width: 10,
  },
  {
    imgSrc: "/assets/footer/instagram.svg",
    link: "https://www.instagram.com/vet.family.23/",
    width: 14,
  },
];

const links: links[] = [
  {
    link: "Testimonios",
    url: "#testimonios",
  },
  {
    link: "Servicios",
    url: "#servicios"
  },
  {
    link: "Blog",
    url: "/blog"
  },
  {
    link: "Contacto",
    url: "#contacto"
  },
  {
    link: "Ubicación",
    url: "#ubicacion"
  },
];

const footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className=" bg-midnightblue">
      <div className="mx-auto max-w-2xl pt-4 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="my-12 grid grid-cols-1 gap-y-10 sm:grid-cols-6 lg:grid-cols-12">
          {/* COLUMN-1 */}

          <div className="sm:col-span-6 lg:col-span-3">
            <div className="flex flex-shrink-0 items-center border-right">
              <Image
                src="/assets/footer/logo.svg"
                alt="logo"
                width={100}
                height={50}
              />
            </div>
          </div>

          <div className="sm:col-span-6 lg:col-span-5 flex items-center">
            <div className="flex gap-4">
              {links.map((items, i) => (
                <div key={i}>
                  <Link
                    href={items.url}
                    className="text-lg font-normal text-white flex items-center justify-center"
                  >
                    {items.link}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-6 lg:col-span-4">
            <div className="flex gap-4 lg:justify-end">
              {socialLinks.map((items, i) => (
                <Link href={items.link} key={i}>
                  <div className="socialBg h-12 w-12 shadow-xl text-base rounded-full flex items-center justify-center footer-icons hover:bg-white">
                    <Image
                      src={items.imgSrc}
                      alt={items.imgSrc}
                      width={items.width}
                      height={2}
                      className="sepiaa"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* All Rights Reserved */}

        <div className="pt-12 pb-10 lg:flex items-center justify-between border-t border-t-white border-opacity-30">
          <h4 className="text-lg text-center md:text-start font-normal text-white opacity-60">
            {currentYear} Vet Family - Todos los derechos reservados.
          </h4>
          <div className="flex gap-5 mt-6 md:mt-0 justify-center md:justify-start">
            {/* <h4 className="opacity-60 text-lg font-normal text-white">
              <Link href="/" target="_blank">
                Política de privacidad
              </Link>
            </h4> */}
            <div className="h-5 bg-white opacity-60 w-0.5"></div>
            <Link href="https://www.alanis.dev">
              <h4 className="opacity-60 text-lg font-normal text-white">
                Creada con ❤️ por Alanis Web Dev.
              </h4>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default footer;
