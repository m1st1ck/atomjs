import { atom, httpAtom, defaultHttpState } from "../src/index";

type UserAtom = {
  name: string | undefined;
  age: number | undefined;
};

const getUserState = () => ({
  name: undefined,
  age: undefined,
});

let userAtom = atom<UserAtom>(getUserState());
let usersAtom = atom<UserAtom[]>([getUserState(), getUserState()]);
let userHttpAtom = httpAtom<UserAtom>(getUserState());
let countAtom = atom<number>(0);
let testhttpAtom = httpAtom<number | null | undefined>(0);

describe("Atoms", () => {
  beforeEach(() => {
    userAtom = atom<UserAtom>(getUserState());
    usersAtom = atom<UserAtom[]>([getUserState(), getUserState()]);
    userHttpAtom = httpAtom<UserAtom>(getUserState());
    countAtom = atom<number>(0);
    testhttpAtom = httpAtom<number | null | undefined>(0);
  });

  test("init atom", () => {
    expect(countAtom.getState()).toBe(0);
    expect(usersAtom.getState()).toMatchObject([
      getUserState(),
      getUserState(),
    ]);
    expect(userAtom.getState()).toMatchObject(getUserState());
  });

  test("init httpAtom", () => {
    const [state, httpState] = userHttpAtom.getState();
    expect(state).toMatchObject(getUserState());
    expect(httpState).toMatchObject(defaultHttpState);
    expect(userHttpAtom.getCoreState()).toMatchObject(getUserState());
    expect(userHttpAtom.getHttpState()).toMatchObject(defaultHttpState);
  });

  test("setState atom", () => {
    countAtom.setState(15);
    expect(countAtom.getState()).toBe(15);

    userAtom.setState({ name: "Stad" });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: undefined });

    userAtom.setState({ age: 21 });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });

    userAtom.setState({});
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });

    // @ts-ignore
    userAtom.setState();
    expect(userAtom.getState()).toBe(undefined);

    usersAtom.setState([
      { name: "Stad", age: 22 },
      { name: "Stad", age: 21 },
      { name: "Stad", age: 20 },
    ]);
    expect(usersAtom.getState()).toMatchObject([
      { name: "Stad", age: 22 },
      { name: "Stad", age: 21 },
      { name: "Stad", age: 20 },
    ]);
  });

  test("setState httpAtom", () => {
    userHttpAtom.setState({ name: "Stad" });
    expect(userHttpAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: undefined,
    });

    userHttpAtom.setState({ age: 21 });
    expect(userHttpAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: 21,
    });

    userHttpAtom.setState({});
    expect(userHttpAtom.getCoreState()).toMatchObject({
      name: "Stad",
      age: 21,
    });

    // @ts-ignore
    userHttpAtom.setState();
    expect(userHttpAtom.getCoreState()).toBe(undefined);
  });

  test("setHttpState httpAtom", () => {
    userHttpAtom.setHttpState({ loaded: true });
    expect(userHttpAtom.getHttpState()).toMatchObject({
      init: false,
      loading: false,
      loaded: true,
      error: false,
      errorMessage: undefined,
    });
    expect(userHttpAtom.getCoreState()).toMatchObject({
      name: undefined,
      age: undefined,
    });

    // @ts-ignore
    userHttpAtom.setHttpState();
    expect(userHttpAtom.getHttpState()).toMatchObject({
      init: false,
      loading: false,
      loaded: false,
      error: false,
      errorMessage: undefined,
    });
    expect(userHttpAtom.getCoreState()).toMatchObject({
      name: undefined,
      age: undefined,
    });

    userHttpAtom.setHttpState({}, { age: 22 });
    expect(userHttpAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: 22,
      },
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    testhttpAtom.setHttpState({}, 1);
    expect(testhttpAtom.getState()).toMatchObject([
      1,
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    testhttpAtom.setHttpState({}, 0);
    expect(testhttpAtom.getState()).toMatchObject([
      0,
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    testhttpAtom.setHttpState({}, null);
    expect(testhttpAtom.getState()).toMatchObject([
      null,
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    testhttpAtom.setHttpState({}, undefined);
    expect(testhttpAtom.getState()).toMatchObject([
      null,
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    testhttpAtom.setHttpState({}, () => undefined);
    expect(testhttpAtom.getState()).toMatchObject([
      undefined,
      {
        init: false,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);
  });

  test("setState(Fn) atom", () => {
    countAtom.setState((prevState) => {
      expect(prevState).toBe(0);
      return 15;
    });
    expect(countAtom.getState()).toBe(15);

    // @ts-ignore
    userAtom.setState((prevState) => {
      expect(prevState).toMatchObject({ name: undefined, age: undefined });
      return { name: "Stad" };
    });
    expect(userAtom.getState()).toMatchObject({ name: "Stad" });

    userAtom.setState((prevState) => {
      expect(prevState).toMatchObject({ name: "Stad" });
      return { ...prevState, age: 21 };
    });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });

    usersAtom.setState(() => [{ name: "Stad", age: 22 }]);
    expect(usersAtom.getState()).toMatchObject([{ name: "Stad", age: 22 }]);

    usersAtom.setState((prev) => [...prev, { name: "Stad", age: 23 }]);
    expect(usersAtom.getState()).toMatchObject([
      { name: "Stad", age: 22 },
      { name: "Stad", age: 23 },
    ]);
  });

  test("setHttpState(Fn) httpAtom", () => {
    userHttpAtom.setHttpState((prevState) => {
      expect(prevState).toMatchObject({
        init: true,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      });
      return { error: true, errorMessage: "404" };
    });
    expect(userHttpAtom.getHttpState()).toMatchObject({
      init: false,
      loading: false,
      loaded: false,
      error: true,
      errorMessage: "404",
    });

    userHttpAtom.setHttpState(
      (prevState) => {
        expect(prevState).toMatchObject({
          init: false,
          loading: false,
          loaded: false,
          error: true,
          errorMessage: "404",
        });
        return { loaded: true };
      },
      { name: "Stad" }
    );
    expect(userHttpAtom.getState()).toMatchObject([
      {
        name: "Stad",
        age: undefined,
      },
      {
        init: false,
        loading: false,
        loaded: true,
        error: false,
        errorMessage: undefined,
      },
    ]);

    userHttpAtom.setHttpState(
      (prevState) => {
        expect(prevState).toMatchObject({
          init: false,
          loading: false,
          loaded: true,
          error: false,
          errorMessage: undefined,
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
    expect(userHttpAtom.getState()).toMatchObject([
      {
        name: "Stad",
        age: 21,
      },
      {
        init: false,
        loading: true,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);
  });

  test("reset atom", () => {
    countAtom.setState(15);
    countAtom.reset();
    expect(countAtom.getState()).toBe(0);

    userAtom.setState({ name: "Stad" });
    userAtom.reset();
    expect(userAtom.getState()).toMatchObject({
      name: undefined,
      age: undefined,
    });
  });

  test("reset httpAtom", () => {
    userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
    userHttpAtom.reset();
    expect(userHttpAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: undefined,
      },
      {
        init: true,
        loading: false,
        loaded: false,
        error: false,
        errorMessage: undefined,
      },
    ]);

    userHttpAtom.setHttpState(
      { error: true, errorMessage: "404" },
      { name: "Stad" }
    );
    userHttpAtom.reset({ loaded: true });
    expect(userHttpAtom.getState()).toMatchObject([
      {
        name: undefined,
        age: undefined,
      },
      {
        init: false,
        loading: false,
        loaded: true,
        error: false,
        errorMessage: undefined,
      },
    ]);
  });

  test("subscribe atom", () => {
    const listener = jest.fn();
    countAtom.subscribe(listener);
    countAtom.setState(15);
    expect(listener).toHaveBeenCalledTimes(1);
    countAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test("subscribe httpAtom", () => {
    const listener = jest.fn();
    userHttpAtom.subscribe(listener);
    userHttpAtom.setState({ name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(1);
    userHttpAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(3);
    userHttpAtom.getCoreState();
    userHttpAtom.getHttpState();
    userHttpAtom.getState();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("unsubscribe atom", () => {
    const listener = jest.fn();
    const unsub = countAtom.subscribe(listener);
    unsub();
    countAtom.setState(15);
    expect(listener).toHaveBeenCalledTimes(0);
    countAtom.reset();
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test("unsubscribe httpAtom", () => {
    const listener = jest.fn();
    const unsub = userHttpAtom.subscribe(listener);
    unsub();
    userHttpAtom.setState({ name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(0);
    userHttpAtom.reset();
    expect(listener).toHaveBeenCalledTimes(0);
    userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test("multiple subscriptions atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    countAtom.subscribe(listener);
    countAtom.subscribe(listener2);
    countAtom.setState(15);
    countAtom.subscribe(listener3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    countAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  test("multiple subscriptions with unsub atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const unsub = countAtom.subscribe(listener);
    countAtom.subscribe(listener2);
    countAtom.setState(15);
    countAtom.subscribe(listener3);
    unsub();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    countAtom.reset();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  test("multiple subscriptions with inner unsub atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const unsub = countAtom.subscribe(() => {
      listener();
      unsub();
    });
    countAtom.subscribe(listener2);
    countAtom.setState(15);
    countAtom.subscribe(listener3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    countAtom.reset();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });
});
