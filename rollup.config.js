import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts'

export default [
  {
    input: `src/index.ts`,
    plugins: [dts()],
    output: {
      file: `dist/index.d.ts`,
      format: "es",
    },
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
      strict: false,
    },
    plugins: [
      typescript(),
      babel({ extensions: [".ts"], exclude: "node_modules/**" }),
      terser(),
    ],
  },
  // ES Modules
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.es.js",
      format: "es",
    },
    plugins: [typescript(), babel({ extensions: [".ts"] })],
  },

  // UMD
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.umd.min.js",
      format: "umd",
      name: "atomjs",
      indent: false,
    },
    plugins: [
      typescript(),
      babel({ extensions: [".ts"], exclude: "node_modules/**" }),
      terser(),
    ],
  },
];
