import { CheckCircle, MapPin, Truck } from 'lucide-react';

export default function DeliveryPanel({ currentUser, orders, onCompleteDelivery, computeOrderDistance }) {
  const myOrders = orders.filter((o) => o.deliveryPartnerId === currentUser.id && o.status !== 'Delivered');

  const ratePerKm = 10; // INR per km
  const baseFare = 30; // INR base

  const tryComplete = (orderId, otpInput, otpActual) => {
    if (otpInput === otpActual) {
      onCompleteDelivery(orderId);
      alert('Delivery verified via OTP. Good job!');
    } else {
      alert('Invalid OTP. Please re-check with the customer.');
    }
  };

  return (
    <section aria-labelledby="delivery-panel-title" className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 id="delivery-panel-title" className="text-lg font-semibold text-slate-800">Delivery Partner</h2>
        <div className="text-xs text-slate-600 inline-flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" /> Distance-based payouts (OSM coords)
        </div>
      </div>

      {myOrders.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">No active deliveries assigned.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {myOrders.map((o) => {
            const distanceKm = computeOrderDistance(o);
            const payout = baseFare + distanceKm * ratePerKm;
            return (
              <li key={o.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Order {o.id}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{o.status}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1 inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Distance: <strong className="ml-1">{distanceKm.toFixed(2)} km</strong> • Payout: <strong>₹{payout.toFixed(2)}</strong>
                </p>

                <form
                  className="mt-3 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const otp = String(fd.get('otp'));
                    tryComplete(o.id, otp, o.otp);
                  }}
                  aria-label={`Complete delivery for ${o.id} with OTP`}
                >
                  <label htmlFor={`otp-${o.id}`} className="sr-only">Enter OTP</label>
                  <input id={`otp-${o.id}`} name="otp" inputMode="numeric" pattern="\\d*" maxLength={6} className="border rounded px-3 py-2 w-40 tracking-widest font-mono" placeholder="Enter OTP" />
                  <button className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4" /> Verify & Complete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
