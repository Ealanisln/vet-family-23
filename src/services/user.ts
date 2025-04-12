// services/user.ts
import { getUsers } from "@/app/actions/get-customers"; // getUsers is from server actions
import { User } from "../types/user";                // This is your client-side/service User type
import { renewKindeToken } from "./auth";
// Import the Role type if needed for mapping, assuming it's exported or defined accessibly
// Alternatively, rely on the structure known from get-customers.ts
// import { Role } from '@prisma/client'; // Or wherever Role type is defined if needed explicitly

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

    if (response.status === 401) { // More specific check for 401
        throw new Error('Unauthorized: 401');
    }
    if (!response.ok) {
      // Attempt to read error message from response body if possible
      let errorBody = '';
      try {
          errorBody = await response.text();
      } catch (_) { /* ignore */ }
      throw new Error(`Failed to delete user: ${response.status} ${response.statusText}. ${errorBody}`);
    }
  };

  try {
    await makeDeleteRequest(token);
  } catch (error) {
    // Check specifically for the 401 error thrown above
    if (error instanceof Error && error.message.includes('Unauthorized: 401')) {
      console.log("Token expired or invalid, renewing and retrying delete...");
      token = await renewKindeToken(); // Renew token
      await makeDeleteRequest(token); // Retry request
    } else {
      console.error("Error deleting user:", error); // Log other errors
      throw error; // Re-throw other errors
    }
  }
}

export async function fetchUsers(): Promise<User[]> {
  // Removed: const token = await renewKindeToken(); - Not needed for getUsers server action

  // Call getUsers without the token argument
  const usersFromAction = await getUsers(); // Type is inferred as UserWithRoles[]

  // Map the result (UserWithRoles[]) to your desired User[] type
  // Remove ': any' - TypeScript infers 'user' type correctly here as UserWithRoles
  return usersFromAction.map((user) => ({
    id: user.id,
    kindeId: user.kindeId,
    email: user.email || null,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    // Assuming name might not exist on Prisma model directly unless added, use firstName/lastName
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
    phone: user.phone || null,
    address: user.address || null,
    // Assuming preferredContactMethod might not exist on Prisma model
    preferredContactMethod: user.preferredContactMethod || null, // Ensure this field exists on UserWithRoles or remove/adjust
    // Assuming pet might not exist on Prisma model
    pet: user.pet || null, // Ensure this field exists on UserWithRoles or remove/adjust
    visits: user.visits || 0,
    nextVisitFree: user.nextVisitFree || false,
    lastVisit: user.lastVisit ? new Date(user.lastVisit) : null,
    // Map the Role objects to role keys (strings) as expected by types/user.ts User interface
    // Ensure the Role object returned by Prisma/getUsers has a 'key' property
    roles: user.roles ? user.roles.map(role => role.key) : [], // Adjust 'role.key' if your Role model uses a different property (e.g., 'name')
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }));
}