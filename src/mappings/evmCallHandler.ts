import { FrontierEvmCall } from "@subql/frontier-evm-processor";
import { BigNumber } from "ethers";
import { storeCall } from "./commonCall";
import { isRegisteredContract } from "./common";

type ApproveCallArgs = [string, BigNumber] & {
  _spender: string;
  _value: BigNumber;
};

/**
 * Handles EVM contract call.
 * @param call Call info.
 */
export async function handleFrontierEvmCall(
  call: FrontierEvmCall<ApproveCallArgs>
): Promise<void> {
  await storeCall(call.to, call.from, BigInt(call.timestamp), call.blockNumber);
}
