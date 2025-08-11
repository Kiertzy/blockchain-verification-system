// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        string nameOfInstitution;
        string nameOfCert;
        string nameOfStudent;
        string college;
        string course;
        string major;
        string certStatus;
        string certHash; 
        address walletAddressOfStudent;
        address walletAddressOfInstitution;
        string imageOfCertificate; // Store IPFS hash or URL
        uint256 dateIssued;
    }

    mapping(address => Certificate[]) private studentCertificates;

    event CertificateIssued(
        address indexed institution,
        address indexed student,
        string nameOfCert,
        uint256 dateIssued
    );

    modifier onlyInstitution() {
        require(msg.sender != address(0), "Invalid institution address");
        _;
    }

    function issueCertificate(
        address _studentWallet,
        string memory _nameOfInstitution,
        string memory _nameOfCert,
        string memory _nameOfStudent,
        string memory _college,
        string memory _course,
        string memory _major,
        string memory _certStatus,
        string memory _certHash,
        string memory _imageOfCertificate
    ) public onlyInstitution {
        Certificate memory newCert = Certificate({
            nameOfInstitution: _nameOfInstitution,
            nameOfCert: _nameOfCert,
            nameOfStudent: _nameOfStudent,
            college: _college,
            course: _course,
            certStatus: _certStatus,
            major: _major,
            certHash: _certHash,
            walletAddressOfStudent: _studentWallet,
            walletAddressOfInstitution: msg.sender,
            imageOfCertificate: _imageOfCertificate,
            dateIssued: block.timestamp
        });

        studentCertificates[_studentWallet].push(newCert);

        emit CertificateIssued(msg.sender, _studentWallet, _nameOfCert, block.timestamp);
    }

    function getCertificates(address _studentWallet) public view returns (Certificate[] memory) {
        return studentCertificates[_studentWallet];
    }

    function getCertificateByIndex(address _studentWallet, uint256 index) public view returns (Certificate memory) {
        require(index < studentCertificates[_studentWallet].length, "Index out of bounds");
        return studentCertificates[_studentWallet][index];
    }

    function getCertificateCount(address _studentWallet) public view returns (uint256) {
        return studentCertificates[_studentWallet].length;
    }

      // ✅ New function to get a certificate by its hash
    function getCertificateByHash(address _studentWallet, string memory _certHash) 
        public 
        view 
        returns (Certificate memory) 
    {
        Certificate[] memory certs = studentCertificates[_studentWallet];
        for (uint256 i = 0; i < certs.length; i++) {
            if (keccak256(bytes(certs[i].certHash)) == keccak256(bytes(_certHash))) {
                return certs[i];
            }
        }
        revert("Certificate does not exist");
    }
}

