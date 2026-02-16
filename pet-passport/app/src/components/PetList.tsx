import { useState } from 'react';
import PetCard from './PetCard';

// Mock data for pets
const mockPets = [
  {
    id: '1',
    name: 'Fluffy',
    species: 'Cat',
    breed: 'Persian',
    birthDate: '2020-05-15',
    imageUrl: 'https://placedog.net/300/300?id=1',
    lastUpdated: '2023-01-15',
    nextVaccination: '2023-06-15',
  },
  {
    id: '2',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    birthDate: '2019-08-22',
    imageUrl: 'https://placedog.net/300/300?id=2',
    lastUpdated: '2023-01-10',
    nextVaccination: '2023-02-22',
  },
];

const PetList = () => {
  const [pets] = useState(mockPets);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
      
      {pets.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new pet passport.</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Pet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetList;