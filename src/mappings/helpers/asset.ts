import { ipfs, json, JSONValueKind } from '@graphprotocol/graph-ts'
import { Asset } from '../generated/templates'
import { hashFromURI } from '../utils/ipfs'

/*
  {
    "world": {
      "property": {
        "address": "Test address 1",
        "currentRent": 1234,
        "marketValue": 1234,
        "area": 1234,
        "rooms": {
            "bdCount": 1,
            "baCount": 2
        },
        "grossYieldPct": 10,
        "yearBuilt": 2000,
        "coverImage": "Qmqwerty",
        "description": "Lorem ipsum."
      }
    }
  } 
 */
export function loadOffChainDataForAsset(asset: Asset, dataURI: string): Asset | null {
  let hash = hashFromURI(dataURI)
  let data = ipfs.cat(hash)

  let value = json.fromBytes(data)
  if (value.kind != JSONValueKind.OBJECT) {
    // Root value type is invalid
    return null
  }

  let worldObject = value.toObject()

  let property = worldObject.get("property")
  if (property.kind != JSONValueKind.OBJECT) {
    // Value type is invalid
    return null
  }

  let propertyObject = property.toObject()

  let address = propertyObject.get("address")
  let currentRent = propertyObject.get("currentRent")
  let marketValue = propertyObject.get("marketValue")
  let area = propertyObject.get("area")
  let grossYieldPct = propertyObject.get("grossYieldPct")
  let yearBuilt = propertyObject.get("yearBuilt")
  let description = propertyObject.get("description")
  let coverImage = propertyObject.get("coverImage")
  let rooms = propertyObject.get("rooms")

  if (
    address.kind != JSONValueKind.STRING ||
    currentRent.kind != JSONValueKind.NUMBER ||
    marketValue.kind != JSONValueKind.NUMBER ||
    area.kind != JSONValueKind.NUMBER ||
    grossYieldPct.kind != JSONValueKind.NUMBER ||
    yearBuilt.kind != JSONValueKind.NUMBER ||
    coverImage.kind != JSONValueKind.STRING ||
    rooms.kind != JSONValueKind.OBJECT
  ) {
    // One of the required value types is invalid
    return null
  }

  asset.address = address.toString()
  asset.currentRent = currentRent.toBigInt().toI32()
  asset.marketValue = marketValue.toBigInt().toI32()
  asset.area = area.toBigInt().toI32()
  asset.grossYieldPct = grossYieldPct.toBigInt().toI32()
  asset.yearBuilt = yearBuilt.toBigInt().toI32()
  asset.description = description.isNull() ? null : description.toString()
  asset.coverImage = coverImage.toString()

  let roomsObj = rooms.toObject()
  let bdCount = roomsObj.get("bdCount")
  let baCount = roomsObj.get("baCount")

  if (
    bdCount.kind != JSONValueKind.NUMBER ||
    baCount.kind != JSONValueKind.NUMBER
  ) {
    // One of the required value types is invalid
    return null
  }

  asset.bdCount = bdCount.toBigInt().toI32()
  asset.baCount = baCount.toBigInt().toI32()

  return asset
}
