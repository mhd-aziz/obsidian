// Declaration untuk react-test-renderer (dipakai unit test ViewModel).
// Paket ini menyertakan types sejak React 19? Belum — declare minimal.
declare module 'react-test-renderer' {
  import { ReactElement } from 'react';
  export function create(element: ReactElement): ReactTestRenderer;
  export interface ReactTestRenderer {
    unmount(): void;
    toJSON(): unknown;
  }
  export function act(callback: () => void | Promise<void>): Promise<void>;
}
