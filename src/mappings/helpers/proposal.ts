import { ipfs, JSONValue, Value, JSONValueKind, log } from '@graphprotocol/graph-ts'
import { Proposal } from '../../../generated/schema'
import { hashFromURI } from '../utils/ipfs'

/*
  {
    "title": "Lorem ipsum",
    "description": "Lorem ipsum"
  }
 */
export function loadOffChainDataForProposal(proposal: Proposal, dataURI: string): Proposal | null {
  let hash = hashFromURI(dataURI)
  ipfs.map(hash, 'unpackProposalData', Value.fromString(proposal.id), ['json'])

  return Proposal.load(proposal.id)
}

export function unpackProposalData(value: JSONValue, proposalId: Value): void {
  if (value.kind != JSONValueKind.OBJECT) {
    log.error("Root value type is invalid", [])
    return null
  }

  let object = value.toObject()

  let title = object.get("title")
  let description = object.get("description")

  if (
    title.kind != JSONValueKind.STRING ||
    description.kind != JSONValueKind.STRING
  ) {
    log.error("One of the required value types is invalid", [])
    return null
  }

  let proposal = Proposal.load(proposalId.toString())
  if (proposal == null) {
    log.error("Proposal wasn't found", [])
    return
  }

  proposal.title = title.toString()
  proposal.description = description.toString()

  proposal.save()
}
  