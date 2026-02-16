# On-Chain Pet Passport - Smart Contract Logic

## Overview
This document details the smart contract implementation for the On-Chain Pet Passport system, focusing on how pet records are stored using SPL tokens and metadata, and how the QR code system enables easy sharing of records.

## 1. Core Architecture

### 1.1 SPL Token Implementation
Each pet passport is represented by a unique SPL token, leveraging the Metaplex Token Metadata program for rich metadata capabilities.

#### Token Structure
- **Token Standard**: SPL Token (Non-Fungible)
- **Mint Account**: One per pet, with supply of exactly 1 token
- **Decimals**: 0 (non-fungible)
- **Token Account**: Holds the single passport token for the owner

#### Metaplex Integration
- Uses Metaplex Token Metadata program for enhanced metadata
- Creates metadata and master edition accounts for each pet
- Enables future collectible features if desired

### 1.2 Account Structure

#### Pet Data Account (PDA)
```rust
#[account]
pub struct PetData {
    pub name: String,              // Pet's name (max 32 chars)
    pub species: String,           // Species (max 16 chars)
    pub breed: String,             // Breed (max 32 chars)
    pub birth_date: i64,           // Unix timestamp of birth date
    pub owner: Pubkey,             // Current owner's wallet address
    pub creation_date: i64,        // Unix timestamp of passport creation
    pub last_updated: i64,         // Last modification timestamp
    pub vaccination_count: u32,    // Number of vaccination records
    pub health_record_count: u32,  // Number of health records
    pub travel_record_count: u32,  // Number of travel records
    pub is_verified: bool,         // Overall verification status
    pub bump: u8,                  // PDA bump seed
}
```

#### Record Accounts
Each type of record has its own account structure for efficient querying:

```rust
#[account]
pub struct VaccinationRecord {
    pub pet_mint: Pubkey,          // Reference to pet's mint account
    pub vaccine_name: String,      // Name of vaccine (max 32 chars)
    pub date_administered: i64,    // When vaccine was given
    pub next_due_date: i64,        // When next dose is due
    pub veterinarian: Pubkey,      // Vet who administered vaccine
    pub is_verified: bool,         // Whether record is verified
    pub off_chain_data_hash: [u8; 32], // Hash of off-chain data
    pub bump: u8,                  // PDA bump seed
}

#[account]
pub struct HealthRecord {
    pub pet_mint: Pubkey,          // Reference to pet's mint account
    pub record_type: String,       // Type: Checkup, Surgery, etc. (max 16 chars)
    pub date: i64,                 // Date of record
    pub description: String,       // Description of record (max 200 chars)
    pub veterinarian: Pubkey,      // Vet who created record
    pub is_verified: bool,         // Whether record is verified
    pub off_chain_data_hash: [u8; 32], // Hash of detailed off-chain data
    pub bump: u8,                  // PDA bump seed
}

#[account]
pub struct TravelRecord {
    pub pet_mint: Pubkey,          // Reference to pet's mint account
    pub location: String,          // Location description (max 64 chars)
    pub arrival_date: i64,         // When pet arrived
    pub departure_date: i64,       // When pet departed (0 if still there)
    pub event_type: String,        // Type: Travel, Relocation, etc. (max 16 chars)
    pub notes: String,             // Additional notes (max 100 chars)
    pub off_chain_data_hash: [u8; 32], // Hash of detailed off-chain data
    pub bump: u8,                  // PDA bump seed
}
```

## 2. Metadata Management

### 2.1 On-Chain Metadata
Stored in the PetData PDA account:
- Name, species, breed, birth date
- Ownership information
- Record counters for pagination
- Verification status

### 2.2 Off-Chain Metadata (IPFS)
Rich metadata stored via Metaplex:
```json
{
  "name": "Pet Passport: [Pet Name]",
  "symbol": "PETPASS",
  "description": "On-chain passport for [Pet Name]",
  "image": "https://ipfs.io/ipfs/[CID]/[pet_photo].jpg",
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
      "trait_type": "Created",
      "value": "[YYYY-MM-DD]"
    },
    {
      "trait_type": "Vaccination Records",
      "value": "[count]"
    },
    {
      "trait_type": "Health Records",
      "value": "[count]"
    }
  ],
  "external_url": "https://petpassport.app/view/[mint_address]",
  "collection": {
    "name": "On-Chain Pet Passports",
    "family": "PetPassport"
  }
}
```

