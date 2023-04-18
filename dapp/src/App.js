import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import { ethers } from "ethers"
import SocialDappabi from './contractsData/SocialDapp.json'
import SocialDappAddress from './contractsData/SocialDapp-address.json'
import { Spinner, Navbar, Nav, Button, Container } from 'react-bootstrap'
import Home from './Home.js'
import logo from './images.jpeg'
import './App.css';
import CreateUser from "./components/CreateUser";

function App() {
  // state variables
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})

  // function to handle the connection to the Ethereum network
  const web3Handler = async () => {
    // request access to the user's Ethereum accounts
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    // setup event listeners for network and account changes
    window.ethereum.on('chainChained', () => {
      window.location.reload();
    })
    window.ethereum.on('accountsChanged', async () => {
      setLoading(true)
      web3Handler()
    })

    // create a provider and get the signer
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    // load the contract with the signer
    loadContract(signer)
  }
  const loadContract = async (signer) => {
    //get deployed copy of socialdapp contract
    const contract = new ethers.Contract(SocialDappAddress.address, SocialDappabi.abi, signer)
    setContract(contract)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <CreateUser />
      <div className="App">
        <>
          <Navbar expand="lg" bg="secondary" variant="dark">
            <Container>
              <Navbar.Brand>
                <img src={logo} width="40" height="40" className="" alt="" />
                &nbsp; Social Dapp
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/home">Home</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </Nav>
                <Nav>
                  {account ? (
                    <Nav.Link
                      href={`http://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button nav-button btw-sm mx-4">
                      <Button variant="outline-light">
                        {account.slice(0, 5) + "..." + account.slice(38, 42)}
                      </Button>
                    </Nav.Link>
                  ) : (
                    <Button onClick={web3Handler} variant="outline-light">Connect Wallet</Button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element= {
              <Home contract = {contract} account = {account}/>
              }/>
              <Route path="/profile" />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;