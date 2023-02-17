export type Listener = () => void;
export type Subscribe = (listener: Listener) => Unsubscribe;
export type Unsubscribe = () => void;
export type Notify = () => void;
export type GetState<T> = () => T;
export type SetStateFuncArg<T> = (currentState: T) => T;
export type SetState<T> = (nState: Partial<T> | SetStateFuncArg<T>) => void;
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

export type ObservableAtom<T> = Pick<Atom<T>, "getState" | "subscribe">;

export type GetAtomValue<ATOM> = ATOM extends ObservableAtom<infer ATOMVALUE>
  ? ATOMVALUE
  : never;

export type IterateAtomsIteratable<ATOMSTUPLE> = {
  [INDEX in keyof ATOMSTUPLE]: GetAtomValue<ATOMSTUPLE[INDEX]>;
};

const isObject = (a: any) => !!a && a.constructor === Object;

const atomCore = <T>(defaultState: T): AtomCore<T> => {
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
  const ensureCanMutateNextListeners = () => {
    if (nextListeners === listeners) {
      nextListeners = listeners.slice();
    }
  };

  const subscribe: Subscribe = (listener) => {
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
  };

  const notify: Notify = () => {
    listeners = nextListeners;
    listeners.forEach((listener) => listener());
  };

  const setState: SetState<T> = (nState) => {
    if (typeof nState === "function") {
      currentState = (nState as SetStateFuncArg<T>)(currentState);
    } else if (isObject(nState)) {
      currentState = { ...currentState, ...nState };
    } else {
      currentState = nState as T;
    }

    notify();
  };

  const getState: GetState<T> = () => currentState;

  const reset: Reset = () => setState(defaultState);

  return {
    subscribe,
    notify,
    setState,
    getState,
    reset,
  };
};

export const atom = <T>(defaultState: T): Atom<T> => {
  const _atomCore = atomCore(defaultState);

  return {
    subscribe: _atomCore.subscribe,
    getState: _atomCore.getState,
    setState: _atomCore.setState,
    reset: _atomCore.reset,
  };
};

export type HttpState = {
  init: boolean;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  errorMessage?: string;
};

export type SetHttpStateFuncArg = (
  currentHttpState: HttpState
) => Partial<HttpState>;
export type SetHttpState<T> = (
  nHttpState: Partial<HttpState> | SetHttpStateFuncArg,
  nState?: Partial<T> | SetStateFuncArg<T>
) => void;
export type GetHttpState<T> = () => [T, HttpState];
export type ResetHttp = (httpState?: Partial<HttpState>) => void;

export const defaultHttpState: HttpState = {
  init: true,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
};

export const httpAtom = <T>(defaultState: T) => {
  const _atomCore = atomCore(defaultState);
  let currentHttpState = defaultHttpState;

  const setState = (nHttpState: Partial<HttpState> | SetHttpStateFuncArg) => {
    if (typeof nHttpState === "function") {
      currentHttpState = {
        ...defaultHttpState,
        init: false,
        ...(nHttpState as SetHttpStateFuncArg)(currentHttpState),
      };
    } else {
      currentHttpState = {
        ...defaultHttpState,
        init: false,
        ...nHttpState,
      };
    }
  };

  const setHttpState: SetHttpState<T> = (nHttpState, nState) => {
    setState(nHttpState);

    if (nState !== undefined) {
      _atomCore.setState(nState);
    } else {
      _atomCore.notify();
    }
  };

  const getHttpState = () => currentHttpState;
  const getState: GetHttpState<T> = () => [
    _atomCore.getState(),
    currentHttpState,
  ];

  const reset: ResetHttp = (httpState = defaultHttpState) => {
    setState(httpState);
    _atomCore.reset();
  };

  return {
    subscribe: _atomCore.subscribe,
    setState: _atomCore.setState,
    getCoreState: _atomCore.getState,
    getHttpState,
    getState,
    setHttpState,
    reset,
  };
};
