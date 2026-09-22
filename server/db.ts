import { Pool } from 'pg';
import { Business, MenuItem, CustomerLoyalty, User, BusinessStats } from '../src/types';
import { DEMO_BUSINESS, DEMO_MENU_ITEMS, DEMO_CUSTOMERS } from '../src/data/initialData';

// Initial Meetup Cafe pre-seed data
export const MEETUP_CAFE_BUSINESS: Business = {
  id: 'biz_meetup-cafe_1789985961309',
  slug: 'meetup-cafe',
  name: 'Meetup Cafe',
  tagline: 'Specialty Pour-Overs, Sourdough Melts & Bakes',
  category: 'cafe',
  logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
  phone: '+91 63976 60572',
  whatsapp: '+91 63976 60572',
  address: 'K10, near Agarsen park, Rampur Garden, Bareilly, Uttar Pradesh 243001',
  googleMapsUrl: 'https://maps.google.com/?q=K10%2C%20near%20Agarsen%20park%2C%20Rampur%20Garden%2C%20Bareilly%2C%20Uttar%20Pradesh%20243001',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJv0JQK4MBoDkRBFJWqFZuOaE',
  rating: 4.8,
  reviewCount: 312,
  servesVegetarian: true,
  socialLinks: {
    instagram: 'velvetroast.blr',
  },
  hours: [
    { day: 'Monday', open: '08:00 AM', close: '10:00 PM' },
    { day: 'Tuesday', open: '08:00 AM', close: '10:00 PM' },
    { day: 'Wednesday', open: '08:00 AM', close: '10:00 PM' },
    { day: 'Thursday', open: '08:00 AM', close: '10:00 PM' },
    { day: 'Friday', open: '08:00 AM', close: '11:00 PM' },
    { day: 'Saturday', open: '08:00 AM', close: '11:00 PM' },
    { day: 'Sunday', open: '08:00 AM', close: '10:00 PM' },
  ],
  brandColor: '#78350f',
  loyaltyConfig: {
    mode: 'stamp',
    stampTarget: 9,
    stampRewardTitle: 'Free Artisanal Beverage or Signature Dessert',
    stampDescription: 'Collect 9 stamps on your coffee & bakery visits to unlock your handcrafted reward!',
    pointsPerVisit: 15,
    pointRewards: [
      { id: 'pr_mc_1', points: 45, title: 'Complimentary Butter Croissant', description: 'Freshly baked flaky all-butter French croissant' },
      { id: 'pr_mc_2', points: 90, title: 'Free Pour-Over or Artisanal Latte', description: 'Any single-origin manual brew or hot coffee specialty' },
      { id: 'pr_mc_3', points: 180, title: '₹250 Off on Cafe Meal Bill', description: 'Valid across sandwiches, toasts, desserts and coffee' },
    ],
  },
  stats: {
    qrScans: 34,
    totalCustomers: 2,
    newCustomers: 1,
    returningCustomers: 1,
    reviewPromptViews: 18,
    reviewPromptClicks: 12,
    rewardsRedeemed: 1,
    createdAt: '2026-09-21',
  },
  ownerPhone: '6397660572',
  ownerId: 'usr_owner_meetup-cafe',
  staffPin: '0572',
};

export const MEETUP_CAFE_MENU: MenuItem[] = [
  {
    id: 'mc_1',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Classic Spanish Latte',
    price: 220,
    category: 'Specialty Coffee',
    description: 'Double shot espresso combined with textured condensed milk and steamed whole milk',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mc_2',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Single Origin Pour-Over (V60)',
    price: 240,
    category: 'Specialty Coffee',
    description: 'Light roast Chikmagalur beans offering bright berry acidity and jasmine floral notes',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mc_3',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Vietnamese Iced Coffee',
    price: 210,
    category: 'Specialty Coffee',
    description: 'Bold dark roast slow-dripped through a Phin filter over sweetened condensed milk & ice',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'mc_4',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Avocado Sourdough Toast',
    price: 320,
    category: 'Artisanal Bakes & Melts',
    description: 'Toasted wild yeast sourdough topped with smashed Hass avocado, cherry tomatoes, feta & seeds',
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mc_5',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Truffle Mushroom Melt',
    price: 340,
    category: 'Artisanal Bakes & Melts',
    description: 'Thyme-sautéed portobello and button mushrooms, sharp aged cheddar and black truffle oil',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mc_6',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Twice-Baked Almond Croissant',
    price: 195,
    category: 'Bakery & Desserts',
    description: 'Flaky golden croissant filled with almond frangipane cream and topped with sliced toasted almonds',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  },
  {
    id: 'mc_7',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'San Sebastián Basque Cheesecake',
    price: 260,
    category: 'Bakery & Desserts',
    description: 'Caramelized crust with an ultra-creamy, molten custard center served with berry compote',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'mc_8',
    businessId: 'biz_meetup-cafe_1789985961309',
    name: 'Cascara Berry Sparkling Iced Tea',
    price: 190,
    category: 'Refreshers',
    description: 'Sun-dried coffee cherry tea brewed with dried hibiscus, citrus peel, and sparkling soda',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    isVeg: true,
    isAvailable: true,
    isPopular: false,
  },
];

