import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { DB } from './server/db';
import { UserRole } from './src/types';

// Fallback JWT secret for ease of development
const JWT_SECRET = process.env.JWT_SECRET || 'rentmything-secure-development-jwt-secret-key-2026';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Authentication Middleware ---
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
};

const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// --- AUTH API ---

// Unified Register/Login for testing or simple custom registers
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, college, hostel, profileImage } = req.body;

  if (!name || !email || !college) {
    return res.status(400).json({ error: 'Name, email, and college are required' });
  }

  const existingUser = DB.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered. Please login instead.' });
  }

  const user = DB.createUser({
    name,
    email,
    phone: phone || '',
    college,
    hostel: hostel || '',
    profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER
  });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body; // Password ignored for MVP simplicity, allowing instant student login

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = DB.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Student email not registered. Please register first.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = DB.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.post('/api/auth/verify-student', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const updatedUser = DB.updateUser(req.user.id, { verified: true, studentIdVerified: true });
  res.json({ success: true, user: updatedUser });
});

app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, hostel, profileImage } = req.body;
  const updatedUser = DB.updateUser(req.user.id, { name, phone, hostel, profileImage });
  res.json({ success: true, user: updatedUser });
});


// --- PRODUCTS API ---

app.get('/api/products', (req, res) => {
  const { category, search, college, minPrice, maxPrice } = req.query;
  let list = DB.getProducts();

  if (category) {
    list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (college) {
    list = list.filter(p => p.college.toLowerCase() === (college as string).toLowerCase());
  }

  if (minPrice) {
    list = list.filter(p => p.rentPricePerDay >= parseFloat(minPrice as string));
  }

  if (maxPrice) {
    list = list.filter(p => p.rentPricePerDay <= parseFloat(maxPrice as string));
  }

  res.json(list);
});

app.get('/api/products/:id', (req, res) => {
  const product = DB.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  // Fetch item reviews
  const reviews = DB.getReviews().filter(r => r.productId === product.id);
  res.json({ product, reviews });
});

app.post('/api/products', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  const { title, description, category, rentPricePerDay, deposit, images, location, condition, college, hostel } = req.body;

  if (!title || !category || !rentPricePerDay || !deposit) {
    return res.status(400).json({ error: 'Missing listing information' });
  }

  const product = DB.createProduct({
    ownerId: req.user.id,
    title,
    description,
    category,
    rentPricePerDay: parseFloat(rentPricePerDay),
    deposit: parseFloat(deposit),
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'],
    location: location || { lat: 42.3505, lng: -71.1054, address: 'Campus Core' },
    availability: true,
    condition,
    college: college || 'University Campus',
    hostel: hostel || '',
    featured: false
  });

  res.status(201).json(product);
});

app.put('/api/products/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const product = DB.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.ownerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Not authorized to edit this listing' });
  }

  const updated = DB.updateProduct(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/products/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const product = DB.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.ownerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Not authorized to delete this listing' });
  }

  DB.deleteProduct(req.params.id);
  res.json({ success: true });
});

app.post('/api/products/:id/report', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Reason for report is required' });

  const rep = DB.createReport({
    reporterId: req.user.id,
    productId: req.params.id,
    reason
  });

  res.status(201).json({ success: true, report: rep });
});


// --- BOOKINGS API ---

app.post('/api/bookings', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, startDate, endDate, totalPrice, deposit } = req.body;

  if (!productId || !startDate || !endDate || !totalPrice) {
    return res.status(400).json({ error: 'Incomplete booking details' });
  }

  const product = DB.getProductById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (!product.availability) return res.status(400).json({ error: 'Product currently rented or unavailable' });

  const b = DB.createBooking({
    productId,
    renterId: req.user.id,
    ownerId: product.ownerId,
    startDate,
    endDate,
    totalPrice: parseFloat(totalPrice),
    deposit: parseFloat(deposit || 0)
  });

  res.status(201).json(b);
});

app.get('/api/bookings/my-rentals', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const list = DB.getBookings().filter(b => b.renterId === req.user!.id);
  res.json(list);
});

app.get('/api/bookings/my-listings', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const list = DB.getBookings().filter(b => b.ownerId === req.user!.id);
  res.json(list);
});

app.post('/api/bookings/:id/status', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { status } = req.body; // APPROVED, REJECTED, COMPLETED, CANCELLED
  
  const booking = DB.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Access checks
  const isOwner = booking.ownerId === req.user.id;
  const isRenter = booking.renterId === req.user.id;

  if (!isOwner && !isRenter && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized action' });
  }

  const updated = DB.updateBookingStatus(req.params.id, status);
  res.json(updated);
});

