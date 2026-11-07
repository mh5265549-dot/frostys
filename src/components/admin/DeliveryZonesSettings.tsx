import React, { useState } from 'react';
import {
  getDeliveryZones,
  saveDeliveryZones,
  DeliveryZoneConfig,
  getStoreOperationalSettings,
  saveStoreOperationalSettings,
  StoreOperationalSettings,
} from '../../utils/operationalStore';

interface DeliveryZonesSettingsProps {
  onSettingsChanged?: () => void;
}

export const DeliveryZonesSettings: React.FC<DeliveryZonesSettingsProps> = ({
  onSettingsChanged,
}) => {
  const [zones, setZones] = useState<DeliveryZoneConfig[]>(() => getDeliveryZones());
  const [storeSettings, setStoreSettings] = useState<StoreOperationalSettings>(() =>
    getStoreOperationalSettings()
  );

  // New Zone Form
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState<number | ''>(100);
  const [newZoneMinOrder, setNewZoneMinOrder] = useState<number | ''>(0);
  const [newZoneThreshold, setNewZoneThreshold] = useState<number | ''>(1500);
  const [newZoneTime, setNewZoneTime] = useState('30-40 mins');
  const [newZoneNote, setNewZoneNote] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStoreOpen = () => {
    const nextClosed = !storeSettings.isStoreManuallyClosed;
    const updated = saveStoreOperationalSettings({ isStoreManuallyClosed: nextClosed });
    setStoreSettings(updated);
    showToast(
      nextClosed
        ? '🔴 Store is now CLOSED. Online ordering paused for customers.'
        : '🟢 Store is now OPEN. Live online orders enabled!'
    );
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleUpdateStoreReason = (reason: string) => {
    const updated = saveStoreOperationalSettings({ closedReason: reason });
    setStoreSettings(updated);
  };

  const handleToggleZone = (zoneId: string, currentActive: boolean) => {
    const updated = zones.map((z) => (z.id === zoneId ? { ...z, isActive: !currentActive } : z));
    setZones(updated);
    saveDeliveryZones(updated);
    showToast(`Updated active status for zone.`);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleUpdateZoneFee = (zoneId: string, newFee: number) => {
    const updated = zones.map((z) => (z.id === zoneId ? { ...z, fee: Math.max(0, newFee) } : z));
    setZones(updated);
    saveDeliveryZones(updated);
    showToast('Delivery fee updated.');
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const newZone: DeliveryZoneConfig = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      fee: typeof newZoneFee === 'number' ? newZoneFee : 100,
      minOrder: typeof newZoneMinOrder === 'number' ? newZoneMinOrder : 0,
      freeDeliveryThreshold: typeof newZoneThreshold === 'number' ? newZoneThreshold : 1500,
      isActive: true,
      estimatedMins: newZoneTime.trim() || '30-45 mins',
      note: newZoneNote.trim(),
    };

    const updated = [...zones, newZone];
    setZones(updated);
    saveDeliveryZones(updated);
    setIsAddingZone(false);
    setNewZoneName('');
    setNewZoneNote('');
    showToast(`Added new delivery zone "${newZone.name}"!`);
    if (onSettingsChanged) onSettingsChanged();
  };

  const handleDeleteZone = (zoneId: string) => {
    const updated = zones.filter((z) => z.id !== zoneId);
    setZones(updated);
    saveDeliveryZones(updated);
    showToast('Zone removed.');
    if (onSettingsChanged) onSettingsChanged();
  };

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-amber-400"></i>
            <span>Delivery Zones & Branch Settings</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Turn your store open or closed, set neighborhood delivery fees (e.g. Green City, Paragon City), and set free delivery rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingZone(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>Add Delivery Area</span>
          </button>
        </div>
      </div>

      {/* 1. MASTER SWITCH: STORE OPEN / STORE CLOSED */}
      <div className="p-5 rounded-3xl bg-[#1C1210] border-2 border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                storeSettings.isStoreManuallyClosed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <i className={`fa-solid ${storeSettings.isStoreManuallyClosed ? 'fa-store-slash' : 'fa-store'}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-black text-base sm:text-lg text-stone-100">
                  Master Store Availability Switch
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    storeSettings.isStoreManuallyClosed
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {storeSettings.isStoreManuallyClosed ? '🔴 STORE PAUSED / CLOSED' : '🟢 STORE ONLINE & ACCEPTING ORDERS'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                When switched off, the customer storefront automatically pauses checkout and displays your custom offline message.
              </p>
            </div>
          </div>

          {/* Big Master Toggle Button */}
          <button
            type="button"
            onClick={handleToggleStoreOpen}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
              storeSettings.isStoreManuallyClosed
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110 shadow-emerald-950/50'
                : 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:brightness-110 shadow-rose-950/50'
            }`}
          >
            <i className={`fa-solid ${storeSettings.isStoreManuallyClosed ? 'fa-toggle-on' : 'fa-toggle-off'} text-base`}></i>
            <span>{storeSettings.isStoreManuallyClosed ? 'Turn Store Back ON' : 'Pause Store Orders'}</span>
          </button>
        </div>

        {/* Offline Reason & Message Input */}
        <div>
          <label className="text-xs font-bold text-stone-300 block mb-1">
            Customer-Facing Store Status Announcement:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={storeSettings.closedReason}
              onChange={(e) => handleUpdateStoreReason(e.target.value)}
              placeholder="e.g. Kitchen currently preparing for evening rush. Back online at 5:00 PM!"
              className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => showToast('Announcement message updated.')}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 cursor-pointer"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE DELIVERY ZONE MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-black text-sm sm:text-base text-stone-200 flex items-center gap-2">
            <i className="fa-solid fa-location-crosshairs text-blue-400"></i>
            <span>Active Delivery Neighborhoods & Fee Rules ({zones.length} Zones)</span>
          </h4>
          <span className="text-xs text-stone-400">
            Radius calibrated around Green City Commercial, Lahore
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                zone.isActive
                  ? 'bg-[#181110] border-stone-800 shadow-md'
                  : 'bg-stone-950/40 border-stone-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-black text-sm text-stone-100 truncate">
                    {zone.name}
                  </h5>
                  <button
                    type="button"
                    onClick={() => handleToggleZone(zone.id, zone.isActive)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer border ${
                      zone.isActive
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    {zone.isActive ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <div className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-clock text-[10px] text-amber-400"></i>
                  <span>ETA: {zone.estimatedMins}</span>
                </div>

                {zone.note && (
                  <p className="text-[11px] text-stone-400 mt-1 italic">
                    {zone.note}
                  </p>
                )}
              </div>

              {/* Fee & Min Order Settings */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">Delivery Fee:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400 font-mono">Rs.</span>
                    <input
                      type="number"
                      min={0}
                      value={zone.fee}
                      onChange={(e) => handleUpdateZoneFee(zone.id, Number(e.target.value))}
                      className="w-16 px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-amber-300 text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {zone.freeDeliveryThreshold !== undefined && zone.freeDeliveryThreshold > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Free Delivery Threshold:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      &gt; Rs. {zone.freeDeliveryThreshold}
                    </span>
                  </div>
                )}

                {zone.minOrder > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Min. Order Requirement:</span>
                    <span className="font-mono text-amber-300">
                      Rs. {zone.minOrder}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleZone(zone.id, zone.isActive)}
                  className={`text-[11px] font-bold cursor-pointer ${
                    zone.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {zone.isActive ? 'Disable Neighborhood' : 'Enable Neighborhood'}
                </button>
                {zone.id !== 'greencity' && zone.id !== 'paragon' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-stone-500 hover:text-rose-400 text-xs cursor-pointer"
                    title="Remove custom neighborhood"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD ZONE MODAL */}
      {isAddingZone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1C1210] text-stone-100 w-full max-w-md rounded-3xl border border-amber-500/50 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="font-heading font-black text-base text-amber-200">
                Add New Delivery Neighborhood
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingZone(false)}
                className="text-stone-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Neighborhood Name
                </label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. DHA Phase 8, Cantt, Barki Road"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Free Delivery Threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newZoneThreshold}
                    onChange={(e) => setNewZoneThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={newZoneTime}
                  onChange={(e) => setNewZoneTime(e.target.value)}
                  placeholder="e.g. 35-45 mins"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Zone Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newZoneNote}
                  onChange={(e) => setNewZoneNote(e.target.value)}
                  placeholder="e.g. Rider entrance via Gate 3"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddingZone(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-md cursor-pointer"
                >
                  Save Neighborhood
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
