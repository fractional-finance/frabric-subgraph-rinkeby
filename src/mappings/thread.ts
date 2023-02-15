import { Address, dataSource, log, BigInt, store } from '@graphprotocol/graph-ts';
import { 
  Thread as ThreadContract, DescriptorChange, DescriptorChangeProposal as DescriptorChangeProposalEvent, 
  FrabricChange, GovernorChange, 
  Proposal, Vote as VoteEvent, ProposalStateChange,
  DissolutionProposal as DissolutionProposalEvent, 
  EcosystemLeaveWithUpgradesProposal as EcosystemLeaveWithUpgradesProposalEvent, 
  FrabricChangeProposal as FrabricChangeProposalEvent, GovernorChangeProposal as GovernorChangeProposalEvent, 
  ParticipantRemovalProposal as ParticipantRemovalProposalEvent, TokenActionProposal as TokenActionProposalEvent, 
  UpgradeProposal as UpgradeProposalEvent
} from '../../generated/templates/Thread/Thread';
import { 
  BaseProposal, Thread, DissolutionProposal, 
  EcosystemLeaveWithUpgradesProposal, FrabricChangeProposal, GovernorChangeProposal, 
  ParticipantRemovalProposal, TokenActionProposal, UpgradeProposal, 
  Vote, Frabric, DesriptorChangeProposal, PaperProposal 
} from '../../generated/schema';
import { commonProposalTypeForCode, proposalStateAtIndex, voteDirectionAtIndex } from './helpers/types'
import { getFrabric } from './helpers/frabric';

// ### THREAD STRUCTURE ###

export function handleFrabricChange(event: FrabricChange): void {
  log.info("Calling {}", ["handleFrabricChange"])

  // The force-unwrapping will (supposedly) throw fatal error
  // if the object isn't found.
  let frabric = getFrabric(event.params.newGovernor)

  // TheGraph supports record merge operations automatically
  // so it's faster to save a new object with the same ID
  // versus load and update an existing one.
  let thread = new Thread(event.address.toHexString())
  thread.frabric = frabric.id
  thread.save()
}

export function handleDescriptorChange(event: DescriptorChange): void {
  log.info("Calling {}", ["handleDescriptorChange"])

  let thread = new Thread(event.address.toHexString())
  thread.descriptor = event.params.newDescriptor
  thread.save()
}

export function handleGovernorChange(event: GovernorChange): void {
  log.info("Calling {}", ["handleGovernorChange"])

  let thread = new Thread(event.address.toHexString())
  thread.governor = event.params.newGovernor
  thread.save()
}

// ### THREAD PROPOSALS ###

export function handleDescriptorChangeProposal(event: DescriptorChangeProposalEvent): void {
  log.info("Calling {}", ["handleDescriptorChangeProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new DesriptorChangeProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.descriptor = event.params.descriptor
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleGovernorChangeProposal(event: GovernorChangeProposalEvent): void {
  log.info("Calling {}", ["handleGovernorChangeProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new GovernorChangeProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.governor = event.params.governor
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleParticipantRemovalProposal(event: ParticipantRemovalProposalEvent): void {
  log.info("Calling {}", ["handleParticipantRemovalProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new ParticipantRemovalProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.participant = event.params.participant
  proposal.removalFee = event.params.fee
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleTokenActionProposal(event: TokenActionProposalEvent): void {
  log.info("Calling {}", ["handleTokenActionProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new TokenActionProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.token = event.params.token
  proposal.target = event.params.target
  proposal.mint = event.params.mint
  proposal.price = event.params.price
  proposal.amount = event.params.amount
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleUpgradeProposal(event: UpgradeProposalEvent): void {
  log.info("Calling {}", ["handleUpgradeProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new UpgradeProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.beacon = event.params.beacon
  proposal.instance = event.params.instance
  proposal.version = event.params.version
  proposal.code = event.params.code
  proposal.data = event.params.data
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleDissolutionProposal(event: DissolutionProposalEvent): void {
  log.info("Calling {}", ["handleDissolutionProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new DissolutionProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.token = event.params.token
  proposal.price = event.params.price
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleFrabricChangeProposal(event: FrabricChangeProposalEvent): void {
  log.info("Calling {}", ["handleFrabricChangeProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new FrabricChangeProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.frabric = event.params.frabric
  proposal.governor = event.params.governor
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleEcosystemLeaveWithUpgradesProposal(
  event: EcosystemLeaveWithUpgradesProposalEvent
): void {
  log.info("Calling {}", ["handleEcosystemLeaveWithUpgradesProposal"])

  // Take the previously created base proposal
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  // Create the specific proposal record composed
  // with the base proposal

  let proposal = new EcosystemLeaveWithUpgradesProposal(event.params.id.toHexString())
  proposal.thread = event.address.toHexString()
  proposal.frabric = event.params.frabric
  proposal.governor = event.params.governor
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleProposal(event: Proposal): void {
  log.info("Calling {}", ["handleProposal"])

  let contract = ThreadContract.bind(event.address)

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())

  let proposal = new BaseProposal(baseProposalId)
  proposal.proposalId = event.params.id.toHexString()
  proposal.thread = event.address.toHexString()
  proposal.creator = event.params.creator
  // TODO: Smart-map it to a type convenient for the frontend
  proposal.type = event.params.proposalType.toI32()
  proposal.state = "Null"
  proposal.info = event.params.info
  proposal.supermajority = event.params.supermajority
  proposal.startTimestamp = event.block.timestamp.toI32()
  proposal.endTimestamp = proposal.startTimestamp + contract.votingPeriod().toI32()
  proposal.save()

  // Handling a special case where 'Paper' proposal type has to be extracted from
  // the general base proposal

  if (commonProposalTypeForCode(proposal.type) == "Paper") {
    let paperProposal = new PaperProposal(event.params.id.toHexString())
    paperProposal.thread = event.address.toHexString()
    paperProposal.baseProposal = proposal.id
    paperProposal.save()
  }
}

export function handleProposalStateChange(event: ProposalStateChange): void {
  log.info("Calling {}", ["handleProposalStateChange"])

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let proposal = BaseProposal.load(baseProposalId)!
  proposal.state =  proposalStateAtIndex(event.params.state)
  proposal.save()
}

export function handleVote(event: VoteEvent): void {
  log.info("Calling {}", ["handleVote"])

  let voteId = event.params.id.toHexString().concat("_").concat(event.params.voter.toHexString())

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())

  let vote = new Vote(voteId)
  vote.proposal = BaseProposal.load(baseProposalId)!.id
  vote.voter = event.params.voter
  vote.voteDirection = voteDirectionAtIndex(event.params.direction)
  vote.count = event.params.votes
  vote.save()
}