import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
            aria-label="Toggle theme"
        >
            {resolvedAppearance === 'dark' ? (
                <Sun className="h-5 w-5" style={{ color: 'var(--gold)' }} />
            ) : (
                <Moon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            )}
        </Button>
    );
}
