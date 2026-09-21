import { Business, MenuItem, CustomerLoyalty } from '../types';

export const DEMO_BUSINESS: Business = {
  id: 'biz_moti_mahal_delux',
  slug: 'moti-mahal-delux',
  name: 'Moti Mahal Delux',
  tagline: 'Authentic Mughlai & North Indian Tandoori · Legendary Dal Makhani & Tandoori Recipes',
  category: 'restaurant',
  logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=240&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
  phone: '070558 08808',
  whatsapp: '+91 70558 08808',
  address: 'E-1241, vrindavan Colony, Rajendra Nagar, Bareilly, Uttar Pradesh 243122',
  googleMapsUrl: 'https://share.google/tyfNMulh66BnkqsYr',
  googleReviewUrl: 'https://share.google/tyfNMulh66BnkqsYr',
  rating: 4.6,
  reviewCount: 258,
  servesVegetarian: true,
  reservationsUrl: 'https://www.swiggy.com/restaurants/moti-mahal-delux-rajendra-nagar-bareilly',
  socialLinks: {
    instagram: 'motimahaldeluxofficial',
    facebook: 'motimahaldelux',
    website: 'https://motimahal.in',
    swiggy: 'https://www.swiggy.com/restaurants/moti-mahal-delux-rajendra-nagar-bareilly',
  },
  hours: [
    { day: 'Monday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Tuesday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Wednesday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Thursday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Friday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Saturday', open: '11:00 AM', close: '11:00 PM' },
    { day: 'Sunday', open: '11:00 AM', close: '11:00 PM' },
  ],
  brandColor: '#b91c1c', // Royal Tandoori Crimson Red
  loyaltyConfig: {
    mode: 'stamp',
    stampTarget: 6, // 6 stamps -> Free signature reward
    stampRewardTitle: 'Free Iconic Dal Makhani or Shahi Dessert',
    stampDescription: 'Collect 6 stamps on your dining visits to unlock our legendary Dal Makhani or signature dessert!',
    pointsPerVisit: 35,
    pointRewards: [
      { id: 'pr_1', points: 70, title: 'Complimentary Punjabi Lassi or Chaas', description: 'Fresh churned sweet malai lassi or spiced cooling chaas' },
      { id: 'pr_2', points: 150, title: 'Free Tandoori Paneer Tikka or Starter', description: 'Any veg clay oven appetizer cooked over charcoal' },
      { id: 'pr_3', points: 300, title: '₹400 Off on Family Dine-In Bill', description: 'Valid across our entire curries, biryanis and breads menu' },
    ],
  },
  stats: {
    qrScans: 648,
    totalCustomers: 258,
    newCustomers: 72,
    returningCustomers: 186,
    reviewPromptViews: 310,
    reviewPromptClicks: 258,
    rewardsRedeemed: 54,
    createdAt: '2026-08-01',
  },
  ownerPhone: '070558 08808',
  staffPin: '8808',
};

export const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'mm_1',
    businessId: 'biz_moti_mahal_delux',
    name: 'Dal Makhani (Original 1920 Recipe)',
    price: 340,
    category: 'Signature Curries & Gravies',
    description: 'The world-famous signature creation by Moti Mahal. Whole black urad lentils slow-simmered overnight over charcoal embers, finished with white butter and rich cream.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_2',
    businessId: 'biz_moti_mahal_delux',
    name: 'Paneer Butter Masala',
    price: 360,
    category: 'Signature Curries & Gravies',
    description: 'Soft cottage cheese cubes cooked in a velvety, buttery tomato, melon seed and cashew nut gravy, gently spiced and finished with kasuri methi.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_3',
    businessId: 'biz_moti_mahal_delux',
    name: 'Tandoori Paneer Tikka',
    price: 340,
    category: 'Tandoori Starters',
    description: 'Fresh paneer blocks marinated in spiced hung curd, mustard oil, and Kashmiri deghi mirch, roasted with bell peppers and onions in our charcoal tandoor.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_4',
    businessId: 'biz_moti_mahal_delux',
    name: 'Malai Soya Chaap Tikka',
    price: 320,
    category: 'Tandoori Starters',
    description: 'Tender soya chaap marinated in rich cashew nut paste, fresh cream, cardamom powder, and roasted to golden perfection in the clay oven.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'mm_5',
    businessId: 'biz_moti_mahal_delux',
    name: 'Dahi Ke Shahi Kebab',
    price: 310,
    category: 'Tandoori Starters',
    description: 'Crisp golden exterior with a delicate, melt-in-mouth filling of spiced hung curd, grated paneer, fresh coriander, and roasted cumin.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_6',
    businessId: 'biz_moti_mahal_delux',
    name: 'Moti Mahal Butter Chicken (Murgh Makhani)',
    price: 460,
    category: 'Signature Curries & Gravies',
    description: 'The legendary culinary invention that made Indian cuisine famous worldwide. Succulent tandoori chicken simmered in our secret silky tomato and butter sauce.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_7',
    businessId: 'biz_moti_mahal_delux',
    name: 'Kadhai Paneer',
    price: 350,
    category: 'Signature Curries & Gravies',
    description: 'Cottage cheese and bell peppers wok-tossed with fresh tomatoes, crushed coriander seeds, and whole dried red chilies.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'mm_8',
    businessId: 'biz_moti_mahal_delux',
    name: 'Garlic Butter Naan',
    price: 90,
    category: 'Clay Oven Breads & Biryani',
    description: 'Soft leavened bread slapped on the walls of the tandoor, topped with minced garlic, fresh cilantro, and brushed generously with desi butter.',
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_9',
    businessId: 'biz_moti_mahal_delux',
    name: 'Subz Dum Biryani',
    price: 330,
    category: 'Clay Oven Breads & Biryani',
    description: 'Long grain aged basmati rice layered with garden fresh vegetables, saffron milk, caramelized brown onions, and fresh mint, sealed in a handi. Served with burani raita.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_10',
    businessId: 'biz_moti_mahal_delux',
    name: 'Shahi Kesari Phirni',
    price: 160,
    category: 'Desserts & Beverages',
    description: 'Traditional slow-cooked ground rice dessert infused with Kashmiri saffron, green cardamom, and garnished with slivered almonds and pistachios in a clay pot.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mm_11',
    businessId: 'biz_moti_mahal_delux',
    name: 'Punjabi Sweet Malai Lassi',
    price: 120,
    category: 'Desserts & Beverages',
    description: 'Thick and creamy churned yogurt blended with rose water and topped with an indulgent layer of fresh clotted malai and crushed nuts.',
    image: 'https://images.unsplash.com/photo-1571006687897-b952a1b94d1f?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  }
];

