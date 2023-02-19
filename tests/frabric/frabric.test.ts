import { describe, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum, store, Value, ipfs } from "@graphprotocol/graph-ts"
import { Frabric, FrabricERC20 } from "../../generated/schema";
import { createNewProposalEvent } from "./frabric.utils"
import { Proposal } from "../../generated/Frabric/Frabric";
import { handleProposal } from "../../src/mappings/frabric";

test("Should throw an error", () => {
    throw new Error()
  }, true)

  describe( ("first test"), (): void => {
    
    test( ("Proposal Event"), (): void => {
        let erc20 = new FrabricERC20("0x120F04114daD2201815147A55d66a2876B1c2C09");
        erc20.name = "WEAV TOKEN"
        erc20.symbol= "WEAV"
        erc20.decimals = 18
        erc20.supply = BigInt.fromI32(1000)
        erc20.tradeToken = Bytes.fromHexString("0x7031BbdA87fE028A416d1587A77a13193f389419")
        erc20.globalAcceptance = false
        erc20.save();
        let frabric = new Frabric("0x6da20DA5F55f31a74D557291F7aD527e17FCd695");
        frabric.token = erc20.id;
        frabric.save();
        
        const id: i32 = 0;
        const proposalType: i32 = 256;
        const creator: string = "0x307E2701D27032E0663a704B3396163331DD6F72";
        const supermajority: boolean = false;
        const info: string = "0x0000000";
        
        const event: Proposal = createNewProposalEvent(id, proposalType, creator, supermajority, info);
        handleProposal(event)
        // console.log(event.params.id.toString());
        
        // assert.fieldEquals("BaseProposal", "0", "id", "0");
    })
})