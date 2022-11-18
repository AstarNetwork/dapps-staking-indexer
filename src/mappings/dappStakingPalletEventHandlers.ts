// Methods here handles dapps staking pallet events.
import { SubstrateEvent } from "@subql/types";
import { Codec } from "@polkadot/types/types";
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { addContactToCache, removeContactFromCache, getContracts } from "./common";
import { UserTransaction, UserTransactionType, Era, Contract } from "../types";
import crypto from 'crypto';

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
  
  // Reload contracts cache
  await getContracts(true);
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

  // Reload contracts cache
  await getContracts(true);
}

export async function handleBondAndStake(event: SubstrateEvent): Promise<void> {
  const {event: {data: [account, contract, amount]}} = event;
  await storeEvent(
    UserTransactionType.BondAndStake,
    account.toString(),
    (amount as Balance).toBigInt(),
    BigInt(event.block.timestamp.getTime()),
    event.block.block.header.number.toBigInt(),
    contract);
}

export async function handleUnbondAndUnstake(event: SubstrateEvent): Promise<void> {
  const {event: {data: [account, contract, amount]}} = event;
  await storeEvent(
    UserTransactionType.UnbondAndUnstake,
    account.toString(),
    (amount as Balance).toBigInt(),
    BigInt(event.block.timestamp.getTime()),
    event.block.block.header.number.toBigInt(),
    contract);
}

export async function handleWithdrawal(event: SubstrateEvent): Promise<void> {
  const {event: {data: [account, amount]}} = event;
  await storeEvent(
    UserTransactionType.Withdraw,
    account.toString(),
    (amount as Balance).toBigInt(),
    BigInt(event.block.timestamp.getTime()),
    event.block.block.header.number.toBigInt());
}

export async function handleWithdrawalFromUnregistered(event: SubstrateEvent): Promise<void> {
  const {event: {data: [account, contract, amount]}} = event;
  await storeEvent(
    UserTransactionType.WithdrawFromUnregistered,
    account.toString(),
    (amount as Balance).toBigInt(),
    BigInt(event.block.timestamp.getTime()),
    event.block.block.header.number.toBigInt(),
    contract);
}

export async function handleNominationTransfer(event: SubstrateEvent): Promise<void> {
  const {event: {data: [account, originContract, amount, targetContract]}} = event;
  await storeEvent(
    UserTransactionType.NominationTransfer,
    account.toString(),
    (amount as Balance).toBigInt(),
    BigInt(event.block.timestamp.getTime()),
    event.block.block.header.number.toBigInt(),
    targetContract);
}

export async function handleNewDappStakingEra(event:SubstrateEvent) {
  const {event: {data: [eraIndex]}} = event;

  const record = new Era(eraIndex.toString());
  record.block = event.block.block.header.number.toBigInt(),
  record.timestamp = BigInt(event.block.timestamp.getTime());
  await record.save();

  // Reload contracts cache
  await getContracts(true);
}

async function storeEvent(
  event: UserTransactionType,
  userAddress: string,
  amount: bigint,
  timestamp: bigint,
  blockNumber: bigint,
  contractAddres?: Codec,
): Promise<void> {
  const id = crypto.randomUUID();
  const record = new UserTransaction(id);
  record.amount = amount;
  record.timestamp = timestamp;
  record.transaction = event;
  record.userAddress = userAddress;
  record.contractAddress = contractAddres ? getAddress(contractAddres) : null;
  record.blockNumber = blockNumber;
  await record.save();
}
