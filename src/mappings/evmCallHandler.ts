import { Call } from "../types";
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
  
  const date = formatDate(new Date(call.timestamp * 1000));
  const id = `${date}_${call.to}`;

  let record = await Call.get(id);
  if(record) {
    record.numberOfCalls++;
  } else {
    record = new Call(id);
    record.contractAddress = call.to;
    record.numberOfCalls = BigInt(1);
    record.timestamp = call.timestamp ? BigInt(call.timestamp) : BigInt(0);
  }

  await record.save();
}