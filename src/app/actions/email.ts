"use server";

import sgMail from "@sendgrid/mail";

// Base interface for common fields
interface BaseFormInputs {
  name: string;
  email: string;
}

// Interface for pet hotel reservations
interface HotelReservationInputs extends BaseFormInputs {
  petName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  sextuple: string;
  bordetella: string;
  despInterna: string;
  despExterna: string;
  notes: string;
}

// Interface for regular contact form
interface ContactFormInputs extends BaseFormInputs {
  message: string;
}

// Union type to accept either form type
type FormInputs = HotelReservationInputs | ContactFormInputs;

// Type guard to check if it's a hotel reservation
function isHotelReservation(data: FormInputs): data is HotelReservationInputs {
  return 'petName' in data && 'checkIn' in data && 'checkOut' in data;
}

const sendEmail = async (data: FormInputs) => {
  // Determine which type of form was submitted
  const isHotelForm = isHotelReservation(data);
  
  // Set up email content based on form type
  let subject = isHotelForm 
    ? "Nueva Reserva de Hotel para Mascotas - VetforFamily.com"
    : "Nuevo Mensaje de Contacto - VetforFamily.com";
  
  let body = "";
  
  if (isHotelForm) {
    // Hotel reservation email
    body = `
      <h2>Nueva Reserva de Hotel para Mascotas</h2>
      <p>Se ha recibido una nueva solicitud de reserva:</p>
    `;
    
    const fieldLabels: Record<keyof HotelReservationInputs, string> = {
      name: "Nombre del dueño",
      petName: "Nombre de la mascota", 
      email: "Correo electrónico",
      phone: "Teléfono",
      checkIn: "Fecha de entrada",
      checkOut: "Fecha de salida",
      sextuple: "Fecha vacuna Séxtuple",
      bordetella: "Fecha vacuna Bordetella",
      despInterna: "Fecha desparasitación interna",
      despExterna: "Fecha desparasitación externa",
      notes: "Notas adicionales"
    };

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key as keyof HotelReservationInputs];
        if (value) { // Solo incluye campos con valor
          body += `<p><strong>${fieldLabels[key as keyof HotelReservationInputs]}:</strong> ${value}</p>`;
        }
      }
    }
  } else {
    // Regular contact form email
    body = `
      <h2>Nuevo Mensaje de Contacto</h2>
      <p>Se ha recibido un nuevo mensaje desde el formulario de contacto:</p>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Mensaje:</strong> ${data.message}</p>
    `;
  }

  const msg = {
    to: ["vet.family.23@gmail.com"],
    from: "emmanuel@alanis.dev",
    subject,
    html: body,
  };

  sgMail.setApiKey(process.env.SEND_API_KEY || "");

  try {
    await sgMail.send(msg);
    return "Mensaje enviado exitosamente";
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Error al enviar el correo: ${error}`);
  }
};

export default sendEmail;