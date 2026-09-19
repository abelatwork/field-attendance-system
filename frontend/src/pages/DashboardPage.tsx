// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

interface DashboardUser {
  id?: string;
  username: string;
  role: "SUPER_ADMIN" | "SUPERVISOR";
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  department?: string | null;
}

interface DashboardPageProps {
  user: DashboardUser;
  onLogout: () => void;
  onUserUpdate?: (user: DashboardUser) => void;
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
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

interface Supervisor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  role: "SUPER_ADMIN" | "SUPERVISOR";
}

interface SupervisorOption {
  id: string;
  label: string;
  username?: string;
}

interface SupervisorForm {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  role: "SUPER_ADMIN" | "SUPERVISOR";
}

const emptySupervisorForm: SupervisorForm = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  department: "",
  role: "SUPERVISOR",
};

const formatDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
  fallbackUsername?: string,
) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || fallbackUsername || "Unknown";
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onLogout,
  onUserUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    "logs" | "account" | "students" | "supervisors"
  >("logs");
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<
    SupervisorOption[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const [supervisorForm, setSupervisorForm] =
    useState<SupervisorForm>(emptySupervisorForm);
  const [editingSupervisorId, setEditingSupervisorId] = useState<string | null>(
    null,
  );
  const [supervisorMessage, setSupervisorMessage] = useState<string | null>(
    null,
  );
  const [accountForm, setAccountForm] = useState({
    username: user.username,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    department: user.department ?? "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  useEffect(() => {
    setAccountForm({
      username: user.username,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      department: user.department ?? "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
    setAccountMessage(null);
  }, [
    user.username,
    user.firstName,
    user.lastName,
    user.phone,
    user.department,
  ]);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "students" && user.role === "SUPER_ADMIN") {
      fetchStudents();
      fetchSupervisors();
    }
    if (activeTab === "supervisors" && user.role === "SUPER_ADMIN") {
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
      const response = await api.get<Supervisor[]>("/admin/supervisors");
      setSupervisors(response.data);
      setSupervisorOptions(
        response.data
          .filter((supervisor) => supervisor.role === "SUPERVISOR")
          .map((supervisor) => ({
            id: supervisor.id,
            label: formatDisplayName(
              supervisor.firstName,
              supervisor.lastName,
              supervisor.username,
            ),
            username: supervisor.username,
          })),
      );
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

  const resetSupervisorForm = () => {
    setSupervisorForm(emptySupervisorForm);
    setEditingSupervisorId(null);
    setSupervisorMessage(null);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = accountForm.username.trim();
    const trimmedFirstName = accountForm.firstName.trim();
    const trimmedLastName = accountForm.lastName.trim();
    const trimmedPhone = accountForm.phone.trim();
    const trimmedDepartment = accountForm.department.trim();
    const hasPasswordChange = Boolean(
      accountForm.password || accountForm.confirmPassword,
    );

    if (!trimmedUsername) {
      setAccountMessage("Username is required.");
      return;
    }

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedPhone ||
      !trimmedDepartment
    ) {
      setAccountMessage(
        "First name, last name, phone number, and department are required.",
      );
      return;
    }

    if (hasPasswordChange) {
      if (!accountForm.currentPassword.trim()) {
        setAccountMessage(
          "Current password is required to change your password.",
        );
        return;
      }

      if (accountForm.password !== accountForm.confirmPassword) {
        setAccountMessage("New password and confirmation do not match.");
        return;
      }

      if (accountForm.password.length < 6) {
        setAccountMessage("Password must be at least 6 characters long.");
        return;
      }
    }

    try {
      const response = await api.patch("/auth/account", {
        username: trimmedUsername,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone: trimmedPhone,
        department: trimmedDepartment,
        ...(hasPasswordChange
          ? {
              currentPassword: accountForm.currentPassword,
              password: accountForm.password,
            }
          : {}),
      });

      const { user: updatedUser } = response.data;
      setAccountMessage("Account updated successfully.");
      setAccountForm({
        username: updatedUser.username,
        firstName: updatedUser.firstName ?? "",
        lastName: updatedUser.lastName ?? "",
        phone: updatedUser.phone ?? "",
        department: updatedUser.department ?? "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (err: any) {
      setAccountMessage(
        err.response?.data?.message || "Failed to update account details.",
      );
    }
  };

  const handleSupervisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username: supervisorForm.username.trim(),
      password: supervisorForm.password,
      firstName: supervisorForm.firstName.trim(),
      lastName: supervisorForm.lastName.trim(),
      phone: supervisorForm.phone.trim(),
      department: supervisorForm.department.trim(),
      role: supervisorForm.role,
    };

    try {
      if (editingSupervisorId) {
        const { password, ...rest } = payload;
        const updatePayload = {
          ...rest,
          ...(password ? { password } : {}),
        };
        await api.patch(
          `/admin/supervisors/${editingSupervisorId}`,
          updatePayload,
        );
        setSupervisorMessage("Supervisor updated successfully.");
      } else {
        if (!payload.password) {
          setSupervisorMessage(
            "Password is required when creating a supervisor.",
          );
          return;
        }
        await api.post("/admin/supervisors", payload);
        setSupervisorMessage("Supervisor added successfully.");
      }

      resetSupervisorForm();
      fetchSupervisors();
    } catch (err: any) {
      setSupervisorMessage(
        err.response?.data?.message || "Failed to save supervisor details.",
      );
    }
  };

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setEditingSupervisorId(supervisor.id);
    setSupervisorForm({
      username: supervisor.username,
      password: "",
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
      phone: supervisor.phone,
      department: supervisor.department,
      role: supervisor.role,
    });
    setSupervisorMessage(null);
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (
      !window.confirm(
        "Delete this supervisor account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/supervisors/${id}`);
      setSupervisorMessage("Supervisor deleted successfully.");
      if (editingSupervisorId === id) resetSupervisorForm();
      fetchSupervisors();
    } catch (err: any) {
      setSupervisorMessage(
        err.response?.data?.message || "Failed to delete supervisor.",
      );
    }
  };

  const handleToggleSupervisorRole = async (supervisor: Supervisor) => {
    const nextRole =
      supervisor.role === "SUPER_ADMIN" ? "SUPERVISOR" : "SUPER_ADMIN";

    try {
      await api.patch(`/admin/supervisors/${supervisor.id}/role`, {
        role: nextRole,
      });
      setSupervisorMessage(`Supervisor role updated to ${nextRole}.`);
      fetchSupervisors();
    } catch (err: any) {
      setSupervisorMessage(
        err.response?.data?.message || "Failed to update supervisor role.",
      );
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

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username;

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Field Attendance Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            User: <span className="font-semibold">{displayName}</span> (
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
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                activeTab === "account"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border"
              }`}
            >
              Account
            </button>
            {user.role === "SUPER_ADMIN" && (
              <>
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
                <button
                  onClick={() => setActiveTab("supervisors")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                    activeTab === "supervisors"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 border"
                  }`}
                >
                  Manage Supervisors
                </button>
              </>
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

        {activeTab === "account" && (
          <form
            onSubmit={handleAccountSubmit}
            className="bg-white p-6 shadow rounded-lg border border-slate-200 space-y-4 max-w-2xl"
          >
            <h3 className="text-lg font-bold text-slate-800">
              Account Settings
            </h3>
            {accountMessage && (
              <p className="text-sm text-blue-700 font-medium">
                {accountMessage}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                required
                value={accountForm.username}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, username: e.target.value })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />

              <input
                type="text"
                placeholder="First Name"
                required
                value={accountForm.firstName}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, firstName: e.target.value })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />

              <input
                type="text"
                placeholder="Last Name"
                required
                value={accountForm.lastName}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, lastName: e.target.value })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />

              <input
                type="text"
                placeholder="Phone Number"
                required
                value={accountForm.phone}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, phone: e.target.value })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />

              <input
                type="text"
                placeholder="Department"
                required
                value={accountForm.department}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    department: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg text-sm sm:col-span-2"
              />

              <input
                type="password"
                placeholder="Current Password"
                value={accountForm.currentPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    currentPassword: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg text-sm sm:col-span-2"
              />

              <input
                type="password"
                placeholder="New Password"
                value={accountForm.password}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, password: e.target.value })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={accountForm.confirmPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="px-4 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Update Account
            </button>
          </form>
        )}

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
                  {supervisorOptions.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.label}
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
                        {st.supervisor
                          ? formatDisplayName(
                              st.supervisor.firstName,
                              st.supervisor.lastName,
                              st.supervisor.username,
                            )
                          : "Unassigned"}
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

        {activeTab === "supervisors" && user.role === "SUPER_ADMIN" && (
          <div className="space-y-6">
            <form
              onSubmit={handleSupervisorSubmit}
              className="bg-white p-6 shadow rounded-lg border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingSupervisorId
                    ? "Edit Supervisor"
                    : "Add New Supervisor"}
                </h3>
                {editingSupervisorId && (
                  <button
                    type="button"
                    onClick={resetSupervisorForm}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {supervisorMessage && (
                <p className="text-sm text-blue-700 font-medium">
                  {supervisorMessage}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={supervisorForm.username}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      username: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                {!editingSupervisorId && (
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={supervisorForm.password}
                    onChange={(e) =>
                      setSupervisorForm({
                        ...supervisorForm,
                        password: e.target.value,
                      })
                    }
                    className="px-4 py-2 border rounded-lg text-sm"
                  />
                )}
                {editingSupervisorId && (
                  <input
                    type="password"
                    placeholder="New password (optional)"
                    value={supervisorForm.password}
                    onChange={(e) =>
                      setSupervisorForm({
                        ...supervisorForm,
                        password: e.target.value,
                      })
                    }
                    className="px-4 py-2 border rounded-lg text-sm"
                  />
                )}
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={supervisorForm.firstName}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      firstName: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={supervisorForm.lastName}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      lastName: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={supervisorForm.phone}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      phone: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Department"
                  required
                  value={supervisorForm.department}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      department: e.target.value,
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm"
                />
                <select
                  value={supervisorForm.role}
                  onChange={(e) =>
                    setSupervisorForm({
                      ...supervisorForm,
                      role: e.target.value as "SUPER_ADMIN" | "SUPERVISOR",
                    })
                  }
                  className="px-4 py-2 border rounded-lg text-sm bg-white text-slate-700"
                >
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                {editingSupervisorId ? "Save Changes" : "Create Supervisor"}
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
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {supervisors.map((supervisor) => (
                    <tr key={supervisor.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {formatDisplayName(
                          supervisor.firstName,
                          supervisor.lastName,
                          supervisor.username,
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {supervisor.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {supervisor.department || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            supervisor.role === "SUPER_ADMIN"
                              ? "bg-violet-100 text-violet-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {supervisor.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleEditSupervisor(supervisor)}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleSupervisorRole(supervisor)}
                          className="font-semibold text-violet-600 hover:underline"
                        >
                          {supervisor.role === "SUPER_ADMIN"
                            ? "Demote"
                            : "Promote"}
                        </button>
                        <button
                          onClick={() => handleDeleteSupervisor(supervisor.id)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Delete
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
