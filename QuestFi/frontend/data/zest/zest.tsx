import { Sparkles, Target, Trophy, Video, Wallet, Zap } from 'lucide-react'
import { stacksIntroStep } from '../introduction/stacks-intro'


export const zestData = {
    id: 'zest',
    name: 'Zest Protocol',
    tagline: 'Bitcoin-Backed Lending & Borrowing',
    icon: '🍊',
    color: 'emerald',
    totalXP: 1550,
    steps: [
      stacksIntroStep,
      {
        id: 2,
        title: 'Welcome to Zest',
        type: 'learn',
        duration: '8 min',
        xp: 150,
        icon: Sparkles,
        color: 'purple',
        content: {
          description: 'Discover how Zest makes Bitcoin productive',
          videoUrl: 'https://www.youtube.com/watch?si=1cuKTmkKRa0tCJnM&v=b7kQvOG0V0M&feature=youtu.be',
          textGuide: [
            'Zest Protocol is the **DeFi protocol built for Bitcoin**. Fully on-chain and open-source, it is building the future of **Bitcoin finance**.',
            'Zest exists to **make Bitcoin productive**—every sat of it. The goal is to build a vibrant **borrowing and lending ecosystem** around Bitcoin as an asset.',
            'Live on **Stacks—the leading Bitcoin Layer 2**—Zest is now the **#1 DeFi protocol** on the network. Users can deposit idle assets such as **STX, sBTC, stSTX, USDC**, and others to **earn yield**, accumulate points, and access overcollateralized loans.',
            'Bitcoin is the most recognized, liquid, and widely held cryptocurrency with a **market cap over $2 trillion**. Much of it sits idle—despite being **ideal collateral** ready to be put to work.',
            'In just a few months, users have deposited **over 500 sBTC**—representing **more than 10% of all sBTC** on Stacks. This places Zest alongside leading lending protocols on Ethereum L2s and Solana in terms of Bitcoin liquidity.'
          ],
          stats: [
            { label: 'Total Value Locked', value: '500+ sBTC', icon: '💰' },
            { label: 'Market Share', value: '>10% of sBTC', icon: '📊' },
            { label: 'Built On', value: 'Stacks L2', icon: '⚡' },
            { label: 'Status', value: '#1 DeFi on Stacks', icon: '🏆' }
          ],
          keyFacts: [
            'Fully on-chain, open-source Bitcoin DeFi protocol',
            '$2 Trillion Bitcoin market - mostly sitting idle',
            'Lend to earn yield or borrow against your BTC',
            'Earn 2x Zest Points on select assets (STX, USDC)',
            'Built with Clarity - reads Bitcoin state directly'
          ],
          sections: [
            {
              title: '🎯 The Opportunity',
              text: 'Bitcoin-backed lending is a trillion-dollar opportunity. DeFi lending now surpasses CeFi. Zest is positioning to lead as Bitcoin DeFi scales.'
            }
          ],
          quiz: {
            question: 'What is the main goal of Zest Protocol?',
            options: [
              'To create NFTs backed by Bitcoin',
              'To make Bitcoin productive through DeFi lending and borrowing',
              'To replace Bitcoin as a digital currency',
              'To act as a Bitcoin wallet provider'
            ],
            correct: 1
          }
        }
      },
      {
        id: 3,
        title: 'See Lending in Action',
        type: 'learn',
        duration: '10 min',
        xp: 200,
        icon: Video,
        color: 'cyan',
        content: {
          description: 'Watch how lending works on Zest Protocol',
          videoUrl: 'https://www.loom.com/embed/d98bb351944c4eb399a027acbbda94be',
          additionalVideos: [
            {
              title: 'Transaction Confirmation',
              url: 'https://www.loom.com/embed/bfd33c1ae6034ba598236c8f20948ae8',
              description: 'See how transactions confirm on Stacks network'
            },
            {
              title: 'Withdrawing Assets',
              url: 'https://www.loom.com/embed/8cf8cd335a8e4917bc7f9dafb7c4c334',
              description: 'Learn how to withdraw your deposited assets and earned yield'
            }
          ],
          images: [
            {
              url: 'https://563839015-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGfC8dsUgiIuFFUi3sa84%2Fuploads%2F3wMko9sVaYQ6TGjCfbNZ%2Fimage.png?alt=media&token=f93d25c7-fb91-4080-a88d-28f7141c086d',
              caption: 'Your Supplies Dashboard'
            }
          ],
          textGuide: [
            'Visit **app.zestprotocol.com** and **connect your Stacks wallet**. Zest supports **Leather, Xverse, OKX Wallet**, Fordefi, and Asigna wallets.',
            'Under **"Assets to supply"**, select the asset you wish to earn yield on (**sBTC, STX, stSTX, or USDC** variants) and click **"Supply"**.',
            'Approve the transaction in the wallet pop-up. Wait a few seconds for **confirmation on the Stacks network**.',
            'Once confirmed, your supply position becomes active and begins earning **continuously compounding yield**. Your active lending position can be found under **"Your Supplies"**.',
            'To withdraw, click **"Withdraw"** on the asset under "Your Supplies". If you select **"Max"**, you receive your **full balance—original deposit plus accrued yield**. Note: If you have an active borrowing position, it must be **fully repaid** before you can withdraw.'
          ],
          demoFlow: [
            { step: 1, action: 'Connect Wallet', desc: 'Leather, Xverse, OKX supported', icon: '🔗' },
            { step: 2, action: 'Select Asset', desc: 'sBTC, STX, stSTX, or USDC', icon: '💎' },
            { step: 3, action: 'Click Supply', desc: 'Approve in your wallet', icon: '✅' },
            { step: 4, action: 'Earn Yield', desc: 'Continuously compounding', icon: '📈' },
            { step: 5, action: 'Withdraw Anytime', desc: 'Deposit + earned interest', icon: '💰' }
          ],
          supportedAssets: [
            { name: 'sBTC', icon: '₿', points: '1x', apy: 'Variable' },
            { name: 'STX', icon: '⚡', points: '2x', apy: 'Variable' },
            { name: 'stSTX', icon: '💫', points: '1x', apy: 'Variable' },
            { name: 'USDC', icon: '💵', points: '2x', apy: 'Variable' }
          ],
          sections: [
            {
              title: '🎬 Watch the Tutorial',
              text: 'See a real walkthrough of depositing assets and earning yield. The video shows every click and confirmation.'
            },
            {
              title: '⚡ Instant Activation',
              text: 'Once confirmed, your position is live. Interest starts accruing immediately and compounds continuously.'
            }
          ],
          quiz: {
            question: 'What happens when you supply assets to Zest Protocol?',
            options: [
              'Assets are locked forever',
              'You earn continuously compounding yield and can withdraw anytime',
              'You lose ownership of your assets',
              'You can only withdraw after 1 year'
            ],
            correct: 1
          }
        }
      },
      {
        id: 4,
        title: 'Unlock E-Mode Power',
        type: 'learn',
        duration: '10 min',
        xp: 200,
        icon: Zap,
        color: 'emerald',
        content: {
          description: 'Discover how to borrow 60% more with E-Mode',
          videoUrl: 'https://www.loom.com/embed/cac04e30d7944ce3b339df8754c545ab',
          images: [
            {
              url: 'https://563839015-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FGfC8dsUgiIuFFUi3sa84%2Fuploads%2FCT3KKcc7nvRNxb7ZdIgy%2F27b93285-c110-4460-b4a2-8fad33988dba.png?alt=media&token=5c8bbdce-7b4e-4c2a-8a56-42ea87e541ca',
              caption: 'E-Mode Activation Interface'
            }
          ],
          textGuide: [
            '**E-Mode (Efficiency Mode)** allows you to borrow **up to 60% more capital** when using correlated assets. Instead of a **50% LTV** in standard mode, E-Mode offers **up to 80% LTV**.',
            'With **$1,000 in STX collateral**: Standard mode lets you borrow **$500**. E-Mode lets you borrow **$800**. That\'s an extra **$300 in borrowing power**!',
            'E-Mode works with **correlated assets: STX, stSTX, and stSTXbtc**. These assets move together in price, **reducing liquidation risk**.',
            'To activate E-Mode: Supply **STX, stSTX, or stSTXbtc** → Enable as collateral → Click the **E-Mode toggle button**. You can now borrow correlated assets with **maximum capital efficiency**.',
            'Interest rates on Zest are **variable and determined by utilization**. Higher utilization = **higher rates for lenders**, encouraging more supply. Lower utilization = **lower rates**, encouraging more borrowing. Rates update in **real-time** based on market dynamics.'
          ],
          comparison: {
            standard: {
              collateral: '$1,000',
              maxBorrow: '$500',
              ltv: '50%',
              liquidation: '75%',
              penalty: '10%'
            },
            emode: {
              collateral: '$1,000',
              maxBorrow: '$800',
              ltv: '80%',
              liquidation: '85%',
              penalty: '5%'
            },
            difference: '+$300 (60% more!)'
          },
          assetCategories: [
            { type: 'Collateral', assets: ['STX', 'sBTC', 'stSTX'], canSupply: true, canBorrow: true, canCollateralize: true, badge: '💎' },
            { type: 'Borrow-Only', assets: ['USDC', 'USDA', 'USDh'], canSupply: false, canBorrow: true, canCollateralize: false, badge: '💵' },
            { type: 'E-Mode', assets: ['STX', 'stSTX', 'stSTXbtc'], canSupply: true, canBorrow: true, canCollateralize: true, badge: '⚡' }
          ],
          sections: [
            {
              title: '⚡ E-Mode = 60% More Borrowing Power',
              text: 'Same $1,000 collateral: Standard mode = $500 borrow. E-Mode = $800 borrow. That\'s $300 extra capital to work with!'
            },
            {
              title: '🎯 How to Activate',
              text: 'Supply STX/stSTX/stSTXbtc → Enable as collateral → Click E-Mode button. Done! Now borrow correlated assets with max efficiency.'
            }
          ],
          quiz: {
            question: 'With $1,000 in STX collateral, how much can you borrow in E-Mode?',
            options: [
              '$500',
              '$650',
              '$800',
              '$1,000'
            ],
            correct: 2
          }
        }
      },
      {
        id: 5,
        title: 'Interactive Simulator',
        type: 'simulator',
        duration: '15 min',
        xp: 250,
        icon: Target,
        color: 'yellow',
        content: {
          description: 'Practice lending and borrowing in a safe environment',
          tasks: [
            'Deposit 1.0 sBTC into Zest lending pool',
            'Watch your balance earn interest in real-time',
            'Borrow 500 USDA against your sBTC collateral',
            'Monitor your health factor (must stay above 1.0)',
            'Activate E-Mode for higher capital efficiency'
          ]
        }
      },
      {
        id: 6,
        title: 'Practice on Mainnet',
        type: 'practice',
        duration: '20 min',
        xp: 300,
        icon: Wallet,
        color: 'orange',
        content: {
          description: 'Practice with Zest Protocol on Stacks mainnet',
          steps: [
            {
              action: 'Connect Wallet',
              instruction: 'Connect your Leather, Xverse, or compatible Stacks wallet.',
              verification: 'wallet'
            },
            {
              action: 'Visit Zest Protocol',
              instruction: 'Navigate to app.zestprotocol.com and explore the interface.',
              verification: 'balance'
            },
            {
              action: 'Supply to Zest Market',
              instruction: 'Supply assets (sBTC, STX, or stablecoins) to the lending pool to start earning yield.',
              verification: 'transaction'
            },
            {
              action: 'Enable as Collateral',
              instruction: 'Enable your supplied assets as collateral in your dashboard.',
              verification: 'position'
            },
            {
              action: 'Borrow Against Collateral',
              instruction: 'Borrow USDA or other assets against your collateral and monitor your health factor.',
              verification: 'transaction'
            }
          ]
        }
      },
      {
        id: 7,
        title: 'Zest Mastery Quiz',
        type: 'quiz',
        duration: '10 min',
        xp: 250,
        icon: Trophy,
        color: 'pink',
        content: {
          description: 'Prove your mastery of Zest Protocol and earn your NFT badge',
          questions: [
            {
              question: 'What is the main goal of Zest Protocol?',
              options: [
                'To create NFTs backed by Bitcoin',
                'To make Bitcoin productive through DeFi lending and borrowing',
                'To replace Bitcoin as a digital currency',
                'To act as a Bitcoin wallet provider'
              ],
              correct: 1
            },
            {
              question: 'Which blockchain layer powers Zest Protocol?',
              options: [
                'Ethereum',
                'Solana',
                'Stacks',
                'Avalanche'
              ],
              correct: 2
            },
            {
              question: 'What percentage of all sBTC on Stacks has been deposited into Zest?',
              options: [
                'About 1%',
                'About 5%',
                'Over 10%',
                'Over 25%'
              ],
              correct: 2
            },
            {
              question: 'How can users earn double Zest Points (2 points per $1 per day)?',
              options: [
                'By supplying STX, aeUSDC, USDh, aUSD, or USDA',
                'By borrowing any token on Stacks',
                'By holding Bitcoin in a wallet',
                'By staking sBTC on Ethereum'
              ],
              correct: 0
            },
            {
              question: 'What is the maximum LTV in E-Mode for correlated assets?',
              options: [
                '50%',
                '65%',
                '80%',
                '95%'
              ],
              correct: 2
            }
          ]
        }
      }
    ]
}