import { motion } from 'framer-motion';
import { TipRow } from '@/components/TipRow';
import { SkeletonRow } from '@/components/SkeletonRow';
import { EmptyState } from '@/components/EmptyState';
import type { TipEntry } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getAllTips } from '@/lib/contract';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';