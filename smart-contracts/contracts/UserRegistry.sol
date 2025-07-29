// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UserRegistry {
    enum Role { ADMIN, STUDENT, INSTITUTION, VERIFIER }

    struct User {
        string firstName;
        string middleName;
        string lastName;
        string sex;
        string email;
        string institutionName;
        string institutionPosition;
        string accreditationInfo;
        string studentId;
        string college;
        string department;
        string major;
        Role role;
        bool isRegistered;
    }

    mapping(address => User) private users;

    modifier onlyUnregistered() {
        require(!users[msg.sender].isRegistered, "User already registered");
        _;
    }

    function registerUser(
        address userAddress,
        string memory _firstName,
        string memory _middleName,
        string memory _lastName,
        string memory _sex,
        string memory _email,
        string memory _institutionName,
        string memory _institutionPosition,
        string memory _accreditationInfo,
        string memory _studentId,
        string memory _college,
        string memory _department,
        string memory _major,
        Role _role
    ) public onlyUnregistered {
        users[userAddress] = User({
            firstName: _firstName,
            middleName: _middleName,
            lastName: _lastName,
            sex: _sex,
            email: _email,
            institutionName: _institutionName,
            institutionPosition: _institutionPosition,
            accreditationInfo: _accreditationInfo,
            studentId: _studentId,
            college: _college,
            department: _department,
            major: _major,
            role: _role,
            isRegistered: true
        });
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }

    function isRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }
}

