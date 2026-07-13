export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  hostel: string;
  profileImage: string;
  verified: boolean;
  studentIdVerified: boolean;
  rating: number;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerRating?: number;
  title: string;
  description: string;
  category: string;
  rentPricePerDay: number;
  deposit: number;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  availability: boolean;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  college: string;
  hostel?: string;
  featured?: boolean;
  createdAt: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  productId: string;
  productTitle?: string;
  productImage?: string;
  renterId: string;
  renterName?: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  deposit: number;
  status: BookingStatus;
  paymentStatus: 'PENDING' | 'PAID';
  pickupCode: string;
  isPickedUp: boolean;
  isReturned: boolean;
  lateFee: number;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  productId?: string;
  productTitle?: string;
  targetUserId: string; // User being reviewed (owner or renter)
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
}

export interface Message {
  id: string;
  productId: string;
  productTitle?: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'return_reminder' | 'review_reminder' | 'general';
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  productId: string;
  productTitle?: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'ACTION_TAKEN';
  createdAt: string;
}

export interface SystemStats {
  commissionPercentage: number;
  totalRevenue: number;
  platformEarnings: number;
  totalRentals: number;
}