### 2.3 Data Synchronization
- On-chain counters track record counts
- Off-chain metadata contains detailed information
- Hashes stored on-chain for verification of off-chain data
- Timestamps ensure data freshness

## 3. Core Smart Contract Functions

### 3.1 Create Pet Passport
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
    
    let clock = Clock::get()?;
    
    // Initialize pet data
    let pet_data = &mut ctx.accounts.pet_data;
    pet_data.name = name;
    pet_data.species = species;
    pet_data.breed = breed;
    pet_data.birth_date = birth_date;
    pet_data.owner = ctx.accounts.payer.key();
    pet_data.creation_date = clock.unix_timestamp;
    pet_data.last_updated = clock.unix_timestamp;
    pet_data.vaccination_count = 0;
    pet_data.health_record_count = 0;
    pet_data.travel_record_count = 0;
    pet_data.is_verified = false;
    pet_data.bump = ctx.bumps.pet_data;
    
    // Emit event for indexing
    emit!(PetPassportCreated {
        mint: ctx.accounts.mint.key(),
        owner: ctx.accounts.payer.key(),
        name: pet_data.name.clone(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```

### 3.2 Add Vaccination Record
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
    
    let clock = Clock::get()?;
    
    // Create vaccination record
    let record = &mut ctx.accounts.vaccination_record;
    record.pet_mint = ctx.accounts.pet_data.key();
    record.vaccine_name = vaccine_name;
    record.date_administered = date_administered;
    record.next_due_date = next_due_date;
    record.veterinarian = ctx.accounts.owner.key(); // Will update when verified
    record.is_verified = false;
    record.off_chain_data_hash = [0; 32]; // Will update with IPFS hash
    record.bump = ctx.bumps.vaccination_record;
    
    // Update pet data
    ctx.accounts.pet_data.vaccination_count += 1;
    ctx.accounts.pet_data.last_updated = clock.unix_timestamp;
    
    // Emit event
    emit!(VaccinationRecordAdded {
        pet_mint: ctx.accounts.pet_data.key(),
        vaccine_name: record.vaccine_name.clone(),
        date_administered: record.date_administered,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```

### 3.3 Verify Record
```rust
pub fn verify_record(
    ctx: Context<VerifyRecord>,
    data_hash: [u8; 32],
) -> Result<()> {
    // In a full implementation, this would check if the verifier
    // is an authorized veterinarian
    // require!(is_authorized_vet(ctx.accounts.verifier.key()), 
    //         PetPassportError::UnauthorizedVet);
    
    let clock = Clock::get()?;
    
    // Update record verification
    ctx.accounts.record.is_verified = true;
    ctx.accounts.record.veterinarian = ctx.accounts.verifier.key();
    ctx.accounts.record.off_chain_data_hash = data_hash;
    
    // Update pet's overall verification status
    ctx.accounts.pet_data.is_verified = true;
    ctx.accounts.pet_data.last_updated = clock.unix_timestamp;
    
    // Emit event
    emit!(RecordVerified {
        pet_mint: ctx.accounts.pet_data.key(),
        verifier: ctx.accounts.verifier.key(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```

### 3.4 Transfer Ownership
```rust
pub fn transfer_ownership(
    ctx: Context<TransferOwnership>,
    new_owner: Pubkey,
) -> Result<()> {
    // Verify current owner
    require!(
        ctx.accounts.pet_data.owner == ctx.accounts.current_owner.key(),
        PetPassportError::Unauthorized
    );
    
    let clock = Clock::get()?;
    
    // Update ownership
    ctx.accounts.pet_data.owner = new_owner;
    ctx.accounts.pet_data.last_updated = clock.unix_timestamp;
    
    // Emit event
    emit!(OwnershipTransferred {
        pet_mint: ctx.accounts.pet_data.key(),
        previous_owner: ctx.accounts.current_owner.key(),
        new_owner,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```

## 4. QR Code System Implementation

### 4.1 QR Code Content Structure
The QR code contains a URL that points to the pet's passport data:

```
Primary URL: https://petpassport.app/view/[mint_address]
Fallback: solana:[mint_address]?cluster=mainnet-beta
```

### 4.2 QR Code Data Components
1. **Pet Mint Address**: Primary identifier for the pet passport
2. **Verification Endpoint**: URL for the verification service
3. **Fallback Information**: Raw mint address for manual entry

### 4.3 Verification Flow Implementation
1. **QR Code Generation**: When a passport is created, generate a QR code containing the verification URL
2. **Scanning Process**: 
   - User scans QR code with mobile app or web interface
   - System extracts mint address from URL
   - Fetches on-chain data using the mint address
3. **Data Retrieval**:
   - Query PetData account for core information
   - Retrieve metadata from Metaplex
   - Fetch record counts for pagination
4. **Display**:
   - Format data in user-friendly interface
   - Show verification status
   - Display record summaries with expiration warnings

### 4.4 Security Considerations for QR System
- QR codes are inherently public, so no sensitive data should be directly encoded
- All sensitive information is stored off-chain with access controls
- Verification status is clearly displayed to prevent fraud
- Record hashes enable verification of off-chain data authenticity

## 5. Account Constraints and Contexts

### 5.1 CreatePetPassport Context
```rust
#[derive(Accounts)]
pub struct CreatePetPassport<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + 256, // Discriminator + PetData size
        seeds = [b"pet", mint.key().as_ref()],
        bump
    )]
    pub pet_data: Account<'info, PetData>,
    
    /// CHECK: Verified by Metaplex
    pub metadata: UncheckedAccount<'info>,
    
    /// CHECK: New mint account
    #[account(mut)]
    pub mint: Signer<'info>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: Verified by Metaplex
    pub metadata_program: UncheckedAccount<'info>,
}
```

### 5.2 AddVaccinationRecord Context
```rust
#[derive(Accounts)]
pub struct AddVaccinationRecord<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"pet", pet_data.key().as_ref()],
        bump = pet_data.bump
    )]
    pub pet_data: Account<'info, PetData>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + 256, // Discriminator + VaccinationRecord size
        seeds = [b"vaccination", pet_data.key().as_ref(), 
                 pet_data.vaccination_count.to_le_bytes().as_ref()],
        bump
    )]
    pub vaccination_record: Account<'info, VaccinationRecord>,
    
    pub system_program: Program<'info, System>,
}
```

## 6. Error Handling

```rust
#[error_code]
pub enum PetPassportError {
    #[msg("Pet name is too long")]
    NameTooLong,
    #[msg("Species name is too long")]
    SpeciesTooLong,
    #[msg("Breed name is too long")]
    BreedTooLong,
    #[msg("Invalid birth date")]
    InvalidBirthDate,
    #[msg("Vaccine name is too long")]
    VaccineNameTooLong,
    #[msg("Invalid date")]
    InvalidDate,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Unauthorized veterinarian")]
    UnauthorizedVet,
}
```

## 7. Events for Indexing

```rust
#[event]
pub struct PetPassportCreated {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub timestamp: i64,
}

#[event]
pub struct VaccinationRecordAdded {
    pub pet_mint: Pubkey,
    pub vaccine_name: String,
    pub date_administered: i64,
    pub timestamp: i64,
}

#[event]
pub struct RecordVerified {
    pub pet_mint: Pubkey,
    pub verifier: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OwnershipTransferred {
    pub pet_mint: Pubkey,
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}
```

## 8. Data Storage Efficiency

### 8.1 Account Size Optimization
- PetData: ~256 bytes (efficient storage)
- Record accounts: ~256 bytes each
- Rent cost minimized through proper sizing

### 8.2 Off-Chain Data Strategy
- Detailed records stored on IPFS
- On-chain stores only hashes for verification
- Metadata contains summary information
- Record counts enable pagination

### 8.3 PDA Seeding Strategy
- PetData: `["pet", mint_address]`
- VaccinationRecord: `["vaccination", pet_mint, vaccination_count]`
- HealthRecord: `["health", pet_mint, health_record_count]`
- TravelRecord: `["travel", pet_mint, travel_record_count]`

This smart contract logic provides a solid foundation for the On-Chain Pet Passport system, with efficient data storage using SPL tokens and metadata, and a QR code system for easy sharing and verification of pet records.