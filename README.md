# Go2Culture

Go2Culture is a web application that connects travelers with local hosts for authentic cultural and dining experiences. It's a platform where hosts can share their culture, and guests can discover unique activities like in-home dining, cooking classes, and more.

This project was built with [Firebase Studio](https://firebase.google.com/studio).

## Our Philosophy

We believe that the most meaningful connections don’t happen in commercial spaces. They happen around a kitchen table, in a local home, sharing stories over a meal cooked with love. Go2Culture was created to unlock these hidden treasures, transforming tourism into true human connection.

We are guided by three core principles:
*   **Authentic Heritage, Not Commercial Food**: Experience the soul of a nation through recipes passed down through generations.
*   **Genuine Connection, Not a Transaction**: By entering a home, you participate in a global exchange that dissolves barriers.
*   **Boosting the Local Household Economy**: Every experience directly boosts the household economy of local families.

## Core Features

-   **Host Onboarding**: A multi-step, user-friendly application process for aspiring hosts to detail their profile, experience, location, and compliance with local regulations.
-   **Experience Discovery**: A powerful search and filtering system for guests. Users can filter experiences by location (country, region, city), category, price, cuisine, and dietary needs.
-   **Secure Bookings & Payments**: Guests can securely book experiences, select dates, and apply discount coupons. The system handles booking requests, confirmations, and cancellations.
-   **Host-Guest Communication**: A built-in messaging system allows hosts and guests to communicate directly to coordinate details for their upcoming experience.
-   **Rating & Review System**: After an experience, guests can leave a rating and a written review, helping to build a trusted and transparent community.
-   **Admin Dashboard**: A comprehensive back-office for platform administrators.
    -   Manage host applications (approve, reject, request changes).
    -   Oversee all experiences, users, bookings, and reports.
    -   Create and manage discount coupons and sponsors.
    -   Monitor host payouts and platform earnings.
-   **Host Dashboard**: A dedicated portal for hosts.
    -   Manage experiences (create, edit, pause, make live).
    -   View and manage bookings (confirm, cancel).
    -   Update availability using an interactive calendar.
    -   Track earnings and performance through charts.
-   **User Profiles**: Public profiles for users to showcase their bio and social media links. Hosts have an expanded profile showing their bio, hosting style, and listed experiences.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
-   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   npm

### Running the Development Server

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
