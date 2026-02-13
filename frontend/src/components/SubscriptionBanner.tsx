'use client';

import { motion } from 'framer-motion';
import { Sparkles, X, Crown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionBannerProps {
  daysRemaining: number;
}

export default function SubscriptionBanner({ daysRemaining }: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  if (isDismissed) return null;

  const isTrialEnding = daysRemaining <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        mb-6 rounded-2xl p-4 flex items-center justify-between
        ${isTrialEnding 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
          : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'}
      `}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          {isTrialEnding ? (
            <Sparkles className="w-6 h-6" />
          ) : (
            <Crown className="w-6 h-6" />
          )}
        </div>
        <div>
          <h3 className="font-semibold">
            {isTrialEnding 
              ? `Your trial ends in ${daysRemaining} days!` 
              : 'You\'re on the Free Plan'}
          </h3>
          <p className="text-sm text-white/80">
            {isTrialEnding 
              ? 'Upgrade to Pro to keep all your data and features.' 
              : `Upgrade to Pro for unlimited data history and advanced analytics.`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/subscribe')}
          className="px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
        >
          Upgrade Pro
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
