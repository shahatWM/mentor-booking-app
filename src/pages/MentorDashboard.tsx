import { useState } from 'react';
import { Calendar, Clock, User, ChevronRight, ChevronLeft, RotateCcw, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeSlot } from '@/types/booking';
import { sampleMentors, generateSampleSlots, getDayName, getDayShortName } from '@/data/sampleData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const MentorDashboard = () => {
  const mentor = sampleMentors[0];
  const [slots, setSlots] = useState<TimeSlot[]>(generateSampleSlots(mentor.id));
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week
  const [selectedBookedSlot, setSelectedBookedSlot] = useState<TimeSlot | null>(null);
  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [repeatSlot, setRepeatSlot] = useState<TimeSlot | null>(null);
  const [repeatPattern, setRepeatPattern] = useState<'none' | 'daily' | 'weekly'>('none');

  const maxWeeksAhead = 26; // 6 months

  const getWeekDateRange = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7));
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return `${formatDate(monday)} - ${formatDate(friday)}`;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isBooked) {
      setSelectedBookedSlot(slot);
    } else {
      setRepeatSlot(slot);
      setShowRepeatDialog(true);
    }
  };

  const applyAvailabilityChange = (slot: TimeSlot, pattern: 'none' | 'daily' | 'weekly') => {
    const newAvailability = !slot.isAvailable;
    
    if (pattern === 'none') {
      setSlots(prevSlots =>
        prevSlots.map(s => 
          s.id === slot.id ? { ...s, isAvailable: newAvailability } : s
        )
      );
      toast.success(
        newAvailability 
          ? `Slot ${slot.time} on ${getDayName(slot.dayOfWeek)} is now available`
          : `Slot ${slot.time} on ${getDayName(slot.dayOfWeek)} is now unavailable`
      );
    } else if (pattern === 'daily') {
      setSlots(prevSlots =>
        prevSlots.map(s => 
          s.time === slot.time ? { ...s, isAvailable: newAvailability } : s
        )
      );
      toast.success(
        newAvailability 
          ? `All ${slot.time} slots are now available daily`
          : `All ${slot.time} slots are now unavailable daily`
      );
    } else if (pattern === 'weekly') {
      setSlots(prevSlots =>
        prevSlots.map(s => 
          s.dayOfWeek === slot.dayOfWeek && s.time === slot.time 
            ? { ...s, isAvailable: newAvailability } 
            : s
        )
      );
      toast.success(
        newAvailability 
          ? `${slot.time} on ${getDayName(slot.dayOfWeek)}s is now available weekly`
          : `${slot.time} on ${getDayName(slot.dayOfWeek)}s is now unavailable weekly`
      );
    }
    
    setShowRepeatDialog(false);
    setRepeatSlot(null);
    setRepeatPattern('none');
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
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{getWeekDateRange(currentWeekOffset)}</h2>
              <p className="text-muted-foreground">Click on slots to toggle or set repeat patterns. Click booked slots for details.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekOffset(Math.max(-1, currentWeekOffset - 1))}
                disabled={currentWeekOffset <= -1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentWeekOffset(0)}
                disabled={currentWeekOffset === 0}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Current Week
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekOffset(Math.min(maxWeeksAhead, currentWeekOffset + 1))}
                disabled={currentWeekOffset >= maxWeeksAhead}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
                          onClick={() => handleSlotClick(slot)}
                          className={`
                            p-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${slot.isBooked 
                              ? 'bg-success text-white cursor-pointer hover:brightness-110'
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

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBookedSlot} onOpenChange={(open) => !open && setSelectedBookedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View the details of this booked session
            </DialogDescription>
          </DialogHeader>
          {selectedBookedSlot && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mentee:</span>
                    <span className="font-medium">{selectedBookedSlot.menteeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Day:</span>
                    <span className="font-medium">{getDayName(selectedBookedSlot.dayOfWeek)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedBookedSlot.time}</span>
                  </div>
                  {selectedBookedSlot.bookingDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking Date:</span>
                      <span className="font-medium">{new Date(selectedBookedSlot.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repeat:</span>
                    <Badge variant="outline">
                      {selectedBookedSlot.repeatPattern === 'daily' && 'Daily'}
                      {selectedBookedSlot.repeatPattern === 'weekly' && 'Weekly'}
                      {selectedBookedSlot.repeatPattern === 'custom' && 'Custom'}
                      {(!selectedBookedSlot.repeatPattern || selectedBookedSlot.repeatPattern === 'none') && 'One-time'}
                    </Badge>
                  </div>
                  {selectedBookedSlot.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Date:</span>
                      <span className="font-medium">{new Date(selectedBookedSlot.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-success text-white">Confirmed</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Repeat Pattern Dialog */}
      <Dialog open={showRepeatDialog} onOpenChange={(open) => {
        if (!open) {
          setShowRepeatDialog(false);
          setRepeatSlot(null);
          setRepeatPattern('none');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Schedule Availability
            </DialogTitle>
            <DialogDescription>
              {repeatSlot && `Configure availability for ${repeatSlot.time} on ${getDayName(repeatSlot.dayOfWeek)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Repeat Pattern</Label>
              <Select value={repeatPattern} onValueChange={(value: any) => setRepeatPattern(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">This slot only</SelectItem>
                  <SelectItem value="daily">Every day at this time</SelectItem>
                  <SelectItem value="weekly">Every {repeatSlot && getDayName(repeatSlot.dayOfWeek)} at this time</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {repeatPattern === 'none' && 'Change availability for this specific slot'}
                {repeatPattern === 'daily' && `Apply to all ${repeatSlot?.time} slots across all weekdays`}
                {repeatPattern === 'weekly' && repeatSlot && `Apply to all ${repeatSlot.time} slots on ${getDayName(repeatSlot.dayOfWeek)}s`}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowRepeatDialog(false);
              setRepeatSlot(null);
              setRepeatPattern('none');
            }}>
              Cancel
            </Button>
            <Button onClick={() => repeatSlot && applyAvailabilityChange(repeatSlot, repeatPattern)}>
              {repeatSlot?.isAvailable ? 'Make Unavailable' : 'Make Available'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorDashboard;
