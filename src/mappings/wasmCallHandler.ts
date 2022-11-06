import { Balance, AccountId } from "@polkadot/types/interfaces/runtime";
import { WasmCall } from "@subql/substrate-wasm-processor";
import { isRegisteredContract } from "./common";
import { storeCall } from "./commonCall";

type ApproveCallArgs = [AccountId, Balance];

/**
 * Handles WASM contract call.
 * @param call Call info.
 */
export async function handleWasmCall(
  call: WasmCall<ApproveCallArgs>
): Promise<void> {
  if (call.dest && isRegisteredContract(call.dest.toString())) {
    await storeCall(call.dest.toString(), call.from.toString());
  }
}
