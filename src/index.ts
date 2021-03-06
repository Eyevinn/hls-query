import fetch from "node-fetch";
import m3u8 from "@eyevinn/m3u8";
import { createReadStream, ReadStream } from "fs";

interface IHLSOpts {
  url?: URL;
  filePath?: string;
  stream?: ReadStream;
}

class HLS {
  protected m3u: any;
  protected opts: IHLSOpts;

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
        reject({ message: `Failed to parse manifest: ${err}` });
      });

      if (this.opts.url) {
        fetch(this.opts.url.href)
          .then(response => {
            if (response.ok) {
              response.body.pipe(parser);
            } else {
              reject({
                statusCode: response.status,
                statusText: response.statusText,
                message: `Failed to fetch manifest (${response.status}): ${response.statusText}`,
              });
            }
          })
          .catch(reject);
      } else if (this.opts.filePath) {
        try {
          createReadStream(this.opts.filePath).pipe(parser);
        } catch(err) {
          reject({ message: `Failed to fetch manifest: ${err}` });
        }
      } else if (this.opts.stream) {
        try {
          this.opts.stream.pipe(parser);
        } catch(err) {
          reject({ message: `Failed to fetch manifest: ${err}` });
        }
      }
    });
  }

  protected applyParams(params: URLSearchParams, item): void {
    const searchParams = new URLSearchParams(item.get("uri").split("?")[1]);
    params.forEach((value, key) => searchParams.append(key, value));
    item.set("uri", item.get("uri").split("?")[0] + "?" + searchParams.toString());
  }

  protected applyParamsFunc(createParams: (uri: string) => URLSearchParams, item): void {
    const searchParams = createParams(item.get("uri"));
    this.applyParams(searchParams, item);
  }
}

export class HLSMultiVariant extends HLS {
  private params?: URLSearchParams;
  private paramsFunc?: ((uri: string) => URLSearchParams);

  constructor(opts: IHLSOpts, params: URLSearchParams | ((uri: string) => URLSearchParams)) {
    super(opts);
    if (typeof params === "function") {
      this.paramsFunc = params;
    } else {
      this.params = params;
    }
  }

  async fetch() {
    await this._fetchAndParse();
    if (this.params) {
      this.m3u.items.StreamItem.map(item => this.applyParams(this.params, item));
      this.m3u.items.MediaItem.map(item => this.applyParams(this.params, item));
    } else {
      this.m3u.items.StreamItem.map(item => this.applyParamsFunc(this.paramsFunc, item));
      this.m3u.items.MediaItem.map(item => this.applyParamsFunc(this.paramsFunc, item));
    }
  }

  get streams(): string[] {
    let streams = this.m3u.items.StreamItem.map(item => item.get("uri"));
    streams = streams.concat(this.m3u.items.MediaItem.map(item => item.get("uri")));
    return streams;
  }

  get streamURLs(): URL[] {
    let streamURLs: URL[];
    let basePath = "https://fakeurl.com/";
    if (this.opts.url) {
      const m = this.opts.url.href.match("^(.*)/.*?$");
      if (m) {
        basePath = m[1] + "/";
      }
    }
    streamURLs = this.m3u.items.StreamItem.map(item => new URL(item.get("uri"), basePath));
    streamURLs = streamURLs.concat(this.m3u.items.MediaItem.map(item => new URL(item.get("uri"), basePath)));
    return streamURLs;
  }
}

export class HLSMediaPlaylist extends HLS {
  private params?: URLSearchParams;
  private paramsFunc?: ((uri: string) => URLSearchParams);
  private prependUrl?: URL;
  private removeParams?: string[];
  private chroot: boolean;

  constructor(opts: IHLSOpts, params: URLSearchParams | ((uri: string) => URLSearchParams), 
    prependUrl?: URL, remove?: string[], chroot?: boolean) 
  {
    super(opts);
    if (typeof params === "function") {
      this.paramsFunc = params;
    } else {
      this.params = params;
    }
    this.prependUrl = prependUrl;
    this.removeParams = remove;
    this.chroot = !!chroot;
  }

  async fetch() {
    await this._fetchAndParse();
    if (this.params) {
      this.m3u.items.PlaylistItem.map(item => this.applyParams(this.params, item));
    } else {
      this.m3u.items.PlaylistItem.map(item => this.applyParamsFunc(this.paramsFunc, item));
    }
    this.m3u.items.PlaylistItem.map(item => {
      if (this.prependUrl) {
        item.set("uri", this.prependUrl.href + item.get("uri"));
      }
      if (this.removeParams) {
        this.removeParams.forEach((paramToDelete:string) => {
          const searchParams = new URLSearchParams(item.get("uri").split("?")[1]);
          searchParams.delete(paramToDelete);
          item.set("uri", item.get("uri").split("?")[0] + "?" + searchParams.toString());      
        });
      }
      if (this.chroot) {
        const searchParams = new URLSearchParams(item.get("uri").split("?")[1]);
        const newUri = item.get("uri").split("?")[0].replace(/\.\.\//g, "");
        item.set("uri", newUri + "?" + searchParams.toString());      
      }
    });
  }
}
