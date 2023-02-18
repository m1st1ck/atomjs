# AtomJS

Flexible state management

## Installation
```sh
npm i @m1st1ck/atomjs
```

```sh
yarn add @m1st1ck/atomjs
```

## Atoms

### atom\<T\>(state: T): Atom\<T\>

```javascript
import { atom } from "@m1st1ck/atomjs";

// create new atom
const countAtom = atom(0);
// change state - there is no equality check and all subscribers will be notified
countAtom.setState(2);
// change state with callback function
countAtom.setState((previousCount) => previousCount + 1);

const userAtom = atom({ name: "Stad", age: 2 });
// updating objects will merge with previous state
userAtom.setState({ age: 3 }); // { name: "Stad", age: 3 }
// update function needs to return the whole object
userAtom.setState((prevState) => ({
  ...prevState,
  age: 4,
}));
// get state
const count = countAtom.getState(); // count === 3
// listen for state updates - triggered on every atom.setState
const unsubscribe = countAtom.subscribe(() => {
  // do something with new state
  const count = countAtom.getState();
});
// stop listening for changes
unsubscribe();
// reset to default state
countAtom.reset();
```

### asyncAtom\<T\>(state: T): Atom\<T\>

contains an additional async state

```javascript
{
  init: true,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
}
```

it provides addition functionallities to manage both states

```javascript
import { asyncAtom } from "@m1st1ck/atomjs";

// create new async atom
const countAtom = asyncAtom(0);
// getState returns a tuple both states
const [count, asyncState] = countAtom.getState();
// get atom state only
const count = countAtom.getCoreState();
// get async state only
const asyncState = countAtom.getAsyncState();
// update async state - will override previus state
countAtom.setAsyncState({ loading: true }); // { loading: true, init: false, error: false, ... }
// update async state using enum - init, loading, loaded, error
countAtom.setAsyncState("loading"); // { loading: true, init: false, error: false, ... }
// update both state
countAtom.setAsyncState({ loaded: true }, 4); // count === 4
// handle errors
countAtom.setAsyncState({ error: true, errorMessage: "..." });
// reset - will reset both state and asyncState
countAtom.reset(); // ({ init: true, loading: false, ... })
// you can also provide asyncState to reset to
countAtom.reset({ loaded: true }); // ({ init: false, loaded: true, ... })
```

## Utils

### waitForAtom\<T\>(atom: ObservableAtom\<T\>, selector: (atomState: T) => boolean): Promise\<void\>

```javascript
import { asyncAtom, waitForAtom } from "@m1st1ck/atomjs";

const userAtom = asyncAtom({ name: undefined });

const fetchUser = async () => {
  const { loading } = userAtom.getAsyncState();

  // don't fetch if already fetching
  if (loading) {
    // wait for original fetch to finish
    await waitForAtom(userAtom, ([, { loaded }]) => loaded);
    // return fetch data
    return userAtom.getCoreState();
  }

  // Fetch user... and update atom
  userAtom.setAsyncState({ loaded: true }, user);
};
```

### waitForAtoms<T extends ObservableAtom\<any>\[]>(atoms: readonly [...T], selector: (atomState: IterateAtomsIteratable\<T\>) => boolean): Promise\<void\>

```javascript
import { waitForAtoms } from "@m1st1ck/atomjs";

waitForAtoms(
  [atom1, atom2],
  ([[atom1Data, atom1AsyncStatus], [atom2Data, atom2AsyncStatus]]) =>
    atom1AsyncStatus.loaded || atom1AsyncStatus.loaded
).then(() => {});
```

## React Hooks

https://github.com/m1st1ck/atomjs-react

```sh
npm i @m1st1ck/atomjs-react
```

```sh
yarn add @m1st1ck/atomjs-react
```