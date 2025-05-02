-- Create enum types for user roles and status
CREATE TYPE user_role AS ENUM ('admin', 'distributor', 'beneficiary');
CREATE TYPE eligibility_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    email TEXT,
    wallet_address TEXT,
    govt_id TEXT,
    phone TEXT,
    role user_role NOT NULL,
    location TEXT,
    family_size INTEGER,
    eligibility_status eligibility_status DEFAULT 'pending',
    assigned_center TEXT,
    status TEXT DEFAULT 'active'
);

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_of_measure TEXT NOT NULL,
    quantity_available INTEGER DEFAULT 0,
    expiry_date DATE,
    image TEXT
);

-- Create stock_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS stock_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    distributor_id UUID REFERENCES users(id),
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    metadata_cid TEXT,
    transaction_hash TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (distributor_id) REFERENCES users(id)
);

-- Create claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    beneficiary_id UUID REFERENCES users(id),
    stock_id UUID REFERENCES stock_records(id),
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    claimed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_hash TEXT,
    transaction_hash TEXT,
    FOREIGN KEY (beneficiary_id) REFERENCES users(id),
    FOREIGN KEY (stock_id) REFERENCES stock_records(id)
);

-- Create the distributors table
CREATE TABLE IF NOT EXISTS public.distributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    wallet_address TEXT,
    govt_id TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    assigned_center TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributors_name ON public.distributors(name);
CREATE INDEX IF NOT EXISTS idx_distributors_govt_id ON public.distributors(govt_id);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON public.distributors(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.distributors
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.distributors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.distributors
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.distributors
    FOR DELETE USING (true);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Allow read access to all authenticated users" ON users
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update their own data" ON users
FOR UPDATE TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Allow admin to manage all users" ON users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND role = 'admin'
    )
);

-- Policies for inventory table
CREATE POLICY "Allow read access to inventory" ON inventory
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage inventory" ON inventory
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND role = 'admin'
    )
);

-- Policies for stock_records table
CREATE POLICY "Allow read access to stock records" ON stock_records
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow distributors to manage their stock records" ON stock_records
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND (role = 'distributor' OR role = 'admin')
    )
);

-- Policies for claims table
CREATE POLICY "Allow read access to claims" ON claims
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow beneficiaries to view their claims" ON claims
FOR SELECT TO authenticated
USING (
    beneficiary_id::text = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND (role = 'admin' OR role = 'distributor')
    )
);

CREATE POLICY "Allow beneficiaries to create claims" ON claims
FOR INSERT TO authenticated
WITH CHECK (
    beneficiary_id::text = auth.uid()::text
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND role = 'admin'
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON users(wallet_address);
CREATE INDEX IF NOT EXISTS stock_records_distributor_id_idx ON stock_records(distributor_id);
CREATE INDEX IF NOT EXISTS claims_beneficiary_id_idx ON claims(beneficiary_id);
CREATE INDEX IF NOT EXISTS claims_stock_id_idx ON claims(stock_id); 