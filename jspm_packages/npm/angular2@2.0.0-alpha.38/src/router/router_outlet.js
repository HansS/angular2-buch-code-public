/* */ 
'use strict';
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    return Reflect.decorate(decorators, target, key, desc);
  switch (arguments.length) {
    case 2:
      return decorators.reduceRight(function(o, d) {
        return (d && d(o)) || o;
      }, target);
    case 3:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key)), void 0;
      }, void 0);
    case 4:
      return decorators.reduceRight(function(o, d) {
        return (d && d(target, key, o)) || o;
      }, desc);
  }
};
var __metadata = (this && this.__metadata) || function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var async_1 = require("../core/facade/async");
var collection_1 = require("../core/facade/collection");
var lang_1 = require("../core/facade/lang");
var exceptions_1 = require("../core/facade/exceptions");
var metadata_1 = require("../core/metadata");
var linker_1 = require("../core/linker");
var di_1 = require("../core/di");
var routerMod = require("./router");
var instruction_1 = require("./instruction");
var route_data_1 = require("./route_data");
var hookMod = require("./lifecycle_annotations");
var route_lifecycle_reflector_1 = require("./route_lifecycle_reflector");
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
var RouterOutlet = (function() {
  function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
    this._elementRef = _elementRef;
    this._loader = _loader;
    this._parentRouter = _parentRouter;
    this.name = null;
    this._componentRef = null;
    this._currentInstruction = null;
    if (lang_1.isPresent(nameAttr)) {
      this.name = nameAttr;
      this._parentRouter.registerAuxOutlet(this);
    } else {
      this._parentRouter.registerPrimaryOutlet(this);
    }
  }
  RouterOutlet.prototype.activate = function(nextInstruction) {
    var _this = this;
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    var componentType = nextInstruction.componentType;
    var childRouter = this._parentRouter.childRouter(componentType);
    var bindings = di_1.Injector.resolve([di_1.bind(route_data_1.ROUTE_DATA).toValue(nextInstruction.routeData()), di_1.bind(instruction_1.RouteParams).toValue(new instruction_1.RouteParams(nextInstruction.params)), di_1.bind(routerMod.Router).toValue(childRouter)]);
    return this._loader.loadNextToLocation(componentType, this._elementRef, bindings).then(function(componentRef) {
      _this._componentRef = componentRef;
      if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onActivate, componentType)) {
        return _this._componentRef.instance.onActivate(nextInstruction, previousInstruction);
      }
    });
  };
  RouterOutlet.prototype.reuse = function(nextInstruction) {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    if (lang_1.isBlank(this._componentRef)) {
      throw new exceptions_1.BaseException("Cannot reuse an outlet that does not contain a component.");
    }
    return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ? this._componentRef.instance.onReuse(nextInstruction, previousInstruction) : true);
  };
  RouterOutlet.prototype.deactivate = function(nextInstruction) {
    var _this = this;
    var next = _resolveToTrue;
    if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) && route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
      next = async_1.PromiseWrapper.resolve(this._componentRef.instance.onDeactivate(nextInstruction, this._currentInstruction));
    }
    return next.then(function(_) {
      if (lang_1.isPresent(_this._componentRef)) {
        _this._componentRef.dispose();
        _this._componentRef = null;
      }
    });
  };
  RouterOutlet.prototype.canDeactivate = function(nextInstruction) {
    if (lang_1.isBlank(this._currentInstruction)) {
      return _resolveToTrue;
    }
    if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
      return async_1.PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(nextInstruction, this._currentInstruction));
    }
    return _resolveToTrue;
  };
  RouterOutlet.prototype.canReuse = function(nextInstruction) {
    var result;
    if (lang_1.isBlank(this._currentInstruction) || this._currentInstruction.componentType != nextInstruction.componentType) {
      result = false;
    } else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
      result = this._componentRef.instance.canReuse(nextInstruction, this._currentInstruction);
    } else {
      result = nextInstruction == this._currentInstruction || (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) && collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
    }
    return async_1.PromiseWrapper.resolve(result);
  };
  RouterOutlet = __decorate([metadata_1.Directive({selector: 'router-outlet'}), __param(3, metadata_1.Attribute('name')), __metadata('design:paramtypes', [linker_1.ElementRef, linker_1.DynamicComponentLoader, routerMod.Router, String])], RouterOutlet);
  return RouterOutlet;
})();
exports.RouterOutlet = RouterOutlet;
