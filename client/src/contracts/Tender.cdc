// NOTE: I deployed this to 0x01 in the playground
import NonFungibleToken from 0xc9a10bbda7c73177

pub contract Tender: NonFungibleToken {

  pub var totalSupply: UInt64
  pub var exp: UInt64
  
  pub event ContractInitialized()
  pub event Withdraw(id: UInt64, from: Address?)
  pub event Deposit(id: UInt64, to: Address?)

  //The public interface can show metadata and the content for the Art piece
	pub resource interface Public {
		pub let id: UInt64
		pub let metadata: Metadata

	}

  pub struct Metadata {
  
    pub var title: String
    pub var description: String
    pub var minimumExp: UInt64
    pub var exp:UInt64

    init(_title: String, _description: String,  _minimumExp:UInt64, _exp:UInt64) {
        self.title = _title
        self.description = _description
      
        self.exp=_exp
        self.minimumExp=_minimumExp
    }
  }
   
  pub resource NFT: NonFungibleToken.INFT,Public {
    pub let id: UInt64 
    pub let ipfsHash: String
    pub let metadata: Metadata

    init(_ipfsHash: String, _metadata: Metadata) {
      self.id = Tender.totalSupply
      Tender.totalSupply = Tender.totalSupply + 1

      self.ipfsHash = _ipfsHash
      self.metadata = _metadata
      Tender.exp=Tender.exp + _metadata.exp
    }

    
  }

  pub resource interface CollectionPublic {
    pub fun borrowEntireNFT(id: UInt64): &Tender.NFT
    pub fun deposit(token: @NonFungibleToken.NFT)
		pub fun getIDs(): [UInt64]
		pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
		pub fun borrowTender(id: UInt64): &{Tender.Public}?
  }

  pub resource Collection: NonFungibleToken.Receiver, NonFungibleToken.Provider, NonFungibleToken.CollectionPublic, CollectionPublic {
    // the id of the NFT --> the NFT with that id
    pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    pub fun deposit(token: @NonFungibleToken.NFT) {
      let myToken <- token as! @Tender.NFT

      emit Deposit(id: myToken.id, to: self.owner?.address)
      self.ownedNFTs[myToken.id] <-! myToken
    }

    pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
      let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("This NFT does not exist")
      emit Withdraw(id: token.id, from: self.owner?.address)
      return <- token
    }

    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys
    }

    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
      return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
    }

    pub fun borrowTender(id: UInt64): &{Tender.Public}? {
			if self.ownedNFTs[id] != nil {
				let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
				return ref as! &Tender.NFT
			} else {
				return nil
			}
		}

    pub fun borrowEntireNFT(id: UInt64): &Tender.NFT {
      let reference = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
      return reference as! &Tender.NFT
    }

    init() {
      self.ownedNFTs <- {}
    }

    destroy() {
      destroy self.ownedNFTs
    }
  }

  pub fun createEmptyCollection(): @Collection {
    return <- create Collection()
  }

  pub fun createToken(ipfsHash:String,metadata:Metadata): @Tender.NFT {
    return <- create NFT(_ipfsHash: ipfsHash, _metadata: metadata)
  }

  init() {
    self.totalSupply = 0
    self.exp = 0
  }
}