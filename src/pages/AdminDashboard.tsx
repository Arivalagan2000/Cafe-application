import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WelcomeGuide from '../components/WelcomeGuide';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi } from '../utils/api';
import { DollarSign, ShoppingBag, Coffee, TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalMenuItems: number;
  ordersByStatus: {
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
  popularItems: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.get(token!);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load analytics</p>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Total Orders',
      value: analytics.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      label: 'Menu Items',
      value: analytics.totalMenuItems,
      icon: Coffee,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg Order Value',
      value: analytics.totalOrders > 0 
        ? `$${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)}`
        : '$0.00',
      icon: TrendingUp,
      color: 'bg-amber-500'
    }
  ];

  const orderStatuses = [
    { label: 'Pending', count: analytics.ordersByStatus.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Preparing', count: analytics.ordersByStatus.preparing, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Ready', count: analytics.ordersByStatus.ready, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Completed', count: analytics.ordersByStatus.completed, icon: CheckCircle, color: 'text-gray-600 bg-gray-50' },
    { label: 'Cancelled', count: analytics.ordersByStatus.cancelled, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Guide (show only if no orders yet) */}
        {analytics && analytics.totalOrders === 0 && <WelcomeGuide />}

        {/* Header */}
        <div>
          <h1 className="text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of cafe operations and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">{stat.label}</p>
                  <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-gray-900 mb-4">Orders by Status</h2>
            <div className="space-y-3">
              {orderStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <div key={status.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-gray-900">{status.label}</span>
                    </div>
                    <span className="text-gray-900">{status.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-gray-900 mb-4">Popular Items</h2>
            {analytics.popularItems.length > 0 ? (
              <div className="space-y-3">
                {analytics.popularItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-amber-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-gray-500">{item.count} orders</p>
                      </div>
                    </div>
                    <p className="text-gray-900">${item.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders yet
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
