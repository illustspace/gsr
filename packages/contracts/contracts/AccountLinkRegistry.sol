/// @title Geo Spatial Registry
/// @author Illust Space

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// import "hardhat/console.sol";

import "./meta-transactions/ContentMixin.sol";
import "./meta-transactions/NativeMetaTransaction.sol";

contract AccountLinkRegistry is
    Ownable,
    Pausable,
    NativeMetaTransaction,
    ContextMixin
{
    event AccountLink(
        /// @dev the address linking to an external account.
        address indexed linkingAddress,
        /// @dev keccak of the target chain or other identity service.
        bytes32 indexed linkedService,
        /// @dev Account ID on the remote service, abi encoded based on the linkedService.
        bytes linkedAccount,
        /// @dev Proof of account ownership on the service.
        bytes ownershipProof,
        /// @dev If true, decare the linkedAccount as an escrow account. */
        bool isEscrowAccount
    );

    struct AccountLinkProof {
        /// @dev keccak of the target chain or other identity service.
        bytes32 linkedService;
        /// @dev Account ID on the remote service, abi encoded based on the linkedService.
        bytes linkedAccount;
        /// @dev Proof of account ownership on the service.
        bytes ownershipProof;
        /// @dev If true, decare the linkedAccount as an escrow account. */
        bool isEscrowAccount;
        /// @dev if false, the link is not valid.
        bool linked;
    }

    /** Contract name */
    string public name;

    /** Holds a mapping of address => targetId => AccountLinkProof */
    mapping(address => mapping(bytes32 => AccountLinkProof))
        public accountLinks;

    /** Constructor */
    /// @param initialName the name of the contract
    constructor(string memory initialName) {
        name = initialName;
    }

    /** Place a piece according to a publisher. */
    /// @param linkedAccount Account service & ID on the remote service, abi encoded based on the linkedService.
    /// @param ownershipProof Proof of account ownership on the service.
    /// @param isEscrowAccount If true, decare the linkedAccount as an escrow account. */
    function setLink(
        bytes calldata linkedAccount,
        bytes calldata ownershipProof,
        bool isEscrowAccount
    ) external whenNotPaused {
        bytes32 targetId = keccak256(linkedAccount);

        /// @dev pull the service from the prefix of the linked account.
        (bytes32 linkedService, ) = abi.decode(linkedAccount, (bytes32, bytes));

        /// @dev Look up the placement
        accountLinks[_msgSender()][targetId] = AccountLinkProof(
            linkedService,
            linkedAccount,
            ownershipProof,
            isEscrowAccount,
            true
        );

        emit AccountLink(
            _msgSender(),
            linkedService,
            linkedAccount,
            ownershipProof,
            isEscrowAccount
        );
    }

    function unlink(bytes32 targetId) external whenNotPaused {
        AccountLinkProof storage accountLink = accountLinks[_msgSender()][
            targetId
        ];
        accountLink.linked = false;
    }

    /** This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea. */
    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }
}
