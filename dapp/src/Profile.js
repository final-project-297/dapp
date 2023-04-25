import { useState, useEffect } from 'react'
import { Row, Form, Button, Card, Col } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Profile = ({ contract }) => {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [username, setUsername] = useState('')
    const [nfts, setNfts] = useState('')

    const loadMyNFTs = async () => {
        //Get users nft ids
        const results = await contract.getMyNfts();
        // Fetch metadata of each nft and add that to nft object
        let nfts = await Promise.all(results.map(async i => {
            // get uri url of nft
            const uri = await contract.tokenURI(i)
            // fetch nft metadata
            const response = await fetch(uri)
            const metadata = await response.json()
            // returning nft object
            return ({
                id: i,
                username: metadata.username,
                avatar: metadata.avatar
            })
        }))
        setNfts(nfts)
        getProfile(nfts)
    }
    const getProfile = async (nfts) => {
        // get address of account thats connected to the app
        const address = await contract.signer.getAddress()
        // getting nft profile and id that corresponds
        const id = await contract.profiles(address)
        // finding nft that matches the returned id in the array, then set to profile variable
        const profile = nfts.find((i) => i.id.toString() === id.toString())
        setProfile(profile)
        setLoading(false)
    }

    const uploadToIPFS = async (event) => {
        event.preventDefault()
        // select image file from event(first element of arry)
        const file = event.target.files[0]
        //make sure user inputed a file
        if (typeof file !== 'undefined') {
            try {
                //try catch hook, adding filing to ipfs
                const result = await client.add(file)
                setAvatar(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                window.alert("ipfs image upload error: ", error)
            }
        }
    }
    const mintProfile = async (event) => {
        //triggered when button to submit profile has been pressed
        if (!avatar || !username) return

        try {
            //adding avatar and username to ipfs, turned to json string object
            const result = await client.add(JSON.stringify({ avatar, username }))
            setLoading(true)
            // calling mint function on contract passing in token URI/ metadate
            //and wait for transaction receipt to return
            await (await contract.mint(`https://ipfs.infura.io/ipfs/${result.path}`)).wait()
            loadMyNFTs()
        } catch (error) {
            window.alert("ipfs uri upload error: ", error)
        }
    }
    const switchProfile = async (nft) => {
        setLoading(true)
        // call setprofile from contract passing id of nft and waiting
        // for transaction receuipt to return
        await (await contract.setProfile(nft.id)).wait()
        // update profile
        getProfile(nfts)
    }
    useEffect(() => {
        // check if nfts is a faulty value
        if (!nfts) {
            loadMyNFTs()
        }
    })
    if (!loading) return (
        <div ClassName='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2> Loading... </h2>
            </main>
        </div>
    )
    return (
        <div className="mt-4 text-center">
            {profile ? (<div className="mb-3"><h3 className="mb-3">{profile.username}</h3>
                <img className="mb-3" style={{ width: '400px' }} src={profile.avatar} /> </div>)
                :
                <h4 className="mb-4">No NFT profile, please create one...</h4>}
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="context mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username" />
                            <div className="d-grid px-0">
                                <Button onClick={mintProfile} variant="primary" size="lg">
                                    Mint NFT Profile
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
            <div className = "px-5 container">
                <Row xs={1} md={2} lg={4} className = "g-4 py-5">
                    {nfts.map ((nft, idx) => {
                        if(nft.id === profile.id) return
                        return(
                            <Col key={idx} className = "overflow-hidden">
                                <Card>
                                    <Card.Img variant = "top" src = {nft.avatar}/>
                                    <Card.Body color = "secondary">
                                        <Card.Title>{nft.username}</Card.Title>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className = 'd-grid'>
                                            <Button onClick ={()=> switchProfile(nft)} variant = "primary" size = "lg">
                                                Set as Profile
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        </div>
    );
}

export default Profile;
/*

*/