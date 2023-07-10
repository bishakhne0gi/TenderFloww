
import NonFungibleToken from 0xc9a10bbda7c73177
import Tender from 0xc9a10bbda7c73177
import FungibleToken from 0xc9a10bbda7c73177
import Flowtoken from 0xc9a10bbda7c73177

pub contract Biddingplatform{
  // This struct aggreates status for the auction and is exposed in order to create websites using auction information
    pub struct ProjectStatus{
        pub let id: UInt64
        //minimum experience needed to participate
        pub let minExp : UInt64
        pub let maxmimumBudget:UFix64
        pub let currMinimumDemand:UFix64
        //Active is probably not needed when we have completed and expired above, consider removing it
        pub let active: Bool
        pub let timeRemaining : Fix64
        pub let endTime : Fix64
        pub let startTime : Fix64
        pub let metadata: Tender.Metadata
        pub let tenderId: UInt64?
        pub let owner: Address
        pub let leader: Address?
        pub let completed: Bool
        pub let expired: Bool
    
        init(id:UInt64, 
            minExp: UInt64, 
            maxmimumBudget:UFix64,
            currMinimumDemand:UFix64, 
            active: Bool, 
            timeRemaining:Fix64, 
            metadata: Tender.Metadata,
            tenderId: UInt64?,
            leader:Address?, 
            owner: Address, 
            startTime: Fix64,
            endTime: Fix64,
            completed: Bool,
            expired:Bool
        ) {
            self.id=id
            self.maxmimumBudget=maxmimumBudget
            self.currMinimumDemand=currMinimumDemand
            self.minExp= minExp
            self.active=active
            self.timeRemaining=timeRemaining
            self.metadata=metadata
            self.tenderId=tenderId
            self.leader= leader
            self.owner=owner
            self.startTime=startTime
            self.endTime=endTime
            self.completed=completed
            self.expired=expired
        }
    }

   pub var totalProjects: UInt64

    pub event TokenPurchased(id: UInt64, artId: UInt64, price: UFix64, from:Address, to:Address?)
    pub event CollectionCreated(owner: Address, cutPercentage: UFix64)
    pub event Created(tokenID: UInt64, owner: Address, startPrice: UFix64, startTime: UFix64)
    pub event Bid(tokenID: UInt64, bidderAddress: Address, bidPrice: UFix64)
    pub event Settled(tokenID: UInt64, price: UFix64)
    pub event Canceled(tokenID: UInt64)
    pub event MarketplaceEarned(amount:UFix64, owner: Address)

    pub resource Project {
        priv var NFT: @Tender.NFT?
        priv let bidVault: @FungibleToken.Vault
        pub let biddingID: UInt64
        //The minimum increment for a bid. This is an english auction style system where bids increase
        priv let minimumExp: UInt64

        priv var maxmimumBudget:UFix64
        priv var  currMinimumDemand:UFix64

        //the time the acution should start at
        priv var biddingStartTime: UFix64

        //The length in seconds for this auction
        priv var biddingLength: UFix64

        //Right now the dropitem is not moved from the collection when it ends, it is just marked here that it has ended 
        priv var biddingCompleted: Bool

        priv var currentPrice: UFix64

        //the capability that points to the resource where you want the NFT transfered to if you win this bid. 
        priv var recipientCollectionCap: Capability<&{Tender.CollectionPublic}>?

        //the capablity to send the escrow bidVault to if you are outbid
        priv var recipientVaultCap: Capability<&{FungibleToken.Receiver}>?

        //the capability for the owner of the NFT to return the item to if the auction is cancelled
        priv let ownerCollectionCap: Capability<&{Tender.CollectionPublic}>

        //the capability to pay the owner of the item when the auction is done
        priv let ownerVaultCap: Capability<&{FungibleToken.Receiver}>
        
        init(
            NFT: @Tender.NFT,
            minimumExp: UInt64,
            biddingStartTime: UFix64,
            startPrice: UFix64, 
            biddingLength: UFix64,
            maxmimumBudget: UFix64, 
            currMinimumDemand:UFix64,
            ownerCollectionCap: Capability<&{Tender.CollectionPublic}>,
            ownerVaultCap: Capability<&{FungibleToken.Receiver}>,
        ) {
            Biddingplatform.totalProjects = Biddingplatform.totalProjects + 1 
            self.NFT <- NFT
            self.bidVault <- Flowtoken.createEmptyVault()
            self.biddingID = Biddingplatform.totalProjects
            self.biddingLength = biddingLength
            self.minimumExp = minimumExp
            self.maxmimumBudget=maxmimumBudget 
            self.currMinimumDemand=currMinimumDemand
            self.currentPrice = 0.0
            self.biddingStartTime = biddingStartTime
            self.biddingCompleted = false
            self.recipientCollectionCap = nil
            self.recipientVaultCap = nil
            self.ownerCollectionCap = ownerCollectionCap
            self.ownerVaultCap = ownerVaultCap
           
        }

        pub fun showNFTDescription(): String? {
          return self.NFT?.metadata?.description
        }
         pub fun showNFTTitle(): String? {
          return self.NFT?.metadata?.title
        }
         pub fun showNFTMinimumExp(): UInt64? {
          return self.NFT?.metadata?.exp
        }

        // sendNFT sends the NFT to the Collection belonging to the provided Capability
        access(contract) fun sendNFT(_ capability: Capability<&{Tender.CollectionPublic}>) {
            if let collectionRef = capability.borrow() {
                let NFT <- self.NFT <- nil
                collectionRef.deposit(token: <-NFT!)
                return
            } 
            if let ownerCollection=self.ownerCollectionCap.borrow() {
                let NFT <- self.NFT <- nil
                ownerCollection.deposit(token: <-NFT!)
                return 
            }
        }

        // sendBidTokens sends the bid tokens to the Vault Receiver belonging to the provided Capability
        access(contract) fun sendBidTokens(_ capability: Capability<&{FungibleToken.Receiver}>) {
            // borrow a reference to the owner's NFT receiver
            if let vaultRef = capability.borrow() {
                let bidVaultRef = &self.bidVault as &FungibleToken.Vault
                if(bidVaultRef.balance > 0.0) {
                    vaultRef.deposit(from: <-bidVaultRef.withdraw(amount: bidVaultRef.balance))
                }
                return
            }

            if let ownerRef= self.ownerVaultCap.borrow() {
                let bidVaultRef = &self.bidVault as &FungibleToken.Vault
                if(bidVaultRef.balance > 0.0) {
                    ownerRef.deposit(from: <-bidVaultRef.withdraw(amount: bidVaultRef.balance))
                }
                return
            }
        }

        pub fun releasePreviousBid() {
            if let vaultCap = self.recipientVaultCap {
                self.sendBidTokens(self.recipientVaultCap!)
                return
            } 
        }

        pub fun settleBidding(cutVault:Capability<&{FungibleToken.Receiver}> )  {

            pre {
                !self.biddingCompleted : "The bidding is already settled"
                self.NFT != nil: "NFT in bidding does not exist"
                self.isBiddingExpired() : "bidding has not completed yet"
            }

            // return if there are no bids to settle
            if self.currentPrice == 0.0{
                self.returnBiddingItemToOwner()
                return
            }            
    
            //Withdraw cutPercentage to marketplace and put it in their vault
            let amount=self.currentPrice
            let beneficiaryCut <- self.bidVault.withdraw(amount:amount )

            let cutVault=cutVault.borrow()!
            emit MarketplaceEarned(amount: amount, owner: cutVault.owner!.address)
            cutVault.deposit(from: <- beneficiaryCut)
                        

            let  projectId=self.NFT?.id 

            self.sendNFT(self.recipientCollectionCap!)
            self.sendBidTokens(self.ownerVaultCap)

            self.biddingCompleted = true
            
            emit Settled(tokenID: self.biddingID, price: self.currentPrice)

        }

        pub fun returnBiddingItemToOwner() {

            // release the bidder's tokens
            self.releasePreviousBid()

            // deposit the NFT into the owner's collection
            self.sendNFT(self.ownerCollectionCap)
        }

        pub fun timeRemaining() : Fix64 {
            let auctionLength = self.biddingLength

            let startTime = self.biddingStartTime
            let currentTime = getCurrentBlock().timestamp

            let remaining= Fix64(startTime+auctionLength) - Fix64(currentTime)
            return remaining
        }

        pub fun isBiddingExpired(): Bool {
            let timeRemaining= self.timeRemaining()
            return timeRemaining < Fix64(0.0)
        }

       // pub fun minNextBid() :UFix64{
       //    return self.
       // }

        pub fun bidder() : Address? {
            if let vaultCap = self.recipientVaultCap {
                return vaultCap.address
            }
            return nil
        }

        pub fun currentBidForUser(address:Address): UFix64 {
             if(self.bidder() == address) {
                return self.bidVault.balance
            }
            return 0.0
        }

        pub fun placeBid(bidTokens: UFix64, vaultCap: Capability<&{FungibleToken.Receiver}>, collectionCap: Capability<&{Tender.CollectionPublic}>) {
        
           pre {
                !self.biddingCompleted : "The auction is already settled"
                self.NFT != nil: "NFT in auction does not exist"
                bidTokens > 0.0:"Bid Token must be greater than 0.0"
                bidTokens < self.currMinimumDemand:"Bid token Must Be less than Previous"
            }

            let bidderAddress=vaultCap.address
            let collectionAddress=collectionCap.address
            self.currMinimumDemand = bidTokens
             

            self.recipientVaultCap = vaultCap
            self.recipientCollectionCap = collectionCap
            emit Bid(tokenID: self.biddingID, bidderAddress: bidderAddress, bidPrice: self.currentPrice)
 
        }

        pub fun getAuctionStatus() :ProjectStatus {

            var leader:Address?= nil
            if let recipient = self.recipientVaultCap {
                leader=recipient.address
            }

            return ProjectStatus(
                id:self.biddingID,
                minExp:self.minimumExp,
                maxmimumBudget:self.maxmimumBudget ,
                currMinimumDemand:self.currMinimumDemand,
                active: !self.biddingCompleted  && !self.isBiddingExpired(),
                timeRemaining: self.timeRemaining(),
                metadata: self.NFT?.metadata!,
                tenderId: self.NFT?.id,
                leader: leader,
                owner: self.ownerVaultCap.address,
                startTime: Fix64(self.biddingStartTime),
                endTime: Fix64(self.biddingStartTime+self.biddingLength),
              
                completed: self.biddingCompleted,
                expired: self.isBiddingExpired()
            )
        }

        destroy() {
            log("destroy auction")
            // send the NFT back to auction owner
            if self.NFT != nil {
                self.sendNFT(self.ownerCollectionCap)
            }
            
            // if there's a bidder...
            if let vaultCap = self.recipientVaultCap {
                // ...send the bid tokens back to the bidder
                self.sendBidTokens(vaultCap)
            }

            destroy self.NFT
            destroy self.bidVault
        }     

    }

     // AuctionPublic is a resource interface that restricts users to
    // retreiving the auction price list and placing bids
    pub resource interface BiddingPublic {

        //It could be argued that this method should not be here in the public contract. I guss it could be an interface of its own
        //That way when you create an auction you chose if this is a curated auction or an auction where everybody can put their pieces up for sale
         pub fun createBidding(
             token: @Tender.NFT, 
            minimumExp:UInt64, 
            biddingLength: UFix64, 
            biddingStartTime: UFix64,
             maxmimumBudget:UFix64,
            currMinimumDemand:UFix64,
            startPrice: UFix64, 
            collectionCap: Capability<&{Tender.CollectionPublic}>, 
            vaultCap: Capability<&{FungibleToken.Receiver}>
            ) 

        pub fun getBiddingStatuses(): {UInt64 : ProjectStatus}
        pub fun getBiddingStatus(_ id:UInt64): ProjectStatus

        pub fun placeBid(
            id: UInt64, 
            bidTokens: UFix64 ,
            collectionCap: Capability<&{Tender.CollectionPublic}>, 
            vaultCap: Capability<&{FungibleToken.Receiver}>
        )
    }

    // AuctionCollection contains a dictionary of AuctionItems and provides
    // methods for manipulating the AuctionItems
    pub resource BiddingCollection: BiddingPublic {

        // Auction Items
        access(account) var biddingItems: @{UInt64: Project}
         
        access(contract) let marketplaceVault: Capability<&{FungibleToken.Receiver}>

        init(
            marketplaceVault: Capability<&{FungibleToken.Receiver}>, 
        ) {
            self.marketplaceVault = marketplaceVault
            self.biddingItems <- {}
        }

        pub fun keys() : [UInt64] {
            return self.biddingItems.keys
        }

        // addTokenToauctionItems adds an NFT to the auction items and sets the meta data
        // for the auction item
        pub fun createBidding(
            token: @Tender.NFT, 
            minimumExp:UInt64, 
            biddingLength: UFix64, 
            biddingStartTime: UFix64,
             maxmimumBudget:UFix64,
            currMinimumDemand:UFix64,
            startPrice: UFix64, 
            collectionCap: Capability<&{Tender.CollectionPublic}>, 
            vaultCap: Capability<&{FungibleToken.Receiver}>) {
            
            // create a new auction items resource container
            let item <- Biddingplatform.createStandaloneBidding(
                token: <-token,
                minimumExp:minimumExp , 
                maxmimumBudget:maxmimumBudget,
                currMinimumDemand:currMinimumDemand,
                biddingLength: biddingLength,
                biddingStartTime: biddingStartTime,
                startPrice: startPrice,
                collectionCap: collectionCap,
                vaultCap: vaultCap
            )

            let id = item.biddingID

            // update the auction items dictionary with the new resources
            let oldItem <- self.biddingItems[id] <- item
            destroy oldItem

            let owner = vaultCap.address

            emit Created(tokenID: id, owner: owner, startPrice: startPrice, startTime: biddingStartTime)
        }

        // getAuctionPrices returns a dictionary of available NFT IDs with their current price
        pub fun getBiddingStatuses(): {UInt64: ProjectStatus} {
            let priceList: {UInt64: ProjectStatus} = {}

            for id in self.biddingItems.keys {
                let itemRef = (&self.biddingItems[id] as &Project?)!
                priceList[id] = itemRef.getAuctionStatus()
            }
            
            return priceList
        }

        pub fun getBiddingStatus(_ id:UInt64): ProjectStatus {
            pre {
                self.biddingItems[id] != nil:
                    "NFT doesn't exist"
            }

            // Get the auction item resources
            let itemRef = (&self.biddingItems[id] as &Project?)!
            return itemRef.getAuctionStatus()

        }

        // settlebidding sends the project to the lowest bidder
        // and deposits the FungibleTokens into the auction owner's account
        pub fun settleBidding(_ id: UInt64) {
            let itemRef = (&self.biddingItems[id] as &Project?)!
            itemRef.settleBidding(cutVault: self.marketplaceVault)
        }

        pub fun placeBid(id: UInt64, bidTokens: UFix64, collectionCap: Capability<&{Tender.CollectionPublic}>,vaultCap: Capability<&{FungibleToken.Receiver}>) {
            pre {
                self.biddingItems[id] != nil:
                    "Auction does not exist in this drop"
            }

            // Get the auction item resources
            let itemRef = (&self.biddingItems[id] as &Project?)!
            itemRef.placeBid(bidTokens: bidTokens,vaultCap:vaultCap,collectionCap:collectionCap)

        }

        destroy() {
            log("destroy auction collection")
            // destroy the empty resources
            destroy self.biddingItems
        }
    }

        
    //this method is used to create a standalone auction that is not part of a collection
        //we use this to create the unique part of the Versus contract
        pub fun createStandaloneBidding(
            token: @Tender.NFT, 
            minimumExp: UInt64,
             maxmimumBudget:UFix64,
            currMinimumDemand:UFix64,
            biddingLength: UFix64,
            biddingStartTime: UFix64,
            startPrice: UFix64, 
            collectionCap: Capability<&{Tender.CollectionPublic}>, 
            vaultCap: Capability<&{FungibleToken.Receiver}>) : @Project {
            
            // create a new auction items resource container
            return  <- create Project(
                NFT: <-token,
                minimumExp:minimumExp,
                biddingStartTime: biddingStartTime,
                startPrice: startPrice,
                biddingLength: biddingLength,
                maxmimumBudget:maxmimumBudget ,
                currMinimumDemand:currMinimumDemand,
                ownerCollectionCap: collectionCap,
                ownerVaultCap: vaultCap
            )
        }
    // createAuctionCollection returns a new AuctionCollection resource to the caller
    pub fun createBiddingCollection(marketplaceVault: Capability<&{FungibleToken.Receiver}>): @BiddingCollection {
        let biddingCollection <- create BiddingCollection(
            marketplaceVault: marketplaceVault,    
        )
        
        return <- biddingCollection
    }

    init() {
        self.totalProjects = 0
    }   
}