# On-Chain Pet Passport - Detailed UI Flow

## Overview
This document details the user interface flow for the On-Chain Pet Passport system, designed to work seamlessly with the SPL token-based smart contract structure. The UI abstracts blockchain complexity while providing secure access to pet passport data.

## 1. User Personas and Access Levels

### 1.1 Pet Owners (Primary Users)
- Full access to their pets' passports
- Can add basic information
- Can request record additions from veterinarians
- Can transfer ownership
- Can share passport via QR code

### 1.2 Veterinarians (Authorized Professionals)
- Can add health and vaccination records
- Can verify record authenticity
- Can view complete pet history
- Limited access to pets they've treated

### 1.3 Authorities (Border Control, Shelters)
- Read-only access for verification
- Can scan QR codes for quick validation
- Can view essential pet information
- Can check verification status

### 1.4 Public Viewers
- Limited read access
- Can view basic pet information if public
- Cannot see sensitive medical data

## 2. Core UI Components

### 2.1 Landing Page
- Hero section explaining the benefits of On-Chain Pet Passports
- Key features: Immutable records, easy verification, global accessibility
- Call-to-action buttons based on user type:
  - "Connect Wallet" for existing users
  - "Create New Passport" for new users
  - "Verify Passport" for authorities

### 2.2 Wallet Connection Interface
- Multi-wallet support (Phantom, Solflare, Backpack, etc.)
- Visual indication of connected wallet
- Network selector (Mainnet, Devnet)
- Disconnect option
- Wallet balance display

### 2.3 Dashboard View (Pet Owner)
- Grid or list view of owned pet passports
- Each passport card displays:
  - Pet photo
  - Pet name
  - Species and breed
  - Last updated timestamp
  - Verification status indicator
- Quick action buttons:
  - "View Details"
  - "Add Record" (disabled if not vet)
  - "Share QR Code"
  - "Transfer Ownership"

## 3. Pet Passport Creation Flow

### 3.1 Step 1: Pet Information Form
- Form fields with validation:
  - Pet name (required, text input)
  - Species (dropdown with common options)
  - Breed (conditional dropdown based on species)
  - Birth date (date picker)
  - Pet photo upload (image preview)
- "Next" button enabled only when required fields are filled

### 3.2 Step 2: Owner Confirmation
- Display connected wallet address as owner
- Option to set different initial owner (for gifts)
- Information about transaction fees
- "Confirm and Create" button

### 3.3 Step 3: Transaction Processing
- Visual progress indicator
- Transaction status updates:
  - "Preparing transaction..."
  - "Awaiting wallet approval..."
  - "Creating passport on-chain..."
  - "Storing metadata..."
- Success screen with:
  - New passport preview
  - QR code for sharing
  - "View Full Passport" button

## 4. Pet Passport Detail View

### 4.1 Header Section
- Large pet photo
- Pet name as page title
- Species and breed as subtitle
- Birth date and age calculation
- Owner information with wallet address (shortened)
- QR code prominently displayed

### 4.2 Tab Navigation
1. **Overview Tab**
   - Basic information summary
   - Ownership history timeline
   - Quick stats (total records, last updated)
   - Verification status badge

2. **Medical Records Tab**
   - Vaccination history table with:
     - Vaccine name
     - Date administered
     - Next due date
     - Veterinarian
     - Verification status
   - Health records timeline with:
     - Record type
     - Date
     - Description
     - Veterinarian
     - Documents (expandable)
   - "Add Vaccination Record" button (vet only)
   - "Add Health Record" button (vet only)

3. **Travel History Tab**
   - Map view of locations (if geolocation data available)
   - Timeline of travel events:
     - Location
     - Date
     - Event type
     - Notes
   - "Add Travel Record" button

4. **Documents Tab**
   - Grid view of uploaded documents
   - Document metadata (type, date, uploader)
   - Download options
   - "Upload Document" button (owner/vet only)

### 4.3 Action Bar
- Floating action bar visible on all tabs:
  - "Share QR Code" (primary action)
  - "Transfer Ownership"
  - "Add Record" (vet only)
  - "Verify Passport" (authority only)

## 5. Record Addition Flows

### 5.1 Vaccination Record Form
- Vaccine name (autocomplete from common vaccines)
- Date administered (date picker, defaults to today)
- Next due date (date picker, optional)
- Veterinarian name/ID (auto-filled for vets)
- Certificate upload (PDF/image)
- "Submit Record" button with fee estimation

