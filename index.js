import SteamUser from 'steam-user';
import fetch from 'node-fetch';

const client = new SteamUser();

client.logOn();

let localization;

async function setLocalization(params) {
  const steamEngLocalization = await fetch('https://raw.githubusercontent.com/SteamDatabase/SteamTracking/de8da35bc06bbb8e23e1d2c34070639d5b948bd1/steamcommunity.com/public/javascript/applications/community/localization/shared_english.json')
  localization = await steamEngLocalization.json();
}

client.on('loggedOn', async (details) => {
  await setLocalization();
  console.log("Logged onto Steam as " + client.steamID.steam3());

  console.log("Requesting appinfo for TF2 and CS:GO...");
  let result = await client.getProductInfo([620, 753640, 1097150], [], true); // Passing true as the third argument automatically requests access tokens, which are required for some apps

  console.log("Got app info, writing to files");
  console.log('Portal 2:');
  console.log(result.apps[620].appinfo.common.steam_deck_compatibility);
  
  console.log('Outer Wilds:');
  console.log(result.apps[1097150].appinfo.common.steam_deck_compatibility);
  
  // Test result strings
  for (let test in result.apps[1097150].appinfo.common.steam_deck_compatibility.tests) {
    console.log(localization[result.apps[1097150].appinfo.common.steam_deck_compatibility.tests[test].token.slice(1)]);
  }
  client.logOff();
});

/** 
 * Test ratings:
 * 1 - Info
 * 4 - Verified
 * 2 - Unsupported
 * 3 - Playable
 */

/**
 * Categories:
 * 1 - Unsupported
 * 2 - Playable
 * 3 - Verified
 */