import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Program ID on devnet
export const PET_PASSPORT_PROGRAM_ID = new PublicKey(
  'CxdvuzcrpqtJawZm8jDfKf7G92sQPehdtkrYdEoGzaTk'
);

// Metadata Program ID (Metaplex)
export const METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// Anchor account discriminator for PetData
const PET_DATA_DISCRIMINATOR = new Uint8Array([167, 1, 40, 45, 213, 3, 76, 101]);

// Instruction discriminators from IDL
export const DISCRIMINATORS = {
  CREATE_PET_PASSPORT: new Uint8Array([205, 90, 94, 251, 191, 195, 83, 241]),
  ADD_VACCINATION_RECORD: new Uint8Array([165, 255, 41, 165, 48, 119, 78, 190]),
  ADD_HEALTH_RECORD: new Uint8Array([63, 170, 214, 44, 34, 36, 92, 166]),
  ADD_LOCATION_RECORD: new Uint8Array([241, 237, 192, 179, 13, 219, 227, 182]),
};

// --- Borsh Serialization Helpers ---

function encodeString(str: string): Uint8Array {
  const encoded = new TextEncoder().encode(str);
  const buf = new Uint8Array(4 + encoded.length);
  new DataView(buf.buffer).setUint32(0, encoded.length, true);
  buf.set(encoded, 4);
  return buf;
}

function encodeI64(value: number): Uint8Array {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setInt32(0, value & 0xffffffff, true);
  view.setInt32(4, Math.floor(value / 0x100000000), true);
  return buf;
}

function decodeString(data: Uint8Array, offset: number): [string, number] {
  const len = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
  const str = new TextDecoder().decode(data.slice(offset + 4, offset + 4 + len));
  return [str, offset + 4 + len];
}

function decodeI64(data: Uint8Array, offset: number): [number, number] {
  const view = new DataView(data.buffer, data.byteOffset + offset);
  const lo = view.getUint32(0, true);
  const hi = view.getInt32(4, true);
  return [hi * 0x100000000 + lo, offset + 8];
}

function decodePubkey(data: Uint8Array, offset: number): [PublicKey, number] {
  const key = new PublicKey(data.slice(offset, offset + 32));
  return [key, offset + 32];
}

function decodeBool(data: Uint8Array, offset: number): [boolean, number] {
  return [data[offset] !== 0, offset + 1];
}

// --- Data Types ---

export interface VaccinationRecord {
  vaccineName: string;
  dateAdministered: number;
  nextDueDate: number;
  veterinarian: string;
  verified: boolean;
}

export interface HealthRecord {
  recordType: string;
  date: number;
  description: string;
  veterinarian: string;
  verified: boolean;
}

export interface LocationRecord {
  location: string;
  timestamp: number;
  eventType: string;
}

export interface PetData {
  name: string;
  species: string;
  breed: string;
  birthDate: number;
  owner: PublicKey;
  lastUpdated: number;
  vaccinationRecords: VaccinationRecord[];
  healthRecords: HealthRecord[];
  locationHistory: LocationRecord[];
}

// --- Deserialization ---

function decodeVaccinationRecord(data: Uint8Array, offset: number): [VaccinationRecord, number] {
  let vaccineName: string, dateAdministered: number, nextDueDate: number, veterinarian: string, verified: boolean;
  [vaccineName, offset] = decodeString(data, offset);
  [dateAdministered, offset] = decodeI64(data, offset);
  [nextDueDate, offset] = decodeI64(data, offset);
  [veterinarian, offset] = decodeString(data, offset);
  [verified, offset] = decodeBool(data, offset);
  return [{ vaccineName, dateAdministered, nextDueDate, veterinarian, verified }, offset];
}

function decodeHealthRecord(data: Uint8Array, offset: number): [HealthRecord, number] {
  let recordType: string, date: number, description: string, veterinarian: string, verified: boolean;
  [recordType, offset] = decodeString(data, offset);
  [date, offset] = decodeI64(data, offset);
  [description, offset] = decodeString(data, offset);
  [veterinarian, offset] = decodeString(data, offset);
  [verified, offset] = decodeBool(data, offset);
  return [{ recordType, date, description, veterinarian, verified }, offset];
}

function decodeLocationRecord(data: Uint8Array, offset: number): [LocationRecord, number] {
  let location: string, timestamp: number, eventType: string;
  [location, offset] = decodeString(data, offset);
  [timestamp, offset] = decodeI64(data, offset);
  [eventType, offset] = decodeString(data, offset);
  return [{ location, timestamp, eventType }, offset];
}

export function decodePetData(data: Uint8Array): PetData {
  let offset = 8; // skip 8-byte Anchor discriminator

  let name: string, species: string, breed: string, birthDate: number;
  let owner: PublicKey, lastUpdated: number;

  [name, offset] = decodeString(data, offset);
  [species, offset] = decodeString(data, offset);
  [breed, offset] = decodeString(data, offset);
  [birthDate, offset] = decodeI64(data, offset);
  [owner, offset] = decodePubkey(data, offset);
  [lastUpdated, offset] = decodeI64(data, offset);

  const vaccLen = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
  offset += 4;
  const vaccinationRecords: VaccinationRecord[] = [];
  for (let i = 0; i < vaccLen; i++) {
    let record: VaccinationRecord;
    [record, offset] = decodeVaccinationRecord(data, offset);
    vaccinationRecords.push(record);
  }

  const healthLen = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
  offset += 4;
  const healthRecords: HealthRecord[] = [];
  for (let i = 0; i < healthLen; i++) {
    let record: HealthRecord;
    [record, offset] = decodeHealthRecord(data, offset);
    healthRecords.push(record);
  }

  const locLen = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
  offset += 4;
  const locationHistory: LocationRecord[] = [];
  for (let i = 0; i < locLen; i++) {
    let record: LocationRecord;
    [record, offset] = decodeLocationRecord(data, offset);
    locationHistory.push(record);
  }

  return {
    name, species, breed, birthDate, owner, lastUpdated,
    vaccinationRecords, healthRecords, locationHistory,
  };
}

// --- Derive Metadata PDA ---

export function deriveMetadataAddress(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return metadata;
}

// --- Create Pet Passport Transaction ---

export async function createPetPassportTransaction(
  connection: Connection,
  owner: PublicKey,
  name: string,
  species: string,
  breed: string,
  birthDate: number,
): Promise<{ transaction: Transaction; petDataKeypair: Keypair; mintKeypair: Keypair }> {
  const petDataKeypair = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const metadata = deriveMetadataAddress(mintKeypair.publicKey);

  const instructionData = new Uint8Array([
    ...DISCRIMINATORS.CREATE_PET_PASSPORT,
    ...encodeString(name),
    ...encodeString(species),
    ...encodeString(breed),
    ...encodeI64(birthDate),
  ]);

  const transaction = new Transaction();

  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: petDataKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: metadata, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: PET_PASSPORT_PROGRAM_ID,
      data: Buffer.from(instructionData),
    })
  );

  return { transaction, petDataKeypair, mintKeypair };
}

// --- Add Vaccination Record Transaction ---

export function createAddVaccinationRecordInstruction(
  petDataPubkey: PublicKey,
  ownerPubkey: PublicKey,
  vaccineName: string,
  dateAdministered: number,
  nextDueDate: number,
  veterinarian: string,
): TransactionInstruction {
  const instructionData = new Uint8Array([
    ...DISCRIMINATORS.ADD_VACCINATION_RECORD,
    ...encodeString(vaccineName),
    ...encodeI64(dateAdministered),
    ...encodeI64(nextDueDate),
    ...encodeString(veterinarian),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: petDataPubkey, isSigner: false, isWritable: true },
      { pubkey: ownerPubkey, isSigner: true, isWritable: false },
    ],
    programId: PET_PASSPORT_PROGRAM_ID,
    data: Buffer.from(instructionData),
  });
}

// --- Add Health Record Transaction ---

export function createAddHealthRecordInstruction(
  petDataPubkey: PublicKey,
  ownerPubkey: PublicKey,
  recordType: string,
  date: number,
  description: string,
  veterinarian: string,
): TransactionInstruction {
  const instructionData = new Uint8Array([
    ...DISCRIMINATORS.ADD_HEALTH_RECORD,
    ...encodeString(recordType),
    ...encodeI64(date),
    ...encodeString(description),
    ...encodeString(veterinarian),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: petDataPubkey, isSigner: false, isWritable: true },
      { pubkey: ownerPubkey, isSigner: true, isWritable: false },
    ],
    programId: PET_PASSPORT_PROGRAM_ID,
    data: Buffer.from(instructionData),
  });
}

// --- Add Location Record Transaction ---

export function createAddLocationRecordInstruction(
  petDataPubkey: PublicKey,
  ownerPubkey: PublicKey,
  location: string,
  timestamp: number,
  eventType: string,
): TransactionInstruction {
  const instructionData = new Uint8Array([
    ...DISCRIMINATORS.ADD_LOCATION_RECORD,
    ...encodeString(location),
    ...encodeI64(timestamp),
    ...encodeString(eventType),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: petDataPubkey, isSigner: false, isWritable: true },
      { pubkey: ownerPubkey, isSigner: true, isWritable: false },
    ],
    programId: PET_PASSPORT_PROGRAM_ID,
    data: Buffer.from(instructionData),
  });
}

// --- Fetch all PetData accounts owned by this program ---

export async function fetchAllPets(connection: Connection): Promise<{ pubkey: PublicKey; data: PetData }[]> {
  const accounts = await connection.getProgramAccounts(PET_PASSPORT_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: Buffer.from(PET_DATA_DISCRIMINATOR).toString('base64'),
          encoding: 'base64',
        },
      },
    ],
  });

  const pets: { pubkey: PublicKey; data: PetData }[] = [];
  for (const account of accounts) {
    try {
      const petData = decodePetData(new Uint8Array(account.account.data));
      pets.push({ pubkey: account.pubkey, data: petData });
    } catch (e) {
      console.warn('Failed to decode pet data for', account.pubkey.toString(), e);
    }
  }
  return pets;
}

// --- Fetch pets for a specific owner ---

export async function fetchPetsByOwner(
  connection: Connection,
  owner: PublicKey
): Promise<{ pubkey: PublicKey; data: PetData }[]> {
  const allPets = await fetchAllPets(connection);
  return allPets.filter((pet) => pet.data.owner.equals(owner));
}

// --- Fetch single pet by pubkey ---

export async function fetchPetByPubkey(
  connection: Connection,
  pubkey: PublicKey,
): Promise<PetData | null> {
  try {
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) return null;
    return decodePetData(new Uint8Array(accountInfo.data));
  } catch (e) {
    console.warn('Failed to fetch pet data for', pubkey.toString(), e);
    return null;
  }
}
