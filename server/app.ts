import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db';
import { Business, MenuItem, CustomerLoyalty, User } from '../src/types';

export const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth Token Helpers
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required.');
}

export interface AuthUserPayload {
  id: string;
  role: 'admin' | 'owner';
  identifier: string;
  assignedShopSlug?: string;
  name?: string;
  exp: number;
}

export function generateToken(user: User): string {
  const payload: AuthUserPayload = {
    id: user.id,
    role: user.role,
    identifier: user.identifier,
    assignedShopSlug: user.assignedShopSlug,
    name: user.name,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

export function parseToken(tokenString: string): AuthUserPayload | null {
  try {
    const [str, sig] = tokenString.split('.');
    if (!str || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf-8')) as AuthUserPayload;
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

// Auth Middleware
export async function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  }

  if (token) {
    const decoded = parseToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // Check direct staff PIN in header if passed (convenience for quick PIN validations)
  const pinHeader = req.headers['x-staff-pin'];
  const slugHeader = req.headers['x-shop-slug'];
  if (pinHeader && typeof pinHeader === 'string') {
    const user = await db.getUserByPin(pinHeader, typeof slugHeader === 'string' ? slugHeader : undefined);
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        identifier: user.identifier,
        assignedShopSlug: user.assignedShopSlug,
        name: user.name,
        exp: Date.now() + 3600000,
      };
      return next();
    }
  }

  next();
}

app.use(authMiddleware as express.RequestHandler);

// Authorization Guards
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in with Staff or Admin PIN.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Only OneCard Developer Admins have permission to perform this action.',
      requiredRole: 'admin',
      currentRole: req.user.role,
    });
  }
  next();
}

