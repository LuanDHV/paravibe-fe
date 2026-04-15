// src/lib/constants.ts
export const MUSIC_GENRES = [
  // Các thể loại phổ biến / Popular genres
  "pop",
  "rock",
  "hiphop",
  "edm",
  "latin",

  // R&B và Soul / R&B and Soul
  "rnb",
  "soul",

  // Alternative và Indie / Alternative and Indie
  "indie",
  "alternative",
  "experimental",

  // Electronic và House / Electronic and House
  "electronic",
  "house",
  "techno",

  // Urban và Trap / Urban and Trap
  "trap",
  "grime",
  "drill",

  // Quốc tế / International
  "k-pop",
  "j-pop",
  "reggaeton",

  // Truyền thống / Traditional
  "reggae",
  "jazz",
  "classical",
  "country",
  "folk",

  // Các thể loại khác phổ biến / Other popular genres
  "metal",
  "punk",
  "disco",
  "funk",
  "gospel",
  "blues",
  "ambient",
  "synthwave",
  "lofi",
  "dubstep",
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];
