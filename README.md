# Vet Family

**Version 1.2.0**

**Vet Family** is a comprehensive management system for veterinary clinics. Built with **Next.js 15** using the App Router, **PostgreSQL**, **Prisma ORM**, and **TypeScript**, it helps clinics manage user profiles, pets, medical history, appointments, billing, inventory, and reminders efficiently.

## Features

### Core Features
- **User Management**: Track user details, including contact information, visit history, and reminders
- **Pet Management**: Store detailed records of pets, including species, breed, vaccinations, medical history, and weight tracking
- **Appointments**: Schedule and manage vet appointments, ensuring all visits are logged
- **Billing System**: Keep track of payments, services, and payment statuses
- **Reminders**: Set up and manage reminders for vaccinations, appointments, and follow-ups
- **Multi-role Support**: Support for multiple user roles, such as clients, staff, and administrators

### Advanced Features (v1.2.0)
- **Changelog System**: In-app notification banner and changelog page to keep users informed of new features and updates
- **Soft Delete**: Archive inventory items and medical records instead of permanent deletion, with restore functionality
- **Weight Tracking**: Automatic weight recording in medical history with latest weight display in pet profiles
- **Enhanced Admin Interface**: Redesigned sidebar with collapsible sections and improved navigation
- **Inventory Management**: Comprehensive inventory system with 36+ categories for medicines, vaccines, food, and accessories
- **Vaccination & Deworming Schedules**: Automated scheduling and tracking for preventive care

## Tech Stack

- **Next.js 15** (App Router) - React 19 framework for building web applications
- **PostgreSQL** - Relational database for storing app data
- **Prisma ORM** - Type-safe database client and migration tool
- **TypeScript** - Typed JavaScript for better code maintainability and readability
- **Kinde Auth** - Authentication and authorization platform
- **TailwindCSS** + **Radix UI** - Styling and component library
- **Sanity CMS** - Content management for blog posts
- **Cloudinary** - Image storage and optimization
- **pnpm** - Fast, disk space efficient package manager

## Database Schema

The database is designed with **PostgreSQL** using **Prisma ORM** to handle complex relationships between users, pets, and their records with full ACID compliance and referential integrity.

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

- Tracks each visit's details, including reasons, diagnosis, treatment, prescriptions, and notes
- **New in v1.2.0**: Weight tracking (weightInKg), soft delete support (deletedAt), and automatic timestamps (createdAt, updatedAt)

#### `Vaccination`

- Records details of vaccinations, including types, administration dates, and next doses.

#### `Appointment`

- Details of appointments, including reason and status.

#### `Billing`

- Manages billing records, including services, costs, and payment statuses.

#### `Reminder`

- Allows setting reminders for key events, like vaccinations and appointments.

#### `InventoryItem`

- Manages clinic inventory including medicines, vaccines, food, and accessories
- Supports 36+ categories for comprehensive inventory tracking
- **New in v1.2.0**: Soft delete functionality (deletedAt, deletedBy, deletionReason) for data preservation

#### `Staff`

- Tracks staff details such as name, position, and contact information

## Getting Started

### Prerequisites

- **Node.js** v18+
- **pnpm** v8+ (package manager)
- **PostgreSQL** v14+ database instance
- Environment variables for database, authentication, and external services

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ealanisln/vet-family-23.git
   cd vet-family-23
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables (see `.env.example` for required variables):

   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your configuration:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/vetfamily
   KINDE_CLIENT_ID=your_kinde_client_id
   KINDE_CLIENT_SECRET=your_kinde_client_secret
   # ... and other required variables
   ```

4. Apply Prisma migrations:

   ```bash
   pnpm db:push        # For development
   # or
   pnpm db:migrate     # For production migrations
   ```

5. Generate Prisma Client:

   ```bash
   pnpm db:generate
   ```

6. Start the development server:

   ```bash
   pnpm dev            # Uses .env.local
   # or
   pnpm dev:staging    # Uses .env.development
   ```

For more detailed development commands and workflows, see [CLAUDE.md](./CLAUDE.md).

## Contributing

Feel free to submit issues and pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.