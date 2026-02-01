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
            <div className="p-2.5 bg-ios-blue rounded-ios-sm shadow-ios-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-title-2">音色管理</h1>
              <p className="text-footnote text-text-secondary">
                管理 {voices?.length || 0} 个音色
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="tinted"
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
          <div className="ios-segmented">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setVoicesTab(tab.id)}
                className={`ios-segmented-item cursor-pointer ${
                  voicesTab === tab.id ? 'active' : ''
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-placeholder" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索音色..."
              className="ios-input w-full pl-10"
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
              className="h-40 rounded-ios-md bg-fill-tertiary animate-pulse"
            />
          ))}
        </div>
      ) : filteredVoices.length === 0 ? (
        <Card variant="default" padding="lg" className="ios-empty-state">
          <Users className="ios-empty-icon" />
          <h3 className="ios-empty-title">暂无音色</h3>
          <p className="ios-empty-description">
            {searchQuery ? '没有匹配的搜索结果' : '上传您的第一个音色开始使用'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => openModal('voiceUpload')}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-4"
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
                <h2 className="text-headline text-text-primary mb-4 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backend === 'qwen3-tts' ? 'bg-ios-purple' : 'bg-ios-pink'
                    }`}
                  />
                  {backend}
                  <span className="text-footnote text-text-tertiary font-normal">
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
