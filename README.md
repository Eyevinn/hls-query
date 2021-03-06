# hls-query

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Slack](http://slack.streamingtech.se/badge.svg)](http://slack.streamingtech.se)

Node library to append query params on each media segment URL in a media playlist

## Installation

```
npm install --save @eyevinn/hls-query
```

## Usage

```javascript
const { HLSMultiVariant, HLSMediaPlaylist } = require("@eyevinn/hls-query");
const params = new URLSearchParams({ token: "TOKEN" });
const multiVariant = new HLSMultiVariant({ 
  url: new URL("https://lab.cdn.eyevinn.technology/sto-slate.mp4/manifest.m3u8") 
}, params);
await multiVariant.fetch();

const mediaPlaylist = new HLSMediaPlaylist({ url: multiVariant.streamURLs[0] }, params);
// multiVariant.streamURLs[0].href === "https://lab.cdn.eyevinn.technology/sto-slate.mp4/manifest_1.m3u8?token=TOKEN"
await mediaPlaylist.fetch();

console.log(mediaPlaylist.toString());
// #EXTM3U
// #EXT-X-VERSION:3
// #EXT-X-TARGETDURATION:10
// #EXT-X-MEDIA-SEQUENCE:1
// #EXT-X-PLAYLIST-TYPE:VOD
// #EXTINF:10.0000,
// manifest_1_00001.ts?token=TOKEN
// #EXT-X-ENDLIST
```

It is also possible to apply a function that should be applied on each item in a multivariant or media playlist.

```javascript
let i = 0;
const mediaPlaylist = new HLSMediaPlaylist({ url: multiVariant.streamURLs[0] }, 
  (uri) => new URLSearchParams({ i: `${i++}` }));
await mediaPlaylist.fetch();

console.log(mediaPlaylist.toString());
// #EXTM3U
// #EXT-X-VERSION:3
// #EXT-X-TARGETDURATION:10
// #EXT-X-MEDIA-SEQUENCE:1
// #EXT-X-PLAYLIST-TYPE:VOD
// #EXTINF:10.0000,
// manifest_1_00001.ts?i=0
// manifest_1_00002.ts?i=1
// #EXT-X-ENDLIST
```

# About Eyevinn Technology

Eyevinn Technology is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor.

At Eyevinn, every software developer consultant has a dedicated budget reserved for open source development and contribution to the open source community. This give us room for innovation, team building and personal competence development. And also gives us as a company a way to contribute back to the open source community.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!