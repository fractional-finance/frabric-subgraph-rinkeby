import { AssetMinted, AssetDeployed } from '../generated/Frabric/Platform'
import { MintedAsset, DeployedAsset } from '../generated/schema'
import { Asset } from '../generated/templates'

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
  deployedAsset.dataURI = asset.dataURI
  deployedAsset.numOfShares = event.params.shares
  deployedAsset.save()

  // Start indexing the dynamically created asset contract
  Asset.create(event.params.assetContract);

  /*
    Below is an example of passing context to the indexed contract if it's ever needed in the future:

    let assetContext = new DataSourceContext();
    assetContext.setString('numOfShares', event.params.shares);
    Asset.createWithContext(event.params.assetContract, assetContext);
  */
}
