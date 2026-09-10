# Binaire Model Search Utility

A high-performance, responsive React application built for the Freznel AI Assessment. It allows users to authenticate, browse, search, and filter a large dataset of AI models using a premium UI designed with Adobe React Spectrum.

## 🚀 Features

- **Robust Search Engine**: Search through models using substring matches across display names, IDs, and families.
- **Advanced Filtering**: Filter results by Safetensor file counts using range sliders, and sort alphabetically or numerically.
- **Premium UI (Adobe Spectrum)**: Engineered using `@adobe/react-spectrum` to provide a highly polished, accessible, and responsive user experience with glassmorphic cards, hero banners, and micro-animations.
- **Offline First**: Integrates `localforage` (IndexedDB) to automatically cache API responses. The app intelligently detects network status (`window.navigator.onLine`) and falls back to cached data when offline, alerting the user with a global badge.
- **Firebase Authentication**: Secure login and signup flows powered by Firebase Auth, completely restricting access to the dashboard until verified.
- **Large JSON Handling**: Demonstrates advanced Fetch API usage by utilizing the Streams API (`response.body.getReader()`) to safely chunk and parse large JSON datasets, preventing memory corruption.

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling/UI**: Adobe React Spectrum (`@adobe/react-spectrum`)
- **Routing**: React Router DOM
- **Authentication**: Firebase
- **Storage/Caching**: LocalForage (IndexedDB wrapper)
- **Data Fetching**: Native Fetch API (Promises & Streams)

## 🏗️ Architecture & OOP Implementation

The application's core logic is decoupled from React components using strict Object-Oriented Programming principles:

1. **`SearchEngine`**: An independent class that manages the dataset. It encapsulates all logic for searching, filtering, sorting, debouncing, and throttling, allowing for easy unit testing without React dependencies.
2. **`ApiService`**: A service class responsible for fetching external data. It handles the Streams API implementation for large files and integrates with `localforage` to manage offline caching autonomously.
3. **`AuthService`**: A singleton wrapper around the Firebase SDK, abstracting away backend-specific implementation details from the UI components.
4. **`NetworkManager`**: A class that listens to browser connectivity events (`online`/`offline`) and dispatches state changes to registered listeners.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v16+)
- A Firebase Project (with Email/Password Authentication enabled)

### Installation

1. **Clone the repository** and navigate to the project folder:
   ```bash
   cd binaire
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to a new file named `.env` and fill in your Firebase project credentials:
   ```env
  VITE_FIREBASE_API_KEY="api_key"
VITE_FIREBASE_AUTH_DOMAIN="auth_domain"
VITE_FIREBASE_PROJECT_ID="project_id"
VITE_FIREBASE_STORAGE_BUCKET="storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="messagin_sender_id"
VITE_FIREBASE_APP_ID="app_id"
   ...
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** at `http://localhost:5173`.

## 🧠 Technical Highlights

### Background Fetching without `async/await`
As requested, the `ApiService.fetchModels` method explicitly avoids `async/await` syntax, favoring the traditional Promise chain (`.then().catch()`) combined with recursive callbacks for stream reading.

### Preventing Large JSON Corruption
To assure safety during the download of potentially massive JSON payloads, the API fetcher does not dump the payload directly into memory using `.json()`. Instead, it uses `response.body.getReader()` to decode the byte stream in controlled chunks. This enables progress tracking, aborting on timeouts, and validating the final string before parsing, preventing browser crashes.

---
*Developed for the Freznel AI Assessment.*
