// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    struct User {
        string firstName;
        string lastName;
        string email;
        bool isRegistered;
    }

    mapping(address => User) public users;

    function register(string memory _firstName, string memory _lastName, string memory _email) public {
        require(!users[msg.sender].isRegistered, "Already registered");
        users[msg.sender] = User(_firstName, _lastName, _email, true);
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }
}

