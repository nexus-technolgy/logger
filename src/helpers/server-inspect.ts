export default function serverInspect() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("util").inspect;
}
