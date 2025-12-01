# Cafe Management System - Setup Guide

## Overview

This is a fully functional Cafe Management Web Application built with React, TypeScript, TailwindCSS, and Supabase backend.

## Features

### Authentication
- Email/password login with Supabase Auth
- Role-based access control (Admin & Employee)
- Session management with JWT tokens
- Auto-initialized demo accounts

### Admin Features
- **Dashboard**: Analytics overview with revenue, order stats, and popular items
- **Menu Management**: Full CRUD operations for menu items
  - Add/Edit/Delete menu items
  - Set prices, categories, descriptions
  - Toggle item availability
  - Search and filter capabilities
- **Order Management**: View all customer orders and update status
- **Analytics**: Real-time insights into cafe operations

### Employee Features
- **Browse Menu**: View available food and drinks
- **Shopping Cart**: Add items, adjust quantities
- **Place Orders**: Submit orders with optional notes
- **Order History**: Track personal order status

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS v4
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Context API
- **API**: RESTful endpoints via Supabase Edge Functions

## Demo Accounts

The system automatically creates two demo accounts:

### Admin Account
- **Email**: admin@cafe.com
- **Password**: admin123
- **Access**: Full system access

### Employee Account
- **Email**: employee@cafe.com
- **Password**: employee123
- **Access**: Menu browsing and ordering only

## File Structure

```
/
├── App.tsx                    # Main app with routing
├── contexts/
│   ├── AuthContext.tsx        # Authentication state management
│   └── CartContext.tsx        # Shopping cart state management
├── pages/
│   ├── Login.tsx             # Login page
│   ├── AdminDashboard.tsx    # Admin analytics dashboard
│   ├── MenuManagement.tsx    # Menu CRUD interface
│   ├── OrderMenu.tsx         # Employee ordering interface
│   └── Orders.tsx            # Order list and management
├── components/
│   ├── Layout.tsx            # Main layout with navigation
│   ├── MenuItemModal.tsx     # Menu item add/edit modal
│   └── WelcomeGuide.tsx      # Getting started guide
├── supabase/functions/server/
│   └── index.tsx             # Backend API routes
├── utils/
│   ├── api.ts                # API client functions
│   └── setup.ts              # Demo user initialization
└── styles/
    └── globals.css           # Global styles and theme
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user (admin only in production)
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user profile

### Menu
- `GET /menu` - Get all menu items (supports ?category and ?search)
- `GET /menu/:id` - Get single menu item
- `POST /menu` - Create menu item (admin only)
- `PUT /menu/:id` - Update menu item (admin only)
- `DELETE /menu/:id` - Delete menu item (admin only)

### Orders
- `GET /orders` - Get orders (all for admin, user's orders for employees)
- `GET /orders/:id` - Get single order
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status (admin only)

### Analytics
- `GET /analytics` - Get cafe analytics (admin only)

## Database Schema (KV Store)

The application uses Supabase KV store with the following key patterns:

- `user:{userId}` - User profiles
- `menu:{menuId}` - Menu items
- `order:{orderId}` - Orders with items and status

## Order Status Flow

1. **Pending** - Order placed, awaiting preparation
2. **Preparing** - Order is being prepared
3. **Ready** - Order ready for pickup
4. **Completed** - Order fulfilled
5. **Cancelled** - Order cancelled

## How to Use

### As Admin
1. Login with admin credentials
2. View dashboard for analytics overview
3. Navigate to Menu Management to add/edit items
4. View Orders to manage customer orders
5. Update order status as they progress

### As Employee
1. Login with employee credentials
2. Browse available menu items
3. Add items to cart
4. Place order with optional notes
5. View order history and status

## Sample Menu Items

The system initializes with sample menu items:
- Espresso ($2.99)
- Cappuccino ($4.49)
- Latte ($4.99)
- Croissant ($3.49)
- Blueberry Muffin ($3.99)
- Avocado Toast ($7.99)

## Security Features

- JWT-based authentication
- Role-based access control
- Protected API routes with auth middleware
- Secure session management
- Input validation and error handling

## Development Notes

- All API calls include comprehensive error handling
- Session persists in localStorage
- Cart persists across sessions
- Real-time order status updates
- Responsive design for mobile and desktop

## Future Enhancements

Potential features to add:
- Image upload for menu items
- Real-time notifications
- Sales reports and export
- Customer management
- Table management
- Payment integration
- Email notifications
- Multi-location support

## Support

This application is built with Figma Make and uses Supabase for backend services. 
Note: This is a prototype/demo application and is not meant for production use with sensitive data.
