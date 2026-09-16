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
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  supervisor?: {
    id: string;
    username: string;
  } | null;
}

interface SupervisorOption {
  id: string;
  username: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"logs" | "students">("logs");
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [loading, setLoading] = useState(true);

  // New Student Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "students" && user.role === "SUPER_ADMIN") {
      fetchStudents();
      fetchSupervisors();
    }
  }, [activeTab, user.role]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get<AttendanceLog[]>("/admin/attendance-logs");
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get<Student[]>("/admin/students");
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await api.get<SupervisorOption[]>("/admin/supervisors");
      setSupervisors(response.data);
    } catch (err) {
      console.error("Failed to load supervisors:", err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/students", {
        firstName,
        lastName,
        phone,
        supervisorId: selectedSupervisorId || undefined,
      });
      setFormMsg("Student created successfully!");
      setFirstName("");
      setLastName("");
      setPhone("");
      setSelectedSupervisorId("");
      fetchStudents();
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || "Failed to create student.");
    }
  };

  const toggleStudentStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/admin/students/${id}`, { status: nextStatus });
      fetchStudents();
    } catch (err) {
      console.error("Failed to update student status:", err);
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Student Name,Phone,Type,Timestamp,Latitude,Longitude\n"];
    const rows = logs.map(
      (l) =>
        `"${l.student.firstName} ${l.student.lastName}",${l.student.phone},${l.type},"${new Date(l.timestamp).toLocaleString()}",${l.latitude},${l.longitude}`,
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Field Attendance Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            User: <span className="font-semibold">{user.username}</span> (
            {user.role})
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
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                activeTab === "logs"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border"
              }`}
            >
              Attendance Logs
            </button>
            {user.role === "SUPER_ADMIN" && (
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border"
                }`}
              >
                Manage Students
              </button>
            )}
          </div>

          {activeTab === "logs" && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* ATTENDANCE LOGS TAB */}
        {activeTab === "logs" && (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Type
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-slate-500"
                    >
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-slate-500"
                    >
                      No logs found.
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

        {/* STUDENTS TAB */}
        {activeTab === "students" && user.role === "SUPER_ADMIN" && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateStudent}
              className="bg-white p-6 shadow rounded-lg border border-slate-200 space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-800">
                Add New Student
              </h3>
              {formMsg && (
                <p className="text-sm text-blue-600 font-medium">{formMsg}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm bg-white text-slate-700"
                >
                  <option value="">Unassigned (No Supervisor)</option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.username}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Register Student
              </button>
            </form>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Assigned Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {st.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {st.supervisor ? st.supervisor.username : "Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            st.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleStudentStatus(st.id, st.status)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
