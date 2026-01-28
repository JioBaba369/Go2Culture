# Go2Culture: A Feature-Complete Full-Stack Application

Go2Culture is a web platform that brings travellers, migrants, and locals together through authentic cultural and dining experiences hosted in local homes. We believe the most meaningful connections don’t happen in commercial restaurants, but around a shared table—where stories are exchanged, traditions are honoured, and meals are cooked with love.

This project was built with [Firebase Studio](https://firebase.google.com/studio) and is now feature-complete.

---

##  filozofia (Our Philosophy)

We are guided by three core principles:
*   **Celebrate Authentic Heritage**: Experience the soul of a nation through recipes passed down through generations. We honour the soul of each culture through home-cooked recipes and traditions passed down across generations—offering flavours, stories, and rituals you won’t find in a typical restaurant.
*   **Create Genuine Human Connection**: By entering a home, you participate in a global exchange that dissolves barriers. By welcoming guests into local homes, we enable meaningful cultural exchange that breaks down barriers, broadens perspectives, and allows hosts to share their history with pride.
*   **Empower Local Communities**: Every experience directly boosts the household economy of local families, providing a dignified source of income while strengthening and sustaining their communities.

---

## ✨ Core Features

The platform is divided into several key areas, each serving a distinct purpose for guests, hosts, and administrators.

| Feature                   | Description                                                                                                                                                                                            | Target Users      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| **User Authentication**   | Secure sign-up and login functionality using Firebase Authentication (email/password). Includes password reset capabilities.                                                                             | All Users         |
| **Experience Discovery**  | A powerful search and filtering system for guests. Users can filter experiences by location, category, price, cuisine, and dietary needs.                                                                | Guests            |
| **Experience Details**    | Each experience has a dedicated page with detailed information, including host profile, menu, location, inclusions, what to bring, and reviews.                                                          | Guests            |
| **Secure Booking System** | Guests can securely book experiences, select dates from an interactive calendar, and apply discount coupons. The system supports both "Instant Book" and "Request to Book" models.                       | Guests            |
| **Cancellations & Reschedules** | Guests can request to cancel or reschedule a booking. Hosts can approve or deny reschedule requests, and all parties are notified of status changes. | Guests, Hosts |
| **Host Onboarding**       | A multi-step, user-friendly application process for aspiring hosts to detail their profile, experience, location, and compliance with local regulations.                                                  | Aspiring Hosts    |
| **User Profiles**         | Public profiles for users. Host profiles are expanded to showcase their bio, hosting style, and all their listed experiences.                                                                          | All Users         |
| **Wishlist**              | Authenticated guests can save their favorite experiences to a personal wishlist for future reference.                                                                                                    | Guests            |
| **Messaging System**      | A built-in, booking-centric messaging system that allows hosts and guests to communicate directly and securely to coordinate details for their upcoming experience.                                       | Guests, Hosts     |
| **Rating & Review System**| After an experience, guests can leave a rating (1-5 stars) and a written review, helping to build a trusted and transparent community.                                                                 | Guests            |
| **Host Dashboard**        | A dedicated portal for hosts to manage experiences (create, edit, pause, make live), view and manage bookings (confirm, cancel, reschedule), update availability, and track earnings.                     | Hosts             |
| **Admin Dashboard**       | A comprehensive back-office for platform administrators to manage host applications, oversee all platform activity (experiences, users, bookings), manage reports, and configure site-wide settings like coupons and sponsors. | Admins            |

---

## 🗺️ Key User Flows (Wireframes)

This section outlines the primary user journeys through the application, serving as a text-based wireframe.

### 1. Guest: Booking an Experience
1.  **Discovery**: User lands on the homepage or `/discover` page. They can use the search bar or filters (category, price, location, etc.) to find experiences.
2.  **View Experience**: User clicks on an `ExperienceCard` and is navigated to the dynamic route `/experiences/[id]`.
3.  **Details & Booking**: On the experience page, the user reviews details in the main content area. The `BookingWidget` on the side allows them to:
    *   Select an available date from the `BookingDatePicker`.
    *   Choose the number of guests.
    *   Apply a coupon code.
    *   Agree to the terms and policies.
4.  **Book/Request**: The user clicks "Request to Book" or "Book" (if Instant Book is enabled).
5.  **Confirmation**: The booking is created with a "Pending" or "Confirmed" status. The user is redirected to their `/profile/bookings` page, and notifications are sent.

### 2. User: Becoming a Host
1.  **Landing Page**: A prospective host visits the `/become-a-host` landing page to learn about the benefits and requirements.
2.  **Start Application**: The user clicks "Become a Host" and is taken to `/become-a-host/apply`.
3.  **Authentication Check**: The page first checks if the user is logged in. If not, they are prompted to log in or sign up. It also checks if they have an existing application or are already a host.
4.  **Multi-Step Form**: The user fills out a multi-step application form covering:
    *   Step 1: Experience Basics (Title, Category, Description)
    *   Step 2: About You (Bio, Expertise)
    *   Step 3: Location & Home Setup
    *   Step 4: Menu & Pricing
    *   Step 5: Media (Placeholders for now)
    *   Step 6: Final Review & Terms
5.  **Submission**: The user submits the form. The application is saved to Firestore with a "Pending" status, and the user is shown a success message.

### 3. Host: Managing Experiences & Bookings
1.  **Dashboard Access**: A logged-in host navigates to `/host` to access their dashboard.
2.  **Dashboard Overview**: The main dashboard (`/host`) displays key stats (earnings, upcoming bookings) and recent activity.
3.  **Manage Experiences**: On the `/host/experiences` page, a host can:
    *   View a list of their experiences.
    *   Click "Edit" to go to `/host/experiences/[id]/edit` and modify details.
    *   Use the action menu to Pause/Make Live an experience.
4.  **Manage Bookings**: On the `/host/bookings` page, a host can:
    *   View a table of all their bookings, filterable by status.
    *   For "Pending" bookings, they can "Confirm" or "Cancel". Confirming creates the conversation thread.
    *   For "Confirmed" bookings with a reschedule request, they can "Accept" or "Decline".
    *   Initiate a chat with the guest.
5.  **Manage Availability**: On `/host/calendar`, the host can view all bookings on a calendar and block/unblock specific dates to prevent bookings.

### 4. Admin: Platform Management
1.  **Login & Access**: An admin user (with the specific `ADMIN_UID`) logs in and navigates to `/admin`.
2.  **Dashboard Overview**: The `/admin` page shows platform-wide analytics charts (revenue, new users, etc.) and key stats.
3.  **Application Review**: The admin navigates to `/admin/applications`.
    *   They see a filterable list of all host applications.
    *   Clicking "View" takes them to `/admin/applications/[id]`.
    *   Here, they can review all details submitted by the applicant in a tabbed interface.
    *   The admin can **Approve**, **Reject**, or **Request Changes**. Approving triggers a batch write that creates the `Host` and `Experience` documents and updates the user's role.
4.  **Manage Users/Experiences/Bookings**: The admin has dedicated pages to view and manage all users, experiences, and bookings on the platform. They can perform actions like suspending a user or pausing an experience.

---

## 🛠️ Technical Deep Dive

### Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
-   **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

### Folder Structure

The project follows a standard Next.js App Router structure with some key organizational choices:

` .
├── src
│   ├── app/                # Main application routes (App Router)
│   │   ├── admin/          # Routes for the Admin Dashboard
│   │   ├── host/           # Routes for the Host Dashboard
│   │   ├── profile/        # Routes for the user's profile section
│   │   └── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components
│   │   ├── home/           # Components specific to the homepage
│   │   ├── host/           # Components for the Host Dashboard
│   │   ├── admin/          # Components for the Admin Dashboard
│   │   └── ui/             # ShadCN UI components
│   ├── firebase/           # Firebase configuration and custom hooks
│   │   ├── config.ts       # Firebase config object
│   │   ├── index.ts        # Main entry point for Firebase utilities
│   │   ├── provider.tsx    # Core Firebase context provider
│   │   └── client-provider.tsx # Client-side wrapper for the provider
│   ├── hooks/              # Custom React hooks (e.g., use-toast)
│   ├── lib/                # Utility functions, actions, and type definitions
│   │   ├── actions/        # Server Actions for client-side Firestore interaction
│   │   ├── types.ts        # TypeScript type definitions for data models
│   │   └── utils.ts        # General utility functions (e.g., cn)
│   └── public/             # Static assets (images, fonts)
├── docs/
│   └── backend.json        # A JSON representation of the backend data schema
├── firestore.rules         # Firestore security rules
└── tailwind.config.ts      # Tailwind CSS configuration
`

### Firebase Architecture

#### Initialization & Providers

-   **`src/firebase/config.ts`**: Stores the Firebase project configuration object.
-   **`src/firebase/index.ts`**: Exports the primary `initializeFirebase` function. It uses a singleton pattern to ensure Firebase is only initialized once.
-   **`src/firebase/client-provider.tsx`**: A client-side component (`'use client'`) that calls `initializeFirebase` and wraps the `FirebaseProvider`. This is crucial for the App Router to ensure Firebase is initialized only on the client.
-   **`src/firebase/provider.tsx`**: The core context provider. It initializes the `onAuthStateChanged` listener to track the current user's authentication state and makes the Firebase services (`auth`, `firestore`, `user`) available to all descendant components via custom hooks.

#### Custom Hooks

-   **`useFirebase()`**: The main hook to access all Firebase services and user state. Throws an error if used outside the `FirebaseProvider`.
-   **`useUser()`**: A convenience hook that returns just the user authentication state: `{ user, isUserLoading, userError }`.
-   **`useAuth()`**: Returns the Firebase Auth instance.
-   **`useFirestore()`**: Returns the Firebase Firestore instance.
-   **`useDoc(docRef)`**: A real-time hook to subscribe to a single Firestore document.
-   **`useCollection(query)`**: A real-time hook to subscribe to a Firestore collection or query.
-   **`useMemoFirebase(factory, deps)`**: **CRITICAL HOOK**. This must be used to memoize any `doc` or `collection` reference passed to `useDoc` or `useCollection` to prevent infinite re-renders.

### Data Models (Entities)

This is a summary of the main data entities stored in Firestore, as defined in `docs/backend.json`.

-   **User**: Represents any user on the platform. Stores profile info, role (`guest`, `host`, `both`), and status.
-   **Host**: A sub-collection document within a `User` document. Contains detailed information specific to a host's profile, home setup, compliance, and verification status.
-   **HostApplication**: Stores the multi-step application submitted by users wishing to become hosts. Reviewed by admins.
-   **Experience**: The core entity representing a cultural experience offered by a host. Contains all details about the menu, pricing, location, and availability.
-   **Booking**: Represents a specific booking of an experience by a guest. Links a `Guest`, `Host`, and `Experience`.
-   **Review**: A review and rating left by a guest after a completed booking.
-   **WishlistItem**: Represents a link between a user and an experience they've saved.
-   **Conversation**: The top-level document for a message thread, securely linked to a `Booking`. Contains metadata about participants.
-   **Message**: A document within a `Conversation`'s subcollection, representing a single chat message.
-   **Notification**: A user-specific notification for events like new messages or booking confirmations.
-   **Report**: A report filed by a user or the system for admin review.
-   **Coupon / Sponsor**: Admin-managed entities for promotional codes and platform partners.

### Firestore Security Rules (`firestore.rules`)

The security rules are designed with a "deny by default" principle. Key strategies include:

-   **User Ownership**: Users can only write to their own profile and associated subcollections (e.g., `/users/{userId}/wishlist`).
-   **Role-Based Access**: Certain actions are restricted based on a user's role (e.g., only hosts can create experiences).
-   **Admin Privileges**: A specific `ADMIN_UID` has elevated permissions to manage platform-wide data like applications, users, and reports.
-   **Secure Conversation Access**:
    *   A conversation can only be created if it corresponds to a valid booking and includes the correct guest and host.
    *   Users can only list conversations they are a participant in (`isQueryingOwnConversations`).
    *   Users can only read/write messages within a conversation they are a part of.
-   **Rate Limiting**: The `canSendMessage` function prevents a user from sending messages more than once per second to mitigate spam.
-   **Scoped Updates**: Rules use `request.resource.data.diff(resource.data)` to ensure that users can only update specific, allowed fields on a document (e.g., a guest can only update a booking's `status` to "Cancelled").

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   npm

### Running the Development Server

1.  **Install dependencies**:
    `bash
    npm install
    `

2.  **Run the development server**:
    `bash
    npm run dev
    `

The application will be available at `http://localhost:9002`.
