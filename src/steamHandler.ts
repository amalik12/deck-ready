import getLocalization from './localization';
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

interface TestResult {
  type: TestResultType;
  description: string;
}

interface GameDetails {
  name: string;
  appId: number;
  logo: string;
  compatibility: {
    category: CompatibilityCategory;
    tests: TestResult[];
  };
}

export default async function getGameDetails(
  appIds: number[]
): Promise<GameDetails[]> {
  await loggedIn;

  const uncachedAppIds = [];
  const cachedApps = {};
  appIds.forEach(appId => {
    if (
      !client.picsCache.apps[appId]?.appinfo?.common?.steam_deck_compatibility
    ) {
      uncachedAppIds.push(appId);
    } else {
      cachedApps[appId] = client.picsCache.apps[appId];
    }
  });

  const localization: any = await getLocalization();

  console.log('Requesting appinfo...');
  const result = await client.getProductInfo(uncachedAppIds, [], true);

  const output: GameDetails[] = [];

  const allApps = {...cachedApps, ...result.apps};
  for (const appid in allApps) {
    const app = allApps[appid].appinfo.common;
    const compatibility = app.steam_deck_compatibility;

    const detail: GameDetails = {
      name: app.name,
      appId: Number(appid),
      logo: app.logo,
      compatibility: {
        category: Number(compatibility?.category),
        tests: [],
      },
    };
    if (!compatibility) {
      detail.compatibility.category = CompatibilityCategory.Unknown;
    }

    for (const testName in compatibility?.tests) {
      const test = compatibility.tests[testName];
      const testResult: TestResult = {
        type: Number(test.display),
        description: localization[test.token.slice(1)],
      };
      detail.compatibility.tests.push(testResult);
    }
    output.push(detail);
  }

  return output;
}

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
