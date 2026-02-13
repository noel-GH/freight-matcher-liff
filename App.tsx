
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { CONFIG, CARGO_TYPES } from './constants';
import { LineProfile } from './types';
import { 
  Truck, 
  MapPin, 
  Package, 
  Weight, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    cargoType: CARGO_TYPES[0],
    weight: '',
    photoName: ''
  });

  const initLiff = useCallback(async () => {
    try {
      setLoading(true);
      await window.liff.init({ liffId: CONFIG.LIFF_ID });
      
      if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }

      const userProfile = await window.liff.getProfile();
      setProfile(userProfile);
    } catch (err: any) {
      console.error('LIFF Init Error:', err);
      setError('Failed to initialize LINE LIFF. Please ensure the LIFF ID is correct.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initLiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSubmitting(true);
      setError(null);

      // 1. Upsert User
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          user_id: profile.userId,
          display_name: profile.displayName,
          role: 'customer'
        }, { onConflict: 'user_id' });

      if (userError) throw userError;

      // 2. Insert Freight Request
      const { error: requestError } = await supabase
        .from('requests')
        .insert({
          customer_id: profile.userId,
          pickup_loc: formData.pickup,
          dropoff_loc: formData.dropoff,
          weight: formData.weight,
          cargo_type: formData.cargoType,
          photo_url: formData.photoName,
          status: 'open'
        });

      if (requestError) throw requestError;

      setSuccess(true);
      
      // Auto close window after short delay
      setTimeout(() => {
        if (window.liff.isInClient()) {
          window.liff.closeWindow();
        } else {
          alert("Request submitted successfully! (Running in browser, window won't close automatically)");
        }
      }, 2000);

    } catch (err: any) {
      console.error('Submission Error:', err);
      setError(err.message || 'An error occurred while submitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, photoName: e.target.files![0].name }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Initializing FreightForward...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
        <p className="text-gray-600">Your freight request has been sent to our agents. You will be notified of incoming bids shortly.</p>
        <p className="mt-8 text-sm text-gray-400">Closing window...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">FreightForward</h1>
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              <img 
                src={profile.pictureUrl || 'https://picsum.photos/40'} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-200"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto mt-6 px-4">
        {/* Welcome Card */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-200">
          <h2 className="text-lg font-semibold mb-1">Welcome, {profile?.displayName || 'Customer'}!</h2>
          <p className="text-blue-100 text-sm opacity-90">Need to move cargo? Fill in the details below to receive competitive bids from verified agents.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Shipment Details</h3>
            
            {/* Pickup */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Pickup Location
              </label>
              <input
                required
                type="text"
                placeholder="Where are we picking up?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.pickup}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup: e.target.value }))}
              />
            </div>

            {/* Dropoff */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" /> Dropoff Location
              </label>
              <input
                required
                type="text"
                placeholder="Where is the destination?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.dropoff}
                onChange={(e) => setFormData(prev => ({ ...prev, dropoff: e.target.value }))}
              />
            </div>

            {/* Cargo Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-600" /> Cargo Type
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                value={formData.cargoType}
                onChange={(e) => setFormData(prev => ({ ...prev, cargoType: e.target.value }))}
              >
                {CARGO_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Weight className="w-4 h-4 text-gray-500" /> Est. Weight
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 500kg (Max 1 ton)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-500" /> Cargo Photo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">
                      {formData.photoName ? `Selected: ${formData.photoName}` : 'Click to take a photo of the cargo'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...
              </>
            ) : (
              'Get Quotes Now'
            )}
          </button>
        </form>
      </main>

      <footer className="mt-12 text-center text-gray-400 text-xs px-4">
        <p>© 2024 FreightForward Logistics MVP</p>
        <p className="mt-1">Powered by LINE LIFF & Supabase</p>
      </footer>
    </div>
  );
};

export default App;
