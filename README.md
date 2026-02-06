# 📸 DIUFPC – Official Club Website
<div align="center">


[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-diufpc.vercel.app-blue?style=for-the-badge)](https://diufpc.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Official Digital Platform of DIU Film & Photography Club**

*Capturing moments, managing memories – a serverless solution for creative communities*

[✨ Features](#-key-features) • [🛠️ Tech Stack](#️-tech-stack) • [📸 Screenshots](#-screenshots) 

</div>

---

## 🎯 Overview

The **DIUFPC Official Club Website** serves as the digital hub for the **DIU Film & Photography Club**, bringing together event management, results tracking, team profiles, and announcements in one seamless platform.

### What Makes It Special?

- 🎨 **Built by creatives, for creatives** – Developed as a voluntary contribution to the club
- ⚡ **100% Serverless** – Powered by Google Apps Script, eliminating traditional backend complexity
- 📊 **Sheets as Database** – Leveraging Google Sheets for accessible, real-time data management
- 🔒 **Secure Admin Portal** – Protected by Clerk authentication for content management

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎪 For Members
- 📅 **Event Discovery** – Browse upcoming workshops, competitions, and gatherings
- ⏱️ **Live Countdowns** – Never miss registration deadlines
- 🏆 **Results Hub** – Check competition winners and recognition
- 👥 **Meet the Team** – Connect with committee members
- 📢 **Stay Updated** – Official announcements and news

</td>
<td width="50%">

### 🛡️ For Admins
- ✍️ **Content Management** – Add/edit events, results, and announcements
- 📊 **Sheet Integration** – Direct Google Sheets manipulation
- 🔐 **Secure Access** – Clerk-powered authentication
- ⚙️ **No Server Maintenance** – Serverless architecture handles scaling

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:-----:|:----------:|:--------|
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) | Lightning-fast UI with Vite bundling |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwind-css&logoColor=white&style=flat-square) | Responsive, utility-first design |
| **Backend** | ![Google Apps Script](https://img.shields.io/badge/-Apps_Script-4285F4?logo=google&logoColor=white&style=flat-square) | RESTful API without servers |
| **Database** | ![Google Sheets](https://img.shields.io/badge/-Sheets-34A853?logo=google-sheets&logoColor=white&style=flat-square) | Collaborative, real-time data store |
| **Auth** | ![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?logo=clerk&logoColor=white&style=flat-square) | Secure admin authentication |
| **Hosting** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white&style=flat-square) | Edge-optimized deployment |
| **Version Control** | ![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=white&style=flat-square) | Collaborative development |

</div>

### Architecture Highlights

```
┌─────────────┐      HTTPS      ┌──────────────────┐
│   Browser   │ ←─────────────→ │  React + Vite    │
│  (Client)   │                 │   (Frontend)     │
└─────────────┘                 └────────┬─────────┘
                                         │
                                         │ API Calls
                                         ▼
                                ┌──────────────────┐
                                │ Google Apps      │
                                │ Script Web App   │
                                └────────┬─────────┘
                                         │
                                         │ Read/Write
                                         ▼
                                ┌──────────────────┐
                                │ Google Sheets    │
                                │   (Database)     │
                                └──────────────────┘
```

---

## 📸 Screenshots

<details open>
<summary><b>🏠 Home Page</b> – Welcome to DIUFPC</summary>
<br>
<img src="./Readme/home.png" alt="Home Page" width="100%">
</details>

<details>
<summary><b>📅 Events Page</b> – Discover what's happening</summary>
<br>
<img src="./Readme/events.png" alt="Events Page" width="100%">
</details>

<details>
<summary><b>🏆 Results Page</b> – Celebrating our winners</summary>
<br>
<img src="./Readme/results.png" alt="Results Page" width="100%">
</details>

<details>
<summary><b>👥 Team Page</b> – Meet the passionate minds behind DIUFPC</summary>
<br>
<img src="./Readme/team.png" alt="Team Page" width="100%">
</details>

<details>
<summary><b>📢 Announcements</b> – Stay in the loop</summary>
<br>
<img src="./Readme/announcements.png" alt="Announcements Page" width="100%">
</details>

<details>
<summary><b>🔐 Admin Portal</b> – Secure content management</summary>
<br>
<table>
<tr>
<td width="50%"><img src="./Readme/admin_login.png" alt="Admin Login"></td>
<td width="50%"><img src="./Readme/admin_dashboard.png" alt="Admin Dashboard"></td>
</tr>
</table>
</details>

---

## 🌐 Deployment

### Frontend Deployment Options
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

### Backend Setup

The Google Apps Script backend is already deployed as a Web App. Contact the admin team for API endpoint details.

---

## 📄 License

This project is developed for **DIU Film & Photography Club**. All rights reserved.

---

## 📞 Contact

**DIU Film & Photography Club**  
📧 Email: [diufpc@gmail.com](mailto:diufpc@gmail.com)  
🌐 Website: [diufpc.vercel.app](https://diufpc.vercel.app/)

---

<div align="center">

**Made with 📷 and ❤️ by DIUFPC Team**

⭐ Star this repo if you find it helpful!

</div>
