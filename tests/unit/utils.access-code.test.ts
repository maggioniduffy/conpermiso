import { describe, it, expect } from "vitest";
import { accessCodeValueFrom, formatLocalDate } from '@/utils/access-code';

describe('formatLocalDate', () => {
  it('formatea como DD/MM/YYYY con el día local', () => {
    expect(formatLocalDate(new Date(2026, 9, 5, 23, 30).toISOString())).toBe('05/10/2026');
    expect(formatLocalDate(new Date(2026, 0, 31, 0, 5).toISOString())).toBe('31/01/2026');
  });

  it('devuelve vacío sin fecha o con una inválida', () => {
    expect(formatLocalDate(null)).toBe('');
    expect(formatLocalDate(undefined)).toBe('');
    expect(formatLocalDate('nada')).toBe('');
  });
});

describe('accessCodeValueFrom', () => {
  it('trata los campos ausentes como "no pide código"', () => {
    expect(accessCodeValueFrom({})).toEqual({
      requiresCode: false,
      accessCode: '',
    });
  });

  it('ignora el vencimiento que traigan los baños viejos', () => {
    expect(
      accessCodeValueFrom({
        requiresCode: true,
        accessCode: '1234',
        accessCodeExpiresAt: '2030-01-01T00:00:00.000Z',
      } as Parameters<typeof accessCodeValueFrom>[0]),
    ).toEqual({ requiresCode: true, accessCode: '1234' });
  });
});
