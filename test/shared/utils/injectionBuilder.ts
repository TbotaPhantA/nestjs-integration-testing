export class InjectionBuilder<T extends {} = {}> {
  public readonly result: T;

  constructor(private _target: T) {
    this.result = _target;
  }

  with<F extends keyof T>(field: Pick<T, F>): InjectionBuilder<T> {
    Object.assign<T, Pick<T, F>>(this._target, field);
    return this;
  }

  omit<K extends keyof T>(...keys: K[]): InjectionBuilder<Omit<T, K>> {
    const updatedTarget = Object.create(Object.getPrototypeOf(this._target));

    Object.assign(updatedTarget, this._target);

    for (const key of keys) {
      delete (updatedTarget as any)[key];
    }

    return new InjectionBuilder(updatedTarget as Omit<T, K>);
  }
}
