/*
  # Create voting table for season awards

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `voter_name` (text, required)
      - `newcomer_vote` (text, required)
      - `player_of_season_vote` (text, required)
      - `most_improved_vote` (text, required)
      - `created_at` (timestamp)
      - `ip_address` (text, for duplicate prevention)

  2. Security
    - Enable RLS on `votes` table
    - Add policy for public insert access
    - Add policy for admin read access

  3. Constraints
    - Ensure valid vote options
    - Prevent duplicate votes from same IP
*/

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_name text NOT NULL,
  newcomer_vote text NOT NULL CHECK (newcomer_vote IN ('JEFIMIC Nedeljko', 'IZVERNAR Iosif-Cornel', 'ZIVKOVIC Stefan', 'RAMHAPP Elias', 'SULJIC Mathias')),
  player_of_season_vote text NOT NULL CHECK (player_of_season_vote IN ('SAGIROGLU Ogulcan', 'ANICIC-ZUPARIC Lukas', 'PRIBILL Adrian', 'JORGANOVIC Philipp', 'ULUSOY Burak')),
  most_improved_vote text NOT NULL CHECK (most_improved_vote IN ('SCHUCKERT Luca', 'SAGIROGLU Ogulcan', 'ZIER Alessandro', 'DRAGONI Paul', 'MOSER Sebastian')),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert votes
CREATE POLICY "Anyone can submit votes"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to read all votes
CREATE POLICY "Admins can read all votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Create unique constraint to prevent duplicate votes from same IP
CREATE UNIQUE INDEX IF NOT EXISTS votes_ip_address_unique 
ON votes (ip_address) 
WHERE ip_address IS NOT NULL;