import { Atom, Listener } from "./atom";

export type ObservableAtom<T> = Pick<Atom<T>, "getState" | "subscribe">;

export type GetAtomValue<ATOM> = ATOM extends ObservableAtom<infer ATOMVALUE>
  ? ATOMVALUE
  : never;

export type IterateAtomsIteratable<ATOMSTUPLE> = {
  [INDEX in keyof ATOMSTUPLE]: GetAtomValue<ATOMSTUPLE[INDEX]>;
};

export function waitForAtom<T>(
  atom: ObservableAtom<T>,
  selector: (atomState: T) => boolean
): Promise<void> {
  if (selector(atom.getState())) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = atom.subscribe(() => {
      if (selector(atom.getState())) {
        resolve();
        unsub();
      }
    });
  });
}

export function waitForAtoms<T extends ObservableAtom<any>[]>(
  atoms: readonly [...T],
  selector: (atomState: IterateAtomsIteratable<T>) => boolean
): Promise<void> {
  function getState() {
    return atoms.map((atom) => atom.getState());
  }
  function subscribe(cb: Listener) {
    const unsubs = atoms.map((atom) => atom.subscribe(cb));
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }

  if (selector(getState() as IterateAtomsIteratable<T>)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = subscribe(() => {
      if (selector(getState() as IterateAtomsIteratable<T>)) {
        resolve();
        unsub();
      }
    });
  });
}
