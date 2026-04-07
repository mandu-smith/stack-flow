
'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Play, Code2, Circle, Zap, Trophy, Target } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Quest Card Component
function QuestCard({
  status,
  title,
  date,
  stepNumber
}: {
  status: 'in-progress' | 'completed' | 'upcoming'
  title: string
  date: string
  stepNumber?: number
}) {
  const config = {
    'in-progress': {
      badge: 'IN PROGRESS',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full',
      iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/20',
      iconColor: 'text-emerald-400',
      icon: <span className="text-xs font-black">{stepNumber}</span>,
      glow: 'shadow-lg shadow-emerald-500/10'
    },
    'completed': {
      badge: 'COMPLETED',
      badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full',
      iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/20',
      iconColor: 'text-purple-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      glow: 'shadow-lg shadow-purple-500/10'
    },
    'upcoming': {
      badge: 'UPCOMING',
      badgeClass: 'bg-slate-700/20 text-slate-400 border border-slate-600/20 text-[9px] font-bold px-2 py-0.5 rounded-full',
      iconBg: 'bg-gradient-to-br from-slate-700/20 to-slate-800/20 border-slate-600/20',
      iconColor: 'text-slate-400',
      icon: <Play className="w-3 h-3" />,
      glow: 'shadow-lg shadow-slate-500/5'
    }
  }

  const c = config[status]

  return (
    <div className={`group relative bg-slate-950/50 backdrop-blur-2xl border border-slate-700/30 rounded-xl p-3.5 hover:border-slate-600/50 transition-all duration-300 ${c.glow}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between mb-2">
        <span className={c.badgeClass}>{c.badge}</span>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.iconBg} ${c.iconColor}`}>
          {c.icon}
        </div>
      </div>
      <h4 className="relative text-white font-bold text-sm mb-0.5">{title}</h4>
      <p className="relative text-slate-500 text-[11px]">Ends {date}</p>
    </div>
  )
}

// Mobile Phone Mockup
function PhoneMockup() {
  return (
    <div className="relative w-full max-w-[260px] mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl opacity-40 rounded-[2.5rem]" />

      <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-[2rem] border border-slate-700/40 shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Status Bar */}
        <div className="px-5 pt-1.5 pb-1.5 flex items-center justify-between bg-slate-900/40">
          <span className="text-slate-500 text-[10px] font-medium">9:41</span>
          <div className="flex items-center gap-0.5">
            <div className="w-2.5 h-2 border border-slate-600 rounded-sm"></div>
            <div className="w-0.5 h-2 bg-slate-600 rounded-sm"></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-5 pt-1.5">
          <h3 className="text-white text-lg font-black mb-0.5">Intro to Zest</h3>
          <p className="text-slate-500 text-[11px] mb-4">Complete quest steps</p>

          {/* Steps */}
          <div className="space-y-2.5">
            {/* Completed */}
            <div className="flex items-start gap-2.5 p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[9px] text-emerald-400 font-bold mb-0.5">COMPLETE</p>
                <p className="text-white text-xs font-semibold leading-tight">Convert STX to sBTC</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="flex items-start gap-2.5 p-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[9px] text-cyan-400 font-bold mb-0.5">IN PROGRESS</p>
                <p className="text-white text-xs font-semibold leading-tight">Deposit sBTC to earn</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-500 text-[10px] font-medium">Progress</span>
              <span className="text-white text-[10px] font-bold">1 of 4</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Code Sandbox Mockup
function SandboxMockup() {
  return (
    <div className="relative group bg-slate-950/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-2xl hover:border-slate-600/50 transition-all duration-300">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Code Area */}
      <div className="relative bg-slate-900/60 rounded-lg p-5 mb-4 border border-slate-800/40 shadow-inner">
        <div className="flex items-center justify-center h-20">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <Code2 className="relative w-12 h-12 text-emerald-500/40" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="relative space-y-2.5">
        <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-400 text-xs font-bold">Deposit sBTC</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg hover:border-slate-600/40 transition-colors">
          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 text-xs font-medium">Borrow USDA</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg hover:border-slate-600/40 transition-colors">
          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 text-xs font-medium">Repay loan</span>
        </div>
      </div>
    </div>
  )
}

