# Room Reservation System

A modern room management and booking application built with Laravel 12, Inertia.js v2, and React 19. This system allows users to search for available rooms, request bookings for specific time slots, and manage their reservations through a centralized dashboard.

## Features

- **Slot-Based Booking**: Support for predefined time slots (e.g., 08:30 – 10:00) with overlap detection.
- **Request Lifecycle**: Complete workflow for room requests: Pending, Approved, Rejected, and Cancelled.
- **Real-Time Notifications**: Integrated notification system for booking approvals, role changes, and system alerts.
- **Dashboard & Management**: User-friendly dashboard for tracking requests and an admin interface for reviewing and managing room availability.
- **Advanced Searching**: Filter and find available rooms based on date and time slots.
- **Automated Maintenance**: Console commands to handle expired requests and maintenance tasks.

## Tech Stack

- **Backend**: PHP 8.4, Laravel 12
- **Frontend**: React 19, Inertia.js v2 (using TypeScript)
- **Styling**: Tailwind CSS v4
- **Routing**: Laravel Wayfinder (TypeScript-safe routes)
- **Database**: MySQL (default)
- **Testing**: Pest 4

## Getting Started

### Prerequisites

- PHP 8.4+
- Bun or Node.js
- Composer

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd room
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install frontend dependencies:
   ```bash
   bun install
   ```

4. Set up environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```

5. Run the development server:
   ```bash
   # Terminal 1: Laravel
   php artisan serve

   # Terminal 2: Vite
   bun run dev
   ```

## Testing

Run the test suite using Pest:
```bash
php artisan test
```
