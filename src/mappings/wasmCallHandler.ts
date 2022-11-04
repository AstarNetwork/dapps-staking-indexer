import { Balance, AccountId } from "@polkadot/types/interfaces/runtime";
import { WasmCall } from "@subql/substrate-wasm-processor";
import { storeCall } from "./commonCall";

type ApproveCallArgs = [AccountId, Balance];

export async function handleWasmCall(
  call: WasmCall<ApproveCallArgs>
): Promise<void> {
  logger.warn(
    `${call.from} ${call.dest} ${call.success} ${call} ${call.timestamp}`
  );

  if (call.dest) {
    await storeCall(call.dest.toString());
  }
}
