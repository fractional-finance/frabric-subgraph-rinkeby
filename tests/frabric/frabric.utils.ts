import { handleProposal } from "../../src/mappings/frabric";
import { newMockEvent } from "matchstick-as/assembly/index";
import { Frabric } from "../../generated/schema";
import { Proposal } from "../../generated/Frabric/Frabric";
import { Address, BigInt, Bytes, ethereum, store, Value, ipfs } from "@graphprotocol/graph-ts"

export function createNewProposalEvent(
    _id: i32,
    _proposalType: i32,
    _creator: string,
    _supermajority: boolean,
    _info: string

): Proposal {
    let mockEvent = newMockEvent()
    let newProposalEvent = new Proposal(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        mockEvent.receipt
    )
    newProposalEvent.parameters = new Array()
  let id = new ethereum.EventParam('id', ethereum.Value.fromI32(_id))
  let creator = new ethereum.EventParam(
    'creator',
    ethereum.Value.fromString(_creator)
  )
  let supermajority = new ethereum.EventParam('displayName', ethereum.Value.fromBoolean(_supermajority))
  let info = new ethereum.EventParam('imageUrl', ethereum.Value.fromString(_info))

  newProposalEvent.parameters.push(id)
  newProposalEvent.parameters.push(creator)
  newProposalEvent.parameters.push(supermajority)
  newProposalEvent.parameters.push(info)

  return newProposalEvent;
}