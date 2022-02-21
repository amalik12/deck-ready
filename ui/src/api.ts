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
  return res.json();
}
