'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export default function SimulatorContent({ tasks, simulatorState, setSimulatorState, simulatorTasks, setSimulatorTasks, onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0) // 0=supply, 1=watch earn, 2=borrow, 3=monitor health, 4=e-mode
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [showWallet, setShowWallet] = useState(false)
  const [transacting, setTransacting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userBalance, setUserBalance] = useState({ sBTC: 5.5, STX: 15000, USDC: 10000 })
  const [collateralEnabled, setCollateralEnabled] = useState(false)
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<string | null>(null)
  const [borrowAmount, setBorrowAmount] = useState('')
  const [eModeActive, setEModeActive] = useState(false)

  const assets = [
    { name: 'sBTC', icon: '₿', apy: '3.2%' },
    { name: 'STX', icon: '⚡', apy: '5.8%' },
    { name: 'USDC', icon: '💵', apy: '4.5%' },
  ]

  const borrowableAssets = [
    { name: 'USDA', icon: '💵', apy: '6.5%' },
    { name: 'USDC', icon: '💰', apy: '5.2%' },
  ]

  const performTask = (index: number) => {
    setSimulatorTasks((prevTasks: boolean[]) => {
      const newTasks = [...prevTasks]
      newTasks[index] = true
      return newTasks
    })
  }

  const handleSupply = () => {
    const assetToUse = selectedAsset || 'sBTC'
    const amountToUse = amount && parseFloat(amount) > 0 ? parseFloat(amount) : 1.0

    setTransacting(true)
    setShowWallet(true)

    setTimeout(() => {
      setShowWallet(false)

      setSimulatorState((prev: any) => ({
        ...prev,
        deposited: amountToUse,
        depositedAsset: assetToUse
      }))

      // Deduct from user balance
      setUserBalance((prev) => ({ ...prev, [assetToUse]: prev[assetToUse as keyof typeof prev] - amountToUse }))

      performTask(0)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        setTransacting(false)
        setSelectedAsset(null)
        setAmount('')
        setCurrentStep(1) // Move to watching earnings

        // Start earning interest after 2 seconds
        setTimeout(() => {
          let earned = 0
          const interval = setInterval(() => {
            earned += 0.00001
            setSimulatorState((prev: any) => ({ ...prev, earned }))
          }, 100)

          // After 3 seconds, mark task complete
          setTimeout(() => {
            clearInterval(interval)
            performTask(1)
          }, 3000)
        }, 2000)
      }, 2000)
    }, 3000)
  }

  const enableCollateral = () => {
    setCollateralEnabled(true)
    setTimeout(() => {
      setCurrentStep(2) // Move to borrowing
    }, 1000)
  }

  const handleBorrow = () => {
    const borrowAssetToUse = selectedBorrowAsset || 'USDA'
    const borrowAmountToUse = borrowAmount && parseFloat(borrowAmount) > 0 ? parseFloat(borrowAmount) : 500

    setTransacting(true)
    setShowWallet(true)

    setTimeout(() => {
      setShowWallet(false)

      // Calculate health factor
      const collateralValue = simulatorState.deposited * 60000 // assume sBTC = $60k
      const borrowValue = borrowAmountToUse
      const healthFactor = (collateralValue * 0.75) / borrowValue

      setSimulatorState((prev: any) => ({
        ...prev,
        borrowed: borrowAmountToUse,
        borrowedAsset: borrowAssetToUse,
        healthFactor
      }))

      performTask(2)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        setTransacting(false)
        setSelectedBorrowAsset(null)
        setBorrowAmount('')
        setCurrentStep(3) // Move to monitoring health
        performTask(3)

        setTimeout(() => {
          setCurrentStep(4) // Move to E-Mode
        }, 2000)
      }, 2000)
    }, 3000)
  }

  const activateEMode = () => {
    setTransacting(true)
    setShowWallet(true)

    setTimeout(() => {
      setShowWallet(false)
      setEModeActive(true)

      // Increase health factor with E-Mode
      const collateralValue = simulatorState.deposited * 60000
      const borrowValue = simulatorState.borrowed
      const healthFactor = (collateralValue * 0.80) / borrowValue // 80% LTV instead of 75%

      setSimulatorState((prev: any) => ({ ...prev, healthFactor }))

      performTask(4)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        setTransacting(false)
      }, 2000)
    }, 3000)
  }

  const allCompleted = simulatorTasks.every((t: boolean) => t)

  return (
    <div className="space-y-4">
      {/* Simulated DApp Interface */}
      <div className="bg-slate-900/90 border border-indigo-700/30 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-white">🍊 Zest Protocol</h3>
          <motion.div
            className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center gap-2"
            animate={{ boxShadow: ['0 0 10px rgba(16, 185, 129, 0.3)', '0 0 20px rgba(16, 185, 129, 0.6)', '0 0 10px rgba(16, 185, 129, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Testnet</span>
          </motion.div>
        </div>

        {/* Your Supplies Dashboard */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3 mb-4">
          <h4 className="text-xs font-black text-slate-400 mb-3">💰 YOUR SUPPLIES</h4>
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-emerald-600/15 border border-emerald-600/30 rounded-lg p-3"
              animate={simulatorState.deposited > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="text-slate-400 text-xs mb-1">Deposited</div>
              <div className="text-white text-lg font-black">{simulatorState.deposited.toFixed(4)} sBTC</div>
              {simulatorState.deposited > 0 && <div className="text-emerald-400 text-xs mt-1">✓ Active</div>}
            </motion.div>
            <motion.div
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
              animate={simulatorState.earned > 0 ? { borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-slate-400 text-xs mb-1">Earned Interest</div>
              <div className="text-emerald-400 text-lg font-black">+{simulatorState.earned.toFixed(6)} sBTC</div>
              {simulatorState.earned > 0 && <div className="text-xs text-slate-500 mt-1">📈 Compounding...</div>}
            </motion.div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Borrowed</div>
              <div className="text-white text-lg font-black">${simulatorState.borrowed} USDA</div>
            </div>
            <motion.div
              className={`bg-slate-800/50 border rounded-lg p-3 ${
                simulatorState.healthFactor >= 2 ? 'border-emerald-500/50' : 'border-slate-700'
              }`}
            >
              <div className="text-slate-400 text-xs mb-1">Health Factor</div>
              <div className={`text-lg font-black ${simulatorState.healthFactor >= 2 ? 'text-emerald-400' : 'text-white'}`}>
                {simulatorState.healthFactor > 0 ? simulatorState.healthFactor.toFixed(2) : '∞'}
              </div>
              {simulatorState.healthFactor >= 2 && <div className="text-emerald-400 text-xs mt-1">✓ Healthy</div>}
            </motion.div>
          </div>
        </div>

        {/* Step 1: Supply Interface */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">1</div>
              <h4 className="text-sm font-semibold text-slate-200">Supply Assets</h4>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {assets.map((asset) => (
                <motion.button
                  key={asset.name}
                  onClick={() => setSelectedAsset(asset.name)}
                  className={`p-2.5 rounded-lg border transition-all ${
                    selectedAsset === asset.name
                      ? 'bg-slate-700 border-slate-600'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xl mb-1">{asset.icon}</div>
                  <div className="text-xs font-medium text-white">{asset.name}</div>
                  <div className="text-xs text-emerald-500">{asset.apy}</div>
                </motion.button>
              ))}
            </div>

            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Amount to Supply</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-cyan-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Balance: {userBalance[selectedAsset as keyof typeof userBalance]} {selectedAsset}
                  </div>
                </div>

                <motion.button
                  onClick={handleSupply}
                  disabled={transacting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {transacting ? 'Processing...' : 'Supply'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Watch Interest Earn */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">2</div>
              <h4 className="text-sm font-semibold text-slate-200">Watch Your Balance Grow</h4>
            </div>
            <div className="text-center py-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl mb-3"
              >
                💰
              </motion.div>
              <p className="text-slate-400 text-sm mb-2">Your deposit is earning interest!</p>
              <motion.div
                className="text-3xl font-black text-emerald-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                +{simulatorState.earned.toFixed(6)} sBTC
              </motion.div>
              <p className="text-xs text-slate-500 mt-2">Interest compounds every block</p>
            </div>
            {simulatorTasks[1] && !collateralEnabled && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={enableCollateral}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.01 }}
              >
                Enable as Collateral
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 3: Borrow Interface */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">3</div>
              <h4 className="text-sm font-semibold text-slate-200">Borrow Assets</h4>
            </div>

            <div className="mb-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Available to Borrow</div>
              <div className="text-lg font-semibold text-white">${(simulatorState.deposited * 60000 * 0.5).toFixed(0)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {borrowableAssets.map((asset) => (
                <motion.button
                  key={asset.name}
                  onClick={() => setSelectedBorrowAsset(asset.name)}
                  className={`p-2.5 rounded-lg border transition-all ${
                    selectedBorrowAsset === asset.name
                      ? 'bg-slate-700 border-slate-600'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xl mb-1">{asset.icon}</div>
                  <div className="text-xs font-medium text-white">{asset.name}</div>
                  <div className="text-xs text-slate-400">{asset.apy}</div>
                </motion.button>
              ))}
            </div>

            {selectedBorrowAsset && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Amount to Borrow</label>
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-orange-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Max: ${(simulatorState.deposited * 60000 * 0.5).toFixed(0)}
                  </div>
                </div>

                <motion.button
                  onClick={handleBorrow}
                  disabled={transacting}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {transacting ? 'Processing...' : 'Borrow'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 4: Monitor Health */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">4</div>
              <h4 className="text-sm font-semibold text-slate-200">Health Factor Status</h4>
            </div>
            <div className="text-center py-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
                transition={{ duration: 2 }}
                className="text-5xl mb-3"
              >
                ✓
              </motion.div>
              <p className="text-slate-400 text-sm mb-2">Your position is healthy</p>
              <div className="text-4xl font-black text-emerald-400 mb-2">
                {simulatorState.healthFactor.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500">Health Factor &gt; 1.0 = Safe</p>
            </div>
          </motion.div>
        )}

        {/* Step 5: E-Mode */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">5</div>
              <h4 className="text-sm font-semibold text-slate-200">Activate E-Mode</h4>
            </div>

            {!eModeActive ? (
              <div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-slate-300 mb-3">
                    E-Mode increases your borrowing power by <span className="text-violet-400 font-semibold">60%</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/50 rounded p-2">
                      <div className="text-slate-400 mb-1">Current LTV</div>
                      <div className="text-white font-semibold">50%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2">
                      <div className="text-slate-400 mb-1">E-Mode LTV</div>
                      <div className="text-violet-400 font-semibold">80%</div>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={activateEMode}
                  disabled={transacting}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {transacting ? 'Activating...' : 'Activate E-Mode'}
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1 }}
                  className="text-5xl mb-3"
                >
                  ⚡
                </motion.div>
                <p className="text-purple-400 text-lg font-black mb-2">E-Mode Activated!</p>
                <div className="text-3xl font-black text-emerald-400 mb-2">
                  {simulatorState.healthFactor.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">Health factor improved!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Wallet Approval Modal */}
      <AnimatePresence>
        {showWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl shadow-cyan-500/50"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4"
                >
                  🔐
                </motion.div>
                <h3 className="text-xl font-black text-white mb-2">Wallet Confirmation</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Approve transaction in your wallet
                </p>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Supplying</div>
                  <div className="text-lg font-black text-white">{amount} {selectedAsset}</div>
                </div>
                <motion.div
                  className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-emerald-600"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 3 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl border border-emerald-500 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
                className="text-xl"
              >
                ✓
              </motion.div>
              <div>
                <div className="font-semibold text-sm">Transaction Successful</div>
                <div className="text-xs opacity-90">Your transaction has been confirmed</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Checklist */}
      <div className="space-y-2">
        {[
          `Deposit ${simulatorState.deposited || '1.0'} ${simulatorState.depositedAsset || 'sBTC'} into Zest lending pool`,
          'Watch your balance earn interest in real-time',
          `Borrow $${simulatorState.borrowed || '500'} ${simulatorState.borrowedAsset || 'USDA'} against your collateral`,
          'Monitor your health factor (must stay above 1.0)',
          'Activate E-Mode for higher capital efficiency'
        ].map((task: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`px-4 py-2.5 rounded-lg border transition-all ${
              simulatorTasks[i]
                ? 'bg-emerald-900/20 border-emerald-700/50'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={simulatorTasks[i] ? { scale: [0, 1.2, 1], rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                {simulatorTasks[i] ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
              </motion.div>
              <span className={`font-medium text-sm ${simulatorTasks[i] ? 'text-emerald-500' : 'text-slate-300'}`}>{task}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onComplete}
        disabled={!allCompleted}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
        whileHover={allCompleted ? { scale: 1.01 } : {}}
        whileTap={allCompleted ? { scale: 0.99 } : {}}
      >
        {allCompleted ? 'Complete Simulator' : 'Complete all tasks to continue'}
      </motion.button>
    </div>
  )
}