app.post('/api/bookings/:id/pickup', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { code } = req.body;

  const booking = DB.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the item owner can verify the pickup code' });
  }

  if (booking.pickupCode !== code) {
    return res.status(400).json({ error: 'Invalid pickup confirmation code' });
  }

  const updated = DB.confirmPickup(req.params.id);
  res.json({ success: true, booking: updated });
});

app.post('/api/bookings/:id/return', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { code } = req.body;

  const booking = DB.getBookings().find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the item owner can verify the return code' });
  }

  const expectedReturnCode = `RETURN-${booking.pickupCode}`;
  if (expectedReturnCode !== code && booking.pickupCode !== code) {
    return res.status(400).json({ error: 'Invalid return confirmation code' });
  }

  const updated = DB.updateBookingStatus(req.params.id, 'COMPLETED');
  res.json({ success: true, booking: updated });
});


// --- REVIEWS API ---

app.post('/api/reviews', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, targetUserId, rating, comment } = req.body;

  if (!targetUserId || !rating || !comment) {
    return res.status(400).json({ error: 'Rating, comment and target profile are required' });
  }

  const user = DB.getUserById(req.user.id);
  const reviewerName = user?.name || 'Anonymous Student';
  const reviewerImage = user?.profileImage;

  const product = productId ? DB.getProductById(productId) : undefined;

  const rev = DB.createReview({
    reviewerId: req.user.id,
    reviewerName,
    reviewerImage,
    productId,
    productTitle: product?.title,
    targetUserId,
    rating: parseInt(rating),
    comment
  });

  res.status(201).json(rev);
});


// --- WISHLIST API ---

app.get('/api/wishlist', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const items = DB.getWishlist(req.user.id);
  res.json(items);
});

app.post('/api/wishlist/toggle', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const added = DB.toggleWishlist(req.user.id, productId);
  res.json({ added });
});


// --- CHAT / MESSAGES API ---

app.get('/api/messages', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const msgs = DB.getMessages(req.user.id);
  res.json(msgs);
});

app.post('/api/messages', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, receiverId, text } = req.body;

  if (!productId || !receiverId || !text) {
    return res.status(400).json({ error: 'ProductId, receiverId and text are required' });
  }

  const sender = DB.getUserById(req.user.id);
  const receiver = DB.getUserById(receiverId);

  const msg = DB.createMessage({
    productId,
    senderId: req.user.id,
    senderName: sender?.name || 'Sender',
    receiverId,
    receiverName: receiver?.name || 'Receiver',
    text
  });

  res.status(201).json(msg);
});


// --- NOTIFICATIONS API ---

app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(DB.getNotifications(req.user.id));
});

app.post('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  const success = DB.markNotificationRead(req.params.id);
  res.json({ success });
});


// --- ADMIN API ---

app.get('/api/admin/stats', authenticateToken, adminOnly, (req, res) => {
  const stats = DB.getStats();
  
  // Custom rich analytics for Dashboard
  const allProducts = DB.getProducts();
  const allBookings = DB.getBookings();
  const allUsers = DB.getUsers().filter(u => u.role !== UserRole.ADMIN);
  
  // Rented counts by product category
  const categoriesMap: Record<string, number> = {};
  allProducts.forEach(p => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });

  // Top active college rentals
  const collegeMap: Record<string, number> = {};
  allBookings.forEach(b => {
    const prod = allProducts.find(p => p.id === b.productId);
    if (prod) {
      collegeMap[prod.college] = (collegeMap[prod.college] || 0) + 1;
    }
  });

  res.json({
    stats,
    userCount: allUsers.length,
    listingCount: allProducts.length,
    bookingCount: allBookings.length,
    categoriesDistribution: categoriesMap,
    collegeDistribution: collegeMap
  });
});

app.get('/api/admin/reports', authenticateToken, adminOnly, (req, res) => {
  res.json(DB.getReports());
});

app.post('/api/admin/reports/:id/resolve', authenticateToken, adminOnly, (req, res) => {
  const { action } = req.body; // RESOLVED, ACTION_TAKEN
  if (!action) return res.status(400).json({ error: 'Action is required' });
  const updated = DB.updateReportStatus(req.params.id, action);
  res.json(updated);
});

app.get('/api/admin/users', authenticateToken, adminOnly, (req, res) => {
  res.json(DB.getUsers().filter(u => u.role !== UserRole.ADMIN));
});

app.delete('/api/admin/users/:id/ban', authenticateToken, adminOnly, (req, res) => {
  const banned = DB.banUser(req.params.id);
  res.json({ success: banned });
});

app.post('/api/admin/commission', authenticateToken, adminOnly, (req, res) => {
  const { percentage } = req.body;
  if (percentage === undefined) return res.status(400).json({ error: 'Commission percentage required' });
  const stats = DB.updateCommission(parseFloat(percentage));
  res.json(stats);
});


// --- Vite Dev Server & Static Files Routing ---

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
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RentMyThing server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
