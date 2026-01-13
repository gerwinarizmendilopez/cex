import React, { useCallback } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Formatear tiempo en mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GlobalAudioPlayer = () => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seekPercentage,
    changeVolume,
    stopPlayback
  } = useAudioPlayer();

  const handleSeek = useCallback((value) => {
    seekPercentage(value[0]);
  }, [seekPercentage]);

  const handleVolumeChange = useCallback((value) => {
    changeVolume(value[0] / 100);
  }, [changeVolume]);

  // No mostrar si no hay beat
  if (!currentBeat) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-red-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar - Clickable and more visible */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer [&>span:first-child]:h-2 [&>span:first-child]:bg-zinc-700 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-red-500 [&>span:first-child>span]:bg-red-500"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 py-3">
          {/* Beat Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-14 h-14 rounded-lg object-cover shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/60?text=🎵';
              }}
            />
            <div className="min-w-0">
              <h4 className="text-white font-semibold truncate">{currentBeat.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{currentBeat.genre}</span>
                <span>•</span>
                <span>{currentBeat.bpm} BPM</span>
                <span>•</span>
                <span>{currentBeat.key}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button
              size="lg"
              className={`rounded-full w-12 h-12 ${isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => changeVolume(volume > 0 ? 0 : 1)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-zinc-700 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&>span:first-child>span]:bg-white"
              />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={stopPlayback}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
