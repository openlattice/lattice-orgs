/*
 * @flow
 */

export default function clipboardWriteText(value :?string) {

  // TODO: consider using https://github.com/zenorocha/clipboard.js
  if (navigator.clipboard && value) {
    navigator.clipboard.writeText(value);
  }
}
