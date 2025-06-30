import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, Crown, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface MonetizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonetizationPanel: React.FC<MonetizationPanelProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>('free');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for personal use',
      features: [
        'Up to 100 notes',
        'Basic AI analysis',
        'Standard export options',
        'Community support',
      ],
      limitations: [
        'Limited voice transcription',
        'Basic knowledge graph',
        'No premium themes',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      description: 'For power users and professionals',
      features: [
        'Unlimited notes',
        'Advanced AI insights',
        'Premium export formats',
        'Priority support',
        'Custom themes',
        'Advanced analytics',
        'Collaboration features',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$29.99',
      period: 'month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Admin dashboard',
        'SSO integration',
        'Custom branding',
        'API access',
        'Dedicated support',
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Premium Features</h2>
                  <p className="text-gray-600">Unlock advanced features and capabilities</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Pricing Plans */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id as any)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                    </div>

                    <ul className="mt-6 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Zap className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations && (
                      <ul className="mt-4 space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-500">
                            <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      variant={selectedPlan === plan.id ? 'primary' : 'secondary'}
                      className="w-full mt-6"
                      onClick={() => {
                        // RevenueCat integration would go here
                        console.log(`Selected plan: ${plan.name}`);
                      }}
                    >
                      {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* RevenueCat Integration Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Ready for Monetization with RevenueCat</h4>
                  <p className="text-gray-600 mt-1">
                    RevenueCat is 100% free for Bolt participants. Set up subscriptions, manage payments, 
                    and track revenue with their powerful SDK.
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.open('https://rev.cat/bolt', '_blank')}
                    >
                      Get Started with RevenueCat
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // This would integrate RevenueCat SDK
                        console.log('Integrating RevenueCat...');
                      }}
                    >
                      Integrate Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};