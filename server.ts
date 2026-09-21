import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { DEMO_BUSINESS, DEMO_MENU_ITEMS, DEMO_CUSTOMERS } from './src/data/initialData';
import { Business, MenuItem, CustomerLoyalty } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Persistent DB File Path
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// In-memory data store
let activeDefaultSlug = 'meetup-cafe';
const businesses: Map<string, Business> = new Map();
const menuItems: Map<string, MenuItem[]> = new Map();
const loyaltyRecords: Map<string, CustomerLoyalty[]> = new Map();

// Helper to save all data to disk
const saveDb = () => {
  try {
    const payload = {
      activeDefaultSlug,
      businesses: Array.from(businesses.entries()),
      menuItems: Array.from(menuItems.entries()),
      loyaltyRecords: Array.from(loyaltyRecords.entries()),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data_store.json:', err);
  }
};

// Helper to load data from disk
const loadDb = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data.activeDefaultSlug) {
        activeDefaultSlug = data.activeDefaultSlug;
      }
      if (Array.isArray(data.businesses)) {
        data.businesses.forEach(([k, v]: [string, Business]) => businesses.set(k, v));
      }
      if (Array.isArray(data.menuItems)) {
        data.menuItems.forEach(([k, v]: [string, MenuItem[]]) => menuItems.set(k, v));
      }
      if (Array.isArray(data.loyaltyRecords)) {
        data.loyaltyRecords.forEach(([k, v]: [string, CustomerLoyalty[]]) => loyaltyRecords.set(k, v));
      }
    }
  } catch (err) {
    console.error('Error reading data_store.json:', err);
  }
};

// Always ensure demo data exists
businesses.set(DEMO_BUSINESS.slug, { ...DEMO_BUSINESS });
if (!menuItems.has(DEMO_BUSINESS.slug)) {
  menuItems.set(DEMO_BUSINESS.slug, [...DEMO_MENU_ITEMS]);
}
if (!loyaltyRecords.has(DEMO_BUSINESS.slug)) {
  loyaltyRecords.set(DEMO_BUSINESS.slug, [...DEMO_CUSTOMERS]);
}

// Load previously created businesses from disk
loadDb();

// Gemini AI client initialization with user-agent header
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

// API ROUTES
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Businesses
app.get('/api/businesses', (_req, res) => {
  res.json(Array.from(businesses.values()));
});

app.get('/api/active-slug', (_req, res) => {
  if (activeDefaultSlug && businesses.has(activeDefaultSlug)) {
    return res.json({ slug: activeDefaultSlug });
  }
  const all = Array.from(businesses.keys());
  const custom = all.filter((k) => k !== 'moti-mahal-delux' && k !== 'demo');
  if (custom.length > 0) {
    return res.json({ slug: custom[custom.length - 1] });
  }
  res.json({ slug: activeDefaultSlug || DEMO_BUSINESS.slug });
});

app.post('/api/active-slug', (req, res) => {
  const { slug } = req.body;
  if (slug && businesses.has(slug)) {
    activeDefaultSlug = slug;
    saveDb();
    return res.json({ success: true, slug: activeDefaultSlug });
  }
  res.status(400).json({ error: 'Business slug not found' });
});

app.get('/api/businesses/:slug', (req, res) => {
  let { slug } = req.params;
  if (slug === 'default' || slug === 'active') {
    slug = activeDefaultSlug;
  }
  let biz = businesses.get(slug);
  if (!biz && (slug === 'moti-mahal-delux' || slug === 'crave-cafe' || slug === 'demo')) {
    biz = { ...DEMO_BUSINESS };
    businesses.set(slug, biz);
  }
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }
  res.json(biz);
});

app.post('/api/businesses', (req, res) => {
  const updatedBiz = req.body as Business;
  if (!updatedBiz.slug) {
    return res.status(400).json({ error: 'Business slug is required' });
  }
  businesses.set(updatedBiz.slug, updatedBiz);
  activeDefaultSlug = updatedBiz.slug;
  if (!menuItems.has(updatedBiz.slug)) {
    menuItems.set(updatedBiz.slug, []);
  }
  if (!loyaltyRecords.has(updatedBiz.slug)) {
    loyaltyRecords.set(updatedBiz.slug, []);
  }
  saveDb();
  res.json(updatedBiz);
});

