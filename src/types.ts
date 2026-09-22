export type BusinessCategory = 'restaurant' | 'cafe' | 'salon' | 'retail' | 'other';

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface PointReward {
  id: string;
  points: number;
  title: string;
  description: string;
}

export interface LoyaltyConfig {
  mode: 'stamp' | 'points';
  stampTarget: number; // e.g. 9 or 10 stamps
  stampRewardTitle: string; // e.g. 'Free Artisanal Coffee or Gourmet Pastry'
  stampDescription: string; // e.g. 'Earn 1 stamp with every order above ₹150'
  pointsPerVisit: number; // e.g. 15 points per visit or per ₹100
  pointRewards: PointReward[];
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  website?: string;
  swiggy?: string;
}

export interface BusinessStats {
  qrScans: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  reviewPromptViews: number;
  reviewPromptClicks: number;
  rewardsRedeemed: number;
  createdAt: string;
}

export interface Business {
  id: string;
  slug: string; // unique slug e.g. 'moti-mahal-delux'
  name: string;
  tagline: string;
  category: BusinessCategory;
  logo: string;
  coverImage?: string;
  phone: string;
  whatsapp: string;
  address: string;
  googleMapsUrl: string;
  googleReviewUrl: string;
  socialLinks: SocialLinks;
  hours: BusinessHours[];
  brandColor: string; // Hex color for custom brand identity
  loyaltyConfig: LoyaltyConfig;
  stats: BusinessStats;
  ownerPhone: string;
  ownerId?: string;
  rating?: number;
  reviewCount?: number;
  servesVegetarian?: boolean;
  reservationsUrl?: string;
  staffPin?: string;
}

export type UserRole = 'admin' | 'owner';

export interface User {
  id: string;
  role: UserRole;
  identifier: string; // phone or email or username
  assignedShopSlug?: string; // only for owner role
  staffPin?: string;
  name?: string;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface MenuItem {
  id: string;
  businessId: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface LoyaltyHistoryItem {
  id: string;
  type: 'stamp_added' | 'reward_redeemed' | 'points_added';
  amount: number;
  date: string;
  note?: string;
}

export interface CustomerLoyalty {
  id: string;
  businessId: string;
  phone: string;
  name: string;
  stamps: number;
  points: number;
  totalVisits: number;
  lastVisit: string;
  redeemedRewards: Array<{
    rewardTitle: string;
    redeemedAt: string;
  }>;
  history: LoyaltyHistoryItem[];
}

export interface ExtractedMenuItem {
  name: string;
  category: string;
  price: number;
  description?: string;
  isVeg: boolean;
}
