// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

interface DashboardPageProps {
  user: { username: string; role: "SUPER_ADMIN" | "SUPERVISOR" };
  onLogout: () => void;
}

interface AttendanceLog {
  id: string;
  type: "IN" | "OUT";
  timestamp: string;
  latitude: number;
  longitude: number;
  student: {
    firstName: string;
    lastName: string;
    phone: string;
    supervisor?: { username: string };
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onLogout,
}) => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get<AttendanceLog[]>("/admin/attendance-logs");
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Field Attendance System
          </h1>
          <p className="text-xs text-slate-500">
            Logged in as: <span className="font-semibold">{user.username}</span>{" "}
            ({user.role})
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Attendance Records
          </h2>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading attendance records...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-slate-500"
                    >
                      No attendance logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {log.student.firstName} {log.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            log.type === "IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Check {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
