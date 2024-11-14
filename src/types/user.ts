// types/user.ts
export interface User {
    id: string;
    kindeId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    phone: string | null;
    address: string | null;
    preferredContactMethod: string | null;
    pet: string | null;
    visits: number;
    nextVisitFree: boolean;
    lastVisit: Date | null;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
  }