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
    }
    uint256 public count = 0;
    mapping(uint256 => equb) public equbs;
    mapping(address => uint256) public activeEqubCount;
    event success(bool success);
    event equbId(uint256 Id);

    function createEqub(
        string memory _name,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        uint256 _maxMember
    ) public {
        equb storage newEqub = equbs[count];
        newEqub.owner = msg.sender;
        newEqub.name = _name;
        newEqub.contributionAmount = _contributionAmount;
        newEqub.cycleDuration = _cycleDuration;
        newEqub.maxMembers = _maxMember;
        newEqub.startTime = block.timestamp;
        newEqub.currentRound = 0;
        newEqub.isActive = false;
        newEqub.totalPool = 0;
        count++;

        emit success(true);
        emit equbId(count - 1);
    }
    function startEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to start it"
        );
        theEqub.isActive = true;
        emit success(true);
    }
    function endEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to end it"
        );
        require(
            theEqub.winners.length == theEqub.members.length,
            "All current members must win"
        );
        theEqub.isActive = false;
        emit success(true);
    }
    function pauseEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(
            theEqub.owner == msg.sender,
            "please you must be the owner to end it"
        );
        theEqub.isActive = false;
        emit success(true);
    }
    function joinEqub(uint256 _equbId) public {
        equb storage theEqub = equbs[_equbId];
        require(theEqub.isActive, "Equb not active");
        require(activeEqubCount[msg.sender] < 3, "maximum equb reached");
        require(theEqub.maxMembers > theEqub.members.length, "equb full");
        require(
            theEqub.membersInfo[msg.sender].joinedAt == 0,
            "user already existes"
        );
        theEqub.members.push(msg.sender);
        theEqub.membersInfo[msg.sender].joinedAt = block.timestamp;
        theEqub.membersInfo[msg.sender].hasPaidCurrentRound = false;
        theEqub.membersInfo[msg.sender].hasWon = false;
        activeEqubCount[msg.sender] += 1;
        emit success(true);
    }
    // function leaveEqub(uint256 _equbId) public {
    //     equb storage theEqub = equbs[_equbId];
    //     require(theEqub.membersInfo[msg.sender].joinedAt > 0, "Not a member");

    //     for (uint256 i; i < theEqub.members.length; i++) {
    //         if (theEqub.members[i] == msg.sender) {
    //             theEqub.members[i] = theEqub.members[
    //                 theEqub.members.length - 1
    //             ];
    //             theEqub.members.pop();
    //             break;
    //         }
    //     }
    //     delete theEqub.membersInfo[msg.sender];
    //     activeEqubCount[msg.sender]--;
    // }
    function getMembers(
        uint256 _equbId
    ) public view returns (address[] memory) {
        return equbs[_equbId].members;
    }
    function contribute(uint256 _equbId) public payable {
        equb storage theEqub = equbs[_equbId];

        require(theEqub.membersInfo[msg.sender].joinedAt > 0, "Not a member");
        require(theEqub.isActive, "Equb not active");

        require(
            !theEqub.membersInfo[msg.sender].hasPaidCurrentRound,
            "Already paid"
        );
        require(msg.value == theEqub.contributionAmount, "Incorrect amount");

        theEqub.membersInfo[msg.sender].hasPaidCurrentRound = true;
        theEqub.totalPool += msg.value;
        emit success(true);
    }
    function getContributionStatus(
        uint256 _equbId
    ) public view returns (member memory) {
        equb storage theEqub = equbs[_equbId];

        return theEqub.membersInfo[msg.sender];
    }
    function getTotalPool(uint256 _equbId) public view returns (uint256) {
        return equbs[_equbId].totalPool;
    }
    function selectWinner(uint256 _equbId, address _winnerAddress) public {
        equb storage theEqub = equbs[_equbId];

        require(msg.sender == theEqub.owner, "Not owner");
        require(
            theEqub.membersInfo[_winnerAddress].joinedAt > 0,
            "Not a member"
        );
        require(theEqub.totalPool > 0, "Empty pool");
        require(theEqub.isActive, "Equb not active");
        require(!theEqub.membersInfo[_winnerAddress].hasWon, "Already won");

        theEqub.membersInfo[_winnerAddress].hasWon = true;
        theEqub.winners.push(_winnerAddress);
        //payable(_winnerAddress).transfer(theEqub.totalPool);
        for (uint256 i; i < theEqub.members.length; i++) {
            address m = theEqub.members[i];
            theEqub.membersInfo[m].hasPaidCurrentRound = false;
        }
        (bool ok, ) = payable(_winnerAddress).call{value: theEqub.totalPool}(
            ""
        );
        if (ok) {
            theEqub.totalPool = 0;
            theEqub.currentRound += 1;
        }
        require(ok, "Transfer failed");
        emit success(true);
    }
    function getCurrentWinner(uint256 _equbId) public view returns (address) {
        equb storage theEqub = equbs[_equbId];
        require(theEqub.winners.length > 0, "No winners yet");
        return theEqub.winners[theEqub.winners.length - 1];
    }
    function getWinnersHistory(
        uint256 _equbId
    ) public view returns (address[] memory) {
        equb storage theEqub = equbs[_equbId];
        return theEqub.winners;
    }
}
