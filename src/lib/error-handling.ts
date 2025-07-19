import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export interface StandardErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: string;
}

export interface StandardSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export type StandardResponse<T = unknown> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Standardized error codes for consistent error handling
 */
export const ErrorCodes = {
  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  
  // Authentication/Authorization errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  
  // Database errors
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  FOREIGN_KEY_CONSTRAINT: "FOREIGN_KEY_CONSTRAINT",
  UNIQUE_CONSTRAINT_VIOLATION: "UNIQUE_CONSTRAINT_VIOLATION",
  
  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

/**
 * Maps Prisma error codes to user-friendly messages
 */
export const PrismaErrorMessages = {
  P2002: "Este registro ya existe. Por favor, verifique los datos únicos.",
  P2003: "No se puede procesar debido a referencias de datos relacionados.",
  P2025: "El registro solicitado no fue encontrado.",
  P2014: "Los datos proporcionados violan las restricciones de la base de datos.",
  P2015: "No se encontró un registro relacionado requerido.",
  P2016: "Error en la consulta de la base de datos.",
  P2017: "Los registros están conectados por una relación requerida.",
  P2018: "Los registros requeridos para la conexión no fueron encontrados.",
  P2019: "Error de entrada en la base de datos.",
  P2020: "Valor fuera del rango permitido.",
  P2021: "La tabla especificada no existe en la base de datos.",
  P2022: "La columna especificada no existe en la base de datos.",
} as const;

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: string
): StandardErrorResponse {
  return {
    success: false,
    error: message,
    ...(code && { code }),
    ...(details && { details }),
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data?: T): StandardSuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
  };
}

/**
 * Handles Prisma errors and returns standardized error responses
 */
export function handlePrismaError(error: unknown, context?: string): StandardErrorResponse {
  if (error instanceof PrismaClientKnownRequestError) {
    const prismaCode = error.code as keyof typeof PrismaErrorMessages;
    const baseMessage = PrismaErrorMessages[prismaCode] || `Error de base de datos: ${error.code}`;
    
    let specificMessage: string = baseMessage;
    let errorCode: string = ErrorCodes.DATABASE_ERROR;
    
    // Handle specific constraint violations
    if (error.code === "P2002") {
      errorCode = ErrorCodes.UNIQUE_CONSTRAINT_VIOLATION;
      const constraintTarget = error.meta?.target;
      
      if (Array.isArray(constraintTarget)) {
        if (constraintTarget.includes('email')) {
          specificMessage = "Ya existe un usuario con este correo electrónico.";
        } else if (constraintTarget.includes('phone')) {
          specificMessage = "Ya existe un usuario con este número de teléfono.";
        } else if (constraintTarget.includes('internalId')) {
          specificMessage = "Ya existe una mascota con este ID interno.";
        } else if (constraintTarget.includes('kindeId')) {
          specificMessage = "Ya existe un usuario con este identificador.";
        }
      }
    } else if (error.code === "P2025") {
      errorCode = ErrorCodes.RECORD_NOT_FOUND;
    } else if (error.code === "P2003") {
      errorCode = ErrorCodes.FOREIGN_KEY_CONSTRAINT;
    }
    
    return createErrorResponse(
      specificMessage,
      errorCode,
      context ? `${context}: ${error.message}` : error.message
    );
  }
  
  // Handle general errors
  const message = error instanceof Error ? error.message : "Ha ocurrido un error inesperado";
  return createErrorResponse(
    message,
    ErrorCodes.INTERNAL_ERROR,
    context
  );
}

/**
 * Validates required fields and returns error if any are missing
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): StandardErrorResponse | null {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    return createErrorResponse(
      `Los siguientes campos son requeridos: ${missingFields.join(', ')}`,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      `Missing fields: ${missingFields.join(', ')}`
    );
  }
  
  return null;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic validation for Mexican numbers)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Mexican phone numbers: 10 digits or 12 digits with country code (52)
  return cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('52'));
}

/**
 * Sanitizes input by trimming whitespace and converting empty strings to null
 */
export function sanitizeInput(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

/**
 * Logs errors with consistent format
 */
export function logError(error: unknown, context: string, additionalData?: Record<string, unknown>): void {
  console.error(`[${context}] Error occurred:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    ...(additionalData && { additionalData }),
  });
} 