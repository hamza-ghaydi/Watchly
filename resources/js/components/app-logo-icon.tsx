
import images from '@/constants/images';
import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={images.iconwatchly}
            alt="Watchly" 
            className="w-20 object-cover"
        />
    );
}
