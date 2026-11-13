export type UserRole = "patient" | "caregiver" | "healer";

export interface JourneyStageItem {
  id: string;
  label: string;
  pill: string;
  title: string;
  desc: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  tipLabel: string;
  tipQuote: string;
  image: string;
}

export interface CommunityCircleItem {
  id: string;
  tag: string;
  title: string;
  facilitator: string;
  schedule: string;
  desc: string;
  cta: string;
}
