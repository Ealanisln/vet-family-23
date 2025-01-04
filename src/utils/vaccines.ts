// utils/vaccines.ts
export const FELINE_VACCINES = [
    "TRIPLE_FELINA",
    "LEUCEMIA_FELINA",
    "RABIA_FELINA"
  ] as const;
  
  export const CANINE_VACCINES = [
    "DP_PUPPY",
    "DHPPI",
    "DHPPI_L",
    "DHPPI_RL",
    "BORDETELLA",
    "SEXTUPLE",
    "SEXTUPLE_R",
    "RABIES"
  ] as const;
  
  export type VaccineType = typeof CANINE_VACCINES[number] | typeof FELINE_VACCINES[number];
  
  export const isFelineVaccine = (vaccineType: VaccineType): boolean => {
    return FELINE_VACCINES.includes(vaccineType as any);
  };
  
  export const isCanineVaccine = (vaccineType: VaccineType): boolean => {
    return CANINE_VACCINES.includes(vaccineType as any);
  };