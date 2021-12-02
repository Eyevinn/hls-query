const { HLSMultiVariant, HLSMediaPlaylist } = require("./dist/index.js");

const main = async () => {
  const params = new URLSearchParams({ token: "TOKEN" });
  
  const multiVariant = new HLSMultiVariant("https://lab.cdn.eyevinn.technology/sto-slate.mp4/manifest.m3u8", params);
  await multiVariant.fetch();
  console.log(multiVariant.toString());
  
  const mediaPlaylist = new HLSMediaPlaylist(multiVariant.streams[0], params);
  await mediaPlaylist.fetch();
  console.log(mediaPlaylist.toString());
}

main();