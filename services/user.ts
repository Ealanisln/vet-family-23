// services/user.ts
import { getUsers } from "@/app/actions/get-customers";
import { User } from "../types/user";
import { renewKindeToken } from "./auth";

export async function deleteUser(userId: string): Promise<void> {
  let token = await renewKindeToken();
  
  const makeDeleteRequest = async (token: string) => {
    const response = await fetch(`/api/user/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, isDeleteProfile: true }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  };

  try {
    await makeDeleteRequest(token);
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      token = await renewKindeToken();
      await makeDeleteRequest(token);
    } else {
      throw error;
    }
  }
}

export async function fetchUsers(): Promise<User[]> {
  const token = await renewKindeToken();
  const users = await getUsers(token);
  
  return users.map((user: any) => ({
    id: user.id,
    kindeId: user.kindeId,
    email: user.email || null,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    name: user.name || null,
    phone: user.phone || null,
    address: user.address || null,
    preferredContactMethod: user.preferredContactMethod || null,
    pet: user.pet || null,
    visits: user.visits || 0,
    nextVisitFree: user.nextVisitFree || false,
    lastVisit: user.lastVisit ? new Date(user.lastVisit) : null,
    roles: user.roles || [],
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }));
}
