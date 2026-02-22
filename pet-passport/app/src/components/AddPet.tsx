import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { createPetPassportTransaction, PET_PASSPORT_PROGRAM_ID } from '../utils/petPassport';

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  birthDate: string;
}

const AddPet = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: 'Dog',
    breed: '',
    birthDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [createdPetPubkey, setCreatedPetPubkey] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxSignature(null);

    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.species || !formData.birthDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const birthTimestamp = Math.floor(new Date(formData.birthDate).getTime() / 1000);

      const { transaction, petDataKeypair, mintKeypair } = await createPetPassportTransaction(
        connection,
        publicKey,
        formData.name,
        formData.species,
        formData.breed,
        birthTimestamp,
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      transaction.partialSign(petDataKeypair, mintKeypair);

      const sim = await connection.simulateTransaction(transaction);
      if (sim.value.err) {
        const logs = sim.value.logs?.join('\n') || '';
        console.error('Simulation failed:', sim.value.err);
        console.error('Simulation logs:', sim.value.logs);
        setError('Transaction simulation failed: ' + JSON.stringify(sim.value.err) +
          (logs ? '\n\nProgram logs:\n' + logs : ''));
        setIsSubmitting(false);
        return;
      }

      const signed = await signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      setTxSignature(signature);
      setCreatedPetPubkey(petDataKeypair.publicKey.toString());
      setFormData({ name: '', species: 'Dog', breed: '', birthDate: '' });
    } catch (err: any) {
      console.error('Error creating pet record:', err);
      const msg = err?.message || err?.toString() || 'Unknown error';
      const logs = err?.logs?.join('\n') || '';
      setError('Failed to create pet record: ' + msg + (logs ? '\n\nProgram logs:\n' + logs : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="glass rounded-2xl p-12 text-center glow-purple">
        <p className="text-gray-400">Please connect your wallet to add a pet</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="glass rounded-2xl p-8 glow-purple">
        <h2 className="text-2xl font-bold gradient-solana-text mb-6">Create Pet Record</h2>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {txSignature && (
          <div className="mb-6 bg-solana-green/10 border border-solana-green/30 rounded-xl p-4">
            <p className="text-sm text-solana-green font-semibold">Pet record created successfully!</p>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-solana-green/80 underline hover:text-solana-green transition-colors block mt-1"
            >
              View transaction on Solana Explorer
            </a>
            {createdPetPubkey && (
              <button
                onClick={() => navigate(`/pet/${createdPetPubkey}`)}
                className="btn-solana mt-3 text-sm py-2 px-4"
              >
                View Pet Record &rarr;
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Pet Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-solana"
              placeholder="e.g., Fluffy"
              required
            />
          </div>

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-300 mb-2">
              Species *
            </label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleInputChange}
              className="input-solana"
              required
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Hamster">Hamster</option>
              <option value="Fish">Fish</option>
              <option value="Turtle">Turtle</option>
              <option value="Snake">Snake</option>
              <option value="Lizard">Lizard</option>
              <option value="Horse">Horse</option>
              <option value="Ferret">Ferret</option>
              <option value="Guinea Pig">Guinea Pig</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-300 mb-2">
              Breed
            </label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              className="input-solana"
              placeholder="e.g., Golden Retriever"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="input-solana"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-solana w-full text-center"
          >
            {isSubmitting ? 'Creating Record on Solana...' : 'Create Pet Record'}
          </button>
        </form>

        <div className="mt-8 glass rounded-xl p-4">
          <p className="text-sm text-gray-400">
            Connected to <span className="text-solana-green font-semibold">Devnet</span>. Your pet record will be stored as an on-chain account.
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Program: {PET_PASSPORT_PROGRAM_ID.toString().slice(0, 16)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddPet;
