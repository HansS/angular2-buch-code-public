/* */ 
"format cjs";
import { ListWrapper } from 'angular2/src/facade/collection';
import { BaseException, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { codify, combineGeneratedStrings, rawString } from './codegen_facade';
import { RecordType } from './proto_record';
import { ON_PUSH_OBSERVE } from './constants';
/**
 * Class responsible for providing change detection logic for chagne detector classes.
 */
export class CodegenLogicUtil {
    constructor(_names, _utilName, _changeDetection) {
        this._names = _names;
        this._utilName = _utilName;
        this._changeDetection = _changeDetection;
    }
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by property bindings.
     */
    genPropertyBindingEvalValue(protoRec) {
        return this.genEvalValue(protoRec, idx => this._names.getLocalName(idx), this._names.getLocalsAccessorName());
    }
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by event bindings.
     */
    genEventBindingEvalValue(eventRecord, protoRec) {
        return this.genEvalValue(protoRec, idx => this._names.getEventLocalName(eventRecord, idx), "locals");
    }
    genEvalValue(protoRec, getLocalName, localsAccessor) {
        var context = (protoRec.contextIndex == -1) ?
            this._names.getDirectiveName(protoRec.directiveIndex) :
            getLocalName(protoRec.contextIndex);
        var argString = ListWrapper.map(protoRec.args, (arg) => getLocalName(arg)).join(", ");
        var rhs;
        switch (protoRec.mode) {
            case RecordType.SELF:
                rhs = context;
                break;
            case RecordType.CONST:
                rhs = codify(protoRec.funcOrValue);
                break;
            case RecordType.PROPERTY_READ:
                rhs = this._observe(`${context}.${protoRec.name}`, protoRec);
                break;
            case RecordType.SAFE_PROPERTY:
                var read = this._observe(`${context}.${protoRec.name}`, protoRec);
                rhs =
                    `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(read, protoRec)}`;
                break;
            case RecordType.PROPERTY_WRITE:
                rhs = `${context}.${protoRec.name} = ${getLocalName(protoRec.args[0])}`;
                break;
            case RecordType.LOCAL:
                rhs = this._observe(`${localsAccessor}.get(${rawString(protoRec.name)})`, protoRec);
                break;
            case RecordType.INVOKE_METHOD:
                rhs = this._observe(`${context}.${protoRec.name}(${argString})`, protoRec);
                break;
            case RecordType.SAFE_INVOKE_METHOD:
                var invoke = `${context}.${protoRec.name}(${argString})`;
                rhs =
                    `${this._utilName}.isValueBlank(${context}) ? null : ${this._observe(invoke, protoRec)}`;
                break;
            case RecordType.INVOKE_CLOSURE:
                rhs = `${context}(${argString})`;
                break;
            case RecordType.PRIMITIVE_OP:
                rhs = `${this._utilName}.${protoRec.name}(${argString})`;
                break;
            case RecordType.COLLECTION_LITERAL:
                rhs = `${this._utilName}.${protoRec.name}(${argString})`;
                break;
            case RecordType.INTERPOLATE:
                rhs = this._genInterpolation(protoRec);
                break;
            case RecordType.KEYED_READ:
                rhs = this._observe(`${context}[${getLocalName(protoRec.args[0])}]`, protoRec);
                break;
            case RecordType.KEYED_WRITE:
                rhs = `${context}[${getLocalName(protoRec.args[0])}] = ${getLocalName(protoRec.args[1])}`;
                break;
            case RecordType.CHAIN:
                rhs = 'null';
                break;
            default:
                throw new BaseException(`Unknown operation ${protoRec.mode}`);
        }
        return `${getLocalName(protoRec.selfIndex)} = ${rhs};`;
    }
    _observe(exp, rec) {
        // This is an experimental feature. Works only in Dart.
        if (StringWrapper.equals(this._changeDetection, ON_PUSH_OBSERVE)) {
            return `this.observeValue(${exp}, ${rec.selfIndex})`;
        }
        else {
            return exp;
        }
    }
    genPropertyBindingTargets(propertyBindingTargets, genDebugInfo) {
        var bs = propertyBindingTargets.map(b => {
            if (isBlank(b))
                return "null";
            var debug = genDebugInfo ? codify(b.debug) : "null";
            return `${this._utilName}.bindingTarget(${codify(b.mode)}, ${b.elementIndex}, ${codify(b.name)}, ${codify(b.unit)}, ${debug})`;
        });
        return `[${bs.join(", ")}]`;
    }
    genDirectiveIndices(directiveRecords) {
        var bs = directiveRecords.map(b => `${this._utilName}.directiveIndex(${b.directiveIndex.elementIndex}, ${b.directiveIndex.directiveIndex})`);
        return `[${bs.join(", ")}]`;
    }
    _genInterpolation(protoRec) {
        var iVals = [];
        for (var i = 0; i < protoRec.args.length; ++i) {
            iVals.push(codify(protoRec.fixedArgs[i]));
            iVals.push(`${this._utilName}.s(${this._names.getLocalName(protoRec.args[i])})`);
        }
        iVals.push(codify(protoRec.fixedArgs[protoRec.args.length]));
        return combineGeneratedStrings(iVals);
    }
    genHydrateDirectives(directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            res.push(`${this._names.getDirectiveName(r.directiveIndex)} = ${this._genReadDirective(i)};`);
        }
        return res.join("\n");
    }
    _genReadDirective(index) {
        // This is an experimental feature. Works only in Dart.
        if (StringWrapper.equals(this._changeDetection, ON_PUSH_OBSERVE)) {
            return `this.observeDirective(this.getDirectiveFor(directives, ${index}), ${index})`;
        }
        else {
            return `this.getDirectiveFor(directives, ${index})`;
        }
    }
    genHydrateDetectors(directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            if (!r.isDefaultChangeDetection()) {
                res.push(`${this._names.getDetectorName(r.directiveIndex)} = this.getDetectorFor(directives, ${i});`);
            }
        }
        return res.join("\n");
    }
}
//# sourceMappingURL=codegen_logic_util.js.map