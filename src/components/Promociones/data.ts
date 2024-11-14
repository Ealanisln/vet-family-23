// promocionesData.ts

export interface Promocion {
    id: number;
    dia?: string;
    titulo: string;
    descripcion: string;
    descuento?: number;
    restricciones?: string;
    precio?: number;
    imagen: string;
  }
  
  export interface DatosPromociones {
    titulo: string;
    descripcion: string;
    promociones: Promocion[];
    promocionEspecial: Promocion;
    contacto: {
      telefono: string[];
      whatsapp: string[];
      direccion: string;
      redes: {
        facebook: string;
        instagram: string;
      };
      sitioWeb: string;
    };
  }
  
  export const promocionesData: DatosPromociones = {
    titulo: "Promociones de la Semana",
    descripcion: "Aprovecha nuestras ofertas especiales en servicios para el cuidado de tus mascotas.",
    promociones: [
      {
        id: 1,
        dia: "Lunes",
        titulo: "Baños",
        descripcion: "10% de descuento en cualquier tamaño o raza",
        descuento: 10,
        restricciones: "Promoción sobre precio de lista",
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/lunes_yqzuwz.png"
      },
      {
        id: 2,
        dia: "Martes",
        titulo: "Esterilizaciones",
        descripcion: "10% de descuento en esterilizaciones",
        descuento: 10,
        restricciones: "No aplicable en hembras gestantes o con piometra",
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/martes_pcqtgi.png"
      },
      {
        id: 3,
        dia: "Miércoles",
        titulo: "Consultas",
        descripcion: "10% de descuento en consultas",
        descuento: 10,
        restricciones: "No incluye tratamientos ni procedimientos",
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/miercoles_rgsgsl.png"
      },
      {
        id: 4,
        dia: "Jueves",
        titulo: "Vacunas",
        descripcion: "5% de descuento en vacunas",
        descuento: 5,
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/jueves_uf32gi.png"
      },
      {
        id: 5,
        dia: "Viernes",
        titulo: "Estéticas Caninas",
        descripcion: "Promoción especial",
        precio: 220,
        restricciones: "Aplican restricciones",
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/viernes_zrihm5.png"
      },
      {
        id: 6,
        dia: "Sábado",
        titulo: "Alimentos para perros y gatos",
        descripcion: "5% de descuento en alimentos para perros y gatos",
        descuento: 5,
        imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/sabado_us7mio.png"
      }
    ],
    promocionEspecial: {
      id: 7,
      titulo: "¡Promoción Especial!",
      descripcion: "Por cada 6 visitas de estética o baño, ¡OBTÉN LA 7MA GRATIS!",
      restricciones: "Cuidado premium para tu mejor amigo.",
      imagen: "https://res.cloudinary.com/dvf2zo2ee/image/upload/v1723926743/vet-for-family/promociones/baño-gratis_v97jg3.png"
    },
    contacto: {
      telefono: ["477-332-7152", "477-260-5743"],
      whatsapp: ["477-332-7152", "477-260-5743"],
      direccion: "Calle Poetas, 144. Col Panorama, León, Guanajuato",
      redes: {
        facebook: "@vet.family.23",
        instagram: "@vet.family.23"
      },
      sitioWeb: "vetforfamily.com"
    }
  };