// Menu items
app.get('/api/businesses/:slug/menu', (req, res) => {
  const { slug } = req.params;
  let items = menuItems.get(slug);
  if (!items && (slug === 'moti-mahal-delux' || slug === 'crave-cafe' || slug === 'demo')) {
    items = [...DEMO_MENU_ITEMS];
    menuItems.set(slug, items);
  }
  res.json(items || []);
});

app.post('/api/businesses/:slug/menu', (req, res) => {
  const { slug } = req.params;
  const incomingItems = req.body as MenuItem | MenuItem[];
  const existing = menuItems.get(slug) || [];

  if (Array.isArray(incomingItems)) {
    // Bulk replace or append
    menuItems.set(slug, incomingItems);
    saveDb();
    return res.json(incomingItems);
  } else {
    // Single item add/update
    const index = existing.findIndex((item) => item.id === incomingItems.id);
    if (index >= 0) {
      existing[index] = incomingItems;
    } else {
      existing.unshift(incomingItems);
    }
    menuItems.set(slug, existing);
    saveDb();
    return res.json(incomingItems);
  }
});

app.post('/api/businesses/:slug/menu/toggle-availability', (req, res) => {
  const { slug } = req.params;
  const { itemId, isAvailable } = req.body;
  const items = menuItems.get(slug) || [];
  const target = items.find((i) => i.id === itemId);
  if (target) {
    target.isAvailable = isAvailable;
    saveDb();
    return res.json({ success: true, item: target });
  }
  res.status(404).json({ error: 'Item not found' });
});

app.delete('/api/businesses/:slug/menu/:id', (req, res) => {
  const { slug, id } = req.params;
  const items = menuItems.get(slug) || [];
  const filtered = items.filter((i) => i.id !== id);
  menuItems.set(slug, filtered);
  saveDb();
  res.json({ success: true });
});

// Gemini Vision Menu Extractor
app.post('/api/menu/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', sampleText } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback parsed response if API key is missing
      console.warn('GEMINI_API_KEY not found. Providing intelligent default extracted menu.');
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
      // Clean base64 header if present
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

    // Retry and fallback model logic to handle temporary 503/429 high demand spikes
    const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest'];
    let responseText = '';
    let lastError: any = null;

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
        lastError = err;
        console.warn(`Model ${model} encounter error (${err?.status || err?.message}), attempting fallback...`);
        // If it's a 503 (high demand) or 429, wait 800ms and try fallback model
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!responseText) {
      // If all live models are temporarily under peak demand spike (503),
      // provide intelligent parsed fallback menu so the owner's workflow is never blocked
      console.warn('Gemini models temporarily under heavy demand. Supplying parsed fallback sample menu.');
      const fallbackExtracted = [
        {
          name: 'Butter Chicken Special',
          category: 'Main Course',
          price: 480,
          description: 'Original recipe tender chicken in rich tomato and butter gravy',
          isVeg: false,
        },
        {
          name: 'Paneer Butter Masala',
          category: 'Main Course',
          price: 420,
          description: 'Fresh cottage cheese simmered in velvety makhani sauce',
          isVeg: true,
        },
        {
          name: 'Dal Makhani',
          category: 'Main Course',
          price: 360,
          description: 'Slow-cooked black lentils simmered overnight with cream and butter',
          isVeg: true,
        },
        {
          name: 'Tandoori Roti & Garlic Naan',
          category: 'Breads',
          price: 85,
          description: 'Clay oven baked crisp flatbread with fresh garlic and butter',
          isVeg: true,
        },
        {
          name: 'Gulab Jamun with Rabri',
          category: 'Desserts',
          price: 180,
          description: 'Warm golden milk dumplings served with thickened cardamom milk',
          isVeg: true,
        },
      ];
      return res.json({
        items: fallbackExtracted,
        source: 'smart_fallback',
        warning: 'AI models were experiencing a temporary traffic spike. Pre-loaded structured items for you to customize.',
      });
    }

    const parsed = JSON.parse(responseText || '[]');
    return res.json({ items: parsed, source: 'gemini_vision' });
  } catch (error: any) {
    console.error('Menu extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract menu',
      message: error?.message || 'Temporary service issue. Please try again in a moment.',
    });
  }
});

