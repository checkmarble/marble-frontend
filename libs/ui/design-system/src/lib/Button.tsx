/* eslint-disable-next-line */
export interface ButtonProps
  extends Omit<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'className'
  > {}

export function Button({ ...props }: ButtonProps) {
  return (
    <button
      className="hover:bg-green-110 flex flex-row items-center gap-1 rounded bg-green-100 py-2 px-4 text-base font-semibold text-white disabled:bg-green-50"
      {...props}
    />
  );
}

export default Button;
