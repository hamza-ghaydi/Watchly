const BASE = '/images' as const;

const images = {
  bgwatchly:  `${BASE}/bgwatchly.png`,
  iconwatchly:       `${BASE}/icon.png`,
  logo:     `${BASE}/logowatchly.png`,

} as const;

export type ImageKey = keyof typeof images;
export default images;