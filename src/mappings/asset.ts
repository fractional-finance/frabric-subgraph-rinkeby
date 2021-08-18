import { dataSource, log } from '@graphprotocol/graph-ts';
import { NewProposal, YesVote, NoVote, Abstain } from '../../generated/templates/Asset/Asset';
import { Proposal, DeployedAsset } from '../../generated/schema';
import { createOrUpdateVote } from './helpers/vote'

export function handleNewProposal(event: NewProposal): void {
  let proposal = new Proposal(event.params.id.toHex())

  let assetId = dataSource.context().getString('id')
  let asset = DeployedAsset.load(assetId)
  if (asset == null) {
    log.error("This contract's asset is not indexed properly", [])
    return
  }
  proposal.asset = asset.id

  proposal.creator = event.params.creator
  proposal.dataURI = event.params.info
  proposal.startTimestamp = event.params.start.toI32()
  proposal.endTimestamp = event.params.end.toI32()

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

export function handleAbstain(event: Abstain): void {
  createOrUpdateVote(
    event.params.id,
    event.params.voter,
    event.params.votes,
    "Abstain"
  )
}