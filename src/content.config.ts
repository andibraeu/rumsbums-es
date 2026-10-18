import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const schema = z.object({
  title: z.string(),
  description: z.string(),
});

function texte(ordner: string) {
  return defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${ordner}` }),
    schema,
  });
}

export const collections = {
  blitzarten: texte('blitzarten'),
  gewitter: texte('gewitter'),
  fotos: texte('fotos'),
};
