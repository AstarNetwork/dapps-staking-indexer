// Methods here handles dapps staking pallet events.
import { SubstrateEvent } from "@subql/types";
import { Codec } from "@polkadot/types/types";
import { Contract, ContractState } from "../types";
import { isRegisteredContract } from "./common";

function getAddress(address: Codec): string {
  const addressJson = JSON.parse(address.toString());

  return addressJson.evm ? addressJson.evm : addressJson.wasm;
}

export async function handleNewContract(event: SubstrateEvent): Promise<void> {
  return; // no processign ATM

  const {
    event: {
      data: [account, contract],
    },
  } = event;
  const blockNumber = event.block.block.header.number.toBigInt();
  const contractAddress = getAddress(contract);
  const record = new Contract(contractAddress);
  record.owner = account.toString();
  record.state = ContractState.Registered;
  record.blockRegistered = blockNumber;
  await record.save();

  await isRegisteredContract(contractAddress);
}

export async function handleContractRemoved(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [account, contract],
    },
  } = event;
  const blockNumber = event.block.block.header.number.toBigInt();

  const contractAddress = getAddress(contract);
  const record = await Contract.get(contractAddress);
  record.state = ContractState.Unregistered;
  record.blockUnregistered = blockNumber;
  await record.save();
}
