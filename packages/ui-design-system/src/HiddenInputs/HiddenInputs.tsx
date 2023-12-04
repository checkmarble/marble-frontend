export function HiddenInputs<
  Props extends Record<
    string,
    React.InputHTMLAttributes<HTMLInputElement>['value']
  >,
>(props: Props) {
  return (
    <>
      {Object.entries(props)
        /**
         * undefined value is sent as "name=&" in FormData and parsed as "" with qs on the server
         * It leads to bad DX when validating with zod so we remove them from the form
         */
        .filter(([_, value]) => value !== undefined)
        .map(([name, value]) => (
          <input
            hidden
            readOnly
            key={name}
            id={name}
            name={name}
            value={value}
          />
        ))}
    </>
  );
}
