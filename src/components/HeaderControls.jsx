import { Home, Settings, Shield, User as UserIcon } from 'lucide-react';

export default function HeaderControls({ currentUser, users, onSwitchUser, modes, onUpdateModes }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Top navigation">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 text-emerald-700">
            <Home aria-hidden className="w-5 h-5" />
            <span className="font-semibold">PN'S Delivery</span>
          </div>
          <span className="sr-only">Primary brand</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" role="group" aria-label="Mode toggles">
            <Toggle label="Food" checked={modes.food} onChange={onUpdateModes ? (v) => onUpdateModes({ food: v }) : undefined} />
            <Toggle label="Grocery" checked={modes.grocery} onChange={onUpdateModes ? (v) => onUpdateModes({ grocery: v }) : undefined} />
            <Toggle label="Delivery" checked={modes.delivery} onChange={onUpdateModes ? (v) => onUpdateModes({ delivery: v }) : undefined} />
          </div>

          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-500" aria-hidden />
            <label htmlFor="switch-user" className="sr-only">Switch user</label>
            <select
              id="switch-user"
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={currentUser?.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              aria-label="Switch current user to view role-based panels"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
          </div>

          <span className="inline-flex items-center gap-1 text-xs text-slate-600" aria-live="polite">
            <Shield className="w-4 h-4 text-emerald-600" />
            RBAC Active
          </span>
          <Settings className="w-5 h-5 text-slate-500" aria-hidden />
        </div>
      </div>
    </header>
  );
}

function Toggle({ label, checked, onChange }) {
  const isDisabled = typeof onChange !== 'function';
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={`Toggle ${label}`}
      aria-disabled={isDisabled}
      onClick={() => !isDisabled && onChange(!checked)}
      className={`relative inline-flex items-center h-8 rounded-full px-3 text-xs font-medium transition ${
        checked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'}`}
    >
      {label}
    </button>
  );
}
