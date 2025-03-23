// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        string ipfsHash; // IPFS hash of the certificate file
        string studentName;
        string institutionName;
        string degree;
        string issueDate;
    }

    mapping(address => Certificate[]) public certificates; // Store certificates for each user

    event CertificateIssued(address indexed student, string ipfsHash, string degree, string institution);

    function issueCertificate(
        address student,
        string memory ipfsHash,
        string memory studentName,
        string memory institutionName,
        string memory degree,
        string memory issueDate
    ) public {
        certificates[student].push(Certificate(ipfsHash, studentName, institutionName, degree, issueDate));
        emit CertificateIssued(student, ipfsHash, degree, institutionName);
    }

    function getCertificates(address student) public view returns (Certificate[] memory) {
        return certificates[student];
    }
}