// frontend/src/pages/AttendancePage.tsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { StudentOption, AttendanceType } from "../types";

export const AttendancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(
    null,
  );
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("IN");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Autocomplete student lookup
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await api.get<StudentOption[]>(
          `/attendance/search-students?q=${encodeURIComponent(searchQuery)}`,
        );
        setSuggestions(response.data);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Capture GPS Location
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setLoadingLocation(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        setMessage({
          type: "error",
          text: "Location permission denied. Please allow location access.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Submit Attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      setMessage({
        type: "error",
        text: "Please search and select your name.",
      });
      return;
    }

    if (!coords) {
      setMessage({
        type: "error",
        text: "Please capture your GPS location before submitting.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post("/attendance/check", {
        studentId: selectedStudent.id,
        type: attendanceType,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });

      setMessage({ type: "success", text: response.data.message });
      setSelectedStudent(null);
      setSearchQuery("");
      setCoords(null);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to submit attendance.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Field Attendance Portal
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select your name and submit your attendance record.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md rounded-xl sm:px-10 border border-slate-100">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Search Name
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type your name..."
                  value={
                    selectedStudent
                      ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                      : searchQuery
                  }
                  onChange={(e) => {
                    setSelectedStudent(null);
                    setSearchQuery(e.target.value);
                  }}
                />

                {suggestions.length > 0 && !selectedStudent && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {suggestions.map((student) => (
                      <li
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setSuggestions([]);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <div className="font-medium text-slate-800">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {student.phone}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAttendanceType("IN")}
                  className={`py-3 text-center rounded-lg font-semibold transition-all ${
                    attendanceType === "IN"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Check IN
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceType("OUT")}
                  className={`py-3 text-center rounded-lg font-semibold transition-all ${
                    attendanceType === "OUT"
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Check OUT
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location Status
              </label>
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={loadingLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 font-medium"
              >
                {loadingLocation
                  ? "Capturing location..."
                  : coords
                    ? "Location Captured ✓"
                    : "Allow GPS Access"}
              </button>
              {coords && (
                <p className="mt-1 text-xs text-slate-500 text-center">
                  Lat: {coords.latitude.toFixed(4)}, Long:{" "}
                  {coords.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudent || !coords}
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Attendance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
