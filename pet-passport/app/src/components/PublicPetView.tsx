import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { fetchPetByPubkey, PetData } from '../utils/petPassport';
import { speciesEmoji } from '../utils/species';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const PublicPetView = () => {
  const { pubkey } = useParams<{ pubkey: string }>();
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pubkey) return;
    setLoading(true);
    fetchPetByPubkey(connection, new PublicKey(pubkey))
      .then(data => {
        if (data) setPet(data);
        else setError('Pet record not found');
      })
      .catch(() => setError('Failed to load pet record'))
      .finally(() => setLoading(false));
  }, [pubkey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-solana-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-solana-green border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading pet record from Solana...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-solana-dark flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center glow-purple">
          <div className="w-16 h-16 rounded-2xl gradient-solana flex items-center justify-center text-2xl font-bold mx-auto mb-4">K</div>
          <h2 className="text-xl font-bold text-white mb-2">PetRecord</h2>
          <p className="text-red-400">{error || 'Pet not found'}</p>
          <p className="text-xs text-gray-600 mt-4 font-mono break-all">Account: {pubkey}</p>
        </div>
      </div>
    );
  }

  const birthDate = new Date(pet.birthDate * 1000).toLocaleDateString();
  const lastUpdated = new Date(pet.lastUpdated * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen bg-solana-dark">
      {/* Minimal header */}
      <header className="relative border-b border-white/10">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-solana" />
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-solana flex items-center justify-center text-sm font-bold">K</div>
          <span className="text-lg font-bold gradient-solana-text">PetRecord</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        {/* Pet Card */}
        <div className="glass rounded-2xl overflow-hidden glow-purple">
          {/* Hero */}
          <div className="h-40 bg-gradient-to-br from-solana-purple/30 to-solana-green/20 flex items-center justify-center relative">
            <span className="text-7xl">{speciesEmoji(pet.species)}</span>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-solana" />
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-white">{pet.name}</h1>
            <p className="text-gray-400 mt-1">{pet.species}{pet.breed ? ` \u2022 ${pet.breed}` : ''}</p>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="text-gray-500">Born: <span className="text-gray-300">{birthDate}</span></span>
              <span className="text-gray-500">Updated: <span className="text-gray-300">{lastUpdated}</span></span>
            </div>
          </div>
        </div>

        {/* Vaccination Records */}
        {pet.vaccinationRecords.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">{'\uD83D\uDC89'}</span> Vaccinations
            </h2>
            <div className="space-y-3">
              {pet.vaccinationRecords.map((v, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      {v.vaccineName}
                      {v.verified && <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-0.5 rounded-full">Verified</span>}
                    </h4>
                    <span className="text-xl">{v.verified ? '\u2705' : '\u23F3'}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Administered: {new Date(v.dateAdministered * 1000).toLocaleDateString()} &bull; Next: {new Date(v.nextDueDate * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Vet: {v.veterinarian}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Records */}
        {pet.healthRecords.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">{'\uD83D\uDCCB'}</span> Health Records
            </h2>
            <div className="space-y-3">
              {pet.healthRecords.map((h, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      {h.recordType}
                      {h.verified && <span className="text-xs bg-solana-green/20 text-solana-green px-2 py-0.5 rounded-full">Verified</span>}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{h.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Date: {new Date(h.date * 1000).toLocaleDateString()} &bull; Vet: {h.veterinarian}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location History */}
        {pet.locationHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">{'\uD83D\uDCCD'}</span> Events
            </h2>
            <div className="space-y-3">
              {pet.locationHistory.map((l, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <h4 className="text-white font-semibold">{l.eventType}</h4>
                  <p className="text-sm text-gray-300 mt-1">{l.location}</p>
                  <p className="text-sm text-gray-400">{new Date(l.timestamp * 1000).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {pet.vaccinationRecords.length === 0 && pet.healthRecords.length === 0 && pet.locationHistory.length === 0 && (
          <div className="glass rounded-xl p-8 mt-8 text-center">
            <p className="text-gray-500">No records have been added yet.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600">
            This pet record is stored on the <span className="text-solana-green">Solana blockchain</span> (devnet)
          </p>
          <p className="text-xs text-gray-700 font-mono mt-1 break-all">Account: {pubkey}</p>
          <p className="text-xs text-gray-600 mt-3">Powered by <span className="gradient-solana-text font-semibold">PetRecord</span></p>
        </div>
      </main>
    </div>
  );
};

export default PublicPetView;
