import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import PetList from './PetList';
import { useState } from 'react';

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('pets');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Pet Passport</h1>
          <WalletMultiButton />
        </div>
      </header>

      <main>
        {publicKey ? (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('pets')}
                  className={`${
                    activeTab === 'pets'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  My Pets
                </button>
                <button
                  onClick={() => setActiveTab('add-pet')}
                  className={`${
                    activeTab === 'add-pet'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Add New Pet
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'pets' && <PetList />}
              {activeTab === 'add-pet' && <div>Add New Pet Form</div>}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Connect Your Wallet</h2>
                <p className="text-gray-500 mb-6">Please connect your wallet to view your pet passports</p>
                <WalletMultiButton />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;