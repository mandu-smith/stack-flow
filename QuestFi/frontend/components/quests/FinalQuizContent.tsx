'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'

export default function FinalQuizContent({ questions, quizAnswers, setQuizAnswers, onComplete }: any) {
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const handleSubmit = () => {
    let correct = 0
    questions.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.correct) correct++
    })
    setScore(correct)
    setSubmitted(true)

    if (correct === questions.length) {
      setTimeout(() => onComplete(), 1500)
    }
  }

  return (
    <div className="space-y-4">
      {questions.map((q: any, index: number) => (
        <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h4 className="text-white font-bold text-sm mb-2">Question {index + 1}</h4>
          <p className="text-slate-300 text-sm mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => !submitted && setQuizAnswers({ ...quizAnswers, [index]: i })}
                disabled={submitted}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  submitted && i === q.correct
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : submitted && quizAnswers[index] === i && i !== q.correct
                    ? 'bg-red-500 border-red-400 text-white'
                    : quizAnswers[index] === i
                    ? 'bg-cyan-500 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(quizAnswers).length < questions.length}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-xl transition-colors"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-black text-white mb-1">Score: {score}/{questions.length}</h3>
          <p className="text-slate-300 text-sm">
            {score === questions.length ? 'Perfect! Quest Complete!' : 'Review and try again.'}
          </p>
        </div>
      )}
    </div>
  )
}
