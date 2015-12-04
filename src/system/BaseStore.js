/*
 * BaseStore
 * @flow
 */

var AppDispatcher = require('AppDispatcher');
var EventEmitter = require('fbemitter').EventEmitter;
var React = require('react');

var invariant = require('invariant');

class BaseStore extends EventEmitter {

    constructor() {
        super();
        this.actions = {};
        this.dispatchToken = AppDispatcher.register(this.onDispatch.bind(this));
    }

    onDispatch(payload: Object): bool {
        var callback = this.actions[payload.type];
        callback && callback(payload);
        return true;
    }

    addAction(action: string, callback: Function): void {
        invariant(!this.actions[action], `${action} already exists.`);
        this.actions[action] = callback.bind(this);
    }

    getDispatchToken(): string {
        return this.dispatchToken;
    }

    getDispatcher(): Object {
        return AppDispatcher;
    }

    emitChange(): void {
        super.emit('change');
    }

    addChangeListener(callback: Function): void {
        super.addListener('change', callback);
    }

    removeChangeListener(callback: Function): void {
        super.removeListener('change', callback);
    }

}

module.exports = BaseStore;
