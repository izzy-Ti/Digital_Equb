# Digital Equb - Web2 Backend API Documentation

## Overview

This is the Web2 backend for the Digital Equb system, which integrates with the Web3 smart contract to provide user management, data persistence, and API endpoints.

## Architecture

### Mental Split

- **Web3 (Smart Contract)**: Handles money, contributions, winner selection, and trust
- **Web2 (Backend)**: Handles users, authentication, UI metadata, analytics, and history

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB
- Ethereum node (local or remote RPC)

### Installation

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/digital-equb

# JWT
HASH_KEY=your-secret-key-here

# Email (NodeMailer)
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Blockchain
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...

# CORS
CLIENT_URL=http://localhost:5173
```

### Running the Server

```bash
npm start
```

Server will run on `http://localhost:4000`

## Database Models

### User

- `name`, `email`, `password`
- `walletAddress` - Linked Web3 wallet
- `isWalletLinked` - Boolean flag
- `phoneNumber`, `avatar` - Profile info
- `activeEqubCount` - Current active equbs (max 3)
- `totalWinnings` - Total amount won
- `role` - USER or ADMIN

### Equb

- `name`, `description`
- `contributionAmount`, `cycleDuration`, `maxMembers`
- `blockchainEqubId` - Maps to smart contract
- `contractAddress` - Smart contract address
- `status` - pending/active/paused/ended
- `creatorId`, `creatorWallet`
- `currentRound`, `totalPool`, `memberCount`

### EqubMember

- `equbId`, `userId`, `walletAddress`
- `joinOrder` - Position in rotation
- `hasWon` - Boolean flag
- `isActive` - Membership status

### Contribution

- `equbId`, `userId`, `amount`, `round`
- `txHash` - Blockchain transaction hash
- `status` - pending/confirmed/failed
- `blockNumber`, `timestamp`

### Winner

