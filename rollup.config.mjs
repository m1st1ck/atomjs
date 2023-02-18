import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/index.ts",
    plugins: [
      typescript(),
      babel({
        extensions: [".ts"],
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      terser(),
    ],
    output: {
      dir: "dist",
      format: "es",
      exports: "named",
      sourcemap: true,
      strict: false,
    },
  },
  // // UMD
  {
    input: "src/index.ts",
    plugins: [
      typescript(),
      babel({
        extensions: [".ts"],
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      terser(),
    ],
    output: {
      dir: "dist",
      format: "umd",
      name: "atomjs",
      indent: false,
    },
  },
];
