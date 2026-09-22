import { Business, MenuItem, CustomerLoyalty, User } from '../types';

const AUTH_TOKEN_KEY = 'onecard_auth_token';
const AUTH_USER_KEY = 'onecard_current_user';

export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: User, remember = true): void {
  try {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (remember) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('Could not write auth session to storage', e);
  }
}

export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('onecard_is_developer');
  } catch (e) {
    console.warn('Could not clear auth session', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg = errData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async loginWithPin(pin: string, slug?: string): Promise<{ token: string; user: User }> {
    const data = await request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin, slug }),
    });
    setAuthSession(data.token, data.user);
    return data;
  },

  async getMe(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      return await request<{ authenticated: boolean; user?: User }>('/api/auth/me');
    } catch {
      return { authenticated: false };
    }
  },

  // Active Slug
  async getActiveSlug(): Promise<string> {
    const res = await request<{ slug: string }>('/api/active-slug');
    return res.slug;
  },

  async setActiveSlug(slug: string): Promise<void> {
    await request<{ success: boolean; slug: string }>('/api/active-slug', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
  },

  // Businesses
  async getBusinesses(): Promise<Business[]> {
    return request<Business[]>('/api/businesses');
  },

  async getBusiness(slug: string): Promise<Business> {
    return request<Business>(`/api/businesses/${slug}`);
  },

  async createBusiness(biz: Business): Promise<Business> {
    return request<Business>('/api/businesses', {
      method: 'POST',
      body: JSON.stringify(biz),
    });
  },

  async updateBusiness(slug: string, biz: Business): Promise<Business> {
    return request<Business>(`/api/businesses/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(biz),
    });
  },

  // Menu
  async getMenu(slug: string): Promise<MenuItem[]> {
    return request<MenuItem[]>(`/api/businesses/${slug}/menu`);
  },

  async saveMenuItems(slug: string, items: MenuItem | MenuItem[]): Promise<MenuItem | MenuItem[]> {
    return request<MenuItem | MenuItem[]>(`/api/businesses/${slug}/menu`, {
      method: 'POST',
      body: JSON.stringify(items),
    });
  },

  async deleteMenuItem(slug: string, id: string): Promise<void> {
    await request<{ success: boolean }>(`/api/businesses/${slug}/menu/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleMenuItemAvailability(slug: string, itemId: string, isAvailable: boolean): Promise<MenuItem> {
    const res = await request<{ success: boolean; item: MenuItem }>(
      `/api/businesses/${slug}/menu/toggle-availability`,
      {
        method: 'POST',
        body: JSON.stringify({ itemId, isAvailable }),
      }
    );
    return res.item;
  },

  // Loyalty
  async getLoyaltyCustomer(slug: string, phone: string): Promise<CustomerLoyalty> {
    return request<CustomerLoyalty>(`/api/businesses/${slug}/loyalty/${phone}`);
  },

  async punchLoyalty(
    slug: string,
    payload: {
      phone: string;
      action: 'stamp' | 'points' | 'redeem';
      amount?: number;
      note?: string;
      rewardTitle?: string;
    }
  ): Promise<{
    success: boolean;
    customer: CustomerLoyalty;
    qualifiesForReward: boolean;
    shouldShowReviewPrompt: boolean;
  }> {
    return request(`/api/businesses/${slug}/loyalty/punch`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Analytics
  async getAnalytics(slug: string): Promise<{
    stats: any;
    customers: CustomerLoyalty[];
    menuCount: number;
    whatsappSummary: string;
  }> {
    return request(`/api/businesses/${slug}/analytics`);
  },

  async sendAnalyticsEvent(slug: string, event: string): Promise<void> {
    try {
      await request(`/api/businesses/${slug}/analytics/event`, {
        method: 'POST',
        body: JSON.stringify({ event }),
      });
    } catch (e) {
      // Background telemetry non-blocking
    }
  },
};
