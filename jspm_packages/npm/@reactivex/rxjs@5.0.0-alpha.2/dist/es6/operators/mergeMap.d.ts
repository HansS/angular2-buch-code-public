import Observable from '../Observable';
export default function mergeMap<T, R, R2>(project: (value: T, index: number) => Observable<R>, resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R, concurrent?: number): any;
