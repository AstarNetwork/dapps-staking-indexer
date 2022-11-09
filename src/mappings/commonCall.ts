import { EraIndex } from "@polkadot/types/interfaces";
import { CallByEra } from "../types";
import { isRegisteredContract } from "./common";

/**
 * Stores number of calls and number of unique users to database
 * @param toAddress Contract address.
 * @param fromAddress User address.
 */
export async function storeCall(toAddress: string, fromAddress: string, callTimestamp: bigint, blockNumber?: number): Promise<void> {
  if (toAddress && await isRegisteredContract(toAddress)) {
    const era = await api.query.dappsStaking.currentEra<EraIndex>();
    const id = `${era}_${toAddress}`;

    let record = await CallByEra.get(id);
    if (record) {
      record.numberOfCalls++;
      record.endBlock = blockNumber;

      if(!record.activeUsers.includes(fromAddress)) {
        record.activeUsers.push(fromAddress);
        record.uniqueActiveUsers++;
      }

    } else {
      record = new CallByEra(id);
      record.contractAddress = toAddress;
      record.numberOfCalls = BigInt(1);
      record.era = era.toBigInt();
      record.activeUsers = [];
      record.activeUsers.push(fromAddress);
      record.uniqueActiveUsers = BigInt(1);
      record.timestamp = callTimestamp;
      record.startBlock = blockNumber;
    }

    await record.save();
  }
}
