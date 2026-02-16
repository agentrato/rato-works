# On-Chain Pet Passport - Technical Specification

## Overview
This document provides the complete technical specification for implementing the On-Chain Pet Passport system, combining the smart contract structure with the detailed UI flow to create a comprehensive development guide.

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend UI   │◄──►│  Solana Program  │◄──►│     IPFS CDN     │
│ (Next.js/React) │    │   (Rust/Anchor)  │    │ (Data Storage)   │
└─────────────────┘    └──────────────────┘    └──────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Wallet Adapter  │    │  Metaplex Token  │    │   Verification   │
│ (Phantom, etc.) │    │    Metadata      │    │    Services      │
└─────────────────┘    └──────────────────┘    └──────────────────┘
```

### 1.2 Technology Stack

#### Blockchain Layer
- **Platform**: Solana
- **Framework**: Anchor v0.28+
- **Token Standard**: SPL Token + Metaplex Token Metadata
- **Development Network**: Solana Devnet
- **RPC Provider**: Helius (configured)

#### Frontend Layer
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: Solana Wallet Adapter
- **QR Code**: qrcode.react
- **State Management**: React Context + SWR for data fetching
- **Deployment**: Vercel

#### Data Storage
- **On-Chain**: Solana Accounts
- **Off-Chain**: IPFS via Pinata
- **Caching**: Client-side (localStorage/sessionStorage)

## 2. Smart Contract Specification

### 2.1 Account Structures

#### PetData Account (PDA)
```rust
#[account]
pub struct PetData {
    pub name: String,              // 32 bytes max
    pub species: String,           // 16 bytes max
    pub breed: String,             // 32 bytes max
    pub birth_date: i64,           // 8 bytes
    pub owner: Pubkey,             // 32 bytes
    pub last_updated: i64,         // 8 bytes
    pub vaccination_count: u32,    // 4 bytes
    pub health_record_count: u32,  // 4 bytes
    pub travel_record_count: u32,  // 4 bytes
    pub is_verified: bool,         // 1 byte
    pub bump: u8,                  // 1 byte
}

// Total: ~140 bytes (efficient storage)
```

#### Record Accounts (Separate PDAs for each record type)
```rust
#[account]
pub struct VaccinationRecord {
    pub pet_token: Pubkey,         // 32 bytes
    pub vaccine_name: String,      // 32 bytes max
    pub date_administered: i64,    // 8 bytes
    pub next_due_date: i64,        // 8 bytes
    pub veterinarian: Pubkey,      // 32 bytes
    pub is_verified: bool,         // 1 byte
    pub record_hash: [u8; 32],     // 32 bytes (IPFS CID hash)
    pub bump: u8,                  // 1 byte
}

#[account]
pub struct HealthRecord {
    pub pet_token: Pubkey,         // 32 bytes
    pub record_type: String,       // 16 bytes max
    pub date: i64,                 // 8 bytes
    pub description: String,       // 200 bytes max
    pub veterinarian: Pubkey,      // 32 bytes
    pub is_verified: bool,         // 1 byte
    pub record_hash: [u8; 32],     // 32 bytes (IPFS CID hash)
    pub bump: u8,                  // 1 byte
}

