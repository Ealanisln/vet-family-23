import Image from "next/image";
import Link from "next/link";

const Specials = () => {
  return (
    <div className="mx-auto max-w-7xl pt-20 sm:pb-24 px-6" id="promociones">
      <div className="grid grid-cols-1 lg:grid-cols-12 space-x-1">
        <div className="col-span-6 flex justify-center">
          <Image
            src="/assets/specials/1er-año.png"
            alt="payment"
            width={500}
            height={500}
          />
        </div>

        <div className="col-span-6 flex flex-col justify-center mb-32 mt-8">
          <h2 className="text-midnightblue text-4xl sm:text-5xl font-semibold text-center lg:text-start lh-143">
            Promociones especiales: 1er aniversario
          </h2>
          <h3 className="text-black text-lg font-normal text-center lg:text-start lh-173 opacity-75 pt-3">
          ¡Felicidades a VET FAMILY por su 1 er año 🎉🎉
          </h3>
          <Link
            href="/blog/1er-aniversario-de-vet-family"
            className="text-electricblue text-lg font-medium flex gap-2 pt-4 mx-auto lg:mx-0"
          >
          Consulta nuestras promociones especiales:
            <Image
              src="/assets/people/arrow-right.svg"
              alt="arrow-right"
              width={24}
              height={24}
            />
          </Link>
          <Link
            href="/blog/concurso-especial-family-vet-1er-aniversario"
            className="text-electricblue text-lg font-medium flex gap-2 pt-4 mx-auto lg:mx-0"
          >
          Participa en nuestro concurso de aniversario:
            <Image
              src="/assets/people/arrow-right.svg"
              alt="arrow-right"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Specials;
