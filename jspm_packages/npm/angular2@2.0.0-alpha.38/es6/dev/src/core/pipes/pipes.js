/* */ 
"format cjs";
import { isBlank, isPresent } from 'angular2/src/core/facade/lang';
import { BaseException } from 'angular2/src/core/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/core/facade/collection';
import * as cd from 'angular2/src/core/change_detection/pipes';
export class ProtoPipes {
    constructor(
        /**
        * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
        */
        config) {
        this.config = config;
        this.config = config;
    }
    static fromBindings(bindings) {
        var config = {};
        bindings.forEach(b => config[b.name] = b);
        return new ProtoPipes(config);
    }
    get(name) {
        var binding = this.config[name];
        if (isBlank(binding))
            throw new BaseException(`Cannot find pipe '${name}'.`);
        return binding;
    }
}
export class Pipes {
    constructor(proto, injector) {
        this.proto = proto;
        this.injector = injector;
        this._config = {};
    }
    get(name) {
        var cached = StringMapWrapper.get(this._config, name);
        if (isPresent(cached))
            return cached;
        var p = this.proto.get(name);
        var transform = this.injector.instantiateResolved(p);
        var res = new cd.SelectedPipe(transform, p.pure);
        if (p.pure) {
            StringMapWrapper.set(this._config, name, res);
        }
        return res;
    }
}
//# sourceMappingURL=pipes.js.map