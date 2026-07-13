const API_BASE = '/api';

// Helper to get auth header
const getHeaders = () => {
  const token = localStorage.getItem('rt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(data: { name: string; email: string; phone?: string; college: string; hostel?: string; profileImage?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  async login(email: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateProfile(data: { name: string; phone?: string; hostel?: string; profileImage?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Profile update failed');
    return result;
  },

  async verifyStudent() {
    const res = await fetch(`${API_BASE}/auth/verify-student`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Verification failed');
    return result;
  },

  // Products
  async getProducts(filters?: { category?: string; search?: string; college?: string; minPrice?: number; maxPrice?: number }) {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.college) params.append('college', filters.college);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    }
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async getProductById(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load product');
    return result;
  },

  async createProduct(data: {
    title: string;
    description: string;
    category: string;
    rentPricePerDay: number;
    deposit: number;
    images?: string[];
    location?: { lat: number; lng: number; address: string };
    condition: string;
    college: string;
    hostel?: string;
  }) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create product');
    return result;
  },

  async updateProduct(id: string, data: any) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update product');
    return result;
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete product');
    return result;
  },

  async reportProduct(id: string, reason: string) {
    const res = await fetch(`${API_BASE}/products/${id}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to report product');
    return result;
  },

  // Bookings
  async createBooking(data: { productId: string; startDate: string; endDate: string; totalPrice: number; deposit: number }) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create booking');
    return result;
  },

  async getMyRentals() {
    const res = await fetch(`${API_BASE}/bookings/my-rentals`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load rentals');
    return res.json();
  },

  async getMyListings() {
    const res = await fetch(`${API_BASE}/bookings/my-listings`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load listings');
    return res.json();
  },

  async updateBookingStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED') {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update booking status');
    return result;
  },

  async confirmPickup(id: string, code: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/pickup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to confirm pickup');
    return result;
  },

  async confirmReturn(id: string, code: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to confirm return');
    return result;
  },

  // Reviews
  async createReview(data: { productId?: string; targetUserId: string; rating: number; comment: string }) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit review');
    return result;
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load wishlist');
    return res.json();
  },

  async toggleWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle wishlist');
    return result;
  },

  // Chat
  async getMessages() {
    const res = await fetch(`${API_BASE}/messages`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load messages');
    return res.json();
  },

  async sendMessage(productId: string, receiverId: string, text: string) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, receiverId, text }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load stats');
    return result;
  },

  async getAdminReports() {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  async resolveReport(id: string, action: 'RESOLVED' | 'ACTION_TAKEN') {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to resolve report');
    return result;
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  async banUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/ban`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to ban user');
    return result;
  },

  async updateCommission(percentage: number) {
    const res = await fetch(`${API_BASE}/admin/commission`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ percentage }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update commission');
    return result;
  }
};
