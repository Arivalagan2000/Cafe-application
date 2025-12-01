import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { menuApi, orderApi } from '../utils/api';
import { Search, Coffee, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

export default function OrderMenu() {
  const { token } = useAuth();
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadMenu();
  }, [categoryFilter, searchTerm]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await menuApi.getAll(
        categoryFilter === 'all' ? undefined : categoryFilter,
        searchTerm || undefined
      );
      setMenuItems(data.menu.filter((item: MenuItem) => item.available));
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
    toast.success(`${item.name} added to cart`);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      setPlacingOrder(true);
      const orderItems = cartItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      }));

      await orderApi.create(orderItems, orderNotes, token!);
      
      clearCart();
      setOrderNotes('');
      setShowCart(false);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Failed to place order:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const getCartQuantity = (itemId: string) => {
    return cartItems.find(item => item.menuItemId === itemId)?.quantity || 0;
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-gray-900 mb-2">Menu</h1>
            <p className="text-gray-600">Browse and order from our menu</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="drinks">Drinks</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>

          {/* Menu Items */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => {
                const quantity = getCartQuantity(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Coffee className="w-10 h-10 text-amber-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">${item.price.toFixed(2)}</span>
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-gray-900 w-8 text-center">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No menu items available</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-6 h-6 text-amber-600" />
              <h2 className="text-gray-900">Your Order</h2>
              {itemCount > 0 && (
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-gray-700 mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {placingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full mt-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
