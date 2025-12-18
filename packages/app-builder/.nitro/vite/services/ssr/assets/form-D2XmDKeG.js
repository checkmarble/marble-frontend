import { s as select } from "./array-BFSjnO9c.js";
const submitOnCtrlEnter = (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    e.currentTarget.closest("form")?.requestSubmit();
  }
};
function handleSubmit(form) {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
}
const getFieldErrors = (errors) => select(
  errors,
  (e) => e.message,
  (e) => e !== void 0
);
export {
  getFieldErrors as g,
  handleSubmit as h,
  submitOnCtrlEnter as s
};
