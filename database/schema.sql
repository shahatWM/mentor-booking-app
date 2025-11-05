-- Mentorship Booking Platform - PostgreSQL Schema
-- This schema supports mentor/mentee scheduling with recurring bookings

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User role types
CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'mentee');

-- Booking status types
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- Repeat pattern types
CREATE TYPE public.repeat_pattern AS ENUM ('none', 'daily', 'weekly', 'custom');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles Table
-- Stores basic profile information for all users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table
-- Manages user role assignments (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Mentors Table
-- Extended information for users with mentor role
CREATE TABLE public.mentors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    expertise TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Slots Table
-- Manages mentor availability slots
CREATE TABLE public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (mentor_id, day_of_week, time)
);

-- Bookings Table
-- Records all mentorship session bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
    mentee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time TIME NOT NULL,
    status booking_status DEFAULT 'confirmed',
    repeat_pattern repeat_pattern DEFAULT 'none',
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_end_date CHECK (end_date IS NULL OR end_date >= booking_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_mentors_is_active ON public.mentors(is_active);
CREATE INDEX idx_time_slots_mentor_id ON public.time_slots(mentor_id);
CREATE INDEX idx_time_slots_day_time ON public.time_slots(day_of_week, time);
CREATE INDEX idx_bookings_mentor_id ON public.bookings(mentor_id);
CREATE INDEX idx_bookings_mentee_id ON public.bookings(mentee_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin')
$$;

-- Function to check if user is mentor
CREATE OR REPLACE FUNCTION public.is_mentor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'mentor')
$$;

-- Function to check if user is mentee
CREATE OR REPLACE FUNCTION public.is_mentee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'mentee')
$$;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES - USER ROLES
-- ============================================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - MENTORS
-- ============================================================================

-- Anyone can view active mentors
CREATE POLICY "Anyone can view active mentors"
ON public.mentors
FOR SELECT
TO authenticated
USING (is_active = true);

-- Mentors can update their own profile
CREATE POLICY "Mentors can update own profile"
ON public.mentors
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND public.is_mentor(auth.uid()));

-- Admins can manage all mentors
CREATE POLICY "Admins can manage mentors"
ON public.mentors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - TIME SLOTS
-- ============================================================================

-- Anyone can view available time slots
CREATE POLICY "Anyone can view time slots"
ON public.time_slots
FOR SELECT
TO authenticated
USING (true);

-- Mentors can manage their own time slots
CREATE POLICY "Mentors can insert own time slots"
ON public.time_slots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = mentor_id AND public.is_mentor(auth.uid()));

CREATE POLICY "Mentors can update own time slots"
ON public.time_slots
FOR UPDATE
TO authenticated
USING (auth.uid() = mentor_id AND public.is_mentor(auth.uid()));

CREATE POLICY "Mentors can delete own time slots"
ON public.time_slots
FOR DELETE
TO authenticated
USING (auth.uid() = mentor_id AND public.is_mentor(auth.uid()));

-- ============================================================================
-- RLS POLICIES - BOOKINGS
-- ============================================================================

-- Mentors can view their bookings
CREATE POLICY "Mentors can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = mentor_id AND public.is_mentor(auth.uid()));

-- Mentees can view their bookings
CREATE POLICY "Mentees can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = mentee_id AND public.is_mentee(auth.uid()));

-- Mentees can create bookings
CREATE POLICY "Mentees can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = mentee_id AND public.is_mentee(auth.uid()));

-- Mentees can update their own bookings (cancel)
CREATE POLICY "Mentees can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = mentee_id AND public.is_mentee(auth.uid()));

-- Mentors can update bookings for their sessions
CREATE POLICY "Mentors can update session bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = mentor_id AND public.is_mentor(auth.uid()));

-- Admins can manage all bookings
CREATE POLICY "Admins can manage bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_mentors_updated_at
BEFORE UPDATE ON public.mentors
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_time_slots_updated_at
BEFORE UPDATE ON public.time_slots
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Note: Uncomment the sections below to populate with sample data

/*
-- Insert sample admin user role
INSERT INTO public.user_roles (user_id, role) VALUES
('your-admin-user-id', 'admin');

-- Insert sample mentors
INSERT INTO public.mentors (id, title, expertise, bio, years_of_experience, hourly_rate) VALUES
('mentor-uuid-1', 'Senior Software Architect', ARRAY['System Design', 'Cloud Architecture', 'Leadership'], 'Experienced architect with 15+ years in tech', 15, 150.00),
('mentor-uuid-2', 'Tech Lead', ARRAY['Frontend Development', 'React', 'TypeScript'], 'Passionate about building scalable web applications', 8, 100.00);

-- Insert sample time slots
INSERT INTO public.time_slots (mentor_id, day_of_week, time, is_available) VALUES
('mentor-uuid-1', 1, '09:00', true),
('mentor-uuid-1', 1, '10:00', true),
('mentor-uuid-2', 2, '14:00', true);
*/
