/* */ 
"format cjs";
/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { createInjector } from "./di_bindings";
import { createNgZone } from 'angular2/src/core/application_common';
import { Injectable } from 'angular2/di';
import { BrowserDomAdapter } from 'angular2/src/dom/browser_adapter';
import { wtfInit } from 'angular2/src/profile/wtf_init';
import { WebWorkerSetup } from 'angular2/src/web_workers/ui/setup';
import { MessageBasedRenderCompiler } from 'angular2/src/web_workers/ui/render_compiler';
import { MessageBasedRenderer } from 'angular2/src/web_workers/ui/renderer';
import { MessageBasedXHRImpl } from 'angular2/src/web_workers/ui/xhr_impl';
/**
 * Creates a zone, sets up the DI bindings
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus) {
    BrowserDomAdapter.makeCurrent();
    var zone = createNgZone();
    wtfInit();
    zone.run(() => {
        var injector = createInjector(zone, bus);
        // necessary to kick off all the message based components
        injector.get(WebWorkerMain);
    });
}
export let WebWorkerMain = class {
    constructor(renderCompiler, renderer, xhr, setup) {
        this.renderCompiler = renderCompiler;
        this.renderer = renderer;
        this.xhr = xhr;
        this.setup = setup;
    }
};
WebWorkerMain = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBasedRenderCompiler, MessageBasedRenderer, MessageBasedXHRImpl, WebWorkerSetup])
], WebWorkerMain);
//# sourceMappingURL=impl.js.map