import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTranslationObject } from './useTranslationObject';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

const mockUseTranslation = vi.mocked(useTranslation);

describe('useTranslationObject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an object with correct keys for single namespace', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() => useTranslationObject(['common'] as const));

    expect(result.current).toHaveProperty('tCommon');
    expect(typeof result.current.tCommon).toBe('function');
  });

  it('should return an object with correct keys for multiple namespaces', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() => useTranslationObject(['common', 'auth', 'data'] as const));

    // Check that all expected keys exist
    expect(result.current).toHaveProperty('tCommon');
    expect(result.current).toHaveProperty('tAuth');
    expect(result.current).toHaveProperty('tData');

    // Check that the functions exist
    expect(typeof result.current.tCommon).toBe('function');
    expect(typeof result.current.tAuth).toBe('function');
    expect(typeof result.current.tData).toBe('function');
  });

  it('should capitalize namespace names correctly', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() =>
      useTranslationObject(['screeningTopics', 'transfercheck'] as const),
    );

    // Check that keys are properly capitalized (camelCase)
    expect(result.current).toHaveProperty('tScreeningTopics');
    expect(result.current).toHaveProperty('tTransfercheck');

    expect(typeof result.current.tScreeningTopics).toBe('function');
    expect(typeof result.current.tTransfercheck).toBe('function');
  });

  it('should handle empty namespaces array', () => {
    const { result } = renderHook(() => useTranslationObject([] as const));

    expect(result.current).toEqual({});
  });

  it('should handle single character namespace', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() => useTranslationObject(['api'] as const));

    expect(result.current).toHaveProperty('tApi');
    expect(typeof result.current.tApi).toBe('function');
  });

  it('should handle namespaces with numbers', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() => useTranslationObject(['api', 'cases'] as const));

    expect(result.current).toHaveProperty('tApi');
    expect(result.current).toHaveProperty('tCases');
  });

  it('should call useTranslation with correct namespace for each namespace', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    renderHook(() => useTranslationObject(['common', 'auth', 'data'] as const));

    expect(mockUseTranslation).toHaveBeenCalledTimes(3);
    expect(mockUseTranslation).toHaveBeenCalledWith('common');
    expect(mockUseTranslation).toHaveBeenCalledWith('auth');
    expect(mockUseTranslation).toHaveBeenCalledWith('data');
  });

  it('should handle namespaces with underscores', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() =>
      useTranslationObject(['screeningTopics', 'transfercheck'] as const),
    );

    expect(result.current).toHaveProperty('tScreeningTopics');
    expect(result.current).toHaveProperty('tTransfercheck');
  });

  it('should handle mixed case namespaces', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() =>
      useTranslationObject(['screeningTopics', 'transfercheck'] as const),
    );

    expect(result.current).toHaveProperty('tScreeningTopics');
    expect(result.current).toHaveProperty('tTransfercheck');
  });

  it('should return object with correct structure for all available namespaces', () => {
    const mockT = vi.fn();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    } as any);

    const { result } = renderHook(() =>
      useTranslationObject([
        'common',
        'auth',
        'cases',
        'data',
        'decisions',
        'filters',
        'navigation',
        'lists',
        'sanctions',
        'screeningTopics',
        'scenarios',
        'settings',
        'transfercheck',
        'upload',
        'workflows',
        'api',
      ] as const),
    );

    // Check that all expected keys exist
    expect(result.current).toHaveProperty('tCommon');
    expect(result.current).toHaveProperty('tAuth');
    expect(result.current).toHaveProperty('tCases');
    expect(result.current).toHaveProperty('tData');
    expect(result.current).toHaveProperty('tDecisions');
    expect(result.current).toHaveProperty('tFilters');
    expect(result.current).toHaveProperty('tNavigation');
    expect(result.current).toHaveProperty('tLists');
    expect(result.current).toHaveProperty('tSanctions');
    expect(result.current).toHaveProperty('tScreeningTopics');
    expect(result.current).toHaveProperty('tScenarios');
    expect(result.current).toHaveProperty('tSettings');
    expect(result.current).toHaveProperty('tTransfercheck');
    expect(result.current).toHaveProperty('tUpload');
    expect(result.current).toHaveProperty('tWorkflows');
    expect(result.current).toHaveProperty('tApi');

    // Check that all values are functions
    Object.values(result.current).forEach((value) => {
      expect(typeof value).toBe('function');
    });
  });
});
