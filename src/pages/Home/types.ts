export type GameCategoryId = 'angka' | 'huruf' | 'hijaiyyah' | 'memori';

export type FilterCategoryId = 'semua' | GameCategoryId;

export type PlayerMode = 'single' | 'duel';

export type LanguageCode = 'id' | 'en';

export type GameIconType =
  | 'ayo-berhitung'
  | 'menulis-angka'
  | 'susun-kata'
  | 'bunyi-awal'
  | 'menulis-huruf'
  | 'dengar-temukan'
  | 'tebalkan-hijaiyyah'
  | 'kartu-kembar'
  | 'petualangan-labirin';

export interface GameItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly byline: string;
  readonly ageLabel: string;
  readonly category: GameCategoryId;
  readonly categoryLabel: string;
  readonly stars: number;
  readonly iconType: GameIconType;
}

export interface CategoryFilterItem {
  readonly id: FilterCategoryId;
  readonly label: string;
  readonly emoji: string;
}

export interface NavItem {
  readonly id: string;
  readonly label: string;
}
