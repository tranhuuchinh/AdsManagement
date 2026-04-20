# Ads Management System 📢

A comprehensive web-based platform designed to manage, track, and report on public advertising boards. This system provides tailored portals for two main user groups: **Cadres** (administrative officials managing the ads) and **Civilians** (citizens viewing or reporting on ads).

## 📂 Project Structure

This repository follows a separated architecture pattern, split into three main directories:

* **`/Backend`**: The server-side API application handling data processing, database interactions, business logic, and authentication.
* **`/Cadre`**: The frontend portal for administrative officials. It allows cadres to manage advertisement locations, review civilian reports, and oversee licensing requests.
* **`/Civilian`**: The frontend portal for the general public. It allows citizens to view local advertising boards on a map, check their legality, and submit reports regarding damaged boards or inappropriate content.
* **`ads.sql`**: The database dump file containing the table schemas and initial configuration for the database.

## 🛠 Tech Stack

Based on the repository contents, the project utilizes the following technologies:
* **Programming Languages:** JavaScript (80.3%), SCSS (18.9%)
* **Frontend Environment:** React (contained in `Cadre` and `Civilian` folders) using SCSS for styling.
* **Backend Environment:** Node.js (Express.js or similar)
* **Database:** Relational Database (SQL-based, as indicated by `ads.sql` — likely MySQL or PostgreSQL)

## ✨ Features

### For Civilians (Citizens):
* **Interactive Map:** View public advertising billboards and their details.
* **Report System:** Submit reports regarding specific ads or locations (e.g., policy violations, damaged structures).
* **Status Tracking:** Track the resolution status of submitted reports.

### For Cadres (Officials):
* **Location Management:** Add, edit, or remove advertising points and boards.
* **Report Handling:** Review, respond to, and resolve reports submitted by civilians.
* **Licensing & Approval:** Manage advertising licensing requests from businesses.
* **District/Ward Delegation:** Access controls based on the official's assigned management area.

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) installed
* A SQL Database server (e.g., MySQL) running locally

### 1. Database Setup
1. Create a new database in your local SQL server (e.g., `ads_management`).
2. Import the provided SQL schema to initialize your tables:
   ```bash
   mysql -u your_username -p ads_management < ads.sql
   ```
   
### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables (create a `.env` file connecting to the database you just set up).
4. Start the backend server:
   ```bash
   npm start
   # or npm run dev
   ```

### 3. Frontend Setup (Cadre / Civilian)
*Note: You will need to run these in separate terminal windows.*

**For the Cadre Portal:**
```bash
cd Cadre
npm install
npm start
```

**For the Civilian Portal:**
```bash
cd ../Civilian
npm install
npm start
```
