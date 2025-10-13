import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Connect with Your{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Perfect Mentor
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Schedule mentoring sessions effortlessly. Choose your time, book instantly, and grow your skills with expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/mentor">
                <Button size="lg" className="text-lg px-8 shadow-glow hover:shadow-glow transition-all">
                  I'm a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/mentee">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  I'm a Mentee
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 animate-fade-in border-2 hover:border-primary">
            <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-soft">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Flexible Scheduling</h3>
            <p className="text-muted-foreground">
              Mentors can publish their availability in 30-minute slots throughout the week, making it easy for mentees to find the perfect time.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 animate-fade-in border-2 hover:border-accent" style={{ animationDelay: '0.1s' }}>
            <div className="h-16 w-16 rounded-full bg-gradient-accent mx-auto mb-6 flex items-center justify-center shadow-soft">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">30-Minute Sessions</h3>
            <p className="text-muted-foreground">
              Efficient, focused mentoring sessions from 9 AM to 6 PM on weekdays, designed to maximize learning and productivity.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 animate-fade-in border-2 hover:border-success" style={{ animationDelay: '0.2s' }}>
            <div className="h-16 w-16 rounded-full bg-success mx-auto mb-6 flex items-center justify-center shadow-soft">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Easy Booking</h3>
            <p className="text-muted-foreground">
              Browse available slots, select your preferred time, and book instantly. No complicated forms or waiting for confirmation.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Whether you're looking to share your expertise or learn from the best, our platform makes mentoring simple and effective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link to="/mentor">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-glow">
                Mentor Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/mentee">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white/30 hover:bg-white/20">
                Book a Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Mentor Booking Platform. Built with React & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
