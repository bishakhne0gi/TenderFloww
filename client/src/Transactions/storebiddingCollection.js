import * as fcl from "@onflow/fcl";

export const createCollectionSetupInFlow = async () => {
  const transactionIdForCollectionSetup = await fcl.mutate({
    cadence: `

import Biddingplatform from 0xea0627a8b29d7901
import Tender from 0xc9a10bbda7c73177
import NonFungibleToken from 0xc9a10bbda7c73177
import FungibleToken from 0xc9a10bbda7c73177

transaction {

  prepare(acct: AuthAccount) {
      let vaultCap = acct.getCapability<&{FungibleToken.Receiver}>(/public/TokenReceiver)
      
      acct.save( <- Biddingplatform.createBiddingCollection(marketplaceVault:vaultCap),to: /storage/BiddingCollection )   
      acct.link<& Biddingplatform.BiddingCollection{Biddingplatform.BiddingPublic}>(/public/BiddingCollection, target:/storage/BiddingCollection)
      acct.save(<-Tender.createEmptyCollection() ,to: /storage/TenderCollection)
      acct.link<&Tender.Collection{Tender.CollectionPublic}>(/public/TenderCollection, target:/storage/TenderCollection)
     
  }

  execute {
    log("a user stored a bidding collection inside their " )

  }
}`,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    authorizations: [fcl.currentUser],
    limit: 50,
  });

  return transactionIdForCollectionSetup;
};
