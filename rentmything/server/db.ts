import fs from 'fs';
import path from 'path';
import { User, Product, Booking, Review, WishlistItem, Message, Notification, Report, SystemStats, UserRole } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: User[];
  products: Product[];
  bookings: Booking[];
  reviews: Review[];
  wishlist: WishlistItem[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  stats: SystemStats;
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Standard coordinate hub (Boston University / MIT / Harvard campus area as a proxy)
const CAMPUS_LAT = 42.3505;
const CAMPUS_LNG = -71.1054;

const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    phone: '+1 (555) 019-2834',
    college: 'Boston University',
    hostel: 'Warren Towers, Floor 12',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
    verified: true,
    studentIdVerified: true,
    rating: 4.8,
    role: UserRole.USER,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    phone: '+1 (555) 014-9876',
    college: 'Boston University',
    hostel: 'Kilachand Hall, Room 402',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    verified: true,
    studentIdVerified: true,
    rating: 4.9,
    role: UserRole.USER,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u3',
    name: 'Jordan Miller',
    email: 'jordan.m@university.edu',
    phone: '+1 (555) 017-3456',
    college: 'Northeastern University',
    hostel: 'International Village',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    verified: true,
    studentIdVerified: false,
    rating: 4.5,
    role: UserRole.USER,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'admin1',
    name: 'Chief Admin',
    email: 'admin@rentmything.com',
    phone: '+1 (555) 999-0000',
    college: 'System Administration',
    hostel: 'HQ Office',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    verified: true,
    studentIdVerified: true,
    rating: 5.0,
    role: UserRole.ADMIN,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    ownerId: 'u1',
    title: 'Sony Alpha a6400 Mirrorless Camera',
    description: 'Perfect mirrorless camera for student projects, short films, and vlogging. Comes with 16-50mm kit lens, 2 extra batteries, and a 64GB SD card. Please return in clean condition!',
    category: 'Camera',
    rentPricePerDay: 15,
    deposit: 100,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT + 0.0012,
      lng: CAMPUS_LNG - 0.0008,
      address: 'Warren Towers Lobby, Boston University'
    },
    availability: true,
    condition: 'Like New',
    college: 'Boston University',
    hostel: 'Warren Towers',
    featured: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p2',
    ownerId: 'u2',
    title: 'PlayStation 5 Console (Disc Edition)',
    description: 'Comes with two DualSense controllers, Spider-Man 2, and FIFA 24 pre-installed. Great for weekend hostel tournament sessions or gaming nights.',
    category: 'Gaming',
    rentPricePerDay: 20,
    deposit: 150,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0015,
      lng: CAMPUS_LNG + 0.001,
      address: 'Kilachand Hall Room 402'
    },
    availability: true,
    condition: 'Good',
    college: 'Boston University',
    hostel: 'Kilachand Hall',
    featured: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p3',
    ownerId: 'u1',
    title: 'Epson VS260 3LCD Projector',
    description: 'Bright 3300-lumen projector, perfect for outdoor movie nights or presentation rehearsals. Has HDMI input and includes a 15-foot cable and tripod stand!',
    category: 'Projector',
    rentPricePerDay: 12,
    deposit: 50,
    images: [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT + 0.0005,
      lng: CAMPUS_LNG - 0.0015,
      address: 'Warren Towers, Floor 12'
    },
    availability: true,
    condition: 'Good',
    college: 'Boston University',
    hostel: 'Warren Towers',
    featured: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p4',
    ownerId: 'u3',
    title: 'Specialized Sirrus Hybrid Bike (Size M)',
    description: 'Fast, lightweight hybrid cycle ideal for commuting or exploring the city. Includes a solid U-lock, front/rear lights, and a helmet. Ready to ride!',
    category: 'Cycle',
    rentPricePerDay: 8,
    deposit: 40,
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.004,
      lng: CAMPUS_LNG + 0.003,
      address: 'International Village Bike Racks, Northeastern University'
    },
    availability: true,
    condition: 'Good',
    college: 'Northeastern University',
    hostel: 'International Village',
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p5',
    ownerId: 'u2',
    title: 'Fender FA-115 Dreadnought Acoustic Guitar',
    description: 'Perfect acoustic guitar for bonfire nights or jamming in the common room. Comes with a soft gig bag, tuner, guitar picks, and a strap.',
    category: 'Musical Instruments',
    rentPricePerDay: 6,
    deposit: 25,
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0018,
      lng: CAMPUS_LNG + 0.0012,
      address: 'Kilachand Hall, Boston University'
    },
    availability: true,
    condition: 'Like New',
    college: 'Boston University',
    hostel: 'Kilachand Hall',
    featured: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p6',
    ownerId: 'u3',
    title: 'Ninja Professional 1000W Blender',
    description: 'Extremely powerful blender. Great for smoothies, meal prep, or frozen drinks. Please clean thoroughly before returning!',
    category: 'Kitchen Items',
    rentPricePerDay: 5,
    deposit: 20,
    images: [
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0035,
      lng: CAMPUS_LNG + 0.0028,
      address: 'International Village Common Kitchen, Northeastern University'
    },
    availability: false, // Currently rented
    condition: 'Good',
    college: 'Northeastern University',
    hostel: 'International Village',
    featured: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p7',
    ownerId: 'u1',
    title: 'Anker Soundcore Motion+ Bluetooth Speaker',
    description: 'High-resolution audio speaker with intense bass and superb clarity. Perfect for small outdoor gatherings, hostel rooftop picnics, or studying with some ambient music. Includes USB-C charging cable and aux cable.',
    category: 'Electronics',
    rentPricePerDay: 4,
    deposit: 15,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT + 0.0007,
      lng: CAMPUS_LNG - 0.0006,
      address: 'Warren Towers Lobby, Boston University'
    },
    availability: true,
    condition: 'Like New',
    college: 'Boston University',
    hostel: 'Warren Towers',
    featured: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p8',
    ownerId: 'u2',
    title: 'Introduction to Algorithms (CLRS) - 4th Edition',
    description: 'The essential textbook for computer science students studying data structures and algorithms. Skip the bookstore price and rent it for your midterm prep or homework assignments. Pristine condition with no highlighting.',
    category: 'Books',
    rentPricePerDay: 2,
    deposit: 10,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0013,
      lng: CAMPUS_LNG + 0.0012,
      address: 'Kilachand Hall Room 402'
    },
    availability: true,
    condition: 'Good',
    college: 'Boston University',
    hostel: 'Kilachand Hall',
    featured: false,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p9',
    ownerId: 'u1',
    title: 'MacBook Pro 13" (M1, 8GB, 256GB SSD)',
    description: 'Super fast and reliable M1 MacBook Pro. Ideal for student developers, graphic designers, or anyone needing a temporary machine for final exams, coding bootcamps, or video editing on Final Cut Pro/Premiere. Includes USB-C charger.',
    category: 'Laptop',
    rentPricePerDay: 18,
    deposit: 120,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT + 0.0005,
      lng: CAMPUS_LNG - 0.0011,
      address: 'Warren Towers, Floor 12'
    },
    availability: true,
    condition: 'Like New',
    college: 'Boston University',
    hostel: 'Warren Towers',
    featured: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p10',
    ownerId: 'u3',
    title: 'Wilson Evolution Indoor Game Basketball (Size 29.5")',
    description: 'Top-tier indoor composite leather basketball. Excellent grip and durability. Perfect for pick-up games at the university recreation center or local court. Please do not use outdoors on rough asphalt!',
    category: 'Sports',
    rentPricePerDay: 3,
    deposit: 15,
    images: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0043,
      lng: CAMPUS_LNG + 0.0029,
      address: 'International Village Recreation Center, Northeastern University'
    },
    availability: true,
    condition: 'Good',
    college: 'Northeastern University',
    hostel: 'International Village',
    featured: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p11',
    ownerId: 'u3',
    title: 'Honeywell TurboForce Power Air Circulator Fan',
    description: 'A powerful, compact 3-speed cooling fan. Crucial for non-air-conditioned hostel rooms during the summer/early fall semesters. Super quiet and can be table or wall-mounted. Keep your dorm breezy!',
    category: 'Hostel Essentials',
    rentPricePerDay: 2,
    deposit: 10,
    images: [
      'https://images.unsplash.com/photo-1618945084196-856ee25816bb?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0037,
      lng: CAMPUS_LNG + 0.0032,
      address: 'International Village Room 508'
    },
    availability: true,
    condition: 'Good',
    college: 'Northeastern University',
    hostel: 'International Village',
    featured: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p12',
    ownerId: 'u2',
    title: 'DEWALT 20V MAX Cordless Drill Combo Kit',
    description: 'Powerful cordless drill with a complete 20-piece screwdriver and drill bit set. Essential for assembling Ikea furniture, hanging frames, or hostel decoration projects. Includes rechargeable battery and charger.',
    category: 'Tools',
    rentPricePerDay: 6,
    deposit: 30,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0015,
      lng: CAMPUS_LNG + 0.0008,
      address: 'Kilachand Hall Basement Storage'
    },
    availability: true,
    condition: 'Like New',
    college: 'Boston University',
    hostel: 'Kilachand Hall',
    featured: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p13',
    ownerId: 'u3',
    title: 'Patagonia Better Sweater 1/4-Zip Fleece (Size L)',
    description: 'Classic warm fleece jacket, perfect for cold Boston fall/winter mornings walking to lectures. Clean, freshly washed, and in excellent condition. High-quality moisture-wicking fabric.',
    category: 'Fashion',
    rentPricePerDay: 4,
    deposit: 20,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop'
    ],
    location: {
      lat: CAMPUS_LAT - 0.0041,
      lng: CAMPUS_LNG + 0.0025,
      address: 'International Village Lobby, Northeastern University'
    },
    availability: true,
    condition: 'Good',
    college: 'Northeastern University',
    hostel: 'International Village',
    featured: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    productId: 'p6',
    renterId: 'u1',
    ownerId: 'u3',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPrice: 25,
    deposit: 20,
    status: 'APPROVED',
    paymentStatus: 'PAID',
    pickupCode: 'QR-P6-U1-9874',
    isPickedUp: true,
    isReturned: false,
    lateFee: 0,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b2',
    productId: 'p5',
    renterId: 'u3',
    ownerId: 'u2',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPrice: 18,
    deposit: 25,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    pickupCode: 'QR-P5-U3-4321',
    isPickedUp: true,
    isReturned: true,
    lateFee: 0,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    reviewerId: 'u3',
    reviewerName: 'Jordan Miller',
    reviewerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    productId: 'p5',
    productTitle: 'Fender FA-115 Dreadnought Acoustic Guitar',
    targetUserId: 'u2', // Sarah Chen
    rating: 5,
    comment: 'The guitar was in perfect tune and condition! Sarah was super easy to coordinate with and very flexible with pick up times. Highly recommend!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r2',
    reviewerId: 'u2',
    reviewerName: 'Sarah Chen',
    reviewerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    targetUserId: 'u3', // Jordan Miller (renter review)
    rating: 5,
    comment: 'Jordan returned the guitar exactly on time and in perfect shape. Polite and respectful of the item!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'm1',
    productId: 'p1',
    senderId: 'u2',
    senderName: 'Sarah Chen',
    receiverId: 'u1',
    receiverName: 'Alex Rivera',
    text: 'Hey Alex! Is your Sony Alpha camera available this Friday for a quick 1-day shoot?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm2',
    productId: 'p1',
    senderId: 'u1',
    senderName: 'Alex Rivera',
    receiverId: 'u2',
    receiverName: 'Sarah Chen',
    text: 'Hi Sarah! Yes, it is. The battery will be fully charged and I will include a spare one too.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
  },
  {
    id: 'm3',
    productId: 'p1',
    senderId: 'u2',
    senderName: 'Sarah Chen',
    receiverId: 'u1',
    receiverName: 'Alex Rivera',
    text: 'Awesome, thanks! I will put in the booking request right now.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Booking Active',
    message: 'Your rental of the Ninja Professional Blender has started. Use pickup code QR-P6-U1-9874.',
    read: false,
    type: 'booking_accepted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'n2',
    userId: 'u2',
    title: 'Review Received',
    message: 'Jordan Miller left you a 5-star review for the Fender Acoustic Guitar!',
    read: false,
    type: 'general',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_REPORTS: Report[] = [
  {
    id: 'rep1',
    reporterId: 'u2',
    productId: 'p4',
    reason: 'The cycle lock description is inaccurate; the lock included has a faulty cylinder.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_STATS: SystemStats = {
  commissionPercentage: 5,
  totalRevenue: 280, // aggregate rentals
  platformEarnings: 14, // 5% of 280
  totalRentals: 15
};

export class DB {
  private static load(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initialSchema: DatabaseSchema = {
        users: DEFAULT_USERS,
        products: DEFAULT_PRODUCTS,
        bookings: DEFAULT_BOOKINGS,
        reviews: DEFAULT_REVIEWS,
        wishlist: [],
        messages: DEFAULT_MESSAGES,
        notifications: DEFAULT_NOTIFICATIONS,
        reports: DEFAULT_REPORTS,
        stats: DEFAULT_STATS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
      return initialSchema;
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing database file, regenerating defaults...', e);
      const initialSchema: DatabaseSchema = {
        users: DEFAULT_USERS,
        products: DEFAULT_PRODUCTS,
        bookings: DEFAULT_BOOKINGS,
        reviews: DEFAULT_REVIEWS,
        wishlist: [],
        messages: DEFAULT_MESSAGES,
        notifications: DEFAULT_NOTIFICATIONS,
        reports: DEFAULT_REPORTS,
        stats: DEFAULT_STATS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
      return initialSchema;
    }
  }

  private static save(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Users ---
  static getUsers(): User[] {
    return this.load().users;
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static createUser(user: Omit<User, 'id' | 'verified' | 'studentIdVerified' | 'rating' | 'createdAt'>): User {
    const data = this.load();
    const newUser: User = {
      ...user,
      id: generateId(),
      verified: false,
      studentIdVerified: false,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    this.save(data);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User {
    const data = this.load();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    data.users[index] = { ...data.users[index], ...updates };
    this.save(data);
    return data.users[index];
  }

  static banUser(id: string): boolean {
    const data = this.load();
    const userIndex = data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    
    // Remove user
    data.users.splice(userIndex, 1);
    // Remove their products too to prevent fake listings
    data.products = data.products.filter(p => p.ownerId !== id);
    
    this.save(data);
    return true;
  }

  // --- Products ---
  static getProducts(): Product[] {
    const data = this.load();
    // Inject owner details
    return data.products.map(p => {
      const owner = data.users.find(u => u.id === p.ownerId);
      return {
        ...p,
        ownerName: owner?.name || 'Unknown Student',
        ownerRating: owner?.rating || 5.0
      };
    });
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  static createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const data = this.load();
    const newProduct: Product = {
      ...product,
      id: 'p-' + generateId(),
      createdAt: new Date().toISOString()
    };
    data.products.push(newProduct);
    this.save(data);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product {
    const data = this.load();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    data.products[index] = { ...data.products[index], ...updates };
    this.save(data);
    return data.products[index];
  }

  static deleteProduct(id: string): boolean {
    const data = this.load();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    data.products.splice(index, 1);
    this.save(data);
    return true;
  }

  // --- Bookings ---
  static getBookings(): Booking[] {
    const data = this.load();
    return data.bookings.map(b => {
      const product = data.products.find(p => p.id === b.productId);
      const renter = data.users.find(u => u.id === b.renterId);
      return {
        ...b,
        productTitle: product?.title,
        productImage: product?.images?.[0],
        renterName: renter?.name
      };
    });
  }

  static createBooking(booking: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'pickupCode' | 'isPickedUp' | 'isReturned' | 'lateFee' | 'createdAt'>): Booking {
    const data = this.load();
    const code = 'QR-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...booking,
      id: 'b-' + generateId(),
      status: 'PENDING',
      paymentStatus: 'PENDING',
      pickupCode: code,
      isPickedUp: false,
      isReturned: false,
      lateFee: 0,
      createdAt: new Date().toISOString()
    };
    data.bookings.push(newBooking);
    
    // Add notification to product owner
    const product = data.products.find(p => p.id === booking.productId);
    if (product) {
      data.notifications.push({
        id: generateId(),
        userId: product.ownerId,
        title: 'New Booking Request',
        message: `Someone wants to rent your "${product.title}" starting ${booking.startDate}.`,
        read: false,
        type: 'booking_request',
        createdAt: new Date().toISOString()
      });
    }

    this.save(data);
    return newBooking;
  }

  static updateBookingStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'): Booking {
    const data = this.load();
    const index = data.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    const booking = data.bookings[index];
    booking.status = status;

    const product = data.products.find(p => p.id === booking.productId);
    
    if (status === 'APPROVED') {
      booking.paymentStatus = 'PAID'; // Simulate success payment
      if (product) {
        product.availability = false; // Mark item as unavailable
      }
      
      // Notify renter
      data.notifications.push({
        id: generateId(),
        userId: booking.renterId,
        title: 'Booking Approved!',
        message: `Your booking for "${product?.title || 'item'}" was approved! Use pickup code: ${booking.pickupCode}.`,
        read: false,
        type: 'booking_accepted',
        createdAt: new Date().toISOString()
      });
    } else if (status === 'REJECTED') {
      // Notify renter
      data.notifications.push({
        id: generateId(),
        userId: booking.renterId,
        title: 'Booking Rejected',
        message: `Apologies, the booking request for "${product?.title || 'item'}" was declined by the owner.`,
        read: false,
        type: 'booking_rejected',
        createdAt: new Date().toISOString()
      });
    } else if (status === 'COMPLETED') {
      booking.isReturned = true;
      if (product) {
        product.availability = true; // Mark available again
      }

      // Add Platform Earning
      const earn = booking.totalPrice * (data.stats.commissionPercentage / 100);
      data.stats.totalRevenue += booking.totalPrice;
      data.stats.platformEarnings += earn;
      data.stats.totalRentals += 1;

      // Notify both parties to review
      data.notifications.push({
        id: generateId(),
        userId: booking.renterId,
        title: 'Rental Completed - Leave a Review',
        message: `Please rate your experience with "${product?.title || 'the item'}".`,
        read: false,
        type: 'review_reminder',
        createdAt: new Date().toISOString()
      });

      data.notifications.push({
        id: generateId(),
        userId: booking.ownerId,
        title: 'Rental Returned - Leave a Review',
        message: 'Your item has been returned. Leave a review for the renter!',
        read: false,
        type: 'review_reminder',
        createdAt: new Date().toISOString()
      });
    }

    this.save(data);
    return booking;
  }

  static confirmPickup(id: string): Booking {
    const data = this.load();
    const index = data.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    data.bookings[index].isPickedUp = true;
    
    this.save(data);
    return data.bookings[index];
  }

  // --- Reviews ---
  static getReviews(): Review[] {
    return this.load().reviews;
  }

  static createReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const data = this.load();
    const newReview: Review = {
      ...review,
      id: 'r-' + generateId(),
      createdAt: new Date().toISOString()
    };
    data.reviews.push(newReview);

    // Recalculate target user rating
    const targetUserId = review.targetUserId;
    const userReviews = data.reviews.filter(r => r.targetUserId === targetUserId);
    const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    
    const userIndex = data.users.findIndex(u => u.id === targetUserId);
    if (userIndex !== -1) {
      data.users[userIndex].rating = parseFloat(avgRating.toFixed(1));
    }

    this.save(data);
    return newReview;
  }

  // --- Wishlist ---
  static getWishlist(userId: string): WishlistItem[] {
    return this.load().wishlist.filter(w => w.userId === userId);
  }

  static toggleWishlist(userId: string, productId: string): boolean {
    const data = this.load();
    const index = data.wishlist.findIndex(w => w.userId === userId && w.productId === productId);
    
    if (index === -1) {
      data.wishlist.push({
        id: generateId(),
        userId,
        productId
      });
      this.save(data);
      return true; // Added
    } else {
      data.wishlist.splice(index, 1);
      this.save(data);
      return false; // Removed
    }
  }

  // --- Chats / Messages ---
  static getMessages(userId: string): Message[] {
    const data = this.load();
    const msgs = data.messages.filter(m => m.senderId === userId || m.receiverId === userId);
    return msgs.map(m => {
      const product = data.products.find(p => p.id === m.productId);
      const sender = data.users.find(u => u.id === m.senderId);
      const receiver = data.users.find(u => u.id === m.receiverId);
      return {
        ...m,
        productTitle: product?.title,
        senderName: sender?.name,
        receiverName: receiver?.name
      };
    });
  }

  static createMessage(msg: Omit<Message, 'id' | 'createdAt'>): Message {
    const data = this.load();
    const newMsg: Message = {
      ...msg,
      id: 'm-' + generateId(),
      createdAt: new Date().toISOString()
    };
    data.messages.push(newMsg);
    this.save(data);
    return newMsg;
  }

  // --- Notifications ---
  static getNotifications(userId: string): Notification[] {
    return this.load().notifications.filter(n => n.userId === userId);
  }

  static markNotificationRead(id: string): boolean {
    const data = this.load();
    const index = data.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    data.notifications[index].read = true;
    this.save(data);
    return true;
  }

  // --- Reports ---
  static getReports(): Report[] {
    const data = this.load();
    return data.reports.map(r => {
      const product = data.products.find(p => p.id === r.productId);
      const reporter = data.users.find(u => u.id === r.reporterId);
      return {
        ...r,
        reporterName: reporter?.name,
        productTitle: product?.title
      };
    });
  }

  static createReport(report: Omit<Report, 'id' | 'status' | 'createdAt'>): Report {
    const data = this.load();
    const newReport: Report = {
      ...report,
      id: 'rep-' + generateId(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    data.reports.push(newReport);
    this.save(data);
    return newReport;
  }

  static updateReportStatus(id: string, status: 'RESOLVED' | 'ACTION_TAKEN'): Report {
    const data = this.load();
    const index = data.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    data.reports[index].status = status;
    
    if (status === 'ACTION_TAKEN') {
      // Ban/remove the reported item
      const rep = data.reports[index];
      data.products = data.products.filter(p => p.id !== rep.productId);
    }

    this.save(data);
    return data.reports[index];
  }

  // --- Stats ---
  static getStats(): SystemStats {
    return this.load().stats;
  }

  static updateCommission(percentage: number): SystemStats {
    const data = this.load();
    data.stats.commissionPercentage = percentage;
    this.save(data);
    return data.stats;
  }
}
