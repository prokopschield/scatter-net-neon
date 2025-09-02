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

export interface Range {
    start: number;
    end: number;
}

declare module "./load.cjs" {
    function init(config: NetConfig, state: NetState): Promise<Inner>;

    function exportConfig(net: Inner): NetConfig;
    function exportState(net: Inner): NetState;

    function fetch(net: Inner, hkey: string): Promise<Buffer>;
    function put(net: Inner, blob: Buffer): Promise<string>;

    function fetchSlice(
        net: Inner,
        hkey: string,
        range: Range
    ): Promise<Buffer>;
}

export class ScatterNet {
    constructor(private readonly inner: Inner) {}

    static async init(config: NetConfig, state: NetState): Promise<ScatterNet> {
        return new this(await addon.init(config, state));
    }

    exportConfig() {
        return addon.exportConfig(this.inner);
    }

    exportState() {
        return addon.exportState(this.inner);
    }

    async fetchBlob(hkey: string): Promise<Buffer> {
        const net = this.inner;
        const { buffer, byteOffset, length } = await addon.fetch(net, hkey);

        return Buffer.from(buffer, byteOffset, length);
    }

    async fetchSlice(hkey: string, range: Range): Promise<Buffer>;
    async fetchSlice(hkey: string, start: number, end: number): Promise<Buffer>;
    async fetchSlice(
        hkey: string,
        arg_1: number | Range = 0,
        end: number = Number.MAX_SAFE_INTEGER
    ): Promise<Buffer> {
        const net = this.inner;
        const range = typeof arg_1 === "number" ? { start: arg_1, end } : arg_1;
        const fetched = await addon.fetchSlice(net, hkey, range);
        const { buffer, byteOffset, length } = fetched;

        return Buffer.from(buffer, byteOffset, length);
    }

    async fetchString(
        hkey: string,
        encoding?: BufferEncoding,
        start?: number,
        end?: number
    ): Promise<string> {
        const buffer = await this.fetchBlob(hkey);

        return buffer.toString(encoding, start, end);
    }

    async fetchJson<T>(hkey: string): Promise<T> {
        return JSON.parse(await this.fetchString(hkey));
    }

    async putBlob(data: Buffer): Promise<string> {
        const net = this.inner;

        return await addon.put(net, data);
    }

    async putString(data: string): Promise<string> {
        return await this.putBlob(Buffer.from(data));
    }

    async putJson<T>(data: T): Promise<string> {
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