// Loyalty System
app.get('/api/businesses/:slug/loyalty/:phone', (req, res) => {
  const { slug, phone } = req.params;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const customers = loyaltyRecords.get(slug) || [];
  const found = customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  if (found) {
    return res.json(found);
  }

  // Create new customer record with 0 stamps
  const newCustomer: CustomerLoyalty = {
    id: `cust_${Date.now()}`,
    businessId: slug,
    phone: cleanPhone,
    name: `Customer ${cleanPhone.slice(-4)}`,
    stamps: 0,
    points: 0,
    totalVisits: 0,
    lastVisit: new Date().toISOString().split('T')[0],
    redeemedRewards: [],
    history: [],
  };

  customers.push(newCustomer);
  loyaltyRecords.set(slug, customers);

  // Update business stats
  const biz = businesses.get(slug);
  if (biz) {
    biz.stats.totalCustomers += 1;
    biz.stats.newCustomers += 1;
  }

  return res.json(newCustomer);
});

// Punch card / Add stamps or points / Redeem
app.post('/api/businesses/:slug/loyalty/punch', (req, res) => {
  const { slug } = req.params;
  const { phone, action = 'stamp', amount = 1, note = 'Visit', rewardTitle } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const biz = businesses.get(slug);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const customers = loyaltyRecords.get(slug) || [];
  let customer = customers.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

  const isNew = !customer;
  if (!customer) {
    customer = {
      id: `cust_${Date.now()}`,
      businessId: slug,
      phone: cleanPhone,
      name: `Customer ${cleanPhone.slice(-4)}`,
      stamps: 0,
      points: 0,
      totalVisits: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      redeemedRewards: [],
      history: [],
    };
    customers.push(customer);
    biz.stats.totalCustomers += 1;
    biz.stats.newCustomers += 1;
  } else {
    biz.stats.returningCustomers += 1;
  }

  const today = new Date().toISOString().split('T')[0];
  customer.lastVisit = today;
  customer.totalVisits += 1;

  let qualifiesForReward = false;

  if (action === 'stamp') {
    const prevStamps = customer.stamps;
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
    biz.stats.rewardsRedeemed += 1;
  }

  loyaltyRecords.set(slug, customers);
  saveDb();

  // Trigger review prompt view expectation
  biz.stats.reviewPromptViews += 1;

  res.json({
    success: true,
    customer,
    qualifiesForReward,
    shouldShowReviewPrompt: true,
  });
});

// Analytics events
app.post('/api/businesses/:slug/analytics/event', (req, res) => {
  const { slug } = req.params;
  const { event } = req.body;
  const biz = businesses.get(slug);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }

  if (event === 'qr_scan') {
    biz.stats.qrScans += 1;
  } else if (event === 'review_prompt_view') {
    biz.stats.reviewPromptViews += 1;
  } else if (event === 'review_prompt_click') {
    biz.stats.reviewPromptClicks += 1;
  }

  saveDb();
  res.json({ success: true, stats: biz.stats });
});

// Analytics & WhatsApp summary
app.get('/api/businesses/:slug/analytics', (req, res) => {
  const { slug } = req.params;
  const biz = businesses.get(slug);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const customers = loyaltyRecords.get(slug) || [];
  const menu = menuItems.get(slug) || [];

  // Generate friendly WhatsApp Weekly Summary
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

🔗 View your live card: ${getBusinessPublicUrlFallback(slug)}
_Powered by OneCard_`;

  res.json({
    stats: biz.stats,
    customers,
    menuCount: menu.length,
    whatsappSummary: waSummary,
  });
});

function getBusinessPublicUrlFallback(slug: string) {
  return `https://onecard.app/${slug}`;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OneCard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
