import { cn } from '@/lib/utils';
import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            alt="Mementra"
            className={cn('object-contain shrink-0 bg-transparent border-0 shadow-none ring-0', className)}
            {...props}
        />
    );
}
