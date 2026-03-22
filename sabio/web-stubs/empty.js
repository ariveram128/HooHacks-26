// Stub for native-only modules when bundling for web
module.exports = new Proxy(
  {},
  {
    get: () => {
      const noop = () => {};
      noop.default = noop;
      return noop;
    },
  }
);
