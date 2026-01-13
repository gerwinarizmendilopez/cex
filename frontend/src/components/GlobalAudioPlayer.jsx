import React, { useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Button } from './ui/button';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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
    seek,
    changeVolume,
    stopPlayback
  } = useAudioPlayer();

  const progressRef = useRef(null);

  if (!currentBeat) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  
  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  // Handler directo para el input range
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    console.log('Seeking to:', newTime);
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    changeVolume(newVol);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-red-900/30">
      {/* Progress Bar - Styled Range Input */}
      <div className="w-full h-6 relative flex items-center px-2 bg-zinc-800">
        <span className="text-xs text-gray-400 w-12 text-right mr-2">{formatTime(currentTime)}</span>
        
        <input
          ref={progressRef}
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 appearance-none bg-zinc-700 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-red-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-red-500
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${progress}%, #3f3f46 ${progress}%, #3f3f46 100%)`
          }}
        />
        
        <span className="text-xs text-gray-400 w-12 ml-2">{formatTime(duration)}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=🎵'; }}
            />
            <div className="min-w-0">
              <h4 className="text-white font-semibold truncate">{currentBeat.name}</h4>
              <p className="text-sm text-gray-400">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className={`rounded-full w-12 h-12 ${isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => changeVolume(volume > 0 ? 0 : 1)} className="text-gray-400 hover:text-white p-1">
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 appearance-none bg-zinc-700 rounded-full cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={stopPlayback}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