export const MEETUP_CAFE_CUSTOMERS: CustomerLoyalty[] = [
  {
    id: 'mc_cust_1',
    businessId: 'biz_meetup-cafe_1789985961309',
    phone: '9876543210',
    name: 'Aditi Sharma',
    stamps: 4,
    points: 120,
    totalVisits: 4,
    lastVisit: '2026-09-20',
    redeemedRewards: [],
    history: [
      { id: 'h_mc_1', type: 'stamp_added', amount: 1, date: '2026-09-20', note: 'Classic Spanish Latte + Croissant' },
      { id: 'h_mc_2', type: 'stamp_added', amount: 1, date: '2026-09-17', note: 'Avocado Sourdough Toast' },
    ],
  },
  {
    id: 'mc_cust_2',
    businessId: 'biz_meetup-cafe_1789985961309',
    phone: '9811223344',
    name: 'Kabir Mehta',
    stamps: 8,
    points: 240,
    totalVisits: 9,
    lastVisit: '2026-09-19',
    redeemedRewards: [],
    history: [
      { id: 'h_mc_3', type: 'stamp_added', amount: 1, date: '2026-09-19', note: 'Single Origin Pour-Over' },
    ],
  },
];

// Fallback in-memory cache to guarantee zero-crash preview when DATABASE_URL is not yet provided
class MemoryDatabase {
  activeSlug: string = 'meetup-cafe';
  businesses: Map<string, Business> = new Map();
  menuItems: Map<string, MenuItem[]> = new Map();
  loyaltyRecords: Map<string, CustomerLoyalty[]> = new Map();
  users: Map<string, User> = new Map();

  constructor() {
    this.seed();
  }

  seed() {
    // Seed businesses
    this.businesses.set(MEETUP_CAFE_BUSINESS.slug, { ...MEETUP_CAFE_BUSINESS });
    this.businesses.set(DEMO_BUSINESS.slug, {
      ...DEMO_BUSINESS,
      ownerId: 'usr_owner_moti_mahal',
      staffPin: DEMO_BUSINESS.staffPin || '8808',
    });

    // Seed menu items
    this.menuItems.set(MEETUP_CAFE_BUSINESS.slug, [...MEETUP_CAFE_MENU]);
    this.menuItems.set(DEMO_BUSINESS.slug, [...DEMO_MENU_ITEMS]);

    // Seed customers
    this.loyaltyRecords.set(MEETUP_CAFE_BUSINESS.slug, [...MEETUP_CAFE_CUSTOMERS]);
    this.loyaltyRecords.set(DEMO_BUSINESS.slug, [...DEMO_CUSTOMERS]);

    // Seed users
    // 1. Admin / Developer
    this.users.set('usr_admin_master', {
      id: 'usr_admin_master',
      role: 'admin',
      identifier: 'developer@onecard.app',
      staffPin: process.env.ADMIN_MASTER_PIN || '9999',
      name: 'OneCard Developer Admin',
      createdAt: '2026-08-01',
    });

    // 2. Meetup Cafe Owner
    this.users.set('usr_owner_meetup-cafe', {
      id: 'usr_owner_meetup-cafe',
      role: 'owner',
      identifier: MEETUP_CAFE_BUSINESS.ownerPhone,
      assignedShopSlug: MEETUP_CAFE_BUSINESS.slug,
      staffPin: MEETUP_CAFE_BUSINESS.staffPin || '0572',
      name: 'Meetup Cafe Owner',
      createdAt: '2026-09-21',
    });

    // 3. Moti Mahal Owner
    this.users.set('usr_owner_moti_mahal', {
      id: 'usr_owner_moti_mahal',
      role: 'owner',
      identifier: DEMO_BUSINESS.ownerPhone,
      assignedShopSlug: DEMO_BUSINESS.slug,
      staffPin: DEMO_BUSINESS.staffPin || '8808',
      name: 'Moti Mahal Delux Owner',
      createdAt: '2026-08-01',
    });
  }
}

