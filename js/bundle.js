(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":2,"es5-ext/object/valid-callable":11}],2:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":3,"es5-ext/object/is-callable":6,"es5-ext/object/normalize-options":10,"es5-ext/string/#/contains":13}],3:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":4,"./shim":5}],4:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],5:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":7,"../valid-value":12}],6:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],7:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":8,"./shim":9}],8:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],9:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],10:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":14,"./shim":15}],14:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],15:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],16:[function(require,module,exports){
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

exports = module.exports = function(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
}


/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}

},{}],17:[function(require,module,exports){
var iota = require("iota-array")
var isBuffer = require("is-buffer")

var hasTypedArrays  = ((typeof Float64Array) !== "undefined")

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("")
  if(dimension < 0) {
    className = "View_Nil" + dtype
  }
  var useGetters = (dtype === "generic")

  if(dimension === -1) {
    //Special case for trivial arrays
    var code =
      "function "+className+"(a){this.data=a;};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new "+className+"(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_"+className+"(a){return new "+className+"(a);}"
    var procedure = new Function(code)
    return procedure()
  } else if(dimension === 0) {
    //Special case for 0d arrays
    var code =
      "function "+className+"(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function "+className+"_copy() {\
return new "+className+"(this.data,this.offset)\
};\
proto.pick=function "+className+"_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function "+className+"_get(){\
return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
"};\
proto.set=function "+className+"_set(v){\
return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
};\
return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
    var procedure = new Function("TrivialArray", code)
    return procedure(CACHED_CONSTRUCTORS[dtype][0])
  }

  var code = ["'use strict'"]

  //Create constructor for view
  var indices = iota(dimension)
  var args = indices.map(function(i) { return "i"+i })
  var index_str = "this.offset+" + indices.map(function(i) {
        return "this.stride[" + i + "]*i" + i
      }).join("+")
  var shapeArg = indices.map(function(i) {
      return "b"+i
    }).join(",")
  var strideArg = indices.map(function(i) {
      return "c"+i
    }).join(",")
  code.push(
    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
      "this.shape=[" + shapeArg + "]",
      "this.stride=[" + strideArg + "]",
      "this.offset=d|0}",
    "var proto="+className+".prototype",
    "proto.dtype='"+dtype+"'",
    "proto.dimension="+dimension)

  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
"}})")

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]")
  } else {
    code.push("Object.defineProperty(proto,'order',{get:")
    if(dimension < 4) {
      code.push("function "+className+"_order(){")
      if(dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})")
      }
    } else {
      code.push("ORDER})")
    }
  }

  //view.set(i0, ..., v):
  code.push(
"proto.set=function "+className+"_set("+args.join(",")+",v){")
  if(useGetters) {
    code.push("return this.data.set("+index_str+",v)}")
  } else {
    code.push("return this.data["+index_str+"]=v}")
  }

  //view.get(i0, ...):
  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
  if(useGetters) {
    code.push("return this.data.get("+index_str+")}")
  } else {
    code.push("return this.data["+index_str+"]}")
  }

  //view.index:
  code.push(
    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")

  //view.hi():
  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
    }).join(",")+","+
    indices.map(function(i) {
      return "this.stride["+i + "]"
    }).join(",")+",this.offset)}")

  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'&&i"+i+">=0){\
d=i"+i+"|0;\
b+=c"+i+"*d;\
a"+i+"-=d}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a"+i
    }).join(",")+","+
    indices.map(function(i) {
      return "c"+i
    }).join(",")+",b)}")

  //view.step():
  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
    indices.map(function(i) {
      return "a"+i+"=this.shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "b"+i+"=this.stride["+i+"]"
    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'){\
d=i"+i+"|0;\
if(d<0){\
c+=b"+i+"*(a"+i+"-1);\
a"+i+"=ceil(-a"+i+"/d)\
}else{\
a"+i+"=ceil(a"+i+"/d)\
}\
b"+i+"*=d\
}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a" + i
    }).join(",")+","+
    indices.map(function(i) {
      return "b" + i
    }).join(",")+",c)}")

  //view.transpose():
  var tShape = new Array(dimension)
  var tStride = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    tShape[i] = "a[i"+i+"]"
    tStride[i] = "b[i"+i+"]"
  }
  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")

  //view.pick():
  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
  }
  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")

  //Add return statement
  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(",")+",offset)}")

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(isBuffer(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "buffer":[],
  "generic":[]
}

;(function() {
  for(var id in CACHED_CONSTRUCTORS) {
    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
  }
});

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0]
    return ctor([])
  } else if(typeof data === "number") {
    data = [data]
  }
  if(shape === undefined) {
    shape = [ data.length ]
  }
  var d = shape.length
  if(stride === undefined) {
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  var dtype = arrayDType(data)
  var ctor_list = CACHED_CONSTRUCTORS[dtype]
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
  }
  var ctor = ctor_list[d+1]
  return ctor(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor

},{"iota-array":18,"is-buffer":19}],18:[function(require,module,exports){
"use strict"

function iota(n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = i
  }
  return result
}

module.exports = iota
},{}],19:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],20:[function(require,module,exports){
module.exports = function() {

  var camera;

  function onAttach(app) {
    camera = app.container.camera;
  };

  function tick(dt) {
    updatePosition();
  }

  function updatePosition() {
    var position = new THREE.Vector3(0, 0, 1)
      .applyEuler(self.rotation)
      .multiplyScalar(self.distance)
      .add(self.target);
    camera.position.copy(position);
    camera.lookAt(self.target);
  }

  var self = {
    onAttach: onAttach,
    tick: tick,
    rotation: new THREE.Euler(-Math.PI / 4, Math.PI / 4, 0, 'YXZ'),
    distance: 20,
    target: new THREE.Vector3()
  };

  return self;
};

},{}],21:[function(require,module,exports){
var mesher = require('../voxel/mesher');
var ndarray = require('ndarray');
var BlockSheet = require('../utils/blocksheet');

var Turrent = function() {
  this.type = 'true';

  this.blockSheet = new BlockSheet();

  this.object = new THREE.Object3D();
  this.object.add(this.blockSheet.object);

  this.componentsByType = null;
};

Turrent.prototype.onAttach = function(app) {
  this.componentsByType = app.container.componentsByType;

  this.blockSheet.onAttach(app);
  this.blockSheet.materialType = 'lambert';
  this.blockSheet.elementNeedsUpdate = true;
  this.blockSheet.autoFaceCamera = false;
  this.chunk = ndarray([], [3, 3, 8]);

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 3; k++) {
        this.chunk.set(i, j, k, 1);
      }
    }
  }

  this.chunk.set(1, 1, 3, 1);
  this.chunk.set(1, 1, 4, 1);
  this.chunk.set(1, 1, 5, 1);
  this.chunk.set(1, 1, 6, 1);
  this.chunk.set(1, 1, 7, 1);

  this.blockSheet.blocksData = {
    palette: [null, 0x333333],
    chunks: [this.chunk]
  };

  this.blockSheet.center.set(-1.5, -1.5, -1.5);

  this.object.rotation.order = 'YXZ';
};

Turrent.prototype.tick = function(dt) {
  this.blockSheet.tick(dt);
};

Turrent.prototype.dispose = function() {
  this.blockSheet.dispose();
};

