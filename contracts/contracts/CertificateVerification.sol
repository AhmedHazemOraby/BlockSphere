// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateVerification {
    struct Certificate {
        uint id;
        address user;
        string certificateHash;
        string organization;
        uint verificationFee;
        bool isVerified;
        bool isRejected;
    }

    address public owner;
    uint public certificateCount;
    mapping(uint => Certificate) public certificates;
    mapping(address => uint[]) public userCertificates;

    event CertificateRequested(uint id, address indexed user, string certificateHash, string organization, uint fee);
    event CertificateApproved(uint id, address indexed user);
    event CertificateRejected(uint id, address indexed user);

    constructor() {
        owner = msg.sender;
    }

    function requestVerification(string memory _certificateHash, string memory _organization) public payable {
        require(msg.value > 0, "Verification fee required");
        
        certificateCount++;
        certificates[certificateCount] = Certificate(
            certificateCount,
            msg.sender,
            _certificateHash,
            _organization,
            msg.value,
            false,
            false
        );
        userCertificates[msg.sender].push(certificateCount);

        emit CertificateRequested(certificateCount, msg.sender, _certificateHash, _organization, msg.value);
    }

    function approveCertificate(uint _id) public {
        require(msg.sender == owner, "Only the contract owner can approve");
        Certificate storage cert = certificates[_id];
        require(!cert.isVerified && !cert.isRejected, "Certificate already processed");

        cert.isVerified = true;
        payable(owner).transfer(cert.verificationFee);

        emit CertificateApproved(_id, cert.user);
    }

    function rejectCertificate(uint _id) public {
        require(msg.sender == owner, "Only the contract owner can reject");
        Certificate storage cert = certificates[_id];
        require(!cert.isVerified && !cert.isRejected, "Certificate already processed");

        cert.isRejected = true;
        payable(cert.user).transfer(cert.verificationFee);

        emit CertificateRejected(_id, cert.user);
    }

    function getUserCertificates(address _user) public view returns (uint[] memory) {
        return userCertificates[_user];
    }
}