class DatabaseService {
  private pool: Pool | null = null;
  private memory = new MemoryDatabase();
  private isInitialized = false;

  constructor() {
    const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connStr) {
      try {
        const isLocal = connStr.includes('localhost') || connStr.includes('127.0.0.1');
        this.pool = new Pool({
          connectionString: connStr,
          ssl: isLocal ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        console.log('[OneCard DB] PostgreSQL pool configured with connection string.');
      } catch (err) {
        console.error('[OneCard DB] Failed to create PostgreSQL pool:', err);
        this.pool = null;
      }
    } else {
      console.log(
        '[OneCard DB] DATABASE_URL not set. Running with resilient memory store. Provide DATABASE_URL for production persistence.'
      );
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    if (this.pool) {
      try {
        console.log('[OneCard DB] Initializing PostgreSQL schema...');
        // Schema creation
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            identifier TEXT NOT NULL,
            staff_pin TEXT,
            assigned_shop_slug TEXT,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS businesses (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            owner_id TEXT,
            owner_phone TEXT,
            staff_pin TEXT,
            data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS menu_items (
            id TEXT PRIMARY KEY,
            business_slug TEXT NOT NULL,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            image TEXT,
            is_veg BOOLEAN DEFAULT TRUE,
            is_available BOOLEAN DEFAULT TRUE,
            is_popular BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS loyalty_records (
            id TEXT PRIMARY KEY,
            business_slug TEXT NOT NULL,
            phone TEXT NOT NULL,
            name TEXT,
            stamps INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0,
            total_visits INTEGER DEFAULT 0,
            last_visit TEXT,
            history JSONB DEFAULT '[]'::jsonb,
            redeemed_rewards JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
          CREATE INDEX IF NOT EXISTS idx_menu_items_business ON menu_items(business_slug);
          CREATE INDEX IF NOT EXISTS idx_loyalty_lookup ON loyalty_records(business_slug, phone);
        `);

        // Check if businesses need seeding
        const { rows } = await this.pool.query('SELECT COUNT(*) as count FROM businesses');
        const count = parseInt(rows[0]?.count || '0', 10);
        if (count === 0) {
          console.log('[OneCard DB] Seeding initial businesses into PostgreSQL...');
          await this.seedPostgres();
        } else {
          console.log(`[OneCard DB] PostgreSQL ready with ${count} existing businesses.`);
        }
      } catch (err) {
        console.error('[OneCard DB] PostgreSQL schema initialization failed:', err);
      }
    }

    this.isInitialized = true;
  }

  private async seedPostgres() {
    if (!this.pool) return;
    try {
      // 1. App settings
      await this.pool.query(
        `INSERT INTO app_settings (key, value) VALUES ('active_slug', 'meetup-cafe') ON CONFLICT (key) DO NOTHING`
      );

      // 2. Admin User
      const masterPin = process.env.ADMIN_MASTER_PIN || '9999';
      await this.pool.query(
        `INSERT INTO users (id, role, identifier, staff_pin, name)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        ['usr_admin_master', 'admin', 'developer@onecard.app', masterPin, 'OneCard Developer Admin']
      );

      // 3. Meetup Cafe
      await this.saveBusinessInternal(MEETUP_CAFE_BUSINESS, 'usr_owner_meetup-cafe');
      await this.pool.query(
        `INSERT INTO users (id, role, identifier, staff_pin, assigned_shop_slug, name)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          'usr_owner_meetup-cafe',
          'owner',
          MEETUP_CAFE_BUSINESS.ownerPhone,
          MEETUP_CAFE_BUSINESS.staffPin || '0572',
          MEETUP_CAFE_BUSINESS.slug,
          'Meetup Cafe Owner',
        ]
      );
      for (const item of MEETUP_CAFE_MENU) {
        await this.saveMenuItemInternal(MEETUP_CAFE_BUSINESS.slug, item);
      }
      for (const cust of MEETUP_CAFE_CUSTOMERS) {
        await this.saveLoyaltyCustomerInternal(MEETUP_CAFE_BUSINESS.slug, cust);
      }

      // 4. Moti Mahal Delux Demo
      const motiOwnerId = 'usr_owner_moti_mahal';
      await this.saveBusinessInternal(
        { ...DEMO_BUSINESS, ownerId: motiOwnerId, staffPin: DEMO_BUSINESS.staffPin || '8808' },
        motiOwnerId
      );
      await this.pool.query(
        `INSERT INTO users (id, role, identifier, staff_pin, assigned_shop_slug, name)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [
          motiOwnerId,
          'owner',
          DEMO_BUSINESS.ownerPhone,
          DEMO_BUSINESS.staffPin || '8808',
          DEMO_BUSINESS.slug,
          'Moti Mahal Owner',
        ]
      );
      for (const item of DEMO_MENU_ITEMS) {
        await this.saveMenuItemInternal(DEMO_BUSINESS.slug, item);
      }
      for (const cust of DEMO_CUSTOMERS) {
        await this.saveLoyaltyCustomerInternal(DEMO_BUSINESS.slug, cust);
      }

      console.log('[OneCard DB] PostgreSQL seed completed successfully.');
    } catch (err) {
      console.error('[OneCard DB] Seed error:', err);
    }
  }

  // --- BUSINESSES ---

  async getBusinesses(filterOwnerSlug?: string): Promise<Business[]> {
    await this.init();
    if (this.pool) {
      try {
        let query = 'SELECT data FROM businesses ORDER BY created_at ASC';
        const params: any[] = [];
        if (filterOwnerSlug) {
          query = 'SELECT data FROM businesses WHERE slug = $1';
          params.push(filterOwnerSlug);
        }
        const { rows } = await this.pool.query(query, params);
        return rows.map((r) => r.data as Business);
      } catch (err) {
        console.error('[OneCard DB] getBusinesses error:', err);
      }
    }

    // Fallback
    const list = Array.from(this.memory.businesses.values());
    if (filterOwnerSlug) {
      return list.filter((b) => b.slug === filterOwnerSlug);
    }
    return list;
  }

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    await this.init();
    if (this.pool) {
      try {
        const { rows } = await this.pool.query('SELECT data FROM businesses WHERE slug = $1', [slug]);
        if (rows.length > 0) {
          return rows[0].data as Business;
        }
      } catch (err) {
        console.error('[OneCard DB] getBusinessBySlug error:', err);
      }
    }

    return this.memory.businesses.get(slug) || null;
  }

  private async saveBusinessInternal(biz: Business, ownerId?: string): Promise<Business> {
    if (!this.pool) return biz;
    const finalOwnerId = ownerId || biz.ownerId || `usr_owner_${biz.slug}`;
    const cleanBiz: Business = {
      ...biz,
      ownerId: finalOwnerId,
    };

    await this.pool.query(
      `INSERT INTO businesses (id, slug, name, owner_id, owner_phone, staff_pin, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           owner_id = EXCLUDED.owner_id,
           owner_phone = EXCLUDED.owner_phone,
           staff_pin = EXCLUDED.staff_pin,
           data = EXCLUDED.data,
           updated_at = CURRENT_TIMESTAMP`,
      [
        cleanBiz.id || `biz_${cleanBiz.slug}_${Date.now()}`,
        cleanBiz.slug,
        cleanBiz.name,
        cleanBiz.ownerId,
        cleanBiz.ownerPhone,
        cleanBiz.staffPin || '8808',
        JSON.stringify(cleanBiz),
      ]
    );

    return cleanBiz;
  }

  async saveBusiness(biz: Business, ownerId?: string): Promise<Business> {
    await this.init();
    const finalOwnerId = ownerId || biz.ownerId || `usr_owner_${biz.slug}`;
    const staffPin = biz.staffPin || (biz.ownerPhone ? biz.ownerPhone.replace(/\D/g, '').slice(-4) : '8808');

    const cleanBiz: Business = {
      ...biz,
      ownerId: finalOwnerId,
      staffPin,
    };

    // Update memory
    this.memory.businesses.set(cleanBiz.slug, cleanBiz);
    this.memory.activeSlug = cleanBiz.slug;

    // Create or update owner user record in memory
    this.memory.users.set(finalOwnerId, {
      id: finalOwnerId,
      role: 'owner',
      identifier: cleanBiz.ownerPhone,
      assignedShopSlug: cleanBiz.slug,
      staffPin,
      name: `${cleanBiz.name} Owner`,
    });

    if (this.pool) {
      try {
        await this.saveBusinessInternal(cleanBiz, finalOwnerId);

        // Ensure owner exists in users table
        await this.pool.query(
          `INSERT INTO users (id, role, identifier, staff_pin, assigned_shop_slug, name)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET identifier = EXCLUDED.identifier,
               staff_pin = EXCLUDED.staff_pin,
               assigned_shop_slug = EXCLUDED.assigned_shop_slug,
               name = EXCLUDED.name`,
          [
            finalOwnerId,
            'owner',
            cleanBiz.ownerPhone,
            staffPin,
            cleanBiz.slug,
            `${cleanBiz.name} Owner`,
          ]
        );

        // Set as active slug
        await this.pool.query(
          `INSERT INTO app_settings (key, value) VALUES ('active_slug', $1)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [cleanBiz.slug]
        );
      } catch (err) {
        console.error('[OneCard DB] saveBusiness error in PostgreSQL:', err);
      }
    }

    return cleanBiz;
  }

  async getActiveSlug(): Promise<string> {
    await this.init();
    if (this.pool) {
      try {
        const { rows } = await this.pool.query(`SELECT value FROM app_settings WHERE key = 'active_slug'`);
        if (rows.length > 0 && rows[0].value) {
          return rows[0].value;
        }
      } catch (err) {
        console.error('[OneCard DB] getActiveSlug error:', err);
      }
    }
    return this.memory.activeSlug;
  }

  async setActiveSlug(slug: string): Promise<void> {
    await this.init();
    this.memory.activeSlug = slug;
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO app_settings (key, value) VALUES ('active_slug', $1)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [slug]
        );
      } catch (err) {
        console.error('[OneCard DB] setActiveSlug error:', err);
      }
    }
  }

  // --- MENU ITEMS ---

  async getMenuItems(slug: string): Promise<MenuItem[]> {
    await this.init();
    if (this.pool) {
      try {
        const { rows } = await this.pool.query(
          'SELECT * FROM menu_items WHERE business_slug = $1 ORDER BY created_at ASC',
          [slug]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            businessId: r.business_slug,
            name: r.name,
            price: Number(r.price),
            category: r.category,
            description: r.description || '',
            image: r.image || undefined,
            isVeg: Boolean(r.is_veg),
            isAvailable: Boolean(r.is_available),
            isPopular: Boolean(r.is_popular),
          }));
        }
      } catch (err) {
        console.error('[OneCard DB] getMenuItems error:', err);
      }
    }

    return this.memory.menuItems.get(slug) || [];
  }

  private async saveMenuItemInternal(slug: string, item: MenuItem): Promise<void> {
    if (!this.pool) return;
    await this.pool.query(
      `INSERT INTO menu_items (id, business_slug, name, price, category, description, image, is_veg, is_available, is_popular)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           price = EXCLUDED.price,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           image = EXCLUDED.image,
           is_veg = EXCLUDED.is_veg,
           is_available = EXCLUDED.is_available,
           is_popular = EXCLUDED.is_popular`,
      [
        item.id,
        slug,
        item.name,
        item.price,
        item.category,
        item.description || '',
        item.image || null,
        item.isVeg ?? true,
        item.isAvailable ?? true,
        item.isPopular ?? false,
      ]
    );
  }

  async saveMenuItems(slug: string, incoming: MenuItem | MenuItem[]): Promise<MenuItem | MenuItem[]> {
    await this.init();
    const existing = this.memory.menuItems.get(slug) || [];

    if (Array.isArray(incoming)) {
      this.memory.menuItems.set(slug, incoming);
      if (this.pool) {
        try {
          await this.pool.query('DELETE FROM menu_items WHERE business_slug = $1', [slug]);
          for (const item of incoming) {
            await this.saveMenuItemInternal(slug, item);
          }
        } catch (err) {
          console.error('[OneCard DB] saveMenuItems bulk error:', err);
        }
      }
      return incoming;
    } else {
      const idx = existing.findIndex((i) => i.id === incoming.id);
      if (idx >= 0) {
        existing[idx] = incoming;
      } else {
        existing.unshift(incoming);
      }
      this.memory.menuItems.set(slug, existing);

      if (this.pool) {
        try {
          await this.saveMenuItemInternal(slug, incoming);
        } catch (err) {
          console.error('[OneCard DB] saveMenuItem single error:', err);
        }
      }
      return incoming;
    }
  }

  async deleteMenuItem(slug: string, id: string): Promise<boolean> {
    await this.init();
    const existing = this.memory.menuItems.get(slug) || [];
    this.memory.menuItems.set(
      slug,
      existing.filter((i) => i.id !== id)
    );

    if (this.pool) {
      try {
        await this.pool.query('DELETE FROM menu_items WHERE business_slug = $1 AND id = $2', [slug, id]);
        return true;
      } catch (err) {
        console.error('[OneCard DB] deleteMenuItem error:', err);
      }
    }
    return true;
  }

  async toggleMenuItemAvailability(slug: string, id: string, isAvailable: boolean): Promise<MenuItem | null> {
    await this.init();
    const existing = this.memory.menuItems.get(slug) || [];
    const item = existing.find((i) => i.id === id);
    if (item) {
      item.isAvailable = isAvailable;
    }

    if (this.pool) {
      try {
        const { rows } = await this.pool.query(
          'UPDATE menu_items SET is_available = $1 WHERE business_slug = $2 AND id = $3 RETURNING *',
          [isAvailable, slug, id]
        );
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            businessId: r.business_slug,
            name: r.name,
            price: Number(r.price),
            category: r.category,
            description: r.description || '',
            image: r.image || undefined,
            isVeg: Boolean(r.is_veg),
            isAvailable: Boolean(r.is_available),
            isPopular: Boolean(r.is_popular),
          };
        }
      } catch (err) {
        console.error('[OneCard DB] toggleMenuItemAvailability error:', err);
      }
    }

    return item || null;
  }

  // --- LOYALTY ---

  async getLoyaltyCustomers(slug: string): Promise<CustomerLoyalty[]> {
    await this.init();
    if (this.pool) {
      try {
        const { rows } = await this.pool.query(
          'SELECT * FROM loyalty_records WHERE business_slug = $1 ORDER BY total_visits DESC',
          [slug]
        );
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            businessId: r.business_slug,
            phone: r.phone,
            name: r.name || `Customer ${r.phone.slice(-4)}`,
            stamps: r.stamps || 0,
            points: r.points || 0,
            totalVisits: r.total_visits || 0,
            lastVisit: r.last_visit || '',
            redeemedRewards: typeof r.redeemed_rewards === 'string' ? JSON.parse(r.redeemed_rewards) : r.redeemed_rewards || [],
            history: typeof r.history === 'string' ? JSON.parse(r.history) : r.history || [],
          }));
        }
      } catch (err) {
        console.error('[OneCard DB] getLoyaltyCustomers error:', err);
      }
    }

    return this.memory.loyaltyRecords.get(slug) || [];
  }

  private async saveLoyaltyCustomerInternal(slug: string, cust: CustomerLoyalty): Promise<void> {
    if (!this.pool) return;
    await this.pool.query(
      `INSERT INTO loyalty_records (id, business_slug, phone, name, stamps, points, total_visits, last_visit, history, redeemed_rewards)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET stamps = EXCLUDED.stamps,
           points = EXCLUDED.points,
           total_visits = EXCLUDED.total_visits,
           last_visit = EXCLUDED.last_visit,
           history = EXCLUDED.history,
           redeemed_rewards = EXCLUDED.redeemed_rewards`,
      [
        cust.id,
        slug,
        cust.phone,
        cust.name,
        cust.stamps,
        cust.points,
        cust.totalVisits,
        cust.lastVisit,
        JSON.stringify(cust.history || []),
        JSON.stringify(cust.redeemedRewards || []),
      ]
    );
  }

  async getLoyaltyCustomer(slug: string, rawPhone: string): Promise<{ customer: CustomerLoyalty; isNew: boolean }> {
    await this.init();
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const existing = await this.getLoyaltyCustomers(slug);
    const found = existing.find((c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

    if (found) {
      return { customer: found, isNew: false };
    }

    // Create new customer record
    const newCustomer: CustomerLoyalty = {
      id: `cust_${slug}_${cleanPhone}_${Date.now()}`,
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

    await this.saveLoyaltyCustomer(slug, newCustomer);
    return { customer: newCustomer, isNew: true };
  }

  async saveLoyaltyCustomer(slug: string, customer: CustomerLoyalty): Promise<CustomerLoyalty> {
    await this.init();
    const existing = this.memory.loyaltyRecords.get(slug) || [];
    const idx = existing.findIndex((c) => c.id === customer.id || c.phone === customer.phone);
    if (idx >= 0) {
      existing[idx] = customer;
    } else {
      existing.push(customer);
    }
    this.memory.loyaltyRecords.set(slug, existing);

    if (this.pool) {
      try {
        await this.saveLoyaltyCustomerInternal(slug, customer);
      } catch (err) {
        console.error('[OneCard DB] saveLoyaltyCustomer error:', err);
      }
    }

    return customer;
  }

  // --- STATS ---

  async incrementBusinessStats(
    slug: string,
    event: 'qr_scan' | 'review_prompt_view' | 'review_prompt_click' | 'reward_redeem'
  ): Promise<BusinessStats | null> {
    const biz = await this.getBusinessBySlug(slug);
    if (!biz) return null;

    if (!biz.stats) {
      biz.stats = {
        qrScans: 0,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        reviewPromptViews: 0,
        reviewPromptClicks: 0,
        rewardsRedeemed: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    if (event === 'qr_scan') biz.stats.qrScans += 1;
    if (event === 'review_prompt_view') biz.stats.reviewPromptViews += 1;
    if (event === 'review_prompt_click') biz.stats.reviewPromptClicks += 1;
    if (event === 'reward_redeem') biz.stats.rewardsRedeemed += 1;

    await this.saveBusiness(biz);
    return biz.stats;
  }

  // --- USERS & AUTH ---

  async getUserByPin(pin: string, targetSlug?: string): Promise<User | null> {
    await this.init();
    const masterPin = process.env.ADMIN_MASTER_PIN || '9999';

    // 1. Check Master Admin PIN
    if (pin === masterPin || (process.env.NODE_ENV !== 'production' && pin === '9999')) {
      return {
        id: 'usr_admin_master',
        role: 'admin',
        identifier: 'developer@onecard.app',
        name: 'OneCard Developer Admin',
      };
    }

    // 2. Check Shop Owner PIN
    if (targetSlug) {
      const biz = await this.getBusinessBySlug(targetSlug);
      if (biz) {
        const expectedPin = biz.staffPin || (biz.ownerPhone ? biz.ownerPhone.replace(/\D/g, '').slice(-4) : '8808');
        if (pin === expectedPin) {
          return {
            id: biz.ownerId || `usr_owner_${biz.slug}`,
            role: 'owner',
            identifier: biz.ownerPhone,
            assignedShopSlug: biz.slug,
            staffPin: expectedPin,
            name: `${biz.name} Owner`,
          };
        }
      }
    }

    // 3. Check DB users table
    if (this.pool) {
      try {
        let query = 'SELECT * FROM users WHERE staff_pin = $1';
        const params: any[] = [pin];
        if (targetSlug) {
          query += ' AND (assigned_shop_slug = $2 OR role = $3)';
          params.push(targetSlug, 'admin');
        }
        const { rows } = await this.pool.query(query, params);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            role: r.role as 'admin' | 'owner',
            identifier: r.identifier,
            assignedShopSlug: r.assigned_shop_slug || undefined,
            staffPin: r.staff_pin || undefined,
            name: r.name || undefined,
          };
        }
      } catch (err) {
        console.error('[OneCard DB] getUserByPin error:', err);
      }
    }

    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    await this.init();
    if (this.pool) {
      try {
        const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            role: r.role as 'admin' | 'owner',
            identifier: r.identifier,
            assignedShopSlug: r.assigned_shop_slug || undefined,
            staffPin: r.staff_pin || undefined,
            name: r.name || undefined,
          };
        }
      } catch (err) {
        console.error('[OneCard DB] getUserById error:', err);
      }
    }

    return this.memory.users.get(id) || null;
  }

  getPool(): Pool | null {
    return this.pool;
  }
}

export const db = new DatabaseService();
