'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, BookOpen, CheckCircle2, PlayCircle } from 'lucide-react'

// Helper function to convert any YouTube URL to embed format
function getYouTubeEmbedUrl(url: string): string {
  if (!url) return url

  // If already in embed format, return as is
  if (url.includes('/embed/')) return url

  // Extract video ID from various YouTube URL formats
  let videoId = ''

  // Format: https://www.youtube.com/watch?v=VIDEO_ID or ?v=VIDEO_ID&other=params
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) {
    videoId = watchMatch[1]
  }

  // Format: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  if (shortMatch) {
    videoId = shortMatch[1]
  }

  // If we found a video ID, return embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }

  // Otherwise return original URL (might be Loom or other)
  return url
}

export default function LearnContent({ step, quizAnswers, setQuizAnswers, onComplete }: any) {
  const [showVideo, setShowVideo] = useState(false)
  const [showTextGuide, setShowTextGuide] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false])
  const [expandedDemoStep, setExpandedDemoStep] = useState<number | null>(null)

  const allStepsCompleted = completedSteps.every(step => step)

  const toggleStepCompletion = (index: number) => {
    setCompletedSteps((prev) => {
      const newCompleted = [...prev]
      newCompleted[index] = !newCompleted[index]
      return newCompleted
    })
  }

  return (
    <div className="space-y-3">
      {/* Learning Options */}
      {step.content.videoUrl && step.content.textGuide && (
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => { setShowVideo(!showVideo); setShowTextGuide(false); }}
            className={`relative p-2 rounded-lg border transition-all overflow-hidden ${
              showVideo
                ? 'bg-purple-600/20 border-purple-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Video className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white relative z-10">Watch Video</div>
          </motion.button>
          <motion.button
            onClick={() => { setShowTextGuide(!showTextGuide); setShowVideo(false); }}
            className={`relative p-2 rounded-lg border transition-all overflow-hidden ${
              showTextGuide
                ? 'bg-cyan-600/20 border-cyan-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white relative z-10">Read Guide</div>
          </motion.button>
        </div>
      )}

      {/* Video Section */}
      {showVideo && step.content.videoUrl && (
        <div className="space-y-3">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(step.content.videoUrl)}
                title="Tutorial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Additional Videos */}
          {step.content.additionalVideos && step.content.additionalVideos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">📹 More Video Guides</h4>
              {step.content.additionalVideos.map((video: any, i: number) => (
                <details key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                  <summary className="cursor-pointer p-3 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">{video.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 ml-6">{video.description}</p>
                  </summary>
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYouTubeEmbedUrl(video.url)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text Guide Section */}
      {showTextGuide && step.content.textGuide && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">📖 Text Guide</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {step.content.textGuide.map((paragraph: string, i: number) => {
              const parts = paragraph.split(/(\*\*.*?\*\*)/g)
              return (
                <p key={i}>
                  {parts.map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      const text = part.slice(2, -2)
                      return (
                        <span key={idx} className="text-emerald-400 font-bold">
                          {text}
                        </span>
                      )
                    }
                    return part
                  })}
                </p>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {step.content.stats && (
        <div className="grid grid-cols-2 gap-2">
          {step.content.stats.map((stat: any, i: number) => (
            <div key={i} className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="text-lg">{stat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400">{stat.label}</div>
                  <div className="text-sm font-bold text-white">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Facts */}
      {step.content.keyFacts && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-base font-black text-white mb-3">⚡ Key Facts</h3>
          <div className="space-y-2">
            {step.content.keyFacts.map((fact: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Demo Flow */}
      {step.content.demoFlow && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-white">🎮 Interactive Tutorial</h3>
            <div className="px-2 py-1 bg-indigo-600/20 border border-indigo-500 rounded-full text-xs font-bold text-indigo-400">
              {completedSteps.filter(s => s).length}/{step.content.demoFlow.length} Complete
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.filter(s => s).length / step.content.demoFlow.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="space-y-2">
            {step.content.demoFlow.map((item: any, i: number) => (
              <motion.div
                key={i}
                className={`border rounded-lg overflow-hidden transition-all ${
                  completedSteps[i]
                    ? 'bg-emerald-900/10 border-emerald-700/40'
                    : 'bg-slate-800/30 border-slate-700'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-3 flex items-center gap-3">
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
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </button>

                  {/* Icon */}
                  <div className={`text-2xl ${completedSteps[i] ? 'opacity-100' : 'opacity-70'}`}>
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-0.5">{item.action}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>

                  {/* Step Number */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    completedSteps[i]
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-slate-700 border border-slate-600 text-slate-400'
                  }`}>
                    {item.step}
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedDemoStep(expandedDemoStep === i ? null : i)}
                    className="text-slate-400 hover:text-white transition-colors ml-1"
                  >
                    <motion.div
                      animate={{ rotate: expandedDemoStep === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedDemoStep === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-700"
                    >
                      <div className="p-3 bg-slate-800/50">
                        <div className="text-xs text-slate-300 leading-relaxed mb-2">
                          {step.content.textGuide && step.content.textGuide[i] && (() => {
                            const text = step.content.textGuide[i]
                            const parts = text.split(/(\*\*.*?\*\*)/g)
                            return parts.map((part: string, idx: number) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                const boldText = part.slice(2, -2)
                                return (
                                  <span key={idx} className="text-emerald-400 font-bold">
                                    {boldText}
                                  </span>
                                )
                              }
                              return <span key={idx}>{part}</span>
                            })
                          })()}
                        </div>
                        <a
                          href="https://app.zestprotocol.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition-colors"
                        >
                          Try it Now →
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Assets */}
      {step.content.supportedAssets && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-base font-black text-white mb-3">💎 Supported Assets</h3>
          <div className="grid grid-cols-2 gap-2">
            {step.content.supportedAssets.map((asset: any, i: number) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 flex items-center gap-2">
                <div className="text-xl">{asset.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{asset.name}</div>
                  <div className="text-xs text-emerald-400">{asset.points} Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {step.content.comparison && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-base font-black text-white mb-3">⚡ Standard vs E-Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Standard Mode</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Collateral:</span><span className="text-white font-bold">{step.content.comparison.standard.collateral}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max Borrow:</span><span className="text-white font-bold">{step.content.comparison.standard.maxBorrow}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max LTV:</span><span className="text-yellow-400 font-bold">{step.content.comparison.standard.ltv}</span></div>
              </div>
            </div>
            <div className="bg-emerald-600/15 border-2 border-emerald-600 rounded-lg p-3">
              <div className="text-xs text-emerald-400 font-bold mb-2">E-Mode ⚡</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Collateral:</span><span className="text-white font-bold">{step.content.comparison.emode.collateral}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max Borrow:</span><span className="text-emerald-400 font-bold">{step.content.comparison.emode.maxBorrow}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max LTV:</span><span className="text-emerald-400 font-bold">{step.content.comparison.emode.ltv}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
            <span className="text-emerald-400 font-black text-sm">{step.content.comparison.difference}</span>
          </div>
        </div>
      )}

      {/* Asset Categories */}
      {step.content.assetCategories && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-base font-black text-white mb-3">📊 Asset Categories</h3>
          <div className="space-y-2">
            {step.content.assetCategories.map((cat: any, i: number) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.badge}</span>
                  <span className="text-sm font-bold text-white">{cat.type}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {cat.assets.map((asset: string, j: number) => (
                    <span key={j} className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 rounded text-xs text-cyan-400">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {step.content.images && step.content.images.length > 0 && (
        <div className="space-y-3">
          {step.content.images.map((image: any, i: number) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-auto"
              />
              {image.caption && (
                <div className="p-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400 text-center">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Regular Sections */}
      {step.content.sections?.map((section: any, index: number) => {
        const parts = section.text.split(/(\*\*.*?\*\*)/g)
        return (
          <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-white mb-2">{section.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {parts.map((part: string, idx: number) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const text = part.slice(2, -2)
                  return (
                    <span key={idx} className="text-emerald-400 font-bold">
                      {text}
                    </span>
                  )
                }
                return <span key={idx}>{part}</span>
              })}
            </p>
          </div>
        )
      })}

      {/* Quiz */}
      {step.content.quiz && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-white">🎯 Quick Quiz</h3>
            {step.content.demoFlow && !allStepsCompleted && (
              <div className="px-2 py-1 bg-yellow-600/20 border border-yellow-500 rounded-full text-xs font-bold text-yellow-400">
                Complete all steps first
              </div>
            )}
          </div>
          <p className="text-white text-sm mb-3">{step.content.quiz.question}</p>
          <div className="space-y-2">
            {step.content.quiz.options.map((option: string, i: number) => (
              <motion.button
                key={i}
                onClick={() => setQuizAnswers({ ...quizAnswers, [step.id]: i })}
                disabled={step.content.demoFlow && !allStepsCompleted}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  quizAnswers[step.id] === i
                    ? 'bg-cyan-600/90 border-cyan-500 text-white'
                    : step.content.demoFlow && !allStepsCompleted
                    ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50'
                }`}
                whileHover={(!step.content.demoFlow || allStepsCompleted) ? { scale: 1.01 } : {}}
                whileTap={(!step.content.demoFlow || allStepsCompleted) ? { scale: 0.99 } : {}}
              >
                {option}
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={() => {
              if (quizAnswers[step.id] === step.content.quiz.correct) {
                onComplete()
              } else {
                alert('Incorrect! Try again.')
              }
            }}
            disabled={quizAnswers[step.id] === undefined || (step.content.demoFlow && !allStepsCompleted)}
            className="w-full mt-4 py-3 bg-emerald-600/90 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-xl transition-colors"
            whileHover={quizAnswers[step.id] !== undefined && (!step.content.demoFlow || allStepsCompleted) ? { scale: 1.01 } : {}}
            whileTap={quizAnswers[step.id] !== undefined && (!step.content.demoFlow || allStepsCompleted) ? { scale: 0.99 } : {}}
          >
            {step.content.demoFlow && !allStepsCompleted
              ? `Complete ${completedSteps.filter(s => s).length}/${step.content.demoFlow.length} steps to unlock`
              : quizAnswers[step.id] === undefined
              ? 'Select an answer'
              : 'Submit & Continue'
            }
          </motion.button>
        </div>
      )}
    </div>
  )
}
