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
    function fetch(net: Inner, hkey: string): Promise<Buffer>;
    function put(net: Inner, blob: Buffer): Promise<string>;
}

export class ScatterNet {
    private _init: Promise<Inner>;

    constructor(config: NetConfig, state: NetState) {
        this._init = addon.init(config, state);
    }

    async fetchBlob(hkey: string): Promise<Buffer> {
        const net = await this._init;
        const { buffer, byteOffset, length } = await addon.fetch(net, hkey);

        return Buffer.from(buffer, byteOffset, length);
    }

    async putBlob(data: Buffer): Promise<string> {
        const net = await this._init;

        return await addon.put(net, data);
    }

    async putString(data: string): Promise<string> {
        return await this.putBlob(Buffer.from(data));
    }

    async putJson<O>(data: O): Promise<string> {
        return await this.putString(JSON.stringify(data));
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
