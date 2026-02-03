-- PostgreSQL Schema für Fels Servicebetrieb
-- Führen Sie dieses Schema in Ihrer Supabase-Datenbank aus

-- Enums erstellen
CREATE TYPE user_role AS ENUM ('Administrator', 'Mitarbeiter');
CREATE TYPE job_status AS ENUM ('offen', 'in_bearbeitung', 'abgeschlossen');
CREATE TYPE absence_type AS ENUM ('urlaub', 'sonstige');
CREATE TYPE absence_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_form_type AS ENUM ('Tagesbericht', 'Leistungsbericht');
CREATE TYPE emergency_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE emergency_status AS ENUM ('open', 'in_progress', 'resolved');

-- Users Tabelle
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Mitarbeiter',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles Tabelle
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Tabelle
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT DEFAULT '',
    customer VARCHAR(255) DEFAULT '',
    workers TEXT[] DEFAULT '{}',
    equipment TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    color VARCHAR(50) DEFAULT '#3b82f6',
    all_day BOOLEAN DEFAULT false,
    multi_day_group_id TEXT,
    is_first_day BOOLEAN,
    is_last_day BOOLEAN,
    job_group_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Tabelle
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    street TEXT,
    postal_code VARCHAR(20),
    report_form report_form_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Persons Tabelle
CREATE TABLE contact_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs Tabelle
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    contact_person_id UUID NOT NULL REFERENCES contact_persons(id) ON DELETE CASCADE,
    street TEXT DEFAULT '',
    postal_code VARCHAR(20) DEFAULT '',
    description TEXT DEFAULT '',
    status job_status DEFAULT 'offen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Absences Tabelle
CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT DEFAULT '',
    absence_type absence_type DEFAULT 'urlaub',
    custom_reason TEXT,
    status absence_status DEFAULT 'pending',
    requires_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergencies Tabelle
CREATE TABLE emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    priority emergency_priority DEFAULT 'medium',
    status emergency_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Tabelle (für Benutzereinstellungen wie Dark Mode)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- Indizes für bessere Performance
CREATE INDEX idx_appointments_start_date ON appointments(start_date);
CREATE INDEX idx_appointments_end_date ON appointments(end_date);
CREATE INDEX idx_appointments_multi_day_group_id ON appointments(multi_day_group_id);
CREATE INDEX idx_absences_user_id ON absences(user_id);
CREATE INDEX idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_contact_persons_customer_id ON contact_persons(customer_id);
CREATE INDEX idx_settings_user_key ON settings(user_id, key);

-- Trigger für automatisches updated_at Update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_persons_updated_at BEFORE UPDATE ON contact_persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_absences_updated_at BEFORE UPDATE ON absences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergencies_updated_at BEFORE UPDATE ON emergencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Einfache RLS Policies (für Entwicklung - in Produktion anpassen!)
-- Diese Policies erlauben allen authentifizierten Benutzern vollen Zugriff
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow all for appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all for customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for contact_persons" ON contact_persons FOR ALL USING (true);
CREATE POLICY "Allow all for jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all for absences" ON absences FOR ALL USING (true);
CREATE POLICY "Allow all for emergencies" ON emergencies FOR ALL USING (true);
CREATE POLICY "Allow all for settings" ON settings FOR ALL USING (true);

-- Initial Admin User (Passwort: admin - in Produktion ändern!)
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin', 'Administrator', 'Administrator');
