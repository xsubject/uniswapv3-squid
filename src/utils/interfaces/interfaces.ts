import { Logger as Logger1 } from "@subsquid/logger";
import { Logger as Logger2 } from "@subsquid/evm-processor/node_modules/@subsquid/logger/lib/logger";

import { Chain } from "@subsquid/evm-processor/src/interfaces/chain";
import { LogRequest } from "@subsquid/evm-processor/src/interfaces/data-request";
import {
    EvmBlockHeader,
    EvmLog,
    EvmTransaction,
} from "@subsquid/evm-processor/src/interfaces/evm";

export interface BlockHeader {
    id: string;
    height: number;
    hash: string;
    parentHash: string;
    timestamp: number;
}

export interface BatchBlock<Item> {
    /**
     * Block header
     */
    header: EvmBlockHeader;
    /**
     * A unified log of events and calls.
     *
     * All events deposited within a call are placed
     * before the call. All child calls are placed before the parent call.
     * List of block events is a subsequence of unified log.
     */
    items: Item[];
}
type Item =
    | LogItem<{
          evmLog: {
              topics: true;
              data: true;
          };
      }>
    | TransactionItem;

export type LogHandlerContext<
    S,
    R extends LogDataRequest = { evmLog: {} }
> = BlockHandlerContext<S> & LogData<R>;

export type Logger = Logger1 | Logger2;

export interface BlockHandlerContext<S> {
    /**
     * Not yet public description of chain metadata
     * @internal
     */
    _chain: Chain;

    /**
     * A built-in logger to be used in mapping handlers. Supports trace, debug, warn, error, fatal
     * levels.
     */
    log: Logger;

    store: S;
    block: BlockHeader;
}
export interface Range {
    /**
     * Start of segment (inclusive)
     */
    from: number;
    /**
     * End of segment (inclusive). Defaults to infinity.
     */
    to?: number;
}

export interface BatchBlock<Item> {
    /**
     * Block header
     */
    header: EvmBlockHeader;
    /**
     * A unified log of events and calls.
     *
     * All events deposited within a call are placed
     * before the call. All child calls are placed before the parent call.
     * List of block events is a subsequence of unified log.
     */
    items: Item[];
}

export interface CommonHandlerContext<S> {
    /**
     * Not yet public description of chain metadata
     * @internal
     */
    _chain: Chain;

    /**
     * A built-in logger to be used in mapping handlers. Supports trace, debug, warn, error, fatal
     * levels.
     */
    log: Logger;

    store: S;
}

type Req<T> = {
    [P in keyof T]?: unknown;
};

type PlainReq<T> = {
    [P in keyof T]?: true;
};

type Select<T, R extends Req<T>, K = false> = {
    [P in keyof T as R[P] extends true ? P : P extends K ? P : never]: T[P];
};

export type WithProp<K extends string, V> = [V] extends [never]
    ? {}
    : {
          [k in K]: V;
      };

export type TransactionRequest = Omit<
    PlainReq<EvmTransaction>,
    keyof TransactionDefaultRequest
>;

type TransactionFields<R extends TransactionRequest> = Select<
    EvmTransaction,
    R,
    keyof TransactionDefaultRequest
>;

export type TransactionType<R> = R extends true
    ? EvmTransaction
    : R extends TransactionRequest
    ? TransactionFields<R>
    : never;

type LogFields<R extends LogRequest> = Select<
    EvmLog,
    R,
    keyof LogDefaultRequest
>;

type LogType<R> = R extends LogRequest ? LogFields<R> : LogFields<{}>;

export interface TransactionDataRequest {
    transaction: TransactionRequest;
}

export type TransactionData<
    R extends TransactionDataRequest = { transaction: {} }
> = WithProp<"transaction", TransactionType<R["transaction"]>>;

export interface LogDataRequest {
    evmLog: LogRequest;
    transaction?: TransactionRequest;
}

export type LogData<R extends LogDataRequest = { evmLog: {} }> = WithProp<
    "evmLog",
    LogType<R["evmLog"]>
> &
    WithProp<"transaction", TransactionType<R["transaction"]>>;

type WithKind<K, T> = { kind: K } & {
    [P in keyof T]: T[P];
};

export type LogItem<R = false> = WithKind<
    "evmLog",
    R extends LogDataRequest ? LogData<R> : LogData<{ evmLog: {} }>
> & {
    address: string;
};

export type TransactionItem<R = false> = WithKind<
    "transaction",
    R extends TransactionDataRequest
        ? TransactionData<R>
        : TransactionData<{ transaction: {} }>
> & { address: string };

export type ItemMerge<A, B, R> = [A] extends [never]
    ? B
    : [B] extends [never]
    ? A
    : [Exclude<R, undefined | boolean>] extends [never]
    ? A
    : undefined extends A
    ?
          | undefined
          | ObjectItemMerge<
                Exclude<A, undefined>,
                Exclude<B, undefined>,
                Exclude<R, undefined | boolean>
            >
    : ObjectItemMerge<A, B, Exclude<R, undefined | boolean>>;

type ObjectItemMerge<A, B, R> = {
    [K in keyof A | keyof B]: K extends keyof A
        ? K extends keyof B
            ? K extends keyof R
                ? ItemMerge<A[K], B[K], R[K]>
                : A[K]
            : A[K]
        : K extends keyof B
        ? B[K]
        : never;
};

type ItemKind = {
    kind: string;
};

type AddItem<T extends ItemKind, I extends ItemKind, R> =
    | (T extends Pick<I, "kind"> ? ItemMerge<T, I, R> : T)
    | Exclude<I, Pick<T, "kind">>;

export type AddLogItem<T extends ItemKind, I extends ItemKind> = AddItem<
    T,
    I,
    LogDataRequest
>;
export type AddTransactionItem<
    T extends ItemKind,
    I extends ItemKind
> = AddItem<T, I, TransactionDataRequest>;

export interface DataSelection<R> {
    data: R;
}

export interface NoDataSelection {
    data?: undefined;
}

export interface MayBeDataSelection<R> {
    data?: R;
}

export const DEFAULT_REQUEST = {
    block: {
        number: true,
        hash: true,
        parentHash: true,
        nonce: true,
        sha3Uncles: true,
        logsBloom: true,
        transactionsRoot: true,
        stateRoot: true,
        receiptsRoot: true,
        miner: true,
        difficulty: true,
        totalDifficulty: true,
        extraData: true,
        size: true,
        gasLimit: true,
        gasUsed: true,
        timestamp: true,
    },
    evmLog: {
        address: true,
        index: true,
        transactionIndex: true,
    },
    transaction: {
        to: true,
        index: true,
    },
} as const;

type LogDefaultRequest = typeof DEFAULT_REQUEST.evmLog & { id: true };
type TransactionDefaultRequest = typeof DEFAULT_REQUEST.transaction & {
    id: true;
};
