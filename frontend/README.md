# 🚀 Image Processor - Frontend (Next.js)

This is the frontend component of the Image Processor project, built using **Next.js 16**, **React 19**, and **Tailwind CSS 4**.

## 🛠️ Features

- **Side-by-side Visuals**: Compare original and processed images in real-time.
- **Micro-Animations**: Smooth transitions, loading spinners, and dynamic engagement messages.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewports.
- **Server Monitoring**: Built-in logic to ping the backend and monitor warmup status.
- **Onboarding System**: Interactive guides for new users to explain the edge-detection process.

---

## 🚦 Getting Started

### Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Running Locally

1.  **Set up Environment Variables**:
    Create a `.env.local` file in this directory and add:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🏗️ Technical Details

### Technologies
- **React 19**: Utilizing the latest React features and concurrent rendering.
- **Next.js 16**: Leveraging the App Router for efficient server/client separation.
- **Tailwind CSS 4**: A modern, utility-first styling engine with native CSS variables.
- **TypeScript**: Ensuring type safety throughout the codebase.

### Key Components
- **`app/page.tsx`**: The main orchestration page containing image upload logic, status polling, and the comparison UI.
- **Onboarding Overlay**: A dynamic modal system that guides users through the system's "warmup" phase.

---

## 📈 Deployment

The easiest way to deploy this frontend is via [Vercel](https://vercel.com/new).

1.  Connect your repository.
2.  Set `NEXT_PUBLIC_API_URL` in the environment variables settings.
3.  Deploy!

---

## 👤 Credits
Part of the **Imgp Project Suite** developed by Sravanth.
