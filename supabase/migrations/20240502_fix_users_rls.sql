-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow admin to manage all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON users;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for reading users (allows authenticated users to read all users)
CREATE POLICY "Allow read access to all authenticated users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating users (users can update their own data)
CREATE POLICY "Allow users to update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for admin users (can do everything)
CREATE POLICY "Allow admin to manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy for inserting new users (anyone authenticated can create)
CREATE POLICY "Allow authenticated users to insert"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true); 