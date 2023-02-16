export function HiddenInputs<
  Props extends Record<
    string,
    React.InputHTMLAttributes<HTMLInputElement>['value']
  >
>(props: Props) {
  return (
    <>
      {Object.entries(props).map(([name, value]) => (
        <input hidden readOnly key={name} id={name} name={name} value={value} />
      ))}
    </>
  );
}

export default HiddenInputs;
