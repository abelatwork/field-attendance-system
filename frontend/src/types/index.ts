// frontend/src/types/index.ts
export type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type AttendanceType = "IN" | "OUT";

export type AttendancePayload = {
  studentId: string;
  type: AttendanceType;
  latitude: number;
  longitude: number;
  accuracy?: number;
};
