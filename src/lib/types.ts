export type CardStatus = "new" | "learning" | "review";
export type Rating = "again" | "hard" | "good" | "easy";

export type Language = {
  code: string;
  name_native: string;
  name_ko: string;
  flag: string | null;
};

export type Profile = {
  id: string;
  display_name: string | null;
  ui_language: string;
  learning_source_lang: string;
  learning_target_lang: string;
  created_at: string;
};

export type Deck = {
  id: string;
  title: string;
  description: string | null;
  source_lang: string;
  target_lang: string;
  level: string | null;
  sort_order: number;
};

export type Card = {
  id: string;
  deck_id: string;
  term: string;
  reading: string | null;
  meaning: string;
  example: string | null;
  example_meaning: string | null;
  sort_order: number;
};

export type Sentence = {
  id: string;
  source_lang: string;
  target_lang: string;
  level: string | null;
  text_target: string;
  reading: string | null;
  text_source: string;
  day_index: number | null;
};

export type UserCard = {
  user_id: string;
  card_id: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
  last_reviewed_at: string | null;
  status: CardStatus;
};

export type StudyLog = {
  id: string;
  user_id: string;
  studied_on: string;
  cards_reviewed: number;
  sentences_studied: number;
};

export type CardProgress = Pick<
  UserCard,
  "ease" | "interval_days" | "repetitions" | "due_date" | "status"
>;

/** A card joined with the current user's SRS progress (if any). */
export type StudyCard = Card & {
  progress: CardProgress | null;
};
