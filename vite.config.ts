import path, { resolve } from 'path';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import { defineConfig } from 'vite';

import typescript from '@rollup/plugin-typescript';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "/@": resolve(__dirname, "./src"),
    },
  },

  plugins: [],

  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },

  build: {
    outDir: "./dist",
    target: "esnext",
    emptyOutDir: true,
    sourcemap: true,
    minify: mode === "development" ? false : "esbuild",
    reportCompressedSize: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    modulePreload: true,
    rollupOptions: {
      external: [
        "@metapages/metapage",
        "@metapages/hash-query",
        'tslib',
        'node-fetch',
      ],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        globals: {
          react: "React"
        },
        preserveModules: true,
        exports: 'named'
      },
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          tsconfig: './tsconfig.json',
          declaration: true,
          declarationDir: './dist',
          exclude: ['**/*.test.ts', '**/*.test.tsx'],
          sourceMap: true,
          outDir: "dist",
        }),
      ],
    },
  },
}));
