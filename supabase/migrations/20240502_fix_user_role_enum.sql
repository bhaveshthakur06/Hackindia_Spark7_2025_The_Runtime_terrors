-- Drop existing enum type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Recreate the enum type with the correct values
CREATE TYPE user_role AS ENUM ('admin', 'distributor', 'beneficiary');

-- Update the users table to use the new enum type
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role 
  USING role::user_role;

-- Add a check constraint to ensure only valid roles are used
ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'distributor', 'beneficiary'));

-- Update RLS policies to use the new enum type
DROP POLICY IF EXISTS "Allow admin to manage all users" ON users;
CREATE POLICY "Allow admin to manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role = 'admin'::user_role
  )
); 