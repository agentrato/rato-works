import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PetPassport } from "../target/types/pet_passport";
import { expect } from "chai";

describe("pet-passport", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PetPassport as Program<PetPassport>;

  // Generate a new keypair for the pet's mint
  const mint = anchor.web3.Keypair.generate();

  // Generate a new keypair for the pet data account
  const petData = anchor.web3.Keypair.generate();

  // Get the metadata program ID
  const metadataProgramId = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Derive the metadata account address
  const [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      metadataProgramId.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    metadataProgramId
  );

  it("Creates a new pet passport!", async () => {
    // Add your test here.
    const tx = await program.methods
      .createPetPassport("Fluffy", "Cat", "Persian", new anchor.BN(1625097600))
      .accounts({
        petData: petData.publicKey,
        owner: provider.wallet.publicKey,
        mint: mint.publicKey,
        metadata: metadata,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        metadataProgram: metadataProgramId,
      })
      .signers([petData, mint])
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the created pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the data
    expect(account.name).to.equal("Fluffy");
    expect(account.species).to.equal("Cat");
    expect(account.breed).to.equal("Persian");
    expect(account.birthDate.toNumber()).to.equal(1625097600);
    expect(account.owner.toString()).to.equal(provider.wallet.publicKey.toString());
  });

  it("Updates pet owner!", async () => {
    // Generate a new owner keypair
    const newOwner = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to the new owner for testing
    const airdropTx = await provider.connection.requestAirdrop(
      newOwner.publicKey,
      1000000000 // 1 SOL
    );
    await provider.connection.confirmTransaction(airdropTx);
    
    // Update the owner
    const tx = await program.methods
      .updateOwner(newOwner.publicKey)
      .accounts({
        petData: petData.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the updated pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the new owner
    expect(account.owner.toString()).to.equal(newOwner.publicKey.toString());
  });

  it("Adds a vaccination record!", async () => {
    // Add a vaccination record
    const tx = await program.methods
      .addVaccinationRecord(
        "Rabies",
        new anchor.BN(1640995200), // 2022-01-01
        new anchor.BN(1672531200), // 2023-01-01
        "Dr. Smith"
      )
      .accounts({
        petData: petData.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the updated pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the vaccination record
    expect(account.vaccinationRecords.length).to.equal(1);
    expect(account.vaccinationRecords[0].vaccineName).to.equal("Rabies");
    expect(account.vaccinationRecords[0].dateAdministered.toNumber()).to.equal(1640995200);
    expect(account.vaccinationRecords[0].nextDueDate.toNumber()).to.equal(1672531200);
    expect(account.vaccinationRecords[0].veterinarian).to.equal("Dr. Smith");
    expect(account.vaccinationRecords[0].verified).to.equal(false);
  });

  it("Adds a health record!", async () => {
    // Add a health record
    const tx = await program.methods
      .addHealthRecord(
        "Checkup",
        new anchor.BN(1640995200), // 2022-01-01
        "Annual checkup, all good",
        "Dr. Smith"
      )
      .accounts({
        petData: petData.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the updated pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the health record
    expect(account.healthRecords.length).to.equal(1);
    expect(account.healthRecords[0].recordType).to.equal("Checkup");
    expect(account.healthRecords[0].date.toNumber()).to.equal(1640995200);
    expect(account.healthRecords[0].description).to.equal("Annual checkup, all good");
    expect(account.healthRecords[0].veterinarian).to.equal("Dr. Smith");
    expect(account.healthRecords[0].verified).to.equal(false);
  });

  it("Adds a location record!", async () => {
    // Add a location record
    const tx = await program.methods
      .addLocationRecord(
        "New York",
        new anchor.BN(1640995200), // 2022-01-01
        "Moved"
      )
      .accounts({
        petData: petData.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the updated pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the location record
    expect(account.locationHistory.length).to.equal(1);
    expect(account.locationHistory[0].location).to.equal("New York");
    expect(account.locationHistory[0].timestamp.toNumber()).to.equal(1640995200);
    expect(account.locationHistory[0].eventType).to.equal("Moved");
  });

  it("Verifies a record!", async () => {
    // Verify the first vaccination record
    const tx = await program.methods
      .verifyRecord("vaccination", new anchor.BN(0))
      .accounts({
        petData: petData.publicKey,
        verifier: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Transaction signature", tx);

    // Fetch the updated pet data account
    const account = await program.account.petData.fetch(petData.publicKey);
    
    // Verify the vaccination record is now verified
    expect(account.vaccinationRecords[0].verified).to.equal(true);
  });
});