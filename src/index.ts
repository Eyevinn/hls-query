import fetch from "node-fetch";
import m3u8 from "@eyevinn/m3u8";
import { createReadStream, existsSync } from "fs";

interface IHLSOpts {
  url?: URL;
  filePath?: string;
}

class HLS {
  protected m3u: any;
  private opts: IHLSOpts;

  constructor(opts: IHLSOpts) {
    this.opts = opts;
  }

  toString() {
    return this.m3u.toString();
  }

  protected _fetchAndParse(): Promise<void> {
    return new Promise((resolve, reject) => {
      const parser = m3u8.createStream();
      parser.on("m3u", m3u => {
        this.m3u = m3u;
        resolve();
      });
      parser.on("error", err => {
        reject("Failed to parse manifest: " + err);
      });

      if (this.opts.url) {
        fetch(this.opts.url.href)
        .then(response => {
          if (response.ok) {
            response.body.pipe(parser);
          } else {
            reject(`Failed to fetch manifest (${response.status}): ` + response.statusText);
          }
        })
        .catch(reject);
      } else if (this.opts.filePath) {
        try {
          createReadStream(this.opts.filePath).pipe(parser);
        } catch(err) {
          reject(`Failed to fetch manifest: ` + err);
        }
      }
    });
  }

  protected applyParams(params: URLSearchParams, item): void {
    const searchParams = new URLSearchParams(item.get("uri").split("?")[1]);
    params.forEach((value, key) => searchParams.append(key, value));
    item.set("uri", item.get("uri").split("?")[0] + "?" + searchParams.toString())
  }
}

export class HLSMultiVariant extends HLS {
  private params: URLSearchParams;

  constructor(opts: IHLSOpts, params: URLSearchParams) {
    super(opts);
    this.params = params;
  }

  async fetch() {
    await this._fetchAndParse();
    this.m3u.items.StreamItem.map(item => this.applyParams(this.params, item));
  }
}

export class HLSMediaPlaylist extends HLS {
  private params: URLSearchParams;

  constructor(opts: IHLSOpts, params: URLSearchParams) {
    super(opts);
    this.params = params;
  }

  async fetch() {
    await this._fetchAndParse();
    this.m3u.items.PlaylistItem.map(item => this.applyParams(this.params, item));
  }
}