'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Play,
  Download,
  Trash2,
  Clock,
  Cpu,
  User,
  Search,
  Trash,
} from 'lucide-react';
import { useHistoryStore } from '@/lib/store/historyStore';
import { useAudioPlayer } from '@/lib/hooks/useTTS';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function HistoryPage() {
  const { history, removeResult, clearHistory } = useHistoryStore();
  const { play } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history by search
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;

    const query = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.text.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.voice.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  // Group by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof filteredHistory> = {};

    filteredHistory.forEach((item) => {
      const date = new Date(item.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = '昨天';
      } else {
        key = date.toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [filteredHistory]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (audioUrl: string, text: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `tts-${text.slice(0, 20)}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <div className="p-2.5 bg-gradient-ocean rounded-glass-sm shadow-dopamine-mint">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">生成历史</h1>
              <p className="text-sm text-gray-500">
                共 {history.length} 条记录
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm('确定要清空所有历史记录吗？')) {
                  clearHistory();
                }
              }}
              leftIcon={<Trash className="w-4 h-4" />}
            >
              清空
            </Button>
          )}
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索历史记录..."
              className="dopamine-input w-full pl-10"
            />
          </div>
        )}
      </motion.div>

      {/* Content */}
      {history.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center py-12">
          <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无历史记录</h3>
          <p className="text-sm text-gray-500">
            生成的语音将自动保存到这里
          </p>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">没有匹配的结果</h3>
          <p className="text-sm text-gray-500">
            尝试其他搜索关键词
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {date}
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Time */}
                      <div className="text-xs text-gray-400 pt-1">
                        {formatTime(item.timestamp)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {item.text}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={item.model === 'qwen3-tts' ? 'purple' : 'pink'}
                            size="sm"
                          >
                            <Cpu className="w-3 h-3 mr-1" />
                            {item.model}
                          </Badge>
                          <Badge variant="default" size="sm">
                            <User className="w-3 h-3 mr-1" />
                            {item.voice}
                          </Badge>
                          {item.emotion && item.emotion !== 'default' && (
                            <Badge variant="mint" size="sm">
                              {item.emotion}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {item.audioUrl && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => play(item.audioUrl!)}
                              className="p-2 text-gray-400 hover:text-dopamine-purple hover:bg-dopamine-purple/10 rounded-lg transition-colors cursor-pointer"
                              title="播放"
                            >
                              <Play className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(item.audioUrl!, item.text)}
                              className="p-2 text-gray-400 hover:text-dopamine-mint hover:bg-dopamine-mint/10 rounded-lg transition-colors cursor-pointer"
                              title="下载"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeResult(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
