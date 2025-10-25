import { MessageCircle, Store } from 'lucide-react';

export default function RestaurantPanel({ currentUser, restaurants, orders, onAddChat }) {
  const myRestaurantId = currentUser.restaurantId;
  const myOrders = orders.filter((o) => o.restaurantId === myRestaurantId);
  const me = restaurants.find((r) => r.id === myRestaurantId);

  return (
    <section aria-labelledby="restaurant-panel-title" className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 id="restaurant-panel-title" className="text-lg font-semibold text-slate-800">Restaurant Dashboard</h2>
        <div className="text-xs text-slate-600 inline-flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" /> {me?.name || 'Your restaurant'}
        </div>
      </div>

      {myOrders.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {myOrders.map((o) => (
            <li key={o.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Order {o.id}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{o.status}</span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-600 mb-1">Public chat with customer</p>
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
                <ChatInput onSend={(text) => onAddChat(o.id, { senderRole: 'Restaurant', senderName: me?.name || 'Restaurant', text, ts: Date.now() })} />
              </div>
            </li>
          ))}
        </ul>
      )}
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
      aria-label="Send message to customer"
    >
      <label className="sr-only" htmlFor="chatText">Message</label>
      <input id="chatText" name="chatText" className="border rounded px-3 py-2 w-full" placeholder="Message..." />
      <button className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800">
        <MessageCircle className="w-4 h-4" /> Send
      </button>
    </form>
  );
}