module.exports = Turrent;

},{"../utils/blocksheet":25,"../voxel/mesher":30,"ndarray":17}],22:[function(require,module,exports){
var BlockSheet = require('../utils/blocksheet');

var Zombie = function() {
  this.type = 'zombie';
  
  this.object = new THREE.Object3D();
  this.blockSheet = null;

  // Injected
  this.input = null;
  this.app = null;
};

Zombie.prototype.onAttach = function(app) {
  var images = app.container.images;
  this.input = app.container.input;
  this.app = app;

  // Add zombie blocks
  blockSheet = new BlockSheet();
  blockSheet.loadImage(images['zombie'], 2);
  blockSheet.elementNeedsUpdate = true;
  blockSheet.object.position.y = 0.5;

  this.blockSheet = blockSheet;

  this.object.add(blockSheet.object);

  this.blockSheet.onAttach(app);
};

Zombie.prototype.tick = function(dt) {
  this.blockSheet.tick(dt);
};

Zombie.prototype.dispose = function() {
  this.blockSheet.dispose();
};

module.exports = Zombie;

},{"../utils/blocksheet":25}],23:[function(require,module,exports){
var ee = require('event-emitter');

var Runner = function() {
  this.map = {};
  this.container = {};
  this.events = ee();
};

Runner.prototype.attach = function(component) {
  if (component._id == null) {
    component._id = guid();
  }
  this.map[component._id] = component;

  if (component.onAttach != null) {
    component.onAttach(this);
  }

  this.events.emit('attach', component);
};

Runner.prototype.dettach = function(component) {
  delete this.map[component._id];

  this.events.emit('dettach', component);
};

Runner.prototype.tick = function(dt) {
  var component;
  for (var id in this.map) {
    component = this.map[id];
    if (component.tick != null) {
      component.tick(dt);
    }
  }

  for (var id in this.map) {
    component = this.map[id];
    if (component.lateTick != null) {
      component.lateTick();
    }
  }
};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = function() {
  return new Runner();
};

},{"event-emitter":1}],24:[function(require,module,exports){
(function (global){
var THREE = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x666666);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var ambientLight = new THREE.AmbientLight(0x666666);
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0.5, 1.0, 0.3);

scene.add(ambientLight);
scene.add(directionalLight);

var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000);

// image cache
var images = {};

function loadAssets(done) {
  var total = 1;
  var count = 0;

  var imageLoader = new THREE.ImageLoader();
  imageLoader.load(
    'images/zombie.png',
    function(image) {
      images['zombie'] = image;
      count++;
      if (count === total) { done(); }
    },
    function(xhr) { /* Progress */ },
    function(xhr) { /* Error */
      count++;
      if (count === total) { done(); }
    }
  );
};

function render() {
  renderer.render(scene, camera);
};

var dt = 1000 / 60;

var app = require('./core/runner')();

function animate() {
  app.tick(dt);
  render();
  requestAnimationFrame(animate);
};

var Physics = require('./utils/physics');
var Zombie = require('./components/zombie');
var DragCamera = require('./components/dragcamera');
var Turrent = require('./components/turrent');
var spriteSheet;
var blockSheet;
var dragCamera;

loadAssets(function() {

  app.container.camera = camera;
  app.container.scene = scene;

  var componentsByType = require('./utils/componentsbytype')(app);
  app.container.componentsByType = componentsByType;

  // Set up input
  var input = require('./utils/input')();
  app.attach(input);
  app.container.input = input;

  // Set up physics
  var physics = new Physics();
  app.attach(physics);
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physics.world.add(groundBody);
  physics.world.gravity.set(0, -9.82, 0);
  app.container.physics = physics;

  app.container.images = images;

  var num = 20;
  for (var i = 0; i < num; i++) {
    var zombie = new Zombie();
    scene.add(zombie.object);
    app.attach(zombie);

    zombie.object.position.x = (Math.random() - 0.5) * 10;
    zombie.object.position.z = (Math.random() - 0.5) * 10;
  }

  dragCamera = DragCamera();
  app.attach(dragCamera);

  // var turrent = new Turrent();
  // scene.add(turrent.object);
  // turrent.object.scale.set(1 / 12, 1 / 12, 1 / 12);
  // app.attach(turrent);
  
  animate();
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/dragcamera":20,"./components/turrent":21,"./components/zombie":22,"./core/runner":23,"./utils/componentsbytype":26,"./utils/input":27,"./utils/physics":28}],25:[function(require,module,exports){
var mesher = require('../voxel/mesher');
var ndarray = require('ndarray');

var BlockSheet = function() {
  this.elementNeedsUpdate = false;

  this.object = new THREE.Object3D();
  this.mesh = new THREE.Mesh();
  this.object.add(this.mesh);

  this.materialType = 'basic';
  this.material = null;

  // frames, palette
  this.blocksData = null;
  this.geometries = [];

  this.frames = 1;
  this.frame = 0;
  this.frameInterval = [];
  this.defaultFrameInterval = 500;
  this.dtCounter = 0;
  this.center = new THREE.Vector3();

  // Injected
  this.physics = null;
  this.camera = null;
  this.scene = null;

  this.autoFaceCamera = true;
};

BlockSheet.prototype.onAttach = function(app) {
  this.physics = app.container.physics;
  this.camera = app.container.camera;
  this.scene = app.container.scene;
};

BlockSheet.prototype.tick = function(dt) {
  if (this.elementNeedsUpdate) {
    this.updateElement();
    this.elementNeedsUpdate = false;
  }

  this.dtCounter += dt;
  var frameInterval = this.frameInterval[this.frame] || this.defaultFrameInterval;

  if (this.dtCounter > frameInterval) {
    this.dtCounter -= frameInterval;
    this.frame++;
    this.frame %= this.frames;

    var geometry = this.geometries[this.frame];
    if (geometry == null) {
      geometry = mesher(this.blocksData.chunks[this.frame]);
      this.geometries[this.frame] = geometry;
    }

    this.mesh.geometry = geometry;
  }

  if (this.autoFaceCamera) {
    this.object.lookAt(this.camera.position);
  }
};

BlockSheet.prototype.updateElement = function() {
  this.dispose();
  this.updateMaterial();
  this.mesh.material = this.material;
  this.mesh.position.copy(this.center);
};

BlockSheet.prototype.dispose = function() {
  if (this.material != null) {
    this.material.materials.forEach(function(material) {
      if (material != null) {
        material.dispose();
      }
    });
  }

  this.geometries.forEach(function(geometry) {
    geometry.dispose();
  });
};

BlockSheet.prototype.updateMaterial = function() {
  this.material = new THREE.MultiMaterial();
  var self = this;
  this.blocksData.palette.forEach(function(color) {
    if (color == null) {
      self.material.materials.push(null);
      return;
    }

    if (self.materialType === 'lambert') {
      self.material.materials.push(new THREE.MeshLambertMaterial({
        color: color
      }));
    } else {
      self.material.materials.push(new THREE.MeshBasicMaterial({
        color: color
      }));
    }

  });
};

BlockSheet.prototype.loadImage = function(image, frames) {
  this.frames = frames;
  this.blocksData = this.imageToBlocks(image, frames);
  var scale = 1 / image.height;
  this.object.scale.set(scale, scale, scale);
  this.center = new THREE.Vector3(-image.width / frames / 2, -image.height / 2, 0.5);
};

BlockSheet.prototype.imageToBlocks = function(image, frames) {
  frames = frames || 1;

  // Temp canvas
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(0, 0, image.width, image.height);

  var shape = [image.width, image.height, 1];
  var chunk = ndarray([], shape);
  var palette = [null];
  var colorMap = {};

  var width = image.width;
  var row, column, frame, index;
  var totalRows = image.height;
  var frameWidth = width / frames;
  var chunks = [];

  for (var i = 0; i < imageData.data.length; i += 4) {
    var r = imageData.data[i] / 255.0;
    var g = imageData.data[i + 1] / 255.0;
    var b = imageData.data[i + 2] / 255.0;
    var a = imageData.data[i + 3] / 255.0;
    if (a === 0) {
      continue;
    }
    var color = new THREE.Color(r, g, b).getHex();

    row = (-Math.floor(i / 4 / width) - 2) % totalRows;
    column = (i / 4) % width;
    frame = Math.floor(column / frameWidth);
    column -= frame * frameWidth;

    if (colorMap[color]) {
      index = colorMap[color];
    } else {
      index = palette.length;
      palette.push(color);
      colorMap[color] = index;
    }

    if (chunks[frame] == null) {
      chunks[frame] = ndarray([], [frameWidth, image.height, 1]);
    }
    chunks[frame].set(column + 1, row, 1, index);
  }

  return {
    chunks: chunks,
    palette: palette
  };
};

module.exports = BlockSheet;

},{"../voxel/mesher":30,"ndarray":17}],26:[function(require,module,exports){
module.exports = function(app) {
  var map = {};

  app.events.on('attach', function(component) {
    if (component.type != null) {
      if (map[component.type] == null) {
        map[component.type] = {};
      }
      map[component.type][component._id] = component;
    }
  });

  app.events.on('dettach', function(component) {
    if (component.type != null) {
      if (map[component.type] == null) {
        return;
      }
      delete map[component.type][component._id];
    }
  });

  function getAll(type) {
    return map[type] || {};
  };

  return {
    getAll: getAll
  };
};

},{}],27:[function(require,module,exports){
var keycode = require('keycode');

module.exports = function() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  var keyHolds = {};
  var keyDowns = {};
  var keyUps = {};

  function onKeyDown(e) {
    var key = keycode(e);
    if (!keyHolds[key]) {
      keyDowns[key] = true;
    }
    keyHolds[key] = true;
  };

  function onKeyUp(e) {
    var key = keycode(e);
    keyHolds[key] = false;
    keyUps[key] = true;
  };

  function lateTick() {
    keyDowns = {};
    keyUps = {};
  };

  return {
    lateTick: lateTick,

    key: function(k) {
      return keyHolds[k] || false;
    },
    keyDown: function(k) {
      return keyDowns[k] || false;
    },
    keyUp: function(k) {
      return keyUps[k] || false;
    }
  }
};

},{"keycode":16}],28:[function(require,module,exports){
(function (global){
var CANNON = (typeof window !== "undefined" ? window['CANNON'] : typeof global !== "undefined" ? global['CANNON'] : null);

var Physics = function() {
  this.world = new CANNON.World();
  this.maxSubSteps = 3;
  this.fixedTimeStep = 1 / 60.0;

  this.map = {};
};

Physics.prototype.add = function(obj, body) {
  this.map[obj.uuid] = {
    obj: obj,
    body: body
  };

  this.world.addBody(body);
};

Physics.prototype.tick = function(dt) {
  this.world.step(this.fixedTimeStep, dt / 1000, this.maxSubSteps);

  var obj, body;
  for (var id in this.map) {
    obj = this.map[id].obj;
    body = this.map[id].body;

    obj.position.x = body.position.x;
    obj.position.y = body.position.y;
    obj.position.z = body.position.z;
    obj.quaternion.x = body.quaternion.x;
    obj.quaternion.y = body.quaternion.y;
    obj.quaternion.z = body.quaternion.z;
    obj.quaternion.w = body.quaternion.w;
  }
};

module.exports = Physics;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],29:[function(require,module,exports){
var GreedyMesh = (function() {
  //Cache buffer internally
  var mask = new Int32Array(4096);

  return function(f, dims) {
    var vertices = [],
      faces = [],
      dimsX = dims[0],
      dimsY = dims[1],
      dimsXY = dimsX * dimsY;

    //Sweep over 3-axes
    for (var d = 0; d < 3; ++d) {
      var i, j, k, l, w, W, h, n, c, u = (d + 1) % 3,
        v = (d + 2) % 3,
        x = [0, 0, 0],
        q = [0, 0, 0],
        du = [0, 0, 0],
        dv = [0, 0, 0],
        dimsD = dims[d],
        dimsU = dims[u],
        dimsV = dims[v],
        qdimsX, qdimsXY, xd

      if (mask.length < dimsU * dimsV) {
        mask = new Int32Array(dimsU * dimsV);
      }

      q[d] = 1;
      x[d] = -1;

      qdimsX = dimsX * q[1]
      qdimsXY = dimsXY * q[2]

      // Compute mask
      while (x[d] < dimsD) {
        xd = x[d]
        n = 0;

        for (x[v] = 0; x[v] < dimsV; ++x[v]) {
          for (x[u] = 0; x[u] < dimsU; ++x[u], ++n) {
            var a = xd >= 0 && f(x[0], x[1], x[2]),
              b = xd < dimsD - 1 && f(x[0] + q[0], x[1] + q[1], x[2] + q[2])
            if (a ? b : !b) {
              mask[n] = 0;
              continue;
            }
            mask[n] = a ? a : -b;
          }
        }

        ++x[d];

        // Generate mesh for mask using lexicographic ordering
        n = 0;
        for (j = 0; j < dimsV; ++j) {
          for (i = 0; i < dimsU;) {
            c = mask[n];
            if (!c) {
              i++;
              n++;
              continue;
            }

            //Compute width
            w = 1;
            while (c === mask[n + w] && i + w < dimsU) w++;

            //Compute height (this is slightly awkward)
            for (h = 1; j + h < dimsV; ++h) {
              k = 0;
              while (k < w && c === mask[n + k + h * dimsU]) k++
                if (k < w) break;
            }

            // Add quad
            // The du/dv arrays are reused/reset
            // for each iteration.
            du[d] = 0;
            dv[d] = 0;
            x[u] = i;
            x[v] = j;

            if (c > 0) {
              dv[v] = h;
              dv[u] = 0;
              du[u] = w;
              du[v] = 0;
            } else {
              c = -c;
              du[v] = h;
              du[u] = 0;
              dv[u] = w;
              dv[v] = 0;
            }
            var vertex_count = vertices.length;
            vertices.push([x[0], x[1], x[2]]);
            vertices.push([x[0] + du[0], x[1] + du[1], x[2] + du[2]]);
            vertices.push([x[0] + du[0] + dv[0], x[1] + du[1] + dv[1], x[2] + du[2] + dv[2]]);
            vertices.push([x[0] + dv[0], x[1] + dv[1], x[2] + dv[2]]);
            faces.push([vertex_count, vertex_count + 1, vertex_count + 2, vertex_count + 3, c]);

            //Zero-out mask
            W = n + w;
            for (l = 0; l < h; ++l) {
              for (k = n; k < W; ++k) {
                mask[k + l * dimsU] = 0;
              }
            }

            //Increment counters and continue
            i += w;
            n += w;
          }
        }
      }
    }
    return { vertices: vertices, faces: faces };
  }
})();

if (exports) {
  exports.mesher = GreedyMesh;
}

},{}],30:[function(require,module,exports){
var monotoneMesher = require('./monotone').mesher;
var greedyMesher = require('./greedy').mesher;

module.exports = function(chunk) {
  var f = function(i, j, k) {
    return chunk.get(i, j, k);
  }

  var result = greedyMesher(f, chunk.shape);

  var geometry = new THREE.Geometry();

  result.faces.forEach(function(f) {
    var face1 = new THREE.Face3(f[0], f[1], f[2]);
    face1.materialIndex = f[4];
    var face2 = new THREE.Face3(f[2], f[3], f[0]);
    face2.materialIndex = f[4];
    geometry.faces.push(face1, face2);
  });

  result.vertices.forEach(function(v) {
    var vertice = new THREE.Vector3(v[0], v[1], v[2]);
    geometry.vertices.push(vertice);
  });

  geometry.computeFaceNormals();

  return geometry;
};

},{"./greedy":29,"./monotone":31}],31:[function(require,module,exports){
"use strict";

var MonotoneMesh = (function(){

function MonotonePolygon(c, v, ul, ur) {
  this.color  = c;
  this.left   = [[ul, v]];
  this.right  = [[ur, v]];
};

MonotonePolygon.prototype.close_off = function(v) {
  this.left.push([ this.left[this.left.length-1][0], v ]);
  this.right.push([ this.right[this.right.length-1][0], v ]);
};

MonotonePolygon.prototype.merge_run = function(v, u_l, u_r) {
  var l = this.left[this.left.length-1][0]
    , r = this.right[this.right.length-1][0]; 
  if(l !== u_l) {
    this.left.push([ l, v ]);
    this.left.push([ u_l, v ]);
  }
  if(r !== u_r) {
    this.right.push([ r, v ]);
    this.right.push([ u_r, v ]);
  }
};


return function(f, dims) {
  //Sweep over 3-axes
  var vertices = [], faces = [];
  for(var d=0; d<3; ++d) {
    var i, j, k
      , u = (d+1)%3   //u and v are orthogonal directions to d
      , v = (d+2)%3
      , x = new Int32Array(3)
      , q = new Int32Array(3)
      , runs = new Int32Array(2 * (dims[u]+1))
      , frontier = new Int32Array(dims[u])  //Frontier is list of pointers to polygons
      , next_frontier = new Int32Array(dims[u])
      , left_index = new Int32Array(2 * dims[v])
      , right_index = new Int32Array(2 * dims[v])
      , stack = new Int32Array(24 * dims[v])
      , delta = [[0,0], [0,0]];
    //q points along d-direction
    q[d] = 1;
    //Initialize sentinel
    for(x[d]=-1; x[d]<dims[d]; ) {
      // --- Perform monotone polygon subdivision ---
      var n = 0
        , polygons = []
        , nf = 0;
      for(x[v]=0; x[v]<dims[v]; ++x[v]) {
        //Make one pass over the u-scan line of the volume to run-length encode polygon
        var nr = 0, p = 0, c = 0;
        for(x[u]=0; x[u]<dims[u]; ++x[u], p = c) {
          //Compute the type for this face
          var a = (0    <= x[d]      ? f(x[0],      x[1],      x[2])      : 0)
            , b = (x[d] <  dims[d]-1 ? f(x[0]+q[0], x[1]+q[1], x[2]+q[2]) : 0);
          c = a;
          if((!a) === (!b)) {
            c = 0;
          } else if(!a) {
            c = -b;
          }
          //If cell type doesn't match, start a new run
          if(p !== c) {
            runs[nr++] = x[u];
            runs[nr++] = c;
          }
        }
        //Add sentinel run
        runs[nr++] = dims[u];
        runs[nr++] = 0;
        //Update frontier by merging runs
        var fp = 0;
        for(var i=0, j=0; i<nf && j<nr-2; ) {
          var p    = polygons[frontier[i]]
            , p_l  = p.left[p.left.length-1][0]
            , p_r  = p.right[p.right.length-1][0]
            , p_c  = p.color
            , r_l  = runs[j]    //Start of run
            , r_r  = runs[j+2]  //End of run
            , r_c  = runs[j+1]; //Color of run
          //Check if we can merge run with polygon
          if(r_r > p_l && p_r > r_l && r_c === p_c) {
            //Merge run
            p.merge_run(x[v], r_l, r_r);
            //Insert polygon into frontier
            next_frontier[fp++] = frontier[i];
            ++i;
            j += 2;
          } else {
            //Check if we need to advance the run pointer
            if(r_r <= p_r) {
              if(!!r_c) {
                var n_poly = new MonotonePolygon(r_c, x[v], r_l, r_r);
                next_frontier[fp++] = polygons.length;
                polygons.push(n_poly);
              }
              j += 2;
            }
            //Check if we need to advance the frontier pointer
            if(p_r <= r_r) {
              p.close_off(x[v]);
              ++i;
            }
          }
        }
        //Close off any residual polygons
        for(; i<nf; ++i) {
          polygons[frontier[i]].close_off(x[v]);
        }
        //Add any extra runs to frontier
        for(; j<nr-2; j+=2) {
          var r_l  = runs[j]
            , r_r  = runs[j+2]
            , r_c  = runs[j+1];
          if(!!r_c) {
            var n_poly = new MonotonePolygon(r_c, x[v], r_l, r_r);
            next_frontier[fp++] = polygons.length;
            polygons.push(n_poly);
          }
        }
        //Swap frontiers
        var tmp = next_frontier;
        next_frontier = frontier;
        frontier = tmp;
        nf = fp;
      }
      //Close off frontier
      for(var i=0; i<nf; ++i) {
        var p = polygons[frontier[i]];
        p.close_off(dims[v]);
      }
      // --- Monotone subdivision of polygon is complete at this point ---
      
      x[d]++;
      
      //Now we just need to triangulate each monotone polygon
      for(var i=0; i<polygons.length; ++i) {
        var p = polygons[i]
          , c = p.color
          , flipped = false;
        if(c < 0) {
          flipped = true;
          c = -c;
        }
        for(var j=0; j<p.left.length; ++j) {
          left_index[j] = vertices.length;
          var y = [0.0,0.0,0.0]
            , z = p.left[j];
          y[d] = x[d];
          y[u] = z[0];
          y[v] = z[1];
          vertices.push(y);
        }
        for(var j=0; j<p.right.length; ++j) {
          right_index[j] = vertices.length;
          var y = [0.0,0.0,0.0]
            , z = p.right[j];
          y[d] = x[d];
          y[u] = z[0];
          y[v] = z[1];
          vertices.push(y);
        }
        //Triangulate the monotone polygon
        var bottom = 0
          , top = 0
          , l_i = 1
          , r_i = 1
          , side = true;  //true = right, false = left
        
        stack[top++] = left_index[0];
        stack[top++] = p.left[0][0];
        stack[top++] = p.left[0][1];
        
        stack[top++] = right_index[0];
        stack[top++] = p.right[0][0];
        stack[top++] = p.right[0][1];
        
        while(l_i < p.left.length || r_i < p.right.length) {
          //Compute next side
          var n_side = false;
          if(l_i === p.left.length) {
            n_side = true;
          } else if(r_i !== p.right.length) {
            var l = p.left[l_i]
              , r = p.right[r_i];
            n_side = l[1] > r[1];
          }
          var idx = n_side ? right_index[r_i] : left_index[l_i]
            , vert = n_side ? p.right[r_i] : p.left[l_i];
          if(n_side !== side) {
            //Opposite side
            while(bottom+3 < top) {
              if(flipped === n_side) {
                faces.push([ stack[bottom], stack[bottom+3], idx, c]);
              } else {
                faces.push([ stack[bottom+3], stack[bottom], idx, c]);              
              }
              bottom += 3;
            }
          } else {
            //Same side
            while(bottom+3 < top) {
              //Compute convexity
              for(var j=0; j<2; ++j)
              for(var k=0; k<2; ++k) {
                delta[j][k] = stack[top-3*(j+1)+k+1] - vert[k];
              }
              var det = delta[0][0] * delta[1][1] - delta[1][0] * delta[0][1];
              if(n_side === (det > 0)) {
                break;
              }
              if(det !== 0) {
                if(flipped === n_side) {
                  faces.push([ stack[top-3], stack[top-6], idx, c ]);
                } else {
                  faces.push([ stack[top-6], stack[top-3], idx, c ]);
                }
              }
              top -= 3;
            }
          }
          //Push vertex
          stack[top++] = idx;
          stack[top++] = vert[0];
          stack[top++] = vert[1];
          //Update loop index
          if(n_side) {
            ++r_i;
          } else {
            ++l_i;
          }
          side = n_side;
        }
      }
    }
  }
  return { vertices:vertices, faces:faces };
}
})();

if(exports) {
  exports.mesher = MonotoneMesh;
}

},{}]},{},[24])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvaXMtY2FsbGFibGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2lzLWltcGxlbWVudGVkLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC1jYWxsYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC92YWxpZC12YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2tleWNvZGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbmRhcnJheS9uZGFycmF5LmpzIiwibm9kZV9tb2R1bGVzL25kYXJyYXkvbm9kZV9tb2R1bGVzL2lvdGEtYXJyYXkvaW90YS5qcyIsIm5vZGVfbW9kdWxlcy9uZGFycmF5L25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9kcmFnY2FtZXJhLmpzIiwic3JjL2NvbXBvbmVudHMvdHVycmVudC5qcyIsInNyYy9jb21wb25lbnRzL3pvbWJpZS5qcyIsInNyYy9jb3JlL3J1bm5lci5qcyIsInNyYy9tYWluLmpzIiwic3JjL3V0aWxzL2Jsb2Nrc2hlZXQuanMiLCJzcmMvdXRpbHMvY29tcG9uZW50c2J5dHlwZS5qcyIsInNyYy91dGlscy9pbnB1dC5qcyIsInNyYy91dGlscy9waHlzaWNzLmpzIiwic3JjL3ZveGVsL2dyZWVkeS5qcyIsInNyYy92b3hlbC9tZXNoZXIuanMiLCJzcmMvdm94ZWwvbW9ub3RvbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkICAgICAgICA9IHJlcXVpcmUoJ2QnKVxuICAsIGNhbGxhYmxlID0gcmVxdWlyZSgnZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUnKVxuXG4gICwgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHksIGNhbGwgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbFxuICAsIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzXG4gICwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgZGVzY3JpcHRvciA9IHsgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUgfVxuXG4gICwgb24sIG9uY2UsIG9mZiwgZW1pdCwgbWV0aG9kcywgZGVzY3JpcHRvcnMsIGJhc2U7XG5cbm9uID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyKSB7XG5cdHZhciBkYXRhO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSB7XG5cdFx0ZGF0YSA9IGRlc2NyaXB0b3IudmFsdWUgPSBjcmVhdGUobnVsbCk7XG5cdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgJ19fZWVfXycsIGRlc2NyaXB0b3IpO1xuXHRcdGRlc2NyaXB0b3IudmFsdWUgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdGRhdGEgPSB0aGlzLl9fZWVfXztcblx0fVxuXHRpZiAoIWRhdGFbdHlwZV0pIGRhdGFbdHlwZV0gPSBsaXN0ZW5lcjtcblx0ZWxzZSBpZiAodHlwZW9mIGRhdGFbdHlwZV0gPT09ICdvYmplY3QnKSBkYXRhW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRlbHNlIGRhdGFbdHlwZV0gPSBbZGF0YVt0eXBlXSwgbGlzdGVuZXJdO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxub25jZSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lcikge1xuXHR2YXIgb25jZSwgc2VsZjtcblxuXHRjYWxsYWJsZShsaXN0ZW5lcik7XG5cdHNlbGYgPSB0aGlzO1xuXHRvbi5jYWxsKHRoaXMsIHR5cGUsIG9uY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0b2ZmLmNhbGwoc2VsZiwgdHlwZSwgb25jZSk7XG5cdFx0YXBwbHkuY2FsbChsaXN0ZW5lciwgdGhpcywgYXJndW1lbnRzKTtcblx0fSk7XG5cblx0b25jZS5fX2VlT25jZUxpc3RlbmVyX18gPSBsaXN0ZW5lcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5vZmYgPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIpIHtcblx0dmFyIGRhdGEsIGxpc3RlbmVycywgY2FuZGlkYXRlLCBpO1xuXG5cdGNhbGxhYmxlKGxpc3RlbmVyKTtcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm4gdGhpcztcblx0ZGF0YSA9IHRoaXMuX19lZV9fO1xuXHRpZiAoIWRhdGFbdHlwZV0pIHJldHVybiB0aGlzO1xuXHRsaXN0ZW5lcnMgPSBkYXRhW3R5cGVdO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAoaSA9IDA7IChjYW5kaWRhdGUgPSBsaXN0ZW5lcnNbaV0pOyArK2kpIHtcblx0XHRcdGlmICgoY2FuZGlkYXRlID09PSBsaXN0ZW5lcikgfHxcblx0XHRcdFx0XHQoY2FuZGlkYXRlLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRcdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAyKSBkYXRhW3R5cGVdID0gbGlzdGVuZXJzW2kgPyAwIDogMV07XG5cdFx0XHRcdGVsc2UgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKChsaXN0ZW5lcnMgPT09IGxpc3RlbmVyKSB8fFxuXHRcdFx0XHQobGlzdGVuZXJzLl9fZWVPbmNlTGlzdGVuZXJfXyA9PT0gbGlzdGVuZXIpKSB7XG5cdFx0XHRkZWxldGUgZGF0YVt0eXBlXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAodHlwZSkge1xuXHR2YXIgaSwgbCwgbGlzdGVuZXIsIGxpc3RlbmVycywgYXJncztcblxuXHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19fZWVfXycpKSByZXR1cm47XG5cdGxpc3RlbmVycyA9IHRoaXMuX19lZV9fW3R5cGVdO1xuXHRpZiAoIWxpc3RlbmVycykgcmV0dXJuO1xuXG5cdGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnb2JqZWN0Jykge1xuXHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuXHRcdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0bGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKCk7XG5cdFx0Zm9yIChpID0gMDsgKGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldKTsgKytpKSB7XG5cdFx0XHRhcHBseS5jYWxsKGxpc3RlbmVyLCB0aGlzLCBhcmdzKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjYWxsLmNhbGwobGlzdGVuZXJzLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0Y2FsbC5jYWxsKGxpc3RlbmVycywgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdFx0YXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG5cdFx0XHRmb3IgKGkgPSAxOyBpIDwgbDsgKytpKSB7XG5cdFx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0fVxuXHRcdFx0YXBwbHkuY2FsbChsaXN0ZW5lcnMsIHRoaXMsIGFyZ3MpO1xuXHRcdH1cblx0fVxufTtcblxubWV0aG9kcyA9IHtcblx0b246IG9uLFxuXHRvbmNlOiBvbmNlLFxuXHRvZmY6IG9mZixcblx0ZW1pdDogZW1pdFxufTtcblxuZGVzY3JpcHRvcnMgPSB7XG5cdG9uOiBkKG9uKSxcblx0b25jZTogZChvbmNlKSxcblx0b2ZmOiBkKG9mZiksXG5cdGVtaXQ6IGQoZW1pdClcbn07XG5cbmJhc2UgPSBkZWZpbmVQcm9wZXJ0aWVzKHt9LCBkZXNjcmlwdG9ycyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uIChvKSB7XG5cdHJldHVybiAobyA9PSBudWxsKSA/IGNyZWF0ZShiYXNlKSA6IGRlZmluZVByb3BlcnRpZXMoT2JqZWN0KG8pLCBkZXNjcmlwdG9ycyk7XG59O1xuZXhwb3J0cy5tZXRob2RzID0gbWV0aG9kcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFzc2lnbiAgICAgICAgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9hc3NpZ24nKVxuICAsIG5vcm1hbGl6ZU9wdHMgPSByZXF1aXJlKCdlczUtZXh0L29iamVjdC9ub3JtYWxpemUtb3B0aW9ucycpXG4gICwgaXNDYWxsYWJsZSAgICA9IHJlcXVpcmUoJ2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlJylcbiAgLCBjb250YWlucyAgICAgID0gcmVxdWlyZSgnZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucycpXG5cbiAgLCBkO1xuXG5kID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZHNjciwgdmFsdWUvKiwgb3B0aW9ucyovKSB7XG5cdHZhciBjLCBlLCB3LCBvcHRpb25zLCBkZXNjO1xuXHRpZiAoKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB8fCAodHlwZW9mIGRzY3IgIT09ICdzdHJpbmcnKSkge1xuXHRcdG9wdGlvbnMgPSB2YWx1ZTtcblx0XHR2YWx1ZSA9IGRzY3I7XG5cdFx0ZHNjciA9IG51bGw7XG5cdH0gZWxzZSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1syXTtcblx0fVxuXHRpZiAoZHNjciA9PSBudWxsKSB7XG5cdFx0YyA9IHcgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdFx0dyA9IGNvbnRhaW5zLmNhbGwoZHNjciwgJ3cnKTtcblx0fVxuXG5cdGRlc2MgPSB7IHZhbHVlOiB2YWx1ZSwgY29uZmlndXJhYmxlOiBjLCBlbnVtZXJhYmxlOiBlLCB3cml0YWJsZTogdyB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcblxuZC5ncyA9IGZ1bmN0aW9uIChkc2NyLCBnZXQsIHNldC8qLCBvcHRpb25zKi8pIHtcblx0dmFyIGMsIGUsIG9wdGlvbnMsIGRlc2M7XG5cdGlmICh0eXBlb2YgZHNjciAhPT0gJ3N0cmluZycpIHtcblx0XHRvcHRpb25zID0gc2V0O1xuXHRcdHNldCA9IGdldDtcblx0XHRnZXQgPSBkc2NyO1xuXHRcdGRzY3IgPSBudWxsO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbM107XG5cdH1cblx0aWYgKGdldCA9PSBudWxsKSB7XG5cdFx0Z2V0ID0gdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKCFpc0NhbGxhYmxlKGdldCkpIHtcblx0XHRvcHRpb25zID0gZ2V0O1xuXHRcdGdldCA9IHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChzZXQgPT0gbnVsbCkge1xuXHRcdHNldCA9IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmICghaXNDYWxsYWJsZShzZXQpKSB7XG5cdFx0b3B0aW9ucyA9IHNldDtcblx0XHRzZXQgPSB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGRzY3IgPT0gbnVsbCkge1xuXHRcdGMgPSB0cnVlO1xuXHRcdGUgPSBmYWxzZTtcblx0fSBlbHNlIHtcblx0XHRjID0gY29udGFpbnMuY2FsbChkc2NyLCAnYycpO1xuXHRcdGUgPSBjb250YWlucy5jYWxsKGRzY3IsICdlJyk7XG5cdH1cblxuXHRkZXNjID0geyBnZXQ6IGdldCwgc2V0OiBzZXQsIGNvbmZpZ3VyYWJsZTogYywgZW51bWVyYWJsZTogZSB9O1xuXHRyZXR1cm4gIW9wdGlvbnMgPyBkZXNjIDogYXNzaWduKG5vcm1hbGl6ZU9wdHMob3B0aW9ucyksIGRlc2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IE9iamVjdC5hc3NpZ25cblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduLCBvYmo7XG5cdGlmICh0eXBlb2YgYXNzaWduICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdG9iaiA9IHsgZm9vOiAncmF6JyB9O1xuXHRhc3NpZ24ob2JqLCB7IGJhcjogJ2R3YScgfSwgeyB0cnp5OiAndHJ6eScgfSk7XG5cdHJldHVybiAob2JqLmZvbyArIG9iai5iYXIgKyBvYmoudHJ6eSkgPT09ICdyYXpkd2F0cnp5Jztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzICA9IHJlcXVpcmUoJy4uL2tleXMnKVxuICAsIHZhbHVlID0gcmVxdWlyZSgnLi4vdmFsaWQtdmFsdWUnKVxuXG4gICwgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlc3QsIHNyYy8qLCDigKZzcmNuKi8pIHtcblx0dmFyIGVycm9yLCBpLCBsID0gbWF4KGFyZ3VtZW50cy5sZW5ndGgsIDIpLCBhc3NpZ247XG5cdGRlc3QgPSBPYmplY3QodmFsdWUoZGVzdCkpO1xuXHRhc3NpZ24gPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0dHJ5IHsgZGVzdFtrZXldID0gc3JjW2tleV07IH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmICghZXJyb3IpIGVycm9yID0gZTtcblx0XHR9XG5cdH07XG5cdGZvciAoaSA9IDE7IGkgPCBsOyArK2kpIHtcblx0XHRzcmMgPSBhcmd1bWVudHNbaV07XG5cdFx0a2V5cyhzcmMpLmZvckVhY2goYXNzaWduKTtcblx0fVxuXHRpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkgdGhyb3cgZXJyb3I7XG5cdHJldHVybiBkZXN0O1xufTtcbiIsIi8vIERlcHJlY2F0ZWRcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pcy1pbXBsZW1lbnRlZCcpKClcblx0PyBPYmplY3Qua2V5c1xuXHQ6IHJlcXVpcmUoJy4vc2hpbScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0dHJ5IHtcblx0XHRPYmplY3Qua2V5cygncHJpbWl0aXZlJyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5cyA9IE9iamVjdC5rZXlzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcblx0cmV0dXJuIGtleXMob2JqZWN0ID09IG51bGwgPyBvYmplY3QgOiBPYmplY3Qob2JqZWN0KSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG52YXIgcHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIG9iaikge1xuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBzcmMpIG9ialtrZXldID0gc3JjW2tleV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLyosIOKApm9wdGlvbnMqLykge1xuXHR2YXIgcmVzdWx0ID0gY3JlYXRlKG51bGwpO1xuXHRmb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdGlmIChvcHRpb25zID09IG51bGwpIHJldHVybjtcblx0XHRwcm9jZXNzKE9iamVjdChvcHRpb25zKSwgcmVzdWx0KTtcblx0fSk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbikge1xuXHRpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKGZuICsgXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7XG5cdHJldHVybiBmbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSBudWxsIG9yIHVuZGVmaW5lZFwiKTtcblx0cmV0dXJuIHZhbHVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2lzLWltcGxlbWVudGVkJykoKVxuXHQ/IFN0cmluZy5wcm90b3R5cGUuY29udGFpbnNcblx0OiByZXF1aXJlKCcuL3NoaW0nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0ciA9ICdyYXpkd2F0cnp5JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc3RyLmNvbnRhaW5zICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiAoKHN0ci5jb250YWlucygnZHdhJykgPT09IHRydWUpICYmIChzdHIuY29udGFpbnMoJ2ZvbycpID09PSBmYWxzZSkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlYXJjaFN0cmluZy8qLCBwb3NpdGlvbiovKSB7XG5cdHJldHVybiBpbmRleE9mLmNhbGwodGhpcywgc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pID4gLTE7XG59O1xuIiwiLy8gU291cmNlOiBodHRwOi8vanNmaWRkbGUubmV0L3ZXeDhWL1xuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjAzMTk1L2Z1bGwtbGlzdC1vZi1qYXZhc2NyaXB0LWtleWNvZGVzXG5cbi8qKlxuICogQ29uZW5pZW5jZSBtZXRob2QgcmV0dXJucyBjb3JyZXNwb25kaW5nIHZhbHVlIGZvciBnaXZlbiBrZXlOYW1lIG9yIGtleUNvZGUuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0ga2V5Q29kZSB7TnVtYmVyfSBvciBrZXlOYW1lIHtTdHJpbmd9XG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VhcmNoSW5wdXQpIHtcbiAgLy8gS2V5Ym9hcmQgRXZlbnRzXG4gIGlmIChzZWFyY2hJbnB1dCAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIHNlYXJjaElucHV0KSB7XG4gICAgdmFyIGhhc0tleUNvZGUgPSBzZWFyY2hJbnB1dC53aGljaCB8fCBzZWFyY2hJbnB1dC5rZXlDb2RlIHx8IHNlYXJjaElucHV0LmNoYXJDb2RlXG4gICAgaWYgKGhhc0tleUNvZGUpIHNlYXJjaElucHV0ID0gaGFzS2V5Q29kZVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBzZWFyY2hJbnB1dCkgcmV0dXJuIG5hbWVzW3NlYXJjaElucHV0XVxuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSAoY2FzdCB0byBzdHJpbmcpXG4gIHZhciBzZWFyY2ggPSBTdHJpbmcoc2VhcmNoSW5wdXQpXG5cbiAgLy8gY2hlY2sgY29kZXNcbiAgdmFyIGZvdW5kTmFtZWRLZXkgPSBjb2Rlc1tzZWFyY2gudG9Mb3dlckNhc2UoKV1cbiAgaWYgKGZvdW5kTmFtZWRLZXkpIHJldHVybiBmb3VuZE5hbWVkS2V5XG5cbiAgLy8gY2hlY2sgYWxpYXNlc1xuICB2YXIgZm91bmROYW1lZEtleSA9IGFsaWFzZXNbc2VhcmNoLnRvTG93ZXJDYXNlKCldXG4gIGlmIChmb3VuZE5hbWVkS2V5KSByZXR1cm4gZm91bmROYW1lZEtleVxuXG4gIC8vIHdlaXJkIGNoYXJhY3Rlcj9cbiAgaWYgKHNlYXJjaC5sZW5ndGggPT09IDEpIHJldHVybiBzZWFyY2guY2hhckNvZGVBdCgwKVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLyoqXG4gKiBHZXQgYnkgbmFtZVxuICpcbiAqICAgZXhwb3J0cy5jb2RlWydlbnRlciddIC8vID0+IDEzXG4gKi9cblxudmFyIGNvZGVzID0gZXhwb3J0cy5jb2RlID0gZXhwb3J0cy5jb2RlcyA9IHtcbiAgJ2JhY2tzcGFjZSc6IDgsXG4gICd0YWInOiA5LFxuICAnZW50ZXInOiAxMyxcbiAgJ3NoaWZ0JzogMTYsXG4gICdjdHJsJzogMTcsXG4gICdhbHQnOiAxOCxcbiAgJ3BhdXNlL2JyZWFrJzogMTksXG4gICdjYXBzIGxvY2snOiAyMCxcbiAgJ2VzYyc6IDI3LFxuICAnc3BhY2UnOiAzMixcbiAgJ3BhZ2UgdXAnOiAzMyxcbiAgJ3BhZ2UgZG93bic6IDM0LFxuICAnZW5kJzogMzUsXG4gICdob21lJzogMzYsXG4gICdsZWZ0JzogMzcsXG4gICd1cCc6IDM4LFxuICAncmlnaHQnOiAzOSxcbiAgJ2Rvd24nOiA0MCxcbiAgJ2luc2VydCc6IDQ1LFxuICAnZGVsZXRlJzogNDYsXG4gICdjb21tYW5kJzogOTEsXG4gICdsZWZ0IGNvbW1hbmQnOiA5MSxcbiAgJ3JpZ2h0IGNvbW1hbmQnOiA5MyxcbiAgJ251bXBhZCAqJzogMTA2LFxuICAnbnVtcGFkICsnOiAxMDcsXG4gICdudW1wYWQgLSc6IDEwOSxcbiAgJ251bXBhZCAuJzogMTEwLFxuICAnbnVtcGFkIC8nOiAxMTEsXG4gICdudW0gbG9jayc6IDE0NCxcbiAgJ3Njcm9sbCBsb2NrJzogMTQ1LFxuICAnbXkgY29tcHV0ZXInOiAxODIsXG4gICdteSBjYWxjdWxhdG9yJzogMTgzLFxuICAnOyc6IDE4NixcbiAgJz0nOiAxODcsXG4gICcsJzogMTg4LFxuICAnLSc6IDE4OSxcbiAgJy4nOiAxOTAsXG4gICcvJzogMTkxLFxuICAnYCc6IDE5MixcbiAgJ1snOiAyMTksXG4gICdcXFxcJzogMjIwLFxuICAnXSc6IDIyMSxcbiAgXCInXCI6IDIyMlxufVxuXG4vLyBIZWxwZXIgYWxpYXNlc1xuXG52YXIgYWxpYXNlcyA9IGV4cG9ydHMuYWxpYXNlcyA9IHtcbiAgJ3dpbmRvd3MnOiA5MSxcbiAgJ+KHpyc6IDE2LFxuICAn4oylJzogMTgsXG4gICfijIMnOiAxNyxcbiAgJ+KMmCc6IDkxLFxuICAnY3RsJzogMTcsXG4gICdjb250cm9sJzogMTcsXG4gICdvcHRpb24nOiAxOCxcbiAgJ3BhdXNlJzogMTksXG4gICdicmVhayc6IDE5LFxuICAnY2Fwcyc6IDIwLFxuICAncmV0dXJuJzogMTMsXG4gICdlc2NhcGUnOiAyNyxcbiAgJ3NwYyc6IDMyLFxuICAncGd1cCc6IDMzLFxuICAncGdkbic6IDM0LFxuICAnaW5zJzogNDUsXG4gICdkZWwnOiA0NixcbiAgJ2NtZCc6IDkxXG59XG5cblxuLyohXG4gKiBQcm9ncmFtYXRpY2FsbHkgYWRkIHRoZSBmb2xsb3dpbmdcbiAqL1xuXG4vLyBsb3dlciBjYXNlIGNoYXJzXG5mb3IgKGkgPSA5NzsgaSA8IDEyMzsgaSsrKSBjb2Rlc1tTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGkgLSAzMlxuXG4vLyBudW1iZXJzXG5mb3IgKHZhciBpID0gNDg7IGkgPCA1ODsgaSsrKSBjb2Rlc1tpIC0gNDhdID0gaVxuXG4vLyBmdW5jdGlvbiBrZXlzXG5mb3IgKGkgPSAxOyBpIDwgMTM7IGkrKykgY29kZXNbJ2YnK2ldID0gaSArIDExMVxuXG4vLyBudW1wYWQga2V5c1xuZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIGNvZGVzWydudW1wYWQgJytpXSA9IGkgKyA5NlxuXG4vKipcbiAqIEdldCBieSBjb2RlXG4gKlxuICogICBleHBvcnRzLm5hbWVbMTNdIC8vID0+ICdFbnRlcidcbiAqL1xuXG52YXIgbmFtZXMgPSBleHBvcnRzLm5hbWVzID0gZXhwb3J0cy50aXRsZSA9IHt9IC8vIHRpdGxlIGZvciBiYWNrd2FyZCBjb21wYXRcblxuLy8gQ3JlYXRlIHJldmVyc2UgbWFwcGluZ1xuZm9yIChpIGluIGNvZGVzKSBuYW1lc1tjb2Rlc1tpXV0gPSBpXG5cbi8vIEFkZCBhbGlhc2VzXG5mb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gIGNvZGVzW2FsaWFzXSA9IGFsaWFzZXNbYWxpYXNdXG59XG4iLCJ2YXIgaW90YSA9IHJlcXVpcmUoXCJpb3RhLWFycmF5XCIpXG52YXIgaXNCdWZmZXIgPSByZXF1aXJlKFwiaXMtYnVmZmVyXCIpXG5cbnZhciBoYXNUeXBlZEFycmF5cyAgPSAoKHR5cGVvZiBGbG9hdDY0QXJyYXkpICE9PSBcInVuZGVmaW5lZFwiKVxuXG5mdW5jdGlvbiBjb21wYXJlMXN0KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gLSBiWzBdXG59XG5cbmZ1bmN0aW9uIG9yZGVyKCkge1xuICB2YXIgc3RyaWRlID0gdGhpcy5zdHJpZGVcbiAgdmFyIHRlcm1zID0gbmV3IEFycmF5KHN0cmlkZS5sZW5ndGgpXG4gIHZhciBpXG4gIGZvcihpPTA7IGk8dGVybXMubGVuZ3RoOyArK2kpIHtcbiAgICB0ZXJtc1tpXSA9IFtNYXRoLmFicyhzdHJpZGVbaV0pLCBpXVxuICB9XG4gIHRlcm1zLnNvcnQoY29tcGFyZTFzdClcbiAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheSh0ZXJtcy5sZW5ndGgpXG4gIGZvcihpPTA7IGk8cmVzdWx0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmVzdWx0W2ldID0gdGVybXNbaV1bMV1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVDb25zdHJ1Y3RvcihkdHlwZSwgZGltZW5zaW9uKSB7XG4gIHZhciBjbGFzc05hbWUgPSBbXCJWaWV3XCIsIGRpbWVuc2lvbiwgXCJkXCIsIGR0eXBlXS5qb2luKFwiXCIpXG4gIGlmKGRpbWVuc2lvbiA8IDApIHtcbiAgICBjbGFzc05hbWUgPSBcIlZpZXdfTmlsXCIgKyBkdHlwZVxuICB9XG4gIHZhciB1c2VHZXR0ZXJzID0gKGR0eXBlID09PSBcImdlbmVyaWNcIilcblxuICBpZihkaW1lbnNpb24gPT09IC0xKSB7XG4gICAgLy9TcGVjaWFsIGNhc2UgZm9yIHRyaXZpYWwgYXJyYXlzXG4gICAgdmFyIGNvZGUgPVxuICAgICAgXCJmdW5jdGlvbiBcIitjbGFzc05hbWUrXCIoYSl7dGhpcy5kYXRhPWE7fTtcXFxudmFyIHByb3RvPVwiK2NsYXNzTmFtZStcIi5wcm90b3R5cGU7XFxcbnByb3RvLmR0eXBlPSdcIitkdHlwZStcIic7XFxcbnByb3RvLmluZGV4PWZ1bmN0aW9uKCl7cmV0dXJuIC0xfTtcXFxucHJvdG8uc2l6ZT0wO1xcXG5wcm90by5kaW1lbnNpb249LTE7XFxcbnByb3RvLnNoYXBlPXByb3RvLnN0cmlkZT1wcm90by5vcmRlcj1bXTtcXFxucHJvdG8ubG89cHJvdG8uaGk9cHJvdG8udHJhbnNwb3NlPXByb3RvLnN0ZXA9XFxcbmZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBcIitjbGFzc05hbWUrXCIodGhpcy5kYXRhKTt9O1xcXG5wcm90by5nZXQ9cHJvdG8uc2V0PWZ1bmN0aW9uKCl7fTtcXFxucHJvdG8ucGljaz1mdW5jdGlvbigpe3JldHVybiBudWxsfTtcXFxucmV0dXJuIGZ1bmN0aW9uIGNvbnN0cnVjdF9cIitjbGFzc05hbWUrXCIoYSl7cmV0dXJuIG5ldyBcIitjbGFzc05hbWUrXCIoYSk7fVwiXG4gICAgdmFyIHByb2NlZHVyZSA9IG5ldyBGdW5jdGlvbihjb2RlKVxuICAgIHJldHVybiBwcm9jZWR1cmUoKVxuICB9IGVsc2UgaWYoZGltZW5zaW9uID09PSAwKSB7XG4gICAgLy9TcGVjaWFsIGNhc2UgZm9yIDBkIGFycmF5c1xuICAgIHZhciBjb2RlID1cbiAgICAgIFwiZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiKGEsZCkge1xcXG50aGlzLmRhdGEgPSBhO1xcXG50aGlzLm9mZnNldCA9IGRcXFxufTtcXFxudmFyIHByb3RvPVwiK2NsYXNzTmFtZStcIi5wcm90b3R5cGU7XFxcbnByb3RvLmR0eXBlPSdcIitkdHlwZStcIic7XFxcbnByb3RvLmluZGV4PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMub2Zmc2V0fTtcXFxucHJvdG8uZGltZW5zaW9uPTA7XFxcbnByb3RvLnNpemU9MTtcXFxucHJvdG8uc2hhcGU9XFxcbnByb3RvLnN0cmlkZT1cXFxucHJvdG8ub3JkZXI9W107XFxcbnByb3RvLmxvPVxcXG5wcm90by5oaT1cXFxucHJvdG8udHJhbnNwb3NlPVxcXG5wcm90by5zdGVwPWZ1bmN0aW9uIFwiK2NsYXNzTmFtZStcIl9jb3B5KCkge1xcXG5yZXR1cm4gbmV3IFwiK2NsYXNzTmFtZStcIih0aGlzLmRhdGEsdGhpcy5vZmZzZXQpXFxcbn07XFxcbnByb3RvLnBpY2s9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX3BpY2soKXtcXFxucmV0dXJuIFRyaXZpYWxBcnJheSh0aGlzLmRhdGEpO1xcXG59O1xcXG5wcm90by52YWx1ZU9mPXByb3RvLmdldD1mdW5jdGlvbiBcIitjbGFzc05hbWUrXCJfZ2V0KCl7XFxcbnJldHVybiBcIisodXNlR2V0dGVycyA/IFwidGhpcy5kYXRhLmdldCh0aGlzLm9mZnNldClcIiA6IFwidGhpcy5kYXRhW3RoaXMub2Zmc2V0XVwiKStcblwifTtcXFxucHJvdG8uc2V0PWZ1bmN0aW9uIFwiK2NsYXNzTmFtZStcIl9zZXQodil7XFxcbnJldHVybiBcIisodXNlR2V0dGVycyA/IFwidGhpcy5kYXRhLnNldCh0aGlzLm9mZnNldCx2KVwiIDogXCJ0aGlzLmRhdGFbdGhpcy5vZmZzZXRdPXZcIikrXCJcXFxufTtcXFxucmV0dXJuIGZ1bmN0aW9uIGNvbnN0cnVjdF9cIitjbGFzc05hbWUrXCIoYSxiLGMsZCl7cmV0dXJuIG5ldyBcIitjbGFzc05hbWUrXCIoYSxkKX1cIlxuICAgIHZhciBwcm9jZWR1cmUgPSBuZXcgRnVuY3Rpb24oXCJUcml2aWFsQXJyYXlcIiwgY29kZSlcbiAgICByZXR1cm4gcHJvY2VkdXJlKENBQ0hFRF9DT05TVFJVQ1RPUlNbZHR5cGVdWzBdKVxuICB9XG5cbiAgdmFyIGNvZGUgPSBbXCIndXNlIHN0cmljdCdcIl1cblxuICAvL0NyZWF0ZSBjb25zdHJ1Y3RvciBmb3Igdmlld1xuICB2YXIgaW5kaWNlcyA9IGlvdGEoZGltZW5zaW9uKVxuICB2YXIgYXJncyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIFwiaVwiK2kgfSlcbiAgdmFyIGluZGV4X3N0ciA9IFwidGhpcy5vZmZzZXQrXCIgKyBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICAgIHJldHVybiBcInRoaXMuc3RyaWRlW1wiICsgaSArIFwiXSppXCIgKyBpXG4gICAgICB9KS5qb2luKFwiK1wiKVxuICB2YXIgc2hhcGVBcmcgPSBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gXCJiXCIraVxuICAgIH0pLmpvaW4oXCIsXCIpXG4gIHZhciBzdHJpZGVBcmcgPSBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gXCJjXCIraVxuICAgIH0pLmpvaW4oXCIsXCIpXG4gIGNvZGUucHVzaChcbiAgICBcImZ1bmN0aW9uIFwiK2NsYXNzTmFtZStcIihhLFwiICsgc2hhcGVBcmcgKyBcIixcIiArIHN0cmlkZUFyZyArIFwiLGQpe3RoaXMuZGF0YT1hXCIsXG4gICAgICBcInRoaXMuc2hhcGU9W1wiICsgc2hhcGVBcmcgKyBcIl1cIixcbiAgICAgIFwidGhpcy5zdHJpZGU9W1wiICsgc3RyaWRlQXJnICsgXCJdXCIsXG4gICAgICBcInRoaXMub2Zmc2V0PWR8MH1cIixcbiAgICBcInZhciBwcm90bz1cIitjbGFzc05hbWUrXCIucHJvdG90eXBlXCIsXG4gICAgXCJwcm90by5kdHlwZT0nXCIrZHR5cGUrXCInXCIsXG4gICAgXCJwcm90by5kaW1lbnNpb249XCIrZGltZW5zaW9uKVxuXG4gIC8vdmlldy5zaXplOlxuICBjb2RlLnB1c2goXCJPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sJ3NpemUnLHtnZXQ6ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX3NpemUoKXtcXFxucmV0dXJuIFwiK2luZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIFwidGhpcy5zaGFwZVtcIitpK1wiXVwiIH0pLmpvaW4oXCIqXCIpLFxuXCJ9fSlcIilcblxuICAvL3ZpZXcub3JkZXI6XG4gIGlmKGRpbWVuc2lvbiA9PT0gMSkge1xuICAgIGNvZGUucHVzaChcInByb3RvLm9yZGVyPVswXVwiKVxuICB9IGVsc2Uge1xuICAgIGNvZGUucHVzaChcIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywnb3JkZXInLHtnZXQ6XCIpXG4gICAgaWYoZGltZW5zaW9uIDwgNCkge1xuICAgICAgY29kZS5wdXNoKFwiZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX29yZGVyKCl7XCIpXG4gICAgICBpZihkaW1lbnNpb24gPT09IDIpIHtcbiAgICAgICAgY29kZS5wdXNoKFwicmV0dXJuIChNYXRoLmFicyh0aGlzLnN0cmlkZVswXSk+TWF0aC5hYnModGhpcy5zdHJpZGVbMV0pKT9bMSwwXTpbMCwxXX19KVwiKVxuICAgICAgfSBlbHNlIGlmKGRpbWVuc2lvbiA9PT0gMykge1xuICAgICAgICBjb2RlLnB1c2goXG5cInZhciBzMD1NYXRoLmFicyh0aGlzLnN0cmlkZVswXSksczE9TWF0aC5hYnModGhpcy5zdHJpZGVbMV0pLHMyPU1hdGguYWJzKHRoaXMuc3RyaWRlWzJdKTtcXFxuaWYoczA+czEpe1xcXG5pZihzMT5zMil7XFxcbnJldHVybiBbMiwxLDBdO1xcXG59ZWxzZSBpZihzMD5zMil7XFxcbnJldHVybiBbMSwyLDBdO1xcXG59ZWxzZXtcXFxucmV0dXJuIFsxLDAsMl07XFxcbn1cXFxufWVsc2UgaWYoczA+czIpe1xcXG5yZXR1cm4gWzIsMCwxXTtcXFxufWVsc2UgaWYoczI+czEpe1xcXG5yZXR1cm4gWzAsMSwyXTtcXFxufWVsc2V7XFxcbnJldHVybiBbMCwyLDFdO1xcXG59fX0pXCIpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvZGUucHVzaChcIk9SREVSfSlcIilcbiAgICB9XG4gIH1cblxuICAvL3ZpZXcuc2V0KGkwLCAuLi4sIHYpOlxuICBjb2RlLnB1c2goXG5cInByb3RvLnNldD1mdW5jdGlvbiBcIitjbGFzc05hbWUrXCJfc2V0KFwiK2FyZ3Muam9pbihcIixcIikrXCIsdil7XCIpXG4gIGlmKHVzZUdldHRlcnMpIHtcbiAgICBjb2RlLnB1c2goXCJyZXR1cm4gdGhpcy5kYXRhLnNldChcIitpbmRleF9zdHIrXCIsdil9XCIpXG4gIH0gZWxzZSB7XG4gICAgY29kZS5wdXNoKFwicmV0dXJuIHRoaXMuZGF0YVtcIitpbmRleF9zdHIrXCJdPXZ9XCIpXG4gIH1cblxuICAvL3ZpZXcuZ2V0KGkwLCAuLi4pOlxuICBjb2RlLnB1c2goXCJwcm90by5nZXQ9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX2dldChcIithcmdzLmpvaW4oXCIsXCIpK1wiKXtcIilcbiAgaWYodXNlR2V0dGVycykge1xuICAgIGNvZGUucHVzaChcInJldHVybiB0aGlzLmRhdGEuZ2V0KFwiK2luZGV4X3N0citcIil9XCIpXG4gIH0gZWxzZSB7XG4gICAgY29kZS5wdXNoKFwicmV0dXJuIHRoaXMuZGF0YVtcIitpbmRleF9zdHIrXCJdfVwiKVxuICB9XG5cbiAgLy92aWV3LmluZGV4OlxuICBjb2RlLnB1c2goXG4gICAgXCJwcm90by5pbmRleD1mdW5jdGlvbiBcIitjbGFzc05hbWUrXCJfaW5kZXgoXCIsIGFyZ3Muam9pbigpLCBcIil7cmV0dXJuIFwiK2luZGV4X3N0citcIn1cIilcblxuICAvL3ZpZXcuaGkoKTpcbiAgY29kZS5wdXNoKFwicHJvdG8uaGk9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX2hpKFwiK2FyZ3Muam9pbihcIixcIikrXCIpe3JldHVybiBuZXcgXCIrY2xhc3NOYW1lK1wiKHRoaXMuZGF0YSxcIitcbiAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gW1wiKHR5cGVvZiBpXCIsaSxcIiE9PSdudW1iZXInfHxpXCIsaSxcIjwwKT90aGlzLnNoYXBlW1wiLCBpLCBcIl06aVwiLCBpLFwifDBcIl0uam9pbihcIlwiKVxuICAgIH0pLmpvaW4oXCIsXCIpK1wiLFwiK1xuICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBcInRoaXMuc3RyaWRlW1wiK2kgKyBcIl1cIlxuICAgIH0pLmpvaW4oXCIsXCIpK1wiLHRoaXMub2Zmc2V0KX1cIilcblxuICAvL3ZpZXcubG8oKTpcbiAgdmFyIGFfdmFycyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuIFwiYVwiK2krXCI9dGhpcy5zaGFwZVtcIitpK1wiXVwiIH0pXG4gIHZhciBjX3ZhcnMgPSBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiBcImNcIitpK1wiPXRoaXMuc3RyaWRlW1wiK2krXCJdXCIgfSlcbiAgY29kZS5wdXNoKFwicHJvdG8ubG89ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX2xvKFwiK2FyZ3Muam9pbihcIixcIikrXCIpe3ZhciBiPXRoaXMub2Zmc2V0LGQ9MCxcIithX3ZhcnMuam9pbihcIixcIikrXCIsXCIrY192YXJzLmpvaW4oXCIsXCIpKVxuICBmb3IodmFyIGk9MDsgaTxkaW1lbnNpb247ICsraSkge1xuICAgIGNvZGUucHVzaChcblwiaWYodHlwZW9mIGlcIitpK1wiPT09J251bWJlcicmJmlcIitpK1wiPj0wKXtcXFxuZD1pXCIraStcInwwO1xcXG5iKz1jXCIraStcIipkO1xcXG5hXCIraStcIi09ZH1cIilcbiAgfVxuICBjb2RlLnB1c2goXCJyZXR1cm4gbmV3IFwiK2NsYXNzTmFtZStcIih0aGlzLmRhdGEsXCIrXG4gICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuIFwiYVwiK2lcbiAgICB9KS5qb2luKFwiLFwiKStcIixcIitcbiAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gXCJjXCIraVxuICAgIH0pLmpvaW4oXCIsXCIpK1wiLGIpfVwiKVxuXG4gIC8vdmlldy5zdGVwKCk6XG4gIGNvZGUucHVzaChcInByb3RvLnN0ZXA9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX3N0ZXAoXCIrYXJncy5qb2luKFwiLFwiKStcIil7dmFyIFwiK1xuICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBcImFcIitpK1wiPXRoaXMuc2hhcGVbXCIraStcIl1cIlxuICAgIH0pLmpvaW4oXCIsXCIpK1wiLFwiK1xuICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBcImJcIitpK1wiPXRoaXMuc3RyaWRlW1wiK2krXCJdXCJcbiAgICB9KS5qb2luKFwiLFwiKStcIixjPXRoaXMub2Zmc2V0LGQ9MCxjZWlsPU1hdGguY2VpbFwiKVxuICBmb3IodmFyIGk9MDsgaTxkaW1lbnNpb247ICsraSkge1xuICAgIGNvZGUucHVzaChcblwiaWYodHlwZW9mIGlcIitpK1wiPT09J251bWJlcicpe1xcXG5kPWlcIitpK1wifDA7XFxcbmlmKGQ8MCl7XFxcbmMrPWJcIitpK1wiKihhXCIraStcIi0xKTtcXFxuYVwiK2krXCI9Y2VpbCgtYVwiK2krXCIvZClcXFxufWVsc2V7XFxcbmFcIitpK1wiPWNlaWwoYVwiK2krXCIvZClcXFxufVxcXG5iXCIraStcIio9ZFxcXG59XCIpXG4gIH1cbiAgY29kZS5wdXNoKFwicmV0dXJuIG5ldyBcIitjbGFzc05hbWUrXCIodGhpcy5kYXRhLFwiK1xuICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBcImFcIiArIGlcbiAgICB9KS5qb2luKFwiLFwiKStcIixcIitcbiAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gXCJiXCIgKyBpXG4gICAgfSkuam9pbihcIixcIikrXCIsYyl9XCIpXG5cbiAgLy92aWV3LnRyYW5zcG9zZSgpOlxuICB2YXIgdFNoYXBlID0gbmV3IEFycmF5KGRpbWVuc2lvbilcbiAgdmFyIHRTdHJpZGUgPSBuZXcgQXJyYXkoZGltZW5zaW9uKVxuICBmb3IodmFyIGk9MDsgaTxkaW1lbnNpb247ICsraSkge1xuICAgIHRTaGFwZVtpXSA9IFwiYVtpXCIraStcIl1cIlxuICAgIHRTdHJpZGVbaV0gPSBcImJbaVwiK2krXCJdXCJcbiAgfVxuICBjb2RlLnB1c2goXCJwcm90by50cmFuc3Bvc2U9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX3RyYW5zcG9zZShcIithcmdzK1wiKXtcIitcbiAgICBhcmdzLm1hcChmdW5jdGlvbihuLGlkeCkgeyByZXR1cm4gbiArIFwiPShcIiArIG4gKyBcIj09PXVuZGVmaW5lZD9cIiArIGlkeCArIFwiOlwiICsgbiArIFwifDApXCJ9KS5qb2luKFwiO1wiKSxcbiAgICBcInZhciBhPXRoaXMuc2hhcGUsYj10aGlzLnN0cmlkZTtyZXR1cm4gbmV3IFwiK2NsYXNzTmFtZStcIih0aGlzLmRhdGEsXCIrdFNoYXBlLmpvaW4oXCIsXCIpK1wiLFwiK3RTdHJpZGUuam9pbihcIixcIikrXCIsdGhpcy5vZmZzZXQpfVwiKVxuXG4gIC8vdmlldy5waWNrKCk6XG4gIGNvZGUucHVzaChcInByb3RvLnBpY2s9ZnVuY3Rpb24gXCIrY2xhc3NOYW1lK1wiX3BpY2soXCIrYXJncytcIil7dmFyIGE9W10sYj1bXSxjPXRoaXMub2Zmc2V0XCIpXG4gIGZvcih2YXIgaT0wOyBpPGRpbWVuc2lvbjsgKytpKSB7XG4gICAgY29kZS5wdXNoKFwiaWYodHlwZW9mIGlcIitpK1wiPT09J251bWJlcicmJmlcIitpK1wiPj0wKXtjPShjK3RoaXMuc3RyaWRlW1wiK2krXCJdKmlcIitpK1wiKXwwfWVsc2V7YS5wdXNoKHRoaXMuc2hhcGVbXCIraStcIl0pO2IucHVzaCh0aGlzLnN0cmlkZVtcIitpK1wiXSl9XCIpXG4gIH1cbiAgY29kZS5wdXNoKFwidmFyIGN0b3I9Q1RPUl9MSVNUW2EubGVuZ3RoKzFdO3JldHVybiBjdG9yKHRoaXMuZGF0YSxhLGIsYyl9XCIpXG5cbiAgLy9BZGQgcmV0dXJuIHN0YXRlbWVudFxuICBjb2RlLnB1c2goXCJyZXR1cm4gZnVuY3Rpb24gY29uc3RydWN0X1wiK2NsYXNzTmFtZStcIihkYXRhLHNoYXBlLHN0cmlkZSxvZmZzZXQpe3JldHVybiBuZXcgXCIrY2xhc3NOYW1lK1wiKGRhdGEsXCIrXG4gICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuIFwic2hhcGVbXCIraStcIl1cIlxuICAgIH0pLmpvaW4oXCIsXCIpK1wiLFwiK1xuICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBcInN0cmlkZVtcIitpK1wiXVwiXG4gICAgfSkuam9pbihcIixcIikrXCIsb2Zmc2V0KX1cIilcblxuICAvL0NvbXBpbGUgcHJvY2VkdXJlXG4gIHZhciBwcm9jZWR1cmUgPSBuZXcgRnVuY3Rpb24oXCJDVE9SX0xJU1RcIiwgXCJPUkRFUlwiLCBjb2RlLmpvaW4oXCJcXG5cIikpXG4gIHJldHVybiBwcm9jZWR1cmUoQ0FDSEVEX0NPTlNUUlVDVE9SU1tkdHlwZV0sIG9yZGVyKVxufVxuXG5mdW5jdGlvbiBhcnJheURUeXBlKGRhdGEpIHtcbiAgaWYoaXNCdWZmZXIoZGF0YSkpIHtcbiAgICByZXR1cm4gXCJidWZmZXJcIlxuICB9XG4gIGlmKGhhc1R5cGVkQXJyYXlzKSB7XG4gICAgc3dpdGNoKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSkge1xuICAgICAgY2FzZSBcIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiOlxuICAgICAgICByZXR1cm4gXCJmbG9hdDY0XCJcbiAgICAgIGNhc2UgXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIjpcbiAgICAgICAgcmV0dXJuIFwiZmxvYXQzMlwiXG4gICAgICBjYXNlIFwiW29iamVjdCBJbnQ4QXJyYXldXCI6XG4gICAgICAgIHJldHVybiBcImludDhcIlxuICAgICAgY2FzZSBcIltvYmplY3QgSW50MTZBcnJheV1cIjpcbiAgICAgICAgcmV0dXJuIFwiaW50MTZcIlxuICAgICAgY2FzZSBcIltvYmplY3QgSW50MzJBcnJheV1cIjpcbiAgICAgICAgcmV0dXJuIFwiaW50MzJcIlxuICAgICAgY2FzZSBcIltvYmplY3QgVWludDhBcnJheV1cIjpcbiAgICAgICAgcmV0dXJuIFwidWludDhcIlxuICAgICAgY2FzZSBcIltvYmplY3QgVWludDE2QXJyYXldXCI6XG4gICAgICAgIHJldHVybiBcInVpbnQxNlwiXG4gICAgICBjYXNlIFwiW29iamVjdCBVaW50MzJBcnJheV1cIjpcbiAgICAgICAgcmV0dXJuIFwidWludDMyXCJcbiAgICAgIGNhc2UgXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiOlxuICAgICAgICByZXR1cm4gXCJ1aW50OF9jbGFtcGVkXCJcbiAgICB9XG4gIH1cbiAgaWYoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIHJldHVybiBcImFycmF5XCJcbiAgfVxuICByZXR1cm4gXCJnZW5lcmljXCJcbn1cblxudmFyIENBQ0hFRF9DT05TVFJVQ1RPUlMgPSB7XG4gIFwiZmxvYXQzMlwiOltdLFxuICBcImZsb2F0NjRcIjpbXSxcbiAgXCJpbnQ4XCI6W10sXG4gIFwiaW50MTZcIjpbXSxcbiAgXCJpbnQzMlwiOltdLFxuICBcInVpbnQ4XCI6W10sXG4gIFwidWludDE2XCI6W10sXG4gIFwidWludDMyXCI6W10sXG4gIFwiYXJyYXlcIjpbXSxcbiAgXCJ1aW50OF9jbGFtcGVkXCI6W10sXG4gIFwiYnVmZmVyXCI6W10sXG4gIFwiZ2VuZXJpY1wiOltdXG59XG5cbjsoZnVuY3Rpb24oKSB7XG4gIGZvcih2YXIgaWQgaW4gQ0FDSEVEX0NPTlNUUlVDVE9SUykge1xuICAgIENBQ0hFRF9DT05TVFJVQ1RPUlNbaWRdLnB1c2goY29tcGlsZUNvbnN0cnVjdG9yKGlkLCAtMSkpXG4gIH1cbn0pO1xuXG5mdW5jdGlvbiB3cmFwcGVkTkRBcnJheUN0b3IoZGF0YSwgc2hhcGUsIHN0cmlkZSwgb2Zmc2V0KSB7XG4gIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBjdG9yID0gQ0FDSEVEX0NPTlNUUlVDVE9SUy5hcnJheVswXVxuICAgIHJldHVybiBjdG9yKFtdKVxuICB9IGVsc2UgaWYodHlwZW9mIGRhdGEgPT09IFwibnVtYmVyXCIpIHtcbiAgICBkYXRhID0gW2RhdGFdXG4gIH1cbiAgaWYoc2hhcGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHNoYXBlID0gWyBkYXRhLmxlbmd0aCBdXG4gIH1cbiAgdmFyIGQgPSBzaGFwZS5sZW5ndGhcbiAgaWYoc3RyaWRlID09PSB1bmRlZmluZWQpIHtcbiAgICBzdHJpZGUgPSBuZXcgQXJyYXkoZClcbiAgICBmb3IodmFyIGk9ZC0xLCBzej0xOyBpPj0wOyAtLWkpIHtcbiAgICAgIHN0cmlkZVtpXSA9IHN6XG4gICAgICBzeiAqPSBzaGFwZVtpXVxuICAgIH1cbiAgfVxuICBpZihvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIG9mZnNldCA9IDBcbiAgICBmb3IodmFyIGk9MDsgaTxkOyArK2kpIHtcbiAgICAgIGlmKHN0cmlkZVtpXSA8IDApIHtcbiAgICAgICAgb2Zmc2V0IC09IChzaGFwZVtpXS0xKSpzdHJpZGVbaV1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIGR0eXBlID0gYXJyYXlEVHlwZShkYXRhKVxuICB2YXIgY3Rvcl9saXN0ID0gQ0FDSEVEX0NPTlNUUlVDVE9SU1tkdHlwZV1cbiAgd2hpbGUoY3Rvcl9saXN0Lmxlbmd0aCA8PSBkKzEpIHtcbiAgICBjdG9yX2xpc3QucHVzaChjb21waWxlQ29uc3RydWN0b3IoZHR5cGUsIGN0b3JfbGlzdC5sZW5ndGgtMSkpXG4gIH1cbiAgdmFyIGN0b3IgPSBjdG9yX2xpc3RbZCsxXVxuICByZXR1cm4gY3RvcihkYXRhLCBzaGFwZSwgc3RyaWRlLCBvZmZzZXQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcHBlZE5EQXJyYXlDdG9yXG4iLCJcInVzZSBzdHJpY3RcIlxuXG5mdW5jdGlvbiBpb3RhKG4pIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShuKVxuICBmb3IodmFyIGk9MDsgaTxuOyArK2kpIHtcbiAgICByZXN1bHRbaV0gPSBpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlvdGEiLCIvKipcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgQnVmZmVyXG4gKlxuICogQXV0aG9yOiAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBMaWNlbnNlOiAgTUlUXG4gKlxuICogYG5wbSBpbnN0YWxsIGlzLWJ1ZmZlcmBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuICEhKG9iaiAhPSBudWxsICYmXG4gICAgKG9iai5faXNCdWZmZXIgfHwgLy8gRm9yIFNhZmFyaSA1LTcgKG1pc3NpbmcgT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvcilcbiAgICAgIChvYmouY29uc3RydWN0b3IgJiZcbiAgICAgIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopKVxuICAgICkpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciBjYW1lcmE7XG5cbiAgZnVuY3Rpb24gb25BdHRhY2goYXBwKSB7XG4gICAgY2FtZXJhID0gYXBwLmNvbnRhaW5lci5jYW1lcmE7XG4gIH07XG5cbiAgZnVuY3Rpb24gdGljayhkdCkge1xuICAgIHVwZGF0ZVBvc2l0aW9uKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVQb3NpdGlvbigpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAxKVxuICAgICAgLmFwcGx5RXVsZXIoc2VsZi5yb3RhdGlvbilcbiAgICAgIC5tdWx0aXBseVNjYWxhcihzZWxmLmRpc3RhbmNlKVxuICAgICAgLmFkZChzZWxmLnRhcmdldCk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmNvcHkocG9zaXRpb24pO1xuICAgIGNhbWVyYS5sb29rQXQoc2VsZi50YXJnZXQpO1xuICB9XG5cbiAgdmFyIHNlbGYgPSB7XG4gICAgb25BdHRhY2g6IG9uQXR0YWNoLFxuICAgIHRpY2s6IHRpY2ssXG4gICAgcm90YXRpb246IG5ldyBUSFJFRS5FdWxlcigtTWF0aC5QSSAvIDQsIE1hdGguUEkgLyA0LCAwLCAnWVhaJyksXG4gICAgZGlzdGFuY2U6IDIwLFxuICAgIHRhcmdldDogbmV3IFRIUkVFLlZlY3RvcjMoKVxuICB9O1xuXG4gIHJldHVybiBzZWxmO1xufTtcbiIsInZhciBtZXNoZXIgPSByZXF1aXJlKCcuLi92b3hlbC9tZXNoZXInKTtcbnZhciBuZGFycmF5ID0gcmVxdWlyZSgnbmRhcnJheScpO1xudmFyIEJsb2NrU2hlZXQgPSByZXF1aXJlKCcuLi91dGlscy9ibG9ja3NoZWV0Jyk7XG5cbnZhciBUdXJyZW50ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudHlwZSA9ICd0cnVlJztcblxuICB0aGlzLmJsb2NrU2hlZXQgPSBuZXcgQmxvY2tTaGVldCgpO1xuXG4gIHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIHRoaXMub2JqZWN0LmFkZCh0aGlzLmJsb2NrU2hlZXQub2JqZWN0KTtcblxuICB0aGlzLmNvbXBvbmVudHNCeVR5cGUgPSBudWxsO1xufTtcblxuVHVycmVudC5wcm90b3R5cGUub25BdHRhY2ggPSBmdW5jdGlvbihhcHApIHtcbiAgdGhpcy5jb21wb25lbnRzQnlUeXBlID0gYXBwLmNvbnRhaW5lci5jb21wb25lbnRzQnlUeXBlO1xuXG4gIHRoaXMuYmxvY2tTaGVldC5vbkF0dGFjaChhcHApO1xuICB0aGlzLmJsb2NrU2hlZXQubWF0ZXJpYWxUeXBlID0gJ2xhbWJlcnQnO1xuICB0aGlzLmJsb2NrU2hlZXQuZWxlbWVudE5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgdGhpcy5ibG9ja1NoZWV0LmF1dG9GYWNlQ2FtZXJhID0gZmFsc2U7XG4gIHRoaXMuY2h1bmsgPSBuZGFycmF5KFtdLCBbMywgMywgOF0pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgMzsgaysrKSB7XG4gICAgICAgIHRoaXMuY2h1bmsuc2V0KGksIGosIGssIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuY2h1bmsuc2V0KDEsIDEsIDMsIDEpO1xuICB0aGlzLmNodW5rLnNldCgxLCAxLCA0LCAxKTtcbiAgdGhpcy5jaHVuay5zZXQoMSwgMSwgNSwgMSk7XG4gIHRoaXMuY2h1bmsuc2V0KDEsIDEsIDYsIDEpO1xuICB0aGlzLmNodW5rLnNldCgxLCAxLCA3LCAxKTtcblxuICB0aGlzLmJsb2NrU2hlZXQuYmxvY2tzRGF0YSA9IHtcbiAgICBwYWxldHRlOiBbbnVsbCwgMHgzMzMzMzNdLFxuICAgIGNodW5rczogW3RoaXMuY2h1bmtdXG4gIH07XG5cbiAgdGhpcy5ibG9ja1NoZWV0LmNlbnRlci5zZXQoLTEuNSwgLTEuNSwgLTEuNSk7XG5cbiAgdGhpcy5vYmplY3Qucm90YXRpb24ub3JkZXIgPSAnWVhaJztcbn07XG5cblR1cnJlbnQucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbihkdCkge1xuICB0aGlzLmJsb2NrU2hlZXQudGljayhkdCk7XG59O1xuXG5UdXJyZW50LnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYmxvY2tTaGVldC5kaXNwb3NlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR1cnJlbnQ7XG4iLCJ2YXIgQmxvY2tTaGVldCA9IHJlcXVpcmUoJy4uL3V0aWxzL2Jsb2Nrc2hlZXQnKTtcblxudmFyIFpvbWJpZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnR5cGUgPSAnem9tYmllJztcbiAgXG4gIHRoaXMub2JqZWN0ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIHRoaXMuYmxvY2tTaGVldCA9IG51bGw7XG5cbiAgLy8gSW5qZWN0ZWRcbiAgdGhpcy5pbnB1dCA9IG51bGw7XG4gIHRoaXMuYXBwID0gbnVsbDtcbn07XG5cblpvbWJpZS5wcm90b3R5cGUub25BdHRhY2ggPSBmdW5jdGlvbihhcHApIHtcbiAgdmFyIGltYWdlcyA9IGFwcC5jb250YWluZXIuaW1hZ2VzO1xuICB0aGlzLmlucHV0ID0gYXBwLmNvbnRhaW5lci5pbnB1dDtcbiAgdGhpcy5hcHAgPSBhcHA7XG5cbiAgLy8gQWRkIHpvbWJpZSBibG9ja3NcbiAgYmxvY2tTaGVldCA9IG5ldyBCbG9ja1NoZWV0KCk7XG4gIGJsb2NrU2hlZXQubG9hZEltYWdlKGltYWdlc1snem9tYmllJ10sIDIpO1xuICBibG9ja1NoZWV0LmVsZW1lbnROZWVkc1VwZGF0ZSA9IHRydWU7XG4gIGJsb2NrU2hlZXQub2JqZWN0LnBvc2l0aW9uLnkgPSAwLjU7XG5cbiAgdGhpcy5ibG9ja1NoZWV0ID0gYmxvY2tTaGVldDtcblxuICB0aGlzLm9iamVjdC5hZGQoYmxvY2tTaGVldC5vYmplY3QpO1xuXG4gIHRoaXMuYmxvY2tTaGVldC5vbkF0dGFjaChhcHApO1xufTtcblxuWm9tYmllLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oZHQpIHtcbiAgdGhpcy5ibG9ja1NoZWV0LnRpY2soZHQpO1xufTtcblxuWm9tYmllLnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYmxvY2tTaGVldC5kaXNwb3NlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFpvbWJpZTtcbiIsInZhciBlZSA9IHJlcXVpcmUoJ2V2ZW50LWVtaXR0ZXInKTtcblxudmFyIFJ1bm5lciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm1hcCA9IHt9O1xuICB0aGlzLmNvbnRhaW5lciA9IHt9O1xuICB0aGlzLmV2ZW50cyA9IGVlKCk7XG59O1xuXG5SdW5uZXIucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50Ll9pZCA9PSBudWxsKSB7XG4gICAgY29tcG9uZW50Ll9pZCA9IGd1aWQoKTtcbiAgfVxuICB0aGlzLm1hcFtjb21wb25lbnQuX2lkXSA9IGNvbXBvbmVudDtcblxuICBpZiAoY29tcG9uZW50Lm9uQXR0YWNoICE9IG51bGwpIHtcbiAgICBjb21wb25lbnQub25BdHRhY2godGhpcyk7XG4gIH1cblxuICB0aGlzLmV2ZW50cy5lbWl0KCdhdHRhY2gnLCBjb21wb25lbnQpO1xufTtcblxuUnVubmVyLnByb3RvdHlwZS5kZXR0YWNoID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gIGRlbGV0ZSB0aGlzLm1hcFtjb21wb25lbnQuX2lkXTtcblxuICB0aGlzLmV2ZW50cy5lbWl0KCdkZXR0YWNoJywgY29tcG9uZW50KTtcbn07XG5cblJ1bm5lci5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKGR0KSB7XG4gIHZhciBjb21wb25lbnQ7XG4gIGZvciAodmFyIGlkIGluIHRoaXMubWFwKSB7XG4gICAgY29tcG9uZW50ID0gdGhpcy5tYXBbaWRdO1xuICAgIGlmIChjb21wb25lbnQudGljayAhPSBudWxsKSB7XG4gICAgICBjb21wb25lbnQudGljayhkdCk7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaWQgaW4gdGhpcy5tYXApIHtcbiAgICBjb21wb25lbnQgPSB0aGlzLm1hcFtpZF07XG4gICAgaWYgKGNvbXBvbmVudC5sYXRlVGljayAhPSBudWxsKSB7XG4gICAgICBjb21wb25lbnQubGF0ZVRpY2soKTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gIGZ1bmN0aW9uIHM0KCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgLnN1YnN0cmluZygxKTtcbiAgfVxuICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArXG4gICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBSdW5uZXIoKTtcbn07XG4iLCJ2YXIgVEhSRUUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snVEhSRUUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ1RIUkVFJ10gOiBudWxsKTtcblxudmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5yZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4NjY2NjY2KTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbnZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG52YXIgYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDY2NjY2Nik7XG52YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjUpO1xuZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoMC41LCAxLjAsIDAuMyk7XG5cbnNjZW5lLmFkZChhbWJpZW50TGlnaHQpO1xuc2NlbmUuYWRkKGRpcmVjdGlvbmFsTGlnaHQpO1xuXG52YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKFxuICA0NSxcbiAgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gIDAuMSxcbiAgMTAwMCk7XG5cbi8vIGltYWdlIGNhY2hlXG52YXIgaW1hZ2VzID0ge307XG5cbmZ1bmN0aW9uIGxvYWRBc3NldHMoZG9uZSkge1xuICB2YXIgdG90YWwgPSAxO1xuICB2YXIgY291bnQgPSAwO1xuXG4gIHZhciBpbWFnZUxvYWRlciA9IG5ldyBUSFJFRS5JbWFnZUxvYWRlcigpO1xuICBpbWFnZUxvYWRlci5sb2FkKFxuICAgICdpbWFnZXMvem9tYmllLnBuZycsXG4gICAgZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgIGltYWdlc1snem9tYmllJ10gPSBpbWFnZTtcbiAgICAgIGNvdW50Kys7XG4gICAgICBpZiAoY291bnQgPT09IHRvdGFsKSB7IGRvbmUoKTsgfVxuICAgIH0sXG4gICAgZnVuY3Rpb24oeGhyKSB7IC8qIFByb2dyZXNzICovIH0sXG4gICAgZnVuY3Rpb24oeGhyKSB7IC8qIEVycm9yICovXG4gICAgICBjb3VudCsrO1xuICAgICAgaWYgKGNvdW50ID09PSB0b3RhbCkgeyBkb25lKCk7IH1cbiAgICB9XG4gICk7XG59O1xuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn07XG5cbnZhciBkdCA9IDEwMDAgLyA2MDtcblxudmFyIGFwcCA9IHJlcXVpcmUoJy4vY29yZS9ydW5uZXInKSgpO1xuXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICBhcHAudGljayhkdCk7XG4gIHJlbmRlcigpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG59O1xuXG52YXIgUGh5c2ljcyA9IHJlcXVpcmUoJy4vdXRpbHMvcGh5c2ljcycpO1xudmFyIFpvbWJpZSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy96b21iaWUnKTtcbnZhciBEcmFnQ2FtZXJhID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2RyYWdjYW1lcmEnKTtcbnZhciBUdXJyZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3R1cnJlbnQnKTtcbnZhciBzcHJpdGVTaGVldDtcbnZhciBibG9ja1NoZWV0O1xudmFyIGRyYWdDYW1lcmE7XG5cbmxvYWRBc3NldHMoZnVuY3Rpb24oKSB7XG5cbiAgYXBwLmNvbnRhaW5lci5jYW1lcmEgPSBjYW1lcmE7XG4gIGFwcC5jb250YWluZXIuc2NlbmUgPSBzY2VuZTtcblxuICB2YXIgY29tcG9uZW50c0J5VHlwZSA9IHJlcXVpcmUoJy4vdXRpbHMvY29tcG9uZW50c2J5dHlwZScpKGFwcCk7XG4gIGFwcC5jb250YWluZXIuY29tcG9uZW50c0J5VHlwZSA9IGNvbXBvbmVudHNCeVR5cGU7XG5cbiAgLy8gU2V0IHVwIGlucHV0XG4gIHZhciBpbnB1dCA9IHJlcXVpcmUoJy4vdXRpbHMvaW5wdXQnKSgpO1xuICBhcHAuYXR0YWNoKGlucHV0KTtcbiAgYXBwLmNvbnRhaW5lci5pbnB1dCA9IGlucHV0O1xuXG4gIC8vIFNldCB1cCBwaHlzaWNzXG4gIHZhciBwaHlzaWNzID0gbmV3IFBoeXNpY3MoKTtcbiAgYXBwLmF0dGFjaChwaHlzaWNzKTtcbiAgdmFyIGdyb3VuZFNoYXBlID0gbmV3IENBTk5PTi5QbGFuZSgpO1xuICB2YXIgZ3JvdW5kQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAsIHNoYXBlOiBncm91bmRTaGFwZSB9KTtcbiAgZ3JvdW5kQm9keS5xdWF0ZXJuaW9uLnNldEZyb21FdWxlcigtTWF0aC5QSSAvIDIsIDAsIDApO1xuICBwaHlzaWNzLndvcmxkLmFkZChncm91bmRCb2R5KTtcbiAgcGh5c2ljcy53b3JsZC5ncmF2aXR5LnNldCgwLCAtOS44MiwgMCk7XG4gIGFwcC5jb250YWluZXIucGh5c2ljcyA9IHBoeXNpY3M7XG5cbiAgYXBwLmNvbnRhaW5lci5pbWFnZXMgPSBpbWFnZXM7XG5cbiAgdmFyIG51bSA9IDIwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgdmFyIHpvbWJpZSA9IG5ldyBab21iaWUoKTtcbiAgICBzY2VuZS5hZGQoem9tYmllLm9iamVjdCk7XG4gICAgYXBwLmF0dGFjaCh6b21iaWUpO1xuXG4gICAgem9tYmllLm9iamVjdC5wb3NpdGlvbi54ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMTA7XG4gICAgem9tYmllLm9iamVjdC5wb3NpdGlvbi56ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMTA7XG4gIH1cblxuICBkcmFnQ2FtZXJhID0gRHJhZ0NhbWVyYSgpO1xuICBhcHAuYXR0YWNoKGRyYWdDYW1lcmEpO1xuXG4gIC8vIHZhciB0dXJyZW50ID0gbmV3IFR1cnJlbnQoKTtcbiAgLy8gc2NlbmUuYWRkKHR1cnJlbnQub2JqZWN0KTtcbiAgLy8gdHVycmVudC5vYmplY3Quc2NhbGUuc2V0KDEgLyAxMiwgMSAvIDEyLCAxIC8gMTIpO1xuICAvLyBhcHAuYXR0YWNoKHR1cnJlbnQpO1xuICBcbiAgYW5pbWF0ZSgpO1xufSk7XG4iLCJ2YXIgbWVzaGVyID0gcmVxdWlyZSgnLi4vdm94ZWwvbWVzaGVyJyk7XG52YXIgbmRhcnJheSA9IHJlcXVpcmUoJ25kYXJyYXknKTtcblxudmFyIEJsb2NrU2hlZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50TmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICB0aGlzLm9iamVjdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCgpO1xuICB0aGlzLm9iamVjdC5hZGQodGhpcy5tZXNoKTtcblxuICB0aGlzLm1hdGVyaWFsVHlwZSA9ICdiYXNpYyc7XG4gIHRoaXMubWF0ZXJpYWwgPSBudWxsO1xuXG4gIC8vIGZyYW1lcywgcGFsZXR0ZVxuICB0aGlzLmJsb2Nrc0RhdGEgPSBudWxsO1xuICB0aGlzLmdlb21ldHJpZXMgPSBbXTtcblxuICB0aGlzLmZyYW1lcyA9IDE7XG4gIHRoaXMuZnJhbWUgPSAwO1xuICB0aGlzLmZyYW1lSW50ZXJ2YWwgPSBbXTtcbiAgdGhpcy5kZWZhdWx0RnJhbWVJbnRlcnZhbCA9IDUwMDtcbiAgdGhpcy5kdENvdW50ZXIgPSAwO1xuICB0aGlzLmNlbnRlciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgLy8gSW5qZWN0ZWRcbiAgdGhpcy5waHlzaWNzID0gbnVsbDtcbiAgdGhpcy5jYW1lcmEgPSBudWxsO1xuICB0aGlzLnNjZW5lID0gbnVsbDtcblxuICB0aGlzLmF1dG9GYWNlQ2FtZXJhID0gdHJ1ZTtcbn07XG5cbkJsb2NrU2hlZXQucHJvdG90eXBlLm9uQXR0YWNoID0gZnVuY3Rpb24oYXBwKSB7XG4gIHRoaXMucGh5c2ljcyA9IGFwcC5jb250YWluZXIucGh5c2ljcztcbiAgdGhpcy5jYW1lcmEgPSBhcHAuY29udGFpbmVyLmNhbWVyYTtcbiAgdGhpcy5zY2VuZSA9IGFwcC5jb250YWluZXIuc2NlbmU7XG59O1xuXG5CbG9ja1NoZWV0LnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oZHQpIHtcbiAgaWYgKHRoaXMuZWxlbWVudE5lZWRzVXBkYXRlKSB7XG4gICAgdGhpcy51cGRhdGVFbGVtZW50KCk7XG4gICAgdGhpcy5lbGVtZW50TmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgfVxuXG4gIHRoaXMuZHRDb3VudGVyICs9IGR0O1xuICB2YXIgZnJhbWVJbnRlcnZhbCA9IHRoaXMuZnJhbWVJbnRlcnZhbFt0aGlzLmZyYW1lXSB8fCB0aGlzLmRlZmF1bHRGcmFtZUludGVydmFsO1xuXG4gIGlmICh0aGlzLmR0Q291bnRlciA+IGZyYW1lSW50ZXJ2YWwpIHtcbiAgICB0aGlzLmR0Q291bnRlciAtPSBmcmFtZUludGVydmFsO1xuICAgIHRoaXMuZnJhbWUrKztcbiAgICB0aGlzLmZyYW1lICU9IHRoaXMuZnJhbWVzO1xuXG4gICAgdmFyIGdlb21ldHJ5ID0gdGhpcy5nZW9tZXRyaWVzW3RoaXMuZnJhbWVdO1xuICAgIGlmIChnZW9tZXRyeSA9PSBudWxsKSB7XG4gICAgICBnZW9tZXRyeSA9IG1lc2hlcih0aGlzLmJsb2Nrc0RhdGEuY2h1bmtzW3RoaXMuZnJhbWVdKTtcbiAgICAgIHRoaXMuZ2VvbWV0cmllc1t0aGlzLmZyYW1lXSA9IGdlb21ldHJ5O1xuICAgIH1cblxuICAgIHRoaXMubWVzaC5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICB9XG5cbiAgaWYgKHRoaXMuYXV0b0ZhY2VDYW1lcmEpIHtcbiAgICB0aGlzLm9iamVjdC5sb29rQXQodGhpcy5jYW1lcmEucG9zaXRpb24pO1xuICB9XG59O1xuXG5CbG9ja1NoZWV0LnByb3RvdHlwZS51cGRhdGVFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGlzcG9zZSgpO1xuICB0aGlzLnVwZGF0ZU1hdGVyaWFsKCk7XG4gIHRoaXMubWVzaC5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWw7XG4gIHRoaXMubWVzaC5wb3NpdGlvbi5jb3B5KHRoaXMuY2VudGVyKTtcbn07XG5cbkJsb2NrU2hlZXQucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubWF0ZXJpYWwgIT0gbnVsbCkge1xuICAgIHRoaXMubWF0ZXJpYWwubWF0ZXJpYWxzLmZvckVhY2goZnVuY3Rpb24obWF0ZXJpYWwpIHtcbiAgICAgIGlmIChtYXRlcmlhbCAhPSBudWxsKSB7XG4gICAgICAgIG1hdGVyaWFsLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2VvbWV0cmllcy5mb3JFYWNoKGZ1bmN0aW9uKGdlb21ldHJ5KSB7XG4gICAgZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICB9KTtcbn07XG5cbkJsb2NrU2hlZXQucHJvdG90eXBlLnVwZGF0ZU1hdGVyaWFsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTXVsdGlNYXRlcmlhbCgpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuYmxvY2tzRGF0YS5wYWxldHRlLmZvckVhY2goZnVuY3Rpb24oY29sb3IpIHtcbiAgICBpZiAoY29sb3IgPT0gbnVsbCkge1xuICAgICAgc2VsZi5tYXRlcmlhbC5tYXRlcmlhbHMucHVzaChudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5tYXRlcmlhbFR5cGUgPT09ICdsYW1iZXJ0Jykge1xuICAgICAgc2VsZi5tYXRlcmlhbC5tYXRlcmlhbHMucHVzaChuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XG4gICAgICAgIGNvbG9yOiBjb2xvclxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLm1hdGVyaWFsLm1hdGVyaWFscy5wdXNoKG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgIGNvbG9yOiBjb2xvclxuICAgICAgfSkpO1xuICAgIH1cblxuICB9KTtcbn07XG5cbkJsb2NrU2hlZXQucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uKGltYWdlLCBmcmFtZXMpIHtcbiAgdGhpcy5mcmFtZXMgPSBmcmFtZXM7XG4gIHRoaXMuYmxvY2tzRGF0YSA9IHRoaXMuaW1hZ2VUb0Jsb2NrcyhpbWFnZSwgZnJhbWVzKTtcbiAgdmFyIHNjYWxlID0gMSAvIGltYWdlLmhlaWdodDtcbiAgdGhpcy5vYmplY3Quc2NhbGUuc2V0KHNjYWxlLCBzY2FsZSwgc2NhbGUpO1xuICB0aGlzLmNlbnRlciA9IG5ldyBUSFJFRS5WZWN0b3IzKC1pbWFnZS53aWR0aCAvIGZyYW1lcyAvIDIsIC1pbWFnZS5oZWlnaHQgLyAyLCAwLjUpO1xufTtcblxuQmxvY2tTaGVldC5wcm90b3R5cGUuaW1hZ2VUb0Jsb2NrcyA9IGZ1bmN0aW9uKGltYWdlLCBmcmFtZXMpIHtcbiAgZnJhbWVzID0gZnJhbWVzIHx8IDE7XG5cbiAgLy8gVGVtcCBjYW52YXNcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpO1xuXG4gIHZhciBzaGFwZSA9IFtpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCAxXTtcbiAgdmFyIGNodW5rID0gbmRhcnJheShbXSwgc2hhcGUpO1xuICB2YXIgcGFsZXR0ZSA9IFtudWxsXTtcbiAgdmFyIGNvbG9yTWFwID0ge307XG5cbiAgdmFyIHdpZHRoID0gaW1hZ2Uud2lkdGg7XG4gIHZhciByb3csIGNvbHVtbiwgZnJhbWUsIGluZGV4O1xuICB2YXIgdG90YWxSb3dzID0gaW1hZ2UuaGVpZ2h0O1xuICB2YXIgZnJhbWVXaWR0aCA9IHdpZHRoIC8gZnJhbWVzO1xuICB2YXIgY2h1bmtzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZURhdGEuZGF0YS5sZW5ndGg7IGkgKz0gNCkge1xuICAgIHZhciByID0gaW1hZ2VEYXRhLmRhdGFbaV0gLyAyNTUuMDtcbiAgICB2YXIgZyA9IGltYWdlRGF0YS5kYXRhW2kgKyAxXSAvIDI1NS4wO1xuICAgIHZhciBiID0gaW1hZ2VEYXRhLmRhdGFbaSArIDJdIC8gMjU1LjA7XG4gICAgdmFyIGEgPSBpbWFnZURhdGEuZGF0YVtpICsgM10gLyAyNTUuMDtcbiAgICBpZiAoYSA9PT0gMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHZhciBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcihyLCBnLCBiKS5nZXRIZXgoKTtcblxuICAgIHJvdyA9ICgtTWF0aC5mbG9vcihpIC8gNCAvIHdpZHRoKSAtIDIpICUgdG90YWxSb3dzO1xuICAgIGNvbHVtbiA9IChpIC8gNCkgJSB3aWR0aDtcbiAgICBmcmFtZSA9IE1hdGguZmxvb3IoY29sdW1uIC8gZnJhbWVXaWR0aCk7XG4gICAgY29sdW1uIC09IGZyYW1lICogZnJhbWVXaWR0aDtcblxuICAgIGlmIChjb2xvck1hcFtjb2xvcl0pIHtcbiAgICAgIGluZGV4ID0gY29sb3JNYXBbY29sb3JdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleCA9IHBhbGV0dGUubGVuZ3RoO1xuICAgICAgcGFsZXR0ZS5wdXNoKGNvbG9yKTtcbiAgICAgIGNvbG9yTWFwW2NvbG9yXSA9IGluZGV4O1xuICAgIH1cblxuICAgIGlmIChjaHVua3NbZnJhbWVdID09IG51bGwpIHtcbiAgICAgIGNodW5rc1tmcmFtZV0gPSBuZGFycmF5KFtdLCBbZnJhbWVXaWR0aCwgaW1hZ2UuaGVpZ2h0LCAxXSk7XG4gICAgfVxuICAgIGNodW5rc1tmcmFtZV0uc2V0KGNvbHVtbiArIDEsIHJvdywgMSwgaW5kZXgpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjaHVua3M6IGNodW5rcyxcbiAgICBwYWxldHRlOiBwYWxldHRlXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrU2hlZXQ7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICB2YXIgbWFwID0ge307XG5cbiAgYXBwLmV2ZW50cy5vbignYXR0YWNoJywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgaWYgKGNvbXBvbmVudC50eXBlICE9IG51bGwpIHtcbiAgICAgIGlmIChtYXBbY29tcG9uZW50LnR5cGVdID09IG51bGwpIHtcbiAgICAgICAgbWFwW2NvbXBvbmVudC50eXBlXSA9IHt9O1xuICAgICAgfVxuICAgICAgbWFwW2NvbXBvbmVudC50eXBlXVtjb21wb25lbnQuX2lkXSA9IGNvbXBvbmVudDtcbiAgICB9XG4gIH0pO1xuXG4gIGFwcC5ldmVudHMub24oJ2RldHRhY2gnLCBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICBpZiAoY29tcG9uZW50LnR5cGUgIT0gbnVsbCkge1xuICAgICAgaWYgKG1hcFtjb21wb25lbnQudHlwZV0gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkZWxldGUgbWFwW2NvbXBvbmVudC50eXBlXVtjb21wb25lbnQuX2lkXTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGdldEFsbCh0eXBlKSB7XG4gICAgcmV0dXJuIG1hcFt0eXBlXSB8fCB7fTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldEFsbDogZ2V0QWxsXG4gIH07XG59O1xuIiwidmFyIGtleWNvZGUgPSByZXF1aXJlKCdrZXljb2RlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlEb3duKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgb25LZXlVcCk7XG5cbiAgdmFyIGtleUhvbGRzID0ge307XG4gIHZhciBrZXlEb3ducyA9IHt9O1xuICB2YXIga2V5VXBzID0ge307XG5cbiAgZnVuY3Rpb24gb25LZXlEb3duKGUpIHtcbiAgICB2YXIga2V5ID0ga2V5Y29kZShlKTtcbiAgICBpZiAoIWtleUhvbGRzW2tleV0pIHtcbiAgICAgIGtleURvd25zW2tleV0gPSB0cnVlO1xuICAgIH1cbiAgICBrZXlIb2xkc1trZXldID0gdHJ1ZTtcbiAgfTtcblxuICBmdW5jdGlvbiBvbktleVVwKGUpIHtcbiAgICB2YXIga2V5ID0ga2V5Y29kZShlKTtcbiAgICBrZXlIb2xkc1trZXldID0gZmFsc2U7XG4gICAga2V5VXBzW2tleV0gPSB0cnVlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGxhdGVUaWNrKCkge1xuICAgIGtleURvd25zID0ge307XG4gICAga2V5VXBzID0ge307XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBsYXRlVGljazogbGF0ZVRpY2ssXG5cbiAgICBrZXk6IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiBrZXlIb2xkc1trXSB8fCBmYWxzZTtcbiAgICB9LFxuICAgIGtleURvd246IGZ1bmN0aW9uKGspIHtcbiAgICAgIHJldHVybiBrZXlEb3duc1trXSB8fCBmYWxzZTtcbiAgICB9LFxuICAgIGtleVVwOiBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4ga2V5VXBzW2tdIHx8IGZhbHNlO1xuICAgIH1cbiAgfVxufTtcbiIsInZhciBDQU5OT04gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQ0FOTk9OJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydDQU5OT04nXSA6IG51bGwpO1xuXG52YXIgUGh5c2ljcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLndvcmxkID0gbmV3IENBTk5PTi5Xb3JsZCgpO1xuICB0aGlzLm1heFN1YlN0ZXBzID0gMztcbiAgdGhpcy5maXhlZFRpbWVTdGVwID0gMSAvIDYwLjA7XG5cbiAgdGhpcy5tYXAgPSB7fTtcbn07XG5cblBoeXNpY3MucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG9iaiwgYm9keSkge1xuICB0aGlzLm1hcFtvYmoudXVpZF0gPSB7XG4gICAgb2JqOiBvYmosXG4gICAgYm9keTogYm9keVxuICB9O1xuXG4gIHRoaXMud29ybGQuYWRkQm9keShib2R5KTtcbn07XG5cblBoeXNpY3MucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbihkdCkge1xuICB0aGlzLndvcmxkLnN0ZXAodGhpcy5maXhlZFRpbWVTdGVwLCBkdCAvIDEwMDAsIHRoaXMubWF4U3ViU3RlcHMpO1xuXG4gIHZhciBvYmosIGJvZHk7XG4gIGZvciAodmFyIGlkIGluIHRoaXMubWFwKSB7XG4gICAgb2JqID0gdGhpcy5tYXBbaWRdLm9iajtcbiAgICBib2R5ID0gdGhpcy5tYXBbaWRdLmJvZHk7XG5cbiAgICBvYmoucG9zaXRpb24ueCA9IGJvZHkucG9zaXRpb24ueDtcbiAgICBvYmoucG9zaXRpb24ueSA9IGJvZHkucG9zaXRpb24ueTtcbiAgICBvYmoucG9zaXRpb24ueiA9IGJvZHkucG9zaXRpb24uejtcbiAgICBvYmoucXVhdGVybmlvbi54ID0gYm9keS5xdWF0ZXJuaW9uLng7XG4gICAgb2JqLnF1YXRlcm5pb24ueSA9IGJvZHkucXVhdGVybmlvbi55O1xuICAgIG9iai5xdWF0ZXJuaW9uLnogPSBib2R5LnF1YXRlcm5pb24uejtcbiAgICBvYmoucXVhdGVybmlvbi53ID0gYm9keS5xdWF0ZXJuaW9uLnc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGh5c2ljcztcbiIsInZhciBHcmVlZHlNZXNoID0gKGZ1bmN0aW9uKCkge1xuICAvL0NhY2hlIGJ1ZmZlciBpbnRlcm5hbGx5XG4gIHZhciBtYXNrID0gbmV3IEludDMyQXJyYXkoNDA5Nik7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGYsIGRpbXMpIHtcbiAgICB2YXIgdmVydGljZXMgPSBbXSxcbiAgICAgIGZhY2VzID0gW10sXG4gICAgICBkaW1zWCA9IGRpbXNbMF0sXG4gICAgICBkaW1zWSA9IGRpbXNbMV0sXG4gICAgICBkaW1zWFkgPSBkaW1zWCAqIGRpbXNZO1xuXG4gICAgLy9Td2VlcCBvdmVyIDMtYXhlc1xuICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMzsgKytkKSB7XG4gICAgICB2YXIgaSwgaiwgaywgbCwgdywgVywgaCwgbiwgYywgdSA9IChkICsgMSkgJSAzLFxuICAgICAgICB2ID0gKGQgKyAyKSAlIDMsXG4gICAgICAgIHggPSBbMCwgMCwgMF0sXG4gICAgICAgIHEgPSBbMCwgMCwgMF0sXG4gICAgICAgIGR1ID0gWzAsIDAsIDBdLFxuICAgICAgICBkdiA9IFswLCAwLCAwXSxcbiAgICAgICAgZGltc0QgPSBkaW1zW2RdLFxuICAgICAgICBkaW1zVSA9IGRpbXNbdV0sXG4gICAgICAgIGRpbXNWID0gZGltc1t2XSxcbiAgICAgICAgcWRpbXNYLCBxZGltc1hZLCB4ZFxuXG4gICAgICBpZiAobWFzay5sZW5ndGggPCBkaW1zVSAqIGRpbXNWKSB7XG4gICAgICAgIG1hc2sgPSBuZXcgSW50MzJBcnJheShkaW1zVSAqIGRpbXNWKTtcbiAgICAgIH1cblxuICAgICAgcVtkXSA9IDE7XG4gICAgICB4W2RdID0gLTE7XG5cbiAgICAgIHFkaW1zWCA9IGRpbXNYICogcVsxXVxuICAgICAgcWRpbXNYWSA9IGRpbXNYWSAqIHFbMl1cblxuICAgICAgLy8gQ29tcHV0ZSBtYXNrXG4gICAgICB3aGlsZSAoeFtkXSA8IGRpbXNEKSB7XG4gICAgICAgIHhkID0geFtkXVxuICAgICAgICBuID0gMDtcblxuICAgICAgICBmb3IgKHhbdl0gPSAwOyB4W3ZdIDwgZGltc1Y7ICsreFt2XSkge1xuICAgICAgICAgIGZvciAoeFt1XSA9IDA7IHhbdV0gPCBkaW1zVTsgKyt4W3VdLCArK24pIHtcbiAgICAgICAgICAgIHZhciBhID0geGQgPj0gMCAmJiBmKHhbMF0sIHhbMV0sIHhbMl0pLFxuICAgICAgICAgICAgICBiID0geGQgPCBkaW1zRCAtIDEgJiYgZih4WzBdICsgcVswXSwgeFsxXSArIHFbMV0sIHhbMl0gKyBxWzJdKVxuICAgICAgICAgICAgaWYgKGEgPyBiIDogIWIpIHtcbiAgICAgICAgICAgICAgbWFza1tuXSA9IDA7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFza1tuXSA9IGEgPyBhIDogLWI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgKyt4W2RdO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIG1lc2ggZm9yIG1hc2sgdXNpbmcgbGV4aWNvZ3JhcGhpYyBvcmRlcmluZ1xuICAgICAgICBuID0gMDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGRpbXNWOyArK2opIHtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZGltc1U7KSB7XG4gICAgICAgICAgICBjID0gbWFza1tuXTtcbiAgICAgICAgICAgIGlmICghYykge1xuICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgIG4rKztcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vQ29tcHV0ZSB3aWR0aFxuICAgICAgICAgICAgdyA9IDE7XG4gICAgICAgICAgICB3aGlsZSAoYyA9PT0gbWFza1tuICsgd10gJiYgaSArIHcgPCBkaW1zVSkgdysrO1xuXG4gICAgICAgICAgICAvL0NvbXB1dGUgaGVpZ2h0ICh0aGlzIGlzIHNsaWdodGx5IGF3a3dhcmQpXG4gICAgICAgICAgICBmb3IgKGggPSAxOyBqICsgaCA8IGRpbXNWOyArK2gpIHtcbiAgICAgICAgICAgICAgayA9IDA7XG4gICAgICAgICAgICAgIHdoaWxlIChrIDwgdyAmJiBjID09PSBtYXNrW24gKyBrICsgaCAqIGRpbXNVXSkgaysrXG4gICAgICAgICAgICAgICAgaWYgKGsgPCB3KSBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIHF1YWRcbiAgICAgICAgICAgIC8vIFRoZSBkdS9kdiBhcnJheXMgYXJlIHJldXNlZC9yZXNldFxuICAgICAgICAgICAgLy8gZm9yIGVhY2ggaXRlcmF0aW9uLlxuICAgICAgICAgICAgZHVbZF0gPSAwO1xuICAgICAgICAgICAgZHZbZF0gPSAwO1xuICAgICAgICAgICAgeFt1XSA9IGk7XG4gICAgICAgICAgICB4W3ZdID0gajtcblxuICAgICAgICAgICAgaWYgKGMgPiAwKSB7XG4gICAgICAgICAgICAgIGR2W3ZdID0gaDtcbiAgICAgICAgICAgICAgZHZbdV0gPSAwO1xuICAgICAgICAgICAgICBkdVt1XSA9IHc7XG4gICAgICAgICAgICAgIGR1W3ZdID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGMgPSAtYztcbiAgICAgICAgICAgICAgZHVbdl0gPSBoO1xuICAgICAgICAgICAgICBkdVt1XSA9IDA7XG4gICAgICAgICAgICAgIGR2W3VdID0gdztcbiAgICAgICAgICAgICAgZHZbdl0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZlcnRleF9jb3VudCA9IHZlcnRpY2VzLmxlbmd0aDtcbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goW3hbMF0sIHhbMV0sIHhbMl1dKTtcbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goW3hbMF0gKyBkdVswXSwgeFsxXSArIGR1WzFdLCB4WzJdICsgZHVbMl1dKTtcbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goW3hbMF0gKyBkdVswXSArIGR2WzBdLCB4WzFdICsgZHVbMV0gKyBkdlsxXSwgeFsyXSArIGR1WzJdICsgZHZbMl1dKTtcbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goW3hbMF0gKyBkdlswXSwgeFsxXSArIGR2WzFdLCB4WzJdICsgZHZbMl1dKTtcbiAgICAgICAgICAgIGZhY2VzLnB1c2goW3ZlcnRleF9jb3VudCwgdmVydGV4X2NvdW50ICsgMSwgdmVydGV4X2NvdW50ICsgMiwgdmVydGV4X2NvdW50ICsgMywgY10pO1xuXG4gICAgICAgICAgICAvL1plcm8tb3V0IG1hc2tcbiAgICAgICAgICAgIFcgPSBuICsgdztcbiAgICAgICAgICAgIGZvciAobCA9IDA7IGwgPCBoOyArK2wpIHtcbiAgICAgICAgICAgICAgZm9yIChrID0gbjsgayA8IFc7ICsraykge1xuICAgICAgICAgICAgICAgIG1hc2tbayArIGwgKiBkaW1zVV0gPSAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vSW5jcmVtZW50IGNvdW50ZXJzIGFuZCBjb250aW51ZVxuICAgICAgICAgICAgaSArPSB3O1xuICAgICAgICAgICAgbiArPSB3O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB2ZXJ0aWNlczogdmVydGljZXMsIGZhY2VzOiBmYWNlcyB9O1xuICB9XG59KSgpO1xuXG5pZiAoZXhwb3J0cykge1xuICBleHBvcnRzLm1lc2hlciA9IEdyZWVkeU1lc2g7XG59XG4iLCJ2YXIgbW9ub3RvbmVNZXNoZXIgPSByZXF1aXJlKCcuL21vbm90b25lJykubWVzaGVyO1xudmFyIGdyZWVkeU1lc2hlciA9IHJlcXVpcmUoJy4vZ3JlZWR5JykubWVzaGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNodW5rKSB7XG4gIHZhciBmID0gZnVuY3Rpb24oaSwgaiwgaykge1xuICAgIHJldHVybiBjaHVuay5nZXQoaSwgaiwgayk7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gZ3JlZWR5TWVzaGVyKGYsIGNodW5rLnNoYXBlKTtcblxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcblxuICByZXN1bHQuZmFjZXMuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgdmFyIGZhY2UxID0gbmV3IFRIUkVFLkZhY2UzKGZbMF0sIGZbMV0sIGZbMl0pO1xuICAgIGZhY2UxLm1hdGVyaWFsSW5kZXggPSBmWzRdO1xuICAgIHZhciBmYWNlMiA9IG5ldyBUSFJFRS5GYWNlMyhmWzJdLCBmWzNdLCBmWzBdKTtcbiAgICBmYWNlMi5tYXRlcmlhbEluZGV4ID0gZls0XTtcbiAgICBnZW9tZXRyeS5mYWNlcy5wdXNoKGZhY2UxLCBmYWNlMik7XG4gIH0pO1xuXG4gIHJlc3VsdC52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgdmVydGljZSA9IG5ldyBUSFJFRS5WZWN0b3IzKHZbMF0sIHZbMV0sIHZbMl0pO1xuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydGljZSk7XG4gIH0pO1xuXG4gIGdlb21ldHJ5LmNvbXB1dGVGYWNlTm9ybWFscygpO1xuXG4gIHJldHVybiBnZW9tZXRyeTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE1vbm90b25lTWVzaCA9IChmdW5jdGlvbigpe1xuXG5mdW5jdGlvbiBNb25vdG9uZVBvbHlnb24oYywgdiwgdWwsIHVyKSB7XG4gIHRoaXMuY29sb3IgID0gYztcbiAgdGhpcy5sZWZ0ICAgPSBbW3VsLCB2XV07XG4gIHRoaXMucmlnaHQgID0gW1t1ciwgdl1dO1xufTtcblxuTW9ub3RvbmVQb2x5Z29uLnByb3RvdHlwZS5jbG9zZV9vZmYgPSBmdW5jdGlvbih2KSB7XG4gIHRoaXMubGVmdC5wdXNoKFsgdGhpcy5sZWZ0W3RoaXMubGVmdC5sZW5ndGgtMV1bMF0sIHYgXSk7XG4gIHRoaXMucmlnaHQucHVzaChbIHRoaXMucmlnaHRbdGhpcy5yaWdodC5sZW5ndGgtMV1bMF0sIHYgXSk7XG59O1xuXG5Nb25vdG9uZVBvbHlnb24ucHJvdG90eXBlLm1lcmdlX3J1biA9IGZ1bmN0aW9uKHYsIHVfbCwgdV9yKSB7XG4gIHZhciBsID0gdGhpcy5sZWZ0W3RoaXMubGVmdC5sZW5ndGgtMV1bMF1cbiAgICAsIHIgPSB0aGlzLnJpZ2h0W3RoaXMucmlnaHQubGVuZ3RoLTFdWzBdOyBcbiAgaWYobCAhPT0gdV9sKSB7XG4gICAgdGhpcy5sZWZ0LnB1c2goWyBsLCB2IF0pO1xuICAgIHRoaXMubGVmdC5wdXNoKFsgdV9sLCB2IF0pO1xuICB9XG4gIGlmKHIgIT09IHVfcikge1xuICAgIHRoaXMucmlnaHQucHVzaChbIHIsIHYgXSk7XG4gICAgdGhpcy5yaWdodC5wdXNoKFsgdV9yLCB2IF0pO1xuICB9XG59O1xuXG5cbnJldHVybiBmdW5jdGlvbihmLCBkaW1zKSB7XG4gIC8vU3dlZXAgb3ZlciAzLWF4ZXNcbiAgdmFyIHZlcnRpY2VzID0gW10sIGZhY2VzID0gW107XG4gIGZvcih2YXIgZD0wOyBkPDM7ICsrZCkge1xuICAgIHZhciBpLCBqLCBrXG4gICAgICAsIHUgPSAoZCsxKSUzICAgLy91IGFuZCB2IGFyZSBvcnRob2dvbmFsIGRpcmVjdGlvbnMgdG8gZFxuICAgICAgLCB2ID0gKGQrMiklM1xuICAgICAgLCB4ID0gbmV3IEludDMyQXJyYXkoMylcbiAgICAgICwgcSA9IG5ldyBJbnQzMkFycmF5KDMpXG4gICAgICAsIHJ1bnMgPSBuZXcgSW50MzJBcnJheSgyICogKGRpbXNbdV0rMSkpXG4gICAgICAsIGZyb250aWVyID0gbmV3IEludDMyQXJyYXkoZGltc1t1XSkgIC8vRnJvbnRpZXIgaXMgbGlzdCBvZiBwb2ludGVycyB0byBwb2x5Z29uc1xuICAgICAgLCBuZXh0X2Zyb250aWVyID0gbmV3IEludDMyQXJyYXkoZGltc1t1XSlcbiAgICAgICwgbGVmdF9pbmRleCA9IG5ldyBJbnQzMkFycmF5KDIgKiBkaW1zW3ZdKVxuICAgICAgLCByaWdodF9pbmRleCA9IG5ldyBJbnQzMkFycmF5KDIgKiBkaW1zW3ZdKVxuICAgICAgLCBzdGFjayA9IG5ldyBJbnQzMkFycmF5KDI0ICogZGltc1t2XSlcbiAgICAgICwgZGVsdGEgPSBbWzAsMF0sIFswLDBdXTtcbiAgICAvL3EgcG9pbnRzIGFsb25nIGQtZGlyZWN0aW9uXG4gICAgcVtkXSA9IDE7XG4gICAgLy9Jbml0aWFsaXplIHNlbnRpbmVsXG4gICAgZm9yKHhbZF09LTE7IHhbZF08ZGltc1tkXTsgKSB7XG4gICAgICAvLyAtLS0gUGVyZm9ybSBtb25vdG9uZSBwb2x5Z29uIHN1YmRpdmlzaW9uIC0tLVxuICAgICAgdmFyIG4gPSAwXG4gICAgICAgICwgcG9seWdvbnMgPSBbXVxuICAgICAgICAsIG5mID0gMDtcbiAgICAgIGZvcih4W3ZdPTA7IHhbdl08ZGltc1t2XTsgKyt4W3ZdKSB7XG4gICAgICAgIC8vTWFrZSBvbmUgcGFzcyBvdmVyIHRoZSB1LXNjYW4gbGluZSBvZiB0aGUgdm9sdW1lIHRvIHJ1bi1sZW5ndGggZW5jb2RlIHBvbHlnb25cbiAgICAgICAgdmFyIG5yID0gMCwgcCA9IDAsIGMgPSAwO1xuICAgICAgICBmb3IoeFt1XT0wOyB4W3VdPGRpbXNbdV07ICsreFt1XSwgcCA9IGMpIHtcbiAgICAgICAgICAvL0NvbXB1dGUgdGhlIHR5cGUgZm9yIHRoaXMgZmFjZVxuICAgICAgICAgIHZhciBhID0gKDAgICAgPD0geFtkXSAgICAgID8gZih4WzBdLCAgICAgIHhbMV0sICAgICAgeFsyXSkgICAgICA6IDApXG4gICAgICAgICAgICAsIGIgPSAoeFtkXSA8ICBkaW1zW2RdLTEgPyBmKHhbMF0rcVswXSwgeFsxXStxWzFdLCB4WzJdK3FbMl0pIDogMCk7XG4gICAgICAgICAgYyA9IGE7XG4gICAgICAgICAgaWYoKCFhKSA9PT0gKCFiKSkge1xuICAgICAgICAgICAgYyA9IDA7XG4gICAgICAgICAgfSBlbHNlIGlmKCFhKSB7XG4gICAgICAgICAgICBjID0gLWI7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vSWYgY2VsbCB0eXBlIGRvZXNuJ3QgbWF0Y2gsIHN0YXJ0IGEgbmV3IHJ1blxuICAgICAgICAgIGlmKHAgIT09IGMpIHtcbiAgICAgICAgICAgIHJ1bnNbbnIrK10gPSB4W3VdO1xuICAgICAgICAgICAgcnVuc1tucisrXSA9IGM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vQWRkIHNlbnRpbmVsIHJ1blxuICAgICAgICBydW5zW25yKytdID0gZGltc1t1XTtcbiAgICAgICAgcnVuc1tucisrXSA9IDA7XG4gICAgICAgIC8vVXBkYXRlIGZyb250aWVyIGJ5IG1lcmdpbmcgcnVuc1xuICAgICAgICB2YXIgZnAgPSAwO1xuICAgICAgICBmb3IodmFyIGk9MCwgaj0wOyBpPG5mICYmIGo8bnItMjsgKSB7XG4gICAgICAgICAgdmFyIHAgICAgPSBwb2x5Z29uc1tmcm9udGllcltpXV1cbiAgICAgICAgICAgICwgcF9sICA9IHAubGVmdFtwLmxlZnQubGVuZ3RoLTFdWzBdXG4gICAgICAgICAgICAsIHBfciAgPSBwLnJpZ2h0W3AucmlnaHQubGVuZ3RoLTFdWzBdXG4gICAgICAgICAgICAsIHBfYyAgPSBwLmNvbG9yXG4gICAgICAgICAgICAsIHJfbCAgPSBydW5zW2pdICAgIC8vU3RhcnQgb2YgcnVuXG4gICAgICAgICAgICAsIHJfciAgPSBydW5zW2orMl0gIC8vRW5kIG9mIHJ1blxuICAgICAgICAgICAgLCByX2MgID0gcnVuc1tqKzFdOyAvL0NvbG9yIG9mIHJ1blxuICAgICAgICAgIC8vQ2hlY2sgaWYgd2UgY2FuIG1lcmdlIHJ1biB3aXRoIHBvbHlnb25cbiAgICAgICAgICBpZihyX3IgPiBwX2wgJiYgcF9yID4gcl9sICYmIHJfYyA9PT0gcF9jKSB7XG4gICAgICAgICAgICAvL01lcmdlIHJ1blxuICAgICAgICAgICAgcC5tZXJnZV9ydW4oeFt2XSwgcl9sLCByX3IpO1xuICAgICAgICAgICAgLy9JbnNlcnQgcG9seWdvbiBpbnRvIGZyb250aWVyXG4gICAgICAgICAgICBuZXh0X2Zyb250aWVyW2ZwKytdID0gZnJvbnRpZXJbaV07XG4gICAgICAgICAgICArK2k7XG4gICAgICAgICAgICBqICs9IDI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgd2UgbmVlZCB0byBhZHZhbmNlIHRoZSBydW4gcG9pbnRlclxuICAgICAgICAgICAgaWYocl9yIDw9IHBfcikge1xuICAgICAgICAgICAgICBpZighIXJfYykge1xuICAgICAgICAgICAgICAgIHZhciBuX3BvbHkgPSBuZXcgTW9ub3RvbmVQb2x5Z29uKHJfYywgeFt2XSwgcl9sLCByX3IpO1xuICAgICAgICAgICAgICAgIG5leHRfZnJvbnRpZXJbZnArK10gPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcG9seWdvbnMucHVzaChuX3BvbHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGogKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgd2UgbmVlZCB0byBhZHZhbmNlIHRoZSBmcm9udGllciBwb2ludGVyXG4gICAgICAgICAgICBpZihwX3IgPD0gcl9yKSB7XG4gICAgICAgICAgICAgIHAuY2xvc2Vfb2ZmKHhbdl0pO1xuICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vQ2xvc2Ugb2ZmIGFueSByZXNpZHVhbCBwb2x5Z29uc1xuICAgICAgICBmb3IoOyBpPG5mOyArK2kpIHtcbiAgICAgICAgICBwb2x5Z29uc1tmcm9udGllcltpXV0uY2xvc2Vfb2ZmKHhbdl0pO1xuICAgICAgICB9XG4gICAgICAgIC8vQWRkIGFueSBleHRyYSBydW5zIHRvIGZyb250aWVyXG4gICAgICAgIGZvcig7IGo8bnItMjsgais9Mikge1xuICAgICAgICAgIHZhciByX2wgID0gcnVuc1tqXVxuICAgICAgICAgICAgLCByX3IgID0gcnVuc1tqKzJdXG4gICAgICAgICAgICAsIHJfYyAgPSBydW5zW2orMV07XG4gICAgICAgICAgaWYoISFyX2MpIHtcbiAgICAgICAgICAgIHZhciBuX3BvbHkgPSBuZXcgTW9ub3RvbmVQb2x5Z29uKHJfYywgeFt2XSwgcl9sLCByX3IpO1xuICAgICAgICAgICAgbmV4dF9mcm9udGllcltmcCsrXSA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHBvbHlnb25zLnB1c2gobl9wb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9Td2FwIGZyb250aWVyc1xuICAgICAgICB2YXIgdG1wID0gbmV4dF9mcm9udGllcjtcbiAgICAgICAgbmV4dF9mcm9udGllciA9IGZyb250aWVyO1xuICAgICAgICBmcm9udGllciA9IHRtcDtcbiAgICAgICAgbmYgPSBmcDtcbiAgICAgIH1cbiAgICAgIC8vQ2xvc2Ugb2ZmIGZyb250aWVyXG4gICAgICBmb3IodmFyIGk9MDsgaTxuZjsgKytpKSB7XG4gICAgICAgIHZhciBwID0gcG9seWdvbnNbZnJvbnRpZXJbaV1dO1xuICAgICAgICBwLmNsb3NlX29mZihkaW1zW3ZdKTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLSBNb25vdG9uZSBzdWJkaXZpc2lvbiBvZiBwb2x5Z29uIGlzIGNvbXBsZXRlIGF0IHRoaXMgcG9pbnQgLS0tXG4gICAgICBcbiAgICAgIHhbZF0rKztcbiAgICAgIFxuICAgICAgLy9Ob3cgd2UganVzdCBuZWVkIHRvIHRyaWFuZ3VsYXRlIGVhY2ggbW9ub3RvbmUgcG9seWdvblxuICAgICAgZm9yKHZhciBpPTA7IGk8cG9seWdvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHAgPSBwb2x5Z29uc1tpXVxuICAgICAgICAgICwgYyA9IHAuY29sb3JcbiAgICAgICAgICAsIGZsaXBwZWQgPSBmYWxzZTtcbiAgICAgICAgaWYoYyA8IDApIHtcbiAgICAgICAgICBmbGlwcGVkID0gdHJ1ZTtcbiAgICAgICAgICBjID0gLWM7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKHZhciBqPTA7IGo8cC5sZWZ0Lmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgbGVmdF9pbmRleFtqXSA9IHZlcnRpY2VzLmxlbmd0aDtcbiAgICAgICAgICB2YXIgeSA9IFswLjAsMC4wLDAuMF1cbiAgICAgICAgICAgICwgeiA9IHAubGVmdFtqXTtcbiAgICAgICAgICB5W2RdID0geFtkXTtcbiAgICAgICAgICB5W3VdID0gelswXTtcbiAgICAgICAgICB5W3ZdID0gelsxXTtcbiAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKHkpO1xuICAgICAgICB9XG4gICAgICAgIGZvcih2YXIgaj0wOyBqPHAucmlnaHQubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICByaWdodF9pbmRleFtqXSA9IHZlcnRpY2VzLmxlbmd0aDtcbiAgICAgICAgICB2YXIgeSA9IFswLjAsMC4wLDAuMF1cbiAgICAgICAgICAgICwgeiA9IHAucmlnaHRbal07XG4gICAgICAgICAgeVtkXSA9IHhbZF07XG4gICAgICAgICAgeVt1XSA9IHpbMF07XG4gICAgICAgICAgeVt2XSA9IHpbMV07XG4gICAgICAgICAgdmVydGljZXMucHVzaCh5KTtcbiAgICAgICAgfVxuICAgICAgICAvL1RyaWFuZ3VsYXRlIHRoZSBtb25vdG9uZSBwb2x5Z29uXG4gICAgICAgIHZhciBib3R0b20gPSAwXG4gICAgICAgICAgLCB0b3AgPSAwXG4gICAgICAgICAgLCBsX2kgPSAxXG4gICAgICAgICAgLCByX2kgPSAxXG4gICAgICAgICAgLCBzaWRlID0gdHJ1ZTsgIC8vdHJ1ZSA9IHJpZ2h0LCBmYWxzZSA9IGxlZnRcbiAgICAgICAgXG4gICAgICAgIHN0YWNrW3RvcCsrXSA9IGxlZnRfaW5kZXhbMF07XG4gICAgICAgIHN0YWNrW3RvcCsrXSA9IHAubGVmdFswXVswXTtcbiAgICAgICAgc3RhY2tbdG9wKytdID0gcC5sZWZ0WzBdWzFdO1xuICAgICAgICBcbiAgICAgICAgc3RhY2tbdG9wKytdID0gcmlnaHRfaW5kZXhbMF07XG4gICAgICAgIHN0YWNrW3RvcCsrXSA9IHAucmlnaHRbMF1bMF07XG4gICAgICAgIHN0YWNrW3RvcCsrXSA9IHAucmlnaHRbMF1bMV07XG4gICAgICAgIFxuICAgICAgICB3aGlsZShsX2kgPCBwLmxlZnQubGVuZ3RoIHx8IHJfaSA8IHAucmlnaHQubGVuZ3RoKSB7XG4gICAgICAgICAgLy9Db21wdXRlIG5leHQgc2lkZVxuICAgICAgICAgIHZhciBuX3NpZGUgPSBmYWxzZTtcbiAgICAgICAgICBpZihsX2kgPT09IHAubGVmdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5fc2lkZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmKHJfaSAhPT0gcC5yaWdodC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBsID0gcC5sZWZ0W2xfaV1cbiAgICAgICAgICAgICAgLCByID0gcC5yaWdodFtyX2ldO1xuICAgICAgICAgICAgbl9zaWRlID0gbFsxXSA+IHJbMV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBpZHggPSBuX3NpZGUgPyByaWdodF9pbmRleFtyX2ldIDogbGVmdF9pbmRleFtsX2ldXG4gICAgICAgICAgICAsIHZlcnQgPSBuX3NpZGUgPyBwLnJpZ2h0W3JfaV0gOiBwLmxlZnRbbF9pXTtcbiAgICAgICAgICBpZihuX3NpZGUgIT09IHNpZGUpIHtcbiAgICAgICAgICAgIC8vT3Bwb3NpdGUgc2lkZVxuICAgICAgICAgICAgd2hpbGUoYm90dG9tKzMgPCB0b3ApIHtcbiAgICAgICAgICAgICAgaWYoZmxpcHBlZCA9PT0gbl9zaWRlKSB7XG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaChbIHN0YWNrW2JvdHRvbV0sIHN0YWNrW2JvdHRvbSszXSwgaWR4LCBjXSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaChbIHN0YWNrW2JvdHRvbSszXSwgc3RhY2tbYm90dG9tXSwgaWR4LCBjXSk7ICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBib3R0b20gKz0gMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9TYW1lIHNpZGVcbiAgICAgICAgICAgIHdoaWxlKGJvdHRvbSszIDwgdG9wKSB7XG4gICAgICAgICAgICAgIC8vQ29tcHV0ZSBjb252ZXhpdHlcbiAgICAgICAgICAgICAgZm9yKHZhciBqPTA7IGo8MjsgKytqKVxuICAgICAgICAgICAgICBmb3IodmFyIGs9MDsgazwyOyArK2spIHtcbiAgICAgICAgICAgICAgICBkZWx0YVtqXVtrXSA9IHN0YWNrW3RvcC0zKihqKzEpK2srMV0gLSB2ZXJ0W2tdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhciBkZXQgPSBkZWx0YVswXVswXSAqIGRlbHRhWzFdWzFdIC0gZGVsdGFbMV1bMF0gKiBkZWx0YVswXVsxXTtcbiAgICAgICAgICAgICAgaWYobl9zaWRlID09PSAoZGV0ID4gMCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihkZXQgIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZihmbGlwcGVkID09PSBuX3NpZGUpIHtcbiAgICAgICAgICAgICAgICAgIGZhY2VzLnB1c2goWyBzdGFja1t0b3AtM10sIHN0YWNrW3RvcC02XSwgaWR4LCBjIF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBmYWNlcy5wdXNoKFsgc3RhY2tbdG9wLTZdLCBzdGFja1t0b3AtM10sIGlkeCwgYyBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdG9wIC09IDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vUHVzaCB2ZXJ0ZXhcbiAgICAgICAgICBzdGFja1t0b3ArK10gPSBpZHg7XG4gICAgICAgICAgc3RhY2tbdG9wKytdID0gdmVydFswXTtcbiAgICAgICAgICBzdGFja1t0b3ArK10gPSB2ZXJ0WzFdO1xuICAgICAgICAgIC8vVXBkYXRlIGxvb3AgaW5kZXhcbiAgICAgICAgICBpZihuX3NpZGUpIHtcbiAgICAgICAgICAgICsrcl9pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICArK2xfaTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2lkZSA9IG5fc2lkZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4geyB2ZXJ0aWNlczp2ZXJ0aWNlcywgZmFjZXM6ZmFjZXMgfTtcbn1cbn0pKCk7XG5cbmlmKGV4cG9ydHMpIHtcbiAgZXhwb3J0cy5tZXNoZXIgPSBNb25vdG9uZU1lc2g7XG59XG4iXX0=
