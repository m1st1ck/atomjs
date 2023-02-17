import {
  waitForAtom,
  waitForAtoms,
  atom,
  asyncAtom,
  defaultAsyncState,
} from "../src/index";

type UserAtom = {
  name?: string;
};

const userAtom = atom<UserAtom>({
  name: undefined,
});

const userAsyncAtom = asyncAtom<UserAtom>({
  name: undefined,
});

const countAtom = atom<number>(0);

describe("Utils", () => {
  beforeEach(() => {
    userAtom.reset();
    countAtom.reset();
    userAsyncAtom.reset();
  });

  test("waitForAtom", (done) => {
    setTimeout(() => {
      userAtom.setState({ name: "Stad" });
    }, 0);

    waitForAtom(userAtom, (data) => data.name === "Stad").then(() => {
      expect(userAtom.getState().name).toBe("Stad");
      done();
    });
  });

  test("waitForAtom stop", (done) => {
    const timeout = setTimeout(() => {
      expect(userAtom.getState().name).toBe(undefined);
      done();
    }, 0);

    waitForAtom(userAtom, ({ name }) => name === "Stad").then(() => {
      clearTimeout(timeout);
    });
  });

  test("waitForAtom async", (done) => {
    setTimeout(() => {
      userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });
    }, 0);

    waitForAtom(userAsyncAtom, ([, { loaded }]) => loaded).then(() => {
      expect(userAsyncAtom.getCoreState().name).toBe("Stad");
      expect(userAsyncAtom.getAsyncState()).toMatchObject({
        init: false,
        loading: false,
        loaded: true,
        error: false,
        errorMessage: undefined,
      });

      done();
    });
  });

  test("waitForAtom async stop", (done) => {
    const timeout = setTimeout(() => {
      expect(userAsyncAtom.getState()[0].name).toBe(undefined);
      expect(userAsyncAtom.getState()[1]).toMatchObject(defaultAsyncState);
      done();
    }, 0);

    waitForAtom(
      userAsyncAtom,
      ([{ name }, { loaded }]) => name === "Stad" && loaded
    ).then(() => {
      clearTimeout(timeout);
    });
  });

  test("waitForAtoms", (done) => {
    userAtom.setState({ name: "Stad" });
    countAtom.setState(3);

    waitForAtoms(
      [userAtom, countAtom],
      ([{ name }, count]) => name === "Stad" && count === 3
    ).then(() => {
      expect(userAtom.getState().name).toBe("Stad");
      expect(countAtom.getState()).toBe(3);
      done();
    });
  });

  test("waitForAtoms async", (done) => {
    setTimeout(() => {
      userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });
      countAtom.setState(2);
    }, 0);

    waitForAtoms(
      [countAtom, userAsyncAtom],
      ([countData, [, asyncStatus]]) => asyncStatus.loaded || countData === 3
    ).then(() => {
      expect(userAsyncAtom.getState()[0].name).toBe("Stad");
      expect(countAtom.getState()).toBe(2);
      done();
    });
  });

  test("waitForAtoms async stop", (done) => {
    userAsyncAtom.setAsyncState({ loaded: true }, { name: "Stad" });

    const timeout = setTimeout(() => {
      expect(userAsyncAtom.getState()[0].name).toBe("Stad");
      expect(userAsyncAtom.getState()[1].loaded).toBe(true);
      expect(countAtom.getState()).toBe(0);
      done();
    }, 100);

    waitForAtoms(
      [countAtom, userAsyncAtom],
      ([countData, [userData, asyncStatus]]) =>
        asyncStatus.loaded && userData.name === "Stad" && countData === 3
    ).then(() => {
      clearTimeout(timeout);
    });
  });
});
