import { FrontierEvmCall } from "@subql/frontier-evm-processor";
import { BigNumber } from "ethers";
import { storeCall } from "./commonCall";
import { isRegisteredContract } from "./common";

type ApproveCallArgs = [string, BigNumber] & {
  _spender: string;
  _value: BigNumber;
};

export async function handleFrontierEvmCall(
  call: FrontierEvmCall<ApproveCallArgs>
): Promise<void> {
  // logger.warn(`${call.from} ${call.to} ${call.success} ${call.gasPrice} ${call.args} ${call.timestamp}`);

  if (call.to && isRegisteredContract(call.to)) {
    await storeCall(call.to);
  }
}