export function requireShopAccess(slugParam = 'slug') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const targetSlug = req.params[slugParam];
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in with your Staff PIN.' });
    }
    // Admins have universal access across all shops
    if (req.user.role === 'admin') {
      return next();
    }
    // Owners have access ONLY to their own assigned restaurant
    if (req.user.role === 'owner' && req.user.assignedShopSlug === targetSlug) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied. You are only authorized to manage your assigned restaurant (${req.user.assignedShopSlug}).`,
      attemptedSlug: targetSlug,
      assignedShop: req.user.assignedShopSlug,
    });
  };
}

// Gemini AI Client Helper
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// ROUTES
// ==========================================

// Health Check
app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'postgresql_connected' : 'memory_fallback',
  });
});

// Auth Login via Staff or Developer PIN
app.post('/api/auth/login', async (req, res) => {
  const { pin, slug } = req.body;
  if (!pin) {
    return res.status(400).json({ error: 'PIN is required' });
  }

  const user = await db.getUserByPin(String(pin).trim(), slug ? String(slug).trim() : undefined);
  if (!user) {
    return res.status(401).json({ error: 'Invalid PIN. Please check and try again.' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      role: user.role,
      identifier: user.identifier,
      assignedShopSlug: user.assignedShopSlug,
      name: user.name,
    },
  });
});

// Current Auth Profile
app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: req.user,
  });
});

// Active Business Slug
app.get('/api/active-slug', async (_req, res) => {
  const active = await db.getActiveSlug();
  res.json({ slug: active });
});

app.post('/api/active-slug', requireAdmin as express.RequestHandler, async (req: AuthenticatedRequest, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }
  const biz = await db.getBusinessBySlug(slug);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }
  await db.setActiveSlug(slug);
  res.json({ success: true, slug });
});

export function sanitizeBusiness(biz: Business): Business {
  const clean = { ...biz };
  delete clean.staffPin;
  return clean;
}

// Businesses: List
// Developer/Admin -> sees all shops
// Owner -> sees ONLY their assigned shop
// Public -> can request list or defaults
app.get('/api/businesses', async (req: AuthenticatedRequest, res) => {
  if (req.user) {
    if (req.user.role === 'admin') {
      const allShops = await db.getBusinesses();
      return res.json(allShops.map(sanitizeBusiness));
    }
    if (req.user.role === 'owner' && req.user.assignedShopSlug) {
      const myShop = await db.getBusinessBySlug(req.user.assignedShopSlug);
      return res.json(myShop ? [sanitizeBusiness(myShop)] : []);
    }
  }

  // Public caller without auth: return all businesses for browsing/directory or active
  const publicShops = await db.getBusinesses();
  res.json(publicShops.map(sanitizeBusiness));
});

// Business: Get by Slug (Public for digital menu/QR)
app.get('/api/businesses/:slug', async (req, res) => {
  let { slug } = req.params;
  if (slug === 'default' || slug === 'active') {
    slug = await db.getActiveSlug();
  }

  const biz = await db.getBusinessBySlug(slug);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }
  res.json(sanitizeBusiness(biz));
});

// Business: Create New Shop
// STRICTLY DEVELOPER / ADMIN ONLY
app.post('/api/businesses', requireAdmin as express.RequestHandler, async (req: AuthenticatedRequest, res) => {
  const newBiz = req.body as Business;
  if (!newBiz.slug || !newBiz.name) {
    return res.status(400).json({ error: 'Business slug and name are required' });
  }

  // Generate unique ownerId and pin if not provided
  const ownerId = newBiz.ownerId || `usr_owner_${newBiz.slug}`;
  const staffPin = newBiz.staffPin || (newBiz.ownerPhone && newBiz.ownerPhone.replace(/\D/g, '').length >= 4 ? newBiz.ownerPhone.replace(/\D/g, '').slice(-4) : String(Math.floor(1000 + Math.random() * 9000)));

  newBiz.ownerId = ownerId;
  newBiz.staffPin = staffPin;

  const saved = await db.saveBusiness(newBiz, ownerId);
  await db.setActiveSlug(saved.slug);

  res.status(201).json(sanitizeBusiness(saved));
});

// Business: Update Existing Shop
// ADMIN or OWNER of that specific shop
app.put(
  '/api/businesses/:slug',
  requireShopAccess('slug') as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    const { slug } = req.params;
    const incoming = req.body as Business;

    const existing = await db.getBusinessBySlug(slug);
    if (!existing) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Preserve existing staffPin unless explicitly supplied
    const staffPin = incoming.staffPin && incoming.staffPin.length === 4 ? incoming.staffPin : existing.staffPin;
    const ownerId = req.user?.role === 'admin' && incoming.ownerId ? incoming.ownerId : existing.ownerId;
    const merged: Business = {
      ...existing,
      ...incoming,
      slug: existing.slug, // Prevent changing slug via update to protect URLs
      ownerId,
      staffPin,
    };

    const updated = await db.saveBusiness(merged, ownerId);
    res.json(sanitizeBusiness(updated));
  }
);

// Menu: Get items for a shop (Public for customer view)
app.get('/api/businesses/:slug/menu', async (req, res) => {
  const { slug } = req.params;
  const items = await db.getMenuItems(slug);
  res.json(items);
});

// Menu: Add or Bulk Update Items
// ADMIN or OWNER of that specific shop
app.post(
  '/api/businesses/:slug/menu',
  requireShopAccess('slug') as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    const { slug } = req.params;
    const incomingItems = req.body as MenuItem | MenuItem[];
    const result = await db.saveMenuItems(slug, incomingItems);
    res.json(result);
  }
);

// Menu: Toggle Availability
// ADMIN or OWNER of that specific shop
app.post(
  '/api/businesses/:slug/menu/toggle-availability',
  requireShopAccess('slug') as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    const { slug } = req.params;
    const { itemId, isAvailable } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }

    const updated = await db.toggleMenuItemAvailability(slug, itemId, Boolean(isAvailable));
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ success: true, item: updated });
  }
);

// Menu: Delete Item
// ADMIN or OWNER of that specific shop
app.delete(
  '/api/businesses/:slug/menu/:id',
  requireShopAccess('slug') as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    const { slug, id } = req.params;
    await db.deleteMenuItem(slug, id);
    res.json({ success: true });
  }
);

// Loyalty: Customer Lookup (Public for customer check-in)
app.get('/api/businesses/:slug/loyalty/:phone', async (req, res) => {
  const { slug, phone } = req.params;
  const { customer } = await db.getLoyaltyCustomer(slug, phone);
  res.json(customer);
});

// Loyalty: Punch Stamps or Redeem
// Action 'redeem' strictly requires ADMIN or OWNER of that specific shop
app.post(
  '/api/businesses/:slug/loyalty/punch',
  async (req: AuthenticatedRequest, res) => {
    const { slug } = req.params;
    const { phone, action = 'stamp', amount = 1, note = 'Visit', rewardTitle } = req.body;

    if (action === 'redeem') {
      if (!req.user || (req.user.role !== 'admin' && req.user.assignedShopSlug !== slug)) {
        return res.status(403).json({
          error: 'Redeeming customer rewards requires staff authorization. Please log in with Staff PIN.',
        });
      }
    }

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const biz = await db.getBusinessBySlug(slug);
    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const { customer } = await db.getLoyaltyCustomer(slug, phone);
    const today = new Date().toISOString().split('T')[0];
    customer.lastVisit = today;
    customer.totalVisits += 1;

    let qualifiesForReward = false;

    if (action === 'stamp') {
      customer.stamps += amount;
      customer.history.unshift({
        id: `h_${Date.now()}`,
        type: 'stamp_added',
        amount,
        date: today,
        note: note || 'Visit stamp',
      });

      const target = biz.loyaltyConfig.stampTarget || 9;
      if (customer.stamps >= target) {
        qualifiesForReward = true;
      }
    } else if (action === 'points') {
      customer.points += amount;
      customer.history.unshift({
        id: `h_${Date.now()}`,
        type: 'points_added',
        amount,
        date: today,
        note: note || `+${amount} Points`,
      });
    } else if (action === 'redeem') {
      if (biz.loyaltyConfig.mode === 'stamp') {
        const target = biz.loyaltyConfig.stampTarget || 9;
        customer.stamps = Math.max(0, customer.stamps - target);
      } else {
        customer.points = Math.max(0, customer.points - amount);
      }
      const rewardName = rewardTitle || biz.loyaltyConfig.stampRewardTitle || 'Special Reward';
      customer.redeemedRewards.push({
        rewardTitle: rewardName,
        redeemedAt: today,
      });
      customer.history.unshift({
        id: `h_${Date.now()}`,
        type: 'reward_redeemed',
        amount,
        date: today,
        note: `Redeemed: ${rewardName}`,
      });
      await db.incrementBusinessStats(slug, 'reward_redeem');
    }

    await db.saveLoyaltyCustomer(slug, customer);
    await db.incrementBusinessStats(slug, 'review_prompt_view');

    res.json({
      success: true,
      customer,
      qualifiesForReward,
      shouldShowReviewPrompt: true,
    });
  }
);

// Analytics: Public Events (QR scans, review prompt clicks)
app.post('/api/businesses/:slug/analytics/event', async (req, res) => {
  const { slug } = req.params;
  const { event } = req.body;

  if (event === 'qr_scan' || event === 'review_prompt_view' || event === 'review_prompt_click') {
    const updatedStats = await db.incrementBusinessStats(slug, event);
    return res.json({ success: true, stats: updatedStats });
  }

  res.status(400).json({ error: 'Invalid event type' });
});

// Analytics & WhatsApp Weekly Digest
// ADMIN or OWNER of that specific shop
app.get(
  '/api/businesses/:slug/analytics',
  requireShopAccess('slug') as express.RequestHandler,
  async (req: AuthenticatedRequest, res) => {
    const { slug } = req.params;
    const biz = await db.getBusinessBySlug(slug);
    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const customers = await db.getLoyaltyCustomers(slug);
    const menu = await db.getMenuItems(slug);

    const waSummary = `📊 *OneCard Weekly Business Digest*
