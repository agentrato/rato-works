# On-Chain Pet Passport - Smart Contract Structure Outline

## Overview
This document outlines the smart contract structure for the On-Chain Pet Passport system, focusing on SPL token representation, efficient metadata storage, and QR code integration for easy record sharing.

## 1. Core Architecture

### 1.1 SPL Token Implementation
- Each pet is represented by a unique SPL token (Non-Fungible Token)
- Token standard: SPL Token (using Metaplex for enhanced metadata)
- Mint account: One per pet
- Token supply: 1 token per pet (0 decimal places)
- Ownership: Token holder is the pet owner

### 1.2 Account Structure
```
PetData Account (PDA)
├── Immutable Data (stored in token metadata)
│   ├── Name
│   ├── Species
│   ├── Breed
│   └── Birth Date
│
├── Mutable On-Chain Data
│   ├── Owner (Pubkey)
│   ├── Last Updated Timestamp
│   ├── Record Counters
│   └── Verification Status
│
└── Off-Chain Data Pointers (IPFS)
    ├── Medical Records
    ├── Vaccination History
    ├── Travel Documentation
    └── Pet Images
```

## 2. SPL Token Design

### 2.1 Token Creation Process
1. Create new mint account for the pet
2. Mint exactly 1 token to the owner's account
3. Initialize Metaplex metadata with basic pet information
4. Create PetData PDA account for mutable data

### 2.2 Token Metadata Structure
```json
{
  "name": "Pet Passport: [Pet Name]",
  "symbol": "PPT",
  "uri": "https://ipfs.io/ipfs/[CID]/[pet_id].json",
  "seller_fee_basis_points": 0,
  "creators": [],
  "collection": {
    "name": "On-Chain Pet Passports",
    "family": "PetPassport"
  }
}
```

### 2.3 Off-Chain Metadata (IPFS)
```json
{
  "name": "[Pet Name]",
  "description": "On-Chain Pet Passport for [Pet Name]",
  "image": "https://ipfs.io/ipfs/[CID]/[pet_image].jpg",
  "attributes": [
    {
      "trait_type": "Species",
      "value": "[Species]"
    },
    {
      "trait_type": "Breed",
      "value": "[Breed]"
    },
    {
      "trait_type": "Birth Date",
      "value": "[YYYY-MM-DD]"
    },
    {
      "trait_type": "Created On",
      "value": "[Timestamp]"
    }
  ],
  "external_url": "https://petpassport.app/view/[pet_token_address]"
}
```

## 3. Efficient Data Storage Strategy

### 3.1 On-Chain Data (Minimize Storage Costs)
- Core pet information (name, species, breed, birth date) in token metadata
- Owner pubkey in PetData account
- Record counters for pagination
- Verification status flags
- Pointers to off-chain data

### 3.2 Off-Chain Data (IPFS for Cost Efficiency)
- Detailed medical records
- Vaccination history with timestamps
- Travel documentation
- Pet photos and vet certificates
- Backup copies of all information

### 3.3 Hybrid Verification Approach
- Store cryptographic hashes of off-chain records on-chain
- Implement Merkle tree structure for batch verification
- Timestamp records for authenticity proof
- Veterinarian signatures for record verification

## 4. Smart Contract Functions

### 4.1 Core Functions
1. `create_pet_passport`
   - Parameters: name, species, breed, birth_date, owner
   - Creates SPL token mint
   - Initializes Metaplex metadata
   - Creates PetData PDA account

2. `transfer_ownership`
   - Parameters: pet_token, new_owner
   - Transfers SPL token
   - Updates PetData owner field

3. `add_record`
   - Parameters: pet_token, record_type, record_data
   - Updates record counters
   - Stores record hash on-chain
   - Returns IPFS CID for off-chain storage

4. `verify_record`
   - Parameters: pet_token, record_hash, verifier_signature
   - Only authorized veterinarians can call
   - Updates verification status

5. `get_pet_summary`
   - Parameters: pet_token
   - Returns basic pet info and record counts
   - Includes QR code data

### 4.2 Record Management Functions
1. `add_vaccination_record`
2. `add_health_record`
3. `add_travel_record`
4. `get_record_history` (with pagination)

## 5. QR Code Integration

### 5.1 QR Code Content Structure
```
URL: https://petpassport.app/view/[pet_token_address]
Fallback: solana:[pet_token_address]?cluster=mainnet-beta
```

### 5.2 QR Code Data Components
1. **Pet Token Address**: Primary identifier for the pet passport
2. **Verification Endpoint**: URL for verification service
3. **Fallback Information**: Raw token address for manual entry

### 5.3 Verification Flow
1. Scan QR code with mobile app or web interface
2. Extract pet token address from QR content
3. Query smart contract for pet data
4. Fetch off-chain metadata from IPFS
5. Display formatted passport information
6. Show verification status of records

### 5.4 QR Code Generation Process
1. On passport creation, generate QR code with token address
2. Include in web interface for sharing
3. Provide download option for printing
4. Generate different versions:
   - Basic view-only QR
   - Veterinarian verification QR
   - Authority inspection QR

## 6. Security Considerations

### 6.1 Access Control
- Only token owner can add records
- Only authorized veterinarians can verify records
- Transfer requires owner's signature
- Emergency transfer for lost keys (multi-sig)

### 6.2 Data Integrity
- Cryptographic hashing of all records
- Timestamping for authenticity
- Veterinarian signature verification
- Immutable record history

### 6.3 Privacy
- Sensitive data stored off-chain
- Access control to off-chain data
- Selective disclosure capabilities
- GDPR compliance through data location

## 7. Future Enhancements

### 7.1 Cross-Chain Compatibility
- Bridge implementation for other blockchains
- Standardized passport format
- Interoperability with existing pet registries

### 7.2 Advanced Features
- Automated vaccination reminders
- Integration with veterinary practice management systems
- Pet insurance claim processing
- Lost pet recovery network

## 8. Implementation Considerations

### 8.1 Performance Optimization
- Account compression for reduced storage costs
- Caching strategies for frequently accessed data
- Pagination for large record sets
- Efficient serialization formats

### 8.2 Cost Management
- Selective on-chain data storage
- Batch operations for multiple records
- Account rent optimization
- Gas fee estimation for users

This outline provides a comprehensive structure for implementing the On-Chain Pet Passport system with a focus on SPL tokens, efficient data storage, and QR code integration for easy sharing.