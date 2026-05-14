# Lotus Computer Institute - ID Card Generator

A comprehensive React-based web application for generating and managing Farmer (👨‍🌾) and Kamgar (👷‍♂️) Identity Cards. Built with a modern tech stack, this application features user authentication, a dedicated admin dashboard, and a built-in credit/balance points system for downloading generated ID cards.

## 🌟 Key Features

*   **User Authentication & Authorization**: Secure login and registration powered by Supabase. Distinguishes between normal `user` and `admin` roles.
*   **Role-Based Dashboards**: 
    *   **Users**: Can view their available Balance Points and quickly access ID generation tools.
    *   **Admins**: Full access to user management, balance top-ups, and unlimited ID downloads without point deductions.
*   **Farmer ID Generation**: Form-driven creation of Farmer ID cards with dual-language support (English/Marathi transliteration) and land records management.
*   **Kamgar ID Generation**: Easy-to-use form for creating Kamgar ID cards with QR code integration and profile photos.
*   **Balance Points System**: Users must spend "Balance Points" to download generated ID cards (10 points per download). Admins can manage these points via the User List dashboard.
*   **High-Quality Exports**: Generates production-ready, front-and-back JPG images for easy printing.

## 🚀 Tech Stack

*   **Frontend**: React (Create React App)
*   **Routing**: React Router DOM
*   **Styling**: Vanilla CSS & Bootstrap 5
*   **Database & Auth**: Supabase
*   **Notifications**: React Toastify
*   **Exports**: HTML2Canvas, jsPDF, XLSX (for admin reports)
*   **Other Utilities**: Axios (for Google Input Tools transliteration API)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/maheshtawade2308/lotusiti.git
   cd lotusiti
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The application will run locally at `http://localhost:3000`.

## 🗄️ Database Schema

This project relies on a `profiles` table in Supabase. Ensure your table is structured as follows:

| Column Name      | Type        | Default Value | Description |
|------------------|-------------|---------------|-------------|
| `id`             | `uuid`      | Auth UID      | Primary Key, links to Supabase Auth |
| `name`           | `text`      |               | User's full name |
| `email`          | `text`      |               | User's email |
| `mobile`         | `text`      |               | User's phone number |
| `address`        | `text`      |               | User's city/address |
| `gender`         | `text`      |               | User's gender |
| `role`           | `text`      | `user`        | Defines permissions (`user` or `admin`) |
| `balance_points` | `int4`      | `0`           | Points used for downloading ID cards |
| `created_at`     | `timestamp` | `now()`       | Account creation date |

## 🛠️ Usage Workflow

1. **Admin Setup**: First, register an account directly in Supabase and manually change the `role` column to `admin` in your database.
2. **User Registration**: Log in with your new admin account. From the dashboard, navigate to **Register User** to create standard user accounts.
3. **Point Management**: As an admin, go to **User List** and edit a user to assign them Balance Points.
4. **Card Generation**: Log in as the newly created user, navigate to the Farmer or Kamgar ID section, fill in the details, and click download. 10 points will automatically be deducted from the user's balance.

## 📄 License

This project is proprietary and intended for use by Lotus Computer Institute.
