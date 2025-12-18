import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { C as COOKIE_NAME$1, P as PreferencesCookieSchema } from "./config-ut8rAdyo.js";
function assign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (key === "__proto__") continue;
      target[key] = source[key];
    }
  }
  return target;
}
var defaultConverter = {
  read: function(value) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function(value) {
    return encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    );
  }
};
function init(converter, defaultAttributes) {
  function set(name, value, attributes) {
    if (typeof document === "undefined") {
      return;
    }
    attributes = assign({}, defaultAttributes, attributes);
    if (typeof attributes.expires === "number") {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }
    name = encodeURIComponent(name).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
    var stringifiedAttributes = "";
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue;
      }
      stringifiedAttributes += "; " + attributeName;
      if (attributes[attributeName] === true) {
        continue;
      }
      stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
    }
    return document.cookie = name + "=" + converter.write(value, name) + stringifiedAttributes;
  }
  function get(name) {
    if (typeof document === "undefined" || arguments.length && !name) {
      return;
    }
    var cookies = document.cookie ? document.cookie.split("; ") : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split("=");
      var value = parts.slice(1).join("=");
      try {
        var found = decodeURIComponent(parts[0]);
        if (!(found in jar)) jar[found] = converter.read(value, found);
        if (name === found) {
          break;
        }
      } catch (_e) {
      }
    }
    return name ? jar[name] : jar;
  }
  return Object.create(
    {
      set,
      get,
      remove: function(name, attributes) {
        set(
          name,
          "",
          assign({}, attributes, {
            expires: -1
          })
        );
      },
      withAttributes: function(attributes) {
        return init(this.converter, assign({}, this.attributes, attributes));
      },
      withConverter: function(converter2) {
        return init(assign({}, this.converter, converter2), this.attributes);
      }
    },
    {
      attributes: { value: Object.freeze(defaultAttributes) },
      converter: { value: Object.freeze(converter) }
    }
  );
}
var api = init(defaultConverter, { path: "/" });
function setPreferencesCookie(key, value) {
  let current = {};
  try {
    const raw = api.get(COOKIE_NAME$1);
    if (raw) {
      current = JSON.parse(raw);
    }
  } catch {
  }
  const parsed = PreferencesCookieSchema.partial().safeParse({
    [key]: value
  });
  if (!parsed.success) {
    throw new Error("Invalid preferences cookie value");
  }
  if (value === void 0) {
    delete current[key];
  } else {
    switch (typeof value) {
      case "boolean":
        current[key] = value ? 1 : 0;
        break;
      case "string":
        current[key] = value;
        break;
      case "number":
        current[key] = value.toString();
        break;
      default:
        current[key] = JSON.stringify(value);
        break;
    }
  }
  api.set(COOKIE_NAME$1, JSON.stringify(current), {
    expires: 365,
    sameSite: "strict"
  });
}
const COOKIE_NAME = "u-prefs";
const ThemeContext = reactExports.createContext(null);
ThemeContext.displayName = "Theme";
function useTheme() {
  const context = reactExports.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const raw = api.get(COOKIE_NAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.theme === "dark" || parsed.theme === "light") {
        return parsed.theme;
      }
    }
  } catch {
  }
  return "light";
}
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
function ThemeProvider({ children, defaultTheme }) {
  const [theme, setThemeState] = reactExports.useState(() => defaultTheme ?? getInitialTheme());
  reactExports.useEffect(() => {
    applyTheme(theme);
    setPreferencesCookie("theme", theme);
  }, [theme]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setThemeState((prev) => prev === "light" ? "dark" : "light");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const setTheme = reactExports.useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);
  const toggleTheme = reactExports.useCallback(() => {
    setThemeState((prev) => prev === "light" ? "dark" : "light");
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, toggleTheme, setTheme }, children });
}
export {
  ThemeProvider as T,
  setPreferencesCookie as s,
  useTheme as u
};
