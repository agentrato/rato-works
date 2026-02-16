# On-Chain Pet Passport - Smart Contract Logic

## Overview
The On-Chain Pet Passport project will create verifiable pet records using SPL tokens on Solana. Each pet will have a unique token representing their passport, with metadata stored efficiently on-chain.

## Smart Contract Architecture

### Core Components

1. **Pet Passport Token (PPT) - SPL Token Implementation**
   - Each pet is represented by a unique SPL token
   - Token metadata contains basic pet information
   - Ownership of the token represents pet ownership

2. **Pet Data Structure**
   ```rust
   struct PetData {
       // Immutable data stored in token metadata
       name: String,
       species: String,
       breed: String,
       birth_date: i64,
       
       // Mutable data stored in account
       owner: Pubkey,
       last_updated: i64,
       vaccination_records: Vec<VaccinationRecord>,
       health_records: Vec<HealthRecord>,
       location_history: Vec<LocationRecord>,
   }
   ```

3. **Record Structures**
   ```rust
   struct VaccinationRecord {
       vaccine_name: String,
       date_administered: i64,
       next_due_date: i64,
       veterinarian: String,
       verified: bool,
   }
   
   struct HealthRecord {
       record_type: String, // Checkup, Surgery, Illness, etc.
       date: i64,
       description: String,
       veterinarian: String,
       verified: bool,
   }
   
   struct LocationRecord {
       location: String,
       timestamp: i64,
       event_type: String, // Travel, Relocation, etc.
   }
   ```

## SPL Token Implementation Details

### Token Creation
- Use Metaplex Token Metadata program for rich metadata
- Each pet gets a unique mint address
- Initial token supply: 1 (the passport token)
- Token is non-fungible but uses SPL Token standard

### Metadata Structure
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

### Off-Chain Metadata (IPFS)
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
  ]
}
```

## Efficient Data Storage Strategy

### On-Chain Data (Expensive - Minimize)
1. Core pet information (name, species, breed, birth date)
2. Owner pubkey
3. Pointers to latest records
4. Verification status

### Off-Chain Data (IPFS - Cost Effective)
1. Detailed medical records
2. Images (pet photos, vet documents)
3. Historical data
4. Backup copies of all information

### Hybrid Approach
- Store hashes of off-chain records on-chain for verification
- Use Merkle trees for efficient verification of record batches
- Implement timestamping for record authenticity

## Smart Contract Functions

### Core Functions
1. `create_pet_passport(name, species, breed, birth_date, owner)`
   - Mints new SPL token
   - Initializes PetData account
   - Sets initial metadata

2. `update_owner(pet_token, new_owner)`
   - Transfers token ownership
   - Updates PetData owner field

3. `add_vaccination_record(pet_token, record_data)`
   - Adds new vaccination record to PetData
   - Updates last_updated timestamp

4. `add_health_record(pet_token, record_data)`
   - Adds new health record to PetData
   - Updates last_updated timestamp

5. `add_location_record(pet_token, record_data)`
   - Adds new location record to PetData
   - Updates last_updated timestamp

6. `verify_record(pet_token, record_hash, verifier)`
   - Verifies authenticity of a record
   - Can only be called by authorized veterinarians

7. `get_pet_data(pet_token)`
   - Returns all pet data
   - Includes pointers to off-chain records

## QR Code Integration

### QR Code Content
The QR code will contain a URL pointing to a web interface displaying the pet's passport:

```
https://petpassport.app/view/[pet_token_address]
```

### Verification Process
1. Scan QR code with mobile app or web interface
2. Fetch on-chain data using pet token address
3. Display formatted passport information
4. Optionally verify record authenticity through signatures

### Security Considerations
- QR codes are public by nature
- Sensitive information should be stored off-chain
- Verification system to prevent counterfeit passports