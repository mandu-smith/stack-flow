'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function PracticeContent({ steps, practiceStep, setPracticeStep, walletConnected, setWalletConnected, onComplete }: any) {
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false])
  const [expandedStep, setExpandedStep] = useState<number | null>(0)

  const practiceSteps = [
    {
      title: 'Visit Zest Protocol',
      description: 'Navigate to app.zestprotocol.com',
      details: 'Open the Zest Protocol app in your browser. The interface shows your dashboard with lending and borrowing options.',
      image: '/zest/overview.png',
      link: 'https://app.zestprotocol.com'
    },
    {
      title: 'Connect Your Wallet',
      description: 'Connect Leather, Xverse, or OKX Wallet',
      details: 'Click the "Connect Wallet" button and select your Stacks wallet. Approve the connection request.',
      image: '/zest/dashboard.png',
      link: 'https://app.zestprotocol.com'
    },
    {
      title: 'Supply Assets',
      description: 'Deposit assets to start earning yield',
      details: 'Go to the "Supply" section, select an asset (sBTC, STX, or stablecoins), enter the amount, and confirm the transaction in your wallet.',
      image: '/zest/supplies.png',
      link: 'https://app.zestprotocol.com'
    },
    {
      title: 'Enable as Collateral (Optional)',
      description: 'Activate your assets as collateral for borrowing',
      details: 'Toggle the "Use as Collateral" switch on your supplied assets to unlock borrowing capacity.',
      image: '/zest/borrows.png',
      link: 'https://app.zestprotocol.com'
    },
    {
      title: 'View Your Position',
      description: 'Monitor your lending position and earnings',
      details: 'Check your supply balance, earned interest, and health factor in the dashboard. Your interest compounds continuously.',
      image: '/zest/transactions.png',
      link: 'https://app.zestprotocol.com'
    }
  ]

  const toggleStepCompletion = (index: number) => {
    setCompletedSteps((prev) => {
      const newCompleted = [...prev]
      newCompleted[index] = !newCompleted[index]
      return newCompleted
    })
  }

  const allCompleted = completedSteps.every(step => step)

  return (
    <div className="space-y-3">
      {/* Info Banner */}
      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-indigo-300 font-semibold text-xs mb-1">Mainnet Practice</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Complete these steps on the live Zest Protocol. Check off each step as you complete it.</p>
          </div>
        </div>
      </div>

      {/* Practice Steps */}
      <div className="space-y-2">
        {practiceSteps.map((step, i) => (
          <div
            key={i}
            className={`border rounded-lg overflow-hidden transition-all ${
              completedSteps[i]
                ? 'bg-emerald-900/10 border-emerald-700/40'
                : 'bg-slate-900/30 border-slate-700'
            }`}
          >
            {/* Step Header */}
            <div className="p-3">
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleStepCompletion(i)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    completedSteps[i]
                      ? 'bg-emerald-600/90 border-emerald-600/90'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {completedSteps[i] && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </button>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${completedSteps[i] ? 'text-emerald-300' : 'text-white'}`}>
                      {i + 1}. {step.title}
                    </h4>
                    <button
                      onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: expandedStep === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▼
                      </motion.div>
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs">{step.description}</p>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {expandedStep === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3">
                    {/* Details Text */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <p className="text-slate-300 text-xs leading-relaxed">{step.details}</p>
                    </div>

                    {/* Image */}
                    <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-auto"
                      />
                    </div>

                    {/* Action Button */}
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-center font-semibold rounded-lg transition-colors text-sm"
                    >
                      Open Zest Protocol →
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <motion.button
        onClick={onComplete}
        disabled={!allCompleted}
        className="w-full py-3 bg-emerald-600/90 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
        whileHover={allCompleted ? { scale: 1.01 } : {}}
        whileTap={allCompleted ? { scale: 0.99 } : {}}
      >
        {allCompleted ? 'Complete Practice Session' : `Complete ${completedSteps.filter(s => s).length}/5 steps to continue`}
      </motion.button>
    </div>
  )
}
