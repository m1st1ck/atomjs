import {
  waitForAtom,
  waitForAtoms,
  atom,
  httpAtom,
  defaultHttpState,
} from "../src/index";

type UserAtom = {
  name?: string;
};

const userAtom = atom<UserAtom>({
  name: undefined,
});

const userHttpAtom = httpAtom<UserAtom>({
  name: undefined,
});

const countAtom = atom<number>(0);

describe("Utils", () => {
  beforeEach(() => {
    userAtom.reset();
    countAtom.reset();
    userHttpAtom.reset();
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

  test("waitForAtom http", (done) => {
    setTimeout(() => {
      userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
    }, 0);

    waitForAtom(userHttpAtom, ([, { loaded }]) => loaded).then(() => {
      expect(userHttpAtom.getCoreState().name).toBe("Stad");
      expect(userHttpAtom.getHttpState()).toMatchObject({
        init: false,
        loading: false,
        loaded: true,
        error: false,
        errorMessage: undefined,
      });

      done();
    });
  });

  test("waitForAtom http stop", (done) => {
    const timeout = setTimeout(() => {
      expect(userHttpAtom.getState()[0].name).toBe(undefined);
      expect(userHttpAtom.getState()[1]).toMatchObject(defaultHttpState);
      done();
    }, 0);

    waitForAtom(
      userHttpAtom,
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

  test("waitForAtoms http", (done) => {
    setTimeout(() => {
      userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
      countAtom.setState(2);
    }, 0);

    waitForAtoms(
      [countAtom, userHttpAtom],
      ([countData, [, httpStatus]]) => httpStatus.loaded || countData === 3
    ).then(() => {
      expect(userHttpAtom.getState()[0].name).toBe("Stad");
      expect(countAtom.getState()).toBe(2);
      done();
    });
  });

  test("waitForAtoms http stop", (done) => {
    userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });

    const timeout = setTimeout(() => {
      expect(userHttpAtom.getState()[0].name).toBe("Stad");
      expect(userHttpAtom.getState()[1].loaded).toBe(true);
      expect(countAtom.getState()).toBe(0);
      done();
    }, 100);

    waitForAtoms(
      [countAtom, userHttpAtom],
      ([countData, [userData, httpStatus]]) =>
        httpStatus.loaded && userData.name === "Stad" && countData === 3
    ).then(() => {
      clearTimeout(timeout);
    });
  });
});
