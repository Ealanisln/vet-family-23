"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Mail, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import sendEmail from "@/app/actions/email";

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
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      await sendEmail(data);
      toast.success("Mensaje enviado exitosamente", {
        style: {
          borderRadius: '10px',
          background: '#14B8A6',
          color: '#fff',
        },
      });
      
      // Clear form after successful submission
      reset();
    } catch (error) {
      toast.error(`Error al enviar mensaje: ${error}`, {
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  return (
    <>
      <section 
        className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-20 md:py-24" 
        id="contacto"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.15),transparent)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent)]"></div>
        </div>

        <div className="relative container mx-auto px-6 max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-teal-100/80 backdrop-blur-sm rounded-full border border-teal-200/50">
              <Mail className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Contáctanos</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                Envíanos un Mensaje
              </span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
              Si necesitas alguna cita, tienes alguna duda o comentario, 
              escribenos un mensaje y te contáctaremos a la brevedad.
            </p>
          </motion.div>

          <motion.div
            className="relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Decorative background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-xl -z-10" />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-800"
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    Tu nombre
                  </label>
                  <div className="relative">
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      placeholder="Escribe aquí tu nombre"
                      className="w-full px-6 py-4 text-gray-800 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 placeholder-gray-500"
                    />
                    {!errors.name && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-green-500 opacity-0 transition-opacity duration-300" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <motion.span 
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Este campo es requerido
                    </motion.span>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-800"
                  >
                    <Mail className="w-4 h-4 text-teal-600" />
                    Tu correo
                  </label>
                  <div className="relative">
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
                      className="w-full px-6 py-4 text-gray-800 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 placeholder-gray-500"
                    />
                  </div>
                  {errors.email && (
                    <motion.span 
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email.message || "Este campo es requerido"}
                    </motion.span>
                  )}
                </motion.div>
              </div>

              {/* Message Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label
                  htmlFor="message"
                  className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-800"
                >
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Tu mensaje
                </label>
                <div className="relative">
                  <textarea
                    {...register("message", {
                      required: true,
                      maxLength: 500,
                    })}
                    rows={6}
                    placeholder="Aquí escribe tu mensaje"
                    className="w-full px-6 py-4 text-gray-800 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-300 placeholder-gray-500 resize-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  {errors.message && (
                    <motion.span 
                      className="text-red-500 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.message.type === "required" ? "Este campo es requerido" : ""}
                      {errors.message.type === "maxLength" ? "El mensaje no puede exceder 500 caracteres" : ""}
                    </motion.span>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">Max: 500 caracteres</span>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="flex justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        <span>Enviar mensaje</span>
                      </>
                    )}
                  </div>
                </button>
              </motion.div>
            </form>

            {/* Additional Info */}
            <motion.div
              className="mt-8 p-6 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border border-teal-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Respuesta rápida garantizada</h4>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Nos comprometemos a responder tu mensaje en un máximo de 24 horas. 
                <span className="text-teal-600 font-medium"> Para emergencias</span>, llámanos directamente.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Toaster position="top-right" />
    </>
  );
};

export default Form;