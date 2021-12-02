const { HLSMultiVariant, HLSMediaPlaylist } = require("./dist/index.js");

(async () => {
  const params = new URLSearchParams({ token: "TOKEN" });

  const multiVariant = new HLSMultiVariant({ 
    url: new URL("https://lab.cdn.eyevinn.technology/sto-slate.mp4/manifest.m3u8") 
  }, params);
  await multiVariant.fetch();
  console.log(multiVariant.toString());

  const mediaPlaylist = new HLSMediaPlaylist({ url: multiVariant.streamURLs[0] }, params);
  await mediaPlaylist.fetch();
  console.log(mediaPlaylist.toString());
})();