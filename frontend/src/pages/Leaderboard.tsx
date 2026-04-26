import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';
import { AddressPill } from '@/components/AddressPill';
import { AmountDisplay } from '@/components/AmountDisplay';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import { getLeaderboard } from '@/lib/contract';

const medals = ['🥇', '🥈', '🥉'];