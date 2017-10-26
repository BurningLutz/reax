import pkg      from './package.json'
import resolve  from 'rollup-plugin-node-resolve'
import babel    from 'rollup-plugin-babel'

const external = [].concat(
  Object.keys(pkg.dependencies || []),
  Object.keys(pkg.peerDependencies || [])
)

export default {
  input: './src/index.js',
  output: [{
    format: 'cjs',
    file: pkg.main,
  }, {
    format: 'es',
    file: pkg.module,
  }],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  external: external,
}
