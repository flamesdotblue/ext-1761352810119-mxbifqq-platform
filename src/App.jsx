import { useMemo, useState } from 'react';
import HeaderControls from './components/HeaderControls.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import UserPanel from './components/UserPanel.jsx';
import DeliveryPanel from './components/DeliveryPanel.jsx';
import RestaurantPanel from './components/RestaurantPanel.jsx';

// Haversine formula to compute distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Sample seed data for restaurants in Delhi
const seedRestaurants = [
  { id: 'r1', name: 'Delhi Spice House', cuisine: 'North Indian', lat: 28.6139, lon: 77.209, rating: 4.4 },
  { id: 'r2', name: "Khan Chacha Grill", cuisine: 'Mughlai', lat: 28.6024, lon: 77.2263, rating: 4.2 },
  { id: 'r3', name: 'Saravana Bhavan CP', cuisine: 'South Indian', lat: 28.6329, lon: 77.2195, rating: 4.3 },
  { id: 'r4', name: 'Wok in the Clouds', cuisine: 'Asian', lat: 28.6562, lon: 77.241, rating: 4.1 },
  { id: 'r5', name: 'Biryani Blues', cuisine: 'Biryani', lat: 28.6448, lon: 77.2167, rating: 4.0 },
  { id: 'r6', name: 'SodaBottleOpenerWala', cuisine: 'Parsi', lat: 28.6289, lon: 77.2196, rating: 4.2 },
  { id: 'r7', name: 'Haldirams Chandni Chowk', cuisine: 'Veg Multi-cuisine', lat: 28.655, lon: 77.2303, rating: 4.1 },
  { id: 'r8', name: 'Andhra Bhavan Canteen', cuisine: 'Andhra', lat: 28.6146, lon: 77.2066, rating: 4.5 },
  { id: 'r9', name: 'Karims Jama Masjid', cuisine: 'Mughlai', lat: 28.6509, lon: 77.2336, rating: 4.3 },
  { id: 'r10', name: 'Sagar Ratna GK', cuisine: 'South Indian', lat: 28.5535, lon: 77.2409, rating: 4.0 },
];

const seedUsers = [
  { id: 'u1', username: 'priya', name: 'Priya Narang', role: 'User', wallet: 250, lat: 28.6139, lon: 77.209 },
  { id: 'u2', username: 'arjun', name: 'Arjun Mehra', role: 'Restaurant', restaurantId: 'r1' },
  { id: 'u3', username: 'ravi', name: 'Ravi Singh', role: 'Delivery', active: true },
  { id: 'u4', username: 'admin', name: 'PN Admin', role: 'Admin' },
];

const seedOrders = [
  {
    id: 'o1',
    userId: 'u1',
    restaurantId: 'r1',
    items: [
      { name: 'Paneer Butter Masala', qty: 1, price: 240 },
      { name: 'Butter Naan', qty: 2, price: 50 },
    ],
    status: 'Assigned', // Created -> Accepted -> Preparing -> OutForDelivery -> Assigned -> Delivered
    deliveryPartnerId: 'u3',
    userLocation: { lat: 28.617, lon: 77.2095 },
    otp: '549213',
    chat: [
      { id: 'c1', senderRole: 'Restaurant', senderName: 'Delhi Spice House', text: 'Order accepted, preparing now!', ts: Date.now() - 1000 * 60 * 10 },
      { id: 'c2', senderRole: 'User', senderName: 'Priya', text: 'Please make it less spicy.', ts: Date.now() - 1000 * 60 * 9 },
    ],
  },
];

export default function App() {
  const [modes, setModes] = useState({ food: true, grocery: false, delivery: true });
  const [users, setUsers] = useState(seedUsers);
  const [restaurants, setRestaurants] = useState(seedRestaurants);
  const [orders, setOrders] = useState(seedOrders);
  const [currentUserId, setCurrentUserId] = useState('u1');

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || users[0], [users, currentUserId]);

  // Role-based guards
  const canManageAll = currentUser?.role === 'Admin';
  const isRestaurant = currentUser?.role === 'Restaurant';
  const isUser = currentUser?.role === 'User';
  const isDelivery = currentUser?.role === 'Delivery';

  const updateModes = (next) => setModes((m) => ({ ...m, ...next }));

  const updateUser = (id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const addOrderChat = (orderId, message) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, chat: [...o.chat, { ...message, id: `c${o.chat.length + 1}` }] } : o)));
  };

  const completeDeliveryWithOTP = (orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'Delivered' } : o)));
  };

  const assignDeliveryPartner = (orderId, deliveryPartnerId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, deliveryPartnerId, status: 'Assigned' } : o)));
  };

  const createOrder = ({ userId, restaurantId, items, userLocation }) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const id = 'o' + (orders.length + 1);
    const newOrder = { id, userId, restaurantId, items, status: 'Created', userLocation, otp, chat: [] };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const computeOrderDistance = (order) => {
    const rest = restaurants.find((r) => r.id === order.restaurantId);
    if (!rest || !order.userLocation) return 0;
    return haversineDistance(rest.lat, rest.lon, order.userLocation.lat, order.userLocation.lon);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderControls
        currentUser={currentUser}
        users={users}
        onSwitchUser={setCurrentUserId}
        modes={modes}
        onUpdateModes={canManageAll ? updateModes : undefined}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {canManageAll && (
          <AdminPanel
            users={users}
            onUsersChange={setUsers}
            restaurants={restaurants}
            onRestaurantsChange={setRestaurants}
            orders={orders}
            onOrdersChange={setOrders}
            modes={modes}
            onUpdateModes={updateModes}
            assignDeliveryPartner={assignDeliveryPartner}
            computeOrderDistance={computeOrderDistance}
          />
        )}

        {isRestaurant && (
          <RestaurantPanel
            currentUser={currentUser}
            restaurants={restaurants}
            orders={orders}
            onAddChat={addOrderChat}
          />
        )}

        {isUser && (
          <UserPanel
            currentUser={currentUser}
            restaurants={restaurants}
            orders={orders}
            onCreateOrder={createOrder}
            onAddChat={addOrderChat}
            updateUser={updateUser}
          />
        )}

        {isDelivery && (
          <DeliveryPanel
            currentUser={currentUser}
            orders={orders}
            onCompleteDelivery={completeDeliveryWithOTP}
            computeOrderDistance={computeOrderDistance}
          />
        )}
      </main>

      <footer className="border-t bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-slate-600 flex items-center justify-between">
          <p>PN'S Delivery MVP • Accessible • Secure-by-default</p>
          <p aria-label="app-modes" className="flex gap-3">
            <span className={modes.food ? 'text-emerald-600 font-medium' : 'text-slate-400'}>Food</span>
            <span className={modes.grocery ? 'text-emerald-600 font-medium' : 'text-slate-400'}>Grocery</span>
            <span className={modes.delivery ? 'text-emerald-600 font-medium' : 'text-slate-400'}>Delivery</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
