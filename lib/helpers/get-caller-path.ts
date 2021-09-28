import path from 'path'

export default function getCallerPath () {
  const _prepareStackTrace = Error.prepareStackTrace
	Error.prepareStackTrace = (_, stack) => stack
    // @ts-ignore
	const stack = new Error().stack.slice(1)
  Error.prepareStackTrace = _prepareStackTrace
  // @ts-ignore
  return path.dirname(stack[1].getFileName())
}