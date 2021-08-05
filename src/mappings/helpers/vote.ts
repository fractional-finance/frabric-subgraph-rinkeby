import { Proposal, Vote } from '../generated/schema'

export function createOrUpdateVote(
  proposalId: any,
  voterAddress: any,
  voteCount: any,
  voteType: string
): void {
  let proposalIdHex = proposalId.toHex()
  
  let voterAddressString = voterAddress.toString()
  let voteId = proposalIdHex + "-" + voterAddressString

  let vote = Vote.load(voteId)
  if (vote == null) {
    vote = new Vote(voteId)
  }

  let proposal = Proposal.load(proposalIdHex)
  if (proposal == null) {
    // Can't vote on a non-existent proposal
    // TODO: Is it possible to throw an error here?
    return
  }

  vote.proposal = proposal
  vote.voter = voterAddress
  vote.voteType = voteType
  vote.count = voteCount
  vote.save()
}
