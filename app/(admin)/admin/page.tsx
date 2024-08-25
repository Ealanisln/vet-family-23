import React from 'react';
import { 
  Bone, UserPlus, UserCog, Stethoscope, Dog, Building2, FileText, 
  ClipboardList, AlertTriangle, Key, Cpu
} from 'lucide-react';

interface MenuItemProps {
  icon: React.ElementType;
  text: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
    <Icon className="w-10 h-10 text-blue-500 mb-2" />
    <span className="text-sm text-center">{text}</span>
  </div>
);

const AdminDashboard: React.FC = () => {
  const menuItems = [
    { icon: Bone, text: 'Datos de la Clínica Veterinaria / Actualización de Datos' },
    { icon: UserPlus, text: 'Alta de Propietarios' },
    { icon: UserCog, text: 'Actualización de Datos de Propietarios' },
    { icon: Stethoscope, text: 'Alta de Veterinarios Secundarios' },
    { icon: Dog, text: 'Alta de Mascotas' },
    { icon: Dog, text: 'Actualización de Datos de Mascotas' },
    { icon: Stethoscope, text: 'Actualización de Datos de Veterinarios Secundarios' },
    { icon: Building2, text: 'Alta de Sucursales' },
    { icon: Building2, text: 'Actualización de Sucursales' },
    { icon: FileText, text: 'Generación de Carta de Aplicación' },
    { icon: ClipboardList, text: 'Reporte de Lectura' },
    { icon: AlertTriangle, text: 'Reporte de Problema' },
    { icon: Key, text: 'Cambio de Contraseña' },
    { icon: Cpu, text: 'Consulta de Chips' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Bienvenido Mayra Montserrat Castillo Aboytes</h1>
      <p className="text-center mb-8">Para comenzar, escoge la opción que necesites verificar</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {menuItems.map((item, index) => (
          <MenuItem key={index} icon={item.icon} text={item.text} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;