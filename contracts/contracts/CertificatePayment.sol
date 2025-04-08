// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CertificatePayment {
    address public owner;
    mapping(uint256 => Certificate) public certificates;
    uint256 public certificateCount;

    struct Certificate {
        uint256 id;
        address user;
        address organization;
        string ipfsHash;
        uint256 fee;
        bool verified;
        bool rejected;
        string comment;
    }

    event CertificateUploaded(uint256 id, address indexed user, address indexed organization, string ipfsHash, uint256 fee);
    event CertificateVerified(uint256 id, bool accepted, string comment);
    event PaymentTransferred(uint256 id, address indexed recipient, uint256 amount);
    event RefundIssued(uint256 id, address indexed recipient, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // ✅ Users Upload Certificate with Payment
    function uploadCertificate(address _organization, string memory _ipfsHash) external payable {
        require(msg.value > 0, "Payment required");

        certificateCount++;
        certificates[certificateCount] = Certificate(
            certificateCount,
            msg.sender,
            _organization,
            _ipfsHash,
            msg.value,
            false,
            false,
            ""
        );

        emit CertificateUploaded(certificateCount, msg.sender, _organization, _ipfsHash, msg.value);
    }

    // ✅ Organization Verifies or Rejects Certificate
    function verifyCertificate(uint256 _id, bool _accepted, string memory _comment) external {
        Certificate storage cert = certificates[_id];
        require(msg.sender == cert.organization, "Only organization can verify");
        require(!cert.verified && !cert.rejected, "Already processed");
        require(cert.fee > 0, "No fee stored in contract");
        require(address(this).balance >= cert.fee, "Not enough ETH in contract");

        if (_accepted) {
            // ✅ Transfer funds to the organization
            (bool success, ) = payable(cert.organization).call{value: cert.fee}("");
            require(success, "Payment to organization failed");
            
            emit PaymentTransferred(_id, cert.organization, cert.fee);
            cert.verified = true;
        } else {
            // ✅ Refund user if certificate is rejected
            (bool refunded, ) = payable(cert.user).call{value: cert.fee}("");
            require(refunded, "Refund to user failed");

            emit RefundIssued(_id, cert.user, cert.fee);
            cert.rejected = true;
        }

        cert.comment = _comment;
        emit CertificateVerified(_id, _accepted, _comment);
    }

    // ✅ Check contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // ✅ Get Certificate Details
    function getCertificate(uint256 _id) public view returns (
        uint256 id,
        address user,
        address organization,
        string memory ipfsHash,
        uint256 fee,
        bool verified,
        bool rejected,
        string memory comment
    ) {
        Certificate memory cert = certificates[_id];
        return (
            cert.id,
            cert.user,
            cert.organization,
            cert.ipfsHash,
            cert.fee,
            cert.verified,
            cert.rejected,
            cert.comment
        );
    }
}