import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export const CreateTenderInFlow = async (
  _ipfsHash,
  _title,
  _description,
  _minimumExp,
  _exp,
  biddingLength,
  startPrice
) => {
  const transactionIdForCreateTender = await fcl.mutate({
    cadence: `
import Biddingplatform from 0xea0627a8b29d7901
import Tender from 0xc9a10bbda7c73177
import NonFungibleToken from 0xc9a10bbda7c73177
import FungibleToken from 0xc9a10bbda7c73177

transaction(_ipfsHash: String,_title:String,_description:String,_minimumExp: UInt64,_exp:UInt64, biddingLength: UFix64, startPrice: UFix64) {

  prepare(acct: AuthAccount) {
    
    let biddingCollectionRef = acct.borrow<&Biddingplatform.BiddingCollection>(from:/storage/BiddingCollection) ?? panic("This Bidding collection does not exist here")
      
    let collection = acct.borrow<&Tender.Collection>(from: /storage/TenderCollection)
                        ?? panic("This collection does not exist here")

    let nft <- Tender.createToken(ipfsHash:_ipfsHash,metadata:Tender.Metadata(title:_title,description:_description,minimumExp: _minimumExp,exp:_exp))
 
    let collectionCap = acct.getCapability<&{Tender.CollectionPublic}>(/public/TenderCollection)
    let vaultCap = acct.getCapability<&{FungibleToken.Receiver}>(/public/TokenReceiver)

    biddingCollectionRef.createBidding(
    token: <-nft,
    minimumExp: minimumExp, 
    biddingLength: biddingLength, 
    biddingStartTime: getCurrentBlock().timestamp, 
    startPrice: startPrice, 
    collectionCap: collectionCap, 
    vaultCap: vaultCap
    )
      
      
  }

  execute{
     log("Auction has been started")
  }

}  
`,
    args: (arg, t) => [
      arg(_ipfsHash, t.String),
      arg(_title, t.String),
      arg(_description, t.String),
      arg(_minimumExp, t.UInt64),
      arg(_exp, t.UInt64),
      arg(biddingLength, t.UFix64),
      arg(startPrice, t.UFix64),
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    authorizations: [fcl.currentUser],
    limit: 50,
  });

  const transaction = await fcl.tx(transactionIdForCreateTender).onceSealed();
  console.log(transaction);
};
