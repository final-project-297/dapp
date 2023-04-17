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

    function mint(string memory _tokenURI) 
    external returns (uint256) {
        // Increment the token count
        tokenCount++;
        // Mint the new NFT and assign it to the caller's address
        _safeMint(msg.sender, tokenCount);
        // Set the token URI for the new NFT
        _setTokenURI(tokenCount, _tokenURI);
        // Set the new NFT as the caller's profile
        setProfile(tokenCount);
        // Return the ID of the new NFT
        return (tokenCount);
    }
    
    // Function to set the caller's profile to a specific NFT they own
    function setProfile(uint256 _id) public {
        // Ensure that the caller owns the NFT they want to set as their profile
        require(
            ownerOf(_id) == msg.sender,
            "Must own the nft you want to select as your profile"
        );
        // Store the ID of the selected NFT as the caller's profile
        profiles[msg.sender] = _id;
    }

    // Function to upload a new post
    function uploadPost(string memory _postHash) external {
        // Ensure that the caller owns at least one NFT
        require(
            balanceOf(msg.sender) > 0,
            "Must own a Social Dapp nft to post"
        );
        // Ensure that the post hash is not empty
        require(bytes(_postHash).length > 0, "Cannot pass an empty hash");
        // Increment the post count
        postCount++;
        // Create a new Post struct to store the post details
        Post memory newPost = Post(
            postCount,
            _postHash,
            0,
            payable(msg.sender)
        );
        // Store the new post in the mapping by its ID
        posts[postCount] = newPost;
        // Emit a PostCreated event to signal the creation of a new post
        emit PostCreated(postCount, _postHash, 0, payable(msg.sender));
    }

}
