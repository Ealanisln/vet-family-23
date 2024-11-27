# Vet Family

**Vet Family** is a comprehensive management system for veterinary clinics. Built with **Next.js** using the App Router, **MongoDB**, **Prisma ORM**, and **TypeScript**, it helps clinics manage user profiles, pets, medical history, appointments, billing, reminders, and inventory efficiently.

## Features

* **User Management**: Track user details, including contact information, visit history, and reminders.
* **Pet Management**: Store detailed records of pets, including species, breed, vaccinations, medical history, and more.
* **Advanced Vaccination System**: Manage detailed vaccination records with scheduling, tracking, and automated reminders.
* **Appointments**: Schedule and manage vet appointments, ensuring all visits are logged.
* **Billing System**: Keep track of payments, services, and payment statuses.
* **Reminders**: Set up and manage reminders for vaccinations, appointments, and follow-ups.
* **Multi-role Support**: Support for multiple user roles, such as clients and staff.
* **Inventory Management**: Comprehensive system to track medical supplies, vaccines, and other clinic inventory.

## Tech Stack

* **Next.js (App Router)** - React framework for building web applications
* **MongoDB** - NoSQL database for storing app data
* **Prisma ORM** - Provides an abstraction layer for the database
* **TypeScript** - Typed JavaScript for better code maintainability and readability

## Database Schema

The database is designed with **MongoDB** using **Prisma ORM** to handle complex relationships between users, pets, inventory, and their records.

### Core Models

#### `User`
* `kindeId`: Unique identifier from Kinde authentication
* `email`, `firstName`, `lastName`, `phone`, `address`: Personal details
* `visits`: Number of visits, with a flag for a free visit
* `visitHistory`: Linked visit history
* `pets`: List of pets owned by the user
* `appointments`: Scheduled appointments
* `billings`: Billing history
* `reminders`: User-specific reminders
* `userRoles`: Support for multiple roles
* `inventoryMovements`: Track inventory changes made by the user

#### `Pet`
* Comprehensive pet details including species, breed, weight
* Links to medical history, vaccinations, appointments
* Internal ID tracking system
* Deceased status tracking
* Vaccination schedule management

#### `VaccinationSchedule`
* Manages upcoming vaccinations
* Tracks different vaccination stages (PUPPY, ADULT)
* Supports multiple vaccine types
* Automated reminder system
* Status tracking (PENDING, COMPLETED, OVERDUE)

### Inventory Management

#### `InventoryItem`
* Tracks various categories: MEDICINE, SURGICAL_MATERIAL, VACCINE, FOOD, ACCESSORY, CONSUMABLE
* Monitors stock levels and expiration dates
* Batch number tracking
* Location management
* Minimum stock level alerts
* Status tracking (ACTIVE, INACTIVE, LOW_STOCK, OUT_OF_STOCK, EXPIRED)

#### `InventoryMovement`
* Records all inventory transactions
* Tracks movement types: IN, OUT, ADJUSTMENT, RETURN, EXPIRED
* Links movements to specific users
* Supports detailed notes and reasons for movements

### Support Models

* `MedicalHistory`: Detailed visit records with diagnosis and treatment
* `Vaccination`: Comprehensive vaccination records
* `Appointment`: Appointment management
* `Billing`: Financial transaction tracking
* `Reminder`: Automated reminder system
* `Staff`: Staff member management
* `Role` & `UserRole`: Role-based access control

## Getting Started

### Prerequisites

* **Node.js** v16+
* **MongoDB** instance
* Environment variables set up for **MongoDB URL** and other secrets

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/vet-family.git
```

2. Install dependencies:
```bash
cd vet-family
npm install
```

3. Set up environment variables in a `.env` file:
```
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase
```

4. Apply Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Contributing

Feel free to submit issues and pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.