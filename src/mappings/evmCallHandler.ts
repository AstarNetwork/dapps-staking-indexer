import { EraIndex } from '@polkadot/types/interfaces';
import { CallByEra } from "../types";
import {
  FrontierEvmEvent,
  FrontierEvmCall,
} from "@subql/frontier-evm-processor";
import { BigNumber } from "ethers";
import { formatDate } from './common';

type ApproveCallArgs = [string, BigNumber] & {
  _spender: string;
  _value: BigNumber;
};

export async function handleFrontierEvmCall(
  call: FrontierEvmCall<ApproveCallArgs>
): Promise<void> {
  logger.warn(`${call.from} ${call.to} ${call.success} ${call.gasPrice} ${call.args} ${call.timestamp}`);
  
  const era = await api.query.dappsStaking.currentEra<EraIndex>()
  const id = `${era}_${call.to}`;

  let record = await CallByEra.get(id);
  if(record) {
    record.numberOfCalls++;
  } else {
    record = new CallByEra(id);
    record.contractAddress = call.to;
    record.numberOfCalls = BigInt(1);
    record.era = era.toBigInt();
  }

  await record.save();
}