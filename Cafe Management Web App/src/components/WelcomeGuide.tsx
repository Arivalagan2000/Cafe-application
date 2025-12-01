import { Coffee, Users, ShoppingCart, BarChart3 } from 'lucide-react';

export default function WelcomeGuide() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Coffee className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-gray-900 mb-2">Welcome to Cafe Management System</h2>
          <p className="text-gray-600">
            A complete solution for managing your cafe operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-900">Admin Features</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Dashboard with analytics</li>
              <li>• Menu management (CRUD)</li>
              <li>• Order management</li>
              <li>• View all customer orders</li>
              <li>• Update order status</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-gray-900">Employee Features</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Browse menu items</li>
              <li>• Add items to cart</li>
              <li>• Place orders</li>
              <li>• View order history</li>
              <li>• Track order status</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-gray-900">Analytics</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Total revenue tracking</li>
              <li>• Order statistics</li>
              <li>• Popular items</li>
              <li>• Status breakdown</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-gray-900">Tech Stack</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• React + TypeScript</li>
              <li>• TailwindCSS</li>
              <li>• Supabase Backend</li>
              <li>• Role-based access</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-900">
            <strong>Getting Started:</strong> Use the demo credentials on the login page to explore
            the system. Admin accounts can manage the menu and orders, while employees can browse
            and place orders.
          </p>
        </div>
      </div>
    </div>
  );
}
