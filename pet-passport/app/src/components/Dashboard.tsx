import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import PetList from './PetList';
import AddPet from './AddPet';
import { useState } from 'react';
import { PET_PASSPORT_PROGRAM_ID } from '../utils/petPassport';

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('pets');

  return (
    <div className="min-h-screen bg-solana-dark">
      {/* Header */}
      <header className="relative border-b border-white/10">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-solana" />
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gradient-solana flex items-center justify-center text-xl font-bold">
              K
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-solana-text">PetRecord</h1>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                Devnet &bull; {PET_PASSPORT_PROGRAM_ID.toString().slice(0, 8)}...
              </p>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main>
        {publicKey ? (
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('pets')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'pets'
                    ? 'gradient-solana text-white shadow-lg shadow-solana-purple/25'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                My Pets
              </button>
              <button
                onClick={() => setActiveTab('add-pet')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'add-pet'
                    ? 'gradient-solana text-white shadow-lg shadow-solana-purple/25'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                Add New Pet
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'pets' && <PetList />}
            {activeTab === 'add-pet' && <AddPet />}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center glow-purple">
              <div className="w-20 h-20 rounded-2xl gradient-solana flex items-center justify-center text-4xl font-bold mb-6">
                K
              </div>
              <h2 className="text-3xl font-bold gradient-solana-text mb-3">PetRecord</h2>
              <p className="text-gray-400 mb-2 max-w-md">
                Your pet's health records, on-chain.
              </p>
              <p className="text-gray-500 mb-8 max-w-md text-sm">
                Connect your Solana wallet to create and manage verifiable health records for your pets.
              </p>
              <WalletMultiButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
