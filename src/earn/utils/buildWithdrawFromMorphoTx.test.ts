import { MORPHO_VAULT_ABI } from '@/earn/abis/morpho';
import { USDC_DECIMALS } from '@/earn/constants';
import { encodeFunctionData, parseUnits } from 'viem';
import { describe, expect, it } from 'vitest';
import {
  type WithdrawFromMorphoParams,
  buildWithdrawFromMorphoTx,
} from './buildWithdrawFromMorphoTx';

describe('buildWithdrawFromMorphoTx', () => {
  const mockArgs = {
    vaultAddress: '0xd63070114470f685b75B74D60EEc7c1113d33a3D',
    amount: parseUnits('1000', USDC_DECIMALS),
    receiverAddress: '0x9E95f497a7663B70404496dB6481c890C4825fe1',
  } satisfies WithdrawFromMorphoParams;

  it('should return an array with one transaction', () => {
    const result = buildWithdrawFromMorphoTx(mockArgs);
    expect(result).toHaveLength(1);
  });

  it('should build correct withdraw transaction', () => {
    const result = buildWithdrawFromMorphoTx(mockArgs);
    const expectedAmount = mockArgs.amount;

    const expectedWithdrawData = encodeFunctionData({
      abi: MORPHO_VAULT_ABI,
      functionName: 'withdraw',
      args: [
        expectedAmount,
        mockArgs.receiverAddress,
        mockArgs.receiverAddress,
      ],
    });

    expect(result[0]).toEqual({
      to: mockArgs.vaultAddress,
      data: expectedWithdrawData,
    });
  });

  it('should handle zero amount', () => {
    const result = buildWithdrawFromMorphoTx({
      ...mockArgs,
      amount: 0n,
    });

    const expectedAmount = parseUnits('0', USDC_DECIMALS);
    expect(result).toHaveLength(1);
    expect(
      encodeFunctionData({
        abi: MORPHO_VAULT_ABI,
        functionName: 'withdraw',
        args: [
          expectedAmount,
          mockArgs.receiverAddress,
          mockArgs.receiverAddress,
        ],
      }),
    ).toBe(result[0].data);
  });

  it('should handle decimal amounts', () => {
    const result = buildWithdrawFromMorphoTx({
      ...mockArgs,
      amount: parseUnits('100.5', USDC_DECIMALS),
    });

    const expectedAmount = parseUnits('100.5', USDC_DECIMALS);
    expect(result).toHaveLength(1);
    expect(
      encodeFunctionData({
        abi: MORPHO_VAULT_ABI,
        functionName: 'withdraw',
        args: [
          expectedAmount,
          mockArgs.receiverAddress,
          mockArgs.receiverAddress,
        ],
      }),
    ).toBe(result[0].data);
  });
});
