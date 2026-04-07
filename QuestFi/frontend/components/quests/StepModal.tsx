'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import LearnContent from './LearnContent'
import SimulatorContent from './SimulatorContent'
import PracticeContent from './PracticeContent'
import FinalQuizContent from './FinalQuizContent'

export default function StepModal({ step, onClose, onComplete, quizAnswers, setQuizAnswers, simulatorState, setSimulatorState, practiceStep, setPracticeStep, walletConnected, setWalletConnected }: any) {
  const [simulatorTasks, setSimulatorTasks] = useState<boolean[]>([false, false, false, false, false])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4 py-20">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-black text-white">{step.title}</h2>
            <p className="text-slate-400 text-xs mt-1">{step.content.description}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step.type === 'learn' && (
            <LearnContent step={step} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} onComplete={() => onComplete(step.xp)} />
          )}
          {step.type === 'simulator' && (
            <SimulatorContent
              tasks={step.content.tasks}
              simulatorState={simulatorState}
              setSimulatorState={setSimulatorState}
              simulatorTasks={simulatorTasks}
              setSimulatorTasks={setSimulatorTasks}
              onComplete={() => onComplete(step.xp)}
            />
          )}
          {step.type === 'practice' && (
            <PracticeContent
              steps={step.content.steps}
              practiceStep={practiceStep}
              setPracticeStep={setPracticeStep}
              walletConnected={walletConnected}
              setWalletConnected={setWalletConnected}
              onComplete={() => onComplete(step.xp)}
            />
          )}
          {step.type === 'quiz' && (
            <FinalQuizContent
              questions={step.content.questions}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              onComplete={() => onComplete(step.xp)}
            />
          )}
        </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
