import { HLSMultiVariant, HLSMediaPlaylist } from "./index";

describe("multivariant playlist", () => {
  test("adding one query param to multivariant playlist", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMultiVariant({ filePath: "./testvectors/slate/manifest.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[4]).toEqual("manifest_1.m3u8?hej=hopp");
  });
  
  test("adding two query params to multivariant playlist", async () => {
    const params = new URLSearchParams({ hej: "hopp", tjo: "hej" });
    const hls = new HLSMultiVariant({ filePath: "./testvectors/slate/manifest.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[4]).toEqual("manifest_1.m3u8?hej=hopp&tjo=hej");
  });
  
  test("adding one query params to multivariant playlist that has URLs with query params", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMultiVariant({ filePath: "./testvectors/query/manifest.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[4]).toEqual("manifest_1.m3u8?type=asdf&hej=hopp");
  });

  test("return a list of media playlist with query params", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMultiVariant({ filePath: "./testvectors/query/manifest.m3u8" }, params);
    await hls.fetch();
    expect(hls.streams[0]).toEqual("manifest_1.m3u8?type=asdf&hej=hopp");
    expect(hls.streamURLs.map(url => url.href)[0]).toEqual("https://fakeurl.com/manifest_1.m3u8?type=asdf&hej=hopp");
  });
});

describe("media playlist", () => {
  test("adding one query param to media playlist", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMediaPlaylist({ filePath: "./testvectors/slate/manifest_1.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[6]).toEqual("manifest_1_00001.ts?hej=hopp");
    expect(lines[8]).toEqual("manifest_1_00002.ts?hej=hopp");
    expect(lines[10]).toEqual("manifest_1_00003.ts?hej=hopp");
  });

  test("adding one query params to media playlist that has URLs with query params", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMediaPlaylist({ filePath: "./testvectors/query/manifest_1.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[6]).toEqual("manifest_1_00001.ts?type=asdf&hej=hopp");
    expect(lines[8]).toEqual("manifest_1_00002.ts?type=asdf&hej=hopp");
    expect(lines[10]).toEqual("manifest_1_00003.ts?type=asdf&hej=hopp");
  });

  test("adding one query params to media playlist that has absolute URLs", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMediaPlaylist({ filePath: "./testvectors/absolute/manifest_1.m3u8" }, params);
    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[6]).toEqual("https://example.com/hej/manifest_1_00001.ts?hej=hopp");
    expect(lines[8]).toEqual("https://example.com/hej/manifest_1_00002.ts?hej=hopp");
    expect(lines[10]).toEqual("https://example.com/hej/manifest_1_00003.ts?hej=hopp");
  });

  test("prepend segment URLs with href", async () => {
    const params = new URLSearchParams({ hej: "hopp" });
    const hls = new HLSMediaPlaylist({ filePath: "./testvectors/slate/manifest_1.m3u8" }, 
      params,
      new URL("https://prepend.com/hej/")
    );

    await hls.fetch();
    const lines = hls.toString().split("\n");
    expect(lines[6]).toEqual("https://prepend.com/hej/manifest_1_00001.ts?hej=hopp");
    expect(lines[8]).toEqual("https://prepend.com/hej/manifest_1_00002.ts?hej=hopp");
    expect(lines[10]).toEqual("https://prepend.com/hej/manifest_1_00003.ts?hej=hopp");    
  });
});