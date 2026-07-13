# RentMyThing - Campus Peer-to-Peer Rental Marketplace

RentMyThing is a modern, high-fidelity full-stack peer-to-peer rental marketplace designed for college and hostel students. Instead of spending high amounts on occasionally used items, students can list, borrow, and lend expensive equipment (e.g. cameras, laptops, hybrid cycles, projectors, sports items, and hostel essentials) with other students nearby in their dorms or campus hubs.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **React & TypeScript** with **Vite** for optimized fast bundling.
- **Tailwind CSS v4** with glassmorphism and modern display components.
- **Lucide Icons** for vector imagery.

### Backend & API
- **Node.js & Express** full-stack server setup.
- **Stateless JWT Token Authentication** for secure student sessions.
- **Disk-Backed JSON Relational Database** (`db.json`) providing zero-config, ultra-fast persistence inside sandboxed preview environments.

---

## 📋 Database Schema & Relationships

### 1. Users
- `id` (string, PK)
- `name`, `email`, `phone`
- `college`, `hostel` (dorm details)
- `profileImage`
- `verified` (Boolean college email verification status)
- `studentIdVerified` (Boolean student ID verification status)
- `rating` (overall average rating score)
- `role` (`USER` | `ADMIN`)

### 2. Products (Listings)
- `id` (string, PK)
- `ownerId` (FK -> User)
- `title`, `description`, `category`
- `rentPricePerDay` (number), `deposit` (insurance deposit)
- `images` (array of strings)
- `location` (latitude, longitude, physical address)
- `availability` (Boolean)
- `condition` (`New` | `Like New` | `Good` | `Fair`)
- `college`, `hostel`

### 3. Bookings (Rentals)
- `id` (string, PK)
- `productId` (FK -> Product)
- `renterId` (FK -> User)
- `ownerId` (FK -> User)
- `startDate`, `endDate` (ISO strings)
- `totalPrice`, `deposit`
- `status` (`PENDING` | `APPROVED` | `REJECTED` | `COMPLETED` | `CANCELLED`)
- `paymentStatus` (`PENDING` | `PAID`)
- `pickupCode` (used for secure physical verification)
- `isPickedUp`, `isReturned` (Boolean)

### 4. Reviews
- `id` (string, PK)
- `reviewerId`, `reviewerName`, `reviewerImage`
- `productId`, `productTitle`
- `targetUserId` (the student host/renter being rated)
- `rating` (1 to 5 stars)
- `comment`

---

## 🔑 Environment Variables (`.env.example`)

Copy the environment parameters to configure your server keys:

```env
# JWT_SECRET: Required for signing and verifying JSON Web Tokens
JWT_SECRET="YOUR_SECURE_JWT_SECRET"

# PORT: Port where the express full-stack server binds (Default is 3000)
PORT=3000
```

---

## 🔌 API Endpoints Documentation

### Auth Module
- **`POST /api/auth/register`**: Registers a new student account.
- **`POST /api/auth/login`**: Authenticates a student using their email and returns a JWT.
- **`GET /api/auth/me`**: Fetches current student profile details (Requires Bearer Token).
- **`POST /api/auth/verify-student`**: Completes Student ID status verification (Requires Bearer Token).
- **`PUT /api/auth/profile`**: Edits profile name, phone number, and avatar image.

### Products Catalog Module
- **`GET /api/products`**: Lists products with filters (`category`, `search`, `college`, `minPrice`, `maxPrice`).
- **`GET /api/products/:id`**: Returns individual item details and public student reviews.
- **`POST /api/products`**: Creates a new product listing (Requires Bearer Token).
- **`PUT /api/products/:id`**: Edits product details (Requires Bearer Token).
- **`DELETE /api/products/:id`**: Deletes a product listing (Requires Bearer Token).
- **`POST /api/products/:id/report`**: Reports a spam listing (Requires Bearer Token).

### Bookings & Checkout Module
- **`POST /api/bookings`**: Submits an active rental request (Requires Bearer Token).
- **`GET /api/bookings/my-rentals`**: Returns list of borrows requested by the logged-in student.
- **`GET /api/bookings/my-listings`**: Returns rentals requested on items owned by the student.
- **`POST /api/bookings/:id/status`**: Approves, rejects, or cancels requests (Requires Bearer Token).
- **`POST /api/bookings/:id/pickup`**: Owner verifies the renter's pickup confirmation code (Requires Bearer Token).

### Peer-to-Peer Messenger
- **`GET /api/messages`**: Retrieves direct messages for the logged-in student.
- **`POST /api/messages`**: Dispatches a new message regarding a specific item.

---

## 🚀 Payout & Commission Structure

- **Platform Commission**: The platform takes **5%** on completed rentals, dynamically adjustable by the Administrator.
- **Damage Insurance**: Security deposits are separated and returned safely to the renter upon rental completion, verified by both peer-to-peer student parties.
- **Secure Code Handoff**: Renter receives a custom verification string code upon booking approval. Renter provides this code physically to the host student at pick up. The host verifies this code inside their "Renting Out My Items" dashboard to authorize possession!