🏢 *${biz.name}*
━━━━━━━━━━━━━━━━━━
📲 *Total QR Scans:* ${biz.stats.qrScans}
👥 *Total Customers Logged:* ${customers.length}
⭐ *New Customers:* ${biz.stats.newCustomers}
🔄 *Repeat Regulars:* ${biz.stats.returningCustomers}
🎁 *Rewards Claimed:* ${biz.stats.rewardsRedeemed}
🌟 *Google Review Clicks:* ${biz.stats.reviewPromptClicks}

💡 *Top Highlight:* ${
      biz.stats.returningCustomers > biz.stats.newCustomers
        ? 'Strong repeat customer loyalty this week!'
        : 'Great surge of new customer acquisitions!'
    }

🔗 View your live card: https://onecard.app/${slug}
_Powered by OneCard_`;

    res.json({
      stats: biz.stats,
      customers,
      menuCount: menu.length,
      whatsappSummary: waSummary,
    });
  }
);

// Gemini Vision Menu Extractor
app.post('/api/menu/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', sampleText } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      console.warn('GEMINI_API_KEY not found. Providing structured extracted sample items.');
      const fallbackItems = [
        {
          name: 'Signature Cold Brew',
          category: 'Beverages',
          price: 220,
          description: 'Single-origin iced coffee steeped for 16 hours',
          isVeg: true,
        },
        {
          name: 'Avocado Toast & Feta',
          category: 'Toasts & Mains',
          price: 320,
          description: 'Multigrain bread with fresh avocado puree, crumbled feta and microgreens',
          isVeg: true,
        },
        {
          name: 'Grilled Chicken Ciabatta',
          category: 'Toasts & Mains',
          price: 360,
          description: 'Herb grilled chicken, sun-dried tomato spread, baby spinach',
          isVeg: false,
        },
        {
          name: 'Double Chocolate Brownie',
          category: 'Bakery',
          price: 180,
          description: 'Fudgy Belgian dark chocolate brownie with sea salt flakes',
          isVeg: true,
        },
      ];
      return res.json({ items: fallbackItems, source: 'fallback_mock' });
    }

    let contentsPayload: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `You are an expert restaurant menu digitizer.
