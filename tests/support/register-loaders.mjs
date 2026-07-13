// Registers the image-stub module hook for the Node test runner.
// Loaded via `tsx --import ./tests/support/register-loaders.mjs`.
import { register } from 'node:module'

register('./image-loader.mjs', import.meta.url)
