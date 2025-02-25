'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy, Save, Users, Goal, Clock, Award, AlertTriangle, Check, Search } from 'lucide-react'
import type { MatchDetail, Player } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface EditGameProps {
  match: MatchDetail
  onBack: () => void
  players: Player[]
  onUpdate: () => void
}

export default function EditGame({ match, onBack, players, onUpdate }: EditGameProps) {
  const [activeTab, setActiveTab] = useState<'result' | 'lineup' | 'goals' | 'subs' | 'cards'>('result')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Result is always stored from FC Patron's perspective in DB
  // Need to swap scores if it's an away game
  const [homeScore, setHomeScore] = useState<string>(
    match.ishomegame 
      ? match.result?.split(':')[0] || '' 
      : match.result?.split(':')[1] || ''
  )
  const [awayScore, setAwayScore] = useState<string>(
    match.ishomegame 
      ? match.result?.split(':')[1] || ''
      : match.result?.split(':')[0] || ''
  )

  // For events tab, we need Patron's score regardless of home/away
  const [patronScore, setPatronScore] = useState<number>(
    match.ishomegame 
      ? parseInt(match.result?.split(':')[0] || '0') 
      : parseInt(match.result?.split(':')[1] || '0')
  )

  const [selectedStarters, setSelectedStarters] = useState<number[]>([])
  const [selectedSubs, setSelectedSubs] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingLineup, setIsLoadingLineup] = useState(true)
  const [cards, setCards] = useState<Array<{ playerId: string; type: string }>>([
    { playerId: '', type: '' }
  ])
  const [subs, setSubs] = useState<Array<{ playerOutId: string; playerInId: string; minute: string }>>([
    { playerOutId: '', playerInId: '', minute: '' }
  ])

  // For goals section
  const [goals, setGoals] = useState<Array<{ scorerId: string; assistId: string }>>([
    { scorerId: '', assistId: '' }
  ])

  // Add state for showing inactive players
  const [showInactive, setShowInactive] = useState(false);

  const tabs = [
    { id: 'result', label: 'Result', icon: Trophy },
    { id: 'lineup', label: 'Lineup', icon: Users },
    { id: 'goals', label: 'Goals', icon: Goal },
    { id: 'subs', label: 'Substitutions', icon: Clock },
    { id: 'cards', label: 'Cards', icon: Award },
  ]

  // Update the player filtering section
  const filteredPlayers = players.filter(player => 
    player.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showInactive || player.isActive)
  )

  // Sort players by position with correct mapping
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const positionOrder: { [key: string]: number } = {
      'GK': 1,
      'DEF': 2,
      'MID': 3,
      'ATT': 4
    }
    return (positionOrder[a.Position] || 5) - (positionOrder[b.Position] || 5)
  })

  // Fetch existing lineup when component mounts
  useEffect(() => {
    const fetchLineup = async () => {
      try {
        // Fetch starters
        const { data: startersData, error: startersError } = await supabase
          .from('lineup')
          .select('playerid')
          .eq('matchid', match.matchid)
          .eq('isstarter', true)

        if (startersError) throw startersError

        // Fetch subs
        const { data: subsData, error: subsError } = await supabase
          .from('lineup')
          .select('playerid')
          .eq('matchid', match.matchid)
          .eq('isstarter', false)

        if (subsError) throw subsError

        setSelectedStarters(startersData?.map(item => item.playerid) || [])
        setSelectedSubs(subsData?.map(item => item.playerid) || [])
      } catch (error) {
        console.error('Error fetching lineup:', error)
      } finally {
        setIsLoadingLineup(false)
      }
    }

    fetchLineup()
  }, [match.matchid])