Analyze this photo or PDF of a restaurant/cafe/salon menu.
Extract all menu items accurately with their item name, category (e.g. Beverages, Mains, Starters, Desserts, Services), approximate numeric price, description (if any), and whether it is vegetarian (isVeg: true/false).
If non-vegetarian ingredients like chicken, bacon, fish, egg, meat are mentioned, set isVeg to false.
Return only clean structured JSON following the schema.`,
          },
        ],
      };
    } else if (sampleText) {
      contentsPayload = `Extract all menu items from this text into structured JSON:
${sampleText}`;
    } else {
      return res.status(400).json({ error: 'Please provide either imageBase64 or sampleText' });
    }

    const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest'];
    let responseText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contentsPayload,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Item name' },
                  category: { type: Type.STRING, description: 'Category e.g. Starters, Mains, Drinks' },
                  price: { type: Type.NUMBER, description: 'Price in local currency as a number' },
                  description: { type: Type.STRING, description: 'Short description or ingredients' },
                  isVeg: { type: Type.BOOLEAN, description: 'True if vegetarian, false if meat/seafood' },
                },
                required: ['name', 'category', 'price'],
              },
            },
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} error:`, err?.message);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!responseText) {
      return res.status(503).json({ error: 'AI menu digitizer temporarily busy. Please try again.' });
    }

    const parsed = JSON.parse(responseText || '[]');
    return res.json({ items: parsed, source: 'gemini_vision' });
  } catch (error: any) {
    console.error('Menu extraction error:', error);
    res.status(500).json({ error: 'Failed to extract menu', message: error?.message });
  }
});
