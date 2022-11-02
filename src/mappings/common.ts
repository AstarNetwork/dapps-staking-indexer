import { Codec } from "@polkadot/types-codec/types";

let allContracts: Map<string, string> = null;

export function getAddress(address: Codec): string {
  const addressJson = JSON.parse(address.toString());

  return addressJson.evm ? addressJson.evm : addressJson.wasm;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0,10).replace(/-/g, '');
}

async function getRegisteredContracts(): Promise<Map<string, string>> {
  const dapps = await api.query.dappsStaking.registeredDapps.entries();
  const result = new Map<string, string>();
  logger.warn(dapps.toString());

  dapps.forEach(([key, value]) => {
    // TODO handle Unregistered contracts
    // const v = <Option<RegisteredDapp>>value;
    logger.warn(key.toHuman());
    const address = this.getContractAddress(key.args[0]);
    // let developer = '';
    // let state = SmartContractState.Unregistered;

    // if (v.isSome) {
    //   const unwrappedValue = v.unwrap();
    //   developer = unwrappedValue.developer.toString();
    //   state = unwrappedValue.state.isUnregistered
    //     ? SmartContractState.Unregistered
    //     : SmartContractState.Registered;
    // }

    if (address) {
      result[address] = address;
    }
  });

  logger.info(`Found ${result.size} contracts.`);
  return result;
}

export async function IsRegisteredContract(contractAddress: string): Promise<boolean> {
  if (!allContracts) {
    allContracts = await getRegisteredContracts();
  }

  return allContracts.has(contractAddress);
}