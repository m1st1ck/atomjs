# AtomJS

### Flexible state management

## Atoms

### atom(state): Atom

```javascript
import { atom } from "atomjs";

// create new atom
const countAtom = atom(0);
// change state
countAtom.setState(2);
// change state with callback function
countAtom.setState((previousCount) => previousCount + 1);

const userAtom = atom({ name: "Stad", age: 2 });
// updating objects directly will merge with previous state
userAtom.setState({ age: 3 }); // { name: "Stad", age: 3 }
// using update function needs to provide the whole object
userAtom.setState((prevState) => ({
  ...prevState,
  age: 4,
}));
// get state
const count = countAtom.getState(); // count === 3
// listen for changes to state
const unsubscribe = countAtom.subscribe(() => {
  // do something with new state
  const count = countAtom.getState();
});
// stop listening for changes
unsubscribe();
// reset to default state
countAtom.reset();
```

### httpAtom(state): Atom

contains an additional http state

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
import { httpAtom } from "atomjs";

// create new http atom
const countAtom = httpAtom(0);
// getState returns a tuple both states
const [count, httpState] = countAtom.getState();
// get atom state only
const count = countAtom.getCoreState();
// get http state only
const httpState = countAtom.getHttpState();
// update http state - will override previus state
countAtom.setHttpState({ loading: true }); // { loading: true, init: false, error: false, ... }
// update both state
countAtom.setHttpState({ loaded: true }, 4); // count === 4
// handle errors
countAtom.setHttpState({ error: true, errorMessage: "..." });
// reset - will reset both state and httpState
countAtom.reset(); // ({ init: true, loading: false, ... })
// you can also provide httpState to reset to
countAtom.reset({ loaded: true }); // ({ init: false, loaded: true, ... })
```

## Hooks

### useAtom(Atom): state

```javascript
import { httpAtom, atom, useAtom } from "atomjs";

const nameAtom = httpAtom("Stad");
const countAtom = atom(0);
// listen for state changes and rerender component
const [name, { loading }] = useAtom(nameAtom);
const count = useAtom(countAtom);
```

## Utils

### waitForAtom(atom, selector): Promise

```javascript
import { httpAtom, waitForAtom } from "../src/.";

const userAtom = httpAtom({ name: undefined });

const fetchUser = async () => {
  const { loading } = userAtom.getHttpState();

  // don't fetch if already fetching
  if (loading) {
    // wait for original fetch to finish
    await waitForAtom(userAtom, ([, { loaded }]) => loaded);
    // return fetch data
    return userAtom.getCoreState();
  }

  // Fetch user... and update atom
  userAtom.setHttpState({ loaded: true }, user);
};
```

### waitForAtoms([atom], selector): Promise

```javascript
import { waitForAtoms } from "../src/.";

waitForAtoms(
  [atom1, atom2],
  ([[atom1Data, atom1HttpStatus], [atom2Data, atom2HttpStatus]]) =>
    atom1HttpStatus.loaded || atom1HttpStatus.loaded
).then(() => {});
```
