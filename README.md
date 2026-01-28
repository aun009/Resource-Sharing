# **SkillSwap & ToolShare**

<div align="center">

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Connect with your community. Swap Skills. Share Tools.**

A hyper-local marketplace for exchanging expertise and resources within your neighborhood.

![Banner](assets/images/banner_placeholder.png)

</div>

---

## **📝 Problem Statement**

In modern urban environments, individuals possess valuable skills and own specialized tools that often go underutilized. Simultaneously, others in the same community have temporary needs for these exact resources but lack access or the budget to acquire them. There is a meaningful disconnect between local supply and demand, leading to inefficient resource usage and a lack of community engagement.

## **💡 Solution Overview**

**SkillSwap** is a robust, community-driven platform designed to bridge this gap. It enables users to:
*   **Discover** skills and tools available in their immediate vicinity using interactive maps.
*   **Connect** with neighbors securely to arrange swaps or borrowing.
*   **Exchange** services (e.g., guitar lessons for coding help) or physical items (e.g., power drills, gardening tools).
*   **Build** trust through a transparent profile and reputation system.

---

## **✨ Key Features**

*   **🔐 Secure Authentication**: Robust user registration and login system utilizing **JWT (JSON Web Tokens)** and **Spring Security** for data protection.
*   **📍 Interactive Map Interface**: Visual discovery of resources and users powered by **Leaflet**, allowing users to explore their local community geographically.
*   **💬 Real-Time Communication**: Integrated instant messaging functionality using **WebSocket** and **StompJS**, facilitating seamless coordination between users.
*   **🛒 Comprehensive Marketplace**: A centralized hub to list, browse, and search for available skills and tools with intuitive filtering.
*   **👤 Dynamic User Profiles**: Detailed profile management showcasing user skills, inventory, and reputation to foster trust.
*   **📄 Resource Management**: Full CRUD capabilities for users to manage their listings effectively.

---

## **🛠️ Tech Stack**

### **Backend**
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white)

### **Frontend**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

---

## **🏗️ System Architecture**

The application follows a modern monolithic architecture with a clear separation of concerns, utilizing a RESTful API for communication between the React frontend and Spring Boot backend.

![Architecture Diagram](assets/images/architecture_placeholder.png)

---

## **📸 Screenshots**

<div align="center"> 
  <img src="assets/images/dashboard_placeholder.png" alt="Dashboard" width="800"/>
  <p><em>Interactive User Dashboard</em></p>
</div>

<br>

<div align="center">
  <img src="assets/images/map_placeholder.png" alt="Map View" width="45%"/>
  <img src="assets/images/chat_placeholder.png" alt="Chat Interface" width="45%"/>
  <p><em>Local Discovery Map & Real-time Chat</em></p>
</div>

---

## **🚀 Installation Guide**

### **Prerequisites**
Ensure you have the following installed on your system:
*   **Java Development Kit (JDK) 17** or higher
*   **Node.js 18+** & **npm**
*   **PostgreSQL** database
*   **Maven** (optional, wrapper provided)

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

### **2. Database Setup**
Create a PostgreSQL database named `skillswap_db` (or update `application.properties`):

```sql
CREATE DATABASE skillswap_db;
```

### **3. Backend Setup**

Navigate to the root directory and configure `src/main/resources/application.properties` with your database credentials. Then, run the application:

```bash
# Windows
./mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```
The backend server will start at `http://localhost:8080`.

### **4. Frontend Setup**

Open a new terminal, navigate to the frontend directory, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
The frontend application will start at `http://localhost:5173`.

---

## **📂 Folder Structure**

```text
SkillSwap/
├── src/main/java/com/skill/    # Backend Source Code
│   ├── config/                 # Security & WebSocket Configs
│   ├── controller/             # REST Controllers (API Endpoints)
│   ├── model/                  # JPA Entities
│   ├── repository/             # Data Access Layer
│   ├── service/                # Business Logic
│   └── dto/                    # Data Transfer Objects
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   ├── pages/              # Key Pages (Home, Map, Chat, Profile)
│   │   ├── context/            # Global State (Auth)
│   │   └── assets/             # Static Assets
│   └── package.json            # Frontend Dependencies
├── pom.xml                     # Maven Dependencies
└── README.md                   # Project Documentation
```

---

## **📡 API Endpoints**

| HTTP Verbs | Endpoint | Action |
| --- | --- | --- |
| **POST** | `/api/auth/register` | Register a new user |
| **POST** | `/api/auth/login` | Authenticate user & get Token |
| **GET** | `/api/resources` | Fetch all available resources |
| **POST** | `/api/resources` | Create a new skill/tool listing |
| **GET** | `/api/chat/history/{id}` | Retrieve chat history |

---

## **🛣️ Roadmap**

- [ ] **Mobile App**: Develop React Native mobile application.
- [ ] **Payment Integration**: Secure escrow payments for tool rentals.
- [ ] **AI Matching**: Smart recommendations for skills based on user interests.
- [ ] **Social Logs**: Google/Facebook OAuth integration.

---

## **🤝 Contribution**

Contributions are always welcome! Please follow these steps:

1.  Fork the project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## **📄 License**

Distributed under the MIT License. See `LICENSE` for more information.

---

## **📞 Contact**

**Project Maintainer** - [Arun](mailto:arunmahajan9240@gmil.com)

Project Link: [https://github.com/aun009/skillswap](https://github.com/aun009/skillswap)

Linked In : [https://www.linkedin.com/in/arun-mahajan-37159b203/](https://www.linkedin.com/in/arun-mahajan-37159b203/)
