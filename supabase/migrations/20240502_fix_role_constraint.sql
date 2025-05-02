-- Drop the existing constraint and type
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
DROP TYPE IF EXISTS user_role CASCADE;

-- Recreate the type
CREATE TYPE user_role AS ENUM ('admin', 'distributor', 'beneficiary');

-- Update the column to use the new type
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role 
  USING role::text::user_role;

-- Add the constraint back
ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role::text IN ('admin', 'distributor', 'beneficiary')); 