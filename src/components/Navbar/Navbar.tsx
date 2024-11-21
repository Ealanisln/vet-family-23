// components/Navbar/Navbar.tsx
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import AuthButton from "./Signdialog";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Promociones", href: "/promociones", current: true },
  { name: "Servicios", href: "#servicios", current: false },
  { name: "Blog", href: "/blog", current: false },
  { name: "Contacto", href: "#contacto", current: false },
  { name: "Ubicación", href: "#ubicacion", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-20 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/">
                  <div className="flex-shrink-0">
                    <Image
                      height={800}
                      width={200}
                      className="h-12 w-40"
                      src="/assets/logo/logo.png"
                      alt="Vet Family logo"
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop menu */}
              <div className="hidden lg:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        "px-3 py-4 text-lg font-normal text-black hover:opacity-75 transition-opacity"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Auth button - desktop */}
              <div className="hidden lg:block">
                <AuthButton />
              </div>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-black/10">
                  <span className="sr-only">Abrir menú principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <Disclosure.Panel className="lg:hidden bg-[#E5F5F5]">
            <div className="space-y-1 px-4 pb-4 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    "block px-3 py-2 text-base font-medium text-black hover:bg-black/10 rounded-md"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <div className="pt-2">
                <AuthButton />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
