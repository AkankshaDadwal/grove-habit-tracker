
# 🌿 Grove — Habit Tracker

Grove is a minimal, nature-inspired habit tracking app that helps you build daily routines and visualize your progress over time. Track streaks, log completions, and stay consistent — one day at a time.

---

## ✨ Features

- **Daily Dashboard** — See all your habits for today at a glance. Mark them complete with one click.
- **Streak Tracking** — Tracks your current streak and longest active streak with a flame indicator 🔥
- **GitHub-style Progress Grid** — Visual heatmap of your habit history over the past year
- **Habit Management** — Create, customize, and manage habits with custom colors and descriptions
- **Habit Detail View** — Deep dive into individual habit history and stats
- **Responsive Design** — Works on mobile and desktop
- **Dark Mode Support** — Clean UI in both light and dark themes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Radix UI | Accessible UI components |
| Framer Motion | Animations |
| TanStack Query | Server state management |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Data visualization |
| date-fns | Date utilities |
| Wouter | Client-side routing |
| Lucide React | Icons |
| Sonner | Toast notifications |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (this project uses pnpm as the package manager)

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AkankshaDadwal/grove-habit-tracker.git
cd grove-habit-tracker
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start the development server**
```bash
pnpm dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Build for Production

```bash
pnpm build
```

---

## 📁 Project Structure

```
grove-habit-tracker/
├── artifacts/
│   └── habit-tracker/
│       └── src/
│           ├── components/       # Reusable UI components
│           │   ├── habit-grid.tsx    # GitHub-style heatmap grid
│           │   ├── habit-form.tsx    # Create/edit habit form
│           │   └── layout.tsx        # App layout wrapper
│           ├── pages/            # App pages
│           │   ├── dashboard.tsx     # Today's habits view
│           │   ├── habits.tsx        # All habits management
│           │   └── habit-detail.tsx  # Single habit detail
│           ├── hooks/            # Custom React hooks
│           └── App.tsx           # Root component
└── lib/                          # Shared libraries & API client
```

---

## 📸 Screenshots


<img width="1832" height="795" alt="Screenshot 2026-05-25 133308" src="https://github.com/user-attachments/assets/dd34b80d-add7-40c2-bb24-475b020d54cd" />
<img width="1285" height="786" alt="Screenshot 2026-05-25 133528" src="https://github.com/user-attachments/assets/87c1dc24-da5f-4b38-b5c6-8b6616e9e78a" />
<img width="1527" height="607" alt="Screenshot 2026-05-25 133546" src="https://github.com/user-attachments/assets/2717dfc6-f996-429f-95f2-b57152e0446a" />
<img width="1772" height="808" alt="Screenshot 2026-05-25 133457" src="https://github.com/user-attachments/assets/c4c88609-a909-4f09-b6a3-07f958a24f40" />



---

## 🎯 What I Learned

- Building a modern habit tracking application using React, TypeScript, and advanced frontend architecture.
- Managing complex server state with TanStack Query
- Creating GitHub-style contribution grid visualizations
- Designing accessible, responsive UI with Radix UI + Tailwind CSS
- Implementing streak logic and daily habit completion tracking

---

## 👩‍💻 Author

**Akanksha Dadwal**  
Frontend Developer & UI/UX Designer  
 

[![GitHub](https://img.shields.io/badge/GitHub-AkankshaDadwal-black?logo=github)](https://github.com/AkankshaDadwal)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

