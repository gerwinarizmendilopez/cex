import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isReady, setIsReady] = useState(false);
  
  const wavesurferRef = useRef(null);
  const containerRef = useRef(null);

  // Inicializar WaveSurfer cuando el container esté listo
  const initWaveSurfer = useCallback((container) => {
    if (!container || wavesurferRef.current) return;
    
    containerRef.current = container;
    
    const ws = WaveSurfer.create({
      container: container,
      waveColor: '#4a4a4a',
      progressColor: '#dc2626',
      cursorColor: '#fff',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 50,
      normalize: true,
      backend: 'WebAudio',
    });
    
    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setIsReady(true);
      ws.setVolume(volume);
    });
    
    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });
    
    ws.on('seeking', () => {
      setCurrentTime(ws.getCurrentTime());
    });
    
    ws.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    
    wavesurferRef.current = ws;
  }, [volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  const playBeat = useCallback(async (beat, audioUrl) => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    
    // Si es el mismo beat, toggle play/pause
    if (currentBeat?.beat_id === beat.beat_id) {
      ws.playPause();
      return;
    }
    
    // Nuevo beat
    setCurrentBeat(beat);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    
    try {
      await ws.load(audioUrl);
      ws.play();
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }, [currentBeat]);

  const togglePlayPause = useCallback(() => {
    const ws = wavesurferRef.current;
    if (ws && isReady) {
      ws.playPause();
    }
  }, [isReady]);

  const seek = useCallback((time) => {
    const ws = wavesurferRef.current;
    if (ws && duration > 0) {
      ws.seekTo(time / duration);
    }
  }, [duration]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    const ws = wavesurferRef.current;
    if (ws) {
      ws.setVolume(newVolume);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    const ws = wavesurferRef.current;
    if (ws) {
      ws.stop();
      ws.empty();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentBeat(null);
    setIsReady(false);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentBeat,
        isPlaying,
        currentTime,
        duration,
        volume,
        isReady,
        playBeat,
        togglePlayPause,
        seek,
        changeVolume,
        stopPlayback,
        initWaveSurfer,
        wavesurferRef
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
