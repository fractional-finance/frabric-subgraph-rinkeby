import { NewProposal, YesVote, NoVote, AbstainVote } from '../generated/Frabric/Asset'
import { Proposal, DeployedAsset } from '../generated/schema'
import { createOrUpdateVote } from './helpers/vote'
import { loadOffChainDataForProposal } from './helpers/proposal'

export function handleNewProposal(event: NewProposal): void {
  let proposal = new Proposal(event.params.id.toHex())


  let assetId = dataSource.context().getString('id')
  let asset = DeployedAsset.load(assetId)
  if (asset == null) {
    log.error("This contract's asset is not indexed properly", [])
    return
  }
  proposal.asset = asset

  proposal.creator = event.params.creator
  proposal.startTimestamp = event.block.timestamp
  proposal.endTimestamp = event.params.expires

  let proposalWithData = loadOffChainDataForProposal(proposal, event.params.info)
  if (proposalWithData == null) {
    // Proposal data could not be retrieved
    return
  }

  proposalWithData.save()
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
