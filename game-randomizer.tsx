import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Papa from 'papaparse';
import { Dices } from 'lucide-react';

// Add custom font CSS with relative path
const customFontStyles = `
  @font-face {
    font-family: 'RoboFan';
    src: url('./fonts/robofan.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  .font-robofan {
    font-family: 'RoboFan', sans-serif;
  }
`;

const GameRandomizer = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await window.fs.readFile('Tech Game Database.csv', { encoding: 'utf8' });
        const result = Papa.parse(response, {
          header: true,
          skipEmptyLines: true
        });

        // Process the data to extract game information
        const processedGames = [];
        
        result.data.forEach(row => {
          // Find Steam URL
          let steamUrl = '';
          for (const [key, value] of Object.entries(row)) {
            if (key.includes('href') && value && value.includes('store.steampowered.com')) {
              steamUrl = value;
              break;
            }
          }
          
          // Only process rows with Steam URLs
          if (steamUrl) {
            // Try to find game name - first check markup fields
            let gameName = '';
            
            // Check markup__75297 first as it often contains the game name
            if (row['markup__75297'] && !row['markup__75297'].includes('https://')) {
              gameName = row['markup__75297']
                // Remove quotes if present
                .replace(/^"(.+)"$/, '$1')
                .replace(/^\\"(.+)\\"$/, '$1')
                // Trim surrounding whitespace
                .trim();
            }
            
            // If we couldn't get a name from markup, extract from the URL
            if (!gameName) {
              // Extract game name from the URL
              const urlParts = steamUrl.split('/');
              const gameNameFromUrl = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
              gameName = gameNameFromUrl.replace(/_/g, ' ').replace(/-/g, ' ');
            }
            
            // Get username (from username_c19a55)
            const username = row['username_c19a55'] || 'Anonymous';
            
            // Get timestamp and clean it
            let timestamp = row['timestamp_c19a55'] || 'Unknown Date';
            // Remove "— \n" prefix if present
            if (timestamp.startsWith('— \n')) {
              timestamp = timestamp.substring(3).trim();
            }
            
            // Add to processed games
            processedGames.push({
              name: gameName,
              url: steamUrl,
              username: username,
              timestamp: timestamp
            });
          }
        });

        setGames(processedGames);
        setLoading(false);
      } catch (error) {
        console.error('Error loading games:', error);
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  const pickRandomGame = () => {
    if (games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      setSelectedGame(games[randomIndex]);
    }
  };

  return (
    <>
      <style>{customFontStyles}</style>
      <div className="dark min-h-screen bg-black text-white">
        <div className="container mx-auto min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-8">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32">
                <img
                  src="/api/placeholder/128/128"
                  alt="Tech Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-orange-500 font-robofan">Techsmith314 Game Selector</h1>
            </div>

            {/* Main Card */}
            <Card className="bg-zinc-900 border-orange-500">
              <CardContent className="pt-6 space-y-6">
                {/* Button Section */}
                <div className="flex justify-center">
                  <Button 
                    onClick={pickRandomGame} 
                    disabled={loading || games.length === 0}
                    size="lg"
                    className="w-64 bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-105 font-robofan"
                  >
                    <Dices className="mr-2 h-4 w-4" />
                    Choose a Random Game
                  </Button>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center text-white font-robofan">
                    Loading games...
                  </div>
                )}

                {/* Game Count */}
                {!loading && (
                  <div className="text-center text-white font-robofan">
                    {games.length} games loaded
                  </div>
                )}

                {/* Selected Game Card */}
                {selectedGame && (
                  <Card className="bg-zinc-800 border-red-600">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 text-white font-robofan">
                            {selectedGame.name}
                          </h3>
                          <a 
                            href={selectedGame.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-orange-500 underline transition-colors font-robofan"
                          >
                            View on Steam
                          </a>
                        </div>
                        <div className="text-sm text-white font-robofan">
                          <p>Suggested by: {selectedGame.username}</p>
                          <p>Date: {selectedGame.timestamp}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameRandomizer;