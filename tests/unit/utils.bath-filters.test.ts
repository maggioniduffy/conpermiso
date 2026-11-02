import { describe, it, expect } from "vitest";
import { costCategory, filterBaths } from '@/utils/bath-filters';
import { Bath, BathAccess, BathSource } from '@/utils/models';

const bath = (
  id: string,
  type: BathAccess | undefined,
  cost: unknown,
  source?: BathSource,
): Bath => ({ _id: id, type, cost, source }) as unknown as Bath;

const BATHS = [
  bath('pub-free', BathAccess.PUBLIC, 'Sin cargo'),
  bath('pub-none', BathAccess.PUBLIC, undefined),
  bath('pub-num', BathAccess.PUBLIC, 0.5),
  bath('osm-fee', BathAccess.PUBLIC, undefined, BathSource.OPENSTREETMAP),
  bath('com-free', BathAccess.PRIVATE, 'Sin cargo'),
  bath('com-cons', BathAccess.PRIVATE, 'Con consumicion'),
  bath('com-num', BathAccess.PRIVATE, 2),
  bath('com-none', BathAccess.PRIVATE, undefined),
  bath('com-weird', BathAccess.PRIVATE, 'Sin Cargo'),
];

const ids = (bs: Bath[]) => bs.map((b) => b._id);

describe('costCategory', () => {
  const c = (cost: unknown, source?: BathSource) =>
    costCategory({ cost, source } as Bath);

  it('trata "Sin cargo" como gratis', () => {
    expect(c('Sin cargo')).toBe('free');
    expect(c('Sin cargo', BathSource.OPENSTREETMAP)).toBe('free');
  });

  it('sin costo: gratis si es de la comunidad, pago si viene de OSM', () => {
    expect(c(undefined)).toBe('free');
    expect(c(null, BathSource.COMMUNITY)).toBe('free');
    expect(c(undefined, BathSource.OPENSTREETMAP)).toBe('paid');
  });

  it('trata "Con consumicion" y un precio numérico como pago', () => {
    expect(c('Con consumicion')).toBe('paid');
    expect(c(0.5)).toBe('paid');
  });

  it('deja como desconocido un string que no reconoce', () => {
    expect(c('Sin Cargo')).toBe('unknown');
  });
});

describe('filterBaths', () => {
  it('sin filtros devuelve la misma lista', () => {
    expect(filterBaths(BATHS, 'all', 'all')).toBe(BATHS);
  });

  it('filtra por tipo de acceso', () => {
    expect(ids(filterBaths(BATHS, 'public', 'all'))).toEqual([
      'pub-free',
      'pub-none',
      'pub-num',
      'osm-fee',
    ]);
    expect(ids(filterBaths(BATHS, 'private', 'all'))).toHaveLength(5);
  });

  it('aplica el precio sobre todos los tipos', () => {
    expect(ids(filterBaths(BATHS, 'all', 'free'))).toEqual([
      'pub-free',
      'pub-none',
      'com-free',
      'com-none',
    ]);
    expect(ids(filterBaths(BATHS, 'all', 'paid'))).toEqual([
      'pub-num',
      'osm-fee',
      'com-cons',
      'com-num',
    ]);
  });

  it('combina acceso y precio', () => {
    expect(ids(filterBaths(BATHS, 'private', 'paid'))).toEqual([
      'com-cons',
      'com-num',
    ]);
    expect(ids(filterBaths(BATHS, 'public', 'free'))).toEqual([
      'pub-free',
      'pub-none',
    ]);
  });

  it('un costo desconocido sólo aparece en "Todos"', () => {
    expect(ids(filterBaths(BATHS, 'private', 'all'))).toContain('com-weird');
    expect(ids(filterBaths(BATHS, 'private', 'free'))).not.toContain('com-weird');
    expect(ids(filterBaths(BATHS, 'private', 'paid'))).not.toContain('com-weird');
  });
});
