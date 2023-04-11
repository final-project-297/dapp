// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SocialDapp is ERC721URIStorage {
    uint256 public tokenCount;
    uint256 public postCount; 

    // Mapping to store the posts by their IDs
    mapping(uint256 => Post) public posts;

    // Mapping to store the user's profile by their address
    mapping(address => uint256) public profiles;

    // Post struct to store the post details
    struct Post {
        uint256 id;
        string hash;
        uint256 likes;
        address payable author;
    } 

    // Event emitted when a new post is created
    event PostCreated(
        uint256 id,
        string hash,
        uint256 likes,
        address payable author
    );

    // Event emitted when a post is liked
    event PostLiked(
        uint256 id,
        string hash,
        uint256 likes,
        address payable author
    );

    // Constructor function to initialize the contract with the name and symbol of the NFT
    constructor() ERC721("SocialDapp", "DAPP") {}

}