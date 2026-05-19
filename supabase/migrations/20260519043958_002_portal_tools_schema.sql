/*
  # Portal Tools - News, Tickets, Meeting Rooms

  1. New Tables
    - `news` - Internal news/announcements
      - id, title, content, category, author_id, image_url, is_pinned, published_at, created_at, updated_at
    - `ticket_categories` - Ticket categories for routing
      - id, name, description, assigned_email, assigned_department, created_at
    - `tickets` - Support/request tickets
      - id, ticket_number, subject, description, category_id, status, priority, created_by, assigned_to, created_at, updated_at, resolved_at
    - `ticket_comments` - Comments on tickets
      - id, ticket_id, author_id, content, is_internal, created_at
    - `meeting_rooms` - Meeting room inventory
      - id, name, capacity, floor, equipment, image_url, is_active, created_at
    - `room_bookings` - Room reservation bookings
      - id, room_id, title, description, booked_by, attendees, start_time, end_time, status, created_at, updated_at

  2. Security
    - Enable RLS on all tables
    - Authenticated users can read all, create own, update own records
    - Admin-level operations restricted by ownership
*/

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  author_id uuid REFERENCES auth.users(id),
  image_url text DEFAULT '',
  is_pinned boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read news"
  ON news FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create news"
  ON news FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own news"
  ON news FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own news"
  ON news FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Ticket categories
CREATE TABLE IF NOT EXISTS ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  assigned_email text DEFAULT '',
  assigned_department text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ticket categories"
  ON ticket_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create ticket categories"
  ON ticket_categories FOR INSERT TO authenticated
  WITH CHECK (true);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL DEFAULT '',
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES ticket_categories(id),
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  created_by uuid REFERENCES auth.users(id),
  assigned_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tickets"
  ON tickets FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR assigned_to = auth.uid()::text);

CREATE POLICY "Authenticated users can create tickets"
  ON tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Ticket creators can update own tickets"
  ON tickets FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Ticket comments
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  content text NOT NULL DEFAULT '',
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ticket comments"
  ON ticket_comments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_comments.ticket_id));

CREATE POLICY "Authenticated users can create ticket comments"
  ON ticket_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Meeting rooms
CREATE TABLE IF NOT EXISTS meeting_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  floor text DEFAULT '',
  equipment text[] DEFAULT '{}',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read meeting rooms"
  ON meeting_rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create meeting rooms"
  ON meeting_rooms FOR INSERT TO authenticated
  WITH CHECK (true);

-- Room bookings
CREATE TABLE IF NOT EXISTS room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES meeting_rooms(id),
  title text NOT NULL,
  description text DEFAULT '',
  booked_by uuid REFERENCES auth.users(id),
  attendees text[] DEFAULT '{}',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read room bookings"
  ON room_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create room bookings"
  ON room_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = booked_by);

CREATE POLICY "Users can update own room bookings"
  ON room_bookings FOR UPDATE TO authenticated
  USING (auth.uid() = booked_by)
  WITH CHECK (auth.uid() = booked_by);

CREATE POLICY "Users can delete own room bookings"
  ON room_bookings FOR DELETE TO authenticated
  USING (auth.uid() = booked_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_time ON room_bookings(room_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_room_bookings_booked_by ON room_bookings(booked_by);

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS trigger AS $$
BEGIN
  NEW.ticket_number := 'TK-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('ticket_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_seq;

CREATE OR REPLACE TRIGGER trg_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number = '' OR NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- Seed ticket categories
INSERT INTO ticket_categories (name, description, assigned_email, assigned_department) VALUES
  ('IT Support', 'Ho tro ky thuat va may tinh', 'it@mcv.com.vn', 'IT'),
  ('HR', 'Van phong nhan su', 'hr@mcv.com.vn', 'Human Resources'),
  ('Admin', 'Ho tro hanh chinh van phong', 'admin@mcv.com.vn', 'Operations'),
  ('Facilities', 'Yeu cau co vat chat, bao tri', 'facilities@mcv.com.vn', 'Operations'),
  ('Finance', 'Van dong tai chinh, hoa don', 'finance@mcv.com.vn', 'Finance')
ON CONFLICT DO NOTHING;

-- Seed meeting rooms
INSERT INTO meeting_rooms (name, capacity, floor, equipment) VALUES
  ('Phong Hop A1', 8, 'Tang 1', ARRAY['Projector', 'Whiteboard', 'Video Call']),
  ('Phong Hop A2', 12, 'Tang 1', ARRAY['Projector', 'Whiteboard', 'Video Call', 'Sound System']),
  ('Phong Hop B1', 6, 'Tang 2', ARRAY['TV Screen', 'Whiteboard']),
  ('Phong Hop B2', 20, 'Tang 2', ARRAY['Projector', 'Microphone', 'Video Call', 'Sound System']),
  ('Phong Hop C1', 4, 'Tang 3', ARRAY['TV Screen']),
  ('Phong Hop VIP', 16, 'Tang 5', ARRAY['Projector', 'Microphone', 'Video Call', 'Sound System', 'Recording'])
ON CONFLICT DO NOTHING;
