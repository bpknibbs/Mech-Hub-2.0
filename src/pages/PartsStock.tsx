import React, { useEffect, useState } from 'react';
import { PlusIcon, CubeIcon, ExclamationTriangleIcon, TruckIcon } from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAutomation } from '../contexts/AutomationContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface StockItem {
  id: string;
  item: string;
  current: number;
  minimum: number;
  urgent: boolean;
}

interface Transaction {
  id: string;
  item: string;
  type: 'Used' | 'Received';
  quantity: number;
  date: string;
  job?: string;
  technician?: string;
  supplier?: string;
  reference?: string;
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: number;
  value: string;
  status: string;
  expectedDate: string;
  trackingNumber: string | null;
}

export default function PartsStock() {
  const { stockAlerts } = useAutomation();
  const activeStockAlerts = stockAlerts.filter(alert => alert.urgency === 'high' || alert.urgency === 'critical');
  const [stockCategories, setStockCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartsData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('parts_categories')
          .select('*');

        const { data: transactionsData, error: transactionsError } = await supabase
          .from('stock_movements')
          .select('*')
          .order('date', { ascending: false });

        const { data: ordersData, error: ordersError } = await supabase
          .from('pending_orders')
          .select('*')
          .order('expectedDate', { ascending: true });

        if (categoriesError) throw categoriesError;
        if (transactionsError) throw transactionsError;
        if (ordersError) throw ordersError;

        setStockCategories(categoriesData);
        setRecentTransactions(transactionsData);
        setPendingOrders(ordersData);
      } catch (error) {
        console.error('Error fetching parts data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartsData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parts & Stock Management</h1>
          <p className="mt-2 text-gray-600">
            Track inventory, manage stock levels, and coordinate parts procurement
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <TruckIcon className="h-5 w-5 mr-2" />
            New Order
          </Button>
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stock Alerts */}
      {activeStockAlerts.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-medium text-red-900">Automated Low Stock Alerts</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {activeStockAlerts.length} Active
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activeStockAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg ${alert.urgency === 'critical' ? 'bg-red-100 border border-red-300' : 'bg-orange-100 border border-orange-300'}`}>
                <p className={`font-medium ${alert.urgency === 'critical' ? 'text-red-900' : 'text-orange-900'}`}>
                  {alert.itemName}
                </p>
                <p className={`text-sm ${alert.urgency === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                  {alert.currentStock} of {alert.minimumLevel} minimum
                </p>
                {alert.autoReorderEnabled && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Auto-reorder: {alert.suggestedQuantity} units
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inventory Categories */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stockCategories.map((category) => (
          <Card key={category.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${category.bgColor}`}>
                <CubeIcon className={`h-6 w-6 ${category.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="text-gray-900 font-medium">{category.items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Value:</span>
                <span className="text-gray-900 font-medium">{category.value}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock:</span>
                <span className={`font-medium ${category.lowStock > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {category.lowStock}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 mt-4">
              <Button size="sm" variant="outline" className="w-full">
                View Inventory
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Stock Movements</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'Used' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <CubeIcon className={`h-4 w-4 ${
                    transaction.type === 'Used' ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{transaction.item}</p>
                    <span className={`text-sm font-medium ${
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.job ? `Job: ${transaction.job} (${transaction.technician})` : 
                     `From: ${transaction.supplier} (${transaction.reference})`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Orders</h3>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{order.supplier}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{order.items} items • {order.value}</span>
                  <span>Due: {new Date(order.expectedDate).toLocaleDateString()}</span>
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-blue-600 mt-1">Tracking: {order.trackingNumber}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stock Summary Cards (left as is since they are static/mock data summaries) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Items</span>
              <span className="text-2xl font-bold text-gray-900">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="text-lg font-semibold text-green-600">£68,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock Items</span>
              <span className="text-lg font-semibold text-red-600">28</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">This Month</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Items Used</span>
              <span className="text-lg font-semibold text-blue-600">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Items Received</span>
              <span className="text-lg font-semibold text-green-600">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Orders Placed</span>
              <span className="text-lg font-semibold text-purple-600">12</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">HVAC Supplies Ltd</span>
              <span className="text-sm font-medium text-gray-900">£12,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pump Specialists</span>
              <span className="text-sm font-medium text-gray-900">£8,750</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Control Systems Pro</span>
              <span className="text-sm font-medium text-gray-900">£6,200</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="w-full">
              Generate Stock Report
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              Audit Inventory
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              Update Min Levels
            </Button>
            <Button size="sm" className="w-full">
              Emergency Order
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}