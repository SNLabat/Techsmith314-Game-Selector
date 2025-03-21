import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        const response = await window.fs.readFile('./MTP Game Database.csv', { encoding: 'utf8' });
        const result = Papa.parse(response, {
          header: true,
          skipEmptyLines: true
        });

        const processedGames = result.data.map(row => ({
          name: row['anchor_af404b (3)'] || 'Unknown Game',
          url: row['anchor_af404b href'] || '',
          username: row['username_f9f2ca'] || 'Anonymous',
          timestamp: row['timestamp_f9f2ca'] ? row['timestamp_f9f2ca'].replace('— \n', '') : 'Unknown Date'
        })).filter(game => game.name !== 'Unknown Game' && game.url);

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
                  src="./assets/logo.png"
                  alt="Tech Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-[#FFA500] font-robofan">MTPlay a Game</h1>
            </div>

            {/* Main Card */}
            <Card className="bg-zinc-900 border-[#FFA500]">
              <CardContent className="pt-6 space-y-6">
                {/* Button Section */}
                <div className="flex justify-center">
                  <Button 
                    onClick={pickRandomGame} 
                    disabled={loading || games.length === 0}
                    size="lg"
                    variant="destructive"
                    className="w-64 !bg-[#FF0000] hover:!bg-[#CC0000] text-white transition-all hover:scale-105 font-robofan"
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

                {/* Selected Game Card */}
                {selectedGame && (
                  <Card className="bg-zinc-800 border-[#FF0000]">
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
                            className="text-white hover:text-[#FFA500] underline transition-colors font-robofan"
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
