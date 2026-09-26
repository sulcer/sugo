import {
  BackSide,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
} from 'three';

/**
 * A soft studio for reflections: grey dome, dark floor and four light panels (a large key above,
 * fills to the sides and behind). Gives metal its satin read without any visible light source.
 */
export function createStudioEnvironment(renderer: WebGLRenderer): Texture {
  const generator = new PMREMGenerator(renderer);
  const studio = new Scene();
  const disposables: { dispose(): void }[] = [];
  const add = (mesh: Mesh<PlaneGeometry | SphereGeometry, MeshBasicMaterial>) => {
    disposables.push(mesh.geometry, mesh.material);
    studio.add(mesh);
    return mesh;
  };

  add(
    new Mesh(
      new SphereGeometry(20, 32, 16),
      new MeshBasicMaterial({ color: new Color(0.5, 0.5, 0.49), side: BackSide }),
    ),
  );
  const floor = add(
    new Mesh(new PlaneGeometry(60, 60), new MeshBasicMaterial({ color: new Color(0.16, 0.16, 0.16) })),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -6;

  const panel = (width: number, height: number, position: [number, number, number], intensity: number) => {
    const mesh = add(
      new Mesh(
        new PlaneGeometry(width, height),
        new MeshBasicMaterial({ color: new Color(intensity, intensity, intensity), side: DoubleSide }),
      ),
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
  };
  panel(14, 4, [0, 9, 6], 4.2);
  panel(4, 10, [-12, 2, 4], 2.4);
  panel(4, 10, [12, 3, -3], 1.5);
  panel(10, 3, [0, 1, -14], 1.2);

  const texture = generator.fromScene(studio, 0.035).texture;
  generator.dispose();
  disposables.forEach((item) => item.dispose());
  return texture;
}
