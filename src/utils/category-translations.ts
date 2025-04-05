import { InventoryCategory } from "@prisma/client";

// Traducciones base
export const CATEGORY_TRANSLATIONS: Record<InventoryCategory, string> = {
  ACCESSORY: "Accesorios",
  ANESTHETICS_SEDATIVES: "Anestésicos y Sedantes",
  ANTAGONISTS: "Antagonistas",
  ANTI_EMETIC: "Antieméticos",
  ANTI_INFLAMMATORY_ANALGESICS: "Antiinflamatorios y Analgésicos",
  ANTIBIOTIC: "Antibióticos",
  ANTIDIARRHEAL: "Antidiarreicos",
  ANTIFUNGAL: "Antimicóticos",
  ANTIHISTAMINE: "Antihistamínicos",
  ANTISEPTICS_HEALING: "Antisépticos y Cicatrizantes",
  APPETITE_STIMULANTS_HEMATOPOIESIS: "Estimulantes del Apetito y Hematopoyesis",
  BRONCHODILATOR: "Broncodilatadores",
  CARDIOLOGY: "Cardiología",
  CHIPS: "Microchips",
  CONSUMABLE: "Consumibles",
  CORTICOSTEROIDS: "Corticosteroides",
  DERMATOLOGY: "Dermatología",
  DEWORMERS: "Desparasitantes",
  DRY_FOOD: "Alimento Seco",
  ENDOCRINOLOGY_HORMONAL: "Endocrinología y Hormonales",
  EXPECTORANT: "Expectorantes",
  FOOD: "Alimentos",
  GASTROPROTECTORS_GASTROENTEROLOGY: "Gastroprotectores y Gastroenterología",
  IMMUNOSTIMULANT: "Inmunoestimulantes",
  LAXATIVES: "Laxantes",
  MEDICATED_SHAMPOO: "Shampoo Medicado",
  MEDICINE: "Medicamentos",
  NEPHROLOGY: "Nefrología",
  OINTMENTS: "Ungüentos y Pomadas",
  OPHTHALMIC: "Oftálmicos",
  OTIC: "Óticos",
  RESPIRATORY: "Sistema Respiratorio",
  SUPPLEMENTS_OTHERS: "Suplementos y Otros",
  SURGICAL_MATERIAL: "Material Quirúrgico",
  VACCINE: "Vacunas",
  WET_FOOD: "Alimento Húmedo"
} as const;

// Versión ordenada alfabéticamente (español)
export const ORDERED_CATEGORY_TRANSLATIONS = Object.fromEntries(
  Object.entries(CATEGORY_TRANSLATIONS)
    .sort(([, a], [, b]) => a.localeCompare(b, 'es'))
) as typeof CATEGORY_TRANSLATIONS;