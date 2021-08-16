import { ipfs, JSONValue, Value, JSONValueKind, log } from '@graphprotocol/graph-ts'
import { DeployedAsset } from '../../../generated/schema'
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
export function loadOffChainDataForAsset(asset: DeployedAsset, dataURI: string): DeployedAsset | null {
  let hash = hashFromURI(dataURI)
  ipfs.map(hash, 'unpackDeployedAssetData', Value.fromString(asset.id), ['json'])

  return DeployedAsset.load(asset.id)
}

export function unpackDeployedAssetData(value: JSONValue, assetId: Value): void {
  if (value.kind != JSONValueKind.OBJECT) {
    log.error("Root value type is invalid", [])
    return
  }

  let object = value.toObject()

  let world = object.get("world")
  if (world.kind != JSONValueKind.OBJECT) {
    log.error("Value type is invalid", [])
    return
  }

  let worldObject = world.toObject()

  let property = worldObject.get("property")
  if (property.kind != JSONValueKind.OBJECT) {
    log.error("Value type is invalid", [])
    return
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
    log.error("One of the required value types is invalid", [])
    return
  }

  let asset = DeployedAsset.load(assetId.toString())
  if (asset == null) {
    log.error("This contract's asset is not indexed properly", [])
    return
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
    log.error("One of the required value types is invalid", [])
    return
  }

  asset.bdCount = bdCount.toBigInt().toI32()
  asset.baCount = baCount.toBigInt().toI32()

  asset.save()
}
