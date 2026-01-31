'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  audioUrl?: string;
  audioContext?: AudioContext;
  isPlaying?: boolean;
  className?: string;
  barCount?: number;
  color?: 'cyan' | 'magenta' | 'purple';
}

const colorMap = {
  cyan: { from: '#00fff5', to: '#3b82f6' },
  magenta: { from: '#ff00ff', to: '#ec4899' },
  purple: { from: '#8b5cf6', to: '#ec4899' },
};

export default function WaveformVisualizer({
  audioUrl,
  isPlaying = false,
  className = '',
  barCount = 32,
  color = 'cyan',
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate static waveform from audio file
  useEffect(() => {
    if (!audioUrl) {
      setWaveformData(Array(barCount).fill(0.1));
      return;
    }

    const generateWaveform = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const samples = barCount;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
        }

        // Normalize
        const max = Math.max(...waveform);
        const normalized = waveform.map((v) => v / max);

        setWaveformData(normalized);
        audioContext.close();
      } catch {
        // Generate random waveform on error
        setWaveformData(
          Array(barCount)
            .fill(0)
            .map(() => 0.1 + Math.random() * 0.9)
        );
      }
    };

    generateWaveform();
  }, [audioUrl, barCount]);

  const { from, to } = colorMap[color];

  // Generate gradient stops for each bar
  const gradientStops = useMemo(() => {
    return waveformData.map((_, i) => {
      const ratio = i / (waveformData.length - 1);
      return `${from}${Math.round((1 - ratio) * 255).toString(16).padStart(2, '0')}`;
    });
  }, [waveformData, from]);

  return (
    <div className={`flex items-end justify-center gap-[2px] h-16 ${className}`}>
      {waveformData.map((value, index) => {
        const height = Math.max(value * 100, 5);
        const delay = index * 0.02;

        return (
          <motion.div
            key={index}
            initial={{ height: '5%' }}
            animate={{
              height: isPlaying
                ? [`${height * 0.6}%`, `${height}%`, `${height * 0.7}%`]
                : `${height}%`,
            }}
            transition={
              isPlaying
                ? {
                    duration: 0.3 + Math.random() * 0.2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay,
                  }
                : { duration: 0.5, delay }
            }
            className="w-1 rounded-full"
            style={{
              background: `linear-gradient(to top, ${from}, ${to})`,
              opacity: isPlaying ? 1 : 0.7,
              boxShadow: isPlaying ? `0 0 8px ${from}40` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
