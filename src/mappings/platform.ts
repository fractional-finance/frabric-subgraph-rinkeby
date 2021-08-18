import { DataSourceContext, log, ipfs, JSONValue, Value, JSONValueKind } from '@graphprotocol/graph-ts';
import { AssetMinted, AssetDeployed } from '../../generated/Platform/Platform';
import { MintedAsset, DeployedAsset } from '../../generated/schema';
import { Asset } from '../../generated/templates';

export function handleAssetMinted(event: AssetMinted): void {
  let asset = new MintedAsset(event.params.id.toString())
  asset.dataURI = event.params.data
  asset.save()
}

export function handleAssetDeployed(event: AssetDeployed): void {
  log.info("Calling {}", ["handleAssetDeployed"])

  let id = event.params.assetID.toString()

  // Start indexing the dynamically created asset contract

  let assetContext = new DataSourceContext()
  assetContext.setString('id', id)
  Asset.createWithContext(event.params.assetContract, assetContext)

  // Save the asset itself

  let asset = MintedAsset.load(id)

  let deployedAsset = new DeployedAsset(id)
  deployedAsset.mintedAsset = asset.id
  deployedAsset.symbol = event.params.symbol
  deployedAsset.contract = event.params.assetContract
  deployedAsset.numOfShares = event.params.shares.toI32()

  deployedAsset.save()

  asset.deployedAsset = deployedAsset.id
  asset.save()

  // appendOffChainDataForAsset(id, asset.dataURI)
}