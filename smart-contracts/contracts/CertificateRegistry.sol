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
        // In real implementation, you'd check against a registry of institutions
        // For simplicity, we allow any address to act as institution
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
}
