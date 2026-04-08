declare module 'three/examples/jsm/loaders/OBJLoader' {
  import * as THREE from 'three';
  export class OBJLoader {
    constructor();
    load(url: string, onLoad: (object: THREE.Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(text: string): THREE.Group;
  }
}
