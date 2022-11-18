import { SubstrateExtrinsic, TypedEventRecord } from "@subql/types";
import { Codec } from "@polkadot/types/types";
import { Balance } from "@polkadot/types/interfaces";
import { getAddress } from "./common";
import { UserTransaction, UserTransactionType } from "../types";
import crypto from "crypto";

const PALLET_NAME = "dappsStaking";

enum DappStakingEvent {
  BondAndStake = "BondAndStake",
}

export async function handleBondAndStakeCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  const {
    extrinsic: {
      method: {
        args: [contract_id, value],
      },
    },
  } = extrinsic;

  await storeCall(
    UserTransactionType.BondAndStake,
    extrinsic,
    (value as Balance).toBigInt(),
    contract_id
  );
}

export async function handleUnbondAndUnstakeCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  const {
    extrinsic: {
      method: {
        args: [contract_id, value],
      },
    },
  } = extrinsic;

  await storeCall(
    UserTransactionType.UnbondAndUnstake,
    extrinsic,
    (value as Balance).toBigInt(),
    contract_id
  );
}

export async function handleNominationTransferCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  const {
    extrinsic: {
      method: {
        args: [origin_contract_id, value, target_contract_id],
      },
    },
  } = extrinsic;

  await storeCall(
    UserTransactionType.NominationTransfer,
    extrinsic,
    (value as Balance).toBigInt(),
    target_contract_id
  );
}

export async function handleWithdrawCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  await storeCall(
    UserTransactionType.Withdraw,
    extrinsic,
  );
}

export async function handleWithdrawFromUnregisteredCall(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  const {
    extrinsic: {
      method: {
        args: [contract_id],
      },
    },
  } = extrinsic;

  await storeCall(
    UserTransactionType.WithdrawFromUnregistered,
    extrinsic,
    null,
    contract_id
  );
}

async function storeCall(
  transaction: UserTransactionType,
  extrinsic: SubstrateExtrinsic,
  amount?: bigint,
  contractAddres?: Codec
): Promise<void> {
  const id = crypto.randomUUID();
  const record = new UserTransaction(id);

  record.amount = amount;
  record.timestamp = BigInt(extrinsic.block.timestamp.getTime());
  record.transaction = transaction;
  record.transactionHash = extrinsic.extrinsic.hash.toString(),
  record.transactionSuccess = extrinsic.success,
  record.userAddress = extrinsic.extrinsic.signer.toString(),
  record.contractAddress = contractAddres
    ? getAddress(contractAddres.toString())
    : null;
  record.blockNumber = extrinsic.block.block.header.number.toBigInt();

  await record.save();
}

function getAmountFromEvents(
  events: TypedEventRecord<Codec[]>[],
  eventToLook: DappStakingEvent
): bigint {
  let result = BigInt(0);
  const filteredEvents = events.filter(
    (x) => x.event.section === PALLET_NAME && x.event.method === eventToLook
  );

  filteredEvents.forEach(x => {
    const {event: {data: [account, contract, amount]}} = x;
    result += (amount as Balance).toBigInt();
  });

  return result;
}
