import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  X,
  ShieldCheck,
  UserPlus,
  LogIn,
  LogOut,
  Compass,
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { auth, db } from '../firebase';
import { AuthUser, UserRole } from '../types/club';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with that email already exists — try signing in instead.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, organizations, currentOrgId } = useClub();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign-in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Club Director');
  const [selectedOrgId, setSelectedOrgId] = useState(currentOrgId);
  const [isMasterGuide, setIsMasterGuide] = useState(true);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    try {
      await signInWithEmailAndPassword(auth, signInEmail.trim(), signInPassword);
      onClose();
    } catch (err) {
      setSignInError(friendlyAuthError(err));
    } finally {
      setSignInLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setRegisterError('Please fill in your name, email, and a password of at least 6 characters.');
      return;
    }
    setRegisterError('');
    setRegisterLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const profile: Omit<AuthUser, 'id'> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        orgId: selectedOrgId,
        investedMasterGuide: isMasterGuide,
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      onClose();
    } catch (err) {
      setRegisterError(friendlyAuthError(err));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
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
              onClick={handleSignOut}
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
            onClick={() => setActiveTab('signin')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'signin'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
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
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <p className="text-xs text-slate-500">
                Sign in with your leader email & password to access attendance, member review, and settings.
              </p>

              {signInError && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {signInError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="leader@sda.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm"
                >
                  {signInLoading ? 'Signing In…' : 'Sign In'}
                </button>
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
            </form>
          ) : (
            /* Register Leader Form */
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {registerError && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {registerError}
                </div>
              )}

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
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  onClick={() => setActiveTab('signin')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm"
                >
                  {registerLoading ? 'Creating Account…' : 'Register & Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
