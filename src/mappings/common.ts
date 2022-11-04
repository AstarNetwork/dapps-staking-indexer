import { Codec } from "@polkadot/types-codec/types";

let allContracts: Map<string, string> = null;

export function getAddress(address: string): string {
  const addressJson = JSON.parse(address);

  return addressJson.evm ? addressJson.evm : addressJson.wasm;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

async function getRegisteredContracts(): Promise<Map<string, string>> {
  const dapps = await api.query.dappsStaking.registeredDapps.entries();
  const result = new Map<string, string>();

  dapps.forEach(([key, value]) => {
    // TODO handle Unregistered contracts
    const address = key.args.map((x) => x.toString())[0];
    const contractAddress = getAddress(address);

    if (contractAddress) {
      logger.warn(`adding address ${contractAddress}`);
      result.set(address, address); //Value should be contract state.
    }
  });

  logger.info(`Found ${result.size} contracts.`);
  return result;
}

export async function isRegisteredContract(
  contractAddress: string
): Promise<boolean> {
  if (!allContracts) {
    allContracts = await getRegisteredContracts();
  }

  logger.info(
    `has contract ${contractAddress}=${allContracts.has(contractAddress)}`
  );
  return allContracts.has(contractAddress);
}