### 5.2 Health Record Form
- Record type dropdown (Checkup, Surgery, Illness, Medication)
- Date (date picker)
- Description (rich text editor)
- Veterinarian name/ID (auto-filled for vets)
- Documents/photos upload (multiple files)
- "Submit Record" button

### 5.3 Travel Record Form
- Location (text input with autocomplete)
- Date (date picker)
- Event type (Travel, Relocation, Temporary Stay)
- Notes (textarea)
- "Add Travel Record" button

## 6. QR Code Integration UI

### 6.1 QR Code Display Modal
- Large, clear QR code visualization
- URL below QR code for manual entry
- "Download QR Code" button (PNG, SVG)
- "Share" button for mobile sharing
- "Print" option for physical copies
- Information about what the QR code contains

### 6.2 QR Code Scanner (Authority View)
- Camera access request
- Live camera view with scanning overlay
- Manual entry option for token address
- Scanning instructions
- Auto-processing when QR code detected

### 6.3 Verification Results Display
- Pet information in easy-to-read format
- Verification status badges
- Record summary (vaccinations, health, travel)
- Warning indicators (expired vaccinations, etc.)
- "View Full Details" option (if authorized)

## 7. Ownership Transfer Flow

### 7.1 Initiate Transfer
- "Transfer Ownership" button from passport detail view
- Confirmation dialog explaining implications
- Form for new owner's wallet address
- Optional message for transfer reason
- "Proceed" button

### 7.2 Review and Confirm
- Summary of transfer details:
  - Current owner (from wallet)
  - New owner (entered address)
  - Pet information
  - Transaction fee estimate
- Confirmation checkbox
- "Transfer Passport" button

### 7.3 Transaction Processing
- Progress indicator with steps:
  - "Preparing transfer..."
  - "Awaiting approval..."
  - "Processing on blockchain..."
- Transaction ID with explorer link
- Success confirmation with new owner information

## 8. Mobile Responsiveness

### 8.1 Mobile-Specific Features
- Bottom navigation bar for key sections
- Full-screen modals for forms
- Touch-friendly form elements with adequate spacing
- Camera integration for QR code scanning
- Biometric authentication where supported

### 8.2 Adaptive Layouts
- Single column layout for mobile
- Collapsible sections to save vertical space
- Horizontal scrolling for data tables
- Fixed action buttons at bottom of screen
- Larger touch targets for navigation

### 8.3 Offline Capabilities
- Cache recently viewed passports
- Save draft records locally
- Queue transactions for when online
- Display cached data with offline indicators

## 9. Verification Interface (Authority View)

### 9.1 Entry Point
- Dedicated verification page
- QR code scanner as primary input
- Manual token address entry as alternative
- Instructions for use

### 9.2 Verification Process
- Loading state while fetching data
- Visual indicators for verification progress
- Display of basic pet information
- Highlighting of important details (vaccinations, restrictions)
- Color-coded verification status

### 9.3 Results Display
- Clear pass/fail indication
- Detailed information based on access level
- Expiration warnings for vaccinations
- Recommendations for next steps
- Option to save verification for reporting

## 10. Error Handling and User Feedback

### 10.1 Transaction Errors
- Clear error messages for different failure types:
  - Insufficient funds
  - Network errors
  - Transaction simulation failures
  - User rejection
- Retry mechanisms where appropriate
- Links to help documentation

### 10.2 Form Validation
- Real-time validation as users type
- Clear error messages below fields
- Visual indicators for invalid fields
- Summary of all errors at form top

### 10.3 Loading States
- Skeleton screens for content loading
- Progress indicators for long operations
- Optimistic UI updates where appropriate
- Clear feedback for background processes

## 11. Accessibility Features

### 11.1 Visual Design
- High contrast color scheme
- Sufficient font sizes (minimum 16px for body text)
- Clear visual hierarchy
- Consistent navigation patterns

### 11.2 Screen Reader Support
- Proper heading structure
- ARIA labels for interactive elements
- Alternative text for images
- Keyboard navigation support

### 11.3 Motor Impairment Considerations
- Adequate touch target sizes (minimum 44px)
- Keyboard shortcuts for power users
- Reduced motion options
- Voice control compatibility

## 12. Performance Optimization

### 12.1 Data Loading
- Lazy loading for non-critical components
- Pagination for large record sets
- Caching of frequently accessed data
- Preloading of likely next views

### 12.2 UI Performance
- Optimized images with appropriate sizing
- Efficient component re-rendering
- Code splitting for faster initial load
- Service workers for offline capabilities

This detailed UI flow provides a comprehensive user experience that complements the SPL token-based smart contract structure, with particular attention to QR code integration for easy sharing and verification of pet passports.