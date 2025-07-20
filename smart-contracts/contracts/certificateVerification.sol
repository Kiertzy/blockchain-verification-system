// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CertificateVerification {
    address public institution;

    struct Certificate {
        string studentName;
        string course;
        string dateIssued;
        bool isValid;
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 certificateId, string studentName);

    constructor() {
        institution = msg.sender;
    }

    modifier onlyInstitution() {
        require(msg.sender == institution, "Not authorized");
        _;
    }

    function issueCertificate(
        string memory studentName,
        string memory course,
        string memory dateIssued
    ) public onlyInstitution returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(studentName, course, dateIssued));
        certificates[certId] = Certificate(studentName, course, dateIssued, true);

        emit CertificateIssued(certId, studentName);
        return certId;
    }

    function getCertificate(bytes32 certId)
        public
        view
        returns (string memory, string memory, string memory, bool)
    {
        Certificate memory cert = certificates[certId];
        return (cert.studentName, cert.course, cert.dateIssued, cert.isValid);
    }

    function verifyCertificate(bytes32 certId) public view returns (bool) {
        return certificates[certId].isValid;
    }
}
