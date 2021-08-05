import { AssetMinted, AssetDeployed } from '../generated/Frabric/Platform'
import { MintedAsset, DeployedAsset } from '../generated/schema'
import { Asset } from '../generated/templates'
import { loadOffChainDataForAsset } from './helpers/asset'

export function handleAssetMinted(event: AssetMinted): void {
  let asset = new MintedAsset(event.params.id.toHex())
  asset.dataURI = event.params.data
  asset.save()
}

export function handleAssetDeployed(event: AssetDeployed): void {
  let id = event.params.id.toHex()

  let asset = MintedAsset.load(id)
  if (asset == null) {
    // Asset can't be deployed without prior minting
    // TODO: Is it possible to throw an error here?
    return
  }

  let deployedAsset = new DeployedAsset(id)
  deployedAsset.contract = event.params.assetContract
  deployedAsset.numOfShares = event.params.shares

  let assetWithData = loadOffChainDataForAsset(deployedAsset, event.params.data)
  if (assetWithData == null) {
    // Asset data could not be retrieved
    return
  }

  assetWithData.save()

  // Start indexing the dynamically created asset contract

  let assetContext = new DataSourceContext()
  assetContext.setString('id', id)
  Asset.createWithContext(event.params.assetContract, assetContext)
}
