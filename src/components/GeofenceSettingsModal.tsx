import React from 'react';
import { 
  X, 
  MapPin, 
  Compass, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Sliders, 
  Navigation, 
  ShieldCheck, 
  Building2, 
  Check, 
  Crosshair 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { PRESET_SIMULATED_LOCATIONS } from '../utils/geoUtils';

interface GeofenceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeofenceSettingsModal: React.FC<GeofenceSettingsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const {
    geoSettings,
    geoLocationState,
    updateGeoSettings,
    requestUserLocation,
    setSimulatedLocation,
    distanceToCurrentChurch,
    isWithinCurrentChurchGeofence,
    organizations,
    currentOrg,
    setCurrentOrgId,
  } = useClub();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Geofencing & Territory Settings</h3>
              <p className="text-xs text-blue-200">
                Location-Aware Church Discovery & Event Check-In Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Status Strip */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${
              geoLocationState.status === 'simulated' ? 'text-amber-500 animate-pulse' :
              geoLocationState.status === 'granted' ? 'text-emerald-500' : 'text-slate-400'
            }`} />
            <span>
              Status: <strong className="text-slate-900 capitalize">{geoLocationState.status}</strong>
              {geoSettings.simulatedLocation && (
                <span className="text-blue-900 font-semibold ml-1">
                  ({geoSettings.simulatedLocation.name})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {distanceToCurrentChurch !== null ? (
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                isWithinCurrentChurchGeofence 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {distanceToCurrentChurch} mi from {currentOrg.churchName.split(' ')[0]} {isWithinCurrentChurchGeofence ? '✓ In Geofence' : '⚠ Outside Geofence'}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">No coordinates active</span>
            )}
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Main Geofence Toggle */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm text-slate-900 block">
                  Enable Geofenced Church Scoping
                </strong>
                <p className="text-xs text-slate-500">
                  Automatically prioritize or filter churches and attendance events according to your location.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={geoSettings.enabled}
                  onChange={(e) => updateGeoSettings({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>

            {/* Radius Selector */}
            {geoSettings.enabled && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="font-semibold text-slate-800 block">
                  Geofence Radius Territory Limit:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '10 Miles (Parish)', value: 10 },
                    { label: '25 Miles (District)', value: 25 },
                    { label: '50 Miles (Region)', value: 50 },
                    { label: 'All Churches', value: 0 },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateGeoSettings({ maxDistanceMiles: option.value })}
                      className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
                        geoSettings.maxDistanceMiles === option.value
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Location Inputs (Real GPS vs Simulation) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-blue-900" />
              Set or Simulate Location
            </h4>
            <p className="text-xs text-slate-500">
              You can use your device's actual GPS or click a test location to simulate walking onto church grounds.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={requestUserLocation}
                disabled={geoLocationState.status === 'requesting'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>
                  {geoLocationState.status === 'requesting' ? 'Requesting GPS...' : 'Detect Real Device Location'}
                </span>
              </button>

              {geoSettings.simulatedLocation && (
                <button
                  type="button"
                  onClick={() => setSimulatedLocation(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Clear Simulation
                </button>
              )}
            </div>

            {geoLocationState.errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{geoLocationState.errorMsg} Use simulated locations below to test.</span>
              </div>
            )}

            {/* Simulation Location Cards */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                1-Click Preset Test Locations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_SIMULATED_LOCATIONS.map(preset => {
                  const isCurrent = geoSettings.simulatedLocation?.name === preset.name;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSimulatedLocation({
                          name: preset.name,
                          latitude: preset.latitude,
                          longitude: preset.longitude,
                        });
                        if (preset.expectedChurchId) {
                          setCurrentOrgId(preset.expectedChurchId);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-900 bg-blue-50 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 font-bold block">{preset.name}</strong>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Event Attendance Check-In Geofence */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <strong className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Enforce Event Attendance Geofence
                </strong>
                <p className="text-[11px] text-amber-900">
                  When enabled, youth & leaders must be physically within 800m of the church or campsite to check in for real-time meetings.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={geoSettings.enforceAttendanceGeofence}
                  onChange={(e) => updateGeoSettings({ enforceAttendanceGeofence: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-amber-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Section 4: Live Proximity Radar List */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-900" />
              Proximity to Churches in Directory
            </h4>

            <div className="space-y-2">
              {organizations.map(org => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <div
                    key={org.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isSelected ? 'border-blue-900 bg-blue-50/60' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">{org.churchName}</strong>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-white">
                            Selected Church
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {org.clubName} · {org.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => setCurrentOrgId(org.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Select Church
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
