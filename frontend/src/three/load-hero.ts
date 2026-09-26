/** The hero's 3D code, split into its own chunks and fetched only once the hero needs it. */
export async function loadHeroThree() {
  const [scene, machining, spin] = await Promise.all([
    import('./model-scene'),
    import('./machining/simulate'),
    import('./spin'),
  ]);
  return {
    createModelScene: scene.createModelScene,
    renderStill: scene.renderStill,
    runMachining: machining.runMachining,
    startSpin: spin.startSpin,
  };
}
