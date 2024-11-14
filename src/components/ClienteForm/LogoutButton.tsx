'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return <Button onClick={handleLogout}>Cerrar sesión</Button>;
}