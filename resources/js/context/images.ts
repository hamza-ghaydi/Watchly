import logo from '../../images/Watchly.png';
import bg_Watchly from '../../images/bg_Watchly.png';

export const images = {
    logo,
    bg_Watchly,
} as const;

export type ImageKey = keyof typeof images;
export default images;