import typescript from 'rollup-plugin-typescript2';

export default [
  // CommonJS build
  {
    input: 'js/src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: 'js/tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            module: 'ES2020',
            target: 'ES2020'
          }
        }
      })
    ],
    external: [] // Add external dependencies here if needed
  },
  // ESM build
  {
    input: 'js/src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: 'js/tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            module: 'ES2020',
            target: 'ES2020',
            declaration: false // Only generate declarations once
          }
        }
      })
    ],
    external: [] // Add external dependencies here if needed
  }
];