import { useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [attendanceType, setAttendanceType] = useState<"IN" | "OUT" | "">("");

  const students = ["John Smith", "Mary Joseph", "Peter Michael", "Anna James"];

  const filteredStudents = students.filter((student) =>
    student.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Field Attendance
          </h1>

          <p className="mt-2 text-slate-500">Record your field attendance</p>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Student Search */}
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Student Name
          </label>

          <input
            type="text"
            placeholder="Type your name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedStudent("");
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Student Results */}
          {search && !selectedStudent && (
            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student}
                    onClick={() => {
                      setSelectedStudent(student);
                      setSearch(student);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 border-b last:border-b-0"
                  >
                    {student}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-slate-500">
                  No student found
                </p>
              )}
            </div>
          )}

          {/* Selected Student */}
          {selectedStudent && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Selected student</p>

              <p className="font-semibold text-slate-800">{selectedStudent}</p>
            </div>
          )}

          {/* Attendance Type */}
          {selectedStudent && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Attendance Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAttendanceType("IN")}
                  className={`py-3 rounded-lg font-semibold border ${
                    attendanceType === "IN"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  IN
                </button>

                <button
                  onClick={() => setAttendanceType("OUT")}
                  className={`py-3 rounded-lg font-semibold border ${
                    attendanceType === "OUT"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  OUT
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedStudent && attendanceType && (
            <button
              onClick={() =>
                alert(
                  "Attendance submission will be connected to the backend later.",
                )
              }
              className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Submit Attendance
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Field Attendance Management System
        </p>
      </div>
    </div>
  );
}

export default App;
