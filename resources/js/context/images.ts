import logo from '@/assets/images/Watchly.png';
import bg_Watchly from '@/assets/images/bg_Watchly.png';

export const images = {
    logo,
    bg_Watchly,
} as const;

export type ImageKey = keyof typeof images;
export default images;