// User Stats Card
function UserStatsCard() {
  return (
    <div className="relative group bg-slate-950/50 backdrop-blur-2xl border border-slate-700/30 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
          <Avatar className="relative w-14 h-14 border-2 border-purple-500/40 shadow-lg shadow-purple-500/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold text-sm">U</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold rounded-full flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> 5G XP
            </span>
            <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded-full flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5" /> 2d
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 text-[10px] font-medium">Rank</span>
            <span className="text-white text-sm font-black">18,019 <span className="text-slate-600 font-normal text-[11px]">/ 20,208</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3D Background Component
function Background3D() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        transform: 'perspective(1000px) rotateX(60deg)',
        transformOrigin: 'center center',
      }} />

      {/* Floating orbs */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"
      />
    </div>
  )
}

// Main Component
export default function FeaturesSection() {
  return (
    <section className="relative py-16 lg:py-20 bg-black overflow-hidden">
      {/* 3D Background */}
      <Background3D />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full backdrop-blur-xl">
            <div className="flex -space-x-1.5">
              <Avatar className="w-5 h-5 border border-black">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[8px] font-bold">A</AvatarFallback>
              </Avatar>
              <Avatar className="w-5 h-5 border border-black">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-[8px] font-bold">B</AvatarFallback>
              </Avatar>
              <Avatar className="w-5 h-5 border border-black">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-pink-600 text-white text-[8px] font-bold">C</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-slate-400 text-xs font-medium">
              <span className="text-emerald-400 font-bold">25,412</span> builders
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Learn DeFi the Right Way
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Fast, in-depth, and structured learning paths designed by top educators
          </p>
        </motion.div>

        {/* Compact Three Column Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left - Fast */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                <Target className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Fast</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-3 leading-tight">
                Learn in Minutes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No time? No problem! QuestFi teaches you how to master DeFi protocols faster than you can say "WAGMI"! Each quest is designed to fit into your busy schedule with bite-sized challenges that deliver maximum learning in minimum time.
              </p>
            </div>
            <div className="space-y-3">
              <QuestCard status="in-progress" title="Intro to Zest" date="Nov 30, 2025" stepNumber={2} />
              <QuestCard status="completed" title="StackingDAO Basics" date="Dec 30, 2025" />
              <QuestCard status="upcoming" title="Granite Deep Dive" date="Dec 30, 2025" />
            </div>
          </motion.div>

          {/* Middle - In-depth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 flex flex-col"
          >
            <SandboxMockup />

            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-purple-500/5 border border-purple-500/20 rounded-full">
                <Code2 className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">In-Depth</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-3 leading-tight">
                Hands-On Practice
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Learning can be tough, but QuestFi makes it well, easy! With our simple but super effective challenges, you'll go from zero to blockchain hero without breaking a sweat. Practice real DeFi transactions in a safe sandbox environment.
              </p>
            </div>
          </motion.div>

          {/* Right - Structured */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
                <Trophy className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">Structured</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-3 leading-tight">
                Expert Designed
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Not sure where to start? Our learning experts from Harvard, Stanford and other top universities have designed each challenge series to help you learn as quickly and efficiently as possible. Follow a proven path to DeFi mastery.
              </p>
            </div>
            <UserStatsCard />
            <PhoneMockup />
          </motion.div>
        </div>

        {/* Compact Bottom CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="flex-1 text-center lg:text-left">
                <h4 className="text-white text-lg font-black mb-2">Ready to start your DeFi journey?</h4>
                <p className="text-slate-400 text-sm">Join thousands learning Bitcoin DeFi. No wallet required.</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="text-center px-3">
                  <div className="text-2xl font-black text-white mb-0.5">100%</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Safe</div>
                </div>
                <div className="h-10 w-px bg-slate-700/50"></div>
                <div className="text-center px-3">
                  <div className="text-2xl font-black text-emerald-400 mb-0.5">5min</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Start</div>
                </div>
                <button className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black overflow-hidden transition-all duration-300">
                  <div className="absolute inset-0 bg-emerald-400 transition-all duration-300 group-hover:bg-emerald-500 rounded-lg" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-lg" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-emerald-400/60 transition-opacity duration-300 -z-10" />
                  <span className="relative font-bold tracking-wide">Begin Quest</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}