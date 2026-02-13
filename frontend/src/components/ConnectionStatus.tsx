'use client';

import { motion } from 'framer-motion';
import { FitnessConnection } from '@/types';
import { getProviderIcon, getProviderName } from '@/lib/utils';
import { Check, AlertCircle, RefreshCw, Plus, Link2 } from 'lucide-react';
import { useState } from 'react';

interface ConnectionStatusProps {
  connections: FitnessConnection[];
}

const availableProviders = [
  { id: 'apple_health', name: 'Apple Health', icon: '🍎', color: 'bg-red-50' },
  { id: 'fitbit', name: 'Fitbit', icon: '⌚', color: 'bg-teal-50' },
  { id: 'garmin', name: 'Garmin', icon: '📱', color: 'bg-blue-50' },
  { id: 'oura', name: 'Oura Ring', icon: '💍', color: 'bg-purple-50' },
  { id: 'withings', name: 'Withings', icon: '⚖️', color: 'bg-gray-50' },
];

export default function ConnectionStatus({ connections }: ConnectionStatusProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusIcon = (connection: FitnessConnection) => {
    if (connection.is_syncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (connection.last_sync_status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Check className="w-4 h-4 text-green-500" />;
  };

  const formatLastSync = (date?: string) => {
    if (!date) return 'Never synced';
    const syncDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - syncDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Connected Devices</h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full">
          {connections.length} connected
        </span>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-4">No devices connected yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Connect Your First Device
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                {getProviderIcon(connection.provider)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {getProviderName(connection.provider)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatLastSync(connection.last_sync_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(connection)}
                <span className={`text-xs font-medium ${
                  connection.is_active ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {connection.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
            </motion.div>
          ))}
          
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Device
          </button>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect a Device
            </h3>
            <div className="space-y-2">
              {availableProviders.map((provider) => {
                const isConnected = connections.some(c => c.provider === provider.id);
                return (
                  <button
                    key={provider.id}
                    disabled={isConnected}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-colors
                      ${isConnected 
                        ? 'bg-gray-50 opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50 border border-gray-100'}
                    `}
                  >
                    <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center text-xl`}>
                      {provider.icon}
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900">
                      {provider.name}
                    </span>
                    {isConnected && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-4 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
