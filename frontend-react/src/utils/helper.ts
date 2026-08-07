import { DESTINATION_IMAGES } from '../constants/images';

export function getImageForDestination(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  // Default placeholder image
  return `https://lh3.googleusercontent.com/aida-public/AB6AXuBkF-Z9gpc6o79QSRGm32SxyoZBR7JyAbmNWxoTWjCJ1fTz5KVKLRb14R2QA63E3vn1ZYWQdSDmLrYkuewfIVcLNaeMgZ3QaQsEjwT_8sincE_c-7hdsP-qRFb_5CagNcDg8ttX72r-91tertmOLxucSUsyjSaA3nkY-s4jAbdct5jpZLIqLTfdHbxICREIKgzFoevx_2EUIAPHsOe7NapW2-2j6j0si1MNiuB28eDZdWM6LRemZfI-U4fDVrhnSWu24LN8Jy6w6hc`;
}
