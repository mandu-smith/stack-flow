import { BookOpen} from 'lucide-react'

export const stacksIntroStep = {
  id: 1,
  title: 'Introduction to Stacks & Bitcoin DeFi',
  type: 'learn',
  duration: '12 min',
  xp: 200,
  icon: BookOpen,
  color: 'indigo',
  content: {
    description: 'Learn about Stacks, sBTC, and the Bitcoin DeFi ecosystem',
    videoUrl: 'https://www.youtube.com/watch?si=5qfzl7N7iF29F0Qi&v=3ISC2LWaJro&feature=youtu.be',
    textGuide: [
      '**Bitcoin** began as a breakthrough in decentralized money. It\'s the most secure blockchain — but was never designed for scalability or complex programmability.',
      '**Stacks changes that.** It\'s a Bitcoin Layer designed to bring **smart contracts and DeFi functionality to Bitcoin** — without changing Bitcoin itself.',
      'Stacks operates as a separate blockchain that **settles to Bitcoin** through **Proof of Transfer (PoX)**, linking both chains cryptographically. This ensures Stacks\' **history and security are ultimately secured by Bitcoin\'s hashpower**.',
      'With the **Nakamoto release**, Stacks reaches **full Bitcoin finality** — once a Bitcoin block is confirmed, Stacks transactions are final too. To reorganize a Stacks block, you\'d have to reorganize Bitcoin itself!',
      '**Why STX token?** It maintains **decentralization** by rewarding miners and signers who secure Bitcoin-pegged assets like sBTC. Without it, the system would rely on trusted intermediaries.',
      '**sBTC** is a 1:1 Bitcoin-backed token on Stacks. It enables Bitcoin holders to participate in DeFi without selling their BTC. Quick conversions happen within **3 Bitcoin blocks for deposit, 6 for withdrawal**.'
    ],
    stats: [
      { label: 'Bitcoin Market Cap', value: '$2+ Trillion', icon: '₿' },
      { label: 'Stacks Security', value: 'Bitcoin Finality', icon: '🔒' },
      { label: 'sBTC Peg', value: '1:1 with BTC', icon: '⚖️' },
      { label: 'Withdrawal Time', value: '6 BTC blocks', icon: '⚡' }
    ],
    keyFacts: [
      'Bitcoin provides foundation — security, decentralization, trust',
      'Stacks provides flexibility — smart contracts, dApps, DeFi',
      'Proof of Transfer (PoX) cryptographically links both chains',
      'Nakamoto = Full Bitcoin finality & security',
      'sBTC bridges Bitcoin to DeFi (1:1 peg, fast conversion)',
      'Clarity language reads Bitcoin state directly'
    ],
    sections: [
      {
        title: '🎯 The Stacks Vision',
        text: 'Back in 2010, Satoshi envisioned networks that could "share CPU power with Bitcoin". Stacks builds on this — a Bitcoin Layer 2 designed to scale and expand Bitcoin\'s utility through: **Decentralization** (open participation), **Security** (anchored to Bitcoin PoW), and **Programmability** (Clarity smart contracts).'
      },
      {
        title: '🔐 sBTC: Bitcoin on Stacks',
        text: 'sBTC is a SIP-010 token representing Bitcoin 1:1 on Stacks. It allows Bitcoin holders to access DeFi without selling BTC. Managed by 15 community-chosen signers with democratic control. Quick conversions: 3 blocks deposit, 6 blocks withdrawal. This unlocks your Bitcoin for lending, borrowing, and yield generation.'
      },
      {
        title: '💫 Bitcoin + Stacks Synergy',
        text: 'This partnership transforms Bitcoin from passive store of value into active financial layer — powering DEXs, lending, NFTs, and more. It strengthens Bitcoin\'s sustainability by driving on-chain activity and fees even after block rewards diminish.'
      }
    ],
    quiz: {
      question: 'What makes STX Stacking unique compared to staking on other blockchains?',
      options: [
        'It rewards users in sBTC',
        'It rewards users in native BTC on Bitcoin L1',
        'It offers instant yield only',
        'It doesn\'t require locking tokens'
      ],
      correct: 1
    }
  }
}

