# Vet Family

**Vet Family** is a comprehensive management system for veterinary clinics. Built with **Next.js** using the App Router, **MongoDB**, **Prisma ORM**, and **TypeScript**, it helps clinics manage user profiles, pets, medical history, appointments, billing, and reminders efficiently.

## Features

- **User Management**: Track user details, including contact information, visit history, and reminders.
- **Pet Management**: Store detailed records of pets, including species, breed, vaccinations, medical history, and more.
- **Appointments**: Schedule and manage vet appointments, ensuring all visits are logged.
- **Billing System**: Keep track of payments, services, and payment statuses.
- **Reminders**: Set up and manage reminders for vaccinations, appointments, and follow-ups.
- **Multi-role Support**: Support for multiple user roles, such as clients and staff.

## Tech Stack

- **Next.js (App Router)** - React framework for building web applications.
- **MongoDB** - NoSQL database for storing app data.
- **Prisma ORM** - Provides an abstraction layer for the database.
- **TypeScript** - Typed JavaScript for better code maintainability and readability.

## Database Schema

The database is designed with **MongoDB** using **Prisma ORM** to handle complex relationships between users, pets, and their records.

### Models

#### `User`

- `kindeId`: Unique identifier from Kinde authentication.
- `email`, `firstName`, `lastName`, `phone`, `address`: Personal details of the user.
- `pet`: Stores the pet's information.
- `visits`: Number of visits, with a flag for a free visit.
- `visitHistory`: Linked visit history for the user.
- `pets`: List of pets owned by the user.
- `appointments`: List of scheduled appointments.
- `billings`: Billing history for the user.
- `reminders`: Reminders linked to the user.
- `roles`: Support for multiple roles.

#### `Pet`

- Stores details such as species, breed, weight, and medical history.
- Relationships with `User`, `MedicalHistory`, `Vaccinations`, `Appointments`, `Billings`, and `Reminders`.

#### `MedicalHistory`

- Tracks each visit's details, including reasons, diagnosis, treatment, prescriptions, and notes.

#### `Vaccination`

- Records details of vaccinations, including types, administration dates, and next doses.

#### `Appointment`

- Details of appointments, including reason and status.

#### `Billing`

- Manages billing records, including services, costs, and payment statuses.

#### `Reminder`

- Allows setting reminders for key events, like vaccinations and appointments.

#### `Staff`

- Tracks staff details such as name, position, and contact information.

## Getting Started

### Prerequisites

- **Node.js** v16+
- **MongoDB** instance
- Environment variables set up for **MongoDB URL** and other secrets.

### Installation

1. Clone the repository:

   ```
   bash
   
   
   Copy code
   git clone https://github.com/your-username/vet-family.git
   ```

2. Install dependencies:

   ```
   bash
   
   
   Copy code
   cd vet-family
   npm install
   ```

3. Set up environment variables in a `.env` file:

   ```
   perl
   
   
   Copy code
   DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase
   ```

4. Apply Prisma migrations:

   ```
   bash
   
   
   Copy code
   npx prisma migrate dev
   ```

5. Start the development server:

   ```
   bash
   
   
   Copy code
   npm run dev
   ```

## Contributing

Feel free to submit issues and pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.