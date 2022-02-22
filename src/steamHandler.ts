import getLocalization from './localization';
import redis from './redisClient';
import client, {loggedIn} from './steamClient';

enum TestResultType {
  Info = 1,
  Unsupported,
  Playable,
  Verified,
}

enum CompatibilityCategory {
  Unsupported = 1,
  Playable,
  Verified,
  Unknown,
}

enum GameBuild {
  Native = 'native',
  Proton = 'proton-stable',
}

interface TestResult {
  type: TestResultType;
  description: string;
}

interface GameDetails {
  name: string;
  appId: number;
  logo: string;
  playtime: number;
  compatibility: {
    category: CompatibilityCategory;
    description: string;
    tests: TestResult[];
    recommended_build: GameBuild;
    test_timestamp: number;
  };
}

export default async function getGameDetails(
  appIds: number[],
  playtimeMap: Map<number, number>
): Promise<GameDetails[]> {
  await loggedIn;

  const uncachedAppIds = [];
  const cachedApps: GameDetails[] = [];

  const keys = appIds.map(appId => `app:${appId}`);
  const results = await redis.mGet(keys);
  results.forEach((result, index) => {
    if (result === null) {
      uncachedAppIds.push(appIds[index]);
    } else {
      cachedApps.push(JSON.parse(result));
    }
  });

  cachedApps.forEach(app => {
    app.playtime = playtimeMap.get(app.appId) || 0;
  });

  const output: GameDetails[] = [...cachedApps];

  if (!uncachedAppIds.length) {
    return output.sort((a, b) => b.playtime - a.playtime);
  }

  const localization: any = await getLocalization();

  const result = await client.getProductInfo(uncachedAppIds, [], true);

  for (const appid in result.apps) {
    const app = result.apps[appid].appinfo.common;
    if (!app.header_image?.english) continue;

    const compatibility = app.steam_deck_compatibility;

    const detail: GameDetails = {
      name: app.name,
      appId: Number(appid),
      logo: app.logo,
      playtime: playtimeMap.get(Number(appid)),
      compatibility: {
        category: Number(compatibility?.category),
        description:
          localization[
            `SteamDeckVerified_DescriptionHeader_${
              CompatibilityCategory[compatibility?.category]
            }`
          ],
        tests: [],
        recommended_build: compatibility?.configuration?.recommended_runtime,
        test_timestamp: compatibility?.test_timestamp,
      },
    };
    if (!compatibility) {
      detail.compatibility.category = CompatibilityCategory.Unknown;
      detail.compatibility.description =
        "This game has not yet undergone Valve's compatibility testing.";
    }

    for (const testName in compatibility?.tests) {
      const test = compatibility.tests[testName];
      const testResult: TestResult = {
        type: Number(test.display),
        description: localization[test.token.slice(1)],
      };
      detail.compatibility.tests.push(testResult);
    }
    redis.setEx(`app:${appid}`, 7200, JSON.stringify(detail));
    output.push(detail);
  }

  return output.sort((a, b) => b.playtime - a.playtime);
}
