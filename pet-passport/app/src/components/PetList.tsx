import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import PetCard from './PetCard';
import { fetchPetsByOwner, PetData } from '../utils/petPassport';
import { PublicKey } from '@solana/web3.js';

interface PetEntry {
  pubkey: PublicKey;
  data: PetData;
}

const PetList = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setPets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchPetsByOwner(connection, publicKey);
        if (!cancelled) {
          setPets(fetched);
        }
      } catch (err) {
        console.error('Error fetching pets:', err);
        if (!cancelled) {
          setError('Failed to load pets from the blockchain');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPets();
    return () => { cancelled = true; };
  }, [publicKey, connection]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-solana-green border-r-transparent"></div>
        <p className="mt-4 text-gray-400">Loading pets from Solana...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => {
          const birthDate = new Date(pet.data.birthDate * 1000).toISOString().split('T')[0];
          const lastUpdated = new Date(pet.data.lastUpdated * 1000).toISOString().split('T')[0];
          const nextVacc = pet.data.vaccinationRecords.length > 0
            ? new Date(pet.data.vaccinationRecords[pet.data.vaccinationRecords.length - 1].nextDueDate * 1000).toISOString().split('T')[0]
            : undefined;

          return (
            <PetCard
              key={pet.pubkey.toString()}
              id={pet.pubkey.toString()}
              name={pet.data.name}
              species={pet.data.species}
              breed={pet.data.breed}
              birthDate={birthDate}
              lastUpdated={lastUpdated}
              nextVaccination={nextVacc}
              owner={pet.data.owner.toString()}
              onClick={() => navigate(`/pet/${pet.pubkey.toString()}`)}
            />
          );
        })}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl gradient-solana flex items-center justify-center text-4xl font-bold mx-auto mb-4">
            K
          </div>
          <h3 className="mt-4 text-lg font-semibold gradient-solana-text">No pets found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first pet record using the "Add New Pet" tab.
          </p>
        </div>
      )}
    </div>
  );
};

export default PetList;
