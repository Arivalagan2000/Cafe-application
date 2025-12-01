import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Auth middleware
async function authMiddleware(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
}

// ============ AUTH ROUTES ============

// Sign up (Admin can create users)
app.post('/make-server-ea183f60/auth/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (!['admin', 'employee'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be admin or employee' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // If user already exists, return a more specific error
      if (error.message?.includes('already') || error.message?.includes('exists')) {
        return c.json({ error: 'User with this email already exists' }, 409);
      }
      
      return c.json({ error: `Sign up failed: ${error.message}` }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });

    return c.json({ 
      message: 'User created successfully', 
      user: { id: data.user.id, email, name, role } 
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return c.json({ error: `Sign up error: ${error.message}` }, 500);
  }
});

// Login
app.post('/make-server-ea183f60/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: `Login failed: ${error.message}` }, 401);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${data.user.id}`);

    return c.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userProfile?.name || data.user.user_metadata?.name,
        role: userProfile?.role || data.user.user_metadata?.role || 'employee'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: `Login error: ${error.message}` }, 500);
  }
});

// Get current user
app.get('/make-server-ea183f60/auth/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);

    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: `Error fetching user: ${error.message}` }, 500);
  }
});

// ============ MENU ROUTES ============

// Get all menu items
app.get('/make-server-ea183f60/menu', async (c) => {
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');
    
    let menuItems = await kv.getByPrefix('menu:');
    
    // Filter by category
    if (category && category !== 'all') {
      menuItems = menuItems.filter(item => item.category === category);
    }
    
    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      menuItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    return c.json({ menu: menuItems });
  } catch (error) {
    console.error('Get menu error:', error);
    return c.json({ error: `Error fetching menu: ${error.message}` }, 500);
  }
});

// Get single menu item
app.get('/make-server-ea183f60/menu/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const menuItem = await kv.get(`menu:${id}`);
    
    if (!menuItem) {
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    return c.json({ menuItem });
  } catch (error) {
    console.error('Get menu item error:', error);
    return c.json({ error: `Error fetching menu item: ${error.message}` }, 500);
  }
});

// Create menu item (Admin only)
app.post('/make-server-ea183f60/menu', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    const { name, category, description, price, available, image } = await c.req.json();
    
    if (!name || !category || !price) {
      return c.json({ error: 'Missing required fields: name, category, price' }, 400);
    }
    
    const id = crypto.randomUUID();
    const menuItem = {
      id,
      name,
      category,
      description: description || '',
      price: parseFloat(price),
      available: available !== undefined ? available : true,
      image: image || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`menu:${id}`, menuItem);
    
    return c.json({ message: 'Menu item created successfully', menuItem }, 201);
  } catch (error) {
    console.error('Create menu item error:', error);
    return c.json({ error: `Error creating menu item: ${error.message}` }, 500);
  }
});

// Update menu item (Admin only)
app.put('/make-server-ea183f60/menu/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const existingItem = await kv.get(`menu:${id}`);
    
    if (!existingItem) {
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    const updates = await c.req.json();
    const updatedItem = {
      ...existingItem,
      ...updates,
      id, // Ensure ID doesn't change
      price: updates.price ? parseFloat(updates.price) : existingItem.price,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`menu:${id}`, updatedItem);
    
    return c.json({ message: 'Menu item updated successfully', menuItem: updatedItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    return c.json({ error: `Error updating menu item: ${error.message}` }, 500);
  }
});

// Delete menu item (Admin only)
app.delete('/make-server-ea183f60/menu/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const existingItem = await kv.get(`menu:${id}`);
    
    if (!existingItem) {
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    await kv.del(`menu:${id}`);
    
    return c.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return c.json({ error: `Error deleting menu item: ${error.message}` }, 500);
  }
});

// ============ ORDER ROUTES ============

// Create order
app.post('/make-server-ea183f60/orders', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const { items, notes } = await c.req.json();
    
    if (!items || items.length === 0) {
      return c.json({ error: 'Order must contain at least one item' }, 400);
    }
    
    // Calculate total and validate items
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await kv.get(`menu:${item.menuItemId}`);
      if (!menuItem) {
        return c.json({ error: `Menu item ${item.menuItemId} not found` }, 404);
      }
      if (!menuItem.available) {
        return c.json({ error: `${menuItem.name} is currently unavailable` }, 400);
      }
      
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }
    
    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      userId,
      userEmail,
      items: orderItems,
      total,
      notes: notes || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ message: 'Order placed successfully', order }, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return c.json({ error: `Error creating order: ${error.message}` }, 500);
  }
});

// Get all orders (Admin: all orders, Employee: their orders)
app.get('/make-server-ea183f60/orders', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    let orders = await kv.getByPrefix('order:');
    
    // If employee, only show their orders
    if (userProfile?.role !== 'admin') {
      orders = orders.filter(order => order.userId === userId);
    }
    
    // Sort by created_at descending
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return c.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({ error: `Error fetching orders: ${error.message}` }, 500);
  }
});

// Get single order
app.get('/make-server-ea183f60/orders/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    const orderId = c.req.param('id');
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Check if user has access to this order
    if (userProfile?.role !== 'admin' && order.userId !== userId) {
      return c.json({ error: 'Forbidden - Access denied' }, 403);
    }
    
    return c.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return c.json({ error: `Error fetching order: ${error.message}` }, 500);
  }
});

// Update order status (Admin only)
app.patch('/make-server-ea183f60/orders/:id/status', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    const orderId = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    order.status = status;
    order.updated_at = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    return c.json({ error: `Error updating order status: ${error.message}` }, 500);
  }
});

// Get analytics (Admin only)
app.get('/make-server-ea183f60/analytics', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }
    
    const orders = await kv.getByPrefix('order:');
    const menuItems = await kv.getByPrefix('menu:');
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    
    // Popular items
    const itemCounts: Record<string, any> = {};
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.subtotal;
      });
    });
    
    const popularItems = Object.entries(itemCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return c.json({
      totalOrders,
      totalRevenue,
      totalMenuItems: menuItems.length,
      ordersByStatus,
      popularItems
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return c.json({ error: `Error fetching analytics: ${error.message}` }, 500);
  }
});

// Initialize with sample data if needed
app.post('/make-server-ea183f60/init-sample-data', async (c) => {
  try {
    // Check if data already exists
    const existingMenu = await kv.getByPrefix('menu:');
    if (existingMenu.length > 0) {
      return c.json({ message: 'Sample data already exists' });
    }
    
    // Create sample menu items
    const sampleMenu = [
      {
        id: crypto.randomUUID(),
        name: 'Espresso',
        category: 'drinks',
        description: 'Rich and bold shot of espresso',
        price: 2.99,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Cappuccino',
        category: 'drinks',
        description: 'Espresso with steamed milk and foam',
        price: 4.49,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Latte',
        category: 'drinks',
        description: 'Smooth espresso with steamed milk',
        price: 4.99,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Croissant',
        category: 'food',
        description: 'Buttery and flaky French pastry',
        price: 3.49,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Blueberry Muffin',
        category: 'food',
        description: 'Fresh baked muffin with blueberries',
        price: 3.99,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Avocado Toast',
        category: 'food',
        description: 'Toasted sourdough with mashed avocado',
        price: 7.99,
        available: true,
        image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const item of sampleMenu) {
      await kv.set(`menu:${item.id}`, item);
    }
    
    return c.json({ message: 'Sample data initialized successfully', itemCount: sampleMenu.length });
  } catch (error) {
    console.error('Init sample data error:', error);
    return c.json({ error: `Error initializing sample data: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
