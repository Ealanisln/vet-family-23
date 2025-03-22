"use client";

import sendEmail from "@/app/actions/email";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

// This matches the ContactFormInputs in your action
interface FormInputs {
  name: string;
  email: string;
  message: string;
}

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      await sendEmail(data);
      toast.success("Mensaje enviado exitosamente");
      
      // Clear form after successful submission
      reset();
    } catch (error) {
      toast.error(`Error al enviar mensaje: ${error}`);
    }
  };

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
                <form onSubmit={handleSubmit(onSubmit)}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="name"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Tú nombre
                      </label>
                      <input
                        {...register("name", { required: true })}
                        type="text"
                        placeholder="Escribe aquí tu nombre"
                        className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {errors.name && <span className="text-red-500 text-sm">Este campo es requerido</span>}
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Tú correo
                      </label>
                      <input
                        {...register("email", { 
                          required: true,
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Dirección de correo inválida"
                          }
                        })}
                        type="email"
                        placeholder="Escribe tu email"
                        className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {errors.email && (
                        <span className="text-red-500 text-sm">
                          {errors.email.message || "Este campo es requerido"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label
                        htmlFor="message"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Tú mensaje
                      </label>
                      <textarea
                        {...register("message", {
                          required: true,
                          maxLength: 500,
                        })}
                        rows={5}
                        placeholder="Aquí escribe tu mensaje"
                        className="w-full resize-none rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {errors.message && (
                        <span className="text-red-500 text-sm">
                          {errors.message.type === "required" ? "Este campo es requerido" : ""}
                          {errors.message.type === "maxLength" ? "El mensaje no puede exceder 500 caracteres" : ""}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">Max: 500 caracteres</span>
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <button
                      type="submit"
                      className="rounded-md bg-[#99d5d6] py-4 px-9 text-slate-800 font-medium transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp transform hover:scale-105"
                    >
                      Enviar mensaje
                    </button>
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