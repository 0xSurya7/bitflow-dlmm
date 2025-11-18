# DLMM Clarity Tests

Comprehensive test suite for DLMM (Dynamic Liquidity Market Maker) smart contracts.

## Directory Structure

```
.
├── bin/                    # Shell scripts for test execution and monitoring
├── contracts/              # Clarity smart contracts
├── docs/                   # Auto-generated Clarigen documentation
├── logs/                   # Test execution logs
├── notes/                  # Documentation and analysis
│   ├── analysis/          # Analysis files and status reports
│   ├── agent-progress/    # Agent progress tracking (for multi-agent work)
│   ├── archive/           # Archived planning documents
│   └── lessons-learned/   # Shared knowledge and patterns
├── scripts/               # TypeScript analysis scripts
├── tests/                 # Test files
├── Clarinet.toml          # Clarinet configuration
├── Clarigen.toml          # Clarigen configuration
└── vitest.config.js       # Vitest configuration
```

## Quick Start

### Run Tests
```bash
npm test                    # Run all tests
npm run test:simple        # Run tests without generating docs
npm run test:report        # Run tests with coverage and costs
npm run test:watch         # Watch mode for development
```

### Run Fuzz Tests
```bash
./bin/run-fuzz-test.sh
FUZZ_SIZE=1000 npm test    # Run with custom transaction count
```

### Monitor Progress
```bash
./bin/monitor-progress.sh
./bin/view-fuzz-results.sh
```

## Key Files

- **Main Fuzz Test**: `tests/dlmm-core-comprehensive-fuzz.test.ts`
- **Coordination File**: `notes/COMPREHENSIVE_PLAN_COORDINATION.md`
- **Test Helpers**: `tests/helpers.ts`

## Documentation

- See `notes/COMPREHENSIVE_PLAN_COORDINATION.md` for current testing strategy
- See `notes/analysis/` for test results and analysis
- See `external-test-context/CA-testing-dlmm/notes-testing.md` for testing guidelines

## Notes

- Tests use Clarigen for contract interaction
- Coverage reports are generated in `coverage/` directory
- Test logs are stored in `logs/` directory
- Large cost reports are in `costs-reports.json` (32MB)

