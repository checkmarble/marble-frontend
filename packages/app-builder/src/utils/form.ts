export const submitOnBlur: React.FocusEventHandler<
  HTMLInputElement | HTMLTextAreaElement
> = (event) => {
  if (event.currentTarget.value !== event.currentTarget.defaultValue) {
    event.currentTarget.form?.requestSubmit();
  }
};
