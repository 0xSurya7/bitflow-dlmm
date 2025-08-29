
import type { TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable, Response } from '@clarigen/core';

export const contracts = {
  dlmmCoreV11: {
  "functions": {
    adminNotRemovable: {"name":"admin-not-removable","access":"private","args":[{"name":"admin","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[admin: TypedAbiArg<string, "admin">], boolean>,
    createSymbol: {"name":"create-symbol","access":"private","args":[{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}],"outputs":{"type":{"optional":{"string-ascii":{"length":29}}}}} as TypedAbiFunction<[xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">], string | null>,
    isEnabledPool: {"name":"is-enabled-pool","access":"private","args":[{"name":"id","type":"uint128"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], boolean>,
    isValidPool: {"name":"is-valid-pool","access":"private","args":[{"name":"id","type":"uint128"},{"name":"contract","type":"principal"}],"outputs":{"type":"bool"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, contract: TypedAbiArg<string, "contract">], boolean>,
    addAdmin: {"name":"add-admin","access":"public","args":[{"name":"admin","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[admin: TypedAbiArg<string, "admin">], Response<boolean, bigint>>,
    addBinStep: {"name":"add-bin-step","access":"public","args":[{"name":"step","type":"uint128"},{"name":"factors","type":{"list":{"type":"uint128","length":1001}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[step: TypedAbiArg<number | bigint, "step">, factors: TypedAbiArg<number | bigint[], "factors">], Response<boolean, bigint>>,
    addLiquidity: {"name":"add-liquidity","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"},{"name":"bin-id","type":"int128"},{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"},{"name":"min-dlp","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">, binId: TypedAbiArg<number | bigint, "binId">, xAmount: TypedAbiArg<number | bigint, "xAmount">, yAmount: TypedAbiArg<number | bigint, "yAmount">, minDlp: TypedAbiArg<number | bigint, "minDlp">], Response<bigint, bigint>>,
    addVerifiedPoolCodeHash: {"name":"add-verified-pool-code-hash","access":"public","args":[{"name":"hash","type":{"buffer":{"length":32}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[hash: TypedAbiArg<Uint8Array, "hash">], Response<boolean, bigint>>,
    claimProtocolFees: {"name":"claim-protocol-fees","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">], Response<boolean, bigint>>,
    claimProtocolFeesMulti: {"name":"claim-protocol-fees-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"x-token-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"y-token-traits","type":{"list":{"type":"trait_reference","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, xTokenTraits: TypedAbiArg<string[], "xTokenTraits">, yTokenTraits: TypedAbiArg<string[], "yTokenTraits">], Response<Response<boolean, bigint>[], null>>,
    createPool: {"name":"create-pool","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"},{"name":"x-amount-active-bin","type":"uint128"},{"name":"y-amount-active-bin","type":"uint128"},{"name":"burn-amount-active-bin","type":"uint128"},{"name":"x-protocol-fee","type":"uint128"},{"name":"x-provider-fee","type":"uint128"},{"name":"y-protocol-fee","type":"uint128"},{"name":"y-provider-fee","type":"uint128"},{"name":"bin-step","type":"uint128"},{"name":"variable-fees-cooldown","type":"uint128"},{"name":"freeze-variable-fees-manager","type":"bool"},{"name":"fee-address","type":"principal"},{"name":"uri","type":{"string-ascii":{"length":256}}},{"name":"status","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">, xAmountActiveBin: TypedAbiArg<number | bigint, "xAmountActiveBin">, yAmountActiveBin: TypedAbiArg<number | bigint, "yAmountActiveBin">, burnAmountActiveBin: TypedAbiArg<number | bigint, "burnAmountActiveBin">, xProtocolFee: TypedAbiArg<number | bigint, "xProtocolFee">, xProviderFee: TypedAbiArg<number | bigint, "xProviderFee">, yProtocolFee: TypedAbiArg<number | bigint, "yProtocolFee">, yProviderFee: TypedAbiArg<number | bigint, "yProviderFee">, binStep: TypedAbiArg<number | bigint, "binStep">, variableFeesCooldown: TypedAbiArg<number | bigint, "variableFeesCooldown">, freezeVariableFeesManager: TypedAbiArg<boolean, "freezeVariableFeesManager">, feeAddress: TypedAbiArg<string, "feeAddress">, uri: TypedAbiArg<string, "uri">, status: TypedAbiArg<boolean, "status">], Response<boolean, bigint>>,
    removeAdmin: {"name":"remove-admin","access":"public","args":[{"name":"admin","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[admin: TypedAbiArg<string, "admin">], Response<boolean, bigint>>,
    resetVariableFees: {"name":"reset-variable-fees","access":"public","args":[{"name":"pool-trait","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">], Response<boolean, bigint>>,
    resetVariableFeesMulti: {"name":"reset-variable-fees-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">], Response<Response<boolean, bigint>[], null>>,
    setDynamicConfig: {"name":"set-dynamic-config","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"config","type":{"buffer":{"length":4096}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, config: TypedAbiArg<Uint8Array, "config">], Response<boolean, bigint>>,
    setDynamicConfigMulti: {"name":"set-dynamic-config-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"configs","type":{"list":{"type":{"buffer":{"length":4096}},"length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, configs: TypedAbiArg<Uint8Array[], "configs">], Response<Response<boolean, bigint>[], null>>,
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    setFeeAddressMulti: {"name":"set-fee-address-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"addresses","type":{"list":{"type":"principal","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, addresses: TypedAbiArg<string[], "addresses">], Response<Response<boolean, bigint>[], null>>,
    setFreezeVariableFeesManager: {"name":"set-freeze-variable-fees-manager","access":"public","args":[{"name":"pool-trait","type":"trait_reference"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">], Response<boolean, bigint>>,
    setFreezeVariableFeesManagerMulti: {"name":"set-freeze-variable-fees-manager-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">], Response<Response<boolean, bigint>[], null>>,
    setMinimumShares: {"name":"set-minimum-shares","access":"public","args":[{"name":"min-bin","type":"uint128"},{"name":"min-burnt","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[minBin: TypedAbiArg<number | bigint, "minBin">, minBurnt: TypedAbiArg<number | bigint, "minBurnt">], Response<boolean, bigint>>,
    setPoolStatus: {"name":"set-pool-status","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"status","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, status: TypedAbiArg<boolean, "status">], Response<boolean, bigint>>,
    setPoolStatusMulti: {"name":"set-pool-status-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"statuses","type":{"list":{"type":"bool","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, statuses: TypedAbiArg<boolean[], "statuses">], Response<Response<boolean, bigint>[], null>>,
    setPoolUri: {"name":"set-pool-uri","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"uri","type":{"string-ascii":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, uri: TypedAbiArg<string, "uri">], Response<boolean, bigint>>,
    setPoolUriMulti: {"name":"set-pool-uri-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"uris","type":{"list":{"type":{"string-ascii":{"length":256}},"length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, uris: TypedAbiArg<string[], "uris">], Response<Response<boolean, bigint>[], null>>,
    setPublicPoolCreation: {"name":"set-public-pool-creation","access":"public","args":[{"name":"status","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[status: TypedAbiArg<boolean, "status">], Response<boolean, bigint>>,
    setVariableFees: {"name":"set-variable-fees","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-fee","type":"uint128"},{"name":"y-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xFee: TypedAbiArg<number | bigint, "xFee">, yFee: TypedAbiArg<number | bigint, "yFee">], Response<boolean, bigint>>,
    setVariableFeesCooldown: {"name":"set-variable-fees-cooldown","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"cooldown","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, cooldown: TypedAbiArg<number | bigint, "cooldown">], Response<boolean, bigint>>,
    setVariableFeesCooldownMulti: {"name":"set-variable-fees-cooldown-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"cooldowns","type":{"list":{"type":"uint128","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, cooldowns: TypedAbiArg<number | bigint[], "cooldowns">], Response<Response<boolean, bigint>[], null>>,
    setVariableFeesManager: {"name":"set-variable-fees-manager","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"manager","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, manager: TypedAbiArg<string, "manager">], Response<boolean, bigint>>,
    setVariableFeesManagerMulti: {"name":"set-variable-fees-manager-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"managers","type":{"list":{"type":"principal","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, managers: TypedAbiArg<string[], "managers">], Response<Response<boolean, bigint>[], null>>,
    setVariableFeesMulti: {"name":"set-variable-fees-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"x-fees","type":{"list":{"type":"uint128","length":120}}},{"name":"y-fees","type":{"list":{"type":"uint128","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, xFees: TypedAbiArg<number | bigint[], "xFees">, yFees: TypedAbiArg<number | bigint[], "yFees">], Response<Response<boolean, bigint>[], null>>,
    setXFees: {"name":"set-x-fees","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, bigint>>,
    setXFeesMulti: {"name":"set-x-fees-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"protocol-fees","type":{"list":{"type":"uint128","length":120}}},{"name":"provider-fees","type":{"list":{"type":"uint128","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, protocolFees: TypedAbiArg<number | bigint[], "protocolFees">, providerFees: TypedAbiArg<number | bigint[], "providerFees">], Response<Response<boolean, bigint>[], null>>,
    setYFees: {"name":"set-y-fees","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, bigint>>,
    setYFeesMulti: {"name":"set-y-fees-multi","access":"public","args":[{"name":"pool-traits","type":{"list":{"type":"trait_reference","length":120}}},{"name":"protocol-fees","type":{"list":{"type":"uint128","length":120}}},{"name":"provider-fees","type":{"list":{"type":"uint128","length":120}}}],"outputs":{"type":{"response":{"ok":{"list":{"type":{"response":{"ok":"bool","error":"uint128"}},"length":120}},"error":"none"}}}} as TypedAbiFunction<[poolTraits: TypedAbiArg<string[], "poolTraits">, protocolFees: TypedAbiArg<number | bigint[], "protocolFees">, providerFees: TypedAbiArg<number | bigint[], "providerFees">], Response<Response<boolean, bigint>[], null>>,
    swapXForY: {"name":"swap-x-for-y","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"},{"name":"bin-id","type":"int128"},{"name":"x-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">, binId: TypedAbiArg<number | bigint, "binId">, xAmount: TypedAbiArg<number | bigint, "xAmount">], Response<bigint, bigint>>,
    swapYForX: {"name":"swap-y-for-x","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"},{"name":"bin-id","type":"int128"},{"name":"y-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">, binId: TypedAbiArg<number | bigint, "binId">, yAmount: TypedAbiArg<number | bigint, "yAmount">], Response<bigint, bigint>>,
    withdrawLiquidity: {"name":"withdraw-liquidity","access":"public","args":[{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"},{"name":"bin-id","type":"int128"},{"name":"amount","type":"uint128"},{"name":"min-x-amount","type":"uint128"},{"name":"min-y-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[poolTrait: TypedAbiArg<string, "poolTrait">, xTokenTrait: TypedAbiArg<string, "xTokenTrait">, yTokenTrait: TypedAbiArg<string, "yTokenTrait">, binId: TypedAbiArg<number | bigint, "binId">, amount: TypedAbiArg<number | bigint, "amount">, minXAmount: TypedAbiArg<number | bigint, "minXAmount">, minYAmount: TypedAbiArg<number | bigint, "minYAmount">], Response<{
  "xAmount": bigint;
  "yAmount": bigint;
}, bigint>>,
    getAdminHelper: {"name":"get-admin-helper","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"principal","error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getAdmins: {"name":"get-admins","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"list":{"type":"principal","length":5}},"error":"none"}}}} as TypedAbiFunction<[], Response<string[], null>>,
    getAllowedTokenDirection: {"name":"get-allowed-token-direction","access":"read_only","args":[{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}],"outputs":{"type":{"response":{"ok":{"optional":"bool"},"error":"none"}}}} as TypedAbiFunction<[xToken: TypedAbiArg<string, "xToken">, yToken: TypedAbiArg<string, "yToken">], Response<boolean | null, null>>,
    getBinFactorsByStep: {"name":"get-bin-factors-by-step","access":"read_only","args":[{"name":"step","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"list":{"type":"uint128","length":1001}}},"error":"none"}}}} as TypedAbiFunction<[step: TypedAbiArg<number | bigint, "step">], Response<bigint[] | null, null>>,
    getBinPrice: {"name":"get-bin-price","access":"read_only","args":[{"name":"initial-price","type":"uint128"},{"name":"bin-step","type":"uint128"},{"name":"bin-id","type":"int128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[initialPrice: TypedAbiArg<number | bigint, "initialPrice">, binStep: TypedAbiArg<number | bigint, "binStep">, binId: TypedAbiArg<number | bigint, "binId">], Response<bigint, bigint>>,
    getBinSteps: {"name":"get-bin-steps","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"list":{"type":"uint128","length":1000}},"error":"none"}}}} as TypedAbiFunction<[], Response<bigint[], null>>,
    getLastPoolId: {"name":"get-last-pool-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getLiquidityValue: {"name":"get-liquidity-value","access":"read_only","args":[{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"},{"name":"bin-price","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[xAmount: TypedAbiArg<number | bigint, "xAmount">, yAmount: TypedAbiArg<number | bigint, "yAmount">, binPrice: TypedAbiArg<number | bigint, "binPrice">], Response<bigint, null>>,
    getMinimumBinShares: {"name":"get-minimum-bin-shares","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getMinimumBurntShares: {"name":"get-minimum-burnt-shares","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getPoolById: {"name":"get-pool-by-id","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"tuple":[{"name":"id","type":"uint128"},{"name":"name","type":{"string-ascii":{"length":32}}},{"name":"pool-contract","type":"principal"},{"name":"status","type":"bool"},{"name":"symbol","type":{"string-ascii":{"length":32}}},{"name":"verified","type":"bool"}]}},"error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "id": bigint;
  "name": string;
  "poolContract": string;
  "status": boolean;
  "symbol": string;
  "verified": boolean;
} | null, null>>,
    getPublicPoolCreation: {"name":"get-public-pool-creation","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[], Response<boolean, null>>,
    getSignedBinId: {"name":"get-signed-bin-id","access":"read_only","args":[{"name":"bin-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"int128","error":"none"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">], Response<bigint, null>>,
    getUnclaimedProtocolFeesById: {"name":"get-unclaimed-protocol-fees-by-id","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"tuple":[{"name":"x-fee","type":"uint128"},{"name":"y-fee","type":"uint128"}]}},"error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "xFee": bigint;
  "yFee": bigint;
} | null, null>>,
    getUnsignedBinId: {"name":"get-unsigned-bin-id","access":"read_only","args":[{"name":"bin-id","type":"int128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">], Response<bigint, null>>,
    getVerifiedPoolCodeHashes: {"name":"get-verified-pool-code-hashes","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"list":{"type":{"buffer":{"length":32}},"length":10000}},"error":"none"}}}} as TypedAbiFunction<[], Response<Uint8Array[], null>>
  },
  "maps": {
    allowedTokenDirection: {"name":"allowed-token-direction","key":{"tuple":[{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}]},"value":"bool"} as TypedAbiMap<{
  "xToken": string;
  "yToken": string;
}, boolean>,
    binFactors: {"name":"bin-factors","key":"uint128","value":{"list":{"type":"uint128","length":1001}}} as TypedAbiMap<number | bigint, bigint[]>,
    pools: {"name":"pools","key":"uint128","value":{"tuple":[{"name":"id","type":"uint128"},{"name":"name","type":{"string-ascii":{"length":32}}},{"name":"pool-contract","type":"principal"},{"name":"status","type":"bool"},{"name":"symbol","type":{"string-ascii":{"length":32}}},{"name":"verified","type":"bool"}]}} as TypedAbiMap<number | bigint, {
  "id": bigint;
  "name": string;
  "poolContract": string;
  "status": boolean;
  "symbol": string;
  "verified": boolean;
}>,
    unclaimedProtocolFees: {"name":"unclaimed-protocol-fees","key":"uint128","value":{"tuple":[{"name":"x-fee","type":"uint128"},{"name":"y-fee","type":"uint128"}]}} as TypedAbiMap<number | bigint, {
  "xFee": bigint;
  "yFee": bigint;
}>
  },
  "variables": {
    CENTER_BIN_ID: {
  name: 'CENTER_BIN_ID',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    CONTRACT_DEPLOYER: {
  name: 'CONTRACT_DEPLOYER',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    ERR_ADMIN_LIMIT_REACHED: {
  name: 'ERR_ADMIN_LIMIT_REACHED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ADMIN_NOT_IN_LIST: {
  name: 'ERR_ADMIN_NOT_IN_LIST',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ALREADY_ADMIN: {
  name: 'ERR_ALREADY_ADMIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ALREADY_BIN_STEP: {
  name: 'ERR_ALREADY_BIN_STEP',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_ALREADY_VERIFIED_POOL_CODE_HASH: {
  name: 'ERR_ALREADY_VERIFIED_POOL_CODE_HASH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_BIN_STEP_LIMIT_REACHED: {
  name: 'ERR_BIN_STEP_LIMIT_REACHED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER: {
  name: 'ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_BIN_FACTOR: {
  name: 'ERR_INVALID_BIN_FACTOR',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_BIN_FACTORS_LENGTH: {
  name: 'ERR_INVALID_BIN_FACTORS_LENGTH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_BIN_PRICE: {
  name: 'ERR_INVALID_BIN_PRICE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_BIN_STEP: {
  name: 'ERR_INVALID_BIN_STEP',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_DYNAMIC_CONFIG: {
  name: 'ERR_INVALID_DYNAMIC_CONFIG',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_FEE: {
  name: 'ERR_INVALID_FEE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_INITIAL_PRICE: {
  name: 'ERR_INVALID_INITIAL_PRICE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_LIQUIDITY_VALUE: {
  name: 'ERR_INVALID_LIQUIDITY_VALUE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_MIN_BURNT_SHARES: {
  name: 'ERR_INVALID_MIN_BURNT_SHARES',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_MIN_DLP_AMOUNT: {
  name: 'ERR_INVALID_MIN_DLP_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_POOL: {
  name: 'ERR_INVALID_POOL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_POOL_NAME: {
  name: 'ERR_INVALID_POOL_NAME',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_POOL_SYMBOL: {
  name: 'ERR_INVALID_POOL_SYMBOL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_POOL_URI: {
  name: 'ERR_INVALID_POOL_URI',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_PRINCIPAL: {
  name: 'ERR_INVALID_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_TOKEN_DIRECTION: {
  name: 'ERR_INVALID_TOKEN_DIRECTION',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_VERIFIED_POOL_CODE_HASH: {
  name: 'ERR_INVALID_VERIFIED_POOL_CODE_HASH',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_X_AMOUNT: {
  name: 'ERR_INVALID_X_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_X_TOKEN: {
  name: 'ERR_INVALID_X_TOKEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_Y_AMOUNT: {
  name: 'ERR_INVALID_Y_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_Y_TOKEN: {
  name: 'ERR_INVALID_Y_TOKEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MATCHING_TOKEN_CONTRACTS: {
  name: 'ERR_MATCHING_TOKEN_CONTRACTS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MAXIMUM_X_AMOUNT: {
  name: 'ERR_MAXIMUM_X_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MAXIMUM_Y_AMOUNT: {
  name: 'ERR_MAXIMUM_Y_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_BURN_AMOUNT: {
  name: 'ERR_MINIMUM_BURN_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_LP_AMOUNT: {
  name: 'ERR_MINIMUM_LP_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_X_AMOUNT: {
  name: 'ERR_MINIMUM_X_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_Y_AMOUNT: {
  name: 'ERR_MINIMUM_Y_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_ACTIVE_BIN: {
  name: 'ERR_NOT_ACTIVE_BIN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_BIN_FACTORS: {
  name: 'ERR_NO_BIN_FACTORS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_BIN_SHARES: {
  name: 'ERR_NO_BIN_SHARES',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_POOL_DATA: {
  name: 'ERR_NO_POOL_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA: {
  name: 'ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_POOL_ALREADY_CREATED: {
  name: 'ERR_POOL_ALREADY_CREATED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_POOL_DISABLED: {
  name: 'ERR_POOL_DISABLED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_POOL_NOT_CREATED: {
  name: 'ERR_POOL_NOT_CREATED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_VARIABLE_FEES_COOLDOWN: {
  name: 'ERR_VARIABLE_FEES_COOLDOWN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_VARIABLE_FEES_MANAGER_FROZEN: {
  name: 'ERR_VARIABLE_FEES_MANAGER_FROZEN',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED: {
  name: 'ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    FEE_SCALE_BPS: {
  name: 'FEE_SCALE_BPS',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    MAX_BIN_ID: {
  name: 'MAX_BIN_ID',
  type: 'int128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    MIN_BIN_ID: {
  name: 'MIN_BIN_ID',
  type: 'int128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    NUM_OF_BINS: {
  name: 'NUM_OF_BINS',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    PRICE_SCALE_BPS: {
  name: 'PRICE_SCALE_BPS',
  type: 'uint128',
  access: 'constant'
} as TypedAbiVariable<bigint>,
    adminHelper: {
  name: 'admin-helper',
  type: 'principal',
  access: 'variable'
} as TypedAbiVariable<string>,
    admins: {
  name: 'admins',
  type: {
    list: {
      type: 'principal',
      length: 5
    }
  },
  access: 'variable'
} as TypedAbiVariable<string[]>,
    binSteps: {
  name: 'bin-steps',
  type: {
    list: {
      type: 'uint128',
      length: 1_000
    }
  },
  access: 'variable'
} as TypedAbiVariable<bigint[]>,
    lastPoolId: {
  name: 'last-pool-id',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    minimumBinShares: {
  name: 'minimum-bin-shares',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    minimumBurntShares: {
  name: 'minimum-burnt-shares',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    publicPoolCreation: {
  name: 'public-pool-creation',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    verifiedPoolCodeHashes: {
  name: 'verified-pool-code-hashes',
  type: {
    list: {
      type: {
        buffer: {
          length: 32
        }
      },
      length: 10_000
    }
  },
  access: 'variable'
} as TypedAbiVariable<Uint8Array[]>
  },
  constants: {
  CENTER_BIN_ID: 500n,
  CONTRACT_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  ERR_ADMIN_LIMIT_REACHED: {
    isOk: false,
    value: 1_005n
  },
  ERR_ADMIN_NOT_IN_LIST: {
    isOk: false,
    value: 1_006n
  },
  ERR_ALREADY_ADMIN: {
    isOk: false,
    value: 1_004n
  },
  ERR_ALREADY_BIN_STEP: {
    isOk: false,
    value: 1_030n
  },
  ERR_ALREADY_VERIFIED_POOL_CODE_HASH: {
    isOk: false,
    value: 1_042n
  },
  ERR_BIN_STEP_LIMIT_REACHED: {
    isOk: false,
    value: 1_031n
  },
  ERR_CANNOT_REMOVE_CONTRACT_DEPLOYER: {
    isOk: false,
    value: 1_007n
  },
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 1_002n
  },
  ERR_INVALID_BIN_FACTOR: {
    isOk: false,
    value: 1_033n
  },
  ERR_INVALID_BIN_FACTORS_LENGTH: {
    isOk: false,
    value: 1_034n
  },
  ERR_INVALID_BIN_PRICE: {
    isOk: false,
    value: 1_036n
  },
  ERR_INVALID_BIN_STEP: {
    isOk: false,
    value: 1_029n
  },
  ERR_INVALID_DYNAMIC_CONFIG: {
    isOk: false,
    value: 1_040n
  },
  ERR_INVALID_FEE: {
    isOk: false,
    value: 1_026n
  },
  ERR_INVALID_INITIAL_PRICE: {
    isOk: false,
    value: 1_035n
  },
  ERR_INVALID_LIQUIDITY_VALUE: {
    isOk: false,
    value: 1_025n
  },
  ERR_INVALID_MIN_BURNT_SHARES: {
    isOk: false,
    value: 1_028n
  },
  ERR_INVALID_MIN_DLP_AMOUNT: {
    isOk: false,
    value: 1_047n
  },
  ERR_INVALID_POOL: {
    isOk: false,
    value: 1_012n
  },
  ERR_INVALID_POOL_NAME: {
    isOk: false,
    value: 1_015n
  },
  ERR_INVALID_POOL_SYMBOL: {
    isOk: false,
    value: 1_014n
  },
  ERR_INVALID_POOL_URI: {
    isOk: false,
    value: 1_013n
  },
  ERR_INVALID_PRINCIPAL: {
    isOk: false,
    value: 1_003n
  },
  ERR_INVALID_TOKEN_DIRECTION: {
    isOk: false,
    value: 1_016n
  },
  ERR_INVALID_VERIFIED_POOL_CODE_HASH: {
    isOk: false,
    value: 1_041n
  },
  ERR_INVALID_X_AMOUNT: {
    isOk: false,
    value: 1_045n
  },
  ERR_INVALID_X_TOKEN: {
    isOk: false,
    value: 1_018n
  },
  ERR_INVALID_Y_AMOUNT: {
    isOk: false,
    value: 1_046n
  },
  ERR_INVALID_Y_TOKEN: {
    isOk: false,
    value: 1_019n
  },
  ERR_MATCHING_TOKEN_CONTRACTS: {
    isOk: false,
    value: 1_017n
  },
  ERR_MAXIMUM_X_AMOUNT: {
    isOk: false,
    value: 1_023n
  },
  ERR_MAXIMUM_Y_AMOUNT: {
    isOk: false,
    value: 1_024n
  },
  ERR_MINIMUM_BURN_AMOUNT: {
    isOk: false,
    value: 1_027n
  },
  ERR_MINIMUM_LP_AMOUNT: {
    isOk: false,
    value: 1_022n
  },
  ERR_MINIMUM_X_AMOUNT: {
    isOk: false,
    value: 1_020n
  },
  ERR_MINIMUM_Y_AMOUNT: {
    isOk: false,
    value: 1_021n
  },
  ERR_NOT_ACTIVE_BIN: {
    isOk: false,
    value: 1_037n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 1_001n
  },
  ERR_NO_BIN_FACTORS: {
    isOk: false,
    value: 1_032n
  },
  ERR_NO_BIN_SHARES: {
    isOk: false,
    value: 1_048n
  },
  ERR_NO_POOL_DATA: {
    isOk: false,
    value: 1_008n
  },
  ERR_NO_UNCLAIMED_PROTOCOL_FEES_DATA: {
    isOk: false,
    value: 1_044n
  },
  ERR_POOL_ALREADY_CREATED: {
    isOk: false,
    value: 1_011n
  },
  ERR_POOL_DISABLED: {
    isOk: false,
    value: 1_010n
  },
  ERR_POOL_NOT_CREATED: {
    isOk: false,
    value: 1_009n
  },
  ERR_VARIABLE_FEES_COOLDOWN: {
    isOk: false,
    value: 1_038n
  },
  ERR_VARIABLE_FEES_MANAGER_FROZEN: {
    isOk: false,
    value: 1_039n
  },
  ERR_VERIFIED_POOL_CODE_HASH_LIMIT_REACHED: {
    isOk: false,
    value: 1_043n
  },
  FEE_SCALE_BPS: 10_000n,
  MAX_BIN_ID: 500n,
  MIN_BIN_ID: -500n,
  NUM_OF_BINS: 1_001n,
  PRICE_SCALE_BPS: 100_000_000n,
  adminHelper: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  admins: [
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  ],
  binSteps: [
    1n,
    5n,
    10n,
    20n,
    25n
  ],
  lastPoolId: 0n,
  minimumBinShares: 10_000n,
  minimumBurntShares: 1_000n,
  publicPoolCreation: false,
  verifiedPoolCodeHashes: [
    Uint8Array.from([])
  ]
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'dlmm-core-v-1-1',
  },
dlmmLiquidityRouterV11: {
  "functions": {
    foldAddLiquidityMulti: {"name":"fold-add-liquidity-multi","access":"private","args":[{"name":"position","type":{"tuple":[{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-amount","type":"uint128"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-amount","type":"uint128"},{"name":"y-token-trait","type":"trait_reference"}]}},{"name":"result","type":{"response":{"ok":"uint128","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[position: TypedAbiArg<{
  "binId": number | bigint;
  "poolTrait": string;
  "xAmount": number | bigint;
  "xTokenTrait": string;
  "yAmount": number | bigint;
  "yTokenTrait": string;
}, "position">, result: TypedAbiArg<Response<number | bigint, number | bigint>, "result">], Response<bigint, bigint>>,
    foldWithdrawLiquidityMulti: {"name":"fold-withdraw-liquidity-multi","access":"private","args":[{"name":"position","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}]}},{"name":"result","type":{"response":{"ok":{"tuple":[{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"}]},"error":"uint128"}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[position: TypedAbiArg<{
  "amount": number | bigint;
  "binId": number | bigint;
  "poolTrait": string;
  "xTokenTrait": string;
  "yTokenTrait": string;
}, "position">, result: TypedAbiArg<Response<{
  "xAmount": number | bigint;
  "yAmount": number | bigint;
}, number | bigint>, "result">], Response<{
  "xAmount": bigint;
  "yAmount": bigint;
}, bigint>>,
    addLiquidityMulti: {"name":"add-liquidity-multi","access":"public","args":[{"name":"positions","type":{"list":{"type":{"tuple":[{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-amount","type":"uint128"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-amount","type":"uint128"},{"name":"y-token-trait","type":"trait_reference"}]},"length":350}}},{"name":"min-dlp","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[positions: TypedAbiArg<{
  "binId": number | bigint;
  "poolTrait": string;
  "xAmount": number | bigint;
  "xTokenTrait": string;
  "yAmount": number | bigint;
  "yTokenTrait": string;
}[], "positions">, minDlp: TypedAbiArg<number | bigint, "minDlp">], Response<bigint, bigint>>,
    withdrawLiquidityMulti: {"name":"withdraw-liquidity-multi","access":"public","args":[{"name":"positions","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}]},"length":350}}},{"name":"min-x-amount","type":"uint128"},{"name":"min-y-amount","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"x-amount","type":"uint128"},{"name":"y-amount","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[positions: TypedAbiArg<{
  "amount": number | bigint;
  "binId": number | bigint;
  "poolTrait": string;
  "xTokenTrait": string;
  "yTokenTrait": string;
}[], "positions">, minXAmount: TypedAbiArg<number | bigint, "minXAmount">, minYAmount: TypedAbiArg<number | bigint, "minYAmount">], Response<{
  "xAmount": bigint;
  "yAmount": bigint;
}, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_EMPTY_POSITIONS_LIST: {
  name: 'ERR_EMPTY_POSITIONS_LIST',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_LP_AMOUNT: {
  name: 'ERR_MINIMUM_LP_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_X_AMOUNT: {
  name: 'ERR_MINIMUM_X_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_Y_AMOUNT: {
  name: 'ERR_MINIMUM_Y_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_RESULT_DATA: {
  name: 'ERR_NO_RESULT_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_EMPTY_POSITIONS_LIST: {
    isOk: false,
    value: 2_005n
  },
  ERR_MINIMUM_LP_AMOUNT: {
    isOk: false,
    value: 2_004n
  },
  ERR_MINIMUM_X_AMOUNT: {
    isOk: false,
    value: 2_002n
  },
  ERR_MINIMUM_Y_AMOUNT: {
    isOk: false,
    value: 2_003n
  },
  ERR_NO_RESULT_DATA: {
    isOk: false,
    value: 2_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'dlmm-liquidity-router-v-1-1',
  },
dlmmPoolSbtcUsdcV11: {
  "functions": {
    foldTransferMany: {"name":"fold-transfer-many","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]}},{"name":"previous-response","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}, "item">, previousResponse: TypedAbiArg<Response<boolean, number | bigint>, "previousResponse">], Response<boolean, bigint>>,
    foldTransferManyMemo: {"name":"fold-transfer-many-memo","access":"private","args":[{"name":"item","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"buffer":{"length":34}}},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]}},{"name":"previous-response","type":{"response":{"ok":"bool","error":"uint128"}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[item: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}, "item">, previousResponse: TypedAbiArg<Response<boolean, number | bigint>, "previousResponse">], Response<boolean, bigint>>,
    getBalanceOrDefault: {"name":"get-balance-or-default","access":"private","args":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, user: TypedAbiArg<string, "user">], bigint>,
    tagPoolTokenId: {"name":"tag-pool-token-id","access":"private","args":[{"name":"id","type":{"tuple":[{"name":"owner","type":"principal"},{"name":"token-id","type":"uint128"}]}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<{
  "owner": string;
  "tokenId": number | bigint;
}, "id">], Response<boolean, bigint>>,
    updateUserBalance: {"name":"update-user-balance","access":"private","args":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"},{"name":"balance","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, user: TypedAbiArg<string, "user">, balance: TypedAbiArg<number | bigint, "balance">], Response<boolean, bigint>>,
    createPool: {"name":"create-pool","access":"public","args":[{"name":"x-token-contract","type":"principal"},{"name":"y-token-contract","type":"principal"},{"name":"variable-fees-mgr","type":"principal"},{"name":"fee-addr","type":"principal"},{"name":"core-caller","type":"principal"},{"name":"active-bin","type":"int128"},{"name":"step","type":"uint128"},{"name":"price","type":"uint128"},{"name":"id","type":"uint128"},{"name":"name","type":{"string-ascii":{"length":32}}},{"name":"symbol","type":{"string-ascii":{"length":32}}},{"name":"uri","type":{"string-ascii":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[xTokenContract: TypedAbiArg<string, "xTokenContract">, yTokenContract: TypedAbiArg<string, "yTokenContract">, variableFeesMgr: TypedAbiArg<string, "variableFeesMgr">, feeAddr: TypedAbiArg<string, "feeAddr">, coreCaller: TypedAbiArg<string, "coreCaller">, activeBin: TypedAbiArg<number | bigint, "activeBin">, step: TypedAbiArg<number | bigint, "step">, price: TypedAbiArg<number | bigint, "price">, id: TypedAbiArg<number | bigint, "id">, name: TypedAbiArg<string, "name">, symbol: TypedAbiArg<string, "symbol">, uri: TypedAbiArg<string, "uri">], Response<boolean, bigint>>,
    poolBurn: {"name":"pool-burn","access":"public","args":[{"name":"id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, amount: TypedAbiArg<number | bigint, "amount">, user: TypedAbiArg<string, "user">], Response<boolean, bigint>>,
    poolMint: {"name":"pool-mint","access":"public","args":[{"name":"id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, amount: TypedAbiArg<number | bigint, "amount">, user: TypedAbiArg<string, "user">], Response<boolean, bigint>>,
    poolTransfer: {"name":"pool-transfer","access":"public","args":[{"name":"token-trait","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenTrait: TypedAbiArg<string, "tokenTrait">, amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    setActiveBinId: {"name":"set-active-bin-id","access":"public","args":[{"name":"id","type":"int128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, bigint>>,
    setDynamicConfig: {"name":"set-dynamic-config","access":"public","args":[{"name":"config","type":{"buffer":{"length":4096}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[config: TypedAbiArg<Uint8Array, "config">], Response<boolean, bigint>>,
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, bigint>>,
    setFreezeVariableFeesManager: {"name":"set-freeze-variable-fees-manager","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[], Response<boolean, bigint>>,
    setPoolUri: {"name":"set-pool-uri","access":"public","args":[{"name":"uri","type":{"string-ascii":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[uri: TypedAbiArg<string, "uri">], Response<boolean, bigint>>,
    setVariableFees: {"name":"set-variable-fees","access":"public","args":[{"name":"x-fee","type":"uint128"},{"name":"y-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[xFee: TypedAbiArg<number | bigint, "xFee">, yFee: TypedAbiArg<number | bigint, "yFee">], Response<boolean, bigint>>,
    setVariableFeesCooldown: {"name":"set-variable-fees-cooldown","access":"public","args":[{"name":"cooldown","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[cooldown: TypedAbiArg<number | bigint, "cooldown">], Response<boolean, bigint>>,
    setVariableFeesManager: {"name":"set-variable-fees-manager","access":"public","args":[{"name":"manager","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[manager: TypedAbiArg<string, "manager">], Response<boolean, bigint>>,
    setXFees: {"name":"set-x-fees","access":"public","args":[{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, bigint>>,
    setYFees: {"name":"set-y-fees","access":"public","args":[{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    transferMany: {"name":"transfer-many","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, bigint>>,
    transferManyMemo: {"name":"transfer-many-memo","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"buffer":{"length":34}}},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, bigint>>,
    transferMemo: {"name":"transfer-memo","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, bigint>>,
    updateBinBalances: {"name":"update-bin-balances","access":"public","args":[{"name":"bin-id","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">, xBalance: TypedAbiArg<number | bigint, "xBalance">, yBalance: TypedAbiArg<number | bigint, "yBalance">], Response<boolean, bigint>>,
    updateBinBalancesOnWithdraw: {"name":"update-bin-balances-on-withdraw","access":"public","args":[{"name":"bin-id","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"},{"name":"bin-shares","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">, xBalance: TypedAbiArg<number | bigint, "xBalance">, yBalance: TypedAbiArg<number | bigint, "yBalance">, binShares: TypedAbiArg<number | bigint, "binShares">], Response<boolean, bigint>>,
    getActiveBinId: {"name":"get-active-bin-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"int128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"token-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getBinBalances: {"name":"get-bin-balances","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"bin-shares","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}]},"error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "binShares": bigint;
  "xBalance": bigint;
  "yBalance": bigint;
}, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getOverallBalance: {"name":"get-overall-balance","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getOverallSupply: {"name":"get-overall-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getPool: {"name":"get-pool","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-change-count","type":"uint128"},{"name":"bin-step","type":"uint128"},{"name":"core-address","type":"principal"},{"name":"creation-height","type":"uint128"},{"name":"dynamic-config","type":{"buffer":{"length":4096}}},{"name":"fee-address","type":"principal"},{"name":"freeze-variable-fees-manager","type":"bool"},{"name":"initial-price","type":"uint128"},{"name":"last-variable-fees-update","type":"uint128"},{"name":"pool-created","type":"bool"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"pool-symbol","type":{"string-ascii":{"length":32}}},{"name":"pool-token","type":"principal"},{"name":"pool-uri","type":{"string-ascii":{"length":256}}},{"name":"variable-fees-cooldown","type":"uint128"},{"name":"variable-fees-manager","type":"principal"},{"name":"x-protocol-fee","type":"uint128"},{"name":"x-provider-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"x-variable-fee","type":"uint128"},{"name":"y-protocol-fee","type":"uint128"},{"name":"y-provider-fee","type":"uint128"},{"name":"y-token","type":"principal"},{"name":"y-variable-fee","type":"uint128"}]},"error":"none"}}}} as TypedAbiFunction<[], Response<{
  "activeBinId": bigint;
  "binChangeCount": bigint;
  "binStep": bigint;
  "coreAddress": string;
  "creationHeight": bigint;
  "dynamicConfig": Uint8Array;
  "feeAddress": string;
  "freezeVariableFeesManager": boolean;
  "initialPrice": bigint;
  "lastVariableFeesUpdate": bigint;
  "poolCreated": boolean;
  "poolId": bigint;
  "poolName": string;
  "poolSymbol": string;
  "poolToken": string;
  "poolUri": string;
  "variableFeesCooldown": bigint;
  "variableFeesManager": string;
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xToken": string;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yToken": string;
  "yVariableFee": bigint;
}, null>>,
    getPoolForAdd: {"name":"get-pool-for-add","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-step","type":"uint128"},{"name":"initial-price","type":"uint128"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"x-protocol-fee","type":"uint128"},{"name":"x-provider-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"x-variable-fee","type":"uint128"},{"name":"y-protocol-fee","type":"uint128"},{"name":"y-provider-fee","type":"uint128"},{"name":"y-token","type":"principal"},{"name":"y-variable-fee","type":"uint128"}]},"error":"none"}}}} as TypedAbiFunction<[], Response<{
  "activeBinId": bigint;
  "binStep": bigint;
  "initialPrice": bigint;
  "poolId": bigint;
  "poolName": string;
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xToken": string;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yToken": string;
  "yVariableFee": bigint;
}, null>>,
    getPoolForSwap: {"name":"get-pool-for-swap","access":"read_only","args":[{"name":"is-x-for-y","type":"bool"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-step","type":"uint128"},{"name":"fee-address","type":"principal"},{"name":"initial-price","type":"uint128"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"},{"name":"variable-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}]},"error":"none"}}}} as TypedAbiFunction<[isXForY: TypedAbiArg<boolean, "isXForY">], Response<{
  "activeBinId": bigint;
  "binStep": bigint;
  "feeAddress": string;
  "initialPrice": bigint;
  "poolId": bigint;
  "poolName": string;
  "protocolFee": bigint;
  "providerFee": bigint;
  "variableFee": bigint;
  "xToken": string;
  "yToken": string;
}, null>>,
    getPoolForWithdraw: {"name":"get-pool-for-withdraw","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}]},"error":"none"}}}} as TypedAbiFunction<[], Response<{
  "poolId": bigint;
  "poolName": string;
  "xToken": string;
  "yToken": string;
}, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<bigint, null>>,
    getUserBins: {"name":"get-user-bins","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":{"list":{"type":"uint128","length":1001}},"error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint[], null>>
  },
  "maps": {
    balancesAtBin: {"name":"balances-at-bin","key":"uint128","value":{"tuple":[{"name":"bin-shares","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}]}} as TypedAbiMap<number | bigint, {
  "binShares": bigint;
  "xBalance": bigint;
  "yBalance": bigint;
}>,
    userBalanceAtBin: {"name":"user-balance-at-bin","key":{"tuple":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "id": number | bigint;
  "user": string;
}, bigint>,
    userBins: {"name":"user-bins","key":"principal","value":{"list":{"type":"uint128","length":1001}}} as TypedAbiMap<string, bigint[]>
  },
  "variables": {
    CONTRACT_DEPLOYER: {
  name: 'CONTRACT_DEPLOYER',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    CORE_ADDRESS: {
  name: 'CORE_ADDRESS',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_INVALID_AMOUNT_SIP_013: {
  name: 'ERR_INVALID_AMOUNT_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_PRINCIPAL: {
  name: 'ERR_INVALID_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_INVALID_PRINCIPAL_SIP_013: {
  name: 'ERR_INVALID_PRINCIPAL_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MAX_NUMBER_OF_BINS: {
  name: 'ERR_MAX_NUMBER_OF_BINS',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_NOT_AUTHORIZED_SIP_013: {
  name: 'ERR_NOT_AUTHORIZED_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_POOL_CONTRACT_DEPLOYER: {
  name: 'ERR_NOT_POOL_CONTRACT_DEPLOYER',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    activeBinId: {
  name: 'active-bin-id',
  type: 'int128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    binChangeCount: {
  name: 'bin-change-count',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    binStep: {
  name: 'bin-step',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    dynamicConfig: {
  name: 'dynamic-config',
  type: {
    buffer: {
      length: 4_096
    }
  },
  access: 'variable'
} as TypedAbiVariable<Uint8Array>,
    freezeVariableFeesManager: {
  name: 'freeze-variable-fees-manager',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    initialPrice: {
  name: 'initial-price',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastVariableFeesUpdate: {
  name: 'last-variable-fees-update',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    poolAddresses: {
  name: 'pool-addresses',
  type: {
    tuple: [
      {
        name: 'fee-address',
        type: 'principal'
      },
      {
        name: 'variable-fees-manager',
        type: 'principal'
      },
      {
        name: 'x-token',
        type: 'principal'
      },
      {
        name: 'y-token',
        type: 'principal'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "feeAddress": string;
  "variableFeesManager": string;
  "xToken": string;
  "yToken": string;
}>,
    poolFees: {
  name: 'pool-fees',
  type: {
    tuple: [
      {
        name: 'x-protocol-fee',
        type: 'uint128'
      },
      {
        name: 'x-provider-fee',
        type: 'uint128'
      },
      {
        name: 'x-variable-fee',
        type: 'uint128'
      },
      {
        name: 'y-protocol-fee',
        type: 'uint128'
      },
      {
        name: 'y-provider-fee',
        type: 'uint128'
      },
      {
        name: 'y-variable-fee',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yVariableFee": bigint;
}>,
    poolInfo: {
  name: 'pool-info',
  type: {
    tuple: [
      {
        name: 'creation-height',
        type: 'uint128'
      },
      {
        name: 'pool-created',
        type: 'bool'
      },
      {
        name: 'pool-id',
        type: 'uint128'
      },
      {
        name: 'pool-name',
        type: {
          'string-ascii': {
            length: 32
          }
        }
      },
      {
        name: 'pool-symbol',
        type: {
          'string-ascii': {
            length: 32
          }
        }
      },
      {
        name: 'pool-uri',
        type: {
          'string-ascii': {
            length: 256
          }
        }
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "creationHeight": bigint;
  "poolCreated": boolean;
  "poolId": bigint;
  "poolName": string;
  "poolSymbol": string;
  "poolUri": string;
}>,
    variableFeesCooldown: {
  name: 'variable-fees-cooldown',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  CONTRACT_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  CORE_ADDRESS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1',
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 3_002n
  },
  eRR_INVALID_AMOUNT_SIP_013: {
    isOk: false,
    value: 1n
  },
  ERR_INVALID_PRINCIPAL: {
    isOk: false,
    value: 3_003n
  },
  eRR_INVALID_PRINCIPAL_SIP_013: {
    isOk: false,
    value: 5n
  },
  ERR_MAX_NUMBER_OF_BINS: {
    isOk: false,
    value: 3_005n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 3_001n
  },
  eRR_NOT_AUTHORIZED_SIP_013: {
    isOk: false,
    value: 4n
  },
  ERR_NOT_POOL_CONTRACT_DEPLOYER: {
    isOk: false,
    value: 3_004n
  },
  activeBinId: 0n,
  binChangeCount: 0n,
  binStep: 0n,
  dynamicConfig: Uint8Array.from([]),
  freezeVariableFeesManager: false,
  initialPrice: 0n,
  lastVariableFeesUpdate: 0n,
  poolAddresses: {
    feeAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    variableFeesManager: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    xToken: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    yToken: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  },
  poolFees: {
    xProtocolFee: 0n,
    xProviderFee: 0n,
    xVariableFee: 0n,
    yProtocolFee: 0n,
    yProviderFee: 0n,
    yVariableFee: 0n
  },
  poolInfo: {
    creationHeight: 0n,
    poolCreated: false,
    poolId: 0n,
    poolName: '',
    poolSymbol: '',
    poolUri: ''
  },
  variableFeesCooldown: 0n
},
  "non_fungible_tokens": [
    {"name":"pool-token-id","type":{"tuple":[{"name":"owner","type":"principal"},{"name":"token-id","type":"uint128"}]}}
  ],
  "fungible_tokens":[{"name":"pool-token"}],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'dlmm-pool-sbtc-usdc-v-1-1',
  },
dlmmPoolTraitV11: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'dlmm-pool-trait-v-1-1',
  },
dlmmSwapRouterV11: {
  "functions": {
    absInt: {"name":"abs-int","access":"private","args":[{"name":"value","type":"int128"}],"outputs":{"type":"uint128"}} as TypedAbiFunction<[value: TypedAbiArg<number | bigint, "value">], bigint>,
    foldSwapMulti: {"name":"fold-swap-multi","access":"private","args":[{"name":"swap","type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-for-y","type":"bool"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}]}},{"name":"result","type":{"response":{"ok":{"tuple":[{"name":"received","type":"uint128"},{"name":"unfavorable","type":"uint128"}]},"error":"uint128"}}}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"received","type":"uint128"},{"name":"unfavorable","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[swap: TypedAbiArg<{
  "amount": number | bigint;
  "binId": number | bigint;
  "poolTrait": string;
  "xForY": boolean;
  "xTokenTrait": string;
  "yTokenTrait": string;
}, "swap">, result: TypedAbiArg<Response<{
  "received": number | bigint;
  "unfavorable": number | bigint;
}, number | bigint>, "result">], Response<{
  "received": bigint;
  "unfavorable": bigint;
}, bigint>>,
    swapMulti: {"name":"swap-multi","access":"public","args":[{"name":"swaps","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"bin-id","type":"int128"},{"name":"pool-trait","type":"trait_reference"},{"name":"x-for-y","type":"bool"},{"name":"x-token-trait","type":"trait_reference"},{"name":"y-token-trait","type":"trait_reference"}]},"length":350}}},{"name":"min-received","type":"uint128"},{"name":"max-unfavorable-bins","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"uint128"}}}} as TypedAbiFunction<[swaps: TypedAbiArg<{
  "amount": number | bigint;
  "binId": number | bigint;
  "poolTrait": string;
  "xForY": boolean;
  "xTokenTrait": string;
  "yTokenTrait": string;
}[], "swaps">, minReceived: TypedAbiArg<number | bigint, "minReceived">, maxUnfavorableBins: TypedAbiArg<number | bigint, "maxUnfavorableBins">], Response<bigint, bigint>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_BIN_SLIPPAGE: {
  name: 'ERR_BIN_SLIPPAGE',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_EMPTY_SWAPS_LIST: {
  name: 'ERR_EMPTY_SWAPS_LIST',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_MINIMUM_RECEIVED: {
  name: 'ERR_MINIMUM_RECEIVED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_ACTIVE_BIN_DATA: {
  name: 'ERR_NO_ACTIVE_BIN_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NO_RESULT_DATA: {
  name: 'ERR_NO_RESULT_DATA',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  ERR_BIN_SLIPPAGE: {
    isOk: false,
    value: 2_002n
  },
  ERR_EMPTY_SWAPS_LIST: {
    isOk: false,
    value: 2_005n
  },
  ERR_MINIMUM_RECEIVED: {
    isOk: false,
    value: 2_003n
  },
  ERR_NO_ACTIVE_BIN_DATA: {
    isOk: false,
    value: 2_004n
  },
  ERR_NO_RESULT_DATA: {
    isOk: false,
    value: 2_001n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'dlmm-swap-router-v-1-1',
  },
mockPool: {
  "functions": {
    createPool: {"name":"create-pool","access":"public","args":[{"name":"x-token-contract","type":"principal"},{"name":"y-token-contract","type":"principal"},{"name":"variable-fees-mgr","type":"principal"},{"name":"fee-addr","type":"principal"},{"name":"core-caller","type":"principal"},{"name":"active-bin","type":"int128"},{"name":"step","type":"uint128"},{"name":"price","type":"uint128"},{"name":"id","type":"uint128"},{"name":"name","type":{"string-ascii":{"length":32}}},{"name":"symbol","type":{"string-ascii":{"length":32}}},{"name":"uri","type":{"string-ascii":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[xTokenContract: TypedAbiArg<string, "xTokenContract">, yTokenContract: TypedAbiArg<string, "yTokenContract">, variableFeesMgr: TypedAbiArg<string, "variableFeesMgr">, feeAddr: TypedAbiArg<string, "feeAddr">, coreCaller: TypedAbiArg<string, "coreCaller">, activeBin: TypedAbiArg<number | bigint, "activeBin">, step: TypedAbiArg<number | bigint, "step">, price: TypedAbiArg<number | bigint, "price">, id: TypedAbiArg<number | bigint, "id">, name: TypedAbiArg<string, "name">, symbol: TypedAbiArg<string, "symbol">, uri: TypedAbiArg<string, "uri">], Response<boolean, bigint>>,
    poolBurn: {"name":"pool-burn","access":"public","args":[{"name":"id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, amount: TypedAbiArg<number | bigint, "amount">, user: TypedAbiArg<string, "user">], Response<boolean, bigint>>,
    poolMint: {"name":"pool-mint","access":"public","args":[{"name":"id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">, amount: TypedAbiArg<number | bigint, "amount">, user: TypedAbiArg<string, "user">], Response<boolean, bigint>>,
    poolTransfer: {"name":"pool-transfer","access":"public","args":[{"name":"token-trait","type":"trait_reference"},{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[tokenTrait: TypedAbiArg<string, "tokenTrait">, amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    setActiveBinId: {"name":"set-active-bin-id","access":"public","args":[{"name":"id","type":"int128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, bigint>>,
    setActiveBinIdPublic: {"name":"set-active-bin-id-public","access":"public","args":[{"name":"id","type":"int128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<boolean, null>>,
    setDynamicConfig: {"name":"set-dynamic-config","access":"public","args":[{"name":"config","type":{"buffer":{"length":4096}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[config: TypedAbiArg<Uint8Array, "config">], Response<boolean, null>>,
    setFeeAddress: {"name":"set-fee-address","access":"public","args":[{"name":"address","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[address: TypedAbiArg<string, "address">], Response<boolean, null>>,
    setFreezeVariableFeesManager: {"name":"set-freeze-variable-fees-manager","access":"public","args":[],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[], Response<boolean, null>>,
    setPoolCreated: {"name":"set-pool-created","access":"public","args":[{"name":"created","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[created: TypedAbiArg<boolean, "created">], Response<boolean, null>>,
    setPoolUri: {"name":"set-pool-uri","access":"public","args":[{"name":"uri","type":{"string-ascii":{"length":256}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[uri: TypedAbiArg<string, "uri">], Response<boolean, null>>,
    setRevert: {"name":"set-revert","access":"public","args":[{"name":"flag","type":"bool"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[flag: TypedAbiArg<boolean, "flag">], Response<boolean, null>>,
    setVariableFees: {"name":"set-variable-fees","access":"public","args":[{"name":"x-fee","type":"uint128"},{"name":"y-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[xFee: TypedAbiArg<number | bigint, "xFee">, yFee: TypedAbiArg<number | bigint, "yFee">], Response<boolean, null>>,
    setVariableFeesCooldown: {"name":"set-variable-fees-cooldown","access":"public","args":[{"name":"cooldown","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[cooldown: TypedAbiArg<number | bigint, "cooldown">], Response<boolean, null>>,
    setVariableFeesManager: {"name":"set-variable-fees-manager","access":"public","args":[{"name":"manager","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[manager: TypedAbiArg<string, "manager">], Response<boolean, null>>,
    setXFees: {"name":"set-x-fees","access":"public","args":[{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, null>>,
    setYFees: {"name":"set-y-fees","access":"public","args":[{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[protocolFee: TypedAbiArg<number | bigint, "protocolFee">, providerFee: TypedAbiArg<number | bigint, "providerFee">], Response<boolean, null>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, null>>,
    transferMany: {"name":"transfer-many","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, null>>,
    transferManyMemo: {"name":"transfer-many-memo","access":"public","args":[{"name":"transfers","type":{"list":{"type":{"tuple":[{"name":"amount","type":"uint128"},{"name":"memo","type":{"buffer":{"length":34}}},{"name":"recipient","type":"principal"},{"name":"sender","type":"principal"},{"name":"token-id","type":"uint128"}]},"length":200}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[transfers: TypedAbiArg<{
  "amount": number | bigint;
  "memo": Uint8Array;
  "recipient": string;
  "sender": string;
  "tokenId": number | bigint;
}[], "transfers">], Response<boolean, null>>,
    transferMemo: {"name":"transfer-memo","access":"public","args":[{"name":"token-id","type":"uint128"},{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"buffer":{"length":34}}}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array, "memo">], Response<boolean, null>>,
    updateBinBalances: {"name":"update-bin-balances","access":"public","args":[{"name":"bin-id","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">, xBalance: TypedAbiArg<number | bigint, "xBalance">, yBalance: TypedAbiArg<number | bigint, "yBalance">], Response<boolean, bigint>>,
    updateBinBalancesOnWithdraw: {"name":"update-bin-balances-on-withdraw","access":"public","args":[{"name":"bin-id","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"},{"name":"bin-shares","type":"uint128"}],"outputs":{"type":{"response":{"ok":"bool","error":"none"}}}} as TypedAbiFunction<[binId: TypedAbiArg<number | bigint, "binId">, xBalance: TypedAbiArg<number | bigint, "xBalance">, yBalance: TypedAbiArg<number | bigint, "yBalance">, binShares: TypedAbiArg<number | bigint, "binShares">], Response<boolean, null>>,
    getActiveBinId: {"name":"get-active-bin-id","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"int128","error":"uint128"}}}} as TypedAbiFunction<[], Response<bigint, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"token-id","type":"uint128"},{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">, user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getBinBalances: {"name":"get-bin-balances","access":"read_only","args":[{"name":"id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"bin-shares","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}]},"error":"none"}}}} as TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], Response<{
  "binShares": bigint;
  "xBalance": bigint;
  "yBalance": bigint;
}, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":9}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getOverallBalance: {"name":"get-overall-balance","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getOverallSupply: {"name":"get-overall-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getPool: {"name":"get-pool","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-change-count","type":"uint128"},{"name":"bin-step","type":"uint128"},{"name":"core-address","type":"principal"},{"name":"creation-height","type":"uint128"},{"name":"dynamic-config","type":{"buffer":{"length":4096}}},{"name":"fee-address","type":"principal"},{"name":"freeze-variable-fees-manager","type":"bool"},{"name":"initial-price","type":"uint128"},{"name":"last-variable-fees-update","type":"uint128"},{"name":"pool-created","type":"bool"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"pool-symbol","type":{"string-ascii":{"length":32}}},{"name":"pool-token","type":"principal"},{"name":"pool-uri","type":{"string-ascii":{"length":256}}},{"name":"variable-fees-cooldown","type":"uint128"},{"name":"variable-fees-manager","type":"principal"},{"name":"x-protocol-fee","type":"uint128"},{"name":"x-provider-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"x-variable-fee","type":"uint128"},{"name":"y-protocol-fee","type":"uint128"},{"name":"y-provider-fee","type":"uint128"},{"name":"y-token","type":"principal"},{"name":"y-variable-fee","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[], Response<{
  "activeBinId": bigint;
  "binChangeCount": bigint;
  "binStep": bigint;
  "coreAddress": string;
  "creationHeight": bigint;
  "dynamicConfig": Uint8Array;
  "feeAddress": string;
  "freezeVariableFeesManager": boolean;
  "initialPrice": bigint;
  "lastVariableFeesUpdate": bigint;
  "poolCreated": boolean;
  "poolId": bigint;
  "poolName": string;
  "poolSymbol": string;
  "poolToken": string;
  "poolUri": string;
  "variableFeesCooldown": bigint;
  "variableFeesManager": string;
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xToken": string;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yToken": string;
  "yVariableFee": bigint;
}, bigint>>,
    getPoolForAdd: {"name":"get-pool-for-add","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-step","type":"uint128"},{"name":"initial-price","type":"uint128"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"x-protocol-fee","type":"uint128"},{"name":"x-provider-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"x-variable-fee","type":"uint128"},{"name":"y-protocol-fee","type":"uint128"},{"name":"y-provider-fee","type":"uint128"},{"name":"y-token","type":"principal"},{"name":"y-variable-fee","type":"uint128"}]},"error":"uint128"}}}} as TypedAbiFunction<[], Response<{
  "activeBinId": bigint;
  "binStep": bigint;
  "initialPrice": bigint;
  "poolId": bigint;
  "poolName": string;
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xToken": string;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yToken": string;
  "yVariableFee": bigint;
}, bigint>>,
    getPoolForSwap: {"name":"get-pool-for-swap","access":"read_only","args":[{"name":"is-x-for-y","type":"bool"}],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"active-bin-id","type":"int128"},{"name":"bin-step","type":"uint128"},{"name":"fee-address","type":"principal"},{"name":"initial-price","type":"uint128"},{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"protocol-fee","type":"uint128"},{"name":"provider-fee","type":"uint128"},{"name":"variable-fee","type":"uint128"},{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}]},"error":"uint128"}}}} as TypedAbiFunction<[isXForY: TypedAbiArg<boolean, "isXForY">], Response<{
  "activeBinId": bigint;
  "binStep": bigint;
  "feeAddress": string;
  "initialPrice": bigint;
  "poolId": bigint;
  "poolName": string;
  "protocolFee": bigint;
  "providerFee": bigint;
  "variableFee": bigint;
  "xToken": string;
  "yToken": string;
}, bigint>>,
    getPoolForWithdraw: {"name":"get-pool-for-withdraw","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"tuple":[{"name":"pool-id","type":"uint128"},{"name":"pool-name","type":{"string-ascii":{"length":32}}},{"name":"x-token","type":"principal"},{"name":"y-token","type":"principal"}]},"error":"uint128"}}}} as TypedAbiFunction<[], Response<{
  "poolId": bigint;
  "poolName": string;
  "xToken": string;
  "yToken": string;
}, bigint>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":4}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":{"optional":{"string-ascii":{"length":17}}},"error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[{"name":"token-id","type":"uint128"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[tokenId: TypedAbiArg<number | bigint, "tokenId">], Response<bigint, null>>,
    getUserBins: {"name":"get-user-bins","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":{"list":{"type":"uint128","length":1001}},"error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint[], null>>
  },
  "maps": {
    balancesAtBin: {"name":"balances-at-bin","key":"uint128","value":{"tuple":[{"name":"bin-shares","type":"uint128"},{"name":"x-balance","type":"uint128"},{"name":"y-balance","type":"uint128"}]}} as TypedAbiMap<number | bigint, {
  "binShares": bigint;
  "xBalance": bigint;
  "yBalance": bigint;
}>,
    userBalanceAtBin: {"name":"user-balance-at-bin","key":{"tuple":[{"name":"id","type":"uint128"},{"name":"user","type":"principal"}]},"value":"uint128"} as TypedAbiMap<{
  "id": number | bigint;
  "user": string;
}, bigint>,
    userBins: {"name":"user-bins","key":"principal","value":{"list":{"type":"uint128","length":1001}}} as TypedAbiMap<string, bigint[]>
  },
  "variables": {
    CONTRACT_DEPLOYER: {
  name: 'CONTRACT_DEPLOYER',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    CORE_ADDRESS: {
  name: 'CORE_ADDRESS',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_INVALID_AMOUNT_SIP_013: {
  name: 'ERR_INVALID_AMOUNT_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_INVALID_PRINCIPAL_SIP_013: {
  name: 'ERR_INVALID_PRINCIPAL_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    eRR_NOT_AUTHORIZED_SIP_013: {
  name: 'ERR_NOT_AUTHORIZED_SIP_013',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    activeBinId: {
  name: 'active-bin-id',
  type: 'int128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    binChangeCount: {
  name: 'bin-change-count',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    binStep: {
  name: 'bin-step',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    dynamicConfig: {
  name: 'dynamic-config',
  type: {
    buffer: {
      length: 4_096
    }
  },
  access: 'variable'
} as TypedAbiVariable<Uint8Array>,
    freezeVariableFeesManager: {
  name: 'freeze-variable-fees-manager',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    initialPrice: {
  name: 'initial-price',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    lastVariableFeesUpdate: {
  name: 'last-variable-fees-update',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    poolAddresses: {
  name: 'pool-addresses',
  type: {
    tuple: [
      {
        name: 'fee-address',
        type: 'principal'
      },
      {
        name: 'variable-fees-manager',
        type: 'principal'
      },
      {
        name: 'x-token',
        type: 'principal'
      },
      {
        name: 'y-token',
        type: 'principal'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "feeAddress": string;
  "variableFeesManager": string;
  "xToken": string;
  "yToken": string;
}>,
    poolFees: {
  name: 'pool-fees',
  type: {
    tuple: [
      {
        name: 'x-protocol-fee',
        type: 'uint128'
      },
      {
        name: 'x-provider-fee',
        type: 'uint128'
      },
      {
        name: 'x-variable-fee',
        type: 'uint128'
      },
      {
        name: 'y-protocol-fee',
        type: 'uint128'
      },
      {
        name: 'y-provider-fee',
        type: 'uint128'
      },
      {
        name: 'y-variable-fee',
        type: 'uint128'
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "xProtocolFee": bigint;
  "xProviderFee": bigint;
  "xVariableFee": bigint;
  "yProtocolFee": bigint;
  "yProviderFee": bigint;
  "yVariableFee": bigint;
}>,
    poolInfo: {
  name: 'pool-info',
  type: {
    tuple: [
      {
        name: 'creation-height',
        type: 'uint128'
      },
      {
        name: 'pool-created',
        type: 'bool'
      },
      {
        name: 'pool-id',
        type: 'uint128'
      },
      {
        name: 'pool-name',
        type: {
          'string-ascii': {
            length: 32
          }
        }
      },
      {
        name: 'pool-symbol',
        type: {
          'string-ascii': {
            length: 32
          }
        }
      },
      {
        name: 'pool-uri',
        type: {
          'string-ascii': {
            length: 256
          }
        }
      }
    ]
  },
  access: 'variable'
} as TypedAbiVariable<{
  "creationHeight": bigint;
  "poolCreated": boolean;
  "poolId": bigint;
  "poolName": string;
  "poolSymbol": string;
  "poolUri": string;
}>,
    revert: {
  name: 'revert',
  type: 'bool',
  access: 'variable'
} as TypedAbiVariable<boolean>,
    variableFeesCooldown: {
  name: 'variable-fees-cooldown',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>
  },
  constants: {
  CONTRACT_DEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  CORE_ADDRESS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1',
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 3_002n
  },
  eRR_INVALID_AMOUNT_SIP_013: {
    isOk: false,
    value: 1n
  },
  eRR_INVALID_PRINCIPAL_SIP_013: {
    isOk: false,
    value: 5n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 3_001n
  },
  eRR_NOT_AUTHORIZED_SIP_013: {
    isOk: false,
    value: 4n
  },
  activeBinId: 0n,
  binChangeCount: 0n,
  binStep: 0n,
  dynamicConfig: Uint8Array.from([]),
  freezeVariableFeesManager: false,
  initialPrice: 0n,
  lastVariableFeesUpdate: 0n,
  poolAddresses: {
    feeAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    variableFeesManager: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    xToken: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    yToken: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
  },
  poolFees: {
    xProtocolFee: 0n,
    xProviderFee: 0n,
    xVariableFee: 0n,
    yProtocolFee: 0n,
    yProviderFee: 0n,
    yVariableFee: 0n
  },
  poolInfo: {
    creationHeight: 0n,
    poolCreated: false,
    poolId: 0n,
    poolName: '',
    poolSymbol: '',
    poolUri: ''
  },
  revert: false,
  variableFeesCooldown: 0n
},
  "non_fungible_tokens": [
    {"name":"pool-token-id","type":{"tuple":[{"name":"owner","type":"principal"},{"name":"token-id","type":"uint128"}]}}
  ],
  "fungible_tokens":[{"name":"pool-token"}],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'mock-pool',
  },
mockRandomToken: {
  "functions": {
    burn: {"name":"burn","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"owner","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, owner: TypedAbiArg<string, "owner">], Response<boolean, bigint>>,
    mint: {"name":"mint","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"recipient","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, recipient: TypedAbiArg<string, "recipient">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"sender","type":"principal"},{"name":"recipient","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, sender: TypedAbiArg<string, "sender">, recipient: TypedAbiArg<string, "recipient">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"user","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[user: TypedAbiArg<string, "user">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":32}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":{"string-utf8":{"length":256}}},"error":"none"}}}} as TypedAbiFunction<[], Response<string | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    ERR_INVALID_AMOUNT: {
  name: 'ERR_INVALID_AMOUNT',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_INVALID_PRINCIPAL: {
  name: 'ERR_INVALID_PRINCIPAL',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    ERR_NOT_AUTHORIZED: {
  name: 'ERR_NOT_AUTHORIZED',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    tokenDecimals: {
  name: 'token-decimals',
  type: 'uint128',
  access: 'variable'
} as TypedAbiVariable<bigint>,
    tokenName: {
  name: 'token-name',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenSymbol: {
  name: 'token-symbol',
  type: {
    'string-ascii': {
      length: 32
    }
  },
  access: 'variable'
} as TypedAbiVariable<string>,
    tokenUri: {
  name: 'token-uri',
  type: {
    optional: {
      'string-utf8': {
        length: 256
      }
    }
  },
  access: 'variable'
} as TypedAbiVariable<string | null>
  },
  constants: {
  ERR_INVALID_AMOUNT: {
    isOk: false,
    value: 2n
  },
  ERR_INVALID_PRINCIPAL: {
    isOk: false,
    value: 3n
  },
  ERR_NOT_AUTHORIZED: {
    isOk: false,
    value: 1n
  },
  tokenDecimals: 6n,
  tokenName: 'random Token',
  tokenSymbol: 'UNWL',
  tokenUri: 'https://random.token'
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"random-token"}],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'mock-random-token',
  },
mockSbtcToken: {
  "functions": {
    mint: {"name":"mint","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"to","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, to: TypedAbiArg<string, "to">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"from","type":"principal"},{"name":"to","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, from: TypedAbiArg<string, "from">, to: TypedAbiArg<string, "to">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":9}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":4}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":"none"},"error":"none"}}}} as TypedAbiFunction<[], Response<null | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    contractOwner: {
  name: 'contract-owner',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    errInsufficientBalance: {
  name: 'err-insufficient-balance',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNotTokenOwner: {
  name: 'err-not-token-owner',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errOwnerOnly: {
  name: 'err-owner-only',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  errInsufficientBalance: {
    isOk: false,
    value: 102n
  },
  errNotTokenOwner: {
    isOk: false,
    value: 101n
  },
  errOwnerOnly: {
    isOk: false,
    value: 100n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"sbtc"}],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'mock-sbtc-token',
  },
mockUsdcToken: {
  "functions": {
    mint: {"name":"mint","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"to","type":"principal"}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, to: TypedAbiArg<string, "to">], Response<boolean, bigint>>,
    transfer: {"name":"transfer","access":"public","args":[{"name":"amount","type":"uint128"},{"name":"from","type":"principal"},{"name":"to","type":"principal"},{"name":"memo","type":{"optional":{"buffer":{"length":34}}}}],"outputs":{"type":{"response":{"ok":"bool","error":"uint128"}}}} as TypedAbiFunction<[amount: TypedAbiArg<number | bigint, "amount">, from: TypedAbiArg<string, "from">, to: TypedAbiArg<string, "to">, memo: TypedAbiArg<Uint8Array | null, "memo">], Response<boolean, bigint>>,
    getBalance: {"name":"get-balance","access":"read_only","args":[{"name":"who","type":"principal"}],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[who: TypedAbiArg<string, "who">], Response<bigint, null>>,
    getDecimals: {"name":"get-decimals","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>,
    getName: {"name":"get-name","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":9}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getSymbol: {"name":"get-symbol","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"string-ascii":{"length":4}},"error":"none"}}}} as TypedAbiFunction<[], Response<string, null>>,
    getTokenUri: {"name":"get-token-uri","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":{"optional":"none"},"error":"none"}}}} as TypedAbiFunction<[], Response<null | null, null>>,
    getTotalSupply: {"name":"get-total-supply","access":"read_only","args":[],"outputs":{"type":{"response":{"ok":"uint128","error":"none"}}}} as TypedAbiFunction<[], Response<bigint, null>>
  },
  "maps": {
    
  },
  "variables": {
    contractOwner: {
  name: 'contract-owner',
  type: 'principal',
  access: 'constant'
} as TypedAbiVariable<string>,
    errInsufficientBalance: {
  name: 'err-insufficient-balance',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errNotTokenOwner: {
  name: 'err-not-token-owner',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>,
    errOwnerOnly: {
  name: 'err-owner-only',
  type: {
    response: {
      ok: 'none',
      error: 'uint128'
    }
  },
  access: 'constant'
} as TypedAbiVariable<Response<null, bigint>>
  },
  constants: {
  contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  errInsufficientBalance: {
    isOk: false,
    value: 102n
  },
  errNotTokenOwner: {
    isOk: false,
    value: 101n
  },
  errOwnerOnly: {
    isOk: false,
    value: 100n
  }
},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[{"name":"usdc"}],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'mock-usdc-token',
  },
sip010TraitFtStandardV11: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'sip-010-trait-ft-standard-v-1-1',
  },
sip013TraitSftStandardV11: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'sip-013-trait-sft-standard-v-1-1',
  },
sip013TransferManyTraitV11: {
  "functions": {
    
  },
  "maps": {
    
  },
  "variables": {
    
  },
  constants: {},
  "non_fungible_tokens": [
    
  ],
  "fungible_tokens":[],"epoch":"Epoch30","clarity_version":"Clarity3",
  contractName: 'sip-013-transfer-many-trait-v-1-1',
  }
} as const;

export const accounts = {"deployer":{"address":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","balance":"100000000000000"},"faucet":{"address":"STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6","balance":"100000000000000"},"wallet_1":{"address":"ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5","balance":"100000000000000"},"wallet_2":{"address":"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG","balance":"100000000000000"},"wallet_3":{"address":"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC","balance":"100000000000000"},"wallet_4":{"address":"ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND","balance":"100000000000000"},"wallet_5":{"address":"ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB","balance":"100000000000000"},"wallet_6":{"address":"ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0","balance":"100000000000000"},"wallet_7":{"address":"ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ","balance":"100000000000000"},"wallet_8":{"address":"ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP","balance":"100000000000000"}} as const;

export const identifiers = {"dlmmCoreV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1","dlmmLiquidityRouterV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-liquidity-router-v-1-1","dlmmPoolSbtcUsdcV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-sbtc-usdc-v-1-1","dlmmPoolTraitV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-trait-v-1-1","dlmmSwapRouterV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-swap-router-v-1-1","mockPool":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-pool","mockRandomToken":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-random-token","mockSbtcToken":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-sbtc-token","mockUsdcToken":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-usdc-token","sip010TraitFtStandardV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard-v-1-1","sip013TraitSftStandardV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-trait-sft-standard-v-1-1","sip013TransferManyTraitV11":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-transfer-many-trait-v-1-1"} as const

export const simnet = {
  accounts,
  contracts,
  identifiers,
} as const;


export const deployments = {"dlmmCoreV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1","testnet":null,"mainnet":null},"dlmmLiquidityRouterV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-liquidity-router-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-liquidity-router-v-1-1","testnet":null,"mainnet":null},"dlmmPoolSbtcUsdcV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-sbtc-usdc-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-sbtc-usdc-v-1-1","testnet":null,"mainnet":null},"dlmmPoolTraitV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-trait-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-trait-v-1-1","testnet":null,"mainnet":null},"dlmmSwapRouterV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-swap-router-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-swap-router-v-1-1","testnet":null,"mainnet":null},"mockPool":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-pool","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-pool","testnet":null,"mainnet":null},"mockRandomToken":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-random-token","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-random-token","testnet":null,"mainnet":null},"mockSbtcToken":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-sbtc-token","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-sbtc-token","testnet":null,"mainnet":null},"mockUsdcToken":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-usdc-token","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-usdc-token","testnet":null,"mainnet":null},"sip010TraitFtStandardV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard-v-1-1","testnet":null,"mainnet":null},"sip013TraitSftStandardV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-trait-sft-standard-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-trait-sft-standard-v-1-1","testnet":null,"mainnet":null},"sip013TransferManyTraitV11":{"devnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-transfer-many-trait-v-1-1","simnet":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-013-transfer-many-trait-v-1-1","testnet":null,"mainnet":null}} as const;

export const project = {
  contracts,
  deployments,
} as const;
  