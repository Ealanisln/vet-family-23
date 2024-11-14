// services/auth.ts
export async function renewKindeToken(): Promise<string> {
  try {
    const response = await fetch("/api/kinde-token");
    if (!response.ok) {
      throw new Error(`Failed to renew Kinde token: ${response.statusText}`);
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error renewing Kinde token:", error);
    throw error;
  }
}