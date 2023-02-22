import { Address, dataSource, log, BigInt, store } from '@graphprotocol/graph-ts';
import { 
  Claim as ClaimEvent, DelegateChanged, DelegateVotesChanged, Distribution as DistributionEvent, 
  Freeze, GlobalAcceptance, KYCUpdate, OrderCancellation, 
  OrderCancelling, OrderFill, OrderIncrease, OwnershipTransferred, 
  ParentChange, Paused, Removal, Transfer, Unpaused, 
  Whitelisted, Order as OrderEvent 
} from '../../generated/templates/FrabricERC20/FrabricERC20';
import { ExecutedOrder, FrabricERC20Transfer, WhitelistRecord, FreezeRecord } from '../../generated/schema';
import { orderTypeAtIndex } from './helpers/types'
import { getFrabricERC20, getFrabricERC20Balance, getFrabricERC20Holder } from './helpers/erc20';
import { ADDRESS_ZERO } from './constants'
import { getPricePoint } from './helpers/market';

// ### WHITELIST ###

export function handleGlobalAcceptance(event: GlobalAcceptance): void {
  let token = getFrabricERC20(event.address)
  token.globalAcceptance = true
  token.save()
}

export function handleWhitelisted(event: Whitelisted): void {
  let token = getFrabricERC20(event.address)
  
  let whitelistRecord = new WhitelistRecord(
    token.id.concat("_").concat(event.params.person.toHexString())
  )
  whitelistRecord.frabricERC20 = token.id
  whitelistRecord.person = event.params.person
  whitelistRecord.save()

  // Whitelist removal is taken care of in the 'Remove' event handler
}

export function handleKYCUpdate(event: KYCUpdate): void {
  let token = getFrabricERC20(event.address)
  
  let whitelistRecord = new WhitelistRecord(
    token.id.concat("_").concat(event.params.person.toHexString())
  )
  whitelistRecord.kycHash = event.params.newInfo
  whitelistRecord.save()
}

export function handleRemoval(event: Removal): void {
  let token = getFrabricERC20(event.address)
  
  let whitelistRecord = new WhitelistRecord(
    token.id.concat("_").concat(event.params.person.toHexString())
  )
  whitelistRecord.frabricERC20 = token.id
  whitelistRecord.person = event.params.person
  whitelistRecord.removed = true
  whitelistRecord.save()
}

// ### DEX ###

export function handleOrder(event: OrderEvent): void {
  let pricePoint = getPricePoint(event.address, event.params.price)
  pricePoint.type = orderTypeAtIndex(event.params.orderType)
  pricePoint.save()
}

export function handleOrderIncrease(event: OrderIncrease): void {
  let pricePoint = getPricePoint(event.address, event.params.price)
  pricePoint.totalAmount = pricePoint.totalAmount.plus(event.params.amount)
  pricePoint.save()
}

export function handleOrderCancellation(event: OrderCancellation): void {
  let pricePoint = getPricePoint(event.address, event.params.price)

  pricePoint.totalAmount = pricePoint.totalAmount.minus(event.params.amount)
  if (!pricePoint.totalAmount.gt(BigInt.fromI32(0))) {
    store.remove('PricePoint', pricePoint.id)
  } else {
    pricePoint.save()
  }
}

export function handleOrderFill(event: OrderFill): void {
  let pricePoint = getPricePoint(event.address, event.params.price)

  pricePoint.totalAmount = pricePoint.totalAmount.minus(event.params.amount)
  if (!pricePoint.totalAmount.gt(BigInt.fromI32(0))) {
    store.remove('PricePoint', pricePoint.id)
  } else {
    pricePoint.save()
  }

  let order = new ExecutedOrder(event.transaction.hash.toHexString())
  order.frabricERC20 = event.address.toHexString()
  order.blockTimestamp = event.block.timestamp.toI32()
  order.orderer = event.params.orderer
  order.executor = event.params.executor
  order.price = event.params.price
  order.amount = event.params.amount
  order.save()
}

export function handleOrderCancelling(event: OrderCancelling): void {
  // Looks like this event isn't used anywhere and should be removed
  // from the contract source.
}

// ### TRANSFER ###

export function handleTransfer(event: Transfer): void {
  let token = getFrabricERC20(event.address)

  let fromHolder = getFrabricERC20Holder(event.params.from)
  let toHolder = getFrabricERC20Holder(event.params.to)

	let transfer = new FrabricERC20Transfer(event.transaction.hash.toHexString())
  transfer.timestamp = event.block.timestamp
  transfer.frabricERC20 = token.id
  transfer.from = fromHolder.id
  transfer.to = toHolder.id
  transfer.amount = event.params.value

  // Both 'from' and 'to' holders can be a contract or a zero address.
  // The current version of the mapping logic doesn't handle these cases
  // in any specific way.

	if (event.params.from == ADDRESS_ZERO) {
    // Minting
    token.supply = token.supply.plus(event.params.value)
	} else {
		let balance = getFrabricERC20Balance(token, fromHolder)
		balance.amount = balance.amount.minus(event.params.value)
		balance.save()

		transfer.from = fromHolder.id
		transfer.fromBalance = balance.id
	}

	if (event.params.to == ADDRESS_ZERO) {
    // Burning
    token.supply = token.supply.minus(event.params.value)
	} else {
		let balance = getFrabricERC20Balance(token, toHolder)
		balance.amount = balance.amount.plus(event.params.value)
		balance.save()

		transfer.to = toHolder.id
		transfer.toBalance = balance.id
	}

  token.save()
	transfer.save()
}

// ### DISTRIBUTION ###

export function handleDistribution(event: DistributionEvent): void {
  // Currently irrelevant
}

export function handleClaim(event: ClaimEvent): void {
  // Currently irrelevant
}

// ### OWNERSHIP & DELEGATION ###

export function handleDelegateChanged(event: DelegateChanged): void {
  // Currently irrelevant
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  // Currently irrelevant
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // Currently irrelevant
}

// ### MISC ###

export function handleFreeze(event: Freeze): void {
  let freezeRecord = new FreezeRecord(event.params.person.toHexString())
  freezeRecord.frabricERC20 = event.address.toHexString()
  freezeRecord.person = event.params.person
  freezeRecord.frozenUntil = event.params.until.toI32()
  freezeRecord.save()
}

export function handlePaused(event: Paused): void {
  // Currently irrelevant
}

export function handleUnpaused(event: Unpaused): void {
  // Currently irrelevant
}