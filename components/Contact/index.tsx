"use client";

import React, { ChangeEvent, FormEvent, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export interface FormProps {
  result: boolean;
  isChecked: boolean;
  callTime: { time: string; isChecked: boolean }[];

  loading: boolean;
}

const Form: React.FC<FormProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function sendEmail(event: FormEvent) {
    event.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData();

      if (!name.trim()) {
        throw new Error("Por favor ingresa un nombre válido.");
      }

      if (!email.trim()) {
        throw new Error("Por favor ingresa un correo válido.");
      }

      if (!message.trim()) {
        throw new Error("Por favor ingresa un mensaje válido.");
      }

      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);

      const response = await fetch("/api/nodemailer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }), // Serialize JSON
      });

      const responseData = await response.json();

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      toast.success(
        "Hemos recibido tu mensaje, nos pondremos en contacto pronto."
      );

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error(String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-center" key="contact-1" id="contacto">
        <section className="overflow-hidden py-4 md:py-8">
          <div className="container">
            <div className="mx-8 flex flex-wrap">
              <div
                className="wow fadeInUp mb-12 rounded-md"
                data-wow-delay=".15s"
              >
                <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                  Contáctanos
                </h2>
                <div className="mb-12 text-base font-medium text-body-color">
                  Si necesitas alguna cita, tienes alguna duda o comentario
                  escribenos un mensaje y te contáctaremos a la brevedad.
                </div>
                <form onSubmit={sendEmail}>
                  <div className="-mx-4 flex flex-wrap">
                    <div className="w-full px-4 md:w-1/2">
                      <div className="mb-8">
                        <label
                          htmlFor="name"
                          className="mb-3 block text-sm font-medium text-dark dark:text-white"
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full rounded-md border border-transparent py-3 px-6 text-base text-slate-800 placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none bg-[#99d5d6]"
                          value={name}
                          onChange={({ target }: ChangeEvent) =>
                            setName((target as HTMLInputElement).value)
                          }
                        />
                      </div>
                    </div>
                    <div className="w-full px-4 md:w-1/2">
                      <div className="mb-8">
                        <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="w-full rounded-md border border-transparent py-3 px-6 text-base text-slate-600 placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none bg-[#99d5d6] dark:shadow-signUp"
                          pattern=".+@.+\..+"
                          value={email}
                          onChange={({ target }: ChangeEvent) =>
                            setEmail((target as HTMLInputElement).value)
                          }
                        />
                      </div>
                    </div>
                    <div className="w-full px-4">
                      <div className="mb-8">
                        <label>
                          Mensaje&nbsp;
                          <span className="text-xs">(max 1000 caracteres)</span>
                        </label>

                        <textarea
                          name="message"
                          rows={6}
                          required
                          value={message}
                          maxLength={1000}
                          className="w-full resize-none rounded-md border border-transparent py-3 px-6 text-base text-slate-800 placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none bg-[#99d5d6] dark:shadow-signUp"
                          onChange={({ target }: ChangeEvent) =>
                            setMessage((target as HTMLInputElement).value)
                          }
                        ></textarea>
                      </div>
                    </div>
                    <div className="w-full px-4">
                      <input
                        className="rounded-md bg-[#99d5d6] py-4 px-9 text-gray-600 font-medium transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp transform hover:scale-105"
                        type="submit"
                        value="Enviar"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Toaster />
    </>
  );
};

export default Form;
