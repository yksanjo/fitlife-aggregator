'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Database, LineChart, Download, ArrowLeft } from 'lucide-react';
import { subscriptionApi } from '@/lib/api';

const features = [
  { icon: <Database className="w-5 h-5" />, text: 'Unlimited data history' },
  { icon: <LineChart className="w-5 h-5" />, text: 'Advanced analytics & trends' },
  { icon: <Zap className="w-5 h-5" />, text: 'Unlimited device connections' },
  { icon: <Download className="w-5 h-5" />, text: 'Data export (CSV, JSON)' },
  { icon: <Check className="w-5 h-5" />, text: 'Personalized insights' },
  { icon: <Check className="w-5 h-5" />, text: 'Priority support' },
];

export default function SubscribePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionApi.createCheckout();
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to FitLife Pro
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get the most out of your health data with unlimited history, advanced analytics, 
            and personalized insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border-2 border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Free</h2>
            <p className="text-gray-500 mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-600">
                <Check className="w-5 h-5 text-green-500" />
                7-day data history
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Check className="w-5 h-5 text-green-500" />
                Up to 2 device connections
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Check className="w-5 h-5 text-green-500" />
                Basic dashboard
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
                Advanced analytics
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
                Data export
              </li>
            </ul>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue with Free
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border-2 border-primary-500 relative overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">
              POPULAR
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pro</h2>
            <p className="text-gray-500 mb-6">For serious health tracking</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-500">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <span className="text-primary-500">{feature.icon}</span>
                  {feature.text}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is always yours. If you cancel, you\'ll revert to the free plan with 7-day history, but your older data is preserved and will be available again if you resubscribe.',
              },
              {
                q: 'Is my payment information secure?',
                a: 'Yes, we use Stripe for payment processing. Your card details are never stored on our servers.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
