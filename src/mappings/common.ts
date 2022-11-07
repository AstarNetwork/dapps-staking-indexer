import { Option, Struct } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';

interface RegisteredDapp extends Struct {
  readonly developer: AccountId;
  readonly state: DappState;
}

interface DappState {
  isUnregistered: boolean;
  asUnregistered: {
    // Memo: era of unregistration
    words: number[];
  };
}

// Cache for registered contracts. Fetching all registered contracts on every call will have
// performance penalty.
// Idea is to fetch contracts once if cache is not initialized and to listen for contract register/unregister
// events to update cache.
let contracts: Map<string, boolean> = null;

export function getAddress(address: string): string {
  const addressJson = JSON.parse(address);

  return addressJson.evm ? addressJson.evm : addressJson.wasm;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

async function getRegisteredContracts(): Promise<Map<string, boolean>> {
  const dapps = await api.query.dappsStaking.registeredDapps.entries();
  const result = new Map<string, boolean>();

  dapps.forEach(([key, value]) => {
    const address = key.args.map((x) => x.toString())[0];
    const contractAddress = getAddress(address);
    // const v = <Option<RegisteredDapp>>value;
    // if (contractAddress && v.isSome) {
    //   const unwrappedValue = v.unwrap();
    //   logger.warn('unw' + unwrappedValue.toHuman());
    //   if (!unwrappedValue.state?.isUnregistered) {
    //     logger.warn(`adding address ${contractAddress}`);
    //     result.set(address, true);
    //   }
    // }

    // TODO check why the code above is not working (v.unwrap())
    if (contractAddress) {
      result.set(address, true);
    }
  });

  logger.info(`Found ${result.size} contracts.`);
  return result;
}

async function getContracts(): Promise<Map<string, boolean>> {
  if (!contracts) {
    contracts = await getRegisteredContracts();
  }

  return contracts;
}

/**
 * Checks if contracts is registered for dApps staking
 * @param contractAddress Contract address.
 * @returns A value indicating if contract is registerd or not.
 */
export async function isRegisteredContract(
  contractAddress: string
): Promise<boolean> {
  const c = await getContracts();

  return c.has(contractAddress);
}

/**
 * Adds contract to dapps cache.
 * @param contractAddress Contact to add.
 */
export async function addContactToCache(contractAddress: string) {
  const c = await getContracts();
  
  c.set(contractAddress, true);
}

/**
 * Removes contract to dapps cache.
 * @param contractAddress Contact to remove.
 */
 export async function removeContactFromCache(contractAddress: string) {
  const c = await getContracts();
  
  c.delete(contractAddress);
}


