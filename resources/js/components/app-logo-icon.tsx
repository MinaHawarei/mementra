import { Heart } from 'lucide-react';

export default function AppLogoIcon({ className }: { className?: string }) {
    return <Heart className={`fill-rose-500 text-rose-500 ${className ?? ''}`} />;
}
