import { InventoryCategory } from "@prisma/client";

// Traducciones base
export const CATEGORY_TRANSLATIONS: Record<InventoryCategory, string> = {
  ACCESSORY: "Accesorio",
  ANESTHETICS_SEDATIVES: "Anestésicos y sedantes",
  ANTAGONISTS: "Antagonistas",
  ANTI_EMETIC: "Antihemético",
  ANTI_INFLAMMATORY_ANALGESICS: "Antiinflamatorios/Analgésicos",
  ANTIBIOTIC: "Antibiótico",
  ANTIDIARRHEAL: "Antidiarreico",
  ANTIFUNGAL: "Antimicótico",
  ANTIHISTAMINE: "Antihistamínico",
  ANTISEPTICS_HEALING: "Cicatrizantes/antisépticos",
  APPETITE_STIMULANTS_HEMATOPOIESIS: "Estimulantes de apetito y Hematopoyesis",
  BRONCHODILATOR: "Broncodilatador",
  CARDIOLOGY: "Cardiología",
  CHIPS: "Chips",
  CONSUMABLE: "Consumible",
  CORTICOSTEROIDS: "Corticoides",
  DERMATOLOGY: "Dermatología",
  DEWORMERS: "Desparasitantes",
  DRY_FOOD: "Alimento Seco",
  ENDOCRINOLOGY_HORMONAL: "Endocrinología/Hormonales",
  EXPECTORANT: "Expectante",
  FOOD: "Alimento",
  GASTROPROTECTORS_GASTROENTEROLOGY: "Protectores gástricos/Gastroenterología",
  IMMUNOSTIMULANT: "Inmunoestimulante",
  LAXATIVES: "Laxante",
  MEDICATED_SHAMPOO: "Shampoo",
  MEDICINE: "Medicina",
  NEPHROLOGY: "Nefrología",
  OINTMENTS: "Ungüentos/Pomadas",
  OPHTHALMIC: "Oftálmico",
  OTIC: "Óticos",
  RESPIRATORY: "Respiratorio",
  SUPPLEMENTS_OTHERS: "Suplementos y otros",
  SURGICAL_MATERIAL: "Material Quirúrgico",
  VACCINE: "Vacuna",
  WET_FOOD: "Alimento Húmedo"
} as const;

// Versión ordenada alfabéticamente (español)
export const ORDERED_CATEGORY_TRANSLATIONS = Object.fromEntries(
  Object.entries(CATEGORY_TRANSLATIONS)
    .sort(([, a], [, b]) => a.localeCompare(b, 'es'))
) as typeof CATEGORY_TRANSLATIONS;