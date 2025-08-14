import { project, accounts } from './clarigen-types';
import {
  projectErrors,
  projectFactory,
} from '@clarigen/core';

export const contracts = projectFactory(project, "simnet");

export const deployer = accounts.deployer.address;
export const alice = accounts.wallet_1.address;
export const bob = accounts.wallet_2.address;
export const charlie = accounts.wallet_3.address;

export const dlmmCore = contracts.dlmmCoreV11;
export const sbtcUsdcPool = contracts.dlmmPoolSbtcUsdcV11;
export const mockSbtcToken = contracts.mockSbtcToken;
export const mockUsdcToken = contracts.mockUsdcToken;
export const mockPool = contracts.mockPool;

const _errors = projectErrors(project);

export const errors = {
  dlmmCore: _errors.dlmmCoreV11,
  sbtcUsdcPool: _errors.dlmmPoolSbtcUsdcV11
};
