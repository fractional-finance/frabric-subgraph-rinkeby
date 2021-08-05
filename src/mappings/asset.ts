import { NewProposal, YesVote, NoVote, AbstainVote } from '../generated/Frabric/Asset'
import { Proposal } from '../generated/schema'
import { createOrUpdateVote } from './helpers/vote'

export function handleNewProposal(event: NewProposal): void {
  let proposal = new Proposal(event.params.id.toHex())
  proposal.creator = event.params.creator
  proposal.dataURI = event.params.info
  proposal.startTimestamp = event.block.timestamp
  proposal.endTimestamp = event.params.expires
  proposal.save()
}

export function handleYesVote(event: YesVote): void {
  createOrUpdateVote(
    event.params.id,
    event.params.voter,
    event.params.votes,
    "Yes"
  )
}

export function handleNoVote(event: NoVote): void {
  createOrUpdateVote(
    event.params.id,
    event.params.voter,
    event.params.votes,
    "No"
  )
}

export function handleAbstainVote(event: AbstainVote): void {
  createOrUpdateVote(
    event.params.id,
    event.params.voter,
    event.params.votes,
    "Abstain"
  )
}
