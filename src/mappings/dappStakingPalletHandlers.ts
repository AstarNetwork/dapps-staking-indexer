// Methods here handles dapps staking pallet events.
import { SubstrateEvent } from "@subql/types";
import { Codec } from "@polkadot/types/types";
import { addContactToCache, removeContactFromCache } from "./common";

function getAddress(address: Codec): string {
  const addressJson = JSON.parse(address.toString());

  return addressJson.evm ? addressJson.evm : addressJson.wasm;
}

/**
 * Adds contract address to cache.
 * @param event Register event data.
 */
export async function handleNewContract(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, contract],
    },
  } = event;
  
  logger.warn(`New contract ${contract}`);
  const contractAddress = getAddress(contract);
  await addContactToCache(contractAddress);
}

/**
 * Removes contract address from cache.
 * @param event Unregister event data.
 */
export async function handleContractRemoved(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [account, contract],
    },
  } = event;

  const contractAddress = getAddress(contract);
  await removeContactFromCache(contractAddress);
}
