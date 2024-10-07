// app/admin/register/page.tsx
import UserRegistrationForm from "@/components/User/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Registrar nuevo usuario</h1>
      <UserRegistrationForm />
    </div>
  );
}
