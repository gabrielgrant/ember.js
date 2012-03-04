/*jshint newcap:false*/

require("metamorph");
require("ember-views/views/view");

var set = Ember.set, get = Ember.get, getPath = Ember.getPath;

var DOMManager = {
  remove: function(view) {
    var morph = view.morph;
    if (morph.isRemoved()) { return; }
    morph.remove();
  },

  prepend: function(view, childView) {
    childView._insertElementLater(function() {
      var morph = view.morph;
      morph.prepend(childView.outerHTML);
      childView.outerHTML = null;
    });
  },

  after: function(view, nextView) {
    nextView._insertElementLater(function() {
      var morph = view.morph;
      morph.after(nextView.outerHTML);
      nextView,outerHTML = null;
    });
  },

  replace: function(view) {
    var morph = view.morph;

    view.transitionTo('preRender');
    view.clearRenderedChildren();
    var buffer = view.renderToBuffer();

    Ember.run.schedule('render', this, function() {
      if (get(view, 'isDestroyed')) { return; }
      view.invalidateRecursively('element');
      view._notifyWillInsertElement();
      morph.replaceWith(buffer.string());
      view.transitionTo('inDOM');
      view._notifyDidInsertElement();
    });
  }
};

// The `morph` and `outerHTML` properties are internal only
// and not observable.

Ember.Metamorph = Ember.Mixin.create({
  isVirtual: true,
  tagName: '',

  init: function() {
    this._super();
    this.morph = Metamorph();
  },

  beforeRender: function(buffer) {
    buffer.push(this.morph.startTag());
  },

  afterRender: function(buffer) {
    buffer.push(this.morph.endTag());
  },

  createElement: function() {
    var buffer = this.renderToBuffer();
    this.outerHTML = buffer.string();
    this.clearBuffer();
  },

  domManager: DOMManager
});