#[account]
pub struct TravelRecord {
    pub pet_token: Pubkey,         // 32 bytes
    pub location: String,          // 64 bytes max
    pub date: i64,                 // 8 bytes
    pub event_type: String,        // 16 bytes max
    pub notes: String,             // 100 bytes max
    pub record_hash: [u8; 32],     // 32 bytes (IPFS CID hash)
    pub bump: u8,                  // 1 byte
}
```

### 2.2 Core Instructions

#### Create Pet Passport
```rust
pub fn create_pet_passport(
    ctx: Context<CreatePetPassport>,
    name: String,
    species: String,
    breed: String,
    birth_date: i64,
) -> Result<()> {
    // Validate inputs
    require!(name.len() <= 32, PetPassportError::NameTooLong);
    require!(species.len() <= 16, PetPassportError::SpeciesTooLong);
    require!(breed.len() <= 32, PetPassportError::BreedTooLong);
    require!(birth_date > 0, PetPassportError::InvalidBirthDate);
    
    // Initialize pet data
    let pet_data = &mut ctx.accounts.pet_data;
    pet_data.name = name;
    pet_data.species = species;
    pet_data.breed = breed;
    pet_data.birth_date = birth_date;
    pet_data.owner = ctx.accounts.payer.key();
    pet_data.last_updated = Clock::get()?.unix_timestamp;
    pet_data.vaccination_count = 0;
    pet_data.health_record_count = 0;
    pet_data.travel_record_count = 0;
    pet_data.is_verified = false;
    pet_data.bump = ctx.bumps.pet_data;
    
    // Mint SPL token and set metadata (via CPI calls)
    // ... implementation details
    
    Ok(())
}
```

#### Add Vaccination Record
```rust
pub fn add_vaccination_record(
    ctx: Context<AddVaccinationRecord>,
    vaccine_name: String,
    date_administered: i64,
    next_due_date: i64,
) -> Result<()> {
    // Verify ownership
    require!(
        ctx.accounts.pet_data.owner == ctx.accounts.owner.key(),
        PetPassportError::Unauthorized
    );
    
    // Validate inputs
    require!(vaccine_name.len() <= 32, PetPassportError::VaccineNameTooLong);
    require!(date_administered > 0, PetPassportError::InvalidDate);
    
    // Create vaccination record
    let record = &mut ctx.accounts.vaccination_record;
    record.pet_token = ctx.accounts.pet_data.key();
    record.vaccine_name = vaccine_name;
    record.date_administered = date_administered;
    record.next_due_date = next_due_date;
    record.veterinarian = ctx.accounts.owner.key(); // Will be updated when vet verifies
    record.is_verified = false;
    record.record_hash = [0; 32]; // Will be updated with IPFS hash
    record.bump = ctx.bumps.vaccination_record;
    
    // Update pet data
    ctx.accounts.pet_data.vaccination_count += 1;
    ctx.accounts.pet_data.last_updated = Clock::get()?.unix_timestamp;
    
    Ok(())
}
```

#### Verify Record
```rust
pub fn verify_record(
    ctx: Context<VerifyRecord>,
    record_hash: [u8; 32],
) -> Result<()> {
    // Verify that the signer is an authorized veterinarian
    // This would check against a list of authorized vets
    // require!(is_authorized_vet(ctx.accounts.verifier.key()), PetPassportError::UnauthorizedVet);
    
    // Update record verification status
    ctx.accounts.record.is_verified = true;
    ctx.accounts.record.veterinarian = ctx.accounts.verifier.key();
    ctx.accounts.record.record_hash = record_hash;
    
    Ok(())
}
```

### 2.3 Account Constraints

#### CreatePetPassport Context
```rust
#[derive(Accounts)]
pub struct CreatePetPassport<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + 140, // Discriminator + PetData size
        seeds = [b"pet", mint.key().as_ref()],
        bump
    )]
    pub pet_data: Account<'info, PetData>,
    
    /// CHECK: Metaplex will validate
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    /// CHECK: Metaplex will validate
    #[account(mut)]
    pub mint: Signer<'info>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: Metaplex will validate
    pub metadata_program: UncheckedAccount<'info>,
}
```

## 3. Frontend Implementation

### 3.1 Project Structure
```
pet-passport-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── pet-card.tsx
│   ├── passport/
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   ├── overview-tab.tsx
│   │   │   ├── medical-tab.tsx
│   │   │   ├── travel-tab.tsx
│   │   │   └── documents-tab.tsx
│   │   └── create/
│   │       └── page.tsx
│   └── verify/
│       └── page.tsx
├── components/
│   ├── wallet/
│   │   ├── wallet-connect.tsx
│   │   └── wallet-provider.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── tabs.tsx
│   ├── qr-code/
│   │   ├── display.tsx
│   │   └── scanner.tsx
│   └── records/
│       ├── vaccination-form.tsx
│       ├── health-form.tsx
│       └── travel-form.tsx
├── lib/
│   ├── program/
│   │   ├── idl.json
│   │   ├── program.ts
│   │   └── types.ts
│   ├── ipfs.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── usePetData.ts
│   ├── useRecords.ts
│   └── useWallet.ts
└── public/
    └── icons/
```

### 3.2 Core Frontend Components

#### Wallet Integration
```typescript
// hooks/useWallet.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';

export function usePetPassportProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const program = useMemo(() => {
    if (!wallet.publicKey) return null;
    
    // Initialize program with IDL
    return new Program(
      idl as PetPassport,
      PROGRAM_ID,
      new Provider(connection, wallet as any, {})
    );
  }, [connection, wallet]);
  
  return program;
}
```

#### Pet Data Fetching
```typescript
// hooks/usePetData.ts
import { usePetPassportProgram } from './useWallet';
import { PublicKey } from '@solana/web3.js';
import useSWR from 'swr';

