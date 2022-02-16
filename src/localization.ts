import fetch from 'node-fetch';

export default async function getLocalization() {
  const steamEngLocalization = await fetch(
    'https://raw.githubusercontent.com/SteamDatabase/SteamTracking/de8da35bc06bbb8e23e1d2c34070639d5b948bd1/steamcommunity.com/public/javascript/applications/community/localization/shared_english.json'
  );
  return steamEngLocalization.json() as object;
}
