import React from 'react';
import Link from 'next/link';
import { PawPrint, Cat, Dog, Bird, LucideIcon } from 'lucide-react';

interface AnimalIconProps {
  Icon: LucideIcon;
}

const AnimalIcon: React.FC<AnimalIconProps> = ({ Icon }) => (
  <div className="absolute animate-bounce">
    <Icon className="w-6 h-6 text-blue-400" />
  </div>
);

const Custom404: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute top-10 left-10">
        <AnimalIcon Icon={Cat} />
      </div>
      <div className="absolute top-20 right-20">
        <AnimalIcon Icon={Dog} />
      </div>
      <div className="absolute bottom-20 left-20">
        <AnimalIcon Icon={Bird} />
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative z-10 transform transition duration-500 hover:scale-105">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping"></div>
            <PawPrint className="w-20 h-20 text-blue-500 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-6">Error 404</h1>
        <p className="text-md text-gray-600 mb-4">
          Lo sentimos, la página que busca no se encuentra disponible.
        </p>
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Por favor, verifique la URL o intente navegar a través de nuestro menú principal.
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg text-sm"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
      
      <div className="mt-6 text-gray-600 bg-white bg-opacity-50 p-3 rounded-lg shadow">
        <p className="text-sm">Para asistencia, contáctenos:</p>
        <p className="text-sm">Calle Poetas, 144. Col Panorama, León, Guanajuato</p>
        <p className="font-semibold text-sm">Tel: 477-332-7152 / 477-260-5743</p>
      </div>
    </div>
  );
}

export default Custom404;