import { resolveProductImageUrlAsync } from '../src/services/productImageResolver.js';

const samples = [
  'iffco-urea',
  'iffco-dap',
  'coromandel-gromor-dap',
  'coromandel-gromor-10-26-26',
  'coromandel-gromor-mop',
  'nfl-urea',
];

for (const id of samples) {
  const url = await resolveProductImageUrlAsync({ id, type: 'fertilizer' });
  console.log(id, '->', url?.slice(0, 90) ?? 'none');
}
