export interface TimeSlot {
  id: string;
  mentorId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // "09:00", "09:30", etc.
  isAvailable: boolean;
  isBooked: boolean;
  menteeId?: string;
  menteeName?: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  avatarUrl: string;
}

export interface Booking {
  id: string;
  slotId: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  dayOfWeek: number;
  time: string;
  date: string;
  status: 'confirmed' | 'cancelled';
}
