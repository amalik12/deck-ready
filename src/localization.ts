import fetch from 'node-fetch';

export default async function getLocalization() {
  const steamEngLocalization = await fetch(
    'https://raw.githubusercontent.com/SteamDatabase/SteamTracking/master/steamcommunity.com/public/javascript/applications/community/localization/shared_english.json'
  );
  return steamEngLocalization.json() as object;
}
