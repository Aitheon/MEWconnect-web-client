import 'regenerator-runtime/runtime';
import * as MewConnectSrc from '../src';
import ethUtils from 'ethereumjs-util';

export const Initiator = MewConnectSrc.default.Initiator;
export const Crypto = new MewConnectSrc.default.Crypto;
export const Utils = ethUtils;