export function usePetData(petId: string) {
  const program = usePetPassportProgram();
  
  const { data, error, isLoading } = useSWR(
    petId && program ? ['petData', petId] : null,
    async () => {
      if (!program || !petId) return null;
      
      try {
        const petPublicKey = new PublicKey(petId);
        const petData = await program.account.petData.fetch(petPublicKey);
        return {
          id: petId,
          ...petData,
          age: calculateAge(petData.birthDate),
        };
      } catch (err) {
        console.error('Error fetching pet data:', err);
        throw err;
      }
    }
  );
  
  return {
    petData: data,
    isLoading,
    isError: error,
  };
}
```

#### QR Code Generation
```typescript
// components/qr-code/display.tsx
import { QRCodeSVG } from 'qrcode.react';
import { usePetPassportProgram } from '@/hooks/useWallet';

interface QRCodeDisplayProps {
  petId: string;
  size?: number;
}

export function QRCodeDisplay({ petId, size = 256 }: QRCodeDisplayProps) {
  const verificationUrl = `${window.location.origin}/verify/${petId}`;
  
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={verificationUrl}
        size={size}
        level="H" // High error correction
        includeMargin={true}
        className="rounded-lg border-2 border-gray-200"
      />
      <p className="mt-2 text-sm text-gray-600 break-all">
        {verificationUrl}
      </p>
      <Button 
        onClick={() => navigator.clipboard.writeText(verificationUrl)}
        className="mt-2"
      >
        Copy URL
      </Button>
    </div>
  );
}
```

#### QR Code Scanner
```typescript
// components/qr-code/scanner.tsx
import { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError: (error: Error) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  
  const handleScan = (result: string) => {
    if (scanning) {
      setScanning(false);
      // Extract pet ID from URL if needed
      const petId = extractPetIdFromUrl(result);
      if (petId) {
        onScan(petId);
      } else {
        onError(new Error('Invalid QR code format'));
      }
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <QrScanner
        onDecode={handleScan}
        onError={onError}
        containerStyle={{ width: '100%' }}
      />
      <p className="text-center mt-2 text-sm text-gray-600">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
```

### 3.3 API Integration Layer

#### Program Interaction Service
```typescript
// lib/program/program.ts
import { Program } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { PetPassport } from './types';

export class PetPassportService {
  constructor(
    private program: Program<PetPassport>,
    private ipfsService: IPFSService
  ) {}
  
  async createPetPassport(
    name: string,
    species: string,
    breed: string,
    birthDate: number,
    photo?: File
  ) {
    // Upload photo to IPFS if provided
    let photoCID: string | undefined;
    if (photo) {
      photoCID = await this.ipfsService.uploadFile(photo);
    }
    
    // Prepare metadata for IPFS
    const metadata = {
      name: `Pet Passport: ${name}`,
      description: `On-chain passport for ${name}`,
      image: photoCID ? `https://ipfs.io/ipfs/${photoCID}` : undefined,
      attributes: [
        { trait_type: 'Species', value: species },
        { trait_type: 'Breed', value: breed },
        { trait_type: 'Birth Date', value: new Date(birthDate * 1000).toISOString().split('T')[0] },
      ],
    };
    
    // Upload metadata to IPFS
    const metadataCID = await this.ipfsService.uploadJSON(metadata);
    
    // Prepare and send transaction
    const [mintKeypair] = await PublicKey.findProgramAddress(
      [Buffer.from('mint'), this.program.provider.publicKey.toBuffer()],
      this.program.programId
    );
    
    const transaction = await this.program.methods
      .createPetPassport(name, species, breed, new BN(birthDate))
      .accounts({
        // Account specifications
      })
      .transaction();
    
    const signature = await this.program.provider.sendAndConfirm(transaction, [mintKeypair]);
    return { signature, mint: mintKeypair.publicKey.toString() };
  }
  
  async addVaccinationRecord(
    petId: string,
    vaccineName: string,
    dateAdministered: number,
    nextDueDate: number,
    certificate?: File
  ) {
    // Upload certificate to IPFS if provided
    let certificateCID: string | undefined;
    if (certificate) {
      certificateCID = await this.ipfsService.uploadFile(certificate);
    }
    
    // Prepare record data
    const recordData = {
      vaccineName,
      dateAdministered: new Date(dateAdministered * 1000).toISOString(),
      nextDueDate: new Date(nextDueDate * 1000).toISOString(),
      certificate: certificateCID ? `https://ipfs.io/ipfs/${certificateCID}` : undefined,
    };
    
    // Upload record to IPFS
    const recordCID = await this.ipfsService.uploadJSON(recordData);
    
    // Add record on-chain
    const petPublicKey = new PublicKey(petId);
    const transaction = await this.program.methods
      .addVaccinationRecord(vaccineName, new BN(dateAdministered), new BN(nextDueDate))
      .accounts({
        petData: petPublicKey,
        // Other account specifications
      })
      .transaction();
    
    const signature = await this.program.provider.sendAndConfirm(transaction);
    return { signature, recordCID };
  }
}
```

## 4. Data Storage Strategy

### 4.1 On-Chain Data Structure
- Pet core information (name, species, breed, birth date): ~100 bytes
- Ownership and metadata pointers: ~100 bytes
- Record counters for pagination: ~20 bytes
- Total per pet: ~220 bytes (~$0.0002 in rent)

### 4.2 Off-Chain Data Structure (IPFS)
```
/ipfs/
├── pets/
│   ├── [pet_id]/
│   │   ├── metadata.json
│   │   ├── photo.jpg
│   │   └── records/
│   │       ├── vaccinations/
│   │       │   ├── [record_id].json
│   │       │   └── certificates/
│   │       │       └── [cert_id].pdf
│   │       ├── health/
│   │       │   └── [record_id].json
│   │       └── travel/
│   │           └── [record_id].json
└── collections/
    └── pet-passports.json
```

### 4.3 Hybrid Verification Approach
1. Store cryptographic hash of off-chain records on-chain
2. Use IPFS CID as the hash for direct verification
3. Implement Merkle tree for batch verification of multiple records
4. Timestamp records using Solana's Clock sysvar

## 5. QR Code Integration Specification

### 5.1 QR Code Content Format
```
Primary URL: https://petpassport.app/view/[pet_token_address]
Fallback: solana:[pet_token_address]?cluster=mainnet-beta
```

### 5.2 QR Code Generation Process
1. On passport creation, generate QR code with verification URL
2. Include high error correction (Level H) for reliability
3. Provide multiple formats (SVG, PNG) for different use cases
4. Generate different versions for different access levels:
   - Basic view-only
   - Veterinarian verification
   - Authority inspection

### 5.3 Verification Flow Implementation
1. Scan QR code or enter token address manually
2. Validate token address format
3. Fetch on-chain data using Solana RPC
4. Retrieve off-chain metadata from IPFS
5. Display formatted passport information
6. Show verification status of records
7. Highlight important information (expiring vaccinations, etc.)

## 6. Security Considerations

### 6.1 Smart Contract Security
- Input validation for all parameters
- Proper access control using require! macros
- Account ownership verification
- Protection against reentrancy attacks
- Comprehensive test coverage

### 6.2 Frontend Security
- Input sanitization for all user data
- Secure storage of sensitive information
- HTTPS enforcement for all communications
- Content Security Policy implementation
- Protection against XSS and CSRF attacks

### 6.3 Data Privacy
- Minimal data collection principles
- Off-chain storage for sensitive information
- Access control to off-chain data
- GDPR compliance through data location
- User control over data sharing

## 7. Performance Optimization

### 7.1 Smart Contract Optimization
- Efficient account serialization
- Minimal account size allocation
- Batch operations where possible
- Caching of frequently accessed data

### 7.2 Frontend Optimization
- Client-side caching with SWR
- Code splitting for faster loading
- Image optimization and lazy loading
- Efficient React component rendering
- Service workers for offline capabilities

### 7.3 Data Access Patterns
- Pagination for large record sets
- Indexing for quick lookups
- Caching strategies for frequently accessed data
- Preloading of likely next views

## 8. Testing Strategy

### 8.1 Smart Contract Testing
- Unit tests for all instructions
- Integration tests for complete workflows
- Security testing with known vulnerability patterns
- Performance testing under load
- Edge case validation

### 8.2 Frontend Testing
- Unit tests for components
- Integration tests for user flows
- End-to-end tests with Cypress
- Cross-browser compatibility testing
- Mobile responsiveness testing

### 8.3 User Acceptance Testing
- Test with actual pet owners
- Test with veterinary professionals
- Test with border control officials
- Gather feedback and iterate

## 9. Deployment Plan

### 9.1 Development Environment
- Local development with Solana test validator
- Devnet for integration testing
- Staging environment for user testing

### 9.2 Production Deployment
- Mainnet deployment after thorough testing
- IPFS pinning for off-chain data
- CDN for frontend assets
- Monitoring and alerting setup

### 9.3 Monitoring and Maintenance
- Transaction success/failure rates
- Gas usage optimization
- Account storage usage
- Unauthorized access attempts
- User engagement metrics

This technical specification provides a comprehensive guide for implementing the On-Chain Pet Passport system, combining the smart contract structure with the UI flow to create a complete, secure, and efficient solution.