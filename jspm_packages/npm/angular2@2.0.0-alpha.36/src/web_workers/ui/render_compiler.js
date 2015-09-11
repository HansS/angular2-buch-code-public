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
var di_1 = require("../../../di");
var api_1 = require("../../render/api");
var messaging_api_1 = require("../shared/messaging_api");
var bind_1 = require("./bind");
var service_message_broker_1 = require("../shared/service_message_broker");
var MessageBasedRenderCompiler = (function() {
  function MessageBasedRenderCompiler(brokerFactory, _renderCompiler) {
    this._renderCompiler = _renderCompiler;
    var broker = brokerFactory.createMessageBroker(messaging_api_1.RENDER_COMPILER_CHANNEL);
    broker.registerMethod("compileHost", [api_1.RenderDirectiveMetadata], bind_1.bind(this._renderCompiler.compileHost, this._renderCompiler), api_1.ProtoViewDto);
    broker.registerMethod("compile", [api_1.ViewDefinition], bind_1.bind(this._renderCompiler.compile, this._renderCompiler), api_1.ProtoViewDto);
    broker.registerMethod("mergeProtoViewsRecursively", [api_1.RenderProtoViewRef], bind_1.bind(this._renderCompiler.mergeProtoViewsRecursively, this._renderCompiler), api_1.RenderProtoViewMergeMapping);
  }
  MessageBasedRenderCompiler = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [service_message_broker_1.ServiceMessageBrokerFactory, api_1.RenderCompiler])], MessageBasedRenderCompiler);
  return MessageBasedRenderCompiler;
})();
exports.MessageBasedRenderCompiler = MessageBasedRenderCompiler;