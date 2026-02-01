'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  isPlaying?: boolean;
  className?: string;
}

export default function AudioPlayer({
  src,
  onPlay,
  onPause,
  onEnded,
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onPlay, onPause, onEnded]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  }, [duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 p-3 bg-cyber-surface/50 rounded-md border border-zinc-800/30 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className="w-10 h-10 rounded-md bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-cyber-bg" />
        ) : (
          <Play className="w-4 h-4 text-cyber-bg ml-0.5" />
        )}
      </motion.button>

      {/* Progress bar */}
      <div className="flex-1 space-y-1">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-2 bg-zinc-800/50 rounded-sm cursor-pointer overflow-hidden relative"
        >
          {/* Played progress */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-sm"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Glow effect */}
          <div
            className="absolute inset-y-0 left-0 bg-neon-purple/30 rounded-sm transition-all duration-100"
            style={{ width: `${progressPercent}%`, filter: 'blur(4px)' }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mute button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="p-2 text-zinc-500 hover:text-neon-purple transition-colors cursor-pointer"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </motion.button>
    </div>
  );
}
