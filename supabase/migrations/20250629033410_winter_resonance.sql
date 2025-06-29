/*
  # Create player cards by season view

  1. New View
    - `player_cards_by_season`
      - Shows yellow and red cards per player per season
      - Aggregates data from cards table joined with matches and seasons
  
  2. Purpose
    - Provides season-by-season card statistics for players
    - Used in player detail modal for comprehensive stats
*/

CREATE OR REPLACE VIEW player_cards_by_season AS
SELECT 
  c.playerid,
  s.name as season,
  m.km_res as team,
  COUNT(CASE WHEN c.isred = false AND c.issecondyellow = false THEN 1 END) as yellow_cards,
  COUNT(CASE WHEN c.isred = true OR c.issecondyellow = true THEN 1 END) as red_cards
FROM cards c
JOIN matches m ON c.matchid = m.id
JOIN seasons s ON m.seasonid = s.id
GROUP BY c.playerid, s.name, m.km_res
ORDER BY c.playerid, s.name DESC;