import { InventoryCategory } from "@prisma/client";

// category-translations.ts
export const CATEGORY_TRANSLATIONS: Record<InventoryCategory, string> = {
    MEDICINE: "Medicina",
    SURGICAL_MATERIAL: "Material Quirúrgico",
    VACCINE: "Vacuna",
    FOOD: "Alimento",
    ACCESSORY: "Accesorio",
    CONSUMABLE: "Consumible",
    ANTI_INFLAMMATORY_ANALGESICS: "Antiinflamatorios/Analgésicos",
    ANTIBIOTIC: "Antibiótico",
    ANTIFUNGAL: "Antimicótico",
    DEWORMERS: "Desparasitantes",
    GASTROPROTECTORS_GASTROENTEROLOGY: "Protectores gástricos/Gastroenterología",
    CARDIOLOGY: "Cardiología",
    DERMATOLOGY: "Dermatología",
    ENDOCRINOLOGY_HORMONAL: "Endocrinología/Hormonales",
    ANESTHETICS_SEDATIVES: "Anestésicos y sedantes",
    OTIC: "Óticos",
    OINTMENTS: "Ungüentos/Pomadas",
    RESPIRATORY: "Respiratorio",
    OPHTHALMIC: "Oftálmico",
    DRY_FOOD: "Alimento Seco",
    WET_FOOD: "Alimento Húmedo",
    CHIPS: "Chips",
    ANTI_EMETIC: "Antihemético",
    ANTISEPTICS_HEALING: "Cicatrizantes/antisépticos",
    NEPHROLOGY: "Nefrología",
    ANTAGONISTS: "Antagonistas",
    IMMUNOSTIMULANT: "Inmunoestimulante",
    APPETITE_STIMULANTS_HEMATOPOIESIS: "Estimulantes de apetito y Hematopoyesis",
    SUPPLEMENTS_OTHERS: "Suplementos y otros",
  } as const;