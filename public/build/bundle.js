
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const Gold = writable(0);

    //Player Stats
    const Level = writable(1);
    const Experience = writable(0);
    const ClickDmg = writable(1);
    const AutoDmg = writable(0);

    //Boss Statsb
    const BossHP = writable(10);
    const BossDeath = writable(false);
    let BossLevel = writable(1);

    //misc
    const Cost = writable(50);

    /* src\Clickerbutton.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\Clickerbutton.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "bossimg");
    			if (img.src !== (img_src_value = /*visable*/ ctx[0] ? "bosshit.png" : "boss.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "boss");
    			add_location(img, file$4, 26, 4, 495);
    			add_location(div, file$4, 25, 0, 485);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*Clicked*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visable*/ 1 && img.src !== (img_src_value = /*visable*/ ctx[0] ? "bosshit.png" : "boss.png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $Gold;
    	let $ClickDmg;
    	let $BossHP;
    	validate_store(Gold, "Gold");
    	component_subscribe($$self, Gold, $$value => $$invalidate(2, $Gold = $$value));
    	validate_store(ClickDmg, "ClickDmg");
    	component_subscribe($$self, ClickDmg, $$value => $$invalidate(3, $ClickDmg = $$value));
    	validate_store(BossHP, "BossHP");
    	component_subscribe($$self, BossHP, $$value => $$invalidate(4, $BossHP = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clickerbutton", slots, []);
    	let visable = false;

    	function Clicked() {
    		set_store_value(Gold, $Gold += +$ClickDmg, $Gold);
    		set_store_value(BossHP, $BossHP = $BossHP - $ClickDmg, $BossHP);
    	}

    	function setVisable() {
    		$$invalidate(0, visable = true);

    		setTimeout(
    			function () {
    				$$invalidate(0, visable = false);
    			},
    			300
    		);
    	}

    	BossDeath.subscribe(value => {
    		if (value) {
    			setVisable();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clickerbutton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Gold,
    		ClickDmg,
    		BossHP,
    		BossDeath,
    		visable,
    		Clicked,
    		setVisable,
    		$Gold,
    		$ClickDmg,
    		$BossHP
    	});

    	$$self.$inject_state = $$props => {
    		if ("visable" in $$props) $$invalidate(0, visable = $$props.visable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visable, Clicked];
    }

    class Clickerbutton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clickerbutton",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Boss.svelte generated by Svelte v3.38.2 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $BossLevel;
    	let $BossHP;
    	let $Experience;
    	let $BossDeath;
    	validate_store(BossLevel, "BossLevel");
    	component_subscribe($$self, BossLevel, $$value => $$invalidate(0, $BossLevel = $$value));
    	validate_store(BossHP, "BossHP");
    	component_subscribe($$self, BossHP, $$value => $$invalidate(1, $BossHP = $$value));
    	validate_store(Experience, "Experience");
    	component_subscribe($$self, Experience, $$value => $$invalidate(2, $Experience = $$value));
    	validate_store(BossDeath, "BossDeath");
    	component_subscribe($$self, BossDeath, $$value => $$invalidate(3, $BossDeath = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Boss", slots, []);

    	function BossUp() {
    		set_store_value(BossLevel, $BossLevel += 1, $BossLevel);
    	}

    	function Death() {
    		set_store_value(BossHP, $BossHP = $BossLevel ** 2 + 10, $BossHP);
    		set_store_value(Experience, $Experience += 50, $Experience);
    		set_store_value(BossDeath, $BossDeath = true, $BossDeath);
    	}

    	BossHP.subscribe(value => {
    		if (value <= 0) {
    			BossUp();
    			Death();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Boss> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Experience,
    		BossHP,
    		BossDeath,
    		BossLevel,
    		AutoDmg,
    		BossUp,
    		Death,
    		$BossLevel,
    		$BossHP,
    		$Experience,
    		$BossDeath
    	});

    	return [];
    }

    class Boss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Boss",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src\Player.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$3 = "src\\Player.svelte";

    // (37:0) {#if $BossDeath}
    function create_if_block(ctx) {
    	let t_value = /*please*/ ctx[6]() + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:0) {#if $BossDeath}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let article;
    	let div0;
    	let p0;
    	let t1;
    	let h1;
    	let t2;
    	let t3;
    	let t4;
    	let box;
    	let p1;
    	let t5;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9;
    	let t10;
    	let div2;
    	let div1;
    	let if_block = /*$BossDeath*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			article = element("article");
    			div0 = element("div");
    			p0 = element("p");
    			t1 = space();
    			h1 = element("h1");
    			t2 = text("Level: ");
    			t3 = text(/*$Level*/ ctx[0]);
    			t4 = space();
    			box = element("box");
    			p1 = element("p");
    			t5 = text("Click Dmg: ");
    			t6 = text(/*$ClickDmg*/ ctx[1]);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Auto Dmg: ");
    			t9 = text(/*$AutoDmg*/ ctx[4]);
    			t10 = space();
    			div2 = element("div");
    			div1 = element("div");
    			add_location(p0, file$3, 42, 8, 941);
    			set_style(h1, "color", "hsl(111 73% 45%) ");
    			attr_dev(h1, "class", "semifattext");
    			add_location(h1, file$3, 43, 8, 958);
    			add_location(p1, file$3, 45, 12, 1146);
    			add_location(p2, file$3, 46, 12, 1190);
    			set_style(box, "font-family", "impact");
    			set_style(box, "border-style", "solid");
    			set_style(box, "padding", "5px");
    			set_style(box, "color", "green");
    			add_location(box, file$3, 44, 8, 1047);
    			attr_dev(div0, "class", "grid");
    			add_location(div0, file$3, 41, 4, 912);
    			attr_dev(div1, "class", "progress-bar");
    			set_style(div1, "width", /*$Progress*/ ctx[3] + "%");
    			add_location(div1, file$3, 50, 8, 1290);
    			attr_dev(div2, "class", "progress-container");
    			add_location(div2, file$3, 49, 4, 1248);
    			set_style(article, "line-height", "0%");
    			add_location(article, file$3, 40, 0, 871);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, box);
    			append_dev(box, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(box, t7);
    			append_dev(box, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(article, t10);
    			append_dev(article, div2);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$BossDeath*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$Level*/ 1) set_data_dev(t3, /*$Level*/ ctx[0]);
    			if (dirty & /*$ClickDmg*/ 2) set_data_dev(t6, /*$ClickDmg*/ ctx[1]);
    			if (dirty & /*$AutoDmg*/ 16) set_data_dev(t9, /*$AutoDmg*/ ctx[4]);

    			if (dirty & /*$Progress*/ 8) {
    				set_style(div1, "width", /*$Progress*/ ctx[3] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let XpLeft;
    	let $Experience;
    	let $Level;
    	let $ClickDmg;
    	let $BossDeath;
    	let $Progress;
    	let $AutoDmg;
    	validate_store(Experience, "Experience");
    	component_subscribe($$self, Experience, $$value => $$invalidate(8, $Experience = $$value));
    	validate_store(Level, "Level");
    	component_subscribe($$self, Level, $$value => $$invalidate(0, $Level = $$value));
    	validate_store(ClickDmg, "ClickDmg");
    	component_subscribe($$self, ClickDmg, $$value => $$invalidate(1, $ClickDmg = $$value));
    	validate_store(BossDeath, "BossDeath");
    	component_subscribe($$self, BossDeath, $$value => $$invalidate(2, $BossDeath = $$value));
    	validate_store(AutoDmg, "AutoDmg");
    	component_subscribe($$self, AutoDmg, $$value => $$invalidate(4, $AutoDmg = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	const Progress = tweened(0);
    	validate_store(Progress, "Progress");
    	component_subscribe($$self, Progress, value => $$invalidate(3, $Progress = value));
    	let RequiredXp = 100;

    	function LevelUp() {
    		set_store_value(Level, $Level += 1, $Level);
    		set_store_value(ClickDmg, $ClickDmg += 1, $ClickDmg);
    		set_store_value(Experience, $Experience = 0, $Experience);
    		CalcReqXp();
    	}

    	function CalcReqXp() {
    		$$invalidate(7, RequiredXp = RequiredXp ** 1.1);
    	}

    	function please() {
    		set_store_value(BossDeath, $BossDeath = false, $BossDeath);
    		set_store_value(Progress, $Progress = (RequiredXp - XpLeft) / RequiredXp * 100, $Progress);
    		console.log($Progress);
    		if ($Progress >= 100) set_store_value(Progress, $Progress = 0, $Progress);
    	}

    	Experience.subscribe(value => {
    		if (value >= RequiredXp) {
    			LevelUp();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Experience,
    		Level,
    		ClickDmg,
    		BossDeath,
    		AutoDmg,
    		tweened,
    		Progress,
    		RequiredXp,
    		LevelUp,
    		CalcReqXp,
    		please,
    		XpLeft,
    		$Experience,
    		$Level,
    		$ClickDmg,
    		$BossDeath,
    		$Progress,
    		$AutoDmg
    	});

    	$$self.$inject_state = $$props => {
    		if ("RequiredXp" in $$props) $$invalidate(7, RequiredXp = $$props.RequiredXp);
    		if ("XpLeft" in $$props) XpLeft = $$props.XpLeft;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*RequiredXp, $Experience*/ 384) {
    			XpLeft = RequiredXp - $Experience;
    		}
    	};

    	return [
    		$Level,
    		$ClickDmg,
    		$BossDeath,
    		$Progress,
    		$AutoDmg,
    		Progress,
    		please,
    		RequiredXp,
    		$Experience
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\misc\BossLevel.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\misc\\BossLevel.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let h3;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Carls Level: ");
    			t1 = text(/*$BossLevel*/ ctx[0]);
    			t2 = space();
    			h3 = element("h3");
    			t3 = text("HP: ");
    			t4 = text(/*$BossHP*/ ctx[1]);
    			attr_dev(h1, "class", "fattext");
    			add_location(h1, file$2, 6, 0, 115);
    			set_style(h3, "color", "hsl(14, 100%, 55%)");
    			attr_dev(h3, "class", "semifattext");
    			add_location(h3, file$2, 7, 0, 168);
    			set_style(div, "line-height", "50%");
    			add_location(div, file$2, 5, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div, t2);
    			append_dev(div, h3);
    			append_dev(h3, t3);
    			append_dev(h3, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$BossLevel*/ 1) set_data_dev(t1, /*$BossLevel*/ ctx[0]);
    			if (dirty & /*$BossHP*/ 2) set_data_dev(t4, /*$BossHP*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $BossLevel;
    	let $BossHP;
    	validate_store(BossLevel, "BossLevel");
    	component_subscribe($$self, BossLevel, $$value => $$invalidate(0, $BossLevel = $$value));
    	validate_store(BossHP, "BossHP");
    	component_subscribe($$self, BossHP, $$value => $$invalidate(1, $BossHP = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BossLevel", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BossLevel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ BossLevel, BossHP, $BossLevel, $BossHP });
    	return [$BossLevel, $BossHP];
    }

    class BossLevel_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BossLevel_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Buydmg.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\Buydmg.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("Buy 1 DMG!");
    			br = element("br");
    			t1 = text("Cost: ");
    			t2 = text(/*$Cost*/ ctx[1]);
    			add_location(br, file$1, 34, 14, 756);
    			attr_dev(button, "class", "shop");
    			button.disabled = /*NotAffordable*/ ctx[0];
    			add_location(button, file$1, 31, 0, 663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, br);
    			append_dev(button, t1);
    			append_dev(button, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*buyDmg*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$Cost*/ 2) set_data_dev(t2, /*$Cost*/ ctx[1]);

    			if (dirty & /*NotAffordable*/ 1) {
    				prop_dev(button, "disabled", /*NotAffordable*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $Gold;
    	let $Cost;
    	let $AutoDmg;
    	let $BossHP;
    	validate_store(Gold, "Gold");
    	component_subscribe($$self, Gold, $$value => $$invalidate(3, $Gold = $$value));
    	validate_store(Cost, "Cost");
    	component_subscribe($$self, Cost, $$value => $$invalidate(1, $Cost = $$value));
    	validate_store(AutoDmg, "AutoDmg");
    	component_subscribe($$self, AutoDmg, $$value => $$invalidate(4, $AutoDmg = $$value));
    	validate_store(BossHP, "BossHP");
    	component_subscribe($$self, BossHP, $$value => $$invalidate(5, $BossHP = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Buydmg", slots, []);
    	let NotAffordable = true;

    	function makeAffordable() {
    		$$invalidate(0, NotAffordable = false);
    	}

    	function buyDmg() {
    		set_store_value(Gold, $Gold += -$Cost, $Gold);
    		set_store_value(Cost, $Cost = Math.ceil($Cost ** 1.1), $Cost);
    		$$invalidate(0, NotAffordable = true);
    		set_store_value(AutoDmg, $AutoDmg += 1, $AutoDmg);
    	}

    	onMount(() => {
    		setInterval(
    			() => {
    				set_store_value(BossHP, $BossHP -= $AutoDmg, $BossHP);
    				set_store_value(Gold, $Gold += $AutoDmg, $Gold);
    			},
    			1000
    		);
    	});

    	Gold.subscribe(value => {
    		if (value >= $Cost) {
    			makeAffordable();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Buydmg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Cost,
    		AutoDmg,
    		BossHP,
    		Gold,
    		onMount,
    		NotAffordable,
    		makeAffordable,
    		buyDmg,
    		$Gold,
    		$Cost,
    		$AutoDmg,
    		$BossHP
    	});

    	$$self.$inject_state = $$props => {
    		if ("NotAffordable" in $$props) $$invalidate(0, NotAffordable = $$props.NotAffordable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [NotAffordable, $Cost, buyDmg];
    }

    class Buydmg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buydmg",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let body;
    	let main;
    	let article;
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let bosslevel;
    	let t3;
    	let buydmg;
    	let t4;
    	let boss;
    	let t5;
    	let clicker;
    	let t6;
    	let xpbar;
    	let current;
    	bosslevel = new BossLevel_1({ $$inline: true });
    	buydmg = new Buydmg({ $$inline: true });
    	boss = new Boss({ $$inline: true });
    	clicker = new Clickerbutton({ $$inline: true });
    	xpbar = new Player({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			main = element("main");
    			article = element("article");
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("Gold: ");
    			t1 = text(/*$Gold*/ ctx[0]);
    			t2 = space();
    			create_component(bosslevel.$$.fragment);
    			t3 = space();
    			create_component(buydmg.$$.fragment);
    			t4 = space();
    			create_component(boss.$$.fragment);
    			t5 = space();
    			create_component(clicker.$$.fragment);
    			t6 = space();
    			create_component(xpbar.$$.fragment);
    			set_style(h1, "color", "hsl(50, 100%, 60%)");
    			attr_dev(h1, "class", "fattext gold");
    			add_location(h1, file, 20, 2, 440);
    			attr_dev(div, "class", "grid");
    			add_location(div, file, 19, 1, 418);
    			add_location(article, file, 18, 1, 407);
    			attr_dev(main, "class", "backy");
    			add_location(main, file, 17, 0, 383);
    			add_location(body, file, 15, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, main);
    			append_dev(main, article);
    			append_dev(article, div);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div, t2);
    			mount_component(bosslevel, div, null);
    			append_dev(div, t3);
    			mount_component(buydmg, div, null);
    			append_dev(article, t4);
    			mount_component(boss, article, null);
    			append_dev(article, t5);
    			mount_component(clicker, article, null);
    			append_dev(article, t6);
    			mount_component(xpbar, article, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$Gold*/ 1) set_data_dev(t1, /*$Gold*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bosslevel.$$.fragment, local);
    			transition_in(buydmg.$$.fragment, local);
    			transition_in(boss.$$.fragment, local);
    			transition_in(clicker.$$.fragment, local);
    			transition_in(xpbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bosslevel.$$.fragment, local);
    			transition_out(buydmg.$$.fragment, local);
    			transition_out(boss.$$.fragment, local);
    			transition_out(clicker.$$.fragment, local);
    			transition_out(xpbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(bosslevel);
    			destroy_component(buydmg);
    			destroy_component(boss);
    			destroy_component(clicker);
    			destroy_component(xpbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $Gold;
    	validate_store(Gold, "Gold");
    	component_subscribe($$self, Gold, $$value => $$invalidate(0, $Gold = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Clicker: Clickerbutton,
    		Gold,
    		Boss,
    		Xpbar: Player,
    		Bosslevel: BossLevel_1,
    		BuyDmg: Buydmg,
    		$Gold
    	});

    	return [$Gold];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,

    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
