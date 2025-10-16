import { Mentor, TimeSlot } from '@/types/booking';

export const sampleMentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Dr. Sarah Chen',
    title: 'Senior Software Architect',
    expertise: ['System Design', 'Cloud Architecture', 'Leadership'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 'mentor-2',
    name: 'Michael Rodriguez',
    title: 'Tech Lead',
    expertise: ['Frontend Development', 'React', 'TypeScript'],
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  },
];

// Generate time slots from 9am to 6pm in 30-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Generate sample slots for weekdays (Monday-Friday)
export const generateSampleSlots = (mentorId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  // Weekdays only (1-5 = Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    timeSlots.forEach((time, index) => {
      // Randomly make some slots available for demo purposes
      const isAvailable = Math.random() > 0.4;
      const isBooked = isAvailable && Math.random() > 0.8;
      
      const randomRepeat = Math.random();
      const repeatPattern = randomRepeat > 0.7 ? 'weekly' : randomRepeat > 0.4 ? 'daily' : 'none';
      const hasEndDate = repeatPattern !== 'none' && Math.random() > 0.5;
      
      slots.push({
        id: `slot-${mentorId}-${day}-${index}`,
        mentorId,
        dayOfWeek: day,
        time,
        isAvailable,
        isBooked,
        ...(isBooked && {
          menteeId: 'mentee-1',
          menteeName: 'Alex Johnson',
          repeatPattern: repeatPattern as 'none' | 'daily' | 'weekly',
          bookingDate: new Date().toISOString(),
          ...(hasEndDate && {
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
          })
        })
      });
    });
  }
  
  return slots;
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

export const getDayShortName = (dayOfWeek: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
};
