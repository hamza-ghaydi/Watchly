import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src="/images/watchly.png" 
            alt="Watchly" 
            className="w-18 object-cover"
        />
    );
}
