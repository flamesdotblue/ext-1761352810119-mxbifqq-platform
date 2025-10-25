import { CheckCircle, MapPin, MessageCircle, Phone, Wallet } from 'lucide-react';

export default function UserPanel({ currentUser, restaurants, orders, onCreateOrder, onAddChat, updateUser }) {
  const myOrders = orders.filter((o) => o.userId === currentUser.id);

  const handleTopUp = (amount) => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;
    const msg = encodeURIComponent(`Wallet top-up request\nAmount: INR ${parsed}\nUsername: ${currentUser.username}\nName: ${currentUser.name}`);
    const phone = '918434805818'; // +91 8434805818
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener');
  };

  const placeSampleOrder = (restaurantId) => {
    const sampleItems = [
      { name: 'Veg Thali', qty: 1, price: 220 },
      { name: 'Masala Dosa', qty: 1, price: 160 },
    ];
    const userLocation = { lat: currentUser.lat || 28.6139, lon: currentUser.lon || 77.209 };
    onCreateOrder({ userId: currentUser.id, restaurantId, items: sampleItems, userLocation });
  };

  const walletBalance = typeof currentUser.wallet === 'number' ? currentUser.wallet : 0;

  return (
    <section aria-labelledby="user-panel-title" className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <h2 id="user-panel-title" className="text-lg font-semibold text-slate-800">User Dashboard</h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Wallet</span>
              </div>
              <span className="text-sm text-slate-600">INR {walletBalance.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <label htmlFor="topup" className="sr-only">Top up amount</label>
              <input id="topup" type="number" min="1" className="border rounded px-3 py-2 w-full" placeholder="Enter amount" />
              <button
                className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onClick={() => {
                  const el = document.getElementById('topup');
                  handleTopUp(el.value);
                }}
              >Top up via WhatsApp</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Secure redirect to WhatsApp with a pre-filled message. A human verifies and credits your wallet.</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Nearby Restaurants</h3>
            <ul className="space-y-2">
              {restaurants.slice(0, 10).map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.cuisine} • {r.rating.toFixed(1)} ★ • <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{r.lat.toFixed(2)}, {r.lon.toFixed(2)}</span></p>
                  </div>
                  <button
                    onClick={() => placeSampleOrder(r.id)}
                    className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs hover:bg-slate-800"
                  >Order sample</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700">Your Orders</h3>
            {myOrders.length === 0 && <p className="text-sm text-slate-500 mt-2">No orders yet.</p>}
            <ul className="mt-2 space-y-3">
              {myOrders.map((o) => (
                <li key={o.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Order {o.id}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{o.status}</span>
                  </div>
                  {o.otp && o.status !== 'Delivered' && (
                    <p className="mt-1 text-xs text-emerald-700 inline-flex items-center gap-1" aria-live="polite">
                      <CheckCircle className="w-4 h-4" /> Your delivery OTP: <span className="font-mono font-semibold">{o.otp}</span>
                    </p>
                  )}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-600 mb-1">Public chat with restaurant</p>
                    <div className="max-h-36 overflow-auto bg-slate-50 rounded p-2 border">
                      <ul className="space-y-1 text-sm">
                        {o.chat?.map((m) => (
                          <li key={m.id} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">[{new Date(m.ts).toLocaleTimeString()}]</span>
                            <span className="font-medium">{m.senderName}:</span>
                            <span>{m.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ChatInput onSend={(text) => onAddChat(o.id, { senderRole: 'User', senderName: currentUser.name, text, ts: Date.now() })} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a href="tel:+918434805818" className="inline-flex items-center gap-1 text-emerald-700 hover:underline text-sm">
                      <Phone className="w-4 h-4" /> Support
                    </a>
                    <span className="text-xs text-slate-500">For delivery updates, keep your phone handy.</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatInput({ onSend }) {
  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const text = fd.get('chatText');
        if (String(text).trim().length === 0) return;
        onSend(String(text));
        e.currentTarget.reset();
      }}
      aria-label="Send message to restaurant"
    >
      <label className="sr-only" htmlFor="chatText">Message</label>
      <input id="chatText" name="chatText" className="border rounded px-3 py-2 w-full" placeholder="Message..." />
      <button className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">
        <MessageCircle className="w-4 h-4" /> Send
      </button>
    </form>
  );
}
