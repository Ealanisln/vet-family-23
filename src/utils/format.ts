// utils/format.ts
export const formatPhoneNumber = (phone: string | null): string => {
    if (!phone) return "N/A";
    const digits = phone.replace(/\D/g, "");
    const last10Digits = digits.slice(-10);
    return last10Digits.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };