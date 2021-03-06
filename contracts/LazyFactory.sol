//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // required to accept structs as function parameters

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract LazyFactory is
    ERC721URIStorage,
    EIP712,
    AccessControl,
    ReentrancyGuard
{
    string private constant SIGNING_DOMAIN = "LazyNFT";
    string private constant SIGNATURE_VERSION = "1";
    address payable private BANK = payable(0x0cFc8965750502A56bdb403A4fA785802Ca8Ed81);
    uint256 private FEE = 0.025 ether;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct Voucher {
        uint256 tokenId;
        uint256 sellingPrice;
        string tokenUri;
        string content;
        bytes signature;
    }

    mapping(address => uint256) private balanceByAddress;

    constructor(
        string memory name,
        string memory symbol,
        address payable minter
    ) ERC721(name, symbol) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        _setupRole(MINTER_ROLE, minter);
    }

    function redeem(address buyer, Voucher calldata voucher)
        public
        payable
        nonReentrant
        returns (uint256)
    {
        address signer = _verify(voucher);

        require(signer != buyer, "You can not purchase your own token");
        require(hasRole(MINTER_ROLE, signer), "Invalid Signature");
        require(
            msg.value == voucher.sellingPrice,
            "Enter the correct sellingPrice"
        );

        // // first assign the token to the signer, to establish provenance on-chain

        _mint(signer, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.tokenUri);

        // transfer the token to the buyer
        _transfer(signer, buyer, voucher.tokenId);

        // record payment to signer's withdrawal balance
        uint256 amount = msg.value;
        balanceByAddress[signer] += (amount - FEE);
        BANK.transfer(FEE);

        return voucher.tokenId;
    }

    function withdraw() public {
        require(hasRole(MINTER_ROLE, msg.sender), "Not the signer address");

        // IMPORTANT: casting msg.sender to a payable address is only safe if ALL members of the theSignr role are payable addresses.
        address payable receiver = payable(msg.sender);

        uint256 balance = balanceByAddress[receiver];
        // zero account before transfer to prevent re-entrancy attack
        balanceByAddress[receiver] = 0;
        receiver.transfer(balance);
    }

    function availableToWithdraw() public view returns (uint256) {
        return balanceByAddress[msg.sender];
    }

    function _hash(Voucher calldata voucher) internal view returns (bytes32) {
        return
            // _hashTypedDataV4(bytes32 structHash) ??? bytes32
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Voucher(uint256 tokenId,uint256 sellingPrice,string tokenUri,string content)"
                        ),
                        voucher.tokenId,
                        voucher.sellingPrice,
                        keccak256(bytes(voucher.tokenUri)),
                        keccak256(bytes(voucher.content))
                    )
                )
            );
    }

    // returns signer address
    function _verify(Voucher calldata voucher) internal view returns (address) {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    function getChainID() external view returns (uint256) {
        uint256 id;
        // https://docs.soliditylang.org/en/v0.8.7/yul.html?highlight=chainid#evm-dialect
        assembly {
            id := chainid()
        }
        return id;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