export const DEMO_CUSTOMERS: CustomerLoyalty[] = [
  {
    id: 'cust_1',
    businessId: 'biz_moti_mahal_delux',
    phone: '7055808808',
    name: 'Rohan Sharma',
    stamps: 5, // 5 out of 6 stamps! One more stamp to unlock free reward!
    points: 175,
    totalVisits: 11,
    lastVisit: '2026-09-12',
    redeemedRewards: [
      { rewardTitle: 'Free Iconic Dal Makhani or Shahi Dessert', redeemedAt: '2026-08-18' }
    ],
    history: [
      { id: 'h_1', type: 'stamp_added', amount: 1, date: '2026-09-12', note: 'Dal Makhani + Garlic Naan + Paneer Butter Masala' },
      { id: 'h_2', type: 'stamp_added', amount: 1, date: '2026-09-08', note: 'Tandoori Paneer Tikka + Lassi' },
      { id: 'h_3', type: 'stamp_added', amount: 1, date: '2026-09-02', note: 'Subz Dum Biryani' },
    ]
  },
  {
    id: 'cust_2',
    businessId: 'biz_moti_mahal_delux',
    phone: '9988776655',
    name: 'Priya Nair',
    stamps: 6, // Ready to redeem!
    points: 210,
    totalVisits: 14,
    lastVisit: '2026-09-13',
    redeemedRewards: [],
    history: [
      { id: 'h_4', type: 'stamp_added', amount: 1, date: '2026-09-13', note: 'Family Dine-In Banquet' },
      { id: 'h_5', type: 'stamp_added', amount: 1, date: '2026-09-10', note: 'Malai Chaap + Kesari Phirni' }
    ]
  },
  {
    id: 'cust_3',
    businessId: 'biz_moti_mahal_delux',
    phone: '9123456780',
    name: 'Aakash Verma',
    stamps: 2,
    points: 70,
    totalVisits: 2,
    lastVisit: '2026-09-05',
    redeemedRewards: [],
    history: [
      { id: 'h_6', type: 'stamp_added', amount: 1, date: '2026-09-05', note: 'Moti Mahal Butter Chicken' }
    ]
  }
];

export const SAMPLE_MENU_OCR_TEXT = `
MOTI MAHAL DELUX - TANDOORI TRAIL
SIGNATURE CURRIES & GRAVIES
Dal Makhani (Original 1920) - 340 (Veg)
Slow simmered overnight black lentils with pure butter and cream
Paneer Butter Masala - 360 (Veg)
Cottage cheese in rich buttery tomato and cashew gravy
Kadhai Paneer - 350 (Veg)
Paneer with bell peppers and roasted coriander spices
Moti Mahal Butter Chicken - 460 (Non-Veg)
Tandoori chicken in velvety makhani sauce

TANDOORI STARTERS
Tandoori Paneer Tikka - 340 (Veg)
Charcoal grilled marinated cottage cheese with peppers
Malai Soya Chaap Tikka - 320 (Veg)
Creamy cashew marinated roasted soya chaap
Dahi Ke Shahi Kebab - 310 (Veg)
Crispy exterior with spiced hung curd melt in mouth

BREADS & RICE
Garlic Butter Naan - 90 (Veg)
Clay oven leavened bread brushed with garlic butter
Tandoori Butter Roti - 45 (Veg)
Whole wheat bread baked in tandoor
Subz Dum Biryani - 330 (Veg)
Aromatic basmati rice with vegetables, saffron and raita

DESSERTS & DRINKS
Shahi Kesari Phirni - 160 (Veg)
Saffron infused rice pudding with roasted pistachios
Punjabi Sweet Malai Lassi - 120 (Veg)
Chilled churned yogurt with fresh clotted malai
`;
