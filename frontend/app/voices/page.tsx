'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, RefreshCw } from 'lucide-react';
import { useVoices } from '@/lib/hooks/useVoices';
import { useUIStore } from '@/lib/store/uiStore';
import VoiceCard from '@/components/voices/VoiceCard';
import VoiceUploader from '@/components/voices/VoiceUploader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const TABS = [
  { id: 'all', label: '全部' },
  { id: 'qwen3-tts', label: 'Qwen3-TTS' },
  { id: 'indextts', label: 'IndexTTS 2.0' },
] as const;

export default function VoicesPage() {
  const { data: voices, isLoading, refetch } = useVoices();
  const { voicesTab, setVoicesTab, modals, openModal, closeModal } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter voices based on tab and search
  const filteredVoices = useMemo(() => {
    if (!voices) return [];

    let filtered = voices;

    // Filter by tab
    if (voicesTab !== 'all') {
      filtered = filtered.filter((v) => v.backend === voicesTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.id.toLowerCase().includes(query) ||
          v.emotions.some((e) => e.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [voices, voicesTab, searchQuery]);

  // Group by backend for display
  const groupedVoices = useMemo(() => {
    if (voicesTab !== 'all') {
      return { [voicesTab]: filteredVoices };
    }

    const groups: Record<string, typeof filteredVoices> = {};
    filteredVoices.forEach((voice) => {
      if (!groups[voice.backend]) {
        groups[voice.backend] = [];
      }
      groups[voice.backend].push(voice);
    });
    return groups;
  }, [filteredVoices, voicesTab]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-magenta rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">音色管理</h1>
              <p className="text-sm text-slate-500">
                管理 {voices?.length || 0} 个音色
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              刷新
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('voiceUpload')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              上传音色
            </Button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-cyber-bg-secondary/50 rounded-xl">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVoicesTab(tab.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    voicesTab === tab.id
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索音色..."
              className="cyber-input w-full pl-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-cyber-bg-secondary/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredVoices.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-2">暂无音色</h3>
          <p className="text-sm text-slate-500 mb-4">
            {searchQuery ? '没有匹配的搜索结果' : '上传您的第一个音色开始使用'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => openModal('voiceUpload')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              上传音色
            </Button>
          )}
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedVoices).map(([backend, backendVoices]) => (
            <motion.div
              key={backend}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {voicesTab === 'all' && (
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backend === 'qwen3-tts' ? 'bg-neon-cyan' : 'bg-neon-magenta'
                    }`}
                  />
                  {backend}
                  <span className="text-sm text-slate-500 font-normal">
                    ({backendVoices.length})
                  </span>
                </h2>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {backendVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Upload Modal */}
      <VoiceUploader
        isOpen={modals.voiceUpload}
        onClose={() => closeModal('voiceUpload')}
      />
    </div>
  );
}
