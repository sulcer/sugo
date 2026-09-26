import type { LaunchOptions } from '@playwright/test';

/**
 * Headless Chromium renders WebGL only through SwiftShader. It is slow, so only the tests that
 * exercise the 3D scenes opt in: `test.use({ launchOptions: WEBGL })` (other tests see the drawings).
 */
export const WEBGL: LaunchOptions = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
