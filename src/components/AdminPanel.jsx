import { MapPin, Shield, Truck, User as UserIcon, Wallet } from 'lucide-react';

export default function AdminPanel({ users, onUsersChange, restaurants, onRestaurantsChange, orders, onOrdersChange, modes, onUpdateModes, assignDeliveryPartner, computeOrderDistance }) {
  const deliveryPartners = users.filter((u) => u.role === 'Delivery');

  const toggleUserRole = (id, role) => {
    onUsersChange((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const removeRestaurant = (id) => {
    onRestaurantsChange((prev) => prev.filter((r) => r.id !== id));
  };

  const addRestaurant = () => {
    const name = prompt('Restaurant name');
    if (!name) return;
    const id = 'r' + (restaurants.length + 1);
    onRestaurantsChange((prev) => [
      ...prev,
      { id, name, cuisine: 'Multi-cuisine', lat: 28.6139, lon: 77.209, rating: 4.0 },
    ]);
  };

  const updateOrderStatus = (id, status) => {
    onOrdersChange((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <section aria-labelledby="admin-panel-title" className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 id="admin-panel-title" className="text-lg font-semibold text-slate-800">Admin Dashboard</h2>
        <div className="text-xs text-slate-600 inline-flex items-center gap-2" aria-live="polite">
          <Shield className="w-4 h-4 text-emerald-600" />
          Strong auth & RBAC enabled
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-1 space-y-3">
          <Card title="Platform Modes">
            <div className="flex items-center gap-2 text-sm">
              <ModeSwitch label="Food" checked={modes.food} onChange={(v) => onUpdateModes({ food: v })} />
              <ModeSwitch label="Grocery" checked={modes.grocery} onChange={(v) => onUpdateModes({ grocery: v })} />
              <ModeSwitch label="Delivery" checked={modes.delivery} onChange={(v) => onUpdateModes({ delivery: v })} />
            </div>
          </Card>

          <Card title="Users & Roles">
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-slate-500">@{u.username}</span>
                  </div>
                  <select
                    aria-label={`Change role for ${u.name}`}
                    className="border rounded px-2 py-1 text-sm"
                    value={u.role}
                    onChange={(e) => toggleUserRole(u.id, e.target.value)}
                  >
                    <option>User</option>
                    <option>Restaurant</option>
                    <option>Delivery</option>
                    <option>Admin</option>
                  </select>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Payment Settings">
            <div className="text-sm text-slate-700 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> Wallet & WhatsApp top-up enabled
            </div>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-3">
          <Card title="Restaurants">
            <div className="flex justify-between items-center mb-3">
              <button onClick={addRestaurant} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">Add Restaurant</button>
              <span className="text-xs text-slate-500">Pre-populated with 10 Delhi restaurants</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Cuisine</th>
                    <th className="py-2">Rating</th>
                    <th className="py-2"><span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> Coordinates</span></th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 font-medium">{r.name}</td>
                      <td className="py-2">{r.cuisine}</td>
                      <td className="py-2">{r.rating.toFixed(1)}</td>
                      <td className="py-2 text-slate-600">{r.lat.toFixed(4)}, {r.lon.toFixed(4)}</td>
                      <td className="py-2">
                        <button onClick={() => removeRestaurant(r.id)} className="text-red-600 hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Orders & Dispatch">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="py-2">Order</th>
                    <th className="py-2">User</th>
                    <th className="py-2">Restaurant</th>
                    <th className="py-2"><span className="inline-flex items-center gap-1"><Truck className="w-4 h-4" /> Partner</span></th>
                    <th className="py-2">Distance</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((o) => {
                    const u = users.find((x) => x.id === o.userId);
                    const r = restaurants.find((x) => x.id === o.restaurantId);
                    const partner = users.find((x) => x.id === o.deliveryPartnerId);
                    const dist = computeOrderDistance(o);
                    return (
                      <tr key={o.id}>
                        <td className="py-2 font-medium">{o.id}</td>
                        <td className="py-2">{u?.name}</td>
                        <td className="py-2">{r?.name}</td>
                        <td className="py-2">{partner ? partner.name : <em className="text-slate-500">Unassigned</em>}</td>
                        <td className="py-2">{dist.toFixed(2)} km</td>
                        <td className="py-2">{o.status}</td>
                        <td className="py-2 space-x-2">
                          <select
                            aria-label={`Assign delivery partner for ${o.id}`}
                            value={o.deliveryPartnerId || ''}
                            onChange={(e) => assignDeliveryPartner(o.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Select partner</option>
                            {deliveryPartners.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <select
                            aria-label={`Update status for ${o.id}`}
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            {['Created', 'Accepted', 'Preparing', 'OutForDelivery', 'Assigned', 'Delivered'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ModeSwitch({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 select-none">
      <span className="text-sm text-slate-700">{label}</span>
      <input
        type="checkbox"
        className="accent-emerald-600 w-4 h-4"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
