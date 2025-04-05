// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import type { CartItem, PaymentMethod, SaleItemData } from '@/types/pos';

// Interfaces adicionales para el contexto del carrito
export interface CartClientProps {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface CartPetProps {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  userId: string;
  dateOfBirth?: Date;
  gender?: string;
  weight: number;         
  isNeutered: boolean;    
}
interface CartState {
  items: CartItem[];
  client: CartClientProps | null;
  pet: CartPetProps | null;
  paymentMethod: PaymentMethod | null;
  notes: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_CLIENT'; payload: CartClientProps | null }
  | { type: 'SET_PET'; payload: CartPetProps | null }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod | null }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setClient: (client: CartClientProps | null) => void;
  setPet: (pet: CartPetProps | null) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  
  // Método para obtener datos para la creación de venta
  getSaleData: (discount?: number) => {
    userId?: string;
    petId?: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod | null;
    notes: string;
    items: SaleItemData[];
  };
}

const initialState: CartState = {
  items: [],
  client: null,
  pet: null,
  paymentMethod: null,
  notes: '',
};

// Reducer para manejar las actualizaciones del estado
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.type === action.payload.type
      );

      if (existingItemIndex !== -1) {
        // El producto ya existe, incrementar cantidad
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      } else {
        // Agregar nuevo producto con cantidad 1
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'SET_CLIENT':
      return {
        ...state,
        client: action.payload,
      };

    case 'SET_PET':
      return {
        ...state,
        pet: action.payload,
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Valores calculados
  const subtotal = state.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );
  const taxRate = 0.16; // 16% de IVA
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Método para obtener datos estructurados para crear una venta
  const getSaleData = useCallback((discount: number = 0) => {
    return {
      userId: state.client?.id,
      petId: state.pet?.id,
      subtotal,
      tax,
      discount,
      total: total - discount,
      paymentMethod: state.paymentMethod,
      notes: state.notes,
      items: state.items.map(item => ({
        itemId: item.type === 'product' ? item.id : null,
        serviceId: item.type === 'service' ? item.id : null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    };
  }, [state.client, state.pet, subtotal, tax, total, state.paymentMethod, state.notes, state.items]);

  // Acciones envueltas en useCallback
  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, [dispatch]);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, [dispatch]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, [dispatch]);

  const setClient = useCallback((client: CartClientProps | null) => {
    dispatch({ type: 'SET_CLIENT', payload: client });
  }, [dispatch]);

  const setPet = useCallback((pet: CartPetProps | null) => {
    dispatch({ type: 'SET_PET', payload: pet });
  }, [dispatch]);

  const setPaymentMethod = useCallback((method: PaymentMethod | null) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, [dispatch]);

  const setNotes = useCallback((notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  }, [dispatch]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch]);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        setClient,
        setPet,
        setPaymentMethod,
        setNotes,
        clearCart,
        subtotal,
        tax,
        total,
        getSaleData
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};