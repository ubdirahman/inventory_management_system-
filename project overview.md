# inventory_management_system-
# 📘 WEEK 1: WEB FOUNDATIONS, MERN OVERVIEW & PROJECT SETUP
---

## 🎯 Week Objective

By the end of this week, students will:

* Understand how web applications work end-to-end.
* Learn essential web development terminology.
* Understand the MERN stack at a high level.
* Set up a complete development environment.
* **Master Project Requirements & Entity Modeling for the "Smart Kutub Finder".**
* **Analyze and Choose Professional Express Architectures.**

---

# 🟥 1. WEB DEVELOPMENT FUNDAMENTALS

---

## 🔴 System Flow (MOST IMPORTANT CONCEPT)

```text
User → Frontend → Backend → Database
                     ↓
                 Response
```

👉 This flow must be understood clearly before moving forward.

---

## 🔴 Core Components & Terminologies

| Term | Meaning |
| :--- | :--- |
| **Frontend** | User Interface (Client-side). |
| **Backend** | Business Logic & API (Server-side). |
| **Database** | Persistent data storage. |
| **HTTP** | Protocol for client-server communication. |
| **API** | Interface for systems to talk to each other. |
| **JSON** | Standard data format for communication. |

---

# 🟥 2. MERN STACK OVERVIEW

MERN is a full-stack JavaScript technology stack:
*   **MongoDB**: NoSQL Database.
*   **Express**: Backend framework for Node.js.
*   **React**: Frontend library for building interfaces.
*   **Node.js**: JavaScript runtime for the server.

---

# 🟥 3. DEVELOPMENT ENVIRONMENT SETUP

### ⚙️ Required Tools
*   **Node.js (LTS Version)**
*   **VS Code** (Primary Editor)
*   **Git & GitHub** (Version Control)
*   **Postman** (API Testing)
*   **MongoDB Atlas or Compass**

---

# 🟥 4. PROJECT VISION: SMART KUTUB FINDER

The **Smart Kutub Finder System** is a full-stack application designed to manage and locate Islamic books across multiple physical locations (homes, mosques) using a structured hierarchy.

### 🔴 Core Requirements
*   **Hierarchy:** `Location → Library → Cabinet → Shelf → Book`.
*   **Volumes:** Handling `Matn` (Single volume) and `Mujallad` (Multi-volume sets).
*   **Placement:** Tracking the exact coordinates of every book/volume.
*   **Roles:** Admin and Entry users for collaborative organization.

---

# 🟥 5. ENTITY MODEL (DATA SCHEMA)

#### 👤 User
*   `name`, `email`, `password`, `role` (Admin | Entry), `isActive`, `createdBy`

#### 📍 Location, Library, Cabinet, Shelf
*   **Location**: `name`, `description`, `createdBy`
*   **Library**: `name`, `location` (ref), `description`, `createdBy`
*   **Cabinet**: `name`, `library` (ref), `numberOfShelves`, `createdBy`
*   **Shelf**: `cabinet` (ref), `shelfNumber`, `label`, `createdBy`

#### 📖 Books, Volume, Placement
*   **Category**: `name`, `description`
*   **Books**: `title`, `author`, `category`, `type` (Matn | Mujallad), `totalVolumes`
*   **Volume**: `book` (ref), `volumeNumber`, `title`
*   **BookPlacement**: `book`, `volume`, `location`, `library`, `cabinet`, `shelf`, `notes`

---

# 🟥 6. EXPRESS ARCHITECTURE

### 🔴 1. Layered Architecture (Horizontal)
Groups files by their function (Models, Controllers, Routes). **Best for this bootcamp.**

### 🔴 2. Domain-Based Architecture (Vertical)
Groups files by their feature (Users, Books, Locations). **Best for large-scale production.**

---

# 🚀 WEEK 1 CHECKPOINTS

* [ ] Web fundamentals and MERN flow understood.
* [ ] Professional development environment verified.
* [ ] **Smart Kutub Finder** requirements and entities documented.
* [ ] Express project initialized using **Layered Architecture**.

---

# ✅ End inventory management system
