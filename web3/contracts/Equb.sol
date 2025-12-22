// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Equb {
    struct equb {
        address owner;
        string name;
        uint256 contributionAmount;
        uint256 cycleDuration;
        uint256 maxMembers;
        uint256 startTime;
        uint256 currentRound;
        bool isActive;
        address[] members;
        mapping(address => member) membersInfo;
        address[] winners;
        uint256 totalPool;
    }
    struct member {
        uint256 joinedAt;
        bool hasPaidCurrentRound;
        bool hasWon;
        uint256 currentEqubs;
    }
    uint256 public count = 0;
    mapping(uint256 => equb) public equbs;
    function createEqub(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMember,
        uint256 _startTime
    ) public {
        equb storage newEqub = equbs[count];
        newEqub.owner = msg.sender;
        newEqub.name = _name;
        newEqub.contributionAmount = _contributionAmount;
        newEqub.cycleDuration = _cycleDuration;
        newEqub.maxMembers = _maxMember;
        newEqub.startTime = _startTime;
        newEqub.currentRound = 0;
        newEqub.isActive = false;
        newEqub.totalPool = 0;
        count++;
    }
    function startEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to start it"
        );
        theEqub.isActive = true;
        theEqub.startTime = block.timestamp;
    }
    function endEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to end it"
        );
        require(
            theEqub.members.length == theEqub.winners.length,
            "sorry all users must win first"
        );
        theEqub.isActive = false;
    }
    function pauseEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to end it"
        );
        theEqub.isActive = false;
    }
    function joinEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        theEqub.members.push(msg.sender);
    }
    function leaveEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        for (uint256 i; i < theEqub.members.length; i++) {
            if (theEqub.members[i] == msg.sender) {
                theEqub.members[i] = theEqub.members[
                    theEqub.members.length - 1
                ];
                theEqub.members.pop();
                break;
            }
        }
    }
    function getMembers(
        uint256 _equbId
    ) public view returns (address[] memory) {
        return equbs[_equbId].members;
    }

    function contribute(uint256 _equbId) public payable {
        equb storage theEqub = equbs[_equbId];

        require(theEqub.membersInfo[msg.sender].joinedAt > 0, "Not a member");
        require(
            !theEqub.membersInfo[msg.sender].hasPaidCurrentRound,
            "Already paid"
        );
        require(msg.value == theEqub.contributionAmount, "Incorrect amount");

        theEqub.membersInfo[msg.sender].hasPaidCurrentRound = true;
        theEqub.totalPool += msg.value;
    }

    function getContributionStatus(uint256 _equbId) public view returns () {
        equb storage theEqub = equbs[_equbId];
    }
    function getTotalPool() public {}

    function selectWinner() public {}
    function getCurrentWinner() public {}
    function getWinnersHistory() public {}

    function withdrawFees() public {}
    function emergencyStop() public {}
}
