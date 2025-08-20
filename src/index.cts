// This module is the CJS entry point for the library.

// The Rust addon.
import * as addon from "./load.cjs";

// Use this declaration to assign types to the addon's exports,
// which otherwise by default are `any`.
declare module "./load.cjs" {
    function hello(name: string): string;
}

export type Greeting = {
    message: string;
};

export function greeting(name: string): Greeting {
    const message = addon.hello(name);
    return { message };
}

declare const _Inner: unique symbol;

export type Inner = {
    readonly [_Inner]: unknown;
};

declare module "./load.cjs" {
    function init(config: NetConfig, state: NetState): Promise<Inner>;
    function put(net: Inner, blob: Buffer): Promise<string>;
}

export class ScatterNet {
    private _init: Promise<Inner>;

    constructor(config: NetConfig, state: NetState) {
        this._init = addon.init(config, state);
    }

    async put_blob(data: Buffer): Promise<string> {
        const net = await this._init;

        return await addon.put(net, data);
    }

    async put_string(data: string): Promise<string> {
        return await this.put_blob(Buffer.from(data));
    }

    async put_json<O>(data: O): Promise<string> {
        return await this.put_string(JSON.stringify(data));
    }
}

export interface NetConfig {
    lake: DataLakeConfig;
    peer_groups: PeerGroupConfig[];
    secret_key: string | null;
}

export interface NetState {
    peers: PeerState[];
}

export interface ConfigStoreEntry {
    filename: string;
    readonly: boolean;
}

export interface DataLakeConfig {
    stores: ConfigStoreEntry[];
}

export interface PeerGroupConfig {
    members: string[];
    name: string;
    open: boolean;
    rtt_cap_ms: number;
}

export interface PeerState {
    node_id: string;
    usage: PeerUsage;
    terminated?: boolean;
}

export interface PeerUsage {
    sent_fetch_success: number;
    sent_put_success: number;
    served_fetch_requests: number;
    served_put_requests: number;
    received_unsol_fetch: number;
    received_unsol_put: number;
    reputation_score: number;
    our_reputation_score: number;
}
