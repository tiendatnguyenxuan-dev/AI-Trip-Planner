import dalatImg from '../assets/dalat.jpg';
import danangImg from '../assets/danang.jpg';
import halongImg from '../assets/halong.jpg';
import sapaImg from '../assets/sapa.jpg';

export const DESTINATION_IMAGES: Record<string, string> = {
  'hội an': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hoi_An_Covered_Bridge.jpg/640px-Hoi_An_Covered_Bridge.jpg',
  'đà lạt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Da_Lat_panorama.jpg/640px-Da_Lat_panorama.jpg',
  'phú quốc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Phu_Quoc_island.jpg/640px-Phu_Quoc_island.jpg',
  'hạ long': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ha_Long_Bay_Junk_Boat.jpg/640px-Ha_Long_Bay_Junk_Boat.jpg',
  'đà nẵng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Da_Nang_City.jpg/640px-Da_Nang_City.jpg',
};

export const HERO_BGS = [
  '/assets/explore/hanoi_culture.png',
  danangImg,
  '/assets/explore/phuquoc_luxury.png',
  dalatImg,
  halongImg,
  sapaImg,
  '/assets/explore/danang_modern.png',
  '/assets/explore/dalat_adventure.png'
];
