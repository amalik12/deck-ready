export enum TestResultType {
  Info = 1,
  Unsupported,
  Playable,
  Verified,
}

export enum CompatibilityCategory {
  Unsupported = 1,
  Playable,
  Verified,
  Unknown,
}

export interface TestResult {
  type: TestResultType;
  description: string;
}

export enum GameBuild {
  Native = 'native',
  Proton = 'proton-stable',
}

export interface GameCompatibility {
  category: CompatibilityCategory;
  description: string;
  tests: TestResult[];
  recommended_build: GameBuild;
  test_timestamp: number;
}

export interface GameDetails {
  name: string;
  appId: number;
  logo: string;
  compatibility: GameCompatibility;
}

export default async function getGameDetails(
  url: string
): Promise<GameDetails[]> {
  const res = await fetch('/api/apps', {
    method: 'POST',
    body: JSON.stringify({url}),
    headers: {'Content-Type': 'application/json'},
  });
  if (!res.ok) {
    if (res.status === 401)
      throw new Error(
        'Problem retrieving game details. Make sure that "Game Details" is set to "Public" in your Steam '
      );
    if (res.status === 400)
      throw new Error(
        "Invalid URL. Make sure that the URL starts with 'https://steamcommunity.com/'."
      );
    throw new Error('Problem retrieving game details. Please try again later.');
  }
  return res.json();
}
