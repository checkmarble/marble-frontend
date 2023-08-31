import { type Validation } from '@app-builder/models';

export function getBorderColor(validation: Validation) {
  if (validation.state === 'fail') {
    return 'red';
  }
  if (validation.state === 'valid') {
    return 'green';
  }
  return 'grey';
}
