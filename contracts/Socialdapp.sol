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
    // Function to like a post and pay the author
    function likePost(uint256 _id) external payable {
        // Ensure that the post ID is valid
        require(_id > 0 && _id <= postCount, "Invalid post id");
        // Get the post from the mapping by its ID
        // fetch the post
        Post memory _post = posts[_id];
        require(_post.author != msg.sender, "Cannot like your own post");
        //pay the author by sending them ether
        _post.author.transfer(msg.value);
        //increment like amount
        _post.likes += msg.value;
        // update the image
        posts[_id] = _post;
        //trigger the event
        emit PostLiked(_id, _post.hash, _post.likes, _post.author);
    }
    // Returns an array of all the posts that have been uploaded to the contract
    function getAllPosts() external view returns (Post[] memory _posts) {
        // Create a new array to store the posts
        _posts = new Post[](postCount);
        // Loop through each post in the mapping
        for (uint256 i = 0; i < _posts.length; i++) {
            // Add the post to the array (using i+1 as the index because post IDs start at 1)
            _posts[i] = posts[i + 1];
        }
    }
}
