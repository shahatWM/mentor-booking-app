import { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeSlot } from '@/types/booking';
import { sampleMentors, generateSampleSlots, getDayName } from '@/data/sampleData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MenteeDashboard = () => {
  const mentor = sampleMentors[0];
  const [slots, setSlots] = useState<TimeSlot[]>(generateSampleSlots(mentor.id));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleBookSlot = () => {
    if (!selectedSlot) {
      return;
    }

    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.id === selectedSlot.id
          ? { ...slot, isBooked: true, menteeId: 'mentee-current', menteeName: 'Current User' }
          : slot
      )
    );

    toast.success(`Successfully booked ${selectedSlot.time} on ${getDayName(selectedSlot.dayOfWeek)}!`);
    setSelectedSlot(null);
  };

  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
  const availableSlots = slots.filter(s => s.isAvailable && !s.isBooked);
  const filteredSlots = selectedDay 
    ? availableSlots.filter(s => s.dayOfWeek === selectedDay)
    : availableSlots;

  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Book a Mentoring Session</h1>
              <p className="text-muted-foreground">Select an available time slot with your mentor</p>
            </div>
            <Link to="/mentor">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Mentor View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Mentor Card */}
        <Card className="p-6 mb-8 shadow-soft animate-fade-in bg-gradient-primary text-white">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold shadow-glow backdrop-blur-sm">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{mentor.name}</h2>
              <p className="text-white/90 mb-3">{mentor.title}</p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-5 w-5 fill-yellow-300 text-yellow-300" />
              ))}
            </div>
          </div>
        </Card>

        {/* Day Filter */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-foreground mb-3">Filter by Day</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedDay === null ? 'default' : 'outline'}
              onClick={() => setSelectedDay(null)}
              className="transition-all"
            >
              All Days
            </Button>
            {weekdays.map(day => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                onClick={() => setSelectedDay(day)}
                className="transition-all"
              >
                {getDayName(day)}
              </Button>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        {Object.keys(groupedSlots).length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Available Slots</h3>
            <p className="text-muted-foreground">
              {selectedDay 
                ? `No available slots on ${getDayName(selectedDay)}. Try selecting a different day.`
                : 'There are no available slots at the moment. Please check back later.'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, daySlots], index) => (
                <Card key={day} className="p-6 shadow-soft animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {getDayName(Number(day))}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {daySlots.map(slot => (
                      <Button
                        key={slot.id}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all hover:shadow-soft group"
                        onClick={() => {
                          setSelectedSlot(slot);
                        }}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                        <span className="font-semibold">{slot.time}</span>
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-2 border-accent animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
                <p className="text-3xl font-bold text-foreground">{availableSlots.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-2 border-primary animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session Duration</p>
                <p className="text-3xl font-bold text-foreground">30 min</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Mentoring Session</DialogTitle>
            <DialogDescription>
              Confirm your booking for {selectedSlot?.time} on {selectedSlot && getDayName(selectedSlot.dayOfWeek)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-4 bg-muted">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mentor:</span>
                  <span className="font-medium">{mentor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Day:</span>
                  <span className="font-medium">{selectedSlot && getDayName(selectedSlot.dayOfWeek)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedSlot?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">30 minutes</span>
                </div>
              </div>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>
              Cancel
            </Button>
            <Button onClick={handleBookSlot}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenteeDashboard;
