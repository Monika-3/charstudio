export interface Character {
  id: string;
  name: string;
  reference_image_url: string | null;
  created_at: string;
}

export interface Pose {
  id: string;
  character_id: string;
  name: string;
  genre: string | null;
  image_url: string;
  has_background_removed: boolean;
  created_at: string;
  characters?: Character;
}

export type Genre =
  | "action"
  | "standing"
  | "running"
  | "combat"
  | "stealth"
  | "cinematic";
