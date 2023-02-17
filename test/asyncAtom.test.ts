import { asyncAtom, AsyncState, defaultAsyncState } from "../src/index";

type UserAtom = {
  name: string | undefined;
  age: number | undefined;
};

const getUserState = () => ({
  name: undefined,
  age: undefined,
});

const CleanAsyncState: AsyncState = {
  init: false,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
};

let userAsyncAtom = asyncAtom<UserAtom>(getUserState());
let primitiveAsyncAtom = asyncAtom<
  string | number | bigint | boolean | undefined | symbol | null
>(0);

describe("AsyncAtoms - primitive", () => {
  beforeEach(() => {
    primitiveAsyncAtom = asyncAtom<
      string | number | bigint | boolean | undefined | symbol | null
    >(0);
  });

  test("init", () => {
    const [state, asyncState] = primitiveAsyncAtom.getState();
    expect(state).toEqual(0);
    expect(asyncState).toMatchObject(defaultAsyncState);
    expect(primitiveAsyncAtom.getCoreState()).toEqual(0);
    expect(primitiveAsyncAtom.getAsyncState()).toMatchObject(defaultAsyncState);
  });

  test("setState", () => {
    primitiveAsyncAtom.setState("Stad");
    expect(primitiveAsyncAtom.getCoreState()).toEqual("Stad");

    primitiveAsyncAtom.setState(undefined);
    expect(primitiveAsyncAtom.getCoreState()).toEqual(undefined);

    primitiveAsyncAtom.setState(null);
    expect(primitiveAsyncAtom.getCoreState()).toEqual(null);

    expect(primitiveAsyncAtom.setState).toThrow(
      "atom.setState cannot be used without arguments"
    );
  });

  test("setAsyncState", () => {
    primitiveAsyncAtom.setAsyncState({ loaded: true });
    expect(primitiveAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loaded: true,
    });

    primitiveAsyncAtom.setAsyncState("loading");
    expect(primitiveAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loading: true,
    });

    primitiveAsyncAtom.setAsyncState("loaded");
    expect(primitiveAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loaded: true,
    });

    expect(primitiveAsyncAtom.getCoreState()).toEqual(0);

    expect(primitiveAsyncAtom.setAsyncState).toThrow(
      "atom.setState cannot be used without arguments"
    );

    primitiveAsyncAtom.setAsyncState({}, 22);
    expect(primitiveAsyncAtom.getState()).toMatchObject([22, CleanAsyncState]);

    primitiveAsyncAtom.setAsyncState({}, 0);
    expect(primitiveAsyncAtom.getState()).toMatchObject([0, CleanAsyncState]);

    primitiveAsyncAtom.setAsyncState({}, null);
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      null,
      CleanAsyncState,
    ]);

    primitiveAsyncAtom.setAsyncState({}, undefined);
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      null,
      CleanAsyncState,
    ]);
  });

  test("setAsyncState(Fn)", () => {
    primitiveAsyncAtom.setAsyncState((prevState) => {
      expect(prevState).toMatchObject({
        ...CleanAsyncState,
        init: true,
      });
      return { error: true, errorMessage: "404" };
    });
    expect(primitiveAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      error: true,
      errorMessage: "404",
    });

    primitiveAsyncAtom.setAsyncState((prevState) => {
      expect(prevState).toMatchObject({
        ...CleanAsyncState,
        error: true,
        errorMessage: "404",
      });
      return { loaded: true };
    }, "Stad");
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      "Stad",
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);

    primitiveAsyncAtom.setAsyncState({}, (prevState) => {
      expect(prevState).toEqual("Stad");
      return undefined;
    });
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      undefined,
      CleanAsyncState,
    ]);

    primitiveAsyncAtom.setAsyncState(
      (prevState) => {
        expect(prevState).toMatchObject(CleanAsyncState);
        return { loading: true };
      },
      (prev) => {
        expect(prev).toEqual(undefined);
        return 21;
      }
    );
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      21,
      {
        ...CleanAsyncState,
        loading: true,
      },
    ]);
  });

  test("reset asyncAtom", () => {
    primitiveAsyncAtom.setAsyncState({ loaded: true }, "Stad");
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      "Stad",
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);
    primitiveAsyncAtom.reset();
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      0,
      {
        ...CleanAsyncState,
        init: true,
      },
    ]);

    primitiveAsyncAtom.setAsyncState(
      { error: true, errorMessage: "404" },
      "Stad"
    );
    primitiveAsyncAtom.reset({ loaded: true });
    expect(primitiveAsyncAtom.getState()).toMatchObject([
      0,
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);
  });

  test("subscribe asyncAtom", () => {
    const listener = jest.fn();
    primitiveAsyncAtom.subscribe(listener);
    primitiveAsyncAtom.setState("Stad");
    expect(listener).toHaveBeenCalledTimes(1);
    primitiveAsyncAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    primitiveAsyncAtom.setAsyncState({ loaded: true }, "Stad");
    expect(listener).toHaveBeenCalledTimes(3);
    primitiveAsyncAtom.getCoreState();
    primitiveAsyncAtom.getAsyncState();
    primitiveAsyncAtom.getState();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("unsubscribe asyncAtom", () => {
    const listener = jest.fn();
    const unsub = primitiveAsyncAtom.subscribe(listener);
    unsub();
    primitiveAsyncAtom.setState("Stad");
    expect(listener).toHaveBeenCalledTimes(0);
    primitiveAsyncAtom.reset();
    expect(listener).toHaveBeenCalledTimes(0);
    primitiveAsyncAtom.setAsyncState({ loaded: true }, "Stad");
    expect(listener).toHaveBeenCalledTimes(0);
  });
});

