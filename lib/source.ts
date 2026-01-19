import { docs } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/t',
  source: docs.toFumadocsSource(),
});

export function getPage(slug: string) {
  return source.getPage([slug]);
}

export function getPages() {
  return source.getPages();
}
