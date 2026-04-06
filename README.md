# 🖼️ Image Processor: Polyglot MVC Grayscale Studio

A high-performance web application designed to transform RGB images into stunning grayscale sketches. Built with a modern, reactive frontend and a multi-language backend orchestration.

---

## ✨ Key Features

- **🚀 Magic Transform**: Seamlessly converts color images into sophisticated grayscale sketches using **Canny Edge Detection**.
- **📡 Real-time Feedback**: Dynamic engagement messages and server status monitoring (warming up processes) for a smooth user experience.
- **🌗 Comparison Suite**: Side-by-side visualization of original and processed images.
- **📥 Instant Export**: One-click download of processed high-fidelity results.
- **🎈 Premium Onboarding**: Step-by-step guidance for new users and a warm-up overlay for returning ones.

---

## 🏗️ Architecture Overview: Polyglot MVC

This project demonstrates a robust multi-language microservice-style architecture:

1.  **Frontend Excellence**: A sleek, responsive UI built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.
2.  **Backend Orchestrator**: A **Spring Boot 3.2.2** (Java 17) web server that manages file uploads and API routing.
3.  **Processing Engine**: A high-efficiency **Python** script utilizing **OpenCV (cv2)** and **NumPy** for advanced pixel manipulation and edge detection.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Backend & Core
- **Orchestration**: [Spring Boot 3.2.2](https://spring.io/projects/spring-boot) (Java 17)
- **Computer Vision**: [OpenCV](https://opencv.org/) for Python
- **Build Tools**: [Maven](https://maven.apache.org/)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17+ & Maven
- Python 3.x with `opencv-python-headless` and `numpy`

### Installation

1.  **Clone the workspace**:
    ```bash
    git clone https://github.com/your-repo/Imgp-Frontend.git
    ```

2.  **Frontend Setup**:
    ```bash
    cd imageProcessing-frontend/frontend
    npm install
    ```

3.  **Backend Setup**:
    (Navigate to the backend repository)
    ```bash
    mvn clean install
    ```

### Running Locally

1.  **Start the Frontend**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

2.  **Start the Backend**:
    Run the Spring Boot application from your IDE or via terminal:
    ```bash
    mvn spring-boot:run
    ```

---

## ⚙️ Environment Variables

Create a `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📄 License & Credits
Designed and Developed by Sravanth. Built with ❤️ using modern web and vision technologies.