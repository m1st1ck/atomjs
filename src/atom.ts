export type Listener = () => void;
export type Subscribe = (listener: Listener) => Unsubscribe;
export type Unsubscribe = () => void;
export type Notify = () => void;
export type GetState<T> = () => T;
export type SetStateFuncArg<T> = (currentState: T) => T;
export type NewState<T> = Partial<T> | SetStateFuncArg<T>;
export type SetState<T> = (nState: NewState<T>) => void;
export type Reset = () => void;
export type AtomCore<T> = {
  subscribe: Subscribe;
  notify: Notify;
  getState: GetState<T>;
  setState: SetState<T>;
  reset: Reset;
};
export type Atom<T> = {
  subscribe: Subscribe;
  getState: GetState<T>;
  setState: SetState<T>;
  reset: Reset;
};

export type AsyncStateValue = "init" | "loading" | "loaded" | "error";

export type AsyncState = {
  init: boolean;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  errorMessage?: string;
};

export type SetAsyncStateFuncArg = (
  currentAsyncState: AsyncState
) => Partial<AsyncState>;

export type SetAsyncState<T> = (
  nAsyncState: AsyncStateValue | Partial<AsyncState> | SetAsyncStateFuncArg,
  nState?: NewState<T>
) => void;

export type GetAsyncState<T> = () => [T, AsyncState];
export type ResetAsync = (asyncState?: Partial<AsyncState>) => void;

export type AsyncAtom<T> = {
  subscribe: Subscribe;
  setState: SetState<T>;
  getCoreState: GetState<T>;
  getAsyncState: () => AsyncState;
  getState: GetAsyncState<T>;
  setAsyncState: SetAsyncState<T>;
  reset: ResetAsync;
};

export const defaultAsyncState: AsyncState = {
  init: true,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
};

function isObject(a: any) {
  return !!a && a.constructor === Object;
}

function atomCore<T>(defaultState: T): AtomCore<T> {
  let currentState = defaultState;

  let listeners: Listener[] = [];
  let nextListeners = listeners;

  /**
   * This makes a shallow copy of listeners so we can use
   * nextListeners as a temporary list while notifying.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a notify.
   */
  function ensureCanMutateNextListeners() {
    if (nextListeners === listeners) {
      nextListeners = listeners.slice();
    }
  }

  function subscribe(listener: Listener) {
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function.");
    }

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return () => {
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  function notify() {
    listeners = nextListeners;
    listeners.forEach((listener) => listener());
  }

  function setState(nState: NewState<T>) {
    if (arguments.length === 0) {
      throw new Error("atom.setState cannot be used without arguments");
    }

    if (typeof nState === "function") {
      currentState = (nState as SetStateFuncArg<T>)(currentState);
    } else if (isObject(nState)) {
      currentState = { ...currentState, ...nState };
    } else {
      currentState = nState as T;
    }

    notify();
  }

  function getState() {
    return currentState;
  }

  function reset() {
    setState(defaultState);
  }

  return {
    subscribe,
    notify,
    setState,
    getState,
    reset,
  };
}

export function atom<T>(defaultState: T): Atom<T> {
  const _atomCore = atomCore(defaultState);

  return {
    subscribe: _atomCore.subscribe,
    getState: _atomCore.getState,
    setState: _atomCore.setState,
    reset: _atomCore.reset,
  };
}

export function asyncAtom<T>(defaultState: T): AsyncAtom<T> {
  const _atomCore = atomCore(defaultState);
  let currentAsyncState = defaultAsyncState;

  function setAsyncState(
    nAsyncState: AsyncStateValue | Partial<AsyncState> | SetAsyncStateFuncArg,
    nState?: NewState<T>
  ) {
    if (arguments.length === 0) {
      throw new Error("atom.setState cannot be used without arguments");
    }

    if (typeof nAsyncState === "string") {
      currentAsyncState = {
        ...defaultAsyncState,
        init: false,
        [nAsyncState]: true,
      };
    } else if (typeof nAsyncState === "function") {
      currentAsyncState = {
        ...defaultAsyncState,
        init: false,
        ...(nAsyncState as SetAsyncStateFuncArg)(currentAsyncState),
      };
    } else {
      currentAsyncState = {
        ...defaultAsyncState,
        init: false,
        ...nAsyncState,
      };
    }

    if (arguments.length === 2) {
      _atomCore.setState(nState!);
    } else {
      _atomCore.notify();
    }
  }

  function getAsyncState() {
    return currentAsyncState;
  }

  function getState(): [T, AsyncState] {
    return [_atomCore.getState(), currentAsyncState];
  }

  function reset(asyncState: Partial<AsyncState> = defaultAsyncState) {
    currentAsyncState = {
      ...defaultAsyncState,
      init: false,
      ...asyncState,
    };

    _atomCore.reset();
  }

  return {
    subscribe: _atomCore.subscribe,
    setState: _atomCore.setState,
    getCoreState: _atomCore.getState,
    getAsyncState,
    getState,
    setAsyncState,
    reset,
  };
}
