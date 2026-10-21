import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  UserPlus, 
  CheckCircle2, 
  Compass, 
  Building2, 
  Sparkles, 
  LogOut, 
  Layers 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { AuthUser, UserRole } from '../types/club';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    staffUsers, 
    organizations, 
    currentOrgId, 
    setCurrentOrgId, 
    loginUser, 
    logoutUser, 
    registerLeader 
  } = useClub();

  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Club Director');
  const [selectedOrgId, setSelectedOrgId] = useState(currentOrgId);
  const [isMasterGuide, setIsMasterGuide] = useState(true);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    registerLeader({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      orgId: selectedOrgId,
      investedMasterGuide: isMasterGuide,
    });

    onClose();
  };

  const handleSelectUser = (user: AuthUser) => {
    loginUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Leadership & Admin Authentication</h3>
              <p className="text-xs text-blue-200">
                Mission · District · Church · Club Directorate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Ribbon */}
        {currentUser && (
          <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Signed in as: <strong className="text-slate-900">{currentUser.name}</strong></span>
              <span className="px-2 py-0.5 rounded-full bg-blue-900 text-white font-semibold text-[10px]">
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={() => {
                logoutUser();
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'switch'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Select Leadership Role</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Leader</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Select an authentic leader profile to experience how different administrative levels see the portal:
              </p>

              <div className="space-y-2">
                {staffUsers.map((user) => {
                  const org = organizations.find(o => o.id === user.orgId);
                  const isCurrent = currentUser?.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          user.role === 'Mission Youth Director'
                            ? 'bg-purple-100 text-purple-900'
                            : user.role === 'District Coordinator'
                            ? 'bg-amber-100 text-amber-900'
                            : user.role === 'Club Director'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                            {user.investedMasterGuide && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                                Master Guide
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 block">{user.email}</span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            {user.role} · {user.role.includes('Mission') ? 'Cascade Mission' : org?.churchName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold text-blue-900 hover:underline">
                            Switch Role →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hierarchy explanation card */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600" />
                  SDA Youth Ministries Administrative Levels:
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>Mission/Conference</strong> oversees District Charters & Insurance · <strong>District</strong> unites local church clubs for joint rallies & camporees · <strong>Church Pastor & Board</strong> sponsors the club · <strong>Club Director</strong> manages roster, attendance & uniform inductions · <strong>Counselors</strong> lead individual units.
                </p>
              </div>
            </div>
          ) : (
            /* Register Leader Form */
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sister Brenda Adams, MG"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leader@sda.org"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Administrative Level & Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    <option value="Club Director">Club Director (Local Church)</option>
                    <option value="Club Secretary">Club Secretary / Scribe</option>
                    <option value="Unit Counselor">Unit Counselor</option>
                    <option value="Church Pastor">Church Pastor / Youth Elder</option>
                    <option value="District Coordinator">District Coordinator</option>
                    <option value="Mission Youth Director">Mission / Conference Youth Director</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Church / Club
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.churchName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMasterGuide}
                    onChange={(e) => setIsMasterGuide(e.target.checked)}
                    className="rounded text-blue-900 focus:ring-blue-900"
                  />
                  <span className="font-semibold text-slate-800">
                    Invested Master Guide (SDA Youth Leadership Certification)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Register & Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
