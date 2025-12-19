// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;


contract Equb {
    struct equb{
        address owner;
        string name;
        
    }
    mapping(uint256 => equb) public equbs;
    function createEqub(string _name ,  ){

    }
}
