import { Address, dataSource, log } from '@graphprotocol/graph-ts';
import { Transfer, NewProposal, YesVote, NoVote, Abstain } from '../../generated/templates/Asset/Asset';
import { AssetOwnership, Proposal, DeployedAsset } from '../../generated/schema';
import { createOrUpdateVote } from './helpers/vote'

export function handleTransfer(event: Transfer): void {
  let assetId = dataSource.context().getString('id')

  let transferValue = event.params.value
  let sender = event.params.from
  let recipient = event.params.to

  // Minted shares 

  const nullAddress = "0x0000000000000000000000000000000000000000"
  if (sender.toHexString() == nullAddress) {
    log.info("{} shares are minted for {}}", [transferValue.toString(), recipient.toHexString()])

    let ownershipId = assetId + "-" + recipient.toHexString()
    let ownership = new AssetOwnership(ownershipId)

    ownership.asset = assetId
    ownership.owner = recipient
    ownership.shares = transferValue.toI32()
    ownership.save()
  }

  // Transferred shares

  let asset = DeployedAsset.load(assetId)
  if (asset == null) {
    log.error("This contract's asset is not indexed properly", [])
    return
  }

  // If sender is not the DEX
  if (sender != asset.contract) {
    let ownershipId = assetId + "-" + sender.toHexString()
    let ownership = AssetOwnership.load(ownershipId)
    if (ownership == null) {
      log.error("Sender's ownership is not indexed properly", [])
      return
    }

    ownership.shares = ownership.shares - transferValue.toI32()
    ownership.save()

    log.info("{} shares subtracted from balance of {}}", [transferValue.toString(), sender.toHexString()])
  }

  // If recipient is not the DEX
  if (recipient != asset.contract) {
    let ownershipId = assetId + "-" + recipient.toHexString()
    var ownership = AssetOwnership.load(ownershipId)
    if (ownership == null) {
      ownership = new AssetOwnership(ownershipId)
      ownership.asset = assetId
      ownership.owner = recipient
      ownership.shares = transferValue.toI32()
    } else {
      ownership.shares = ownership.shares + transferValue.toI32()
    }

    ownership.save()

    log.info("{} shares added to balance of {}}", [transferValue.toString(), recipient.toHexString()])
  }
}

export function handleNewProposal(event: NewProposal): void {
  let proposal = new Proposal(event.params.id.toString())

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