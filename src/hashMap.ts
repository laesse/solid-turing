export class HashMap<K, V> {
  private values: Map<string, V>;
  constructor(values: ReadonlyArray<readonly [K, V]>) {
    this.values = new Map(values.map((a) => [JSON.stringify(a[0]), a[1]]));
  }
  public get(key: K): V | undefined {
    return this.values.get(JSON.stringify(key));
  }
  public set(key: K, value: V) {
    this.values.set(JSON.stringify(key), value);
    return this;
  }
  public entries() {
    const entr = this.values.entries();
    const out: [K, V][] = [];
    for (const [key, value] of entr) {
      out.push([JSON.parse(key) as K, value]);
    }
    return out;
  }
  *[Symbol.iterator]() {
    yield* this.values[Symbol.iterator]();
  }
}
