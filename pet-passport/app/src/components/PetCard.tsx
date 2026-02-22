import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { speciesEmoji } from '../utils/species';

interface PetCardProps {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  imageUrl?: string;
  lastUpdated: string;
  nextVaccination?: string;
  owner?: string;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({
  id,
  name,
  species,
  breed,
  birthDate,
  imageUrl,
  lastUpdated,
  nextVaccination,
  owner,
  onClick,
}) => {
  const [showQr, setShowQr] = useState(false);
  const publicUrl = `${window.location.origin}/view/${id}`;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 glow-purple group">
      {/* Pet Image */}
      <div className="h-48 bg-white/5 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-solana-purple/20 to-solana-green/10">
            <span className="text-6xl">{speciesEmoji(species)}</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setShowQr(!showQr); }}
          className="absolute top-3 right-3 glass rounded-xl p-2 hover:bg-white/10 transition-colors"
          title={showQr ? "Hide QR Code" : "Show QR Code"}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-solana" />
      </div>

      {/* Pet Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-400">{species}{breed ? ` \u2022 ${breed}` : ''}</p>
        <p className="text-xs text-gray-500 mt-2 font-mono">Born: {birthDate}</p>

        {nextVaccination && (
          <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-yellow-300">Next vaccination: {nextVaccination}</span>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-3">Last updated: {lastUpdated}</p>

        <button
          onClick={onClick}
          className="btn-solana mt-4 w-full text-sm py-2.5"
        >
          View Record
        </button>
      </div>

      {/* QR Code */}
      {showQr && (
        <div className="px-5 pb-5 border-t border-white/10">
          <div className="mt-4 bg-white p-3 rounded-xl flex justify-center">
            <QRCode value={publicUrl} size={150} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">Scan to view pet record</p>
        </div>
      )}
    </div>
  );
};

export default PetCard;
