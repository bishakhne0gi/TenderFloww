import * as fcl from "@onflow/fcl";

const response = await fcl.query({
  cadence: `
import Biddingplatform from 0x01

pub fun main(account: Address): {UInt64: Biddingplatform.ProjectStatus} {
      let collection = getAccount(account).getCapability(/public/BiddingCollection)
                    .borrow<&Biddingplatform.BiddingCollection{Biddingplatform.BiddingPublic}>()
                    ?? panic("Can't get the User's collection.")  
      
      let biddingdetails = collection.getBiddingStatuses()
      return biddingdetails
}
`,
  args: (arg, t) => [arg()],
});