describe("AsyncAtoms - object", () => {
  beforeEach(() => {
    userAsyncAtom = asyncAtom<UserAtom>(getUserState());
  });

  test("init", () => {
    const [state, asyncState] = userAsyncAtom.getState();
    expect(state).toMatchObject(getUserState());
    expect(asyncState).toMatchObject(defaultAsyncState);
    expect(userAsyncAtom.getCoreState()).toMatchObject(getUserState());
    expect(userAsyncAtom.getAsyncState()).toMatchObject(defaultAsyncState);
  });

  test("setState", () => {
    userAsyncAtom.setState({ name: "Stad" });
    expect(userAsyncAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: undefined,
    });

    userAsyncAtom.setState({ age: 21 });
    expect(userAsyncAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: 21,
    });

    userAsyncAtom.setState({});
    expect(userAsyncAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: 21,
    });

    expect(userAsyncAtom.setState).toThrow(
      "atom.setState cannot be used without arguments"
    );
  });

  test("setAsyncState", () => {
    userAsyncAtom.setAsyncState({ loaded: true });
    expect(userAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loaded: true,
    });

    userAsyncAtom.setAsyncState("loading");
    expect(userAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loading: true,
    });

    userAsyncAtom.setAsyncState("loaded");
    expect(userAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      loaded: true,
    });

    expect(userAsyncAtom.getCoreState()).toMatchObject({
      name: undefined,
      age: undefined,
    });

    expect(userAsyncAtom.setAsyncState).toThrow(
      "atom.setState cannot be used without arguments"
    );

    userAsyncAtom.setAsyncState({}, { age: 22 });
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: 22,
      },
      CleanAsyncState,
    ]);
  });

  test("setAsyncState(Fn)", () => {
    userAsyncAtom.setAsyncState((prevState) => {
      expect(prevState).toMatchObject({
        ...CleanAsyncState,
        init: true,
      });
      return { error: true, errorMessage: "404" };
    });
    expect(userAsyncAtom.getAsyncState()).toMatchObject({
      ...CleanAsyncState,
      error: true,
      errorMessage: "404",
    });

    userAsyncAtom.setAsyncState(
      (prevState) => {
        expect(prevState).toMatchObject({
          ...CleanAsyncState,
          error: true,
          errorMessage: "404",
        });
        return { loaded: true };
      },
      { name: "Stad" }
    );
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: "Stad",
        age: undefined,
      },
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);

    userAsyncAtom.setAsyncState(
      (prevState) => {
        expect(prevState).toMatchObject({
          ...CleanAsyncState,
          loaded: true,
        });
        return { loading: true };
      },
      (prev) => {
        expect(prev).toMatchObject({
          name: "Stad",
          age: undefined,
        });
        return {
          ...prev,
          age: 21,
        };
      }
    );
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: "Stad",
        age: 21,
      },
      {
        ...CleanAsyncState,
        loading: true,
      },
    ]);
  });

  test("reset asyncAtom", () => {
    userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: "Stad",
        age: undefined,
      },
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);
    userAsyncAtom.reset();
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: undefined,
      },
      {
        ...CleanAsyncState,
        init: true,
      },
    ]);

    userAsyncAtom.setAsyncState(
      { error: true, errorMessage: "404" },
      { name: "Stad" }
    );
    userAsyncAtom.reset({ loaded: true });
    expect(userAsyncAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: undefined,
      },
      {
        ...CleanAsyncState,
        loaded: true,
      },
    ]);
  });

  test("subscribe asyncAtom", () => {
    const listener = jest.fn();
    userAsyncAtom.subscribe(listener);
    userAsyncAtom.setState({ name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(1);
    userAsyncAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(3);
    userAsyncAtom.getCoreState();
    userAsyncAtom.getAsyncState();
    userAsyncAtom.getState();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("unsubscribe asyncAtom", () => {
    const listener = jest.fn();
    const unsub = userAsyncAtom.subscribe(listener);
    unsub();
    userAsyncAtom.setState({ name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(0);
    userAsyncAtom.reset();
    expect(listener).toHaveBeenCalledTimes(0);
    userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(0);
  });
});
