import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/10 bg-primary/8 text-primary',
        secondary: 'border-border/70 bg-secondary/70 text-secondary-foreground',
        destructive: 'border-destructive/10 bg-destructive/10 text-destructive',
        outline: 'text-foreground',
        success: 'border-emerald-500/10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'border-amber-500/10 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
