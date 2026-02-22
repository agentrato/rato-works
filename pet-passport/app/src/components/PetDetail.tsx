import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import QRCode from 'react-qr-code';
import {
  fetchPetByPubkey,
  PetData,
  createAddVaccinationRecordInstruction,
  createAddHealthRecordInstruction,
  createAddLocationRecordInstruction,
} from '../utils/petPassport';
import { speciesEmoji } from '../utils/species';

type RecordTab = 'vaccinations' | 'health' | 'events';

const PetDetail = () => {
  const { pubkey } = useParams<{ pubkey: string }>();
  const navigate = useNavigate();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RecordTab>('vaccinations');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const isOwner = pet && publicKey ? pet.owner.equals(publicKey) : false;

  const loadPet = async () => {
    if (!pubkey) return;
    setLoading(true);
    setError(null);
    try {
      const petPubkey = new PublicKey(pubkey);
      const data = await fetchPetByPubkey(connection, petPubkey);
      if (data) {
        setPet(data);
      } else {
        setError('Pet record not found on-chain');
      }
    } catch (e: any) {
      setError('Failed to load pet: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPet(); }, [pubkey, connection]);

  const sendTx = async (instruction: any) => {
    if (!publicKey || !signTransaction || !pubkey) throw new Error('Wallet not connected');
    const tx = new Transaction().add(instruction);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;
    const signed = await signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
    return sig;
  };

  // --- Vaccination Form ---
  const [vaccForm, setVaccForm] = useState({
    vaccineName: '', dateAdministered: '', nextDueDate: '', veterinarian: '',
  });

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubkey || !publicKey) return;
    setSubmitting(true); setSubmitMsg(null);
    try {
      const ix = createAddVaccinationRecordInstruction(
        new PublicKey(pubkey), publicKey,
        vaccForm.vaccineName,
        Math.floor(new Date(vaccForm.dateAdministered).getTime() / 1000),
        Math.floor(new Date(vaccForm.nextDueDate).getTime() / 1000),
        vaccForm.veterinarian,
      );
      const sig = await sendTx(ix);
      setSubmitMsg(`Vaccination added! Tx: ${sig.slice(0, 16)}...`);
      setVaccForm({ vaccineName: '', dateAdministered: '', nextDueDate: '', veterinarian: '' });
      setShowAddForm(false);
      await loadPet();
    } catch (e: any) {
      setSubmitMsg('Error: ' + (e?.message || 'Failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Health Record Form ---
  const [healthForm, setHealthForm] = useState({
    recordType: 'Checkup', date: '', description: '', veterinarian: '',
  });

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubkey || !publicKey) return;
    setSubmitting(true); setSubmitMsg(null);
    try {
      const ix = createAddHealthRecordInstruction(
        new PublicKey(pubkey), publicKey,
        healthForm.recordType,
        Math.floor(new Date(healthForm.date).getTime() / 1000),
        healthForm.description,
        healthForm.veterinarian,
      );
      const sig = await sendTx(ix);
      setSubmitMsg(`Health record added! Tx: ${sig.slice(0, 16)}...`);
      setHealthForm({ recordType: 'Checkup', date: '', description: '', veterinarian: '' });
      setShowAddForm(false);
      await loadPet();
    } catch (e: any) {
      setSubmitMsg('Error: ' + (e?.message || 'Failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Location/Event Form ---
  const [eventForm, setEventForm] = useState({
    location: '', eventType: 'Travel',
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubkey || !publicKey) return;
    setSubmitting(true); setSubmitMsg(null);
    try {
      const ix = createAddLocationRecordInstruction(
        new PublicKey(pubkey), publicKey,
        eventForm.location,
        Math.floor(Date.now() / 1000),
        eventForm.eventType,
      );
      const sig = await sendTx(ix);
      setSubmitMsg(`Event added! Tx: ${sig.slice(0, 16)}...`);
      setEventForm({ location: '', eventType: 'Travel' });
      setShowAddForm(false);
      await loadPet();
    } catch (e: any) {
      setSubmitMsg('Error: ' + (e?.message || 'Failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-solana-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-solana-green border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading pet record...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-solana-dark flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center glow-purple">
          <p className="text-red-400 mb-4">{error || 'Pet not found'}</p>
          <button onClick={() => navigate('/')} className="btn-solana text-sm">
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const birthDate = new Date(pet.birthDate * 1000).toLocaleDateString();
  const lastUpdated = new Date(pet.lastUpdated * 1000).toLocaleDateString();
  const publicUrl = `${window.location.origin}/view/${pubkey}`;

  const tabs: { key: RecordTab; label: string; count: number }[] = [
    { key: 'vaccinations', label: 'Vaccinations', count: pet.vaccinationRecords.length },
    { key: 'health', label: 'Health Records', count: pet.healthRecords.length },
    { key: 'events', label: 'Events', count: pet.locationHistory.length },
  ];

  return (
    <div className="min-h-screen bg-solana-dark">
      {/* Header */}
      <header className="relative border-b border-white/10">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-solana" />
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
          <Link to="/" className="text-lg font-bold gradient-solana-text">PetRecord</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Pet Header Card */}
        <div className="glass rounded-2xl p-6 glow-purple mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-solana-purple/30 to-solana-green/20 flex items-center justify-center text-5xl shrink-0">
              {speciesEmoji(pet.species)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-1">{pet.name}</h1>
              <p className="text-gray-400">{pet.species}{pet.breed ? ` \u2022 ${pet.breed}` : ''}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="text-gray-500">Born: <span className="text-gray-300">{birthDate}</span></span>
                <span className="text-gray-500">Updated: <span className="text-gray-300">{lastUpdated}</span></span>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-mono break-all">Account: {pubkey}</p>
              {isOwner && <span className="inline-block mt-2 text-xs bg-solana-green/20 text-solana-green px-2 py-1 rounded-full">You are the owner</span>}
            </div>

            {/* QR Toggle */}
            <button
              onClick={() => setShowQr(!showQr)}
              className="glass rounded-xl p-3 hover:bg-white/10 transition-colors shrink-0"
              title="Show QR Code"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          </div>

          {showQr && (
            <div className="mt-6 border-t border-white/10 pt-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCode value={publicUrl} size={180} />
              </div>
              <p className="text-xs text-gray-500 mt-3">Share this QR code — anyone can scan it to view the record</p>
              <p className="text-xs text-gray-600 font-mono mt-1 break-all">{publicUrl}</p>
            </div>
          )}
        </div>

        {/* Submit feedback */}
        {submitMsg && (
          <div className={`mb-6 rounded-xl p-4 ${submitMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/30' : 'bg-solana-green/10 border border-solana-green/30'}`}>
            <p className={`text-sm ${submitMsg.startsWith('Error') ? 'text-red-400' : 'text-solana-green'}`}>{submitMsg}</p>
          </div>
        )}

        {/* Record Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setShowAddForm(false); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === t.key
                  ? 'gradient-solana text-white shadow-lg shadow-solana-purple/25'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
          {isOwner && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ml-auto px-4 py-2 rounded-full text-sm font-semibold glass text-solana-green hover:bg-solana-green/10 transition-all"
            >
              {showAddForm ? 'Cancel' : '+ Add Record'}
            </button>
          )}
        </div>

        {/* Add Record Forms */}
        {showAddForm && isOwner && (
          <div className="glass rounded-2xl p-6 mb-8 glow-purple">
            {activeTab === 'vaccinations' && (
              <form onSubmit={handleAddVaccination} className="space-y-4">
                <h3 className="text-lg font-bold gradient-solana-text mb-4">Add Vaccination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Vaccine Name *</label>
                    <input type="text" className="input-solana" placeholder="e.g., Rabies" required
                      value={vaccForm.vaccineName} onChange={e => setVaccForm(f => ({...f, vaccineName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Veterinarian *</label>
                    <input type="text" className="input-solana" placeholder="e.g., Dr. Smith" required
                      value={vaccForm.veterinarian} onChange={e => setVaccForm(f => ({...f, veterinarian: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Date Administered *</label>
                    <input type="date" className="input-solana" required
                      value={vaccForm.dateAdministered} onChange={e => setVaccForm(f => ({...f, dateAdministered: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Next Due Date *</label>
                    <input type="date" className="input-solana" required
                      value={vaccForm.nextDueDate} onChange={e => setVaccForm(f => ({...f, nextDueDate: e.target.value}))} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-solana text-sm py-2.5 px-6">
                  {submitting ? 'Submitting...' : 'Add Vaccination'}
                </button>
              </form>
            )}

            {activeTab === 'health' && (
              <form onSubmit={handleAddHealth} className="space-y-4">
                <h3 className="text-lg font-bold gradient-solana-text mb-4">Add Health Record</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Record Type *</label>
                    <select className="input-solana" value={healthForm.recordType}
                      onChange={e => setHealthForm(f => ({...f, recordType: e.target.value}))}>
                      <option value="Checkup">Checkup</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Accident">Accident</option>
                      <option value="Allergy">Allergy</option>
                      <option value="Medication">Medication</option>
                      <option value="Dental">Dental</option>
                      <option value="Lab Work">Lab Work</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Date *</label>
                    <input type="date" className="input-solana" required
                      value={healthForm.date} onChange={e => setHealthForm(f => ({...f, date: e.target.value}))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-300 mb-1">Description *</label>
                    <input type="text" className="input-solana" placeholder="e.g., Annual checkup, all healthy" required
                      value={healthForm.description} onChange={e => setHealthForm(f => ({...f, description: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Veterinarian *</label>
                    <input type="text" className="input-solana" placeholder="e.g., Dr. Smith" required
                      value={healthForm.veterinarian} onChange={e => setHealthForm(f => ({...f, veterinarian: e.target.value}))} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-solana text-sm py-2.5 px-6">
                  {submitting ? 'Submitting...' : 'Add Health Record'}
                </button>
              </form>
            )}

            {activeTab === 'events' && (
              <form onSubmit={handleAddEvent} className="space-y-4">
                <h3 className="text-lg font-bold gradient-solana-text mb-4">Add Event</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Event Type *</label>
                    <select className="input-solana" value={eventForm.eventType}
                      onChange={e => setEventForm(f => ({...f, eventType: e.target.value}))}>
                      <option value="Travel">Travel</option>
                      <option value="Moved">Moved</option>
                      <option value="Grooming">Grooming</option>
                      <option value="Boarding">Boarding</option>
                      <option value="Training">Training</option>
                      <option value="Competition">Competition</option>
                      <option value="Adoption">Adoption</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Location / Details *</label>
                    <input type="text" className="input-solana" placeholder="e.g., New York, Groomer's Studio" required
                      value={eventForm.location} onChange={e => setEventForm(f => ({...f, location: e.target.value}))} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-solana text-sm py-2.5 px-6">
                  {submitting ? 'Submitting...' : 'Add Event'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Records Display */}
        <div className="space-y-4">
          {activeTab === 'vaccinations' && (
            pet.vaccinationRecords.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-gray-500">No vaccination records yet.</p>
                {isOwner && <p className="text-sm text-gray-600 mt-1">Click "+ Add Record" to add one.</p>}
              </div>
            ) : (
              pet.vaccinationRecords.map((v, i) => (
                <div key={i} className="glass rounded-xl p-5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {v.vaccineName}
                        {v.verified && <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-0.5 rounded-full">Verified</span>}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Administered: {new Date(v.dateAdministered * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Next due: {new Date(v.nextDueDate * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Vet: {v.veterinarian}</p>
                    </div>
                    <div className="text-2xl">
                      {v.verified ? '\u2705' : '\u23F3'}
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'health' && (
            pet.healthRecords.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-gray-500">No health records yet.</p>
                {isOwner && <p className="text-sm text-gray-600 mt-1">Click "+ Add Record" to add one.</p>}
              </div>
            ) : (
              pet.healthRecords.map((h, i) => (
                <div key={i} className="glass rounded-xl p-5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {h.recordType}
                        {h.verified && <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-0.5 rounded-full">Verified</span>}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Date: {new Date(h.date * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">{h.description}</p>
                      <p className="text-sm text-gray-500 mt-1">Vet: {h.veterinarian}</p>
                    </div>
                    <div className="text-2xl">
                      {h.recordType === 'Accident' ? '\u26A0\uFE0F' :
                       h.recordType === 'Surgery' ? '\uD83C\uDFE5' :
                       h.recordType === 'Medication' ? '\uD83D\uDC8A' :
                       h.recordType === 'Dental' ? '\uD83E\uDDB7' :
                       h.recordType === 'Lab Work' ? '\uD83E\uDDEA' :
                       h.recordType === 'X-Ray' ? '\uD83E\uDE7B' :
                       '\uD83D\uDCCB'}
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'events' && (
            pet.locationHistory.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-gray-500">No events recorded yet.</p>
                {isOwner && <p className="text-sm text-gray-600 mt-1">Click "+ Add Record" to add one.</p>}
              </div>
            ) : (
              pet.locationHistory.map((l, i) => (
                <div key={i} className="glass rounded-xl p-5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{l.eventType}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(l.timestamp * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">{l.location}</p>
                    </div>
                    <div className="text-2xl">
                      {l.eventType === 'Travel' ? '\u2708\uFE0F' :
                       l.eventType === 'Grooming' ? '\u2702\uFE0F' :
                       l.eventType === 'Training' ? '\uD83C\uDFC6' :
                       l.eventType === 'Competition' ? '\uD83E\uDD47' :
                       l.eventType === 'Adoption' ? '\u2764\uFE0F' :
                       '\uD83D\uDCCD'}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default PetDetail;
