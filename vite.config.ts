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
      fileName: () => 'index.js',
    },
    modulePreload: true,
    rollupOptions: {
      external: [
        "@metapages/metapage",
        "@metapages/hash-query",
        "@sillsdev/docu-notion",
        'tslib',
        'node-fetch',
      ],
      output: {
        chunkFileNames: '[name].js',
        preserveModules: true,
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
