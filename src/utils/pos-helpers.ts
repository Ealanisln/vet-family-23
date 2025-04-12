// src/utils/pos-helpers.ts
import { PrismaClient, InventoryCategory } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// Asegúrate que estas importaciones sean correctas respecto a la ubicación real de tus tipos
import { Transaction, CashDrawer, TransactionType, PaymentMethod } from "../types/pos"; // Changed CashTransaction to Transaction

// Implement a singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
const prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

/**
 * Genera un número de recibo único basado en la fecha y un contador incremental
 */
export async function generateReceiptNumber(): Promise<string> {
  const datePart = format(new Date(), "yyMMdd");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const salesCount = await prisma.sale.count({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const sequentialNumber = (salesCount + 1).toString().padStart(4, "0");
  return `${datePart}-${sequentialNumber}`;
}

/**
 * Formatea una fecha para mostrarla de manera amigable
 */
export function formatDateTime(date: Date | string | undefined | null, includeTime = true): string {
  if (!date) return "";
  let dateObj: Date;
  try {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
    }
  } catch (e) {
    return "Fecha inválida";
  }

  // Siempre mostrar la fecha y hora completas, eliminando la lógica relativa
  const formatString = includeTime
    ? "d 'de' MMMM 'de' yyyy, HH:mm"
    : "d 'de' MMMM 'de' yyyy";
  
  return format(dateObj, formatString, { locale: es });
}

/**
 * Formatea una cantidad monetaria
 */
export function formatCurrency(amount: number | undefined | null): string {
  // Añadida validación para undefined/null
  if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0; // O podrías retornar un string como "-", "$0.00" o ""
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Traduce los tipos de transacción a español
 */
export function translateTransactionType(type: TransactionType | string): string {
  // Es buena idea manejar el caso de que 'type' sea undefined o null
  if (!type) return "";
  const translations: Record<string, string> = {
    SALE: "Venta",
    REFUND: "Devolución",
    DEPOSIT: "Depósito",
    WITHDRAWAL: "Retiro",
    ADJUSTMENT: "Ajuste",
  };
  // Convertir a mayúsculas para asegurar coincidencia si viene en minúsculas
  const upperType = typeof type === 'string' ? type.toUpperCase() : type;
  return translations[upperType] || upperType;
}

/**
 * Traduce los métodos de pago a español
 */
export function translatePaymentMethod(method: PaymentMethod | string): string {
  if (!method) return "";
  const translations: Record<string, string> = {
    CASH: "Efectivo",
    CREDIT_CARD: "Tarjeta de crédito",
    DEBIT_CARD: "Tarjeta de débito",
    TRANSFER: "Transferencia",
    MULTIPLE: "Pago mixto",
  };
  const upperMethod = typeof method === 'string' ? method.toUpperCase() : method;
  return translations[upperMethod] || upperMethod;
}

/**
 * Traduce las categorías de servicio a español
 */
export function translateServiceCategory(category: string): string {
  if (!category) return "";
  const translations: Record<string, string> = {
    CONSULTATION: "Consulta",
    SURGERY: "Cirugía",
    VACCINATION: "Vacunación",
    GROOMING: "Estética",
    DENTAL: "Dental",
    LABORATORY: "Laboratorio",
    IMAGING: "Imagenología",
    HOSPITALIZATION: "Hospitalización",
    OTHER: "Otros",
  };
   const upperCategory = category.toUpperCase();
  return translations[upperCategory] || upperCategory;
}

/**
 * Traduce las categorías de inventario a español
 */
export function translateInventoryCategory(category: InventoryCategory | string): string {
  if (!category) return "";
  const translations: Record<string, string> = {
    ACCESSORY: "Accesorios",
    ANESTHETICS_SEDATIVES: "Anestésicos/Sedantes",
    ANTAGONISTS: "Antagonistas",
    ANTI_EMETIC: "Antieméticos",
    ANTI_INFLAMMATORY_ANALGESICS: "Antiinflamatorios/Analgésicos",
    ANTIBIOTIC: "Antibióticos",
    ANTIDIARRHEAL: "Antidiarreicos",
    ANTIFUNGAL: "Antifúngicos",
    ANTIHISTAMINE: "Antihistamínicos",
    ANTISEPTICS_HEALING: "Antisépticos",
    APPETITE_STIMULANTS_HEMATOPOIESIS: "Estimulantes del apetito",
    BRONCHODILATOR: "Broncodilatadores",
    CARDIOLOGY: "Cardiología",
    CHIPS: "Microchips",
    CONSUMABLE: "Consumibles",
    CORTICOSTEROIDS: "Corticosteroides",
    DERMATOLOGY: "Dermatología",
    DEWORMERS: "Desparasitantes",
    DRY_FOOD: "Alimento seco",
    ENDOCRINOLOGY_HORMONAL: "Endocrinología",
    EXPECTORANT: "Expectorantes",
    FOOD: "Alimentos",
    GASTROPROTECTORS_GASTROENTEROLOGY: "Gastroprotectores",
    IMMUNOSTIMULANT: "Inmunoestimulantes",
    LAXATIVES: "Laxantes",
    MEDICATED_SHAMPOO: "Shampoo medicado",
    MEDICINE: "Medicamentos",
    NEPHROLOGY: "Nefrología",
    OINTMENTS: "Ungüentos",
    OPHTHALMIC: "Oftálmicos",
    OTIC: "Óticos",
    RESPIRATORY: "Respiratorios",
    SUPPLEMENTS_OTHERS: "Suplementos y otros",
    SURGICAL_MATERIAL: "Material quirúrgico",
    VACCINE: "Vacunas",
    WET_FOOD: "Alimento húmedo"
  };
  const upperCategory = typeof category === 'string' ? category.toUpperCase() : category;
  return translations[upperCategory] || upperCategory;
}

/**
 * Traduce los estados de caja a español
 */
export function translateDrawerStatus(status: string): string {
  if (!status) return "";
  const translations: Record<string, string> = {
    OPEN: "Abierta",
    CLOSED: "Cerrada",
    RECONCILED: "Conciliada"
  };
  const upperStatus = status.toUpperCase();
  return translations[upperStatus] || upperStatus;
}

/**
 * Traduce los estados de venta a español
 */
export function translateSaleStatus(status: string): string {
  if (!status) return "";
  const translations: Record<string, string> = {
    PENDING: "Pendiente",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    REFUNDED: "Reembolsada"
  };
  const upperStatus = status.toUpperCase();
  return translations[upperStatus] || upperStatus;
}

/**
 * Calcula el total de ventas para una caja registradora
 */
export function calculateDrawerSalesTotal(transactions: Transaction[]): number {
  if (!transactions) return 0;
  return transactions
    .filter(tx => tx.type === "SALE")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0); // Añadido fallback para amount
}

/**
 * Calcula el total de devoluciones para una caja registradora
 */
export function calculateDrawerRefundsTotal(transactions: Transaction[]): number {
  if (!transactions) return 0;
  return transactions
    .filter(tx => tx.type === "REFUND")
    // El monto en devoluciones suele ser negativo, Math.abs lo hace positivo para sumar el total devuelto
    .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
}

/**
 * Calcula el total de entradas (Depósitos) y salidas (Retiros) netas para una caja registradora
 */
export function calculateDrawerFlowTotal(transactions: Transaction[]): number {
    if (!transactions) return 0;
    return transactions
        // Filtra solo depósitos y retiros
        .filter(tx => tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL")
        // Suma los montos (depósitos son positivos, retiros negativos)
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
}


/**
 * Verifica si el usuario tiene permisos para usar el POS
 * Esta función debe usarse SOLO en el servidor (Server Components o Server Actions)
 */
export async function userHasPOSPermission(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const user = await prisma.user.findUnique({
      where: {
        // Asegúrate que kindeId es el campo correcto para buscar por el ID de Kinde
        kindeId: userId
      },
      include: {
        userRoles: {
          include: {
            role: true // Asegúrate que la relación se llama 'role' y tiene una propiedad 'key'
          }
        }
      }
    });

    if (!user || !user.userRoles) return false;

    // Usa minúsculas consistentemente
    return user.userRoles.some(ur =>
      ur.role?.key === "admin" || // Añadida comprobación opcional por si role es null
      ur.role?.key === "cashier"
    );
  } catch (error) {
    console.error("Error checking POS permission:", error);
    return false;
  }
}

// Para componentes del lado del cliente, crear una versión alternativa
// que se pueda usar con los roles de usuario ya obtenidos del contexto de Kinde
// CORREGIDO: Usa minúsculas para consistencia con la función de servidor
export function hasClientPOSPermission(userRoles: Array<{key: string}> | undefined | null): boolean {
  // Añadida validación para roles undefined/null
  if (!userRoles || userRoles.length === 0) return false;

  // Usa minúsculas aquí también
  // ¡¡¡ VERIFICA que Kinde te dé las claves en minúsculas !!!
  return userRoles.some(role =>
    role.key === "admin" ||
    role.key === "cashier"
  );
}

/**
 * Obtiene el balance actual de una caja registradora
 */
export function calculateDrawerBalance(drawer: CashDrawer | null | undefined): number {
  if (!drawer) return 0;

  // Suma todos los montos de las transacciones
  const transactionsTotal = drawer.transactions?.reduce((sum: number, tx: Transaction) => sum + (tx.amount || 0), 0) ?? 0;
  // Suma el monto inicial al total de transacciones
  return (drawer.initialAmount || 0) + transactionsTotal;
}

// Cerrar la conexión de Prisma cuando la aplicación se detenga (opcional pero recomendado)
// Esto generalmente se maneja en un archivo principal de la aplicación o en hooks de ciclo de vida del servidor.
// async function onShutdown() {
//   await prisma.$disconnect();
// }
// process.on('SIGINT', onShutdown);
// process.on('SIGTERM', onShutdown);