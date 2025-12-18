import { S as React } from "../server.js";
function createSimpleContext(name) {
  const defaultValue = /* @__PURE__ */ Symbol(`Default ${name} context value`);
  const Context = React.createContext(defaultValue);
  Context.displayName = name;
  function useValue() {
    const value = React.useContext(Context);
    if (value === defaultValue) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    if (!value) {
      throw new Error(
        `No value in ${name}Provider context. If the value is optional in this situation, try useOptional${name} instead of use${name}`
      );
    }
    return value;
  }
  function useOptionalValue() {
    const value = React.useContext(Context);
    if (value === defaultValue) {
      throw new Error(`useOptional${name} must be used within ${name}Provider`);
    }
    return value;
  }
  return { Provider: Context.Provider, useValue, useOptionalValue };
}
export {
  createSimpleContext as c
};
