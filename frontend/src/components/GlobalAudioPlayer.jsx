import React, { useEffect, useRef } from 'react';
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
    isReady,
    togglePlayPause,
    changeVolume,
    stopPlayback,
    initWaveSurfer
  } = useAudioPlayer();

  const waveformRef = useRef(null);
  const initialized = useRef(false);

  // Inicializar WaveSurfer cuando el componente se monta
  useEffect(() => {
    if (waveformRef.current && !initialized.current) {
      initWaveSurfer(waveformRef.current);
      initialized.current = true;
    }
  }, [initWaveSurfer]);

  if (!currentBeat) return null;

  const coverUrl = currentBeat.cover_url 
    ? `${API}/beats/cover/${currentBeat.cover_url.split('/').pop()}`
    : 'https://via.placeholder.com/60?text=🎵';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-zinc-900 border-t border-red-900/30">
      {/* Waveform Container */}
      <div className="w-full px-4 py-2 bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-12 text-right font-mono">
            {formatTime(currentTime)}
          </span>
          
          {/* WaveSurfer Waveform - Click para seek */}
          <div 
            ref={waveformRef}
            className="flex-1 cursor-pointer"
            style={{ minHeight: '50px' }}
          />
          
          <span className="text-xs text-gray-400 w-12 font-mono">
            {formatTime(duration)}
          </span>
        </div>
        
        {!isReady && currentBeat && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
              <span className="text-sm">Cargando audio...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img 
              src={coverUrl}
              alt={currentBeat.name}
              className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=🎵'; }}
            />
            <div className="min-w-0">
              <h4 className="text-white font-semibold truncate">{currentBeat.name}</h4>
              <p className="text-sm text-gray-400">{currentBeat.genre} • {currentBeat.bpm} BPM • {currentBeat.key}</p>
            </div>
          </div>

          {/* Play/Pause & Volume */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className={`rounded-full w-12 h-12 ${isPlaying ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={togglePlayPause}
              disabled={!isReady}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => changeVolume(volume > 0 ? 0 : 0.8)} 
                className="text-gray-400 hover:text-white p-1"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1 cursor-pointer accent-white"
              />
            </div>

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