useEffect(() => {
  const fetchSubstitutions = async () => {
    try {
      console.log("Fetching substitutions for match:", match.matchid);
      
      const { data: subsData, error } = await supabase
        .from('lineup')
        .select('playerid, substitutein, substituteout')
        .eq('matchid', match.matchid)
        .or('substitutein.not.is.null,substituteout.not.is.null')
            
      if (error) {
        console.error('Supabase error fetching substitutions:', error.message, error.details)
        return
      }
      
      console.log("Substitution data received:", subsData);
      
      if (subsData && subsData.length > 0) {
        const loadedSubs: Array<{ playerOutId: string; playerInId: string; minute: string }> = [];
        
        // Group by minutes first
        const subsByMinute = subsData.reduce((acc, sub) => {
          if (sub.substituteout) {
            if (!acc[sub.substituteout]) {
              acc[sub.substituteout] = { out: [], in: [] };
            }
            acc[sub.substituteout].out.push(sub.playerid);
          }
          if (sub.substitutein) {
            if (!acc[sub.substitutein]) {
              acc[sub.substitutein] = { out: [], in: [] };
            }
            acc[sub.substitutein].in.push(sub.playerid);
          }
          return acc;
        }, {} as Record<string, { out: number[]; in: number[] }>);

        // Create sub entries for each minute
        Object.entries(subsByMinute)
          .sort(([minA], [minB]) => parseInt(minA) - parseInt(minB))
          .forEach(([minute, players]) => {
            // Match each out player with an in player
            players.out.forEach((outId, index) => {
              if (players.in[index]) {
                loadedSubs.push({
                  playerOutId: outId.toString(),
                  playerInId: players.in[index].toString(),
                  minute: minute
                });
              }
            });
          });
        
        console.log("Processed subs:", loadedSubs);
        
        // Only add empty row if we have less than 5 subs
        if (loadedSubs.length < 5) {
          loadedSubs.push({ playerOutId: '', playerInId: '', minute: '' });
        }
        setSubs(loadedSubs);
      } else {
        setSubs([{ playerOutId: '', playerInId: '', minute: '' }]);
      }
    } catch (error: any) {
      console.error('Error fetching substitutions:', error?.message || 'Unknown error');
    }
  }
  
  if (!isLoadingLineup) {
    fetchSubstitutions();
  }
}, [match.matchid, isLoadingLineup]);

  const handleSaveResult = async () => {
    if (!homeScore || !awayScore) return
    
    setLoading(true)
    try {
      const patronScore = match.ishomegame ? homeScore : awayScore
      const opponentScore = match.ishomegame ? awayScore : homeScore
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          result: `${patronScore}:${opponentScore}`
        })
        .eq('id', match.matchid)

      if (error) {
        console.error('Supabase error:', error.message, error.details)
        throw error
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      onUpdate()
    } catch (error: any) {
      console.error('Error saving result:', {
        message: error?.message || 'Unknown error',
        details: error?.details || {},
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = (playerId: number) => {
    if (selectedStarters.includes(playerId)) {
      // Remove from starters
      setSelectedStarters(prev => prev.filter(id => id !== playerId))
    } else if (selectedSubs.includes(playerId)) {
      // Remove from subs
      setSelectedSubs(prev => prev.filter(id => id !== playerId))
    } else {
      // Add to starters if less than 11, otherwise add to subs
      if (selectedStarters.length < 11) {
        setSelectedStarters(prev => [...prev, playerId])
      } else {
        setSelectedSubs(prev => [...prev, playerId])
      }
    }
  }

  const getPlayerStatus = (playerId: number) => {
    if (selectedStarters.includes(playerId)) return 'starter'
    if (selectedSubs.includes(playerId)) return 'sub'
    return 'none'
  }

  // Get all selected players (starters + subs) for dropdowns
  const availablePlayers = [...selectedStarters, ...selectedSubs]
    .map(id => players.find(p => p.ID === id))
    .filter((p): p is Player => p !== undefined)

  const handleCardChange = (index: number, field: 'playerId' | 'type', value: string) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], [field]: value }
    
    // Add new row if last row has both fields filled
    if (index === cards.length - 1 && value && newCards[index].playerId && newCards[index].type) {
      newCards.push({ playerId: '', type: '' })
    }
    
    // Remove empty rows except the last one
    const filteredCards = newCards.filter((card, i) => 
      i === newCards.length - 1 || (card.playerId && card.type)
    )
    
    setCards(filteredCards)
  }

  const handleSubChange = (index: number, field: 'playerOutId' | 'playerInId' | 'minute', value: string) => {
    const newSubs = [...subs]
    newSubs[index] = { ...newSubs[index], [field]: value }
    
    // Add new row if last row has all fields filled and we have less than 5 subs
    if (index === subs.length - 1 && 
        newSubs[index].playerOutId && 
        newSubs[index].playerInId && 
        newSubs[index].minute && 
        subs.length < 5) {
      newSubs.push({ playerOutId: '', playerInId: '', minute: '' })
    }
    
    // Remove empty rows except the last one
    const filteredSubs = newSubs.filter((sub, i) => 
      i === newSubs.length - 1 || (sub.playerOutId && sub.playerInId && sub.minute)
    )
    
    setSubs(filteredSubs)
  }

  const handleGoalChange = (index: number, field: 'scorerId' | 'assistId', value: string) => {
    const newGoals = [...goals]
    newGoals[index] = { ...newGoals[index], [field]: value }
    
    // Add new row if last row has scorer filled
    if (index === goals.length - 1 && field === 'scorerId' && value) {
      newGoals.push({ scorerId: '', assistId: '' })
    }
    
    setGoals(newGoals)
  }

  // Add this function to handle saving the lineup
  const handleSaveLineup = async () => {
    if (selectedStarters.length === 0) return;
    
    setLoading(true);
    try {
      // First delete any existing lineup for this match
      await supabase
        .from('lineup')
        .delete()
        .eq('matchid', match.matchid);
      
      // Then insert starters
      const starterRows = selectedStarters.map(playerId => ({
        matchid: match.matchid,
        playerid: playerId,
        isstarter: true
      }));
      
      // Insert subs
      const subRows = selectedSubs.map(playerId => ({
        matchid: match.matchid,
        playerid: playerId,
        isstarter: false
      }));
      
      // Combine and insert all
      const { error } = await supabase
        .from('lineup')
        .insert([...starterRows, ...subRows]);
        
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error('Error saving lineup:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update the save function to match the correct field names
  const handleSaveSubs = async () => {
    setLoading(true)
    try {
      // First clear existing substitution data
      const { error: updateError } = await supabase
        .from('lineup')
        .update({ substitutein: null, substituteout: null })
        .eq('matchid', match.matchid)
        
      if (updateError) throw updateError
      
      // Then update with new substitution data
      for (const sub of subs) {
        if (sub.playerOutId && sub.playerInId && sub.minute) {
          // Update player going out
          const { error: outError } = await supabase
            .from('lineup')
            .update({ substituteout: sub.minute })
            .eq('matchid', match.matchid)
            .eq('playerid', sub.playerOutId)
            
          if (outError) throw outError
          
          // Update player coming in
          const { error: inError } = await supabase
            .from('lineup')
            .update({ substitutein: sub.minute })
            .eq('matchid', match.matchid)
            .eq('playerid', sub.playerInId)
            
          if (inError) throw inError
        }
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      onUpdate()
    } catch (error) {
      console.error('Error saving substitutions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log("Fetching cards for match:", match.matchid);
        
        const { data: cardsData, error } = await supabase
          .from('cards')
          .select('*')
          .eq('matchid', match.matchid)
          .order('playerid');
  
        if (error) {
          console.error('Error fetching cards:', error);
          return;
        }
  
        console.log("Raw cards data:", cardsData);
        // Log each player ID as we process it
        cardsData?.forEach(card => {
          console.log("Processing player ID:", card.playerid, "Type:", typeof card.playerid);
        });
  
        if (cardsData && cardsData.length > 0) {
          const loadedCards = cardsData.map(card => {
            const cardData = {
              playerId: String(card.playerid),
              type: 'yellow'
            };
            console.log("Created card data:", cardData);
            return cardData;
          });
  
          console.log("Final processed cards:", loadedCards);
  
          loadedCards.push({ playerId: '', type: '' });
          console.log("Setting cards state to:", loadedCards);
          setCards(loadedCards);
        } else {
          setCards([{ playerId: '', type: '' }]);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    };
  
    fetchCards();
  }, [match.matchid]);
  // Add function to save cards
  const handleSaveCards = async () => {
    setLoading(true);
    try {
      // First delete existing cards
      await supabase
        .from('cards')
        .delete()
        .eq('matchid', match.matchid);

      // Filter out empty rows and the last empty row
      const cardsToSave = cards.filter(card => card.playerId && card.type);

      // Insert new cards
      const { error } = await supabase
        .from('cards')
        .insert(cardsToSave.map(card => ({
          matchid: match.matchid,
          playerid: parseInt(card.playerId),
          isred: card.type === 'red',
          issecondyellow: card.type === 'second_yellow'
        })));

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error('Error saving cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch existing goals and assists
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        console.log("Fetching goals for match:", match.matchid);
        
        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('matchid', match.matchid)
          .order('id');

        if (goalsError) {
          console.error('Error fetching goals:', goalsError);
          return;
        }

        // Fetch assists
        const { data: assistsData, error: assistsError } = await supabase
          .from('assists')
          .select('*')
          .eq('matchid', match.matchid)
          .order('id');

        if (assistsError) {
          console.error('Error fetching assists:', assistsError);
          return;
        }

        console.log("Goals data:", goalsData, "Assists data:", assistsData);

        if (goalsData && goalsData.length > 0) {
          const loadedGoals = goalsData.map((goal, index) => ({
            scorerId: String(goal.playerid),
            assistId: assistsData && assistsData[index] 
              ? String(assistsData[index].playerid) 
              : ''
          }));

          // Add empty row for new entry
          loadedGoals.push({ scorerId: '', assistId: '' });
          setGoals(loadedGoals);
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    fetchGoals();
  }, [match.matchid]);

  // Add function to save goals
  const handleSaveGoals = async () => {
    setLoading(true);
    try {
      // First delete existing goals and assists
      await supabase
        .from('goals')
        .delete()
        .eq('matchid', match.matchid);

      await supabase
        .from('assists')
        .delete()
        .eq('matchid', match.matchid);

      // Filter out empty rows and the last empty row
      const goalsToSave = goals.filter(goal => goal.scorerId);

      // Insert new goals
      for (const goal of goalsToSave) {
        // Insert goal
        const { error: goalError } = await supabase
          .from('goals')
          .insert({
            matchid: match.matchid,
            playerid: parseInt(goal.scorerId)
          });

        if (goalError) throw goalError;

        // Insert assist if exists
        if (goal.assistId) {
          const { error: assistError } = await supabase
            .from('assists')
            .insert({
              matchid: match.matchid,
              playerid: parseInt(goal.assistId)
            });

          if (assistError) throw assistError;
        }
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate();
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="px-4 py-2 bg-black/20 hover:bg-black/40 
              rounded-xl text-gray-400 text-sm font-medium transition-colors 
              flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div className="flex items-center gap-3">
            <img 
              src={match.logourl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s'} 
              alt={match.opponent_name}
              className="w-10 h-10 rounded-lg object-cover bg-black/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp9NXVuzcO7ncREpZSmAozghK0DghB8_G2Fw&s';
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Edit Game</h2>
                {match.km_res === 'RES' && (
                  <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 
                    text-xs font-medium rounded-md">
                    U23
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{match.opponent_name}</span>
                <span>•</span>
                <span>{match.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
              flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-black/20 text-gray-400 hover:bg-black/40'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {activeTab === 'result' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-medium text-white mb-6">Match Result</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm text-gray-400">
                  {match.ishomegame ? 'FC Patron' : match.opponent_name}
                </span>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-16 h-16 bg-black/20 border border-white/5 rounded-xl 
                    text-2xl font-bold text-white text-center focus:outline-none 
                    focus:border-red-500/50"
                />
              </div>
              <span className="text-3xl font-bold text-gray-400">:</span>
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm text-gray-400">
                  {match.ishomegame ? match.opponent_name : 'FC Patron'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-16 h-16 bg-black/20 border border-white/5 rounded-xl 
                    text-2xl font-bold text-white text-center focus:outline-none 
                    focus:border-red-500/50"
                />
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleSaveResult}
                disabled={loading || !homeScore || !awayScore}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors 
                  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Result'}
              </motion.button>
            </div>
          </div>
        )}
        {activeTab === 'lineup' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-white">Match Lineup</h3>
                <span className={`px-2 py-1 rounded-md text-sm font-medium
                  ${selectedStarters.length === 11 
                    ? 'bg-green-500/10 text-green-400' 
                    : selectedStarters.length > 11
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                  {isLoadingLineup ? '...' : `${selectedStarters.length}/11`}
                </span>
                {selectedSubs.length > 0 && (
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 
                    rounded-md text-sm font-medium">
                    +{selectedSubs.length}
                  </span>
                )}
                <motion.button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors 
                    flex items-center gap-2 ${
                      showInactive
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-black/20 text-gray-400 hover:bg-black/40'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search players..."
                    className="pl-9 pr-4 py-2 bg-black/20 border border-white/5 rounded-xl 
                      text-sm text-white placeholder-gray-400 focus:outline-none 
                      focus:border-red-500/50 w-64"
                  />
                </div>
                <motion.button
                  onClick={handleSaveLineup}
                  disabled={loading || selectedStarters.length === 0}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
                    rounded-xl text-red-400 text-sm font-medium transition-colors 
                    flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Lineup'}
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedPlayers.map((player) => (
                  <motion.div
                    key={player.ID}
                    onClick={() => handlePlayerClick(player.ID)}
                    className={`relative p-4 rounded-xl border cursor-pointer 
                      transition-colors ${
                        getPlayerStatus(player.ID) === 'starter'
                          ? 'bg-red-500/10 border-red-500/50'
                          : getPlayerStatus(player.ID) === 'sub'
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-black/20 border-white/5 hover:bg-black/40'
                      } ${isLoadingLineup ? 'opacity-50 pointer-events-none' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.BildURL || 'https://via.placeholder.com/40'}
                        alt={player.Name}
                        className="w-10 h-10 rounded-lg object-cover bg-black/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-white">{player.Name}</h4>
                        <span className="text-xs text-gray-400">{player.Position}</span>
                      </div>
                    </div>
                    {getPlayerStatus(player.ID) !== 'none' && (
                      <div className="absolute top-2 right-2">
                        <Check className={`w-4 h-4 ${
                          getPlayerStatus(player.ID) === 'starter' 
                            ? 'text-red-400' 
                            : 'text-blue-400'
                        }`} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <motion.button
                onClick={() => {/* Save lineup logic */}}
                disabled={selectedStarters.length === 0}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors 
                  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                Save Lineup
              </motion.button>
            </div>
          </div>
        )}
        {activeTab === 'goals' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-medium text-white mb-6">Goals</h3>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm font-medium w-16">
                    Goal {index + 1}
                  </span>
                  <select
                    value={goal.scorerId}
                    onChange={(e) => handleGoalChange(index, 'scorerId', e.target.value)}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                      rounded-xl text-sm text-white focus:outline-none 
                      focus:border-red-500/50"
                  >
                    <option value="" disabled>Select scorer</option>
                    {availablePlayers.map(player => (
                      <option key={player.ID} value={player.ID}>
                        {player.Name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={goal.assistId}
                    onChange={(e) => handleGoalChange(index, 'assistId', e.target.value)}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                      rounded-xl text-sm text-white focus:outline-none 
                      focus:border-red-500/50"
                  >
                    <option value="" disabled>Select assist (optional)</option>
                    <option value="">No assist</option>
                    {availablePlayers.map(player => (
                      <option key={player.ID} value={player.ID}>
                        {player.Name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleSaveGoals}
                disabled={loading || goals.length === 1 && !goals[0].scorerId}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors 
                  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Goals'}
              </motion.button>
            </div>
          </div>
        )}
        {activeTab === 'cards' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-medium text-white mb-6">Cards</h3>
            <div className="space-y-4">
              {cards.map((card, index) => {
                console.log("Rendering card:", card, "Available players:", availablePlayers);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm font-medium w-16">
                      Card {index + 1}
                    </span>
                    <select
                      value={card.playerId}
                      onChange={(e) => {
                        console.log("Changing player ID to:", e.target.value);
                        handleCardChange(index, 'playerId', e.target.value);
                      }}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                        rounded-xl text-sm text-white focus:outline-none 
                        focus:border-red-500/50"
                    >
                      <option value="" disabled>Select player</option>
                      {availablePlayers.map(player => {
                        console.log("Option:", player.ID, player.Name, "Selected:", card.playerId);
                        return (
                          <option key={player.ID} value={String(player.ID)}>
                            {player.Name}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={card.type}
                      onChange={(e) => handleCardChange(index, 'type', e.target.value)}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                        rounded-xl text-sm text-white focus:outline-none 
                        focus:border-red-500/50"
                    >
                      <option value="" disabled>Select card type</option>
                      <option value="yellow">Yellow Card</option>
                      <option value="red">Red Card</option>
                      <option value="second_yellow">Second Yellow Card</option>
                    </select>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleSaveCards}
                disabled={loading || cards.length === 1 && !cards[0].playerId}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors 
                  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Cards'}
              </motion.button>
            </div>
          </div>
        )}
        {activeTab === 'subs' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-medium text-white mb-6">Substitutions</h3>
            <div className="space-y-4">
              {subs.map((sub, index) => {
                // Get all players used in previous rows (different minutes)
                const previouslyUsedPlayers = subs
                  .slice(0, index)
                  .filter(s => s.minute !== sub.minute) // Only exclude players from different minutes
                  .flatMap(s => [s.playerOutId, s.playerInId]);
                
                // Filter available starters excluding previously used players
                const availableStarters = selectedStarters
                  .filter(id => !previouslyUsedPlayers.includes(id.toString()))
                  .map(id => players.find(p => p.ID === id))
                  .filter((p): p is Player => p !== undefined);
                
                // Filter available subs excluding previously used players
                const availableSubs = selectedSubs
                  .filter(id => !previouslyUsedPlayers.includes(id.toString()))
                  .map(id => players.find(p => p.ID === id))
                  .filter((p): p is Player => p !== undefined);

                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm font-medium w-16">
                      Sub {index + 1}
                    </span>
                    <select
                      value={sub.playerOutId}
                      onChange={(e) => handleSubChange(index, 'playerOutId', e.target.value)}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                        rounded-xl text-sm text-white focus:outline-none 
                        focus:border-red-500/50"
                    >
                      <option value="" disabled>Player Out</option>
                      {availableStarters.map(player => (
                        <option key={player.ID} value={player.ID}>
                          {player.Name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sub.playerInId}
                      onChange={(e) => handleSubChange(index, 'playerInId', e.target.value)}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/5 
                        rounded-xl text-sm text-white focus:outline-none 
                        focus:border-red-500/50"
                    >
                      <option value="" disabled>Player In</option>
                      {availableSubs.map(player => (
                        <option key={player.ID} value={player.ID}>
                          {player.Name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Min"
                      min="1"
                      max="120"
                      value={sub.minute}
                      onChange={(e) => handleSubChange(index, 'minute', e.target.value)}
                      className="w-20 px-4 py-2 bg-black/20 border border-white/5 
                        rounded-xl text-sm text-white focus:outline-none 
                        focus:border-red-500/50"
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={handleSaveSubs}
                disabled={loading || subs.length === 1 && !subs[0].playerOutId}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 
                  rounded-xl text-red-400 text-sm font-medium transition-colors 
                  flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Substitutions'}
              </motion.button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed bottom-6 right-6 
                px-4 py-3 bg-green-500/10 text-green-400 rounded-xl 
                border border-green-500/20 text-sm font-medium
                flex items-center gap-2 shadow-lg backdrop-blur-sm"
            >
              <Check className="w-4 h-4" />
              Result saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 