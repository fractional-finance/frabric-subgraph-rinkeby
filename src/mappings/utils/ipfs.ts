export function hashFromURI(uri: string): string | null {
  if (!uri.startsWith("ipfs://")) {
    return null
  }
  
  return uri.substring(7)
}