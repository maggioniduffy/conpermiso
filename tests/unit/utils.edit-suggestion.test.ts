import { describe, it, expect } from "vitest";
import {
  diffSuggestion,
  requestTitle,
  suggestionFields,
} from '@/utils/edit-suggestion';
import type { BathRequest } from '@/utils/models';

const bath = {
  _id: 'b1',
  name: 'Bar La Esquina',
  description: 'Baño al fondo del bar',
  cost: 'Sin cargo',
  type: 'Privado',
  shifts: [
    { days: [1, 2], allDay: false, from: { hour: '09', minute: '00' }, to: { hour: '18', minute: '00' } },
  ],
  location: { type: 'Point', coordinates: [2.1734, 41.3851] },
  address: 'Calle 1',
  requiresCode: true,
  accessCode: '1234',
};

describe('diffSuggestion', () => {
  it('devuelve sólo los campos que cambiaron', () => {
    expect(
      diffSuggestion(bath, {
        name: ' Bar La Esquina ',
        description: 'Otra descripción del baño',
        cost: 'Sin cargo',
      }),
    ).toEqual({ description: 'Otra descripción del baño' });
  });

  it('no cuenta como cambio el mismo horario con otra forma', () => {
    expect(
      diffSuggestion(bath, {
        shifts: [
          { days: [2, 1], allDay: false, from: { hour: '9', minute: '0' }, to: { hour: '18', minute: '0' } },
        ],
      }),
    ).toEqual({});
  });

  it('compara el precio como número', () => {
    expect(diffSuggestion({ ...bath, cost: '5' }, { cost: 5 })).toEqual({});
    expect(diffSuggestion(bath, { cost: 5 })).toEqual({ cost: 5 });
  });

  it('manda la zona horaria sólo si se movió el pin', () => {
    expect(
      diffSuggestion(bath, { location: bath.location, timezone: 'Europe/Madrid' }),
    ).toEqual({});
    expect(
      diffSuggestion(bath, {
        location: { type: 'Point', coordinates: [-3.7, 40.4] },
        timezone: 'Europe/Madrid',
      }),
    ).toEqual({
      location: { type: 'Point', coordinates: [-3.7, 40.4] },
      timezone: 'Europe/Madrid',
    });
  });
});

describe('suggestionFields / requestTitle', () => {
  it('lista los campos en el orden del formulario', () => {
    expect(suggestionFields({ address: 'x', name: 'y' })).toEqual(['name', 'address']);
    expect(suggestionFields(undefined)).toEqual([]);
  });

  it('usa el nombre del baño en las sugerencias', () => {
    const base = { name: 'Alta', status: 'PENDING' } as unknown as BathRequest;
    expect(requestTitle(base)).toBe('Alta');
    expect(requestTitle({ ...base, kind: 'edit', bath: { _id: 'b1', name: 'Bar' } })).toBe('Bar');
  });
});
