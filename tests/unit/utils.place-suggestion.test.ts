import { describe, it, expect } from "vitest";
import {
  MAX_PLACE_CANDIDATES,
  PLACE_PREFILL_RADIUS_M,
  isEstablishment,
  nextTitle,
  normalizePoiName,
  pickPlaceCandidates,
} from '@/utils/place-suggestion';

describe('normalizePoiName', () => {
  it('junta saltos de línea y espacios repetidos en uno solo', () => {
    expect(normalizePoiName('  Café\nCentral  \r\n Madrid ')).toBe('Café Central Madrid');
  });

  it('deja vacío lo que es sólo espacio', () => {
    expect(normalizePoiName(' \n\t ')).toBe('');
  });
});

describe('pickPlaceCandidates', () => {
  it('descarta lo que está más lejos que el radio, pero conserva el borde', () => {
    const result = pickPlaceCandidates([
      { name: 'Lejos', distance: PLACE_PREFILL_RADIUS_M + 0.1 },
      { name: 'Borde', distance: PLACE_PREFILL_RADIUS_M },
    ]);
    expect(result.map((r) => r.name)).toEqual(['Borde']);
  });

  it('ordena de menor a mayor distancia', () => {
    const result = pickPlaceCandidates([
      { name: 'B', distance: 30 },
      { name: 'A', distance: 5 },
      { name: 'C', distance: 12 },
    ]);
    expect(result.map((r) => r.name)).toEqual(['A', 'C', 'B']);
  });

  it('normaliza nombres y descarta los vacíos', () => {
    const result = pickPlaceCandidates([
      { name: ' \n ', distance: 1 },
      { name: 'Bar\nEl  Sol', distance: 2 },
    ]);
    expect(result).toEqual([{ name: 'Bar El Sol', distance: 2 }]);
  });

  it('no repite nombres ignorando mayúsculas y se queda con el más cercano', () => {
    const result = pickPlaceCandidates([
      { name: 'cafe central', distance: 20 },
      { name: 'Cafe Central', distance: 8 },
      { name: 'Farmacia', distance: 15 },
    ]);
    expect(result).toEqual([
      { name: 'Cafe Central', distance: 8 },
      { name: 'Farmacia', distance: 15 },
    ]);
  });

  it('devuelve como mucho MAX_PLACE_CANDIDATES', () => {
    const pois = Array.from({ length: 6 }, (_, i) => ({ name: `Lugar ${i}`, distance: i + 1 }));
    expect(pickPlaceCandidates(pois)).toHaveLength(MAX_PLACE_CANDIDATES);
  });

  it('con una lista vacía devuelve vacío', () => {
    expect(pickPlaceCandidates([])).toEqual([]);
  });
});

describe('nextTitle', () => {
  it('completa un título vacío o en blanco', () => {
    expect(nextTitle('', null, 'Café')).toBe('Café');
    expect(nextTitle('   ', null, 'Café')).toBe('Café');
  });

  it('reemplaza la sugerencia anterior si no se tocó', () => {
    expect(nextTitle('Café', 'Café', 'Bar')).toBe('Bar');
  });

  it('nunca pisa lo que escribió el usuario', () => {
    expect(nextTitle('Mi baño favorito', 'Café', 'Bar')).toBe('Mi baño favorito');
    expect(nextTitle('Mi baño favorito', null, 'Bar')).toBe('Mi baño favorito');
  });
});

describe('isEstablishment', () => {
  it('es true para lugares con nombre propio', () => {
    expect(isEstablishment(['restaurant', 'food', 'point_of_interest', 'establishment'])).toBe(true);
    expect(isEstablishment(['point_of_interest'])).toBe(true);
    expect(isEstablishment(['establishment'])).toBe(true);
  });

  it('es false para direcciones, calles y localidades', () => {
    expect(isEstablishment(['street_address'])).toBe(false);
    expect(isEstablishment(['route'])).toBe(false);
    expect(isEstablishment(['geocode'])).toBe(false);
    expect(isEstablishment(['locality', 'political'])).toBe(false);
    expect(isEstablishment(['premise'])).toBe(false);
  });

  it('es false sin tipos', () => {
    expect(isEstablishment(undefined)).toBe(false);
    expect(isEstablishment([])).toBe(false);
  });
});
