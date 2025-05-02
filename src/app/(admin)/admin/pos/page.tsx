// src/app/(admin)/admin/pos/page.tsx

import { redirect } from "next/navigation";

export default function POSPage() {
  // Temporarily redirect to admin dashboard as POS functionality is disabled
  redirect("/admin");
}