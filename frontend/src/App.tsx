// frontend/src/App.tsx
import { useState, useEffect } from "react";
import { AttendancePage } from "./pages/AttendancePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const [currentView, setCurrentView] = useState<
    "public" | "login" | "dashboard"
  >("public");
  const [user, setUser] = useState<{
    username: string;
    role: "SUPER_ADMIN" | "SUPERVISOR";
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentView("public");
  };

  return (
    <div>
      <header className="bg-slate-900 text-white px-6 py-2 flex justify-between items-center text-sm">
        <h1 className="text-xl font-bold text-white-800">
          Field Attendance System{" "}
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
            v1.0.0
          </span>
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setCurrentView("public")}
            className={`hover:underline ${currentView === "public" ? "font-bold underline" : ""}`}
          >
            Public Check-In
          </button>
          {user ? (
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`hover:underline ${currentView === "dashboard" ? "font-bold underline" : ""}`}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => setCurrentView("login")}
              className={`hover:underline ${currentView === "login" ? "font-bold underline" : ""}`}
            >
              Admin Login
            </button>
          )}
        </div>
      </header>

      {currentView === "public" && <AttendancePage />}
      {currentView === "login" && (
        <LoginPage
          onLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentView("dashboard");
          }}
        />
      )}
      {currentView === "dashboard" && user && (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
