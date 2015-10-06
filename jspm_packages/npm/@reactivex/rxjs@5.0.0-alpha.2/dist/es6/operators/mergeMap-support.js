/* */ 
"format cjs";
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import subscribeToResult from '../util/subscribeToResult';
import OuterSubscriber from '../OuterSubscriber';
export class MergeMapOperator {
    constructor(project, resultSelector, concurrent = Number.POSITIVE_INFINITY) {
        this.project = project;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
    }
    call(observer) {
        return new MergeMapSubscriber(observer, this.project, this.resultSelector, this.concurrent);
    }
}
export class MergeMapSubscriber extends OuterSubscriber {
    constructor(destination, project, resultSelector, concurrent = Number.POSITIVE_INFINITY) {
        super(destination);
        this.project = project;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
        this.index = 0;
    }
    _next(value) {
        if (this.active < this.concurrent) {
            const resultSelector = this.resultSelector;
            const index = this.index++;
            const ish = tryCatch(this.project)(value, index);
            const destination = this.destination;
            if (ish === errorObject) {
                destination.error(ish.e);
            }
            else {
                this.active++;
                this._innerSub(ish, value, index);
            }
        }
        else {
            this.buffer.push(value);
        }
    }
    _innerSub(ish, value, index) {
        this.add(subscribeToResult(this, ish, value, index));
    }
    _complete() {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
    }
    notifyNext(innerValue, outerValue, innerIndex, outerIndex) {
        const { destination, resultSelector } = this;
        if (resultSelector) {
            const result = tryCatch(resultSelector)(innerValue, outerValue, innerIndex, outerIndex);
            if (result === errorObject) {
                destination.error(errorObject.e);
            }
            else {
                destination.next(result);
            }
        }
        destination.next(innerValue);
    }
    notifyComplete(innerSub) {
        const buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    }
}
