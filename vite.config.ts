import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      CONCURRENCY_LIMIT: '1',
      NODE_ENV: 'test',
    },
    include: ['tests/**/*.test.ts'],
    resolveSnapshotPath(testPath, extension) {
      return `tests/__snapshots__/${path.basename(testPath)}${extension}`;
    },
    outputFile: 'coverage/sonar-report.xml', // output that for now serves as a placeholder, later it will be used to upload the report to Github
  },
});
