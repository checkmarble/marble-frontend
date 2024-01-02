import { type ScriptDescriptor } from 'remix-utils/external-scripts';

export const chatlioScript: ScriptDescriptor = {
  type: 'text/javascript',
  async: true,
  src: 'https://js.chatlio.com/widget.js',
};
