import React from "react";
import { LogoutLink, useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";

const AuthButton: React.FC = () => {
  const { isAuthenticated, user } = useKindeAuth();

  console.log(user);

  if (isAuthenticated) {
    return (
      <div className="flex items-center">
        <span className="text-lg text-blue font-medium mr-4">
          {user?.given_name || user?.email}
        </span>
        <LogoutLink className="text-dodgerblue text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-dodgerblue">
          Cerrar sesión
        </LogoutLink>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <LoginLink className="text-lg text-blue font-medium">
        Iniciar sesión
      </LoginLink>
      <RegisterLink className="text-dodgerblue text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-dodgerblue">
        Registrarse
      </RegisterLink>
    </div>
  );
};

export default AuthButton;
