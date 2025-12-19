WEB3 (Smart Contract side)

Core Equb Struct
- Equb
  - id
  - owner
  - name
  - contributionAmount
  - cycleDuration
  - maxMembers
  - startTime
  - currentRound
  - isActive
  - members
  - winners
  - totalPool

Member Struct
- Member
  - wallet
  - joinedAt
  - hasPaidCurrentRound
  - hasWon


Web3 Function Names

Equb lifecycle
- createEqub
- startEqub
- endEqub
- pauseEqub

Membership
- joinEqub
- leaveEqub
- getMembers

Payments
- contribute
- getContributionStatus
- getTotalPool

Rotation / Winner
- selectWinner
- getCurrentWinner
- getWinnersHistory

Security / Admin
- withdrawFees
- emergencyStop



WEB2 (Backend side)

Models

User
- id
- name
- email
- password
- walletAddress
- role

Equb
- id
- name
- contributionAmount
- cycleDuration
- maxMembers
- status
- creatorId

EqubMember
- id
- equbId
- userId
- joinOrder
- hasWon

Contribution
- id
- equbId
- userId
- amount
- round
- txHash
- status

Winner
- id
- equbId
- userId
- round
- payoutStatus


Controllers

AuthController
- register
- login
- logout

EqubController
- createEqub
- getEqubs
- getEqubById
- startEqub
- closeEqub

MemberController
- joinEqub
- leaveEqub
- listMembers

ContributionController
- recordContribution
- getUserContributions
- getEqubContributions

WinnerController
- assignWinner
- getWinners

AdminController
- getReports
- monitorEqubs
- flagEqub


Mental split
- Web3 → money, rotation, trust
- Web2 → users, UI, analytics, history
