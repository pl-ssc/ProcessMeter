import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const alertVariants = cva('relative w-full rounded-2xl border p-4', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive: 'border-destructive/50 text-destructive dark:border-destructive',
      success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
      warning: 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />);
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />);

export { Alert, AlertDescription, AlertTitle };
