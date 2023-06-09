import { useState, useEffect } from 'react'
import {ethers} from "ethers"
import { Row, Form, Button, Card} from 'react-bootstrap'
import{create as ipfsHttpClient} from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Home = ({ contract, account }) =>{
    const [loading,setLoading] = useState(true)
    const [hasProfile, setHasProfile] = useState(false)
    const [posts, setPosts] = useState('')
    const [post, setPost] = useState('')
    const [address, setAddress] = useState('')
    
    const loadPosts = async () => {
        const address = await contract.signer.getAddress()
        setAddress(address)
        //check if user owns an nft
        // if so set profile to true
        const balance = await contract.balanceOf(account)
        setHasProfile(() => balance > 0)
        // Get all posts
        let results = await contract.getAllPosts()
        // fetch metadata of each post and add that to post object
        let posts = await Promise.all(results.map(async i => {
            // use hash to fetch the posts metadata stored on ipfs
            let response = await fetch(`https://ipfs.infura.io/ipfs/${i.hash}`)
            const metadataPost = await response.json()
            //get authors nft profile
            const nftId = await contract.profiles(i.author)
            //get uri url of nft profile
            const uri = await contract.tokenURI(nftId)
            //fetch nft profile metadata
            response = await fetch(uri)
            const metadataProfile = await response.json()
            //define author object
            const author = {
                address: i.author,
                username: metadataProfile.username,
                avatar: metadataProfile.avatar
            }
            //defining post object
            let post = {
                id: i.id,
                content: metadataPost.post,
                tipAmount: i.tipAmount,
                author
            }
            return post
        }))  
        //sorting post by most liked(tipped)
        posts = posts.sort((a,b) => b.tipAmount - a.tipAmount)
        setPosts(posts)
        setLoading(false)
    }
    // loading posts if none appeared yet
    useEffect(() => {
        if(!posts) {
            loadPosts()
        }
    })
    const uploadPost = async() =>{
        if(!post) return //if there is no post, return and do not proceed
        let hash
        //uplaod post to IPFS
        try{
            const result = await client.add(JSON.stringify({post})) //add the post to IPFS and get the resulting hash
            setLoading(true) //set loading state to true
            hash = result.path //store the hash in the 'hash' variable
        } catch (error){
            window.alert("ipfs image upload error:", error) //if there is an error uploading the post to IPFS, show an alert with the error message
        }
        //upload post to blockchain
        await(await contract.uploadPost(hash)).wait() //upload the hash of the post to the blockchain using the 'uploadPost' function in the 'contract' object
        loadPosts() //load all posts from the blockchain
    }
    
    const tip = async(post)=>{
        //tip post owner
        await(await contract.tipPostOwner(post.id,{value: ethers.utils.parseEther("0.1")})).wait() //tip the owner of the post using the 'tipPostOwner' function in the 'contract' object with a value of 0.1 ether
        loadPosts() //load all posts from the blockchain
    }
    
    if (!loading) return(
        <div className = 'text-center'>
            <main style = {{ padding : "1rem 0"}}>
                <h2>Loading...</h2> //if 'loading' is true, display a loading message
            </main>
        </div>
    )
    return(
        <div className = "container-fluid mt-5">
            {hasProfile ?
                (<div className = "row">
                    <main role = "main" className = "col-lg-12 mx-auto" style = {{maxWidth: '1000px'}}>
                    <div className = "content mx-auto">
                        <Row className = "g-4">
                            <Form.Control onChange={(e) => setPost(e.target.value)} size = "lg" required as = "textarea"/>
                            <div className = "d-grid px-0">
                                <Button onClick={uploadPost} variant = "primary" size = "lg">
                                    Post!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>)
            :
            (<div className = "text-center">
                <main style = {{ padding: "1rem 0" }}>
                    <h2>Must own an NFT to post</h2>
                </main>
            </div>)
        }
        <p>&nbsp;</p>
        <hr/>
        <p className='myauto'>&nbsp;</p>
        {posts.length > 0 ?
            posts.map((post,key)=> {
            return (
                <div key={key} className="col-lg-12 my-auto" style={{width: '1000px'}}>
                <Card border = "primary">
                <Card.Header>
                    <img
                        className = 'mr-2'
                        width = '30'
                        height= '30'
                        src = {post.author.avatar}
                    />
                    <small className = "ms-2 me-auto d-inline">
                        {post.author.username}
                    </small>
                    <small className = "mt-1 float-end d-inline">
                        {post.author.address}
                    </small>
                </Card.Header>
                <Card.Body color = "secondary">
                    <Card.Title>
                        {post.content}
                    </Card.Title>
                </Card.Body>
                <Card.Footer className = "list-group-item">
                    <div className = "d-inline mt-auto float-start">Tip Amount:{ethers.utils.formatEther(post.tipAmount)}ETH</div>
                    {address === post.author.address || !hasProfile ? 
                        null : <div className = "d-inline float-end">
                            <Button onClick={() => tip(post)} className = "px-0 py-0 font-size-16" variant = "link" size = "md">
                                Tip for .1 ETH
                            </Button>
                            </div>}
                </Card.Footer>
            </Card>
            </div>)
    })
        : (
            <div className = "text-center">
                <main style ={{ padding: "1rem 0"}}>
                    <h2>No posts yet</h2>
                </main>
            </div>
        )}
    </div>
    );
}
export default Home;