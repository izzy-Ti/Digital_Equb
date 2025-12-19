// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;


contract Equb {
    struct equb{
        address owner;
        string name;
        uint256 contributionAmount;
        uint256 cycleDuration;
        uint256 maxMembers;
        uint256 startTime;
        uint256 currentRound = 0;
        bool isActive = true;
        address[] members;
        address[] winners;
        uint256 totalPool;
    }
    struct member{
        address wallet;
        uint256 joinedAt;
        bool hasPaidCurrentRound;
        bool hasWon;
        uint256 currentEqubs;
    }
    uint256 count = 0;
    mapping(uint256 => equb) public equbs;
    function createEqub(string _name , address _to, uint256 _contributionAmount,uint256 _cycleDuration, uint256 _maxMembers   ){
        equb memory Equb = equbs[count];
        Equb.owner = msg.sender;
        Equb.name = _name;
        Equb.
        count ++;
    }
    function startEqub(){

    }
    function endEqub(){

    }
    function pauseEqub(){

    }
}
