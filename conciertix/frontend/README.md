# IndieAccess Pass - Frontend

This directory contains the React.js frontend for the IndieAccess Pass application.

## Development Environment Setup

1.  **Prerequisites:**
    *   Node.js (v18 or later recommended)
    *   npm (usually comes with Node.js)

2.  **Install Dependencies:**
    Navigate to the `frontend` directory in your terminal and run:
    ```bash
    npm install
    ```

3.  **Configure API URL:**
    The frontend needs to know the base URL of the backend API.
    *   Create a file named `.env` in the `frontend` directory (if it doesn't exist).
    *   Add the following line to the `.env` file, replacing `http://localhost:5000` with the actual URL if your backend runs on a different port:
        ```env
        VITE_API_BASE_URL=http://localhost:5000
        ```
    *   **Note:** The backend API is assumed to be running. Refer to the backend project's `README.md` for instructions on how to start it.

## Running the Development Server

Once the dependencies are installed and the API URL is configured:

1.  Navigate to the `frontend` directory in your terminal.
2.  Run the following command to start the React development server:
    ```bash
    npm run dev
    ```
3.  This will typically open the application in your default web browser at `http://localhost:5173` (Vite's default port, but check your terminal output for the exact URL).

## Project Structure

*   `public/`: Static assets.
*   `src/`: Main source code.
    *   `components/`: Reusable UI components (e.g., `EventCard.jsx`).
    *   `pages/`: Top-level page components (e.g., `HomePage.jsx`).
    *   `App.jsx`: Main application component, handles routing.
    *   `main.jsx`: Entry point of the React application.
    *   `App.css`: Global application styles.
    *   `index.css`: Vite's default global styles.
*   `.env`: Environment variables (e.g., API base URL).
*   `package.json`: Project dependencies and scripts.
*   `vite.config.js`: Vite configuration file.

## Key Features Implemented

*   **Event Discovery Page (`HomePage.jsx`):**
    *   Fetches and displays a list of events from the backend API (`/api/events`).
    *   Displays events using `EventCard.jsx` components, showing event name, artists, date, venue, price, and image.
    *   **Filtering:**
        *   Genre (text input)
        *   Date Range (start and end date pickers)
        *   City (text input)
        *   Artist (text input)
    *   **Search:** Live search bar for event names, descriptions, etc. (debounced).
    *   **Pagination:** "Previous" and "Next" buttons to navigate through event pages.
    *   Handles loading and error states during API calls.
*   **Styling:** Basic responsive CSS for a clean layout.
*   **Routing:** Uses `react-router-dom` for navigation (currently only the homepage).
