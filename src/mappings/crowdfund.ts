import { Address, dataSource, log, BigInt, store } from '@graphprotocol/graph-ts';
import { 
  Distribution as DistributionEvent, Claim as ClaimEvent, Approval, DelegateChanged, DelegateVotesChanged, Transfer
} from '../../generated/templates/FrabricERC20/FrabricERC20';
import { Distribution, Claim, Crowdfund, CrowdfundDeposit, CrowdfundWithdrawal, CrowdfundDistribution } from '../../generated/schema';
import { Deposit, Refund, StateChange, Withdraw } from '../../generated/templates/Crowdfund/Crowdfund';
import { crowdfundStateAtIndex } from './helpers/types';

// ### FUNDING ###

export function handleStateChange(event: StateChange): void {
  let crowdfund = new Crowdfund(event.address.toHexString())
  crowdfund.state = crowdfundStateAtIndex(event.params.state)
  crowdfund.save()
}

export function handleDeposit(event: Deposit): void {
  let crowdfund = Crowdfund.load(event.address.toHexString())!
  crowdfund.amountDeposited = crowdfund.amountDeposited.plus(event.params.amount)
  crowdfund.save()

  let deposit = new CrowdfundDeposit(event.transaction.hash.toHexString())
  deposit.crowdfund = crowdfund.id
  deposit.depositor = event.params.depositor
  deposit.amount = event.params.amount
  deposit.save()
}

export function handleRefund(event: Refund): void {
  // Not used anywhere in the contract
}

export function handleWithdraw(event: Withdraw): void {
  let crowdfund = Crowdfund.load(event.address.toHexString())!
  crowdfund.amountDeposited = crowdfund.amountDeposited.minus(event.params.amount)
  crowdfund.save()

  let deposit = new CrowdfundWithdrawal(event.transaction.hash.toHexString())
  deposit.crowdfund = crowdfund.id
  deposit.depositor = event.params.depositor
  deposit.amount = event.params.amount
  deposit.save()
}

// ### DISTRIBUTION ###

export function handleDistribution(event: DistributionEvent): void {
  let distribution = new Distribution(event.params.id.toHexString())
  distribution.token = event.params.token
  distribution.amount = event.params.amount
  distribution.save()

  let crowdfundDistribution = new CrowdfundDistribution(event.params.id.toHexString())
  crowdfundDistribution.crowdfund = event.address.toHexString()
  crowdfundDistribution.distribution = distribution.id
  crowdfundDistribution.save()
}

export function handleClaim(event: ClaimEvent): void {
  let claim = new Claim(event.transaction.hash.toHexString())
  claim.distribution = event.params.id.toHexString()
  claim.person = event.params.person
  claim.amount = event.params.amount
  claim.save()
}

// ### TRANSFERS ###

export function handleTransfer(event: Transfer): void {
  // The 'Deposit' and 'Withdrawal' event handlers
  // contain all the mapping logic to translate
  // the transfers into entities that makes sense
  // for the crowdfunding feature.
}

// ### MISC ###

export function handleApproval(event: Approval): void {
  // Currently irrelevant
}

export function handleDelegateChanged(event: DelegateChanged): void {
  // Currently irrelevant
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  // Currently irrelevant
}