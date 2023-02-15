import { Frabric as FrabricContract, KYC, ParticipantChange, Vouch } from '../../generated/Frabric/Frabric';
import { 
  BaseProposal, BondRemovalProposal, Frabric, FrabricParticipantRecord, PaperProposal, ParticipantProposal, 
  ParticipantRemovalProposal, ThreadProposal, ThreadProposalProposal, TokenActionProposal, 
  UpgradeProposal, Vote, Voucher 
} from '../../generated/schema';
import { 
  Proposal, ProposalStateChange, 
  BondRemovalProposal as BondRemovalProposalEvent,
  ParticipantProposal as ParticipantProposalEvent, 
  ParticipantRemovalProposal as ParticipantRemovalProposalEvent, 
  ThreadProposal as ThreadProposalEvent, 
  ThreadProposalProposal as ThreadProposalProposalEvent, 
  TokenActionProposal as TokenActionProposalEvent, 
  UpgradeProposal as UpgradeProposalEvent,
  Vote as VoteEvent,
} from '../../generated/Frabric/Frabric';
import { commonProposalTypeForCode, frabricParticipantTypeAtIndex, proposalStateAtIndex, voteDirectionAtIndex } from './helpers/types';
import { getFrabric } from './helpers/frabric';

// ### PROPOSALS ###

// TODO: Extract reusable proposal and voting code

export function handleProposal(event: Proposal): void {
  let contract = FrabricContract.bind(event.address)

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())

  let proposal = new BaseProposal(baseProposalId)
  proposal.proposalId = event.params.id.toHexString()
  proposal.frabric = event.address.toHexString()
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
    paperProposal.frabric = event.address.toHexString()
    paperProposal.baseProposal = proposal.id
    paperProposal.save()
  }
}

export function handleProposalStateChange(event: ProposalStateChange): void {
  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())

  let proposal = new BaseProposal(baseProposalId)
  proposal.proposalId = event.params.id.toHexString()
  proposal.state =  proposalStateAtIndex(event.params.state)
  proposal.save()
}

export function handleVote(event: VoteEvent): void {
  let voteId = event.params.id.toHexString().concat("_").concat(event.params.voter.toHexString())

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())

  let vote = new Vote(voteId)
  vote.proposal = BaseProposal.load(baseProposalId)!.id
  vote.voter = event.params.voter
  vote.voteDirection = voteDirectionAtIndex(event.params.direction)
  vote.count = event.params.votes
  vote.save()
}

export function handleBondRemovalProposal(event: BondRemovalProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new BondRemovalProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.participant = event.params.participant
  proposal.slash = event.params.slash
  proposal.amount = event.params.amount
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleParticipantProposal(event: ParticipantProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new ParticipantProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.participant = event.params.participant
  proposal.proposer = event.params.proposer
  proposal.participant = event.params.participant
  proposal.participantType = frabricParticipantTypeAtIndex(event.params.participantType)
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleParticipantRemovalProposal(event: ParticipantRemovalProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new ParticipantRemovalProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.participant = event.params.participant
  proposal.removalFee = event.params.fee
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleThreadProposal(event: ThreadProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new ThreadProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.governor = event.params.governor
  proposal.name = event.params.name
  proposal.symbol = event.params.symbol
  proposal.descriptor = event.params.descriptor
  proposal.data = event.params.data
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleThreadProposalProposal(event: ThreadProposalProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new ThreadProposalProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.thread = event.params.thread
  proposal.info = event.params.info
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleTokenActionProposal(event: TokenActionProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new TokenActionProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.token = event.params.token
  proposal.target = event.params.target
  proposal.mint = event.params.mint
  proposal.price = event.params.price
  proposal.amount = event.params.amount
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

export function handleUpgradeProposal(event: UpgradeProposalEvent): void {
  let frabric = Frabric.load(event.address.toHexString())!

  let baseProposalId = event.address.toHexString().concat("_").concat(event.params.id.toHexString())
  let baseProposal = BaseProposal.load(baseProposalId)!

  let proposal = new UpgradeProposal(event.params.id.toHexString())
  proposal.frabric = frabric.id
  proposal.beacon = event.params.beacon
  proposal.instance = event.params.instance
  proposal.version = event.params.version
  proposal.code = event.params.code
  proposal.data = event.params.data
  proposal.baseProposal = baseProposal.id
  proposal.save()
}

// ### PARTICIPANTION ###

export function handleKYC(event: KYC): void {
  // Not adding much to the indexed state for now
}

export function handleParticipantChange(event: ParticipantChange): void {
  let frabric = getFrabric(event.address)

  let participant = new FrabricParticipantRecord(event.params.participant.toHexString())
  participant.frabric = frabric.id
  participant.address = event.params.participant
  participant.type = frabricParticipantTypeAtIndex(event.params.participantType)
  participant.save()
}

export function handleVouch(event: Vouch): void {
  let voucher = new Voucher(event.params.voucher.toHexString().concat(event.params.vouchee.toHexString()))
  voucher.frabric = event.address.toHexString()
  voucher.signer = event.params.voucher
  voucher.participant = event.params.vouchee
  voucher.save()
}