import { Address, dataSource, log, BigInt, store } from '@graphprotocol/graph-ts';
import { Transfer, NewProposal, YesVote, NoVote, Abstain, OrderIncrease, Filled, NewBuyOrder, NewSellOrder } from '../../generated/templates/Asset/Asset';
import { AssetOwnership, Proposal, DeployedAsset, MarketOrder } from '../../generated/schema';
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

export function handleNewBuyOrder(event: NewBuyOrder): void {
  let assetId = dataSource.context().getString('id')
  let price = event.params.price
  let orderId = assetId + "-" + price.toString()

  createOrReplaceOrder(assetId, orderId, "Buy", price)
}

export function handleNewSellOrder(event: NewSellOrder): void {
  let assetId = dataSource.context().getString('id')
  let price = event.params.price
  let orderId = assetId + "-" + price.toString()

  createOrReplaceOrder(assetId, orderId, "Sell", price)
}

function createOrReplaceOrder(assetId: string, orderId: string, orderType: string, price: BigInt): void {
  var order = MarketOrder.load(orderId)
  if (order == null) {
    order = new MarketOrder(orderId)
  }

  order.orderType = orderType
  order.asset = assetId
  order.price = price
  order.amount = 0

  order.save()
}

export function handleOrderIncrease(event: OrderIncrease): void {
  let assetId = dataSource.context().getString('id')

  let price = event.params.price
  let amount = event.params.amount

  let orderId = assetId + "-" + price.toString()

  var order = MarketOrder.load(orderId)
  if (order == null) {
    log.error("Order at this price must exist: {}", [price.toString()])
    return
  } 
  
  // Update order at this price level

  order.amount = order.amount + amount.toI32()
  order.save()
}

export function handleFilled(event: Filled): void {
  let assetId = dataSource.context().getString('id')

  let price = event.params.price

  let orderId = assetId + "-" + price.toString()

  // Remove order at this price level

  store.remove('MarketOrder', orderId)
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