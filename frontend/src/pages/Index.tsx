import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StatValue } from '@/components/StatValue';
import { TipComposer } from '@/components/TipComposer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getPlatformStats } from '@/lib/contract';