- `equbId`, `userId`, `walletAddress`
- `round`, `payoutAmount`, `payoutTxHash`
- `payoutStatus` - pending/completed/failed
- `blockNumber`, `selectedAt`

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/register`

Register new user

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/login`

Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/logout`

Logout user (clears cookie)

#### POST `/link-wallet`

Link wallet to user account

```json
{
  "userId": "user_id",
  "walletAddress": "0x..."
}
```

#### POST `/unlink-wallet`

Unlink wallet from user account

```json
{
  "userId": "user_id"
}
```

#### POST `/get-user-data`

Get user profile data

```json
{
  "userId": "user_id"
}
```

#### POST `/updateProfile`

Update user profile

```json
{
  "userId": "user_id",
  "name": "New Name",
  "avatar": "url",
  "phoneNumber": "+1234567890"
}
```

### Equb Management (`/api/equb`)

#### POST `/create`

Create new equb (after smart contract creation)

```json
{
  "userId": "user_id",
  "name": "Monthly Savings",
  "description": "Save together",
  "contributionAmount": "1000000000000000000",
  "cycleDuration": "2592000",
  "maxMembers": "10",
  "blockchainEqubId": "0",
  "contractAddress": "0x...",
  "creatorWallet": "0x..."
}
```

#### POST `/start`

Start equb

```json
{
  "equbId": "equb_id",
  "userId": "user_id"
}
```

#### POST `/pause`

Pause equb

```json
{
  "equbId": "equb_id",
  "userId": "user_id"
}
```

#### POST `/end`

End equb

```json
{
  "equbId": "equb_id",
  "userId": "user_id"
}
```

#### GET `/all?status=active&page=1&limit=10`

Get all equbs with filters

#### GET `/:equbId`

Get equb by ID with full details

#### GET `/creator/:userId`

Get equbs created by user

#### GET `/:equbId/stats`

Get equb statistics

#### POST `/sync`

Sync equb data from blockchain

```json
{
  "equbId": "equb_id",
  "currentRound": 1,
  "totalPool": "10000000000000000000",
  "isActive": true
}
```

### Membership (`/api/member`)

#### POST `/join`

Join an equb

```json
{
  "userId": "user_id",
  "equbId": "equb_id",
  "walletAddress": "0x..."
}
```

#### POST `/leave`

Leave an equb

```json
{
  "userId": "user_id",
  "equbId": "equb_id"
}
```

#### GET `/equb/:equbId`

Get all members of an equb

#### GET `/user/:userId`

Get user's equb memberships

#### GET `/check/:equbId/:userId`

Check if user is member

### Contributions (`/api/contribution`)

#### POST `/record`

Record contribution after blockchain transaction

```json
{
  "userId": "user_id",
  "equbId": "equb_id",
  "amount": "1000000000000000000",
  "round": 1,
  "txHash": "0x...",
  "blockNumber": 12345
}
```

#### POST `/update-status`

Update contribution status (called by event listener)

```json
{
  "txHash": "0x...",
  "status": "confirmed",
  "blockNumber": 12345
}
```

#### GET `/user/:userId`

Get user's contribution history

#### GET `/equb/:equbId?round=1`

Get equb's contributions (optional round filter)

#### GET `/tx/:txHash`

Get contribution by transaction hash

#### GET `/round/:equbId/:round`

Get round statistics

### Winners (`/api/winner`)

#### POST `/record`

Record winner after blockchain selection

```json
{
  "equbId": "equb_id",
  "userId": "user_id",
  "walletAddress": "0x...",
  "round": 1,
  "payoutAmount": "10000000000000000000",
  "payoutTxHash": "0x...",
  "blockNumber": 12345
}
```

#### POST `/update-status`

Update winner payout status

```json
{
  "payoutTxHash": "0x...",
  "status": "completed",
  "blockNumber": 12345
}
```

#### GET `/equb/:equbId`

Get all winners for an equb

#### GET `/equb/:equbId/current`

Get current/latest winner

#### GET `/user/:userId`

Get user's winning history

#### GET `/equb/:equbId/round/:round`

Get winner by round

#### GET `/equb/:equbId/eligible`

Get eligible members for next winner selection

### Admin (`/api/admin`)

#### GET `/stats`

Get system-wide statistics

#### GET `/activity?limit=50`

Get recent activity

#### GET `/equbs?page=1&limit=20&status=active`

Get all equbs (admin view)

#### POST `/equb/flag`

Flag equb for review

```json
{
  "equbId": "equb_id",
  "reason": "Suspicious activity"
}
```

#### GET `/users?page=1&limit=20&role=USER`

Get all users

#### GET `/user/:userId`

Get user details with stats

#### POST `/user/role`

Update user role

```json
{
  "userId": "user_id",
  "role": "ADMIN"
}
```

## Blockchain Integration

### Web3 Utilities (`utils/web3.js`)

- Provider setup
- Contract instances
- Helper functions (Wei/Ether conversion, signature verification)
- Transaction handling

### Event Listeners (`utils/eventListeners.js`)

Automatically syncs blockchain events with database:

- `EqubCreated` - New equb created
- `EqubStarted` - Equb activated
- `MemberJoined` - New member joined
- `ContributionMade` - Contribution recorded
- `WinnerSelected` - Winner selected and paid

## Workflow

### 1. User Registration & Wallet Linking

1. User registers via `/api/auth/register`
2. User links wallet via `/api/auth/link-wallet`

### 2. Creating an Equb

1. Frontend calls smart contract `createEqub()`
2. After blockchain confirmation, frontend calls `/api/equb/create`
3. Backend saves equb metadata
4. Creator calls `/api/equb/start` to activate

### 3. Joining an Equb

1. Frontend calls smart contract `joinEqub()`
2. After confirmation, frontend calls `/api/member/join`
3. Backend records membership

### 4. Contributing

1. Frontend calls smart contract `contribute()` with ETH
2. Event listener catches `ContributionMade` event
3. Backend automatically records contribution

### 5. Winner Selection

1. Creator calls smart contract `selectWinner()`
2. Event listener catches `WinnerSelected` event
3. Backend records winner and updates user's total winnings

## Security

- JWT authentication for protected routes
- Password hashing with bcrypt
- Wallet signature verification
- Input validation
- Rate limiting (recommended to add)
- CORS configuration

## Error Handling

All endpoints return JSON responses:

```json
{
  "success": true/false,
  "message": "Error or success message",
  "data": {}
}
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Configure environment variables**
3. **Deploy smart contract** and get contract address
4. **Update `.env`** with contract address
5. **Start server**: `npm start`
6. **Test endpoints** with Postman or frontend

## Notes

- Event listeners start automatically when `CONTRACT_ADDRESS` is set
- Max 3 active equbs per user (enforced in smart contract and backend)
- All amounts stored as strings to handle BigInt values
- Wallet addresses stored in lowercase for consistency
