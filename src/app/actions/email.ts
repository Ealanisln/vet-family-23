"use server";

import sgMail from "@sendgrid/mail";

interface FormInputs {
  name: string;
  email: string;
  message: string;
}

const sendEmail = async (data: FormInputs) => {
  let body = `
      <p>Alguien te escribio un mensaje a través de la página web:</p>
    `;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key as keyof FormInputs]; // Assert key as keyof FormInputs
      body += `<p>${key}: ${value}</p>`;
    }
  }

  const msg = {
    to: ["vet.family.23@gmail.com", "contacto@vetforfamily.com"],
    from: "emmanuel@alanis.dev",
    subject: "Nuevo Mensaje - VetforFamily.com",
    html: body,
  };

  sgMail.setApiKey(process.env.SEND_API_KEY || "");

  try {
    await sgMail.send(msg);
    console.log("Message was sent successfully.");
    return "Message sent successfully";
  } catch (error) {
    throw new Error("Error sending email");
  }
};

export default sendEmail;
