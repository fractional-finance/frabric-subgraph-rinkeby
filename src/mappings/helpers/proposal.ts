import { ipfs, json, JSONValueKind, log } from '@graphprotocol/graph-ts'
import { Proposal, Vote } from '../generated/schema'
import { hashFromURI } from '../utils/ipfs'

/*
  {
    "title": "Lorem ipsum",
    "description": "Lorem ipsum"
  }
 */
  export function loadOffChainDataForProposal(proposal: Proposal, dataURI: string): Proposal | null {
    let hash = hashFromURI(dataURI)
    let data = ipfs.cat(hash)
  
    let value = json.fromBytes(data)
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
  
    proposal.title = title.toString()
    proposal.description = description.toString()
  
    return proposal
  }
  