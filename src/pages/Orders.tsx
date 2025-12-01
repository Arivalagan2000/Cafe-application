import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../utils/api';
import { Clock, Package, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  notes: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export default function Orders() {
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getAll(token!);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus, token!);
      await loadOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' };
      case 'preparing':
        return { label: 'Preparing', icon: Package, color: 'bg-blue-100 text-blue-700' };
      case 'ready':
        return { label: 'Ready', icon: CheckCircle, color: 'bg-green-100 text-green-700' };
      case 'completed':
        return { label: 'Completed', icon: CheckCircle, color: 'bg-gray-100 text-gray-700' };
      case 'cancelled':
        return { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, icon: Clock, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-gray-900 mb-2">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
            <p className="text-gray-600">
              {isAdmin ? 'Manage customer orders' : 'View your order history'}
            </p>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-gray-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()} at{' '}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-gray-600">{order.items.length} items</span>
                        {isAdmin && (
                          <span className="text-gray-600">{order.userEmail}</span>
                        )}
                      </div>
                      <span className="text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      {/* Order Items */}
                      <div className="mb-4">
                        <h3 className="text-gray-900 mb-3">Items</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="text-gray-900">{item.name}</p>
                                <p className="text-gray-600">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                              <span className="text-gray-900">${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="mb-4">
                          <h3 className="text-gray-900 mb-2">Notes</h3>
                          <p className="text-gray-600 p-3 bg-white rounded-lg">{order.notes}</p>
                        </div>
                      )}

                      {/* Admin Actions */}
                      {isAdmin && order.status !== 'completed' && order.status !== 'cancelled' && (
                        <div>
                          <h3 className="text-gray-900 mb-3">Update Status</h3>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'preparing')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Start Preparing
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'cancelled')}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Cancel Order
                                </button>
                              </>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'ready')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Mark as Ready
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                Mark as Completed
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
