# On-Chain Pet Passport - UI/UX Flow

## Overview
This document details the user interface and user experience flow for the On-Chain Pet Passport system, designed to work seamlessly with the SPL token-based smart contract implementation. The UI abstracts blockchain complexity while providing secure access to pet passport data and QR code functionality.

## 1. User Personas

### 1.1 Pet Owners (Primary Users)
- Create and manage pet passports
- Add basic pet information
- Share passport via QR code
- Transfer ownership
- View all pet records

### 1.2 Veterinarians (Authorized Professionals)
- Add and verify health records
- View complete pet medical history
- Verify record authenticity
- Limited access to pets they've treated

### 1.3 Authorities (Border Control, Shelters)
- Verify pet passports via QR code
- View essential pet information
- Check verification status
- Access travel history

### 1.4 Public Viewers
- Limited read access to public information
- Cannot see sensitive medical data

## 2. Core UI Components

### 2.1 Landing Page
- Hero section with value proposition
- Key benefits: Immutable records, easy verification, global accessibility
- Call-to-action buttons:
  - "Connect Wallet" (existing users)
  - "Create New Passport" (new users)
  - "Verify Passport" (authorities)

### 2.2 Wallet Connection Interface
- Multi-wallet support (Phantom, Solflare, Backpack, etc.)
- Visual wallet address display
- Network selector (Mainnet, Devnet)
- Disconnect option
- Wallet balance information

### 2.3 Dashboard View (Pet Owner)
- Grid or list of owned pet passports
- Each passport card displays:
  - Pet photo (from metadata)
  - Pet name
  - Species and breed
  - Last updated timestamp
  - Verification status indicator
- Quick action buttons:
  - "View Details"
  - "Share QR Code"
  - "Transfer Ownership"

## 3. Pet Passport Creation Flow

### 3.1 Step 1: Pet Information Form
- Form fields with validation:
  - Pet name (required, text input, max 32 chars)
  - Species (dropdown with common options)
  - Breed (conditional dropdown based on species, max 32 chars)
  - Birth date (date picker)
  - Pet photo upload (JPG/PNG, preview)
- "Next" button enabled only when required fields are filled

### 3.2 Step 2: Review and Confirm
- Summary of all information
- Estimated transaction fees
- "Confirm and Create" button
- Back option to edit information

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
- Large pet photo from metadata
- Pet name as page title
- Species and breed as subtitle
- Birth date and calculated age
- Owner information with wallet address (shortened)
- QR code prominently displayed

### 4.2 Tab Navigation
1. **Overview Tab**
   - Basic information summary
   - Ownership history timeline
   - Quick stats (total records, last updated)
   - Verification status badge
   - "Share QR Code" button

2. **Medical Records Tab**
   - Vaccination history table:
     - Vaccine name
     - Date administered
     - Next due date (highlighted if soon)
     - Veterinarian
     - Verification status
   - Health records timeline:
     - Record type
     - Date
     - Description (truncated)
     - Veterinarian
     - Verification status
   - "Add Vaccination Record" button (owner/vet)
   - "Add Health Record" button (vet only)

3. **Travel History Tab**
   - Map view of locations (if geolocation data available)
   - Timeline of travel events:
     - Location
     - Arrival date
     - Departure date
     - Event type
     - Notes
   - "Add Travel Record" button

### 4.3 Action Bar
- Floating action bar visible on all tabs:
  - "Share QR Code" (primary action)
  - "Transfer Ownership"
  - "Add Record" (vet/owner)
  - "Verify Passport" (authority only)

## 5. QR Code Integration UI

### 5.1 QR Code Display Modal
- Large, clear QR code visualization
- URL below QR code for manual entry
- "Download QR Code" button (PNG, SVG)
- "Share" button for mobile sharing
- "Print" option for physical copies
- Information about what the QR code contains

### 5.2 QR Code Scanner (Authority View)
- Camera access request
- Live camera view with scanning overlay
- Manual entry option for mint address
- Scanning instructions
- Auto-processing when QR code detected

### 5.3 Verification Results Display
- Pet information in easy-to-read format
- Verification status badges
- Record summary (vaccinations, health, travel)
- Warning indicators (expired vaccinations, etc.)
- "View Full Details" option (if authorized)

## 6. Record Management Flows

### 6.1 Vaccination Record Form
- Vaccine name (autocomplete from common vaccines)
- Date administered (date picker, defaults to today)
- Next due date (date picker, optional)
- Veterinarian name/ID (auto-filled for vets)
- Certificate upload (PDF/image)
- "Submit Record" button with fee estimation

### 6.2 Health Record Form
- Record type dropdown (Checkup, Surgery, Illness, Medication)
- Date (date picker)
- Description (rich text editor, max 200 chars)
- Veterinarian name/ID (auto-filled for vets)
- Documents/photos upload (multiple files)
- "Submit Record" button

### 6.3 Travel Record Form
- Location (text input with autocomplete)
- Arrival date (date picker)
- Departure date (date picker, optional)
- Event type (Travel, Relocation, Temporary Stay)
- Notes (textarea, max 100 chars)
- "Add Travel Record" button

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

## 13. Security Considerations in UI

### 13.1 Transaction Confirmation
- Clear display of transaction details before signing
- Fee estimation and breakdown
- Warning for high-value transactions
- Confirmation dialog for irreversible actions

### 13.2 Data Privacy Indicators
- Visual indicators for public vs. private data
- Access level badges
- Warning when sharing sensitive information
- Clear explanation of data visibility

### 13.3 Phishing Prevention
- Clear display of official URLs
- Warning for external links
- Verification of smart contract addresses
- Education about wallet security

This UI/UX flow provides a comprehensive user experience that complements the SPL token-based smart contract implementation, with particular attention to QR code integration for easy sharing and verification of pet passports.