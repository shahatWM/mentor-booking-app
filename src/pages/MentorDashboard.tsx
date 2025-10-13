import { useState } from 'react';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeSlot } from '@/types/booking';
import { sampleMentors, generateSampleSlots, getDayName, getDayShortName } from '@/data/sampleData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const MentorDashboard = () => {
  const mentor = sampleMentors[0];
  const [slots, setSlots] = useState<TimeSlot[]>(generateSampleSlots(mentor.id));

  const toggleSlotAvailability = (slotId: string) => {
    setSlots(prevSlots =>
      prevSlots.map(slot => {
        if (slot.id === slotId && !slot.isBooked) {
          const newAvailability = !slot.isAvailable;
          toast.success(
            newAvailability 
              ? `Slot ${slot.time} on ${getDayName(slot.dayOfWeek)} is now available`
              : `Slot ${slot.time} on ${getDayName(slot.dayOfWeek)} is now unavailable`
          );
          return { ...slot, isAvailable: newAvailability };
        }
        return slot;
      })
    );
  };

  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday

  const getSlotForDayAndTime = (day: number, time: string) => {
    return slots.find(slot => slot.dayOfWeek === day && slot.time === time);
  };

  const uniqueTimes = [...new Set(slots.map(slot => slot.time))].sort();

  const bookedCount = slots.filter(s => s.isBooked).length;
  const availableCount = slots.filter(s => s.isAvailable && !s.isBooked).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{mentor.name}</h1>
                <p className="text-muted-foreground">{mentor.title}</p>
              </div>
            </div>
            <Link to="/mentee">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Switch to Mentee View
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-primary text-white shadow-glow animate-fade-in">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 opacity-90" />
              <div>
                <p className="text-sm opacity-90">Available Slots</p>
                <p className="text-3xl font-bold">{availableCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-accent text-white shadow-glow animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 opacity-90" />
              <div>
                <p className="text-sm opacity-90">Booked Sessions</p>
                <p className="text-3xl font-bold">{bookedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-2 border-primary animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Slots</p>
                <p className="text-3xl font-bold text-foreground">{slots.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Schedule Grid */}
        <Card className="p-6 shadow-soft animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Weekly Schedule</h2>
            <p className="text-muted-foreground">Click on time slots to toggle availability. Weekends are excluded.</p>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2">
                {/* Header */}
                <div className="font-semibold text-muted-foreground text-sm p-3">Time</div>
                {weekdays.map(day => (
                  <div key={day} className="font-semibold text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm text-foreground">{getDayShortName(day)}</div>
                  </div>
                ))}

                {/* Time slots */}
                {uniqueTimes.map(time => (
                  <>
                    <div key={`time-${time}`} className="text-sm text-muted-foreground p-3 flex items-center">
                      {time}
                    </div>
                    {weekdays.map(day => {
                      const slot = getSlotForDayAndTime(day, time);
                      if (!slot) return <div key={`${day}-${time}`} />;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => toggleSlotAvailability(slot.id)}
                          disabled={slot.isBooked}
                          className={`
                            p-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${slot.isBooked 
                              ? 'bg-success text-white cursor-not-allowed'
                              : slot.isAvailable
                                ? 'bg-primary text-white hover:bg-primary-hover shadow-soft hover:shadow-glow cursor-pointer'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer'
                            }
                          `}
                        >
                          {slot.isBooked ? (
                            <div className="text-xs">
                              <div>Booked</div>
                              <div className="opacity-80">{slot.menteeName}</div>
                            </div>
                          ) : slot.isAvailable ? (
                            'Available'
                          ) : (
                            'Unavailable'
                          )}
                        </button>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-6 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary"></div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted"></div>
              <span className="text-sm text-muted-foreground">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success"></div>
              <span className="text-sm text-muted-foreground">Booked</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;
