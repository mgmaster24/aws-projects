module.exports = {
  roots: ['<rootDir>/src/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  coverageDirectory: './.jest/.coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '.jest',
        outputName: 'junit-results.xml'
      }
    ],
    [
      'jest-sonar',
      {
        outputDirectory: '.jest',
        outputName: 'sonar-report.xml'
      }
    ]
  ]
};