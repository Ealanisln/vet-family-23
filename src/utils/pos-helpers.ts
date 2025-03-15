// src/utils/pos-helpers.ts
import { PrismaClient, InventoryCategory } from "@prisma/client";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CashTransaction, CashDrawer, TransactionType } from "../types/pos";

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
  // Obtenemos la fecha actual en formato YYMMDD
  const datePart = format(new Date(), "yyMMdd");
  
  // Contamos las ventas realizadas hoy para obtener un número secuencial
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
  
  // Incrementamos en 1 para el nuevo recibo y formateamos a 4 dígitos
  const sequentialNumber = (salesCount + 1).toString().padStart(4, "0");
  
  // Combinamos ambas partes
  return `${datePart}-${sequentialNumber}`;
}

/**
 * Formatea una fecha para mostrarla de manera amigable
 */
export function formatDateTime(date: Date, includeTime = true): string {
  if (!date) return "";
  
  const dateObj = new Date(date);
  
  // Para fechas recientes, usar términos relativos
  if (isToday(dateObj)) {
    return includeTime 
      ? `Hoy, ${format(dateObj, "HH:mm")}`
      : "Hoy";
  }
  
  if (isYesterday(dateObj)) {
    return includeTime 
      ? `Ayer, ${format(dateObj, "HH:mm")}`
      : "Ayer";
  }
  
  // Para otras fechas, formatear según la cercanía
  if (isThisWeek(dateObj)) {
    return includeTime 
      ? format(dateObj, "EEEE, HH:mm", { locale: es })
      : format(dateObj, "EEEE", { locale: es });
  }
  
  if (isThisMonth(dateObj)) {
    return includeTime
      ? format(dateObj, "d 'de' MMMM, HH:mm", { locale: es })
      : format(dateObj, "d 'de' MMMM", { locale: es });
  }
  
  // Para fechas más lejanas
  return includeTime
    ? format(dateObj, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    : format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea una cantidad monetaria
 */
export function formatCurrency(amount: number): string {
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
  const translations: Record<string, string> = {
    SALE: "Venta",
    REFUND: "Devolución",
    DEPOSIT: "Depósito",
    WITHDRAWAL: "Retiro",
    ADJUSTMENT: "Ajuste",
  };
  
  return translations[type] || type;
}

/**
 * Traduce los métodos de pago a español
 */
export function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    CASH: "Efectivo",
    CREDIT_CARD: "Tarjeta de crédito",
    DEBIT_CARD: "Tarjeta de débito",
    TRANSFER: "Transferencia",
    MOBILE_PAYMENT: "Pago móvil",
    MULTIPLE: "Pago mixto",
  };
  
  return translations[method] || method;
}

/**
 * Traduce las categorías de servicio a español
 */
export function translateServiceCategory(category: string): string {
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
  
  return translations[category] || category;
}

/**
 * Traduce las categorías de inventario a español
 */
export function translateInventoryCategory(category: InventoryCategory | string): string {
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
    DEWORMERS: "Antiparasitarios",
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
  
  return translations[category] || category;
}

/**
 * Traduce los estados de caja a español
 */
export function translateDrawerStatus(status: string): string {
  const translations: Record<string, string> = {
    OPEN: "Abierta",
    CLOSED: "Cerrada",
    RECONCILED: "Conciliada"
  };
  
  return translations[status] || status;
}

/**
 * Traduce los estados de venta a español
 */
export function translateSaleStatus(status: string): string {
  const translations: Record<string, string> = {
    PENDING: "Pendiente",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    REFUNDED: "Reembolsada"
  };
  
  return translations[status] || status;
}

/**
 * Calcula el total de ventas para una caja registradora
 */
export function calculateDrawerSalesTotal(transactions: CashTransaction[]): number {
  return transactions
    .filter(tx => tx.type === "SALE")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Calcula el total de devoluciones para una caja registradora
 */
export function calculateDrawerRefundsTotal(transactions: CashTransaction[]): number {
  return transactions
    .filter(tx => tx.type === "REFUND")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
}

/**
 * Calcula el total de entradas y salidas para una caja registradora
 */
export function calculateDrawerFlowTotal(transactions: CashTransaction[]): number {
  return transactions
    .filter(tx => tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Verifica si el usuario tiene permisos para usar el POS
 */
export async function userHasPOSPermission(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Buscar al usuario y sus roles
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!user || !user.userRoles) return false;
    
    return user.userRoles.some(ur => 
      ur.role.key === "ADMIN" || 
      ur.role.key === "CASHIER"
    );
  } catch (error) {
    console.error("Error checking POS permission:", error);
    return false;
  }
}

/**
 * Obtiene el balance actual de una caja registradora
 */
export function calculateDrawerBalance(drawer: CashDrawer | null): number {
  if (!drawer) return 0;
  
  const transactionsTotal = drawer.transactions.reduce((sum: number, tx: CashTransaction) => sum + tx.amount, 0);
  return drawer.initialAmount + transactionsTotal;
}