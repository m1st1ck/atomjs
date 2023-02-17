import { atom } from "../src/index";

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
let primitiveAtom = atom<
  string | number | bigint | boolean | undefined | symbol | null
>(0);

describe("Atoms - primitive", () => {
  beforeEach(() => {
    primitiveAtom = atom<
      string | number | bigint | boolean | undefined | symbol | null
    >(0);
  });

  test("init", () => {
    expect(primitiveAtom.getState()).toBe(0);
  });

  test("setState", () => {
    expect(primitiveAtom.getState()).toBe(0);

    primitiveAtom.setState("Stad");
    expect(primitiveAtom.getState()).toBe("Stad");

    primitiveAtom.setState(15);
    expect(primitiveAtom.getState()).toBe(15);

    primitiveAtom.setState(0);
    expect(primitiveAtom.getState()).toBe(0);

    primitiveAtom.setState(BigInt("0o377777777777777777"));
    expect(primitiveAtom.getState()).toBe(BigInt("0o377777777777777777"));

    primitiveAtom.setState(true);
    expect(primitiveAtom.getState()).toBe(true);

    primitiveAtom.setState(false);
    expect(primitiveAtom.getState()).toBe(false);

    primitiveAtom.setState(undefined);
    expect(primitiveAtom.getState()).toBe(undefined);

    const symbol = Symbol();
    primitiveAtom.setState(symbol);
    expect(primitiveAtom.getState()).toBe(symbol);

    primitiveAtom.setState(null);
    expect(primitiveAtom.getState()).toBe(null);
  });

  test("setState(Fn)", () => {
    primitiveAtom.setState((prevState) => {
      expect(prevState).toBe(0);
      return 15;
    });
    expect(primitiveAtom.getState()).toBe(15);

    primitiveAtom.setState((prevState) => {
      expect(prevState).toBe(15);
      return undefined;
    });
    expect(primitiveAtom.getState()).toBe(undefined);

    primitiveAtom.setState((prevState) => {
      expect(prevState).toBe(undefined);
      return null;
    });
    expect(primitiveAtom.getState()).toBe(null);
  });

  test("reset atom", () => {
    primitiveAtom.setState(15);
    expect(primitiveAtom.getState()).toBe(15);
    primitiveAtom.reset();
    expect(primitiveAtom.getState()).toBe(0);
  });

  test("subscribe atom", () => {
    const listener = jest.fn();
    primitiveAtom.subscribe(listener);
    primitiveAtom.setState(15);
    expect(listener).toHaveBeenCalledTimes(1);
    primitiveAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    primitiveAtom.setState(undefined);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("unsubscribe atom", () => {
    const listener = jest.fn();
    const unsub = primitiveAtom.subscribe(listener);
    unsub();
    primitiveAtom.setState(15);
    expect(listener).toHaveBeenCalledTimes(0);
    primitiveAtom.reset();
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test("multiple subscriptions atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    primitiveAtom.subscribe(listener);
    primitiveAtom.subscribe(listener2);
    primitiveAtom.setState(15);
    primitiveAtom.subscribe(listener3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    primitiveAtom.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  test("multiple subscriptions with unsub atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const unsub = primitiveAtom.subscribe(listener);
    primitiveAtom.subscribe(listener2);
    primitiveAtom.setState(15);
    primitiveAtom.subscribe(listener3);
    unsub();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    primitiveAtom.reset();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  test("multiple subscriptions with inner unsub atom", () => {
    const listener = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const unsub = primitiveAtom.subscribe(() => {
      listener();
      unsub();
    });
    primitiveAtom.subscribe(listener2);
    primitiveAtom.setState(15);
    primitiveAtom.subscribe(listener3);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(0);
    primitiveAtom.reset();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
  });
});

describe("Atoms - object", () => {
  beforeEach(() => {
    userAtom = atom<UserAtom>(getUserState());
  });

  test("init", () => {
    expect(userAtom.getState()).toMatchObject(getUserState());
  });

  test("setState", () => {
    userAtom.setState({ name: "Stad" });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: undefined });

    userAtom.setState({ age: 21 });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });

    userAtom.setState({});
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });

    expect(userAtom.setState).toThrow(
      "atom.setState cannot be used without arguments"
    );
  });

  test("setState(Fn)", () => {
    userAtom.setState((prevState) => {
      expect(prevState).toMatchObject({ name: undefined, age: undefined });
      return { name: "Stad", age: 0 };
    });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 0 });

    userAtom.setState((prevState) => {
      expect(prevState).toMatchObject({ name: "Stad" });
      return { ...prevState, age: 21 };
    });
    expect(userAtom.getState()).toMatchObject({ name: "Stad", age: 21 });
  });

  test("reset", () => {
    userAtom.setState({ name: "Stad" });
    userAtom.reset();
    expect(userAtom.getState()).toMatchObject({
      name: undefined,
      age: undefined,
    });
  });
});

describe("Atoms - array", () => {
  beforeEach(() => {
    usersAtom = atom<UserAtom[]>([getUserState(), getUserState()]);
  });

  test("init", () => {
    expect(usersAtom.getState()).toMatchObject([
      getUserState(),
      getUserState(),
    ]);
  });

  test("setState", () => {
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

    usersAtom.setState([{ name: "Stad2", age: 22 }]);

    expect(usersAtom.getState()).toMatchObject([{ name: "Stad2", age: 22 }]);
  });

  test("setState(Fn)", () => {
    usersAtom.setState(() => [{ name: "Stad", age: 22 }]);
    expect(usersAtom.getState()).toMatchObject([{ name: "Stad", age: 22 }]);

    usersAtom.setState((prev) => [...prev, { name: "Stad", age: 23 }]);
    expect(usersAtom.getState()).toMatchObject([
      { name: "Stad", age: 22 },
      { name: "Stad", age: 23 },
    ]);
  });

  test("reset", () => {
    usersAtom.setState([{ name: "Stad", age: 22 }]);
    expect(usersAtom.getState()).toMatchObject([{ name: "Stad", age: 22 }]);
    usersAtom.reset();
    expect(usersAtom.getState()).toMatchObject([
      getUserState(),
      getUserState(),
    ]);
  });
});
