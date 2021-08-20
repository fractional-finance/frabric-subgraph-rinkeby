import { log } from '@graphprotocol/graph-ts';
import { Proposal, Vote } from '../../../generated/schema';
import {
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export function createOrUpdateVote(
  proposalId: BigInt,
  voterAddress: Address,
  voteCount: BigInt,
  voteType: string
): void {
  let proposalIdString = proposalId.toString()
  let voteId = proposalIdString + "-" + voterAddress.toHexString()

  let vote = Vote.load(voteId)
  if (vote == null) {
    vote = new Vote(voteId)
  }

  let proposal = Proposal.load(proposalIdString)
  if (proposal == null) {
    log.error("Can't vote on a non-existent proposal", [])
    // TODO: Is it possible to throw an error here?
    return
  }

  vote.proposal = proposal.id
  vote.voter = voterAddress
  vote.voteType = voteType
  vote.count = voteCount.toI32()
  vote.save()
}