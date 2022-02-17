import getLocalization from './localization';
import client from './steamClient';

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
  client.logOn();
  const loggedIn = new Promise<void>(resolve => {
    client.on('loggedOn', () => {
      resolve();
    });
  });

  await loggedIn;

  const localization: any = await getLocalization();

  console.log('Requesting appinfo...');
  const result = await client.getProductInfo(appIds, [], true);

  const output: GameDetails[] = [];

  for (const appid in result.apps) {
    const app = result.apps[appid].appinfo.common;
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
  client.logOff();

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
