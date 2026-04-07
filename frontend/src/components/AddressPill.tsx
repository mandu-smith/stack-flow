import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AddressPillProps {
  address: string;
  className?: string;
}

export function AddressPill({ address, className = '' }: AddressPillProps) {
  const [copied, setCopied] = useState(false);
  const truncated = `${address.slice(0, 5)}…${address.slice(-4)}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };