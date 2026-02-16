# On-Chain Pet Passport - UI Flow

## Overview
The UI for the On-Chain Pet Passport will be a mobile-first web application that allows pet owners to manage their pet's passport, view records, and share information via QR codes. Veterinarians will have a separate portal to add and verify records.

## User Roles
1. **Pet Owner** - Views and manages pet passports
2. **Veterinarian** - Adds and verifies medical records
3. **General Public** - Scans QR codes to view public pet information

## Pet Owner UI Flow

### 1. Onboarding
- Wallet connection (Phantom, Solflare, etc.)
- Welcome screen explaining the system
- Option to create new pet passport or import existing

### 2. Dashboard
- List of owned pets (each represented by their PPT token)
- Quick actions:
  - Add new pet
  - View QR code
  - Add record (for self-verified events like travel)
- Summary of each pet:
  - Name and photo
  - Last updated timestamp
  - Upcoming vaccination dates

### 3. Pet Profile
- Pet information (name, species, breed, birth date)
- Photo gallery
- Tabbed interface for different record types:
  - Vaccinations
  - Health Records
  - Location History
- "Add Record" button for each section
- QR Code display section
- "Transfer Ownership" option

### 4. QR Code Display
- Large, clear QR code
- Text explanation of what the QR code contains
- Option to share via social media or messaging apps
- Download QR code as image

### 5. Add Record Flow
- Select record type (vaccination, health event, location)
- Form fields specific to record type:
  - Vaccination: Name, date administered, next due date
  - Health: Type, date, description
  - Location: Location, date, event type
- Option to upload supporting documents (stored off-chain)
- Preview and confirm before submitting

## Veterinarian UI Flow

### 1. Onboarding
- Professional verification process
- Wallet connection
- Clinic information setup

### 2. Dashboard
- List of pets seen recently
- Pending verification requests
- Search by pet token address or owner wallet

### 3. Add Record Flow
- Search for pet by token address or owner wallet
- Verify pet ownership on-chain
- Form fields for record type:
  - Vaccination: Name, date administered, next due date, lot number
  - Health: Type, date, description, diagnosis, treatment
- Option to upload supporting documents
- Digital signature for verification
- Submit for on-chain recording

### 4. Verification Requests
- List of records pending verification
- Details of each record
- Approve or reject with reason

## Public Viewer UI Flow

### 1. QR Code Scan
- Mobile app or web interface for scanning QR codes
- Camera access for scanning or file upload for image

### 2. Pet Information Display
- Basic pet information
- Photo
- Vaccination summary (next due dates)
- Health status summary (if public)
- Owner contact information (if shared)
- Verification status of records

### 3. Record Details
- Detailed view of individual records
- Verification badges
- Timestamps and veterinarian information

## Technical Considerations

### Wallet Integration
- Solana Wallet Adapter for multiple wallet support
- Automatic network switching to devnet/mainnet
- Transaction signing for record updates

### Data Display
- Efficient fetching of on-chain data
- Caching of off-chain metadata
- Loading states for data retrieval
- Error handling for failed data fetches

### Security
- Client-side only wallet interactions
- No private key storage
- Verification of on-chain data authenticity
- Protection against phishing attempts

### Responsive Design
- Mobile-first approach
- Touch-friendly interface elements
- Optimized for both portrait and landscape modes
- Offline capability for viewing cached data