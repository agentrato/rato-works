use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata,
        mpl_token_metadata::types::DataV2,
    },
    token::{Mint, Token},
};

declare_id!("CxdvuzcrpqtJawZm8jDfKf7G92sQPehdtkrYdEoGzaTk");

#[program]
pub mod pet_passport {
    use super::*;

    pub fn create_pet_passport(
        ctx: Context<CreatePetPassport>,
        name: String,
        species: String,
        breed: String,
        birth_date: i64,
    ) -> Result<()> {
        // Initialize pet data account
        let pet_data = &mut ctx.accounts.pet_data;
        pet_data.name = name.clone();
        pet_data.species = species;
        pet_data.breed = breed;
        pet_data.birth_date = birth_date;
        pet_data.owner = ctx.accounts.owner.key();
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        
        // Create metadata for the token
        let metadata_ctx = ctx.accounts.into_create_metadata_accounts_v3();
        let data_v2 = DataV2 {
            name: format!("Pet Passport: {}", name),
            symbol: "PPT".to_string(),
            uri: "".to_string(), // Will be updated later with IPFS URI
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };
        
        create_metadata_accounts_v3(
            metadata_ctx,
            data_v2,
            true,  // is_mutable
            true,  // update_authority_is_seeder
            None,  // collection_details
        )?;
        
        Ok(())
    }

    pub fn update_owner(
        ctx: Context<UpdateOwner>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let pet_data = &mut ctx.accounts.pet_data;
        pet_data.owner = new_owner;
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn add_vaccination_record(
        ctx: Context<AddRecord>,
        vaccine_name: String,
        date_administered: i64,
        next_due_date: i64,
        veterinarian: String,
    ) -> Result<()> {
        let pet_data = &mut ctx.accounts.pet_data;
        let record = VaccinationRecord {
            vaccine_name,
            date_administered,
            next_due_date,
            veterinarian,
            verified: false,
        };
        pet_data.vaccination_records.push(record);
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn add_health_record(
        ctx: Context<AddRecord>,
        record_type: String,
        date: i64,
        description: String,
        veterinarian: String,
    ) -> Result<()> {
        let pet_data = &mut ctx.accounts.pet_data;
        let record = HealthRecord {
            record_type,
            date,
            description,
            veterinarian,
            verified: false,
        };
        pet_data.health_records.push(record);
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn add_location_record(
        ctx: Context<AddRecord>,
        location: String,
        timestamp: i64,
        event_type: String,
    ) -> Result<()> {
        let pet_data = &mut ctx.accounts.pet_data;
        let record = LocationRecord {
            location,
            timestamp,
            event_type,
        };
        pet_data.location_history.push(record);
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn verify_record(
        ctx: Context<VerifyRecord>,
        record_type: String,
        record_index: u32,
    ) -> Result<()> {
        let pet_data = &mut ctx.accounts.pet_data;
        let verifier = &ctx.accounts.verifier;
        
        // Check if verifier is authorized (in a real implementation, 
        // this would check against a list of authorized veterinarians)
        require!(
            verifier.key() != Pubkey::default(),
            PetPassportError::UnauthorizedVerifier
        );
        
        // Verify the record based on type and index
        match record_type.as_str() {
            "vaccination" => {
                if let Some(record) = pet_data.vaccination_records.get_mut(record_index as usize) {
                    record.verified = true;
                } else {
                    return err!(PetPassportError::RecordNotFound);
                }
            },
            "health" => {
                if let Some(record) = pet_data.health_records.get_mut(record_index as usize) {
                    record.verified = true;
                } else {
                    return err!(PetPassportError::RecordNotFound);
                }
            },
            _ => return err!(PetPassportError::InvalidRecordType),
        }
        
        pet_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn get_pet_data(
        _ctx: Context<GetPetData>,
    ) -> Result<()> {
        // This function is primarily for client-side fetching
        // The actual data retrieval happens off-chain
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePetPassport<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 32 + 8 + 32 + 8 + 4 + (32 * 10) + 4 + (32 * 10) + 4 + (32 * 10)
    )]
    pub pet_data: Account<'info, PetData>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = owner,
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: This account is checked in the instruction
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> CreatePetPassport<'info> {
    pub fn into_create_metadata_accounts_v3(&self) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let cpi_program = self.metadata_program.to_account_info();
        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: self.metadata.to_account_info(),
            mint: self.mint.to_account_info(),
            mint_authority: self.owner.to_account_info(),
            payer: self.owner.to_account_info(),
            update_authority: self.owner.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct UpdateOwner<'info> {
    #[account(mut)]
    pub pet_data: Account<'info, PetData>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddRecord<'info> {
    #[account(mut)]
    pub pet_data: Account<'info, PetData>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyRecord<'info> {
    #[account(mut)]
    pub pet_data: Account<'info, PetData>,
    pub verifier: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetPetData<'info> {
    pub pet_data: Account<'info, PetData>,
}

#[account]
pub struct PetData {
    pub name: String,           // 32 bytes
    pub species: String,        // 32 bytes
    pub breed: String,          // 32 bytes
    pub birth_date: i64,        // 8 bytes
    pub owner: Pubkey,          // 32 bytes
    pub last_updated: i64,      // 8 bytes
    pub vaccination_records: Vec<VaccinationRecord>, // 4 + (32 * 10) bytes
    pub health_records: Vec<HealthRecord>,           // 4 + (32 * 10) bytes
    pub location_history: Vec<LocationRecord>,       // 4 + (32 * 10) bytes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VaccinationRecord {
    pub vaccine_name: String,       // 32 bytes
    pub date_administered: i64,     // 8 bytes
    pub next_due_date: i64,         // 8 bytes
    pub veterinarian: String,       // 32 bytes
    pub verified: bool,             // 1 byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HealthRecord {
    pub record_type: String,        // 32 bytes
    pub date: i64,                  // 8 bytes
    pub description: String,        // 64 bytes
    pub veterinarian: String,       // 32 bytes
    pub verified: bool,             // 1 byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LocationRecord {
    pub location: String,           // 64 bytes
    pub timestamp: i64,             // 8 bytes
    pub event_type: String,         // 32 bytes
}

#[error_code]
pub enum PetPassportError {
    #[msg("The verifier is not authorized to verify records")]
    UnauthorizedVerifier,
    #[msg("The specified record was not found")]
    RecordNotFound,
    #[msg("Invalid record type specified")]
    InvalidRecordType,
}