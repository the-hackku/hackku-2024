
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src\components\Nav.svelte generated by Svelte v3.46.3 */
    const file$o = "src\\components\\Nav.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (22:4) {#each links as link}
    function create_each_block$2(ctx) {
    	let p;
    	let a;
    	let t_value = /*link*/ ctx[2].display + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-link turn-red svelte-yn2qdg");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "onclick", "return false;");
    			add_location(a, file$o, 22, 9, 804);
    			add_location(p, file$o, 22, 6, 801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*link*/ ctx[2].action, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(22:4) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*links*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "navbar svelte-yn2qdg");
    			attr_dev(div0, "id", "nav");
    			add_location(div0, file$o, 20, 2, 737);
    			add_location(div1, file$o, 19, 0, 728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 1) {
    				each_value = /*links*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);

    	let links = [
    		{
    			display: "HACKERDOC",
    			action: () => window.open("https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74", "_blank")
    		},
    		{
    			display: "ABOUT",
    			action: () => scrollToID("about")
    		},
    		{
    			display: "FAQ",
    			action: () => scrollToID("faq")
    		},
    		{
    			display: "SPONSORS",
    			action: () => scrollToID("sponsors")
    		},
    		{
    			display: "CONTACT",
    			action: () => scrollToID("contact")
    		},
    		{
    			display: "REGISTER NOW!",
    			action: () => window.open("https://forms.gle/VxKryAnMaGowQkMj6", "_blank")
    		}
    	];

    	const scrollToID = id => {
    		window.scrollTo({
    			top: document.getElementById(id).offsetTop,
    			behavior: 'smooth'
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ links, scrollToID });

    	$$self.$inject_state = $$props => {
    		if ('links' in $$props) $$invalidate(0, links = $$props.links);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [links];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\components\assets\hamburger.svelte generated by Svelte v3.46.3 */

    const file$n = "src\\components\\assets\\hamburger.svelte";

    function create_fragment$n(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M0 2C0 0.89543 0.89543 0 2 0H34.5C35.6046 0 36.5 0.89543 36.5 2C36.5 3.10457 35.6046 4 34.5 4H2C0.89543 4 0 3.10457 0 2Z");
    			attr_dev(path0, "fill", "#1B2526");
    			add_location(path0, file$n, 1, 2, 99);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M0 14C0 12.8954 0.89543 12 2 12H34.5C35.6046 12 36.5 12.8954 36.5 14C36.5 15.1046 35.6046 16 34.5 16H2C0.89543 16 0 15.1046 0 14Z");
    			attr_dev(path1, "fill", "#1B2526");
    			add_location(path1, file$n, 2, 2, 290);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "d", "M0 26C0 24.8954 0.89543 24 2 24H34.5C35.6046 24 36.5 24.8954 36.5 26C36.5 27.1046 35.6046 28 34.5 28H2C0.89543 28 0 27.1046 0 26Z");
    			attr_dev(path2, "fill", "#1B2526");
    			add_location(path2, file$n, 3, 2, 490);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "37");
    			attr_dev(svg, "height", "28");
    			attr_dev(svg, "viewBox", "0 0 37 28");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$n, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hamburger', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hamburger> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hamburger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hamburger",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\components\NavMobile.svelte generated by Svelte v3.46.3 */
    const file$m = "src\\components\\NavMobile.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (31:1) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let hamburger;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	hamburger = new Hamburger({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(hamburger.$$.fragment);
    			attr_dev(div0, "class", "hamburger svelte-1ds7p0l");
    			add_location(div0, file$m, 32, 3, 1157);
    			add_location(div1, file$m, 31, 2, 1132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(hamburger, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburger.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburger.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(hamburger);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(31:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#if hamburgerExpanded}
    function create_if_block$2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*links*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "link-list svelte-1ds7p0l");
    			add_location(div, file$m, 25, 2, 899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 2) {
    				each_value = /*links*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:2) {#if hamburgerExpanded}",
    		ctx
    	});

    	return block;
    }

    // (27:3) {#each links as link}
    function create_each_block$1(ctx) {
    	let div;
    	let h4;
    	let t_value = /*link*/ ctx[5].display + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t = text(t_value);
    			attr_dev(h4, "class", "nav-link turn-red svelte-1ds7p0l");
    			add_location(h4, file$m, 27, 32, 1041);
    			add_location(div, file$m, 27, 4, 1013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*link*/ ctx[5].action, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:3) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hamburgerExpanded*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$m, 23, 0, 863);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavMobile', slots, []);
    	let hamburgerExpanded = false;

    	let links = [
    		{
    			display: "HACKERDOC",
    			action: () => window.open("https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74", "_blank")
    		},
    		{
    			display: "ABOUT",
    			action: () => scrollToID("about")
    		},
    		{
    			display: "FAQ",
    			action: () => scrollToID("faq")
    		},
    		{
    			display: "SPONSORS",
    			action: () => scrollToID("sponsors")
    		},
    		{
    			display: "CONTACT",
    			action: () => scrollToID("contact")
    		},
    		{
    			display: "REGISTER NOW!",
    			action: () => window.open("https://forms.gle/VxKryAnMaGowQkMj6", "_blank")
    		}
    	];

    	const scrollToID = id => {
    		window.scrollTo({
    			top: document.getElementById(id).offsetTop,
    			behavior: 'smooth'
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavMobile> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, hamburgerExpanded = false);
    	const click_handler_1 = () => $$invalidate(0, hamburgerExpanded = !hamburgerExpanded);

    	$$self.$capture_state = () => ({
    		Hamburger,
    		fade,
    		fly,
    		hamburgerExpanded,
    		links,
    		scrollToID
    	});

    	$$self.$inject_state = $$props => {
    		if ('hamburgerExpanded' in $$props) $$invalidate(0, hamburgerExpanded = $$props.hamburgerExpanded);
    		if ('links' in $$props) $$invalidate(1, links = $$props.links);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hamburgerExpanded, links, click_handler, click_handler_1];
    }

    class NavMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavMobile",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\components\assets\sun.svelte generated by Svelte v3.46.3 */

    const file$l = "src\\components\\assets\\sun.svelte";

    function create_fragment$l(ctx) {
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "33.3955");
    			attr_dev(circle, "cy", "32.9998");
    			attr_dev(circle, "r", "33");
    			attr_dev(circle, "fill", "#FFCD59");
    			add_location(circle, file$l, 1, 0, 155);
    			attr_dev(svg, "width", "67");
    			attr_dev(svg, "height", "66");
    			attr_dev(svg, "viewBox", "0 0 67 66");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "max-width", "10vw");
    			set_style(svg, "top", "4vh");
    			set_style(svg, "left", "8vw");
    			set_style(svg, "position", "absolute");
    			add_location(svg, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sun', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sun> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Sun extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sun",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\components\assets\clouds.svelte generated by Svelte v3.46.3 */

    const file$k = "src\\components\\assets\\clouds.svelte";

    function create_fragment$k(ctx) {
    	let svg;
    	let mask;
    	let rect;
    	let g;
    	let path0;
    	let path1;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			mask = svg_element("mask");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			attr_dev(rect, "width", "1280");
    			attr_dev(rect, "height", "532");
    			attr_dev(rect, "fill", "#D9D9D9");
    			add_location(rect, file$k, 2, 0, 239);
    			attr_dev(mask, "id", "mask0_483_527");
    			set_style(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "1280");
    			attr_dev(mask, "height", "532");
    			add_location(mask, file$k, 1, 0, 123);
    			attr_dev(path0, "d", "M590.548 444.223C623.156 461.933 627.882 492.291 624.39 509.477C656.89 525.723 716.33 562.002 694.09 577.147C511.612 701.416 -330.228 338.606 -321.988 314.526C-317.798 302.281 -290.697 301.1 -277.67 302.039C-279.685 291.567 -274.098 266.762 -255.296 236.044C-236.31 205.025 -212.119 192.756 -195.063 194.099C-194.123 186.445 -190.631 168.722 -184.185 159.055C-177.739 149.388 -171.83 159.055 -169.681 165.097C-168.338 157.31 -144.041 142.807 -123.349 148.985C-107.111 153.833 -95.0122 164.157 -91.9234 184.431C-88.4317 179.463 -69.0925 181.442 -55.2604 188.862C-39.1024 197.53 -32.241 212.772 -29.0582 219.842L-28.8506 220.303C-30.8651 213.321 -22.5948 180.908 -1.99213 166.598C24.6707 148.079 49.088 151.014 60.7719 153.833C58.208 142.06 58.3352 127.844 71.0063 115.97C83.6773 104.096 101.061 105.497 106.701 108.72C105.09 106.974 106.613 92.0146 115.167 85.5771C123.72 79.1395 131.68 80.1208 138.127 80.9263C142.156 67.3654 165.904 20.3953 221.107 26.5532C276.902 32.7772 279.721 86.0834 284.555 101.524C290.452 96.9998 294.612 96.3073 301.685 99.4454C311.952 104 329.883 137.057 329.883 183.631C329.883 237.896 322.876 263.924 319.384 274.934C326.099 277.485 346.398 281.93 357.356 299.009C368.315 316.087 369.361 328.634 371.375 339.51C383.059 335.482 429.067 335.057 468.462 362.867C507.857 390.678 511.178 422.606 523.668 444.223C531.188 439.658 557.913 426.5 590.548 444.223Z");
    			attr_dev(path0, "fill", "url(#paint0_linear_483_527)");
    			add_location(path0, file$k, 5, 0, 330);
    			attr_dev(path1, "d", "M1030.94 -147.296C975.887 -136.287 977.673 -82.936 974.187 -67.1362C960.494 -69.9909 942.414 -75.9305 923.861 -46.7471C902.88 -13.7468 907.263 35.9912 915.475 59.3704C913.08 54.8935 908.985 44.6752 900.321 46.6291C889.491 49.0716 888.934 83.2468 891.477 112.637C893.857 140.146 902.242 159.718 904.188 166.743C891.896 161.951 833.462 154.739 797.944 197.514C761.128 241.852 784.276 300.576 792.327 312.426C754.248 324.754 737.613 329.706 714.885 351.245C687.454 377.241 673.053 416.593 677.321 421.745C681.589 426.896 731.676 394.508 798.662 385.652C1194.13 333.374 1635.47 180.251 1596.83 92.7974C1591.6 80.9589 1564.5 82.1176 1551.6 84.1767C1552.71 73.5692 1545 49.3385 1523.62 20.3552C1502.03 -8.91232 1476.88 -19.0505 1460 -16.2429C1458.4 -23.7866 1453.4 -41.1428 1446.14 -50.2185C1438.89 -59.2942 1433.83 -49.1536 1432.21 -42.9489C1430.2 -50.5917 1404.75 -62.9465 1384.66 -55.0079C1368.9 -48.7781 1357.74 -37.4499 1356.41 -16.9849C1352.5 -21.6333 1333.41 -17.9957 1320.27 -9.41068C1304.57 0.841638 1299.15 17.1008 1296.66 24.1893C1298.07 17.0597 1287.04 -14.5203 1265.28 -27.0013C1237.12 -43.1534 1213.04 -38.1249 1201.65 -34.3088C1203.19 -46.2591 1201.83 -60.4114 1188.19 -71.1491C1174.54 -81.8868 1157.34 -78.9925 1152 -75.296C1153.45 -77.1739 1150.65 -91.9464 1141.57 -97.6229C1132.49 -103.299 1124.65 -101.636 1118.3 -100.277C1113.11 -113.441 1085.4 -158.189 1030.94 -147.296Z");
    			attr_dev(path1, "fill", "url(#paint1_linear_483_527)");
    			add_location(path1, file$k, 6, 0, 1761);
    			attr_dev(g, "mask", "url(#mask0_483_527)");
    			add_location(g, file$k, 4, 0, 298);
    			attr_dev(stop0, "stop-color", "#FFF8F5");
    			add_location(stop0, file$k, 10, 0, 3321);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#A1E6F7");
    			add_location(stop1, file$k, 11, 0, 3351);
    			attr_dev(linearGradient0, "id", "paint0_linear_483_527");
    			attr_dev(linearGradient0, "x1", "188");
    			attr_dev(linearGradient0, "y1", "280");
    			attr_dev(linearGradient0, "x2", "188");
    			attr_dev(linearGradient0, "y2", "441");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$k, 9, 0, 3209);
    			attr_dev(stop2, "stop-color", "#FFF8F5");
    			add_location(stop2, file$k, 14, 0, 3538);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#A1E6F7");
    			add_location(stop3, file$k, 15, 0, 3568);
    			attr_dev(linearGradient1, "id", "paint1_linear_483_527");
    			attr_dev(linearGradient1, "x1", "1122.81");
    			attr_dev(linearGradient1, "y1", "81.7903");
    			attr_dev(linearGradient1, "x2", "1135.75");
    			attr_dev(linearGradient1, "y2", "231.27");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$k, 13, 0, 3411);
    			add_location(defs, file$k, 8, 0, 3201);
    			attr_dev(svg, "viewBox", "0 0 1280 532");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "width", "100vw");
    			set_style(svg, "top", "0vh");
    			set_style(svg, "position", "absolute");
    			add_location(svg, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, mask);
    			append_dev(mask, rect);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clouds', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clouds> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Clouds extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clouds",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\components\assets\ground.svelte generated by Svelte v3.46.3 */

    const file$j = "src\\components\\assets\\ground.svelte";

    function create_fragment$j(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let rect0;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let rect1;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let rect2;
    	let path22;
    	let path23;
    	let path24;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			rect0 = svg_element("rect");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			rect1 = svg_element("rect");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			rect2 = svg_element("rect");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			attr_dev(path0, "d", "M1111.46 27.507L1111.4 30.7163L1100.28 27.0947L1100.67 6.55466L1104.69 2.55944L1108.85 2.84727L1110.86 24.2859L1111.46 27.507Z");
    			attr_dev(path0, "fill", "#CCB5AA");
    			add_location(path0, file$j, 1, 0, 125);
    			attr_dev(path1, "d", "M1125.95 25.3358L1126.89 30.5451L1112.17 26.021L1112.6 2.91347L1120.73 1.77358L1122.74 22.2122L1125.95 25.3358Z");
    			attr_dev(path1, "fill", "url(#paint0_linear_688_876)");
    			add_location(path1, file$j, 2, 0, 280);
    			attr_dev(path2, "d", "M1088.84 26.2055L1088.76 29.4144L1102.22 26.3154L1102.8 3.21118L1094.73 0.875188L1091.77 23.0656L1088.84 26.2055Z");
    			attr_dev(path2, "fill", "#FFF8F5");
    			add_location(path2, file$j, 3, 0, 440);
    			attr_dev(path3, "d", "M1117.21 25.0174L1117.15 28.2268L1106.04 24.6052L1106.42 4.06516L1110.44 0.069934L1114.6 0.357767L1116.61 21.7964L1117.21 25.0174Z");
    			attr_dev(path3, "fill", "#FFF8F5");
    			add_location(path3, file$j, 4, 0, 582);
    			attr_dev(path4, "d", "M1086.95 31.2781L1081 164.607H1134.48L1127.78 31.2781L1125.42 28.2867L1114.17 24.2271H1107.63L1090.62 27.0047L1086.95 31.2781Z");
    			attr_dev(path4, "fill", "#CCB5AA");
    			add_location(path4, file$j, 5, 0, 741);
    			attr_dev(path5, "d", "M1105.33 33.8574L1093.59 35.3554L1087.79 163.752H1105.55L1105.33 33.8574Z");
    			attr_dev(path5, "fill", "url(#paint1_linear_688_876)");
    			add_location(path5, file$j, 6, 0, 896);
    			attr_dev(path6, "d", "M1117.05 34.7102L1122.65 37.0666L1127.91 164.179H1118.26L1117.05 34.7102Z");
    			attr_dev(path6, "fill", "url(#paint2_linear_688_876)");
    			add_location(path6, file$j, 7, 0, 1018);
    			attr_dev(path7, "d", "M1086.91 137.216L1084.95 164.607H1109.06L1107.57 137.216L1105.55 133.792H1089.55L1086.91 137.216Z");
    			attr_dev(path7, "fill", "#FFF8F5");
    			add_location(path7, file$j, 8, 0, 1140);
    			attr_dev(path8, "d", "M1089.93 138.5L1088.45 164.608H1103.8L1102.66 138.5H1089.93Z");
    			attr_dev(path8, "fill", "#458999");
    			add_location(path8, file$j, 9, 0, 1266);
    			attr_dev(path9, "d", "M1199.39 107.01L1280 107.01L1280 166.416L1199.39 166.416L1199.39 107.01Z");
    			attr_dev(path9, "fill", "#FFF8F5");
    			add_location(path9, file$j, 10, 0, 1355);
    			attr_dev(rect0, "x", "1158.39");
    			attr_dev(rect0, "y", "107.01");
    			attr_dev(rect0, "width", "41.5025");
    			attr_dev(rect0, "height", "59.4056");
    			attr_dev(rect0, "fill", "#CCB5AA");
    			add_location(rect0, file$j, 11, 0, 1456);
    			attr_dev(path10, "d", "M1200.1 107.983L1280 107.982L1280 87.5002L1270.61 80.1223L1192.12 80.1223L1178.02 99.0471L1200.1 107.983Z");
    			attr_dev(path10, "fill", "#E85151");
    			add_location(path10, file$j, 12, 0, 1536);
    			attr_dev(path11, "d", "M1156.38 107.978L1200.01 107.978L1200.01 105.79L1192.12 80.1229L1156.38 106.197L1156.38 107.978Z");
    			attr_dev(path11, "fill", "#B83535");
    			add_location(path11, file$j, 13, 0, 1670);
    			attr_dev(path12, "d", "M1211.29 72.0181L1220.24 72.0181L1220.24 85.0385L1211.29 85.0385L1211.29 72.0181Z");
    			attr_dev(path12, "fill", "#FFF8F5");
    			add_location(path12, file$j, 14, 0, 1795);
    			attr_dev(path13, "d", "M1205.59 72.0181L1211.29 72.0181L1211.29 85.0385L1208.03 80.1558L1205.59 80.1558L1205.59 72.0181Z");
    			attr_dev(path13, "fill", "#CCB5AA");
    			add_location(path13, file$j, 15, 0, 1905);
    			attr_dev(path14, "d", "M1217.8 68.7629L1220.24 72.018L1211.29 72.018L1211.29 68.7629L1217.8 68.7629Z");
    			attr_dev(path14, "fill", "#E85151");
    			add_location(path14, file$j, 16, 0, 2031);
    			attr_dev(path15, "d", "M1211.29 68.7629L1211.29 72.018L1205.59 72.018L1208.03 68.7629L1211.29 68.7629Z");
    			attr_dev(path15, "fill", "#B83535");
    			add_location(path15, file$j, 17, 0, 2137);
    			attr_dev(path16, "d", "M1212.41 68.356L1212.41 68.856L1213.41 68.856L1213.41 68.356L1212.41 68.356ZM1213.41 56.9631C1213.41 56.687 1213.19 56.4631 1212.91 56.4631C1212.64 56.4631 1212.41 56.687 1212.41 56.9631L1213.41 56.9631ZM1213.41 68.356L1213.41 56.9631L1212.41 56.9631L1212.41 68.356L1213.41 68.356Z");
    			attr_dev(path16, "fill", "#FFF8F5");
    			add_location(path16, file$j, 18, 0, 2245);
    			attr_dev(rect1, "x", "1213.32");
    			attr_dev(rect1, "y", "57.3701");
    			attr_dev(rect1, "width", "6.5102");
    			attr_dev(rect1, "height", "4.06888");
    			attr_dev(rect1, "fill", "#E85151");
    			add_location(rect1, file$j, 19, 0, 2555);
    			attr_dev(path17, "d", "M1254.41 72.0178L1263.37 72.0178L1263.37 85.0382L1254.41 85.0382L1254.41 72.0178Z");
    			attr_dev(path17, "fill", "#FFF8F5");
    			add_location(path17, file$j, 20, 0, 2635);
    			attr_dev(path18, "d", "M1248.72 72.0178L1254.41 72.0178L1254.41 85.0382L1251.16 80.1556L1248.72 80.1556L1248.72 72.0178Z");
    			attr_dev(path18, "fill", "#CCB5AA");
    			add_location(path18, file$j, 21, 0, 2745);
    			attr_dev(path19, "d", "M1260.92 68.7627L1263.37 72.0178L1254.41 72.0178L1254.41 68.7627L1260.92 68.7627Z");
    			attr_dev(path19, "fill", "#E85151");
    			add_location(path19, file$j, 22, 0, 2871);
    			attr_dev(path20, "d", "M1254.41 68.7627L1254.41 72.0178L1248.72 72.0178L1251.16 68.7627L1254.41 68.7627Z");
    			attr_dev(path20, "fill", "#B83535");
    			add_location(path20, file$j, 23, 0, 2981);
    			attr_dev(path21, "d", "M1255.54 68.3557L1255.54 68.8557L1256.54 68.8557L1256.54 68.3557L1255.54 68.3557ZM1256.54 56.9629C1256.54 56.6867 1256.32 56.4629 1256.04 56.4629C1255.77 56.4629 1255.54 56.6867 1255.54 56.9629L1256.54 56.9629ZM1256.54 68.3557L1256.54 56.9629L1255.54 56.9629L1255.54 68.3557L1256.54 68.3557Z");
    			attr_dev(path21, "fill", "#FFF8F5");
    			add_location(path21, file$j, 24, 0, 3091);
    			attr_dev(rect2, "x", "1256.45");
    			attr_dev(rect2, "y", "57.3699");
    			attr_dev(rect2, "width", "6.5102");
    			attr_dev(rect2, "height", "4.06888");
    			attr_dev(rect2, "fill", "#458999");
    			add_location(rect2, file$j, 25, 0, 3411);
    			attr_dev(path22, "d", "M0 1272.5H1280V137C1280 137 1222.5 131.5 1079.5 164.5C921.729 200.908 772.5 258.646 578 274.5C390.467 289.786 179.516 274.954 0 298V1272.5Z");
    			attr_dev(path22, "fill", "#57661F");
    			add_location(path22, file$j, 26, 0, 3491);
    			attr_dev(path23, "d", "M1193.97 206.666C1214.92 207.376 1236.46 215.454 1251.46 217.194C1261.61 218.372 1271.2 219.066 1280 219.289L1280 175C1247.3 169.797 1208.21 171.171 1188.9 174.044C1156.95 178.8 1120.52 191.232 1131.83 200.475C1146.93 212.814 1173.02 205.956 1193.97 206.666Z");
    			attr_dev(path23, "fill", "#458999");
    			add_location(path23, file$j, 27, 0, 3659);
    			attr_dev(path24, "d", "M1280 2493.5H0V132C94.498 159.569 150.5 175.403 200.5 183.691C360.288 210.178 549.411 270.167 702 325.669C816.533 367.328 967.822 400.165 1087 401.482C1171 401.482 1241 366.332 1280 366.332V2493.5Z");
    			attr_dev(path24, "fill", "#9CB23E");
    			add_location(path24, file$j, 28, 0, 3946);
    			attr_dev(stop0, "stop-color", "#FFF8F5");
    			add_location(stop0, file$j, 31, 0, 4308);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#CCB5AA");
    			add_location(stop1, file$j, 32, 0, 4338);
    			attr_dev(linearGradient0, "id", "paint0_linear_688_876");
    			attr_dev(linearGradient0, "x1", "1120.86");
    			attr_dev(linearGradient0, "y1", "13.3264");
    			attr_dev(linearGradient0, "x2", "1110.38");
    			attr_dev(linearGradient0, "y2", "16.1897");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$j, 30, 0, 4180);
    			attr_dev(stop2, "stop-color", "#458999");
    			add_location(stop2, file$j, 35, 0, 4526);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#B5E2E8");
    			attr_dev(stop3, "stop-opacity", "0");
    			add_location(stop3, file$j, 36, 0, 4556);
    			attr_dev(linearGradient1, "id", "paint1_linear_688_876");
    			attr_dev(linearGradient1, "x1", "1096.67");
    			attr_dev(linearGradient1, "y1", "33.8574");
    			attr_dev(linearGradient1, "x2", "1096.67");
    			attr_dev(linearGradient1, "y2", "163.752");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$j, 34, 0, 4398);
    			attr_dev(stop4, "stop-color", "#458999");
    			add_location(stop4, file$j, 39, 0, 4761);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#B5E2E8");
    			attr_dev(stop5, "stop-opacity", "0");
    			add_location(stop5, file$j, 40, 0, 4791);
    			attr_dev(linearGradient2, "id", "paint2_linear_688_876");
    			attr_dev(linearGradient2, "x1", "1122.48");
    			attr_dev(linearGradient2, "y1", "34.7102");
    			attr_dev(linearGradient2, "x2", "1122.48");
    			attr_dev(linearGradient2, "y2", "164.179");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$j, 38, 0, 4633);
    			add_location(defs, file$j, 29, 0, 4172);
    			attr_dev(svg, "viewBox", "0 0 1280 2494");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "top", "32vh");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "100vw");
    			add_location(svg, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, rect0);
    			append_dev(svg, path10);
    			append_dev(svg, path11);
    			append_dev(svg, path12);
    			append_dev(svg, path13);
    			append_dev(svg, path14);
    			append_dev(svg, path15);
    			append_dev(svg, path16);
    			append_dev(svg, rect1);
    			append_dev(svg, path17);
    			append_dev(svg, path18);
    			append_dev(svg, path19);
    			append_dev(svg, path20);
    			append_dev(svg, path21);
    			append_dev(svg, rect2);
    			append_dev(svg, path22);
    			append_dev(svg, path23);
    			append_dev(svg, path24);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(defs, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ground', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ground> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Ground extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ground",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\components\assets\ducks.svelte generated by Svelte v3.46.3 */

    const file$i = "src\\components\\assets\\ducks.svelte";

    function create_fragment$i(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let defs;
    	let radialGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient0;
    	let stop2;
    	let stop3;
    	let radialGradient1;
    	let stop4;
    	let stop5;
    	let linearGradient1;
    	let stop6;
    	let stop7;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			defs = svg_element("defs");
    			radialGradient0 = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient0 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			radialGradient1 = svg_element("radialGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M78.8349 10.177C88.5522 19.0932 95.3054 33.7982 92.6081 47.1258C93.5855 47.2838 94.5723 47.4471 95.569 47.6153C105.605 36.2948 114.474 32.789 120.418 34.7264C132.25 38.5836 145.661 69.6509 137.495 95.5707C131.386 114.961 116.388 128.925 91.2309 134.095C63.2294 139.849 8.99596 141.922 8.99596 91.8966C8.99596 80.3027 11.1847 72.2045 16.6541 65.5478C1.80341 53.8592 9.32119 23.1571 20.2124 11.8745C35.427 -3.88703 63.9835 -3.44996 78.8349 10.177Z");
    			attr_dev(path0, "fill", "url(#paint0_radial_565_657)");
    			add_location(path0, file$i, 1, 0, 157);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M12.7986 42.9196C15.882 41.337 18.7298 39.8753 22.0381 36.4917C25.5923 45.1024 36.1387 49.7484 41.1743 50.8269C41.0408 53.9741 37.6079 58.3283 34.7365 59.8784C31.4046 61.677 22.2114 62.2544 14.167 61.0243C5.36343 59.6782 -1.05909 53.5936 0.951942 49.5515C1.98924 47.4665 4.16354 46.6214 7.01081 45.5147C8.47347 44.9462 10.1137 44.3086 11.8687 43.3985C12.1814 43.2363 12.4912 43.0773 12.7986 42.9196ZM38.3441 52.2137C38.4032 52.2244 38.4616 52.2345 38.5195 52.244C38.5178 52.2623 38.516 52.2807 38.5141 52.2994L38.3441 52.2137Z");
    			attr_dev(path1, "fill", "url(#paint1_linear_565_657)");
    			add_location(path1, file$i, 2, 0, 691);
    			attr_dev(path2, "d", "M49.1187 39.6889C48.4927 41.8079 49.3527 43.9337 51.0396 44.437C52.7266 44.9402 54.6016 43.6304 55.2276 41.5114C55.8536 39.3924 54.9936 37.2666 53.3066 36.7633C51.6197 36.26 49.7447 37.5698 49.1187 39.6889Z");
    			attr_dev(path2, "fill", "#1B2526");
    			add_location(path2, file$i, 3, 0, 1306);
    			attr_dev(path3, "d", "M12.0765 36.7741C11.6445 38.2363 12.0893 39.6588 13.07 39.9514C14.0506 40.244 15.1958 39.2958 15.6278 37.8336C16.0597 36.3714 15.6149 34.9489 14.6343 34.6563C13.6536 34.3637 12.5084 35.3119 12.0765 36.7741Z");
    			attr_dev(path3, "fill", "#1B2526");
    			add_location(path3, file$i, 4, 0, 1541);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "d", "M198.602 38.6798C181.666 54.1693 169.896 79.7151 174.597 102.868C172.894 103.143 171.174 103.426 169.437 103.719C151.946 84.0523 136.488 77.9619 126.129 81.3277C105.507 88.0284 82.1344 141.999 96.3657 187.028C107.012 220.714 133.152 244.973 176.998 253.953C225.8 263.949 320.321 267.551 320.321 180.645C320.321 160.504 316.507 146.436 306.974 134.871C332.857 114.566 319.755 61.2292 300.773 41.6287C274.256 14.2473 224.486 15.0066 198.602 38.6798Z");
    			attr_dev(path4, "fill", "url(#paint2_radial_565_657)");
    			add_location(path4, file$i, 5, 0, 1776);
    			attr_dev(path5, "fill-rule", "evenodd");
    			attr_dev(path5, "clip-rule", "evenodd");
    			attr_dev(path5, "d", "M313.694 95.5607C308.32 92.8114 303.356 90.2722 297.59 84.394C291.396 99.3528 273.015 107.424 264.239 109.297C264.471 114.765 270.454 122.329 275.459 125.022C281.266 128.147 297.288 129.15 311.309 127.013C326.652 124.674 337.846 114.104 334.341 107.082C332.533 103.46 328.743 101.992 323.781 100.069C321.232 99.0814 318.373 97.9738 315.314 96.3928C314.769 96.111 314.229 95.8348 313.694 95.5607ZM269.172 111.707C269.069 111.725 268.967 111.743 268.866 111.759C268.869 111.791 268.872 111.823 268.875 111.856L269.172 111.707Z");
    			attr_dev(path5, "fill", "url(#paint3_linear_565_657)");
    			add_location(path5, file$i, 6, 0, 2312);
    			attr_dev(path6, "d", "M250.393 89.9483C251.484 93.6295 249.985 97.3225 247.045 98.1968C244.105 99.0711 240.837 96.7956 239.746 93.1144C238.655 89.4332 240.154 85.7402 243.094 84.8659C246.034 83.9916 249.302 86.2671 250.393 89.9483Z");
    			attr_dev(path6, "fill", "#1B2526");
    			add_location(path6, file$i, 7, 0, 2925);
    			attr_dev(path7, "d", "M314.952 84.8846C315.705 87.4247 314.93 89.896 313.221 90.4042C311.512 90.9125 309.516 89.2653 308.763 86.7251C308.01 84.185 308.785 81.7137 310.494 81.2054C312.203 80.6972 314.199 82.3444 314.952 84.8846Z");
    			attr_dev(path7, "fill", "#1B2526");
    			add_location(path7, file$i, 8, 0, 3163);
    			attr_dev(stop0, "offset", "0.385417");
    			attr_dev(stop0, "stop-color", "#FFF8F5");
    			add_location(stop0, file$i, 11, 0, 3587);
    			attr_dev(stop1, "offset", "0.875");
    			attr_dev(stop1, "stop-color", "#CCB5AA");
    			add_location(stop1, file$i, 12, 0, 3635);
    			attr_dev(radialGradient0, "id", "paint0_radial_565_657");
    			attr_dev(radialGradient0, "cx", "0");
    			attr_dev(radialGradient0, "cy", "0");
    			attr_dev(radialGradient0, "r", "1");
    			attr_dev(radialGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient0, "gradientTransform", "translate(70.9653 35.8142) rotate(89.6908) scale(131.194 126.068)");
    			add_location(radialGradient0, file$i, 10, 0, 3405);
    			attr_dev(stop2, "offset", "0.125");
    			attr_dev(stop2, "stop-color", "#F2AC49");
    			add_location(stop2, file$i, 15, 0, 3827);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#FFCD59");
    			add_location(stop3, file$i, 16, 0, 3872);
    			attr_dev(linearGradient0, "id", "paint1_linear_565_657");
    			attr_dev(linearGradient0, "x1", "3.63584");
    			attr_dev(linearGradient0, "y1", "61.6402");
    			attr_dev(linearGradient0, "x2", "9.14885");
    			attr_dev(linearGradient0, "y2", "43.5506");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$i, 14, 0, 3699);
    			attr_dev(stop4, "offset", "0.385417");
    			attr_dev(stop4, "stop-color", "#FFF8F5");
    			add_location(stop4, file$i, 19, 0, 4114);
    			attr_dev(stop5, "offset", "0.875");
    			attr_dev(stop5, "stop-color", "#CCB5AA");
    			add_location(stop5, file$i, 20, 0, 4162);
    			attr_dev(radialGradient1, "id", "paint2_radial_565_657");
    			attr_dev(radialGradient1, "cx", "0");
    			attr_dev(radialGradient1, "cy", "0");
    			attr_dev(radialGradient1, "r", "1");
    			attr_dev(radialGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient1, "gradientTransform", "translate(212.318 83.2174) rotate(90.3103) scale(227.915 219.718)");
    			add_location(radialGradient1, file$i, 18, 0, 3932);
    			attr_dev(stop6, "offset", "0.125");
    			attr_dev(stop6, "stop-color", "#F2AC49");
    			add_location(stop6, file$i, 23, 0, 4354);
    			attr_dev(stop7, "offset", "1");
    			attr_dev(stop7, "stop-color", "#FFCD59");
    			add_location(stop7, file$i, 24, 0, 4399);
    			attr_dev(linearGradient1, "id", "paint3_linear_565_657");
    			attr_dev(linearGradient1, "x1", "329.663");
    			attr_dev(linearGradient1, "y1", "128.083");
    			attr_dev(linearGradient1, "x2", "320.111");
    			attr_dev(linearGradient1, "y2", "96.6398");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$i, 22, 0, 4226);
    			add_location(defs, file$i, 9, 0, 3397);
    			attr_dev(svg, "width", "336");
    			attr_dev(svg, "height", "259");
    			attr_dev(svg, "viewBox", "0 0 336 259");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "35vw");
    			set_style(svg, "top", "49vh");
    			set_style(svg, "left", "6vw");
    			add_location(svg, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, defs);
    			append_dev(defs, radialGradient0);
    			append_dev(radialGradient0, stop0);
    			append_dev(radialGradient0, stop1);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop2);
    			append_dev(linearGradient0, stop3);
    			append_dev(defs, radialGradient1);
    			append_dev(radialGradient1, stop4);
    			append_dev(radialGradient1, stop5);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop6);
    			append_dev(linearGradient1, stop7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ducks', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ducks> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Ducks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ducks",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\components\assets\flowers.svelte generated by Svelte v3.46.3 */

    const file$h = "src\\components\\assets\\flowers.svelte";

    function create_fragment$h(ctx) {
    	let svg;
    	let mask;
    	let rect;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let path51;
    	let path52;
    	let path53;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let path58;
    	let path59;
    	let path60;
    	let path61;
    	let path62;
    	let path63;
    	let path64;
    	let path65;
    	let path66;
    	let path67;
    	let path68;
    	let path69;
    	let path70;
    	let path71;
    	let path72;
    	let path73;
    	let path74;
    	let path75;
    	let path76;
    	let path77;
    	let path78;
    	let path79;
    	let path80;
    	let path81;
    	let path82;
    	let path83;
    	let path84;
    	let path85;
    	let path86;
    	let path87;
    	let path88;
    	let path89;
    	let path90;
    	let path91;
    	let path92;
    	let path93;
    	let path94;
    	let path95;
    	let path96;
    	let path97;
    	let path98;
    	let path99;
    	let path100;
    	let path101;
    	let path102;
    	let path103;
    	let path104;
    	let path105;
    	let path106;
    	let path107;
    	let path108;
    	let path109;
    	let path110;
    	let path111;
    	let path112;
    	let path113;
    	let path114;
    	let path115;
    	let path116;
    	let path117;
    	let path118;
    	let path119;
    	let path120;
    	let path121;
    	let path122;
    	let path123;
    	let path124;
    	let path125;
    	let path126;
    	let path127;
    	let path128;
    	let path129;
    	let path130;
    	let path131;
    	let path132;
    	let path133;
    	let path134;
    	let path135;
    	let path136;
    	let path137;
    	let path138;
    	let path139;
    	let path140;
    	let path141;
    	let path142;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;
    	let linearGradient3;
    	let stop6;
    	let stop7;
    	let linearGradient4;
    	let stop8;
    	let stop9;
    	let linearGradient5;
    	let stop10;
    	let stop11;
    	let linearGradient6;
    	let stop12;
    	let stop13;
    	let linearGradient7;
    	let stop14;
    	let stop15;
    	let linearGradient8;
    	let stop16;
    	let stop17;
    	let linearGradient9;
    	let stop18;
    	let stop19;
    	let linearGradient10;
    	let stop20;
    	let stop21;
    	let linearGradient11;
    	let stop22;
    	let stop23;
    	let linearGradient12;
    	let stop24;
    	let stop25;
    	let linearGradient13;
    	let stop26;
    	let stop27;
    	let linearGradient14;
    	let stop28;
    	let stop29;
    	let linearGradient15;
    	let stop30;
    	let stop31;
    	let linearGradient16;
    	let stop32;
    	let stop33;
    	let linearGradient17;
    	let stop34;
    	let stop35;
    	let linearGradient18;
    	let stop36;
    	let stop37;
    	let linearGradient19;
    	let stop38;
    	let stop39;
    	let linearGradient20;
    	let stop40;
    	let stop41;
    	let linearGradient21;
    	let stop42;
    	let stop43;
    	let linearGradient22;
    	let stop44;
    	let stop45;
    	let linearGradient23;
    	let stop46;
    	let stop47;
    	let linearGradient24;
    	let stop48;
    	let stop49;
    	let linearGradient25;
    	let stop50;
    	let stop51;
    	let linearGradient26;
    	let stop52;
    	let stop53;
    	let linearGradient27;
    	let stop54;
    	let stop55;
    	let linearGradient28;
    	let stop56;
    	let stop57;
    	let linearGradient29;
    	let stop58;
    	let stop59;
    	let linearGradient30;
    	let stop60;
    	let stop61;
    	let linearGradient31;
    	let stop62;
    	let stop63;
    	let linearGradient32;
    	let stop64;
    	let stop65;
    	let linearGradient33;
    	let stop66;
    	let stop67;
    	let linearGradient34;
    	let stop68;
    	let stop69;
    	let linearGradient35;
    	let stop70;
    	let stop71;
    	let linearGradient36;
    	let stop72;
    	let stop73;
    	let linearGradient37;
    	let stop74;
    	let stop75;
    	let linearGradient38;
    	let stop76;
    	let stop77;
    	let linearGradient39;
    	let stop78;
    	let stop79;
    	let linearGradient40;
    	let stop80;
    	let stop81;
    	let linearGradient41;
    	let stop82;
    	let stop83;
    	let linearGradient42;
    	let stop84;
    	let stop85;
    	let linearGradient43;
    	let stop86;
    	let stop87;
    	let linearGradient44;
    	let stop88;
    	let stop89;
    	let linearGradient45;
    	let stop90;
    	let stop91;
    	let linearGradient46;
    	let stop92;
    	let stop93;
    	let linearGradient47;
    	let stop94;
    	let stop95;
    	let linearGradient48;
    	let stop96;
    	let stop97;
    	let linearGradient49;
    	let stop98;
    	let stop99;
    	let linearGradient50;
    	let stop100;
    	let stop101;
    	let linearGradient51;
    	let stop102;
    	let stop103;
    	let linearGradient52;
    	let stop104;
    	let stop105;
    	let linearGradient53;
    	let stop106;
    	let stop107;
    	let linearGradient54;
    	let stop108;
    	let stop109;
    	let linearGradient55;
    	let stop110;
    	let stop111;
    	let linearGradient56;
    	let stop112;
    	let stop113;
    	let linearGradient57;
    	let stop114;
    	let stop115;
    	let linearGradient58;
    	let stop116;
    	let stop117;
    	let linearGradient59;
    	let stop118;
    	let stop119;
    	let linearGradient60;
    	let stop120;
    	let stop121;
    	let linearGradient61;
    	let stop122;
    	let stop123;
    	let linearGradient62;
    	let stop124;
    	let stop125;
    	let linearGradient63;
    	let stop126;
    	let stop127;
    	let linearGradient64;
    	let stop128;
    	let stop129;
    	let linearGradient65;
    	let stop130;
    	let stop131;
    	let linearGradient66;
    	let stop132;
    	let stop133;
    	let linearGradient67;
    	let stop134;
    	let stop135;
    	let linearGradient68;
    	let stop136;
    	let stop137;
    	let linearGradient69;
    	let stop138;
    	let stop139;
    	let linearGradient70;
    	let stop140;
    	let stop141;
    	let linearGradient71;
    	let stop142;
    	let stop143;
    	let linearGradient72;
    	let stop144;
    	let stop145;
    	let linearGradient73;
    	let stop146;
    	let stop147;
    	let linearGradient74;
    	let stop148;
    	let stop149;
    	let linearGradient75;
    	let stop150;
    	let stop151;
    	let linearGradient76;
    	let stop152;
    	let stop153;
    	let linearGradient77;
    	let stop154;
    	let stop155;
    	let linearGradient78;
    	let stop156;
    	let stop157;
    	let linearGradient79;
    	let stop158;
    	let stop159;
    	let linearGradient80;
    	let stop160;
    	let stop161;
    	let linearGradient81;
    	let stop162;
    	let stop163;
    	let linearGradient82;
    	let stop164;
    	let stop165;
    	let linearGradient83;
    	let stop166;
    	let stop167;
    	let linearGradient84;
    	let stop168;
    	let stop169;
    	let linearGradient85;
    	let stop170;
    	let stop171;
    	let linearGradient86;
    	let stop172;
    	let stop173;
    	let linearGradient87;
    	let stop174;
    	let stop175;
    	let linearGradient88;
    	let stop176;
    	let stop177;
    	let linearGradient89;
    	let stop178;
    	let stop179;
    	let linearGradient90;
    	let stop180;
    	let stop181;
    	let linearGradient91;
    	let stop182;
    	let stop183;
    	let linearGradient92;
    	let stop184;
    	let stop185;
    	let linearGradient93;
    	let stop186;
    	let stop187;
    	let linearGradient94;
    	let stop188;
    	let stop189;
    	let linearGradient95;
    	let stop190;
    	let stop191;
    	let linearGradient96;
    	let stop192;
    	let stop193;
    	let linearGradient97;
    	let stop194;
    	let stop195;
    	let linearGradient98;
    	let stop196;
    	let stop197;
    	let linearGradient99;
    	let stop198;
    	let stop199;
    	let linearGradient100;
    	let stop200;
    	let stop201;
    	let linearGradient101;
    	let stop202;
    	let stop203;
    	let linearGradient102;
    	let stop204;
    	let stop205;
    	let linearGradient103;
    	let stop206;
    	let stop207;
    	let linearGradient104;
    	let stop208;
    	let stop209;
    	let linearGradient105;
    	let stop210;
    	let stop211;
    	let linearGradient106;
    	let stop212;
    	let stop213;
    	let linearGradient107;
    	let stop214;
    	let stop215;
    	let linearGradient108;
    	let stop216;
    	let stop217;
    	let linearGradient109;
    	let stop218;
    	let stop219;
    	let linearGradient110;
    	let stop220;
    	let stop221;
    	let linearGradient111;
    	let stop222;
    	let stop223;
    	let linearGradient112;
    	let stop224;
    	let stop225;
    	let linearGradient113;
    	let stop226;
    	let stop227;
    	let linearGradient114;
    	let stop228;
    	let stop229;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			mask = svg_element("mask");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			path60 = svg_element("path");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			path64 = svg_element("path");
    			path65 = svg_element("path");
    			path66 = svg_element("path");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			path69 = svg_element("path");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			path75 = svg_element("path");
    			path76 = svg_element("path");
    			path77 = svg_element("path");
    			path78 = svg_element("path");
    			path79 = svg_element("path");
    			path80 = svg_element("path");
    			path81 = svg_element("path");
    			path82 = svg_element("path");
    			path83 = svg_element("path");
    			path84 = svg_element("path");
    			path85 = svg_element("path");
    			path86 = svg_element("path");
    			path87 = svg_element("path");
    			path88 = svg_element("path");
    			path89 = svg_element("path");
    			path90 = svg_element("path");
    			path91 = svg_element("path");
    			path92 = svg_element("path");
    			path93 = svg_element("path");
    			path94 = svg_element("path");
    			path95 = svg_element("path");
    			path96 = svg_element("path");
    			path97 = svg_element("path");
    			path98 = svg_element("path");
    			path99 = svg_element("path");
    			path100 = svg_element("path");
    			path101 = svg_element("path");
    			path102 = svg_element("path");
    			path103 = svg_element("path");
    			path104 = svg_element("path");
    			path105 = svg_element("path");
    			path106 = svg_element("path");
    			path107 = svg_element("path");
    			path108 = svg_element("path");
    			path109 = svg_element("path");
    			path110 = svg_element("path");
    			path111 = svg_element("path");
    			path112 = svg_element("path");
    			path113 = svg_element("path");
    			path114 = svg_element("path");
    			path115 = svg_element("path");
    			path116 = svg_element("path");
    			path117 = svg_element("path");
    			path118 = svg_element("path");
    			path119 = svg_element("path");
    			path120 = svg_element("path");
    			path121 = svg_element("path");
    			path122 = svg_element("path");
    			path123 = svg_element("path");
    			path124 = svg_element("path");
    			path125 = svg_element("path");
    			path126 = svg_element("path");
    			path127 = svg_element("path");
    			path128 = svg_element("path");
    			path129 = svg_element("path");
    			path130 = svg_element("path");
    			path131 = svg_element("path");
    			path132 = svg_element("path");
    			path133 = svg_element("path");
    			path134 = svg_element("path");
    			path135 = svg_element("path");
    			path136 = svg_element("path");
    			path137 = svg_element("path");
    			path138 = svg_element("path");
    			path139 = svg_element("path");
    			path140 = svg_element("path");
    			path141 = svg_element("path");
    			path142 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			linearGradient3 = svg_element("linearGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			linearGradient4 = svg_element("linearGradient");
    			stop8 = svg_element("stop");
    			stop9 = svg_element("stop");
    			linearGradient5 = svg_element("linearGradient");
    			stop10 = svg_element("stop");
    			stop11 = svg_element("stop");
    			linearGradient6 = svg_element("linearGradient");
    			stop12 = svg_element("stop");
    			stop13 = svg_element("stop");
    			linearGradient7 = svg_element("linearGradient");
    			stop14 = svg_element("stop");
    			stop15 = svg_element("stop");
    			linearGradient8 = svg_element("linearGradient");
    			stop16 = svg_element("stop");
    			stop17 = svg_element("stop");
    			linearGradient9 = svg_element("linearGradient");
    			stop18 = svg_element("stop");
    			stop19 = svg_element("stop");
    			linearGradient10 = svg_element("linearGradient");
    			stop20 = svg_element("stop");
    			stop21 = svg_element("stop");
    			linearGradient11 = svg_element("linearGradient");
    			stop22 = svg_element("stop");
    			stop23 = svg_element("stop");
    			linearGradient12 = svg_element("linearGradient");
    			stop24 = svg_element("stop");
    			stop25 = svg_element("stop");
    			linearGradient13 = svg_element("linearGradient");
    			stop26 = svg_element("stop");
    			stop27 = svg_element("stop");
    			linearGradient14 = svg_element("linearGradient");
    			stop28 = svg_element("stop");
    			stop29 = svg_element("stop");
    			linearGradient15 = svg_element("linearGradient");
    			stop30 = svg_element("stop");
    			stop31 = svg_element("stop");
    			linearGradient16 = svg_element("linearGradient");
    			stop32 = svg_element("stop");
    			stop33 = svg_element("stop");
    			linearGradient17 = svg_element("linearGradient");
    			stop34 = svg_element("stop");
    			stop35 = svg_element("stop");
    			linearGradient18 = svg_element("linearGradient");
    			stop36 = svg_element("stop");
    			stop37 = svg_element("stop");
    			linearGradient19 = svg_element("linearGradient");
    			stop38 = svg_element("stop");
    			stop39 = svg_element("stop");
    			linearGradient20 = svg_element("linearGradient");
    			stop40 = svg_element("stop");
    			stop41 = svg_element("stop");
    			linearGradient21 = svg_element("linearGradient");
    			stop42 = svg_element("stop");
    			stop43 = svg_element("stop");
    			linearGradient22 = svg_element("linearGradient");
    			stop44 = svg_element("stop");
    			stop45 = svg_element("stop");
    			linearGradient23 = svg_element("linearGradient");
    			stop46 = svg_element("stop");
    			stop47 = svg_element("stop");
    			linearGradient24 = svg_element("linearGradient");
    			stop48 = svg_element("stop");
    			stop49 = svg_element("stop");
    			linearGradient25 = svg_element("linearGradient");
    			stop50 = svg_element("stop");
    			stop51 = svg_element("stop");
    			linearGradient26 = svg_element("linearGradient");
    			stop52 = svg_element("stop");
    			stop53 = svg_element("stop");
    			linearGradient27 = svg_element("linearGradient");
    			stop54 = svg_element("stop");
    			stop55 = svg_element("stop");
    			linearGradient28 = svg_element("linearGradient");
    			stop56 = svg_element("stop");
    			stop57 = svg_element("stop");
    			linearGradient29 = svg_element("linearGradient");
    			stop58 = svg_element("stop");
    			stop59 = svg_element("stop");
    			linearGradient30 = svg_element("linearGradient");
    			stop60 = svg_element("stop");
    			stop61 = svg_element("stop");
    			linearGradient31 = svg_element("linearGradient");
    			stop62 = svg_element("stop");
    			stop63 = svg_element("stop");
    			linearGradient32 = svg_element("linearGradient");
    			stop64 = svg_element("stop");
    			stop65 = svg_element("stop");
    			linearGradient33 = svg_element("linearGradient");
    			stop66 = svg_element("stop");
    			stop67 = svg_element("stop");
    			linearGradient34 = svg_element("linearGradient");
    			stop68 = svg_element("stop");
    			stop69 = svg_element("stop");
    			linearGradient35 = svg_element("linearGradient");
    			stop70 = svg_element("stop");
    			stop71 = svg_element("stop");
    			linearGradient36 = svg_element("linearGradient");
    			stop72 = svg_element("stop");
    			stop73 = svg_element("stop");
    			linearGradient37 = svg_element("linearGradient");
    			stop74 = svg_element("stop");
    			stop75 = svg_element("stop");
    			linearGradient38 = svg_element("linearGradient");
    			stop76 = svg_element("stop");
    			stop77 = svg_element("stop");
    			linearGradient39 = svg_element("linearGradient");
    			stop78 = svg_element("stop");
    			stop79 = svg_element("stop");
    			linearGradient40 = svg_element("linearGradient");
    			stop80 = svg_element("stop");
    			stop81 = svg_element("stop");
    			linearGradient41 = svg_element("linearGradient");
    			stop82 = svg_element("stop");
    			stop83 = svg_element("stop");
    			linearGradient42 = svg_element("linearGradient");
    			stop84 = svg_element("stop");
    			stop85 = svg_element("stop");
    			linearGradient43 = svg_element("linearGradient");
    			stop86 = svg_element("stop");
    			stop87 = svg_element("stop");
    			linearGradient44 = svg_element("linearGradient");
    			stop88 = svg_element("stop");
    			stop89 = svg_element("stop");
    			linearGradient45 = svg_element("linearGradient");
    			stop90 = svg_element("stop");
    			stop91 = svg_element("stop");
    			linearGradient46 = svg_element("linearGradient");
    			stop92 = svg_element("stop");
    			stop93 = svg_element("stop");
    			linearGradient47 = svg_element("linearGradient");
    			stop94 = svg_element("stop");
    			stop95 = svg_element("stop");
    			linearGradient48 = svg_element("linearGradient");
    			stop96 = svg_element("stop");
    			stop97 = svg_element("stop");
    			linearGradient49 = svg_element("linearGradient");
    			stop98 = svg_element("stop");
    			stop99 = svg_element("stop");
    			linearGradient50 = svg_element("linearGradient");
    			stop100 = svg_element("stop");
    			stop101 = svg_element("stop");
    			linearGradient51 = svg_element("linearGradient");
    			stop102 = svg_element("stop");
    			stop103 = svg_element("stop");
    			linearGradient52 = svg_element("linearGradient");
    			stop104 = svg_element("stop");
    			stop105 = svg_element("stop");
    			linearGradient53 = svg_element("linearGradient");
    			stop106 = svg_element("stop");
    			stop107 = svg_element("stop");
    			linearGradient54 = svg_element("linearGradient");
    			stop108 = svg_element("stop");
    			stop109 = svg_element("stop");
    			linearGradient55 = svg_element("linearGradient");
    			stop110 = svg_element("stop");
    			stop111 = svg_element("stop");
    			linearGradient56 = svg_element("linearGradient");
    			stop112 = svg_element("stop");
    			stop113 = svg_element("stop");
    			linearGradient57 = svg_element("linearGradient");
    			stop114 = svg_element("stop");
    			stop115 = svg_element("stop");
    			linearGradient58 = svg_element("linearGradient");
    			stop116 = svg_element("stop");
    			stop117 = svg_element("stop");
    			linearGradient59 = svg_element("linearGradient");
    			stop118 = svg_element("stop");
    			stop119 = svg_element("stop");
    			linearGradient60 = svg_element("linearGradient");
    			stop120 = svg_element("stop");
    			stop121 = svg_element("stop");
    			linearGradient61 = svg_element("linearGradient");
    			stop122 = svg_element("stop");
    			stop123 = svg_element("stop");
    			linearGradient62 = svg_element("linearGradient");
    			stop124 = svg_element("stop");
    			stop125 = svg_element("stop");
    			linearGradient63 = svg_element("linearGradient");
    			stop126 = svg_element("stop");
    			stop127 = svg_element("stop");
    			linearGradient64 = svg_element("linearGradient");
    			stop128 = svg_element("stop");
    			stop129 = svg_element("stop");
    			linearGradient65 = svg_element("linearGradient");
    			stop130 = svg_element("stop");
    			stop131 = svg_element("stop");
    			linearGradient66 = svg_element("linearGradient");
    			stop132 = svg_element("stop");
    			stop133 = svg_element("stop");
    			linearGradient67 = svg_element("linearGradient");
    			stop134 = svg_element("stop");
    			stop135 = svg_element("stop");
    			linearGradient68 = svg_element("linearGradient");
    			stop136 = svg_element("stop");
    			stop137 = svg_element("stop");
    			linearGradient69 = svg_element("linearGradient");
    			stop138 = svg_element("stop");
    			stop139 = svg_element("stop");
    			linearGradient70 = svg_element("linearGradient");
    			stop140 = svg_element("stop");
    			stop141 = svg_element("stop");
    			linearGradient71 = svg_element("linearGradient");
    			stop142 = svg_element("stop");
    			stop143 = svg_element("stop");
    			linearGradient72 = svg_element("linearGradient");
    			stop144 = svg_element("stop");
    			stop145 = svg_element("stop");
    			linearGradient73 = svg_element("linearGradient");
    			stop146 = svg_element("stop");
    			stop147 = svg_element("stop");
    			linearGradient74 = svg_element("linearGradient");
    			stop148 = svg_element("stop");
    			stop149 = svg_element("stop");
    			linearGradient75 = svg_element("linearGradient");
    			stop150 = svg_element("stop");
    			stop151 = svg_element("stop");
    			linearGradient76 = svg_element("linearGradient");
    			stop152 = svg_element("stop");
    			stop153 = svg_element("stop");
    			linearGradient77 = svg_element("linearGradient");
    			stop154 = svg_element("stop");
    			stop155 = svg_element("stop");
    			linearGradient78 = svg_element("linearGradient");
    			stop156 = svg_element("stop");
    			stop157 = svg_element("stop");
    			linearGradient79 = svg_element("linearGradient");
    			stop158 = svg_element("stop");
    			stop159 = svg_element("stop");
    			linearGradient80 = svg_element("linearGradient");
    			stop160 = svg_element("stop");
    			stop161 = svg_element("stop");
    			linearGradient81 = svg_element("linearGradient");
    			stop162 = svg_element("stop");
    			stop163 = svg_element("stop");
    			linearGradient82 = svg_element("linearGradient");
    			stop164 = svg_element("stop");
    			stop165 = svg_element("stop");
    			linearGradient83 = svg_element("linearGradient");
    			stop166 = svg_element("stop");
    			stop167 = svg_element("stop");
    			linearGradient84 = svg_element("linearGradient");
    			stop168 = svg_element("stop");
    			stop169 = svg_element("stop");
    			linearGradient85 = svg_element("linearGradient");
    			stop170 = svg_element("stop");
    			stop171 = svg_element("stop");
    			linearGradient86 = svg_element("linearGradient");
    			stop172 = svg_element("stop");
    			stop173 = svg_element("stop");
    			linearGradient87 = svg_element("linearGradient");
    			stop174 = svg_element("stop");
    			stop175 = svg_element("stop");
    			linearGradient88 = svg_element("linearGradient");
    			stop176 = svg_element("stop");
    			stop177 = svg_element("stop");
    			linearGradient89 = svg_element("linearGradient");
    			stop178 = svg_element("stop");
    			stop179 = svg_element("stop");
    			linearGradient90 = svg_element("linearGradient");
    			stop180 = svg_element("stop");
    			stop181 = svg_element("stop");
    			linearGradient91 = svg_element("linearGradient");
    			stop182 = svg_element("stop");
    			stop183 = svg_element("stop");
    			linearGradient92 = svg_element("linearGradient");
    			stop184 = svg_element("stop");
    			stop185 = svg_element("stop");
    			linearGradient93 = svg_element("linearGradient");
    			stop186 = svg_element("stop");
    			stop187 = svg_element("stop");
    			linearGradient94 = svg_element("linearGradient");
    			stop188 = svg_element("stop");
    			stop189 = svg_element("stop");
    			linearGradient95 = svg_element("linearGradient");
    			stop190 = svg_element("stop");
    			stop191 = svg_element("stop");
    			linearGradient96 = svg_element("linearGradient");
    			stop192 = svg_element("stop");
    			stop193 = svg_element("stop");
    			linearGradient97 = svg_element("linearGradient");
    			stop194 = svg_element("stop");
    			stop195 = svg_element("stop");
    			linearGradient98 = svg_element("linearGradient");
    			stop196 = svg_element("stop");
    			stop197 = svg_element("stop");
    			linearGradient99 = svg_element("linearGradient");
    			stop198 = svg_element("stop");
    			stop199 = svg_element("stop");
    			linearGradient100 = svg_element("linearGradient");
    			stop200 = svg_element("stop");
    			stop201 = svg_element("stop");
    			linearGradient101 = svg_element("linearGradient");
    			stop202 = svg_element("stop");
    			stop203 = svg_element("stop");
    			linearGradient102 = svg_element("linearGradient");
    			stop204 = svg_element("stop");
    			stop205 = svg_element("stop");
    			linearGradient103 = svg_element("linearGradient");
    			stop206 = svg_element("stop");
    			stop207 = svg_element("stop");
    			linearGradient104 = svg_element("linearGradient");
    			stop208 = svg_element("stop");
    			stop209 = svg_element("stop");
    			linearGradient105 = svg_element("linearGradient");
    			stop210 = svg_element("stop");
    			stop211 = svg_element("stop");
    			linearGradient106 = svg_element("linearGradient");
    			stop212 = svg_element("stop");
    			stop213 = svg_element("stop");
    			linearGradient107 = svg_element("linearGradient");
    			stop214 = svg_element("stop");
    			stop215 = svg_element("stop");
    			linearGradient108 = svg_element("linearGradient");
    			stop216 = svg_element("stop");
    			stop217 = svg_element("stop");
    			linearGradient109 = svg_element("linearGradient");
    			stop218 = svg_element("stop");
    			stop219 = svg_element("stop");
    			linearGradient110 = svg_element("linearGradient");
    			stop220 = svg_element("stop");
    			stop221 = svg_element("stop");
    			linearGradient111 = svg_element("linearGradient");
    			stop222 = svg_element("stop");
    			stop223 = svg_element("stop");
    			linearGradient112 = svg_element("linearGradient");
    			stop224 = svg_element("stop");
    			stop225 = svg_element("stop");
    			linearGradient113 = svg_element("linearGradient");
    			stop226 = svg_element("stop");
    			stop227 = svg_element("stop");
    			linearGradient114 = svg_element("linearGradient");
    			stop228 = svg_element("stop");
    			stop229 = svg_element("stop");
    			attr_dev(rect, "y", "0.000244141");
    			attr_dev(rect, "width", "1280");
    			attr_dev(rect, "height", "900");
    			attr_dev(rect, "fill", "#D9D9D9");
    			add_location(rect, file$h, 2, 0, 253);
    			attr_dev(mask, "id", "mask0_637_19820");
    			set_style(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "1280");
    			attr_dev(mask, "height", "901");
    			add_location(mask, file$h, 1, 0, 135);
    			attr_dev(path0, "d", "M1072.11 379.945L1087.31 384.184C1106.72 338.467 1105.46 262.553 1103.23 213.449L1096.41 213.396C1094.26 266.286 1092.85 330.448 1072.11 379.945Z");
    			attr_dev(path0, "fill", "url(#paint0_linear_637_19820)");
    			add_location(path0, file$h, 5, 0, 362);
    			attr_dev(path1, "d", "M1098.85 232.394C1100.44 235.628 1111.7 232.663 1115.19 230.916C1112.92 222.609 1107.38 181.785 1098.42 178.577C1096.25 177.801 1092.6 178.587 1089.56 182.638C1086.2 187.092 1083.79 203.071 1085.2 210.933C1086.91 220.522 1097.26 229.159 1098.85 232.394Z");
    			attr_dev(path1, "fill", "#B83535");
    			add_location(path1, file$h, 6, 0, 558);
    			attr_dev(path2, "d", "M1087.41 217.88C1088.01 210.761 1102.08 173.883 1113.23 181.637C1131.98 194.668 1130.11 229.022 1108.93 240.011C1094.03 247.743 1086.4 230.045 1087.41 217.88Z");
    			attr_dev(path2, "fill", "url(#paint1_linear_637_19820)");
    			add_location(path2, file$h, 7, 0, 840);
    			attr_dev(path3, "d", "M1107.48 216.793C1109.92 232.812 1101.6 249.673 1083.73 241.209C1059.98 229.962 1058.6 197.359 1075.81 181.345C1086.94 170.986 1106.2 208.441 1107.48 216.793Z");
    			attr_dev(path3, "fill", "url(#paint2_linear_637_19820)");
    			add_location(path3, file$h, 8, 0, 1049);
    			attr_dev(path4, "d", "M311.311 377.238L299.333 373.102C287.574 313.1 304.23 234.141 319.916 176.143L321.434 188.227C310.902 247.149 300.013 318.064 311.311 377.238Z");
    			attr_dev(path4, "fill", "url(#paint3_linear_637_19820)");
    			add_location(path4, file$h, 9, 0, 1258);
    			attr_dev(path5, "d", "M333.029 172.917L315.334 169.595C316.286 163.148 323.719 155.719 327.326 156.781C328.802 157.215 332.967 163.225 333.029 172.917Z");
    			attr_dev(path5, "fill", "url(#paint4_linear_637_19820)");
    			add_location(path5, file$h, 10, 0, 1451);
    			attr_dev(path6, "d", "M319.655 175.209C321.433 171.036 328.122 167.98 333.543 163.903C335.251 169.208 332.859 177.856 330.584 181.842C327.742 186.826 320.589 188.644 318.395 187.315C316.201 185.985 317.919 179.282 319.655 175.209Z");
    			attr_dev(path6, "fill", "#57661F");
    			add_location(path6, file$h, 11, 0, 1631);
    			attr_dev(path7, "d", "M325.256 178.039C324.159 172.761 319.289 163.566 317.241 160.363C313.614 164.328 311.687 172.593 311.956 177.175C312.292 182.902 317.67 188.218 320.227 188.001C322.783 187.783 326.156 182.374 325.256 178.039Z");
    			attr_dev(path7, "fill", "#57661F");
    			add_location(path7, file$h, 12, 0, 1868);
    			attr_dev(path8, "d", "M313.581 244.523C309.29 252.404 307.179 279.14 306.659 291.522C310.557 273.881 318.032 268.234 328.473 251.338C336.943 237.63 342.536 220.236 338.374 205.656C332.137 218.901 317.584 237.171 313.581 244.523Z");
    			attr_dev(path8, "fill", "url(#paint5_linear_637_19820)");
    			add_location(path8, file$h, 13, 0, 2105);
    			attr_dev(path9, "d", "M865.539 417.604L881.346 420.807C899.376 364.926 902.683 315.98 894.093 257.38L887.193 257.782C890.699 317.867 883.44 361.187 865.539 417.604Z");
    			attr_dev(path9, "fill", "url(#paint6_linear_637_19820)");
    			add_location(path9, file$h, 14, 0, 2362);
    			attr_dev(path10, "d", "M858.173 219.359C856.411 221.819 862.185 245.281 866.68 252.165C876.443 267.119 893.078 273.122 906.335 259.021C900.798 252.582 869.115 204.08 858.173 219.359Z");
    			attr_dev(path10, "fill", "url(#paint7_linear_637_19820)");
    			add_location(path10, file$h, 15, 0, 2555);
    			attr_dev(path11, "d", "M886.013 268.35C888.573 271.113 903.103 262.5 906.003 259.416C913.931 250.983 915.449 239.781 913.075 228.976C909.342 221.478 902.467 202.516 893.63 199.194C879.97 194.057 874.057 210.284 871.792 219.627C869.264 239.932 871.991 253.224 886.013 268.35Z");
    			attr_dev(path11, "fill", "url(#paint8_linear_637_19820)");
    			add_location(path11, file$h, 16, 0, 2765);
    			attr_dev(path12, "d", "M903.396 476.315L888.817 476.367C853.285 415.659 841.423 323.584 836.459 254.642L842.691 267.191C853.604 335.181 868.678 416.332 903.396 476.315Z");
    			attr_dev(path12, "fill", "url(#paint9_linear_637_19820)");
    			add_location(path12, file$h, 17, 0, 3067);
    			attr_dev(path13, "d", "M848.476 248.163L827.997 251.268C826.586 243.905 831.841 233.017 836.162 232.801C837.929 232.713 844.732 237.66 848.476 248.163Z");
    			attr_dev(path13, "fill", "url(#paint10_linear_637_19820)");
    			add_location(path13, file$h, 18, 0, 3263);
    			attr_dev(path14, "d", "M834.821 255.726C835.169 250.52 841.274 244.663 845.615 238.178C849.483 243.292 850.165 253.592 849.207 258.785C848.01 265.275 840.932 269.964 838.044 269.352C835.157 268.741 834.48 260.808 834.821 255.726Z");
    			attr_dev(path14, "fill", "#57661F");
    			add_location(path14, file$h, 19, 0, 3443);
    			attr_dev(path15, "d", "M841.977 256.675C838.784 251.359 830.006 243.219 826.567 240.518C824.132 246.199 825.174 255.907 827.204 260.782C829.742 266.875 837.6 270.608 840.294 269.402C842.988 268.196 844.599 261.042 841.977 256.675Z");
    			attr_dev(path15, "fill", "#57661F");
    			add_location(path15, file$h, 20, 0, 3678);
    			attr_dev(path16, "d", "M856.154 331.261C855.275 341.546 862.333 371.286 866.466 384.932C864.007 364.293 869.984 355.325 874.914 333.013C878.914 314.912 878.389 293.898 868.338 279.642C865 290 859 298 856.154 331.261Z");
    			attr_dev(path16, "fill", "url(#paint11_linear_637_19820)");
    			add_location(path16, file$h, 21, 0, 3914);
    			attr_dev(path17, "d", "M1249.73 543.087L1275.29 538.918C1277.56 431.939 1260.5 345.876 1220.93 250.512L1210.58 255.422C1243.07 356.445 1251.56 435.268 1249.73 543.087Z");
    			attr_dev(path17, "fill", "url(#paint12_linear_637_19820)");
    			add_location(path17, file$h, 22, 0, 4159);
    			attr_dev(path18, "d", "M1138.17 205.129C1136.51 210.415 1159.94 247.941 1171.69 257.353C1197.21 277.801 1229.57 278.755 1244.59 246.657C1231.29 238.612 1148.49 172.305 1138.17 205.129Z");
    			attr_dev(path18, "fill", "url(#paint13_linear_637_19820)");
    			add_location(path18, file$h, 23, 0, 4355);
    			attr_dev(path19, "d", "M1214.56 274.483C1220.59 277.829 1240.96 254.554 1244.24 247.533C1253.22 228.337 1249.47 207.981 1239.18 190.537C1228.41 179.622 1205.63 150.554 1188.36 149.815C1161.66 148.672 1160.63 180.277 1162.02 197.825C1169.2 234.596 1181.53 256.165 1214.56 274.483Z");
    			attr_dev(path19, "fill", "url(#paint14_linear_637_19820)");
    			add_location(path19, file$h, 24, 0, 4568);
    			attr_dev(path20, "d", "M1280 173.878L1247.48 165.485C1242.2 157.424 1238.69 152.954 1250.01 148.911C1253.15 147.789 1253.44 138.541 1259.29 136.626C1263.98 135.094 1269.21 134.241 1276.91 136.852C1277.09 132.008 1278.24 129.536 1280 128.773C1280 133 1280 155.5 1280 173.878Z");
    			attr_dev(path20, "fill", "#FFCD59");
    			add_location(path20, file$h, 25, 0, 4876);
    			attr_dev(path21, "d", "M1262.38 158.514C1272.4 154.093 1268.06 137.185 1280 141.805C1280 162 1280 167 1280 194.959C1273.89 193.657 1268.08 191.195 1263.93 188.465C1259.32 185.428 1235.5 165.443 1242.86 158.642C1250.65 151.434 1255.44 161.576 1262.38 158.514Z");
    			attr_dev(path21, "fill", "url(#paint15_linear_637_19820)");
    			add_location(path21, file$h, 26, 0, 5156);
    			attr_dev(path22, "d", "M578.242 449.809L592.125 453.295C624.02 372.733 633.57 300.975 626.526 213.864L622.699 229.013C622.155 311.715 607.668 374.414 578.242 449.809Z");
    			attr_dev(path22, "fill", "url(#paint16_linear_637_19820)");
    			add_location(path22, file$h, 27, 0, 5443);
    			attr_dev(path23, "d", "M605.777 224.686C604.78 221.61 606.065 208.794 608.063 206.371C615.921 196.835 623.804 210.154 627.352 216.56C628.539 218.703 629.459 236.617 629.971 239.848C630.483 243.079 621.513 243.786 619.994 243.516C618.474 243.247 607.024 228.53 605.777 224.686Z");
    			attr_dev(path23, "fill", "url(#paint17_linear_637_19820)");
    			add_location(path23, file$h, 28, 0, 5638);
    			attr_dev(path24, "d", "M630.141 242.034C629.139 241.244 632.373 232.429 633.656 228.94C636.923 220.056 643.287 212.688 646.594 212.861C649.901 213.035 651.697 216.5 652.558 220.985C653.986 228.42 651.394 232.758 646.375 237.801C642.806 241.388 632.864 244.179 630.141 242.034Z");
    			attr_dev(path24, "fill", "url(#paint18_linear_637_19820)");
    			add_location(path24, file$h, 29, 0, 5943);
    			attr_dev(path25, "d", "M625.562 241.863C629.287 245.683 619.383 244.314 617.927 244.055C605.263 241.808 591.487 231.98 597.505 217.449C600.897 209.258 623.038 239.274 625.562 241.863Z");
    			attr_dev(path25, "fill", "url(#paint19_linear_637_19820)");
    			add_location(path25, file$h, 30, 0, 6248);
    			attr_dev(path26, "d", "M625.387 244.196C623.782 244.086 619.635 229.253 620.084 224.578C620.704 218.132 622.811 203.838 629.895 202.868C634.029 202.302 637.936 208.118 639.856 213.557C643.407 223.618 641.852 229.355 636.643 237.656C633.247 243.067 629.858 244.503 625.387 244.196Z");
    			attr_dev(path26, "fill", "url(#paint20_linear_637_19820)");
    			add_location(path26, file$h, 31, 0, 6460);
    			attr_dev(path27, "d", "M428.927 472.823L412.52 476.262C378.644 385.557 369.54 305.178 379.312 208.006L384.374 225.036C383.176 317.448 397.697 387.946 428.927 472.823Z");
    			attr_dev(path27, "fill", "url(#paint21_linear_637_19820)");
    			add_location(path27, file$h, 32, 0, 6769);
    			attr_dev(path28, "d", "M410.822 201.956C412.348 197.544 410.854 179.005 408.039 175.449C396.962 161.461 385.205 180.468 379.902 189.616C378.128 192.677 376.294 218.515 375.464 223.165C374.634 227.816 387.564 229.088 389.766 228.742C391.967 228.396 408.913 207.472 410.822 201.956Z");
    			attr_dev(path28, "fill", "url(#paint22_linear_637_19820)");
    			add_location(path28, file$h, 33, 0, 6964);
    			attr_dev(path29, "d", "M375.157 226.315C376.627 225.204 372.206 212.385 370.452 207.311C365.986 194.393 357.005 183.576 352.226 183.733C347.446 183.891 344.756 188.842 343.386 195.294C341.115 205.987 344.735 212.323 351.839 219.747C356.89 225.026 371.165 229.335 375.157 226.315Z");
    			attr_dev(path29, "fill", "url(#paint23_linear_637_19820)");
    			add_location(path29, file$h, 34, 0, 7273);
    			attr_dev(path30, "d", "M381.772 226.199C376.288 231.608 390.625 229.911 392.734 229.579C411.082 226.692 431.249 212.891 422.97 191.741C418.303 179.82 385.49 222.532 381.772 226.199Z");
    			attr_dev(path30, "fill", "url(#paint24_linear_637_19820)");
    			add_location(path30, file$h, 35, 0, 7581);
    			attr_dev(path31, "d", "M381.96 229.572C384.28 229.458 390.686 208.159 390.169 201.397C389.456 192.073 386.817 171.377 376.618 169.776C370.664 168.842 364.859 177.13 361.934 184.928C356.524 199.353 358.607 207.68 365.894 219.811C370.644 227.719 375.495 229.888 381.96 229.572Z");
    			attr_dev(path31, "fill", "url(#paint25_linear_637_19820)");
    			add_location(path31, file$h, 36, 0, 7791);
    			attr_dev(path32, "d", "M356.501 368.312C360.039 392.616 365.51 459.744 367.066 480.168C360.883 450.65 343.148 417.879 335.001 379.158C328.925 350.276 320.587 313.252 320.587 263.193C333.501 299.904 348.001 309.915 356.501 368.312Z");
    			attr_dev(path32, "fill", "url(#paint26_linear_637_19820)");
    			add_location(path32, file$h, 37, 0, 8095);
    			attr_dev(path33, "d", "M568.707 460.496L556.5 480.5C531 420 519.683 373.145 505.264 210.653L515.916 237.17C536.408 397.446 556.5 448.999 568.707 460.496Z");
    			attr_dev(path33, "fill", "url(#paint27_linear_637_19820)");
    			add_location(path33, file$h, 38, 0, 8354);
    			attr_dev(path34, "d", "M487.13 256.16C493.469 265.659 500.892 268.981 505.278 271.671L531.158 208.118C527.551 198.308 525.934 192.353 515.088 199.591C512.077 201.6 503.837 195.867 498.378 199.726C494.011 202.813 489.879 206.822 487.17 215.214C465.493 200.291 479.729 245.069 487.13 256.16Z");
    			attr_dev(path34, "fill", "#FFCD59");
    			add_location(path34, file$h, 39, 0, 8536);
    			attr_dev(path35, "d", "M515.442 216.582C503.209 223.523 488.77 201.63 488.331 231.61C488.18 241.899 495.306 269.177 507.337 272.992C527.627 279.428 539.626 252.954 540.517 237.323C540.857 231.342 538.872 197.666 528.19 199.665C516.87 201.783 522.6 212.52 515.442 216.582Z");
    			attr_dev(path35, "fill", "url(#paint28_linear_637_19820)");
    			add_location(path35, file$h, 40, 0, 8831);
    			attr_dev(path36, "d", "M53.9836 222.097L44.2942 219.608C48.531 189.382 74.0753 149.373 91.0402 124.411L94.7829 126.502C78.8879 154.942 58.7319 189.379 53.9836 222.097Z");
    			attr_dev(path36, "fill", "url(#paint29_linear_637_19820)");
    			add_location(path36, file$h, 41, 0, 9131);
    			attr_dev(path37, "d", "M95.3377 119.452C93.0552 120.894 86.8835 114.87 85.2903 112.483C89.9707 108.105 109.323 84.5156 116.383 85.813C118.09 86.1267 120.157 87.9692 120.574 91.6397C121.033 95.6756 116.433 106.602 112.486 111.019C107.672 116.407 97.6202 118.009 95.3377 119.452Z");
    			attr_dev(path37, "fill", "#B83535");
    			add_location(path37, file$h, 42, 0, 9327);
    			attr_dev(path38, "d", "M108.367 114.563C110.729 109.874 115.817 81.5128 105.577 82.2593C88.371 83.5138 76.3314 105.78 85.8501 120.509C92.5481 130.873 104.331 122.578 108.367 114.563Z");
    			attr_dev(path38, "fill", "url(#paint30_linear_637_19820)");
    			add_location(path38, file$h, 43, 0, 9610);
    			attr_dev(path39, "d", "M95.7537 106.466C87.9863 115.623 86.8826 129.286 101.761 130.577C121.529 132.291 135.004 112.326 130.004 95.9091C126.77 85.2894 99.8036 101.691 95.7537 106.466Z");
    			attr_dev(path39, "fill", "url(#paint31_linear_637_19820)");
    			add_location(path39, file$h, 44, 0, 9821);
    			attr_dev(path40, "d", "M777.222 398.847L763.891 401.075C754.058 362.959 765.912 301.847 774.589 263.169L780.303 263.648C774.7 305.879 766.781 357.502 777.222 398.847Z");
    			attr_dev(path40, "fill", "url(#paint32_linear_637_19820)");
    			add_location(path40, file$h, 45, 0, 10033);
    			attr_dev(path41, "d", "M774.222 268.887C772.407 271.511 762.914 267.815 760.078 265.956C763.142 259.033 773.276 224.444 781.551 222.59C783.551 222.143 786.65 223.19 788.8 226.987C791.164 231.163 791.215 245.167 788.966 251.793C786.223 259.876 776.036 266.264 774.222 268.887Z");
    			attr_dev(path41, "fill", "#B83535");
    			add_location(path41, file$h, 46, 0, 10228);
    			attr_dev(path42, "d", "M786.126 257.55C786.526 251.36 778.947 218.178 768.161 223.723C750.036 233.04 747.241 262.811 764.397 274.423C776.469 282.593 785.443 268.129 786.126 257.55Z");
    			attr_dev(path42, "fill", "url(#paint33_linear_637_19820)");
    			add_location(path42, file$h, 47, 0, 10509);
    			attr_dev(path43, "d", "M768.671 254.578C764.46 268.124 769.576 283.487 786.347 278.012C808.629 270.738 814.049 242.805 801.025 227.269C792.6 217.22 770.867 247.515 768.671 254.578Z");
    			attr_dev(path43, "fill", "url(#paint34_linear_637_19820)");
    			add_location(path43, file$h, 48, 0, 10718);
    			attr_dev(path44, "d", "M92.6127 368.727L76.9193 376.57C88.5003 306.499 113.5 224.999 170.942 127.127L165.98 156.371C131.5 216.999 110 293.499 92.6127 368.727Z");
    			attr_dev(path44, "fill", "url(#paint35_linear_637_19820)");
    			add_location(path44, file$h, 49, 0, 10927);
    			attr_dev(path45, "d", "M172.382 188.072C163.613 194.363 155.941 194.83 151.166 195.749L149.433 130.919C155.889 123.443 159.303 118.714 166.487 128.727C168.481 131.506 177.679 129.179 181.222 134.41C184.057 138.594 186.377 143.516 185.979 151.841C210.121 145.858 182.621 180.726 172.382 188.072Z");
    			attr_dev(path45, "fill", "#FFCD59");
    			add_location(path45, file$h, 50, 0, 11114);
    			attr_dev(path46, "d", "M160.517 143.638C169.026 153.85 189.087 139.293 179.493 165.957C176.201 175.108 160.817 196.863 148.905 196.233C128.815 195.17 127.015 167.758 131.432 153.636C133.122 148.232 146.091 119.106 154.874 124.43C164.18 130.073 155.538 137.662 160.517 143.638Z");
    			attr_dev(path46, "fill", "url(#paint36_linear_637_19820)");
    			add_location(path46, file$h, 51, 0, 11414);
    			attr_dev(path47, "d", "M104.946 353.432L92.9679 349.296C81.2093 289.294 97.8652 210.335 113.551 152.338L115.069 164.422C104.537 223.344 93.6483 294.258 104.946 353.432Z");
    			attr_dev(path47, "fill", "url(#paint37_linear_637_19820)");
    			add_location(path47, file$h, 52, 0, 11719);
    			attr_dev(path48, "d", "M126.664 149.111L108.969 145.79C109.921 139.342 117.354 131.914 120.961 132.975C122.437 133.41 126.602 139.419 126.664 149.111Z");
    			attr_dev(path48, "fill", "url(#paint38_linear_637_19820)");
    			add_location(path48, file$h, 53, 0, 11916);
    			attr_dev(path49, "d", "M113.29 151.403C115.068 147.231 121.757 144.175 127.178 140.097C128.886 145.402 126.494 154.05 124.219 158.037C121.377 163.02 114.224 164.839 112.03 163.509C109.836 162.18 111.554 155.476 113.29 151.403Z");
    			attr_dev(path49, "fill", "#57661F");
    			add_location(path49, file$h, 54, 0, 12095);
    			attr_dev(path50, "d", "M118.891 154.233C117.794 148.956 112.924 139.76 110.876 136.557C107.249 140.522 105.322 148.787 105.591 153.369C105.927 159.096 111.305 164.412 113.862 164.195C116.418 163.977 119.791 158.568 118.891 154.233Z");
    			attr_dev(path50, "fill", "#57661F");
    			add_location(path50, file$h, 55, 0, 12327);
    			attr_dev(path51, "d", "M52.4696 109.252C54.893 104.563 56.2275 83.5812 53.6547 79.1475C43.5314 61.7024 27.2972 81.0593 19.8815 90.4331C17.4005 93.5693 11.1592 122.177 9.47671 127.244C7.79422 132.312 22.0527 135.833 24.5714 135.802C27.09 135.771 49.4403 115.112 52.4696 109.252Z");
    			attr_dev(path51, "fill", "url(#paint39_linear_637_19820)");
    			add_location(path51, file$h, 56, 0, 12564);
    			attr_dev(path52, "d", "M8.62233 130.718C10.4464 129.713 7.07488 114.731 6.44029 108.696C4.99997 94.9997 -1.76785e-05 98.9998 -8.1983e-05 130.238C3.57991 131.393 6.79907 131.723 8.62233 130.718Z");
    			attr_dev(path52, "fill", "url(#paint40_linear_637_19820)");
    			add_location(path52, file$h, 57, 0, 12870);
    			attr_dev(path53, "d", "M16.0419 131.661C9.02899 136.823 25.3427 137.249 27.7565 137.22C48.75 136.965 73.5479 124.796 67.7156 99.7935C64.4283 85.7013 20.7953 128.162 16.0419 131.661Z");
    			attr_dev(path53, "fill", "url(#paint41_linear_637_19820)");
    			add_location(path53, file$h, 58, 0, 13092);
    			attr_dev(path54, "d", "M15.7046 135.464C18.318 135.714 28.938 112.926 29.4562 105.277C30.1706 94.7309 30.5741 71.1503 19.4237 67.7059C12.9149 65.6954 4.53661 74.7502 1.08314e-06 82.9998C1.03321e-06 100.5 1.08941e-06 109 1.46273e-06 123.5C4.03183 133.117 8.42156 134.77 15.7046 135.464Z");
    			attr_dev(path54, "fill", "url(#paint42_linear_637_19820)");
    			add_location(path54, file$h, 59, 0, 13302);
    			attr_dev(path55, "d", "M1055.55 510.548L1078.95 495.12C1081.54 377.665 1063.13 314.633 1007.47 181.061L1013.38 219.393C1061.33 355.754 1057 395.504 1055.55 510.548Z");
    			attr_dev(path55, "fill", "url(#paint43_linear_637_19820)");
    			add_location(path55, file$h, 60, 0, 13616);
    			attr_dev(path56, "d", "M993.218 252.329C1003.8 262.166 1013.91 264.178 1020.1 266.253L1033.51 181.7C1026.21 170.733 1022.49 163.92 1011.22 175.717C1008.1 178.991 996.268 174.265 990.662 180.466C986.177 185.426 982.249 191.446 981.353 202.416C950.286 190.177 980.866 240.843 993.218 252.329Z");
    			attr_dev(path56, "fill", "#FFCD59");
    			add_location(path56, file$h, 61, 0, 13809);
    			attr_dev(path57, "d", "M1016.6 196.326C1003.54 208.142 979.371 185.422 987.554 222.08C990.363 234.661 1007.08 265.949 1023.03 267.298C1049.91 269.574 1057 234.018 1053.55 214.724C1052.23 207.342 1039.98 166.845 1027.4 172.212C1014.06 177.899 1024.25 189.412 1016.6 196.326Z");
    			attr_dev(path57, "fill", "url(#paint44_linear_637_19820)");
    			add_location(path57, file$h, 62, 0, 14105);
    			attr_dev(path58, "d", "M1136.66 432.432L1148.64 428.296C1160.4 368.294 1143.75 289.336 1128.06 231.338L1126.54 243.422C1137.07 302.344 1147.96 373.258 1136.66 432.432Z");
    			attr_dev(path58, "fill", "url(#paint45_linear_637_19820)");
    			add_location(path58, file$h, 63, 0, 14407);
    			attr_dev(path59, "d", "M1114.95 228.112L1132.64 224.79C1131.69 218.343 1124.26 210.914 1120.65 211.976C1119.17 212.41 1115.01 218.419 1114.95 228.112Z");
    			attr_dev(path59, "fill", "url(#paint46_linear_637_19820)");
    			add_location(path59, file$h, 64, 0, 14603);
    			attr_dev(path60, "d", "M1128.32 230.404C1126.54 226.231 1119.85 223.175 1114.43 219.097C1112.72 224.402 1115.12 233.05 1117.39 237.037C1120.23 242.02 1127.39 243.839 1129.58 242.509C1131.77 241.18 1130.06 234.477 1128.32 230.404Z");
    			attr_dev(path60, "fill", "#57661F");
    			add_location(path60, file$h, 65, 0, 14782);
    			attr_dev(path61, "d", "M1122.72 233.233C1123.82 227.956 1128.69 218.76 1130.73 215.558C1134.36 219.522 1136.29 227.788 1136.02 232.369C1135.68 238.097 1130.31 243.413 1127.75 243.195C1125.19 242.978 1121.82 237.568 1122.72 233.233Z");
    			attr_dev(path61, "fill", "#57661F");
    			add_location(path61, file$h, 66, 0, 15017);
    			attr_dev(path62, "d", "M1134.39 300.718C1138.69 308.598 1140.8 335.334 1141.32 347.717C1137.42 330.075 1129.94 324.429 1119.5 307.533C1111.03 293.825 1105.44 276.43 1109.6 261.85C1115.84 275.095 1130.39 293.366 1134.39 300.718Z");
    			attr_dev(path62, "fill", "url(#paint47_linear_637_19820)");
    			add_location(path62, file$h, 67, 0, 15254);
    			attr_dev(path63, "d", "M1233.24 265.074C1227.71 257.434 1219.76 220.709 1223.12 212.188C1234.9 182.382 1262.95 202.689 1280 217.815C1279.91 246.5 1279.91 265.074 1279.91 300C1265.05 291.222 1238.43 272.238 1233.24 265.074Z");
    			attr_dev(path63, "fill", "url(#paint48_linear_637_19820)");
    			add_location(path63, file$h, 68, 0, 15510);
    			attr_dev(path64, "d", "M1280 308.422C1243.62 311.856 1200.27 296.386 1203.78 252.422C1205.24 234.024 1250.7 261.048 1280 279.822C1280 291 1280 296 1280 308.422Z");
    			attr_dev(path64, "fill", "url(#paint49_linear_637_19820)");
    			add_location(path64, file$h, 69, 0, 15761);
    			attr_dev(path65, "d", "M1280 268.252C1276.45 261.793 1273.72 255.827 1272.85 251.916C1268.78 233.469 1261.21 192.059 1280 183C1280 879.221 1280 -506.161 1280 268.252Z");
    			attr_dev(path65, "fill", "url(#paint50_linear_637_19820)");
    			add_location(path65, file$h, 70, 0, 15950);
    			attr_dev(path66, "d", "M852.5 564L822.529 567.535C765 493 731.617 429.18 689.214 235.667L709.709 265.289C732 384.5 787 492 852.5 564Z");
    			attr_dev(path66, "fill", "url(#paint51_linear_637_19820)");
    			add_location(path66, file$h, 71, 0, 16145);
    			attr_dev(path67, "d", "M743.141 279.48C740.591 292.639 734.064 299.605 730.537 304.508L673.675 247.461C673.126 235.205 672.173 228.025 687.2 230.936C691.37 231.745 697.688 221.798 705.349 223.498C711.477 224.857 717.77 227.321 724.511 235.176C741.202 209.182 746.118 264.115 743.141 279.48Z");
    			attr_dev(path67, "fill", "#FFCD59");
    			add_location(path67, file$h, 72, 0, 16307);
    			attr_dev(path68, "d", "M694.529 249.489C710.922 251.45 716.614 221.197 730.697 253.451C735.531 264.52 740.199 297.281 728.908 306.873C709.866 323.049 684.86 299.839 676.801 283.323C673.718 277.003 660.581 239.648 673.051 236.963C686.266 234.118 684.937 248.342 694.529 249.489Z");
    			attr_dev(path68, "fill", "url(#paint52_linear_637_19820)");
    			add_location(path68, file$h, 73, 0, 16603);
    			attr_dev(path69, "d", "M728.635 431.595C743.003 443.428 772.939 493.859 786.111 517.595C762.572 486.389 745.626 481.55 712.945 457.208C686.43 437.459 660.577 408.136 652.283 376.241C674.959 396.933 715.231 420.557 728.635 431.595Z");
    			attr_dev(path69, "fill", "url(#paint53_linear_637_19820)");
    			add_location(path69, file$h, 74, 0, 16909);
    			attr_dev(path70, "d", "M184.461 654.336L150.588 656.474C132.54 554.511 172.971 398.628 201.511 300.291L215.78 303.11C194.341 411.543 165.448 543.798 184.461 654.336Z");
    			attr_dev(path70, "fill", "url(#paint54_linear_637_19820)");
    			add_location(path70, file$h, 75, 0, 17168);
    			attr_dev(path71, "d", "M209.822 300.456C203.401 308.194 174.607 293.97 166.215 287.35C177.747 266.456 219.111 160.628 245.607 157.091C252.012 156.236 261.455 160.38 267.159 172.898C273.432 186.663 269.728 230.653 260.839 250.842C249.996 275.468 216.244 292.718 209.822 300.456Z");
    			attr_dev(path71, "fill", "#B83535");
    			add_location(path71, file$h, 76, 0, 17362);
    			attr_dev(path72, "d", "M250.333 268.138C253.296 248.81 238.648 142.515 203.246 156.953C143.758 181.213 126.768 273.934 177.442 315.13C213.099 344.118 245.269 301.169 250.333 268.138Z");
    			attr_dev(path72, "fill", "url(#paint55_linear_637_19820)");
    			add_location(path72, file$h, 77, 0, 17645);
    			attr_dev(path73, "d", "M196.338 253.99C179.379 295.367 191.207 345.023 245.382 332.456C317.361 315.759 342.085 229.534 305.472 177.156C281.787 143.273 205.181 232.417 196.338 253.99Z");
    			attr_dev(path73, "fill", "url(#paint56_linear_637_19820)");
    			add_location(path73, file$h, 78, 0, 17856);
    			attr_dev(path74, "d", "M133.151 671.806C132.204 708.804 102.11 804.049 87.1817 847.046C101.629 778.105 92.8012 740.888 92.1494 658.543C91.6206 591.735 102.087 519.504 129.976 480.492C126.28 540.307 134.034 637.289 133.151 671.806Z");
    			attr_dev(path74, "fill", "url(#paint57_linear_637_19820)");
    			add_location(path74, file$h, 79, 0, 18067);
    			attr_dev(path75, "d", "M547.961 484.511L564.548 489.058C583.998 440.322 579.979 358.812 575.939 307.08L568.569 307.01C568.047 363.021 568.771 431.619 547.961 484.511Z");
    			attr_dev(path75, "fill", "url(#paint58_linear_637_19820)");
    			add_location(path75, file$h, 80, 0, 18326);
    			attr_dev(path76, "d", "M573.753 296.011C575.93 300.111 590.28 296.381 594.695 294.176C591.441 283.649 582.665 231.93 571.019 227.847C568.203 226.86 563.546 227.848 559.794 232.972C555.668 238.606 553.217 258.839 555.342 268.8C557.935 280.949 571.576 291.911 573.753 296.011Z");
    			attr_dev(path76, "fill", "#B83535");
    			add_location(path76, file$h, 81, 0, 18521);
    			attr_dev(path77, "d", "M558.47 277.604C558.943 268.588 575.531 221.911 590.181 231.757C614.798 248.302 613.785 291.809 587.015 305.681C568.178 315.442 557.662 293.01 558.47 277.604Z");
    			attr_dev(path77, "fill", "url(#paint59_linear_637_19820)");
    			add_location(path77, file$h, 82, 0, 18801);
    			attr_dev(path78, "d", "M584.205 276.27C587.992 296.565 577.989 317.903 554.678 307.143C523.705 292.846 520.613 251.549 542.075 231.304C555.959 218.208 582.231 265.689 584.205 276.27Z");
    			attr_dev(path78, "fill", "url(#paint60_linear_637_19820)");
    			add_location(path78, file$h, 83, 0, 19011);
    			attr_dev(path79, "d", "M584.481 382.348C575.479 397.801 563.453 447.634 558.565 470.62C570.227 437.215 583.224 425.227 604.372 391.837C621.529 364.748 635.63 331.447 634.283 305.378C620.602 331.147 592.879 367.931 584.481 382.348Z");
    			attr_dev(path79, "fill", "url(#paint61_linear_637_19820)");
    			add_location(path79, file$h, 84, 0, 19222);
    			attr_dev(path80, "d", "M417.279 460.484L398.337 461.205C388.011 392.969 393.45 335.569 414.517 269.224L422.445 270.997C406.993 340.028 407.205 391.652 417.279 460.484Z");
    			attr_dev(path80, "fill", "url(#paint62_linear_637_19820)");
    			add_location(path80, file$h, 85, 0, 19481);
    			attr_dev(path81, "d", "M463.388 231.927C464.965 235.115 453.821 261.235 447.304 268.369C433.146 283.864 412.712 287.676 400.006 268.807C407.649 262.387 453.59 212.132 463.388 231.927Z");
    			attr_dev(path81, "fill", "url(#paint63_linear_637_19820)");
    			add_location(path81, file$h, 86, 0, 19677);
    			attr_dev(path82, "d", "M421.812 283.48C418.318 286.199 403.096 273.456 400.317 269.328C392.718 258.044 393.08 244.763 397.882 232.68C403.632 224.69 415.2 203.998 426.079 201.818C442.898 198.449 446.682 218.391 447.539 229.658C446.624 253.69 440.942 268.59 421.812 283.48Z");
    			attr_dev(path82, "fill", "url(#paint64_linear_637_19820)");
    			add_location(path82, file$h, 87, 0, 19889);
    			attr_dev(path83, "d", "M0.000161372 246C5.50029 235.5 2.50029 240.5 9.29782 227.726L23.6227 233.374C14.0649 257.603 6.20972 279.487 0.000168769 297.588C0.000174531 270.5 7.66142e-05 255.5 0.000161372 246Z");
    			attr_dev(path83, "fill", "url(#paint65_linear_637_19820)");
    			add_location(path83, file$h, 88, 0, 20189);
    			attr_dev(path84, "d", "M111.765 172.234C113.783 178.667 85.2446 224.308 70.9451 235.752C47.8626 254.225 20.1865 259.6 -0.000119585 245.113C-0.000196046 218 -0.000225284 226.5 -0.000115753 210.367C34.2768 186.131 101.666 140.05 111.765 172.234Z");
    			attr_dev(path84, "fill", "url(#paint66_linear_637_19820)");
    			add_location(path84, file$h, 89, 0, 20422);
    			attr_dev(path85, "d", "M18.7711 256.563C15.186 258.549 7.44639 252.808 1.187e-05 245.419C1.50309e-05 206 1.56826e-05 201 1.47253e-05 145.5C13.1144 132.227 29.73 105.784 50.7421 104.897C83.226 103.525 84.4555 141.981 82.7536 163.331C73.9829 208.065 58.9675 234.299 18.7711 256.563Z");
    			attr_dev(path85, "fill", "url(#paint67_linear_637_19820)");
    			add_location(path85, file$h, 90, 0, 20694);
    			attr_dev(path86, "d", "M308.964 802.308L269.49 799.741C245.843 639.587 259.085 504.983 309.063 349.529L322.678 357.854C285.851 519.655 285.912 640.758 308.964 802.308Z");
    			attr_dev(path86, "fill", "url(#paint68_linear_637_19820)");
    			add_location(path86, file$h, 91, 0, 21003);
    			attr_dev(path87, "d", "M319.294 596.225C309.989 633.206 314.447 716.78 307.395 747.649C323.777 705.738 339.045 699.25 356.626 646.438C377.348 584.189 375.147 482.307 373.875 442.835C350.968 493.822 331.347 548.33 319.294 596.225Z");
    			attr_dev(path87, "fill", "url(#paint69_linear_637_19820)");
    			add_location(path87, file$h, 92, 0, 21199);
    			attr_dev(path88, "d", "M280.395 323.892C280.395 342.212 287.343 353.256 290.8 360.751L381.931 298.99C385.855 282.687 389 273.3 368.08 273.3C362.274 273.3 356.382 258.31 345.661 258.599C337.085 258.83 328 260.5 316.913 269.287C301.275 230.068 280.395 302.5 280.395 323.892Z");
    			attr_dev(path88, "fill", "#FFCD59");
    			add_location(path88, file$h, 93, 0, 21457);
    			attr_dev(path89, "d", "M353.421 296.288C330.916 294.657 331.144 252.583 303.86 292.2C294.496 305.796 279.714 348.542 292.371 364.348C313.716 391.005 353.304 366.363 368.412 346.297C374.193 338.618 401.533 291.91 385.498 285.065C368.506 277.812 366.591 297.243 353.421 296.288Z");
    			attr_dev(path89, "fill", "url(#paint70_linear_637_19820)");
    			add_location(path89, file$h, 94, 0, 21735);
    			attr_dev(path90, "d", "M49.7554 813.011L1.80113 804.019C14.797 626.877 31.1824 485.922 121.892 331.429L140.779 340.399C62.6315 504.835 63.7234 634.516 49.7554 813.011Z");
    			attr_dev(path90, "fill", "url(#paint71_linear_637_19820)");
    			add_location(path90, file$h, 95, 0, 22040);
    			attr_dev(path91, "d", "M230.907 357.76C242.043 345.647 263.273 283.633 259.172 268.186C243.038 207.409 178.326 252.31 148.33 274.419C138.294 281.817 96.049 362.74 86.8303 376.602C77.6116 390.464 117.609 412.752 125.21 414.727C132.811 416.702 216.987 372.902 230.907 357.76Z");
    			attr_dev(path91, "fill", "url(#paint72_linear_637_19820)");
    			add_location(path91, file$h, 96, 0, 22236);
    			attr_dev(path92, "d", "M81.4105 386.35C87.7219 384.823 91.4538 337.184 92.917 318.323C96.6429 270.296 82.8218 222.715 67.155 216.506C51.4882 210.297 35.8343 222.517 22.3375 241.443C-0.0302466 272.808 2.76051 298.371 15.2841 332.348C24.1891 356.507 64.2628 390.499 81.4105 386.35Z");
    			attr_dev(path92, "fill", "url(#paint73_linear_637_19820)");
    			add_location(path92, file$h, 97, 0, 22538);
    			attr_dev(path93, "d", "M102.953 395.272C77.6248 405.044 126.343 419.712 133.627 421.604C196.98 438.064 281.551 421.809 284.524 341.822C286.199 296.739 120.122 388.649 102.953 395.272Z");
    			attr_dev(path93, "fill", "url(#paint74_linear_637_19820)");
    			add_location(path93, file$h, 98, 0, 22846);
    			attr_dev(path94, "d", "M98.8181 406.437C106.474 409.331 157.115 349.503 164.949 326.922C175.751 295.789 196.314 225.195 165.602 205.686C147.674 194.298 117.266 212.924 96.8523 234.014C59.0901 273.027 54.1187 302.864 60.6167 352.311C64.8526 384.544 77.4821 398.372 98.8181 406.437Z");
    			attr_dev(path94, "fill", "url(#paint75_linear_637_19820)");
    			add_location(path94, file$h, 99, 0, 23058);
    			attr_dev(path95, "d", "M63.5759 573.554C36.6275 612.306 35.6519 662.421 31.4352 709.36C76.4833 643.944 67.7968 659.098 112.214 607.617C158.489 553.982 194.453 523.579 201.607 457.309C153.857 517.747 93.1402 531.041 63.5759 573.554Z");
    			attr_dev(path95, "fill", "url(#paint76_linear_637_19820)");
    			add_location(path95, file$h, 100, 0, 23367);
    			attr_dev(path96, "d", "M1001.23 814.18L1037.65 809.639C1058.5 624.027 1037.84 469.352 973.99 292.106L972.505 326.348C1018.08 498.705 1019.87 640.713 1001.23 814.18Z");
    			attr_dev(path96, "fill", "url(#paint77_linear_637_19820)");
    			add_location(path96, file$h, 101, 0, 23627);
    			attr_dev(path97, "d", "M912.192 295.563C907.266 288.023 901.368 252.632 904.968 244.659C919.135 213.289 950.048 243.342 964.261 257.973C969.016 262.868 984.565 310.356 988.298 318.668C992.032 326.981 968.434 335.426 964.152 335.81C959.871 336.194 918.349 304.989 912.192 295.563Z");
    			attr_dev(path97, "fill", "url(#paint78_linear_637_19820)");
    			add_location(path97, file$h, 102, 0, 23820);
    			attr_dev(path98, "d", "M990.35 324.419C987.079 323.028 989.34 296.969 990.242 286.653C992.541 260.385 1004.27 235.933 1013.29 233.987C1022.31 232.04 1029.66 240.043 1035.25 251.474C1044.52 270.418 1040.72 283.971 1030.9 301.194C1023.93 313.44 999.237 328.198 990.35 324.419Z");
    			attr_dev(path98, "fill", "url(#paint79_linear_637_19820)");
    			add_location(path98, file$h, 103, 0, 24128);
    			attr_dev(path99, "d", "M977.917 327.303C990.717 334.852 963.093 338.4 958.99 338.768C923.304 341.97 879.096 325.603 884.67 282.145C887.812 257.651 969.241 322.185 977.917 327.303Z");
    			attr_dev(path99, "fill", "url(#paint80_linear_637_19820)");
    			add_location(path99, file$h, 104, 0, 24431);
    			attr_dev(path100, "d", "M979.147 333.703C974.754 334.578 952.778 297.728 950.575 284.831C947.536 267.051 942.769 227.086 961.103 219.308C971.806 214.768 986.554 227.554 995.684 240.775C1012.57 265.23 1012.58 281.788 1004.63 307.905C999.453 324.93 991.392 331.263 979.147 333.703Z");
    			attr_dev(path100, "fill", "url(#paint81_linear_637_19820)");
    			add_location(path100, file$h, 105, 0, 24639);
    			attr_dev(path101, "d", "M1024.74 454.156C1019.22 501.513 1040.56 572.069 1043.39 611.502C1046.66 551.431 1042.75 522.953 1061.39 457.157C1076.52 403.775 1083.79 342.391 1069.42 301.843C1059.31 351.023 1030.57 404.183 1024.74 454.156Z");
    			attr_dev(path101, "fill", "url(#paint82_linear_637_19820)");
    			add_location(path101, file$h, 106, 0, 24946);
    			attr_dev(path102, "d", "M1191.17 920.062L1236.13 921.637C1256.38 785.692 1197.22 580.444 1155.84 450.977L1137.03 455.249C1168.83 596.043 1211.97 775.561 1191.17 920.062Z");
    			attr_dev(path102, "fill", "url(#paint83_linear_637_19820)");
    			add_location(path102, file$h, 107, 0, 25207);
    			attr_dev(path103, "d", "M1213.54 586.447C1209.8 635.387 1243.5 763.759 1257.39 822.6C1247.64 729.604 1257.45 683.309 1269.43 574.777C1279.15 486.723 1275.1 389.954 1243.58 334.529C1240.37 413.957 1217.04 540.788 1213.54 586.447Z");
    			attr_dev(path103, "fill", "url(#paint84_linear_637_19820)");
    			add_location(path103, file$h, 108, 0, 25404);
    			attr_dev(path104, "d", "M1189.74 699.231C1207.84 742.823 1198.15 792.002 1192.3 838.764C1162.17 765.272 1167.44 781.926 1134.98 722.184C1101.15 659.943 1047.99 522.279 1055.08 456.001C1088.9 525.204 1169.88 651.407 1189.74 699.231Z");
    			attr_dev(path104, "fill", "url(#paint85_linear_637_19820)");
    			add_location(path104, file$h, 109, 0, 25660);
    			attr_dev(path105, "d", "M1161.05 433.647C1170.74 442.855 1206.51 419.585 1216.55 409.539C1198.07 383.768 1126.95 250.58 1091.43 250.053C1082.85 249.925 1071.03 256.869 1065.46 274.279C1059.33 293.423 1071.09 350.895 1085.98 376.147C1104.14 406.95 1151.37 424.439 1161.05 433.647Z");
    			attr_dev(path105, "fill", "#B83535");
    			add_location(path105, file$h, 110, 0, 25919);
    			attr_dev(path106, "d", "M1102.55 397.33C1095.62 372.287 1098.34 229.731 1147.31 243.251C1229.6 265.971 1266.51 385.67 1206.08 447.951C1163.55 491.775 1114.39 440.126 1102.55 397.33Z");
    			attr_dev(path106, "fill", "url(#paint86_linear_637_19820)");
    			add_location(path106, file$h, 111, 0, 26203);
    			attr_dev(path107, "d", "M1171.59 370.223C1200.43 422.174 1192.58 489.549 1119.13 481.43C1021.54 470.644 975.437 360.723 1015.57 285.883C1041.53 237.471 1156.55 343.136 1171.59 370.223Z");
    			attr_dev(path107, "fill", "url(#paint87_linear_637_19820)");
    			add_location(path107, file$h, 112, 0, 26412);
    			attr_dev(path108, "d", "M612.218 532.499L585.163 533.529C577 482.499 582.128 451.16 612.218 356.401L623.541 358.934C601.472 457.528 604.414 480.618 612.218 532.499Z");
    			attr_dev(path108, "fill", "url(#paint88_linear_637_19820)");
    			add_location(path108, file$h, 113, 0, 26624);
    			attr_dev(path109, "d", "M682.018 303.131C684.272 307.683 668.355 344.991 659.046 355.179C638.824 377.312 609.64 382.756 591.493 355.806C602.408 346.636 668.025 274.858 682.018 303.131Z");
    			attr_dev(path109, "fill", "url(#paint89_linear_637_19820)");
    			add_location(path109, file$h, 114, 0, 26816);
    			attr_dev(path110, "d", "M622.636 376.761C617.646 380.645 595.906 362.444 591.936 356.55C581.083 340.432 581.6 321.463 588.458 304.205C596.671 292.793 613.194 263.24 628.732 260.126C652.753 255.314 658.158 283.797 659.383 299.889C658.076 334.214 649.96 355.495 622.636 376.761Z");
    			attr_dev(path110, "fill", "url(#paint90_linear_637_19820)");
    			add_location(path110, file$h, 115, 0, 27028);
    			attr_dev(path111, "d", "M535.73 526.635L513.851 537.975C469.496 471.193 467.904 410.603 462.689 298.695L474.493 324.574C492.455 426.998 496.984 468.66 535.73 526.635Z");
    			attr_dev(path111, "fill", "url(#paint91_linear_637_19820)");
    			add_location(path111, file$h, 116, 0, 27332);
    			attr_dev(path112, "d", "M514.029 324.167C515.532 316.752 509.137 287.575 503.847 282.612C483.03 263.086 468.229 296.326 461.677 312.234C459.485 317.556 462.103 359.201 461.771 366.821C461.439 374.441 482.495 373.234 485.958 372.131C489.421 371.028 512.15 333.436 514.029 324.167Z");
    			attr_dev(path112, "fill", "url(#paint92_linear_637_19820)");
    			add_location(path112, file$h, 117, 0, 27526);
    			attr_dev(path113, "d", "M461.956 371.919C464.078 369.779 454.212 350.453 450.3 342.805C440.34 323.331 423.574 308.336 415.927 309.783C408.279 311.23 405.022 319.796 404.21 330.423C402.864 348.036 410.046 357.229 423.063 367.285C432.319 374.434 456.19 377.732 461.956 371.919Z");
    			attr_dev(path113, "fill", "url(#paint93_linear_637_19820)");
    			add_location(path113, file$h, 118, 0, 27833);
    			attr_dev(path114, "d", "M472.563 370.077C464.913 380.072 487.59 373.779 490.909 372.722C519.776 363.529 549.215 336.484 531.353 304.844C521.285 287.011 477.748 363.303 472.563 370.077Z");
    			attr_dev(path114, "fill", "url(#paint94_linear_637_19820)");
    			add_location(path114, file$h, 119, 0, 28136);
    			attr_dev(path115, "d", "M473.591 375.407C477.295 374.646 483.003 339.093 480.715 328.443C477.561 313.76 468.861 281.431 452.123 281.432C442.353 281.433 434.81 296.096 431.788 309.258C426.2 333.606 431.342 346.356 445.667 363.869C455.005 375.286 463.269 377.529 473.591 375.407Z");
    			attr_dev(path115, "fill", "url(#paint95_linear_637_19820)");
    			add_location(path115, file$h, 120, 0, 28348);
    			attr_dev(path116, "d", "M459.411 414.765C480.967 439.298 496.95 503.157 510.847 530.444C485.54 495.876 476.523 474.444 440.59 450.486C411.436 431.049 383.434 399.35 375.396 360.711C400.169 382.148 436.663 388.876 459.411 414.765Z");
    			attr_dev(path116, "fill", "url(#paint96_linear_637_19820)");
    			add_location(path116, file$h, 121, 0, 28653);
    			attr_dev(path117, "d", "M781.498 572.09L808 566.5C808 501.5 803.798 429.1 754.765 328.62L756.084 348.917C794.02 447.685 780.968 514.398 781.498 572.09Z");
    			attr_dev(path117, "fill", "url(#paint97_linear_637_19820)");
    			add_location(path117, file$h, 122, 0, 28910);
    			attr_dev(path118, "d", "M718.527 334.62C715.137 330.487 709.389 309.985 711.002 305.05C717.35 285.634 737.514 301.384 746.837 309.105C749.957 311.688 762.174 338.709 764.91 343.374C767.645 348.039 754.264 354.534 751.762 355.035C749.261 355.536 722.764 339.786 718.527 334.62Z");
    			attr_dev(path118, "fill", "url(#paint98_linear_637_19820)");
    			add_location(path118, file$h, 123, 0, 29089);
    			attr_dev(path119, "d", "M766.488 346.635C764.47 346.024 764.133 330.504 764.004 324.36C763.677 308.716 769.032 293.537 774.227 291.811C779.423 290.084 784.275 294.334 788.306 300.72C794.985 311.303 793.611 319.543 788.926 330.333C785.595 338.005 771.974 348.295 766.488 346.635Z");
    			attr_dev(path119, "fill", "url(#paint99_linear_637_19820)");
    			add_location(path119, file$h, 124, 0, 29393);
    			attr_dev(path120, "d", "M759.338 349.134C767.373 352.767 751.304 356.631 748.906 357.111C728.057 361.288 700.926 354.464 701.429 328.468C701.713 313.815 753.891 346.67 759.338 349.134Z");
    			attr_dev(path120, "fill", "url(#paint100_linear_637_19820)");
    			add_location(path120, file$h, 125, 0, 29699);
    			attr_dev(path121, "d", "M760.474 352.83C757.938 353.629 742.611 333.296 740.484 325.828C737.552 315.533 732.178 292.26 742.496 286.496C748.52 283.131 758.04 289.73 764.275 296.944C775.806 310.29 776.872 320.058 773.857 335.976C771.892 346.353 767.542 350.606 760.474 352.83Z");
    			attr_dev(path121, "fill", "url(#paint101_linear_637_19820)");
    			add_location(path121, file$h, 126, 0, 29912);
    			attr_dev(path122, "d", "M791.258 395.5C787.674 423.652 799.893 465.297 801.319 488.664C803.648 452.991 801.509 436.134 813.001 396.909C822.324 365.085 811.452 309.808 803.181 285.897C796.862 315.178 795.04 365.792 791.258 395.5Z");
    			attr_dev(path122, "fill", "url(#paint102_linear_637_19820)");
    			add_location(path122, file$h, 127, 0, 30215);
    			attr_dev(path123, "d", "M113.323 922.89L86.6345 906.991C88.3252 757.108 167.669 575.891 234.234 444.503L231.854 474.263C177.198 610.441 115.707 775.225 113.323 922.89Z");
    			attr_dev(path123, "fill", "url(#paint103_linear_637_19820)");
    			add_location(path123, file$h, 128, 0, 30472);
    			attr_dev(path124, "d", "M265.318 447.295L224.5 430.5C230 415.5 251.546 401.376 259.675 405.722C263 407.5 270 424 265.318 447.295Z");
    			attr_dev(path124, "fill", "url(#paint104_linear_637_19820)");
    			add_location(path124, file$h, 129, 0, 30668);
    			attr_dev(path125, "d", "M232.074 446.129C238.422 437.001 256 433 271.045 425.915C272.5 439.5 262.446 459.065 255 467.5C245.692 478.044 227.618 478.843 223.014 474.558C218.41 470.273 225.877 455.041 232.074 446.129Z");
    			attr_dev(path125, "fill", "#57661F");
    			add_location(path125, file$h, 130, 0, 30826);
    			attr_dev(path126, "d", "M244.106 455.714C244.106 442.5 237 418 233.682 409.292C223 417 214.254 435.878 212.614 447.009C210.565 460.924 220.824 476.365 227.069 477.117C233.313 477.87 244.106 466.568 244.106 455.714Z");
    			attr_dev(path126, "fill", "#57661F");
    			add_location(path126, file$h, 131, 0, 31045);
    			attr_dev(path127, "d", "M612.683 586.927L596.152 586.813C556.582 517.559 544.222 413.018 539.408 334.789L546.327 349.091C557.896 426.312 574.028 518.504 612.683 586.927Z");
    			attr_dev(path127, "fill", "url(#paint105_linear_637_19820)");
    			add_location(path127, file$h, 132, 0, 31264);
    			attr_dev(path128, "d", "M555.269 335.329L532.012 338.607C530.499 330.241 536.587 317.958 541.488 317.765C543.493 317.686 551.148 323.375 555.269 335.329Z");
    			attr_dev(path128, "fill", "url(#paint106_linear_637_19820)");
    			add_location(path128, file$h, 133, 0, 31462);
    			attr_dev(path129, "d", "M539.696 343.742C540.153 337.843 547.144 331.275 552.143 323.973C556.468 329.817 557.12 341.504 555.972 347.381C554.538 354.726 546.457 359.958 543.19 359.231C539.923 358.503 539.25 349.501 539.696 343.742Z");
    			attr_dev(path129, "fill", "#57661F");
    			add_location(path129, file$h, 134, 0, 31644);
    			attr_dev(path130, "d", "M547.799 344.903C544.242 338.837 534.385 329.504 530.518 326.4C527.69 332.814 528.757 343.834 531 349.384C533.805 356.323 542.671 360.649 545.74 359.314C548.809 357.978 550.721 349.885 547.799 344.903Z");
    			attr_dev(path130, "fill", "#57661F");
    			add_location(path130, file$h, 135, 0, 31879);
    			attr_dev(path131, "d", "M891.718 581.453L872.353 587.932C846.099 531.436 845.511 434.549 846.905 372.96L855.638 372.394C859.933 438.755 863.577 520.12 891.718 581.453Z");
    			attr_dev(path131, "fill", "url(#paint107_linear_637_19820)");
    			add_location(path131, file$h, 136, 0, 32109);
    			attr_dev(path132, "d", "M845.771 359.696C843.459 364.699 826.203 361.219 820.825 358.895C823.992 346.202 831 284.319 844.537 278.714C847.81 277.359 853.395 278.225 858.18 284.052C863.441 290.46 867.674 314.284 865.808 326.231C863.532 340.802 848.082 354.693 845.771 359.696Z");
    			attr_dev(path132, "fill", "#B83535");
    			add_location(path132, file$h, 137, 0, 32305);
    			attr_dev(path133, "d", "M862.678 336.872C861.526 326.216 838.798 271.973 822.078 284.606C793.983 305.835 798.04 357.342 830.684 372.029C853.654 382.363 864.647 355.082 862.678 336.872Z");
    			attr_dev(path133, "fill", "url(#paint108_linear_637_19820)");
    			add_location(path133, file$h, 138, 0, 32584);
    			attr_dev(path134, "d", "M832.084 336.981C828.927 361.287 842.186 385.925 869.113 371.639C904.891 352.659 905.845 303.502 879.074 280.912C861.756 266.299 833.73 324.308 832.084 336.981Z");
    			attr_dev(path134, "fill", "url(#paint109_linear_637_19820)");
    			add_location(path134, file$h, 139, 0, 32797);
    			attr_dev(path135, "d", "M1039.97 813.994L1071.71 795.089C1069.7 616.87 1035.35 561.392 956.202 405.163L959.032 440.55C1024.02 602.474 1037.14 638.411 1039.97 813.994Z");
    			attr_dev(path135, "fill", "url(#paint110_linear_637_19820)");
    			add_location(path135, file$h, 140, 0, 33010);
    			attr_dev(path136, "d", "M1000.17 557.781C1015.1 579.258 1029.68 656.063 1035.11 691.78C1018.23 641.893 994.778 627.898 959.175 582.244C930.29 545.204 908.578 496.569 916.022 453.003C938.288 489.41 986.243 537.743 1000.17 557.781Z");
    			attr_dev(path136, "fill", "url(#paint111_linear_637_19820)");
    			add_location(path136, file$h, 141, 0, 33205);
    			attr_dev(path137, "d", "M927.553 413.295L968.37 396.5C962.87 381.5 941.324 367.375 933.196 371.722C929.871 373.5 922.87 390 927.553 413.295Z");
    			attr_dev(path137, "fill", "url(#paint112_linear_637_19820)");
    			add_location(path137, file$h, 142, 0, 33463);
    			attr_dev(path138, "d", "M960.797 412.129C954.448 403 936.871 399 921.825 391.915C920.37 405.5 930.424 425.065 937.871 433.5C947.179 444.044 965.252 444.843 969.856 440.558C974.461 436.273 966.994 421.04 960.797 412.129Z");
    			attr_dev(path138, "fill", "#57661F");
    			add_location(path138, file$h, 143, 0, 33632);
    			attr_dev(path139, "d", "M948.764 421.713C948.764 408.5 955.871 384 959.189 375.292C969.871 383 978.617 401.878 980.256 413.009C982.305 426.923 972.047 442.365 965.802 443.117C959.557 443.87 948.764 432.567 948.764 421.713Z");
    			attr_dev(path139, "fill", "#57661F");
    			add_location(path139, file$h, 144, 0, 33856);
    			attr_dev(path140, "d", "M1208.93 474.085C1224.14 509.843 1246.8 525.871 1259.73 537.752L1280.06 506.5C1280 374 1280 352.537 1280 295.5C1263.55 302.773 1248.68 312.484 1234.46 338.455C1171.55 274.347 1191.17 432.332 1208.93 474.085Z");
    			attr_dev(path140, "fill", "#FFCD59");
    			add_location(path140, file$h, 145, 0, 34083);
    			attr_dev(path141, "d", "M1280 351.529C1257.95 340.199 1240.37 333.237 1228.16 393.561C1221.27 427.548 1228.08 522.74 1265.77 543.522C1270.56 546.164 1275.31 548.154 1280 549.555C1280 -3729.14 1280 2304.8 1280 351.529Z");
    			attr_dev(path141, "fill", "url(#paint113_linear_637_19820)");
    			add_location(path141, file$h, 146, 0, 34319);
    			attr_dev(path142, "d", "M0.000308697 537.5C107.8 484.655 127.13 333.791 49.8574 264.218C33.588 249.57 20.2471 257.674 0.000138549 276.5C0.000139286 406 0.000307892 423.5 0.000308697 537.5Z");
    			attr_dev(path142, "fill", "url(#paint114_linear_637_19820)");
    			add_location(path142, file$h, 147, 0, 34565);
    			attr_dev(g, "mask", "url(#mask0_637_19820)");
    			add_location(g, file$h, 4, 0, 328);
    			attr_dev(stop0, "stop-color", "#57661F");
    			add_location(stop0, file$h, 151, 0, 34926);
    			attr_dev(stop1, "offset", "0.791667");
    			attr_dev(stop1, "stop-color", "#9CB23E");
    			add_location(stop1, file$h, 152, 0, 34956);
    			attr_dev(linearGradient0, "id", "paint0_linear_637_19820");
    			attr_dev(linearGradient0, "x1", "1105.59");
    			attr_dev(linearGradient0, "y1", "223.953");
    			attr_dev(linearGradient0, "x2", "1065.74");
    			attr_dev(linearGradient0, "y2", "371.238");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$h, 150, 0, 34796);
    			attr_dev(stop2, "offset", "0.541667");
    			attr_dev(stop2, "stop-color", "#E85151");
    			add_location(stop2, file$h, 155, 0, 35153);
    			attr_dev(stop3, "offset", "0.994792");
    			attr_dev(stop3, "stop-color", "#B83535");
    			add_location(stop3, file$h, 156, 0, 35201);
    			attr_dev(linearGradient1, "id", "paint1_linear_637_19820");
    			attr_dev(linearGradient1, "x1", "1128.32");
    			attr_dev(linearGradient1, "y1", "157.259");
    			attr_dev(linearGradient1, "x2", "1099.02");
    			attr_dev(linearGradient1, "y2", "220.511");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$h, 154, 0, 35023);
    			attr_dev(stop4, "offset", "0.541667");
    			attr_dev(stop4, "stop-color", "#E85151");
    			add_location(stop4, file$h, 159, 0, 35398);
    			attr_dev(stop5, "offset", "0.994792");
    			attr_dev(stop5, "stop-color", "#B83535");
    			add_location(stop5, file$h, 160, 0, 35446);
    			attr_dev(linearGradient2, "id", "paint2_linear_637_19820");
    			attr_dev(linearGradient2, "x1", "1058.32");
    			attr_dev(linearGradient2, "y1", "155.445");
    			attr_dev(linearGradient2, "x2", "1090.54");
    			attr_dev(linearGradient2, "y2", "223.327");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$h, 158, 0, 35268);
    			attr_dev(stop6, "stop-color", "#57661F");
    			add_location(stop6, file$h, 163, 0, 35643);
    			attr_dev(stop7, "offset", "0.791667");
    			attr_dev(stop7, "stop-color", "#9CB23E");
    			add_location(stop7, file$h, 164, 0, 35673);
    			attr_dev(linearGradient3, "id", "paint3_linear_637_19820");
    			attr_dev(linearGradient3, "x1", "309.826");
    			attr_dev(linearGradient3, "y1", "189.678");
    			attr_dev(linearGradient3, "x2", "315.892");
    			attr_dev(linearGradient3, "y2", "366.972");
    			attr_dev(linearGradient3, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient3, file$h, 162, 0, 35513);
    			attr_dev(stop8, "stop-color", "#FFCD59");
    			add_location(stop8, file$h, 167, 0, 35870);
    			attr_dev(stop9, "offset", "0.895833");
    			attr_dev(stop9, "stop-color", "#F2AC49");
    			add_location(stop9, file$h, 168, 0, 35900);
    			attr_dev(linearGradient4, "id", "paint4_linear_637_19820");
    			attr_dev(linearGradient4, "x1", "329.185");
    			attr_dev(linearGradient4, "y1", "153.033");
    			attr_dev(linearGradient4, "x2", "326.236");
    			attr_dev(linearGradient4, "y2", "172.237");
    			attr_dev(linearGradient4, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient4, file$h, 166, 0, 35740);
    			attr_dev(stop10, "stop-color", "#57661F");
    			add_location(stop10, file$h, 171, 0, 36097);
    			attr_dev(stop11, "offset", "0.791667");
    			attr_dev(stop11, "stop-color", "#9CB23E");
    			add_location(stop11, file$h, 172, 0, 36127);
    			attr_dev(linearGradient5, "id", "paint5_linear_637_19820");
    			attr_dev(linearGradient5, "x1", "331.449");
    			attr_dev(linearGradient5, "y1", "211.161");
    			attr_dev(linearGradient5, "x2", "330.811");
    			attr_dev(linearGradient5, "y2", "286.069");
    			attr_dev(linearGradient5, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient5, file$h, 170, 0, 35967);
    			attr_dev(stop12, "stop-color", "#57661F");
    			add_location(stop12, file$h, 175, 0, 36324);
    			attr_dev(stop13, "offset", "0.791667");
    			attr_dev(stop13, "stop-color", "#9CB23E");
    			add_location(stop13, file$h, 176, 0, 36354);
    			attr_dev(linearGradient6, "id", "paint6_linear_637_19820");
    			attr_dev(linearGradient6, "x1", "895.427");
    			attr_dev(linearGradient6, "y1", "266.508");
    			attr_dev(linearGradient6, "x2", "875.931");
    			attr_dev(linearGradient6, "y2", "413.368");
    			attr_dev(linearGradient6, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient6, file$h, 174, 0, 36194);
    			attr_dev(stop14, "offset", "0.375");
    			attr_dev(stop14, "stop-color", "#F2AC49");
    			add_location(stop14, file$h, 179, 0, 36551);
    			attr_dev(stop15, "offset", "1");
    			attr_dev(stop15, "stop-color", "#FFCD59");
    			add_location(stop15, file$h, 180, 0, 36596);
    			attr_dev(linearGradient7, "id", "paint7_linear_637_19820");
    			attr_dev(linearGradient7, "x1", "890.188");
    			attr_dev(linearGradient7, "y1", "266.164");
    			attr_dev(linearGradient7, "x2", "855.901");
    			attr_dev(linearGradient7, "y2", "220.057");
    			attr_dev(linearGradient7, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient7, file$h, 178, 0, 36421);
    			attr_dev(stop16, "offset", "0.125");
    			attr_dev(stop16, "stop-color", "#F2AC49");
    			add_location(stop16, file$h, 183, 0, 36786);
    			attr_dev(stop17, "offset", "1");
    			attr_dev(stop17, "stop-color", "#FFCD59");
    			add_location(stop17, file$h, 184, 0, 36831);
    			attr_dev(linearGradient8, "id", "paint8_linear_637_19820");
    			attr_dev(linearGradient8, "x1", "890.193");
    			attr_dev(linearGradient8, "y1", "270.111");
    			attr_dev(linearGradient8, "x2", "889.952");
    			attr_dev(linearGradient8, "y2", "228.579");
    			attr_dev(linearGradient8, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient8, file$h, 182, 0, 36656);
    			attr_dev(stop18, "stop-color", "#57661F");
    			add_location(stop18, file$h, 187, 0, 37020);
    			attr_dev(stop19, "offset", "0.791667");
    			attr_dev(stop19, "stop-color", "#9CB23E");
    			add_location(stop19, file$h, 188, 0, 37050);
    			attr_dev(linearGradient9, "id", "paint9_linear_637_19820");
    			attr_dev(linearGradient9, "x1", "830.633");
    			attr_dev(linearGradient9, "y1", "273.17");
    			attr_dev(linearGradient9, "x2", "904.477");
    			attr_dev(linearGradient9, "y2", "463.428");
    			attr_dev(linearGradient9, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient9, file$h, 186, 0, 36891);
    			attr_dev(stop20, "stop-color", "#FFCD59");
    			add_location(stop20, file$h, 191, 0, 37248);
    			attr_dev(stop21, "offset", "0.895833");
    			attr_dev(stop21, "stop-color", "#F2AC49");
    			add_location(stop21, file$h, 192, 0, 37278);
    			attr_dev(linearGradient10, "id", "paint10_linear_637_19820");
    			attr_dev(linearGradient10, "x1", "836.759");
    			attr_dev(linearGradient10, "y1", "228.026");
    			attr_dev(linearGradient10, "x2", "840.841");
    			attr_dev(linearGradient10, "y2", "250.002");
    			attr_dev(linearGradient10, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient10, file$h, 190, 0, 37117);
    			attr_dev(stop22, "stop-color", "#57661F");
    			add_location(stop22, file$h, 195, 0, 37476);
    			attr_dev(stop23, "offset", "0.791667");
    			attr_dev(stop23, "stop-color", "#9CB23E");
    			add_location(stop23, file$h, 196, 0, 37506);
    			attr_dev(linearGradient11, "id", "paint11_linear_637_19820");
    			attr_dev(linearGradient11, "x1", "862.905");
    			attr_dev(linearGradient11, "y1", "288.248");
    			attr_dev(linearGradient11, "x2", "890.628");
    			attr_dev(linearGradient11, "y2", "369.848");
    			attr_dev(linearGradient11, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient11, file$h, 194, 0, 37345);
    			attr_dev(stop24, "stop-color", "#57661F");
    			add_location(stop24, file$h, 199, 0, 37704);
    			attr_dev(stop25, "offset", "0.791667");
    			attr_dev(stop25, "stop-color", "#9CB23E");
    			add_location(stop25, file$h, 200, 0, 37734);
    			attr_dev(linearGradient12, "id", "paint12_linear_637_19820");
    			attr_dev(linearGradient12, "x1", "1227.09");
    			attr_dev(linearGradient12, "y1", "265.368");
    			attr_dev(linearGradient12, "x2", "1289.49");
    			attr_dev(linearGradient12, "y2", "523.206");
    			attr_dev(linearGradient12, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient12, file$h, 198, 0, 37573);
    			attr_dev(stop26, "offset", "0.375");
    			attr_dev(stop26, "stop-color", "#F2AC49");
    			add_location(stop26, file$h, 203, 0, 37932);
    			attr_dev(stop27, "offset", "1");
    			attr_dev(stop27, "stop-color", "#FFCD59");
    			add_location(stop27, file$h, 204, 0, 37977);
    			attr_dev(linearGradient13, "id", "paint13_linear_637_19820");
    			attr_dev(linearGradient13, "x1", "1220.58");
    			attr_dev(linearGradient13, "y1", "268.296");
    			attr_dev(linearGradient13, "x2", "1134.62");
    			attr_dev(linearGradient13, "y2", "207.641");
    			attr_dev(linearGradient13, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient13, file$h, 202, 0, 37801);
    			attr_dev(stop28, "offset", "0.125");
    			attr_dev(stop28, "stop-color", "#F2AC49");
    			add_location(stop28, file$h, 207, 0, 38166);
    			attr_dev(stop29, "offset", "1");
    			attr_dev(stop29, "stop-color", "#FFCD59");
    			add_location(stop29, file$h, 208, 0, 38211);
    			attr_dev(linearGradient14, "id", "paint14_linear_637_19820");
    			attr_dev(linearGradient14, "x1", "1222.84");
    			attr_dev(linearGradient14, "y1", "275.16");
    			attr_dev(linearGradient14, "x2", "1198.72");
    			attr_dev(linearGradient14, "y2", "203.04");
    			attr_dev(linearGradient14, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient14, file$h, 206, 0, 38037);
    			attr_dev(stop30, "stop-color", "#FFCD59");
    			add_location(stop30, file$h, 211, 0, 38402);
    			attr_dev(stop31, "offset", "0.895833");
    			attr_dev(stop31, "stop-color", "#F2AC49");
    			add_location(stop31, file$h, 212, 0, 38432);
    			attr_dev(linearGradient15, "id", "paint15_linear_637_19820");
    			attr_dev(linearGradient15, "x1", "1231.58");
    			attr_dev(linearGradient15, "y1", "159.865");
    			attr_dev(linearGradient15, "x2", "1280.73");
    			attr_dev(linearGradient15, "y2", "178.709");
    			attr_dev(linearGradient15, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient15, file$h, 210, 0, 38271);
    			attr_dev(stop32, "stop-color", "#57661F");
    			add_location(stop32, file$h, 215, 0, 38630);
    			attr_dev(stop33, "offset", "0.791667");
    			attr_dev(stop33, "stop-color", "#9CB23E");
    			add_location(stop33, file$h, 216, 0, 38660);
    			attr_dev(linearGradient16, "id", "paint16_linear_637_19820");
    			attr_dev(linearGradient16, "x1", "633.812");
    			attr_dev(linearGradient16, "y1", "231.266");
    			attr_dev(linearGradient16, "x2", "597.165");
    			attr_dev(linearGradient16, "y2", "442.045");
    			attr_dev(linearGradient16, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient16, file$h, 214, 0, 38499);
    			attr_dev(stop34, "stop-color", "#F2B091");
    			add_location(stop34, file$h, 219, 0, 38856);
    			attr_dev(stop35, "offset", "0.729167");
    			attr_dev(stop35, "stop-color", "#F26E30");
    			add_location(stop35, file$h, 220, 0, 38886);
    			attr_dev(linearGradient17, "id", "paint17_linear_637_19820");
    			attr_dev(linearGradient17, "x1", "611.812");
    			attr_dev(linearGradient17, "y1", "204.113");
    			attr_dev(linearGradient17, "x2", "623.091");
    			attr_dev(linearGradient17, "y2", "244.3");
    			attr_dev(linearGradient17, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient17, file$h, 218, 0, 38727);
    			attr_dev(stop36, "stop-color", "#F2B091");
    			add_location(stop36, file$h, 223, 0, 39083);
    			attr_dev(stop37, "offset", "0.729167");
    			attr_dev(stop37, "stop-color", "#F26E30");
    			add_location(stop37, file$h, 224, 0, 39113);
    			attr_dev(linearGradient18, "id", "paint18_linear_637_19820");
    			attr_dev(linearGradient18, "x1", "642.409");
    			attr_dev(linearGradient18, "y1", "212.481");
    			attr_dev(linearGradient18, "x2", "650.13");
    			attr_dev(linearGradient18, "y2", "244.692");
    			attr_dev(linearGradient18, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient18, file$h, 222, 0, 38953);
    			attr_dev(stop38, "stop-color", "#F2B091");
    			add_location(stop38, file$h, 227, 0, 39311);
    			attr_dev(stop39, "offset", "0.729167");
    			attr_dev(stop39, "stop-color", "#F26E30");
    			add_location(stop39, file$h, 228, 0, 39341);
    			attr_dev(linearGradient19, "id", "paint19_linear_637_19820");
    			attr_dev(linearGradient19, "x1", "599.131");
    			attr_dev(linearGradient19, "y1", "217.277");
    			attr_dev(linearGradient19, "x2", "615.618");
    			attr_dev(linearGradient19, "y2", "247.765");
    			attr_dev(linearGradient19, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient19, file$h, 226, 0, 39180);
    			attr_dev(stop40, "stop-color", "#F2B091");
    			add_location(stop40, file$h, 231, 0, 39538);
    			attr_dev(stop41, "offset", "0.729167");
    			attr_dev(stop41, "stop-color", "#F26E30");
    			add_location(stop41, file$h, 232, 0, 39568);
    			attr_dev(linearGradient20, "id", "paint20_linear_637_19820");
    			attr_dev(linearGradient20, "x1", "628.765");
    			attr_dev(linearGradient20, "y1", "203.687");
    			attr_dev(linearGradient20, "x2", "638.35");
    			attr_dev(linearGradient20, "y2", "244.001");
    			attr_dev(linearGradient20, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient20, file$h, 230, 0, 39408);
    			attr_dev(stop42, "stop-color", "#57661F");
    			add_location(stop42, file$h, 235, 0, 39766);
    			attr_dev(stop43, "offset", "0.791667");
    			attr_dev(stop43, "stop-color", "#9CB23E");
    			add_location(stop43, file$h, 236, 0, 39796);
    			attr_dev(linearGradient21, "id", "paint21_linear_637_19820");
    			attr_dev(linearGradient21, "x1", "370.805");
    			attr_dev(linearGradient21, "y1", "227.312");
    			attr_dev(linearGradient21, "x2", "407.028");
    			attr_dev(linearGradient21, "y2", "464.082");
    			attr_dev(linearGradient21, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient21, file$h, 234, 0, 39635);
    			attr_dev(stop44, "stop-color", "#F2B091");
    			add_location(stop44, file$h, 239, 0, 39994);
    			attr_dev(stop45, "offset", "0.729167");
    			attr_dev(stop45, "stop-color", "#F26E30");
    			add_location(stop45, file$h, 240, 0, 40024);
    			attr_dev(linearGradient22, "id", "paint22_linear_637_19820");
    			attr_dev(linearGradient22, "x1", "402.689");
    			attr_dev(linearGradient22, "y1", "172.084");
    			attr_dev(linearGradient22, "x2", "385.271");
    			attr_dev(linearGradient22, "y2", "229.787");
    			attr_dev(linearGradient22, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient22, file$h, 238, 0, 39863);
    			attr_dev(stop46, "stop-color", "#F2B091");
    			add_location(stop46, file$h, 243, 0, 40221);
    			attr_dev(stop47, "offset", "0.729167");
    			attr_dev(stop47, "stop-color", "#F26E30");
    			add_location(stop47, file$h, 244, 0, 40251);
    			attr_dev(linearGradient23, "id", "paint23_linear_637_19820");
    			attr_dev(linearGradient23, "x1", "358.279");
    			attr_dev(linearGradient23, "y1", "183.302");
    			attr_dev(linearGradient23, "x2", "346.223");
    			attr_dev(linearGradient23, "y2", "229.59");
    			attr_dev(linearGradient23, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient23, file$h, 242, 0, 40091);
    			attr_dev(stop48, "stop-color", "#F2B091");
    			add_location(stop48, file$h, 247, 0, 40445);
    			attr_dev(stop49, "offset", "0.729167");
    			attr_dev(stop49, "stop-color", "#F26E30");
    			add_location(stop49, file$h, 248, 0, 40475);
    			attr_dev(linearGradient24, "id", "paint24_linear_637_19820");
    			attr_dev(linearGradient24, "x1", "420.626");
    			attr_dev(linearGradient24, "y1", "191.447");
    			attr_dev(linearGradient24, "x2", "395.963");
    			attr_dev(linearGradient24, "y2", "235");
    			attr_dev(linearGradient24, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient24, file$h, 246, 0, 40318);
    			attr_dev(stop50, "stop-color", "#F2B091");
    			add_location(stop50, file$h, 251, 0, 40672);
    			attr_dev(stop51, "offset", "0.729167");
    			attr_dev(stop51, "stop-color", "#F26E30");
    			add_location(stop51, file$h, 252, 0, 40702);
    			attr_dev(linearGradient25, "id", "paint25_linear_637_19820");
    			attr_dev(linearGradient25, "x1", "378.225");
    			attr_dev(linearGradient25, "y1", "170.991");
    			attr_dev(linearGradient25, "x2", "363.25");
    			attr_dev(linearGradient25, "y2", "228.924");
    			attr_dev(linearGradient25, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient25, file$h, 250, 0, 40542);
    			attr_dev(stop52, "stop-color", "#57661F");
    			add_location(stop52, file$h, 255, 0, 40900);
    			attr_dev(stop53, "offset", "0.791667");
    			attr_dev(stop53, "stop-color", "#9CB23E");
    			add_location(stop53, file$h, 256, 0, 40930);
    			attr_dev(linearGradient26, "id", "paint26_linear_637_19820");
    			attr_dev(linearGradient26, "x1", "330.886");
    			attr_dev(linearGradient26, "y1", "277.099");
    			attr_dev(linearGradient26, "x2", "333.881");
    			attr_dev(linearGradient26, "y2", "466.389");
    			attr_dev(linearGradient26, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient26, file$h, 254, 0, 40769);
    			attr_dev(stop54, "stop-color", "#57661F");
    			add_location(stop54, file$h, 259, 0, 41128);
    			attr_dev(stop55, "offset", "0.791667");
    			attr_dev(stop55, "stop-color", "#9CB23E");
    			add_location(stop55, file$h, 260, 0, 41158);
    			attr_dev(linearGradient27, "id", "paint27_linear_637_19820");
    			attr_dev(linearGradient27, "x1", "496.315");
    			attr_dev(linearGradient27, "y1", "233.947");
    			attr_dev(linearGradient27, "x2", "595.862");
    			attr_dev(linearGradient27, "y2", "442.363");
    			attr_dev(linearGradient27, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient27, file$h, 258, 0, 40997);
    			attr_dev(stop56, "stop-color", "#FFCD59");
    			add_location(stop56, file$h, 263, 0, 41356);
    			attr_dev(stop57, "offset", "0.895833");
    			attr_dev(stop57, "stop-color", "#F2AC49");
    			add_location(stop57, file$h, 264, 0, 41386);
    			attr_dev(linearGradient28, "id", "paint28_linear_637_19820");
    			attr_dev(linearGradient28, "x1", "537.562");
    			attr_dev(linearGradient28, "y1", "189.334");
    			attr_dev(linearGradient28, "x2", "520.211");
    			attr_dev(linearGradient28, "y2", "254.907");
    			attr_dev(linearGradient28, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient28, file$h, 262, 0, 41225);
    			attr_dev(stop58, "stop-color", "#57661F");
    			add_location(stop58, file$h, 267, 0, 41584);
    			attr_dev(stop59, "offset", "0.791667");
    			attr_dev(stop59, "stop-color", "#9CB23E");
    			add_location(stop59, file$h, 268, 0, 41614);
    			attr_dev(linearGradient29, "id", "paint29_linear_637_19820");
    			attr_dev(linearGradient29, "x1", "86.3353");
    			attr_dev(linearGradient29, "y1", "129.227");
    			attr_dev(linearGradient29, "x2", "62.2975");
    			attr_dev(linearGradient29, "y2", "220.006");
    			attr_dev(linearGradient29, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient29, file$h, 266, 0, 41453);
    			attr_dev(stop60, "offset", "0.541667");
    			attr_dev(stop60, "stop-color", "#E85151");
    			add_location(stop60, file$h, 271, 0, 41812);
    			attr_dev(stop61, "offset", "0.994792");
    			attr_dev(stop61, "stop-color", "#B83535");
    			add_location(stop61, file$h, 272, 0, 41860);
    			attr_dev(linearGradient30, "id", "paint30_linear_637_19820");
    			attr_dev(linearGradient30, "x1", "105.185");
    			attr_dev(linearGradient30, "y1", "61.3743");
    			attr_dev(linearGradient30, "x2", "100.375");
    			attr_dev(linearGradient30, "y2", "111.979");
    			attr_dev(linearGradient30, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient30, file$h, 270, 0, 41681);
    			attr_dev(stop62, "offset", "0.541667");
    			attr_dev(stop62, "stop-color", "#E85151");
    			add_location(stop62, file$h, 275, 0, 42058);
    			attr_dev(stop63, "offset", "0.994792");
    			attr_dev(stop63, "stop-color", "#B83535");
    			add_location(stop63, file$h, 276, 0, 42106);
    			attr_dev(linearGradient31, "id", "paint31_linear_637_19820");
    			attr_dev(linearGradient31, "x1", "151.361");
    			attr_dev(linearGradient31, "y1", "86.1087");
    			attr_dev(linearGradient31, "x2", "105.267");
    			attr_dev(linearGradient31, "y2", "118.309");
    			attr_dev(linearGradient31, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient31, file$h, 274, 0, 41927);
    			attr_dev(stop64, "stop-color", "#57661F");
    			add_location(stop64, file$h, 279, 0, 42304);
    			attr_dev(stop65, "offset", "0.791667");
    			attr_dev(stop65, "stop-color", "#9CB23E");
    			add_location(stop65, file$h, 280, 0, 42334);
    			attr_dev(linearGradient32, "id", "paint32_linear_637_19820");
    			attr_dev(linearGradient32, "x1", "771.128");
    			attr_dev(linearGradient32, "y1", "271.396");
    			attr_dev(linearGradient32, "x2", "790.298");
    			attr_dev(linearGradient32, "y2", "391.323");
    			attr_dev(linearGradient32, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient32, file$h, 278, 0, 42173);
    			attr_dev(stop66, "offset", "0.541667");
    			attr_dev(stop66, "stop-color", "#E85151");
    			add_location(stop66, file$h, 283, 0, 42529);
    			attr_dev(stop67, "offset", "0.994792");
    			attr_dev(stop67, "stop-color", "#B83535");
    			add_location(stop67, file$h, 284, 0, 42577);
    			attr_dev(linearGradient33, "id", "paint33_linear_637_19820");
    			attr_dev(linearGradient33, "x1", "758.08");
    			attr_dev(linearGradient33, "y1", "201.2");
    			attr_dev(linearGradient33, "x2", "776.244");
    			attr_dev(linearGradient33, "y2", "258.436");
    			attr_dev(linearGradient33, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient33, file$h, 282, 0, 42401);
    			attr_dev(stop68, "offset", "0.541667");
    			attr_dev(stop68, "stop-color", "#E85151");
    			add_location(stop68, file$h, 287, 0, 42775);
    			attr_dev(stop69, "offset", "0.994792");
    			attr_dev(stop69, "stop-color", "#B83535");
    			add_location(stop69, file$h, 288, 0, 42823);
    			attr_dev(linearGradient34, "id", "paint34_linear_637_19820");
    			attr_dev(linearGradient34, "x1", "819.711");
    			attr_dev(linearGradient34, "y1", "206.743");
    			attr_dev(linearGradient34, "x2", "784.488");
    			attr_dev(linearGradient34, "y2", "263.055");
    			attr_dev(linearGradient34, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient34, file$h, 286, 0, 42644);
    			attr_dev(stop70, "stop-color", "#57661F");
    			add_location(stop70, file$h, 291, 0, 43021);
    			attr_dev(stop71, "offset", "0.791667");
    			attr_dev(stop71, "stop-color", "#9CB23E");
    			add_location(stop71, file$h, 292, 0, 43051);
    			attr_dev(linearGradient35, "id", "paint35_linear_637_19820");
    			attr_dev(linearGradient35, "x1", "153.972");
    			attr_dev(linearGradient35, "y1", "140.209");
    			attr_dev(linearGradient35, "x2", "91.9516");
    			attr_dev(linearGradient35, "y2", "362.651");
    			attr_dev(linearGradient35, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient35, file$h, 290, 0, 42890);
    			attr_dev(stop72, "stop-color", "#FFCD59");
    			add_location(stop72, file$h, 295, 0, 43249);
    			attr_dev(stop73, "offset", "0.895833");
    			attr_dev(stop73, "stop-color", "#F2AC49");
    			add_location(stop73, file$h, 296, 0, 43279);
    			attr_dev(linearGradient36, "id", "paint36_linear_637_19820");
    			attr_dev(linearGradient36, "x1", "150.023");
    			attr_dev(linearGradient36, "y1", "112.172");
    			attr_dev(linearGradient36, "x2", "143.539");
    			attr_dev(linearGradient36, "y2", "175.949");
    			attr_dev(linearGradient36, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient36, file$h, 294, 0, 43118);
    			attr_dev(stop74, "stop-color", "#57661F");
    			add_location(stop74, file$h, 299, 0, 43477);
    			attr_dev(stop75, "offset", "0.791667");
    			attr_dev(stop75, "stop-color", "#9CB23E");
    			add_location(stop75, file$h, 300, 0, 43507);
    			attr_dev(linearGradient37, "id", "paint37_linear_637_19820");
    			attr_dev(linearGradient37, "x1", "103.461");
    			attr_dev(linearGradient37, "y1", "165.872");
    			attr_dev(linearGradient37, "x2", "109.527");
    			attr_dev(linearGradient37, "y2", "343.167");
    			attr_dev(linearGradient37, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient37, file$h, 298, 0, 43346);
    			attr_dev(stop76, "stop-color", "#FFCD59");
    			add_location(stop76, file$h, 303, 0, 43704);
    			attr_dev(stop77, "offset", "0.895833");
    			attr_dev(stop77, "stop-color", "#F2AC49");
    			add_location(stop77, file$h, 304, 0, 43734);
    			attr_dev(linearGradient38, "id", "paint38_linear_637_19820");
    			attr_dev(linearGradient38, "x1", "122.82");
    			attr_dev(linearGradient38, "y1", "129.228");
    			attr_dev(linearGradient38, "x2", "119.871");
    			attr_dev(linearGradient38, "y2", "148.431");
    			attr_dev(linearGradient38, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient38, file$h, 302, 0, 43574);
    			attr_dev(stop78, "stop-color", "#F2B091");
    			add_location(stop78, file$h, 307, 0, 43932);
    			attr_dev(stop79, "offset", "0.729167");
    			attr_dev(stop79, "stop-color", "#F26E30");
    			add_location(stop79, file$h, 308, 0, 43962);
    			attr_dev(linearGradient39, "id", "paint39_linear_637_19820");
    			attr_dev(linearGradient39, "x1", "48.2151");
    			attr_dev(linearGradient39, "y1", "74.5145");
    			attr_dev(linearGradient39, "x2", "19.3739");
    			attr_dev(linearGradient39, "y2", "136.242");
    			attr_dev(linearGradient39, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient39, file$h, 306, 0, 43801);
    			attr_dev(stop80, "stop-color", "#F2B091");
    			add_location(stop80, file$h, 311, 0, 44160);
    			attr_dev(stop81, "offset", "0.729167");
    			attr_dev(stop81, "stop-color", "#F26E30");
    			add_location(stop81, file$h, 312, 0, 44190);
    			attr_dev(linearGradient40, "id", "paint40_linear_637_19820");
    			attr_dev(linearGradient40, "x1", "3.8508");
    			attr_dev(linearGradient40, "y1", "102.421");
    			attr_dev(linearGradient40, "x2", "-10.3894");
    			attr_dev(linearGradient40, "y2", "123.341");
    			attr_dev(linearGradient40, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient40, file$h, 310, 0, 44029);
    			attr_dev(stop82, "stop-color", "#F2B091");
    			add_location(stop82, file$h, 315, 0, 44388);
    			attr_dev(stop83, "offset", "0.729167");
    			attr_dev(stop83, "stop-color", "#F26E30");
    			add_location(stop83, file$h, 316, 0, 44418);
    			attr_dev(linearGradient41, "id", "paint41_linear_637_19820");
    			attr_dev(linearGradient41, "x1", "65.1417");
    			attr_dev(linearGradient41, "y1", "99.0843");
    			attr_dev(linearGradient41, "x2", "30.4896");
    			attr_dev(linearGradient41, "y2", "143.808");
    			attr_dev(linearGradient41, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient41, file$h, 314, 0, 44257);
    			attr_dev(stop84, "stop-color", "#F2B091");
    			add_location(stop84, file$h, 319, 0, 44617);
    			attr_dev(stop85, "offset", "0.729167");
    			attr_dev(stop85, "stop-color", "#F26E30");
    			add_location(stop85, file$h, 320, 0, 44647);
    			attr_dev(linearGradient42, "id", "paint42_linear_637_19820");
    			attr_dev(linearGradient42, "x1", "21.3834");
    			attr_dev(linearGradient42, "y1", "69.3088");
    			attr_dev(linearGradient42, "x2", "-6.10211");
    			attr_dev(linearGradient42, "y2", "129.589");
    			attr_dev(linearGradient42, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient42, file$h, 318, 0, 44485);
    			attr_dev(stop86, "stop-color", "#57661F");
    			add_location(stop86, file$h, 323, 0, 44845);
    			attr_dev(stop87, "offset", "0.791667");
    			attr_dev(stop87, "stop-color", "#9CB23E");
    			add_location(stop87, file$h, 324, 0, 44875);
    			attr_dev(linearGradient43, "id", "paint43_linear_637_19820");
    			attr_dev(linearGradient43, "x1", "1025.69");
    			attr_dev(linearGradient43, "y1", "200.768");
    			attr_dev(linearGradient43, "x2", "1065.36");
    			attr_dev(linearGradient43, "y2", "493.805");
    			attr_dev(linearGradient43, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient43, file$h, 322, 0, 44714);
    			attr_dev(stop88, "stop-color", "#FFCD59");
    			add_location(stop88, file$h, 327, 0, 45073);
    			attr_dev(stop89, "offset", "0.895833");
    			attr_dev(stop89, "stop-color", "#F2AC49");
    			add_location(stop89, file$h, 328, 0, 45103);
    			attr_dev(linearGradient44, "id", "paint44_linear_637_19820");
    			attr_dev(linearGradient44, "x1", "1035.94");
    			attr_dev(linearGradient44, "y1", "157.049");
    			attr_dev(linearGradient44, "x2", "1032.83");
    			attr_dev(linearGradient44, "y2", "241.696");
    			attr_dev(linearGradient44, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient44, file$h, 326, 0, 44942);
    			attr_dev(stop90, "stop-color", "#57661F");
    			add_location(stop90, file$h, 331, 0, 45301);
    			attr_dev(stop91, "offset", "0.791667");
    			attr_dev(stop91, "stop-color", "#9CB23E");
    			add_location(stop91, file$h, 332, 0, 45331);
    			attr_dev(linearGradient45, "id", "paint45_linear_637_19820");
    			attr_dev(linearGradient45, "x1", "1138.15");
    			attr_dev(linearGradient45, "y1", "244.873");
    			attr_dev(linearGradient45, "x2", "1132.08");
    			attr_dev(linearGradient45, "y2", "422.167");
    			attr_dev(linearGradient45, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient45, file$h, 330, 0, 45170);
    			attr_dev(stop92, "stop-color", "#FFCD59");
    			add_location(stop92, file$h, 335, 0, 45529);
    			attr_dev(stop93, "offset", "0.895833");
    			attr_dev(stop93, "stop-color", "#F2AC49");
    			add_location(stop93, file$h, 336, 0, 45559);
    			attr_dev(linearGradient46, "id", "paint46_linear_637_19820");
    			attr_dev(linearGradient46, "x1", "1118.79");
    			attr_dev(linearGradient46, "y1", "208.228");
    			attr_dev(linearGradient46, "x2", "1121.74");
    			attr_dev(linearGradient46, "y2", "227.432");
    			attr_dev(linearGradient46, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient46, file$h, 334, 0, 45398);
    			attr_dev(stop94, "stop-color", "#57661F");
    			add_location(stop94, file$h, 339, 0, 45757);
    			attr_dev(stop95, "offset", "0.791667");
    			attr_dev(stop95, "stop-color", "#9CB23E");
    			add_location(stop95, file$h, 340, 0, 45787);
    			attr_dev(linearGradient47, "id", "paint47_linear_637_19820");
    			attr_dev(linearGradient47, "x1", "1116.53");
    			attr_dev(linearGradient47, "y1", "267.356");
    			attr_dev(linearGradient47, "x2", "1117.16");
    			attr_dev(linearGradient47, "y2", "342.264");
    			attr_dev(linearGradient47, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient47, file$h, 338, 0, 45626);
    			attr_dev(stop96, "stop-color", "#F2B091");
    			add_location(stop96, file$h, 343, 0, 45984);
    			attr_dev(stop97, "offset", "0.729167");
    			attr_dev(stop97, "stop-color", "#F26E30");
    			add_location(stop97, file$h, 344, 0, 46014);
    			attr_dev(linearGradient48, "id", "paint48_linear_637_19820");
    			attr_dev(linearGradient48, "x1", "1227.95");
    			attr_dev(linearGradient48, "y1", "202.814");
    			attr_dev(linearGradient48, "x2", "1298.4");
    			attr_dev(linearGradient48, "y2", "283.853");
    			attr_dev(linearGradient48, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient48, file$h, 342, 0, 45854);
    			attr_dev(stop98, "stop-color", "#F2B091");
    			add_location(stop98, file$h, 347, 0, 46212);
    			attr_dev(stop99, "offset", "0.729167");
    			attr_dev(stop99, "stop-color", "#F26E30");
    			add_location(stop99, file$h, 348, 0, 46242);
    			attr_dev(linearGradient49, "id", "paint49_linear_637_19820");
    			attr_dev(linearGradient49, "x1", "1205.85");
    			attr_dev(linearGradient49, "y1", "251.343");
    			attr_dev(linearGradient49, "x2", "1277.29");
    			attr_dev(linearGradient49, "y2", "311.161");
    			attr_dev(linearGradient49, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient49, file$h, 346, 0, 46081);
    			attr_dev(stop100, "stop-color", "#F2B091");
    			add_location(stop100, file$h, 351, 0, 46439);
    			attr_dev(stop101, "offset", "0.729167");
    			attr_dev(stop101, "stop-color", "#F26E30");
    			add_location(stop101, file$h, 352, 0, 46469);
    			attr_dev(linearGradient50, "id", "paint50_linear_637_19820");
    			attr_dev(linearGradient50, "x1", "1272.4");
    			attr_dev(linearGradient50, "y1", "38.8921");
    			attr_dev(linearGradient50, "x2", "1321.16");
    			attr_dev(linearGradient50, "y2", "45.2045");
    			attr_dev(linearGradient50, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient50, file$h, 350, 0, 46309);
    			attr_dev(stop102, "stop-color", "#57661F");
    			add_location(stop102, file$h, 355, 0, 46667);
    			attr_dev(stop103, "offset", "0.791667");
    			attr_dev(stop103, "stop-color", "#9CB23E");
    			add_location(stop103, file$h, 356, 0, 46697);
    			attr_dev(linearGradient51, "id", "paint51_linear_637_19820");
    			attr_dev(linearGradient51, "x1", "684.766");
    			attr_dev(linearGradient51, "y1", "265.774");
    			attr_dev(linearGradient51, "x2", "842.461");
    			attr_dev(linearGradient51, "y2", "550.415");
    			attr_dev(linearGradient51, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient51, file$h, 354, 0, 46536);
    			attr_dev(stop104, "stop-color", "#FFCD59");
    			add_location(stop104, file$h, 359, 0, 46895);
    			attr_dev(stop105, "offset", "0.895833");
    			attr_dev(stop105, "stop-color", "#F2AC49");
    			add_location(stop105, file$h, 360, 0, 46925);
    			attr_dev(linearGradient52, "id", "paint52_linear_637_19820");
    			attr_dev(linearGradient52, "x1", "658.216");
    			attr_dev(linearGradient52, "y1", "230.034");
    			attr_dev(linearGradient52, "x2", "706.763");
    			attr_dev(linearGradient52, "y2", "293.139");
    			attr_dev(linearGradient52, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient52, file$h, 358, 0, 46764);
    			attr_dev(stop106, "stop-color", "#57661F");
    			add_location(stop106, file$h, 363, 0, 47120);
    			attr_dev(stop107, "offset", "0.791667");
    			attr_dev(stop107, "stop-color", "#9CB23E");
    			add_location(stop107, file$h, 364, 0, 47150);
    			attr_dev(linearGradient53, "id", "paint53_linear_637_19820");
    			attr_dev(linearGradient53, "x1", "668.256");
    			attr_dev(linearGradient53, "y1", "381.26");
    			attr_dev(linearGradient53, "x2", "748.6");
    			attr_dev(linearGradient53, "y2", "524.425");
    			attr_dev(linearGradient53, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient53, file$h, 362, 0, 46992);
    			attr_dev(stop108, "stop-color", "#57661F");
    			add_location(stop108, file$h, 367, 0, 47347);
    			attr_dev(stop109, "offset", "0.791667");
    			attr_dev(stop109, "stop-color", "#9CB23E");
    			add_location(stop109, file$h, 368, 0, 47377);
    			attr_dev(linearGradient54, "id", "paint54_linear_637_19820");
    			attr_dev(linearGradient54, "x1", "191.385");
    			attr_dev(linearGradient54, "y1", "320.764");
    			attr_dev(linearGradient54, "x2", "209.09");
    			attr_dev(linearGradient54, "y2", "638.868");
    			attr_dev(linearGradient54, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient54, file$h, 366, 0, 47217);
    			attr_dev(stop110, "offset", "0.541667");
    			attr_dev(stop110, "stop-color", "#E85151");
    			add_location(stop110, file$h, 371, 0, 47575);
    			attr_dev(stop111, "offset", "0.994792");
    			attr_dev(stop111, "stop-color", "#B83535");
    			add_location(stop111, file$h, 372, 0, 47623);
    			attr_dev(linearGradient55, "id", "paint55_linear_637_19820");
    			attr_dev(linearGradient55, "x1", "177.801");
    			attr_dev(linearGradient55, "y1", "83.4444");
    			attr_dev(linearGradient55, "x2", "219.054");
    			attr_dev(linearGradient55, "y2", "268.192");
    			attr_dev(linearGradient55, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient55, file$h, 370, 0, 47444);
    			attr_dev(stop112, "offset", "0.541667");
    			attr_dev(stop112, "stop-color", "#E85151");
    			add_location(stop112, file$h, 375, 0, 47821);
    			attr_dev(stop113, "offset", "0.994792");
    			attr_dev(stop113, "stop-color", "#B83535");
    			add_location(stop113, file$h, 376, 0, 47869);
    			attr_dev(linearGradient56, "id", "paint56_linear_637_19820");
    			attr_dev(linearGradient56, "x1", "369.813");
    			attr_dev(linearGradient56, "y1", "117.851");
    			attr_dev(linearGradient56, "x2", "243.669");
    			attr_dev(linearGradient56, "y2", "284.972");
    			attr_dev(linearGradient56, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient56, file$h, 374, 0, 47690);
    			attr_dev(stop114, "stop-color", "#57661F");
    			add_location(stop114, file$h, 379, 0, 48068);
    			attr_dev(stop115, "offset", "0.791667");
    			attr_dev(stop115, "stop-color", "#9CB23E");
    			add_location(stop115, file$h, 380, 0, 48098);
    			attr_dev(linearGradient57, "id", "paint57_linear_637_19820");
    			attr_dev(linearGradient57, "x1", "137.798");
    			attr_dev(linearGradient57, "y1", "515.894");
    			attr_dev(linearGradient57, "x2", "-41.2734");
    			attr_dev(linearGradient57, "y2", "677.601");
    			attr_dev(linearGradient57, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient57, file$h, 378, 0, 47936);
    			attr_dev(stop116, "stop-color", "#57661F");
    			add_location(stop116, file$h, 383, 0, 48296);
    			attr_dev(stop117, "offset", "0.791667");
    			attr_dev(stop117, "stop-color", "#9CB23E");
    			add_location(stop117, file$h, 384, 0, 48326);
    			attr_dev(linearGradient58, "id", "paint58_linear_637_19820");
    			attr_dev(linearGradient58, "x1", "578.856");
    			attr_dev(linearGradient58, "y1", "318.281");
    			attr_dev(linearGradient58, "x2", "537.332");
    			attr_dev(linearGradient58, "y2", "474.301");
    			attr_dev(linearGradient58, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient58, file$h, 382, 0, 48165);
    			attr_dev(stop118, "offset", "0.541667");
    			attr_dev(stop118, "stop-color", "#E85151");
    			add_location(stop118, file$h, 387, 0, 48524);
    			attr_dev(stop119, "offset", "0.994792");
    			attr_dev(stop119, "stop-color", "#B83535");
    			add_location(stop119, file$h, 388, 0, 48572);
    			attr_dev(linearGradient59, "id", "paint59_linear_637_19820");
    			attr_dev(linearGradient59, "x1", "608.576");
    			attr_dev(linearGradient59, "y1", "200.913");
    			attr_dev(linearGradient59, "x2", "572.605");
    			attr_dev(linearGradient59, "y2", "280.561");
    			attr_dev(linearGradient59, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient59, file$h, 386, 0, 48393);
    			attr_dev(stop120, "offset", "0.541667");
    			attr_dev(stop120, "stop-color", "#E85151");
    			add_location(stop120, file$h, 391, 0, 48769);
    			attr_dev(stop121, "offset", "0.994792");
    			attr_dev(stop121, "stop-color", "#B83535");
    			add_location(stop121, file$h, 392, 0, 48817);
    			attr_dev(linearGradient60, "id", "paint60_linear_637_19820");
    			attr_dev(linearGradient60, "x1", "518.55");
    			attr_dev(linearGradient60, "y1", "198.462");
    			attr_dev(linearGradient60, "x2", "559.904");
    			attr_dev(linearGradient60, "y2", "285.838");
    			attr_dev(linearGradient60, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient60, file$h, 390, 0, 48639);
    			attr_dev(stop122, "stop-color", "#57661F");
    			add_location(stop122, file$h, 395, 0, 49015);
    			attr_dev(stop123, "offset", "0.791667");
    			attr_dev(stop123, "stop-color", "#9CB23E");
    			add_location(stop123, file$h, 396, 0, 49045);
    			attr_dev(linearGradient61, "id", "paint61_linear_637_19820");
    			attr_dev(linearGradient61, "x1", "622.151");
    			attr_dev(linearGradient61, "y1", "316.991");
    			attr_dev(linearGradient61, "x2", "639.385");
    			attr_dev(linearGradient61, "y2", "449.931");
    			attr_dev(linearGradient61, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient61, file$h, 394, 0, 48884);
    			attr_dev(stop124, "stop-color", "#57661F");
    			add_location(stop124, file$h, 399, 0, 49242);
    			attr_dev(stop125, "offset", "0.791667");
    			attr_dev(stop125, "stop-color", "#9CB23E");
    			add_location(stop125, file$h, 400, 0, 49272);
    			attr_dev(linearGradient62, "id", "paint62_linear_637_19820");
    			attr_dev(linearGradient62, "x1", "411.24");
    			attr_dev(linearGradient62, "y1", "279.558");
    			attr_dev(linearGradient62, "x2", "406.027");
    			attr_dev(linearGradient62, "y2", "453.601");
    			attr_dev(linearGradient62, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient62, file$h, 398, 0, 49112);
    			attr_dev(stop126, "offset", "0.375");
    			attr_dev(stop126, "stop-color", "#F2AC49");
    			add_location(stop126, file$h, 403, 0, 49470);
    			attr_dev(stop127, "offset", "1");
    			attr_dev(stop127, "stop-color", "#FFCD59");
    			add_location(stop127, file$h, 404, 0, 49515);
    			attr_dev(linearGradient63, "id", "paint63_linear_637_19820");
    			attr_dev(linearGradient63, "x1", "417.382");
    			attr_dev(linearGradient63, "y1", "280.152");
    			attr_dev(linearGradient63, "x2", "465.891");
    			attr_dev(linearGradient63, "y2", "233.168");
    			attr_dev(linearGradient63, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient63, file$h, 402, 0, 49339);
    			attr_dev(stop128, "offset", "0.125");
    			attr_dev(stop128, "stop-color", "#F2AC49");
    			add_location(stop128, file$h, 407, 0, 49706);
    			attr_dev(stop129, "offset", "1");
    			attr_dev(stop129, "stop-color", "#FFCD59");
    			add_location(stop129, file$h, 408, 0, 49751);
    			attr_dev(linearGradient64, "id", "paint64_linear_637_19820");
    			attr_dev(linearGradient64, "x1", "416.628");
    			attr_dev(linearGradient64, "y1", "284.729");
    			attr_dev(linearGradient64, "x2", "424.778");
    			attr_dev(linearGradient64, "y2", "236.601");
    			attr_dev(linearGradient64, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient64, file$h, 406, 0, 49575);
    			attr_dev(stop130, "stop-color", "#57661F");
    			add_location(stop130, file$h, 411, 0, 49942);
    			attr_dev(stop131, "offset", "0.791667");
    			attr_dev(stop131, "stop-color", "#9CB23E");
    			add_location(stop131, file$h, 412, 0, 49972);
    			attr_dev(linearGradient65, "id", "paint65_linear_637_19820");
    			attr_dev(linearGradient65, "x1", "17.3193");
    			attr_dev(linearGradient65, "y1", "229.435");
    			attr_dev(linearGradient65, "x2", "7.28157");
    			attr_dev(linearGradient65, "y2", "293.748");
    			attr_dev(linearGradient65, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient65, file$h, 410, 0, 49811);
    			attr_dev(stop132, "offset", "0.375");
    			attr_dev(stop132, "stop-color", "#F2AC49");
    			add_location(stop132, file$h, 415, 0, 50170);
    			attr_dev(stop133, "offset", "1");
    			attr_dev(stop133, "stop-color", "#FFCD59");
    			add_location(stop133, file$h, 416, 0, 50215);
    			attr_dev(linearGradient66, "id", "paint66_linear_637_19820");
    			attr_dev(linearGradient66, "x1", "13.1294");
    			attr_dev(linearGradient66, "y1", "248.462");
    			attr_dev(linearGradient66, "x2", "116.437");
    			attr_dev(linearGradient66, "y2", "175.749");
    			attr_dev(linearGradient66, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient66, file$h, 414, 0, 50039);
    			attr_dev(stop134, "offset", "0.125");
    			attr_dev(stop134, "stop-color", "#F2AC49");
    			add_location(stop134, file$h, 419, 0, 50406);
    			attr_dev(stop135, "offset", "1");
    			attr_dev(stop135, "stop-color", "#FFCD59");
    			add_location(stop135, file$h, 420, 0, 50451);
    			attr_dev(linearGradient67, "id", "paint67_linear_637_19820");
    			attr_dev(linearGradient67, "x1", "9.39286");
    			attr_dev(linearGradient67, "y1", "256.825");
    			attr_dev(linearGradient67, "x2", "38.9079");
    			attr_dev(linearGradient67, "y2", "169.573");
    			attr_dev(linearGradient67, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient67, file$h, 418, 0, 50275);
    			attr_dev(stop136, "stop-color", "#57661F");
    			add_location(stop136, file$h, 423, 0, 50642);
    			attr_dev(stop137, "offset", "0.791667");
    			attr_dev(stop137, "stop-color", "#9CB23E");
    			add_location(stop137, file$h, 424, 0, 50672);
    			attr_dev(linearGradient68, "id", "paint68_linear_637_19820");
    			attr_dev(linearGradient68, "x1", "296.502");
    			attr_dev(linearGradient68, "y1", "375.553");
    			attr_dev(linearGradient68, "x2", "277.834");
    			attr_dev(linearGradient68, "y2", "783.705");
    			attr_dev(linearGradient68, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient68, file$h, 422, 0, 50511);
    			attr_dev(stop138, "stop-color", "#57661F");
    			add_location(stop138, file$h, 427, 0, 50870);
    			attr_dev(stop139, "offset", "0.791667");
    			attr_dev(stop139, "stop-color", "#9CB23E");
    			add_location(stop139, file$h, 428, 0, 50900);
    			attr_dev(linearGradient69, "id", "paint69_linear_637_19820");
    			attr_dev(linearGradient69, "x1", "363.341");
    			attr_dev(linearGradient69, "y1", "457.369");
    			attr_dev(linearGradient69, "x2", "211.542");
    			attr_dev(linearGradient69, "y2", "647.662");
    			attr_dev(linearGradient69, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient69, file$h, 426, 0, 50739);
    			attr_dev(stop140, "stop-color", "#FFCD59");
    			add_location(stop140, file$h, 431, 0, 51098);
    			attr_dev(stop141, "offset", "0.895833");
    			attr_dev(stop141, "stop-color", "#F2AC49");
    			add_location(stop141, file$h, 432, 0, 51128);
    			attr_dev(linearGradient70, "id", "paint70_linear_637_19820");
    			attr_dev(linearGradient70, "x1", "407.206");
    			attr_dev(linearGradient70, "y1", "279.625");
    			attr_dev(linearGradient70, "x2", "325.656");
    			attr_dev(linearGradient70, "y2", "351.678");
    			attr_dev(linearGradient70, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient70, file$h, 430, 0, 50967);
    			attr_dev(stop142, "stop-color", "#57661F");
    			add_location(stop142, file$h, 435, 0, 51327);
    			attr_dev(stop143, "offset", "0.791667");
    			attr_dev(stop143, "stop-color", "#9CB23E");
    			add_location(stop143, file$h, 436, 0, 51357);
    			attr_dev(linearGradient71, "id", "paint71_linear_637_19820");
    			attr_dev(linearGradient71, "x1", "112.364");
    			attr_dev(linearGradient71, "y1", "355.112");
    			attr_dev(linearGradient71, "x2", "-21.1857");
    			attr_dev(linearGradient71, "y2", "775.787");
    			attr_dev(linearGradient71, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient71, file$h, 434, 0, 51195);
    			attr_dev(stop144, "stop-color", "#F2B091");
    			add_location(stop144, file$h, 439, 0, 51555);
    			attr_dev(stop145, "offset", "0.729167");
    			attr_dev(stop145, "stop-color", "#F26E30");
    			add_location(stop145, file$h, 440, 0, 51585);
    			attr_dev(linearGradient72, "id", "paint72_linear_637_19820");
    			attr_dev(linearGradient72, "x1", "246.613");
    			attr_dev(linearGradient72, "y1", "249.788");
    			attr_dev(linearGradient72, "x2", "109.216");
    			attr_dev(linearGradient72, "y2", "411.786");
    			attr_dev(linearGradient72, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient72, file$h, 438, 0, 51424);
    			attr_dev(stop146, "stop-color", "#F2B091");
    			add_location(stop146, file$h, 443, 0, 51784);
    			attr_dev(stop147, "offset", "0.729167");
    			attr_dev(stop147, "stop-color", "#F26E30");
    			add_location(stop147, file$h, 444, 0, 51814);
    			attr_dev(linearGradient73, "id", "paint73_linear_637_19820");
    			attr_dev(linearGradient73, "x1", "87.3258");
    			attr_dev(linearGradient73, "y1", "223.622");
    			attr_dev(linearGradient73, "x2", "-16.6982");
    			attr_dev(linearGradient73, "y2", "356.265");
    			attr_dev(linearGradient73, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient73, file$h, 442, 0, 51652);
    			attr_dev(stop148, "stop-color", "#F2B091");
    			add_location(stop148, file$h, 447, 0, 52012);
    			attr_dev(stop149, "offset", "0.729167");
    			attr_dev(stop149, "stop-color", "#F26E30");
    			add_location(stop149, file$h, 448, 0, 52042);
    			attr_dev(linearGradient74, "id", "paint74_linear_637_19820");
    			attr_dev(linearGradient74, "x1", "277.364");
    			attr_dev(linearGradient74, "y1", "337.578");
    			attr_dev(linearGradient74, "x2", "136.442");
    			attr_dev(linearGradient74, "y2", "443.664");
    			attr_dev(linearGradient74, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient74, file$h, 446, 0, 51881);
    			attr_dev(stop150, "stop-color", "#F2B091");
    			add_location(stop150, file$h, 451, 0, 52240);
    			attr_dev(stop151, "offset", "0.729167");
    			attr_dev(stop151, "stop-color", "#F26E30");
    			add_location(stop151, file$h, 452, 0, 52270);
    			attr_dev(linearGradient75, "id", "paint75_linear_637_19820");
    			attr_dev(linearGradient75, "x1", "169.089");
    			attr_dev(linearGradient75, "y1", "211.872");
    			attr_dev(linearGradient75, "x2", "39.2634");
    			attr_dev(linearGradient75, "y2", "378.044");
    			attr_dev(linearGradient75, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient75, file$h, 450, 0, 52109);
    			attr_dev(stop152, "stop-color", "#57661F");
    			add_location(stop152, file$h, 455, 0, 52468);
    			attr_dev(stop153, "offset", "0.791667");
    			attr_dev(stop153, "stop-color", "#9CB23E");
    			add_location(stop153, file$h, 456, 0, 52498);
    			attr_dev(linearGradient76, "id", "paint76_linear_637_19820");
    			attr_dev(linearGradient76, "x1", "178.801");
    			attr_dev(linearGradient76, "y1", "467.394");
    			attr_dev(linearGradient76, "x2", "55.7172");
    			attr_dev(linearGradient76, "y2", "700.473");
    			attr_dev(linearGradient76, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient76, file$h, 454, 0, 52337);
    			attr_dev(stop154, "stop-color", "#57661F");
    			add_location(stop154, file$h, 459, 0, 52696);
    			attr_dev(stop155, "offset", "0.791667");
    			attr_dev(stop155, "stop-color", "#9CB23E");
    			add_location(stop155, file$h, 460, 0, 52726);
    			attr_dev(linearGradient77, "id", "paint77_linear_637_19820");
    			attr_dev(linearGradient77, "x1", "998.899");
    			attr_dev(linearGradient77, "y1", "324.442");
    			attr_dev(linearGradient77, "x2", "1043.97");
    			attr_dev(linearGradient77, "y2", "787.832");
    			attr_dev(linearGradient77, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient77, file$h, 458, 0, 52565);
    			attr_dev(stop156, "stop-color", "#F2B091");
    			add_location(stop156, file$h, 463, 0, 52924);
    			attr_dev(stop157, "offset", "0.729167");
    			attr_dev(stop157, "stop-color", "#F26E30");
    			add_location(stop157, file$h, 464, 0, 52954);
    			attr_dev(linearGradient78, "id", "paint78_linear_637_19820");
    			attr_dev(linearGradient78, "x1", "913.401");
    			attr_dev(linearGradient78, "y1", "235.851");
    			attr_dev(linearGradient78, "x2", "973.053");
    			attr_dev(linearGradient78, "y2", "335.658");
    			attr_dev(linearGradient78, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient78, file$h, 462, 0, 52793);
    			attr_dev(stop158, "stop-color", "#F2B091");
    			add_location(stop158, file$h, 467, 0, 53152);
    			attr_dev(stop159, "offset", "0.729167");
    			attr_dev(stop159, "stop-color", "#F26E30");
    			add_location(stop159, file$h, 468, 0, 53182);
    			attr_dev(linearGradient79, "id", "paint79_linear_637_19820");
    			attr_dev(linearGradient79, "x1", "1001.76");
    			attr_dev(linearGradient79, "y1", "236.018");
    			attr_dev(linearGradient79, "x2", "1046.03");
    			attr_dev(linearGradient79, "y2", "316.979");
    			attr_dev(linearGradient79, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient79, file$h, 466, 0, 53021);
    			attr_dev(stop160, "stop-color", "#F2B091");
    			add_location(stop160, file$h, 471, 0, 53380);
    			attr_dev(stop161, "offset", "0.729167");
    			attr_dev(stop161, "stop-color", "#F26E30");
    			add_location(stop161, file$h, 472, 0, 53410);
    			attr_dev(linearGradient80, "id", "paint80_linear_637_19820");
    			attr_dev(linearGradient80, "x1", "888.917");
    			attr_dev(linearGradient80, "y1", "280.496");
    			attr_dev(linearGradient80, "x2", "955.491");
    			attr_dev(linearGradient80, "y2", "350.427");
    			attr_dev(linearGradient80, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient80, file$h, 470, 0, 53249);
    			attr_dev(stop162, "stop-color", "#F2B091");
    			add_location(stop162, file$h, 475, 0, 53608);
    			attr_dev(stop163, "offset", "0.729167");
    			attr_dev(stop163, "stop-color", "#F26E30");
    			add_location(stop163, file$h, 476, 0, 53638);
    			attr_dev(linearGradient81, "id", "paint81_linear_637_19820");
    			attr_dev(linearGradient81, "x1", "958.665");
    			attr_dev(linearGradient81, "y1", "222.336");
    			attr_dev(linearGradient81, "x2", "1013.85");
    			attr_dev(linearGradient81, "y2", "323.716");
    			attr_dev(linearGradient81, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient81, file$h, 474, 0, 53477);
    			attr_dev(stop164, "stop-color", "#57661F");
    			add_location(stop164, file$h, 479, 0, 53836);
    			attr_dev(stop165, "offset", "0.791667");
    			attr_dev(stop165, "stop-color", "#9CB23E");
    			add_location(stop165, file$h, 480, 0, 53866);
    			attr_dev(linearGradient82, "id", "paint82_linear_637_19820");
    			attr_dev(linearGradient82, "x1", "1057.67");
    			attr_dev(linearGradient82, "y1", "326.276");
    			attr_dev(linearGradient82, "x2", "1153.25");
    			attr_dev(linearGradient82, "y2", "543.587");
    			attr_dev(linearGradient82, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient82, file$h, 478, 0, 53705);
    			attr_dev(stop166, "stop-color", "#57661F");
    			add_location(stop166, file$h, 483, 0, 54061);
    			attr_dev(stop167, "offset", "0.791667");
    			attr_dev(stop167, "stop-color", "#9CB23E");
    			add_location(stop167, file$h, 484, 0, 54091);
    			attr_dev(linearGradient83, "id", "paint83_linear_637_19820");
    			attr_dev(linearGradient83, "x1", "1170");
    			attr_dev(linearGradient83, "y1", "477.763");
    			attr_dev(linearGradient83, "x2", "1158.34");
    			attr_dev(linearGradient83, "y2", "900.468");
    			attr_dev(linearGradient83, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient83, file$h, 482, 0, 53933);
    			attr_dev(stop168, "stop-color", "#57661F");
    			add_location(stop168, file$h, 487, 0, 54289);
    			attr_dev(stop169, "offset", "0.791667");
    			attr_dev(stop169, "stop-color", "#9CB23E");
    			add_location(stop169, file$h, 488, 0, 54319);
    			attr_dev(linearGradient84, "id", "paint84_linear_637_19820");
    			attr_dev(linearGradient84, "x1", "1229.26");
    			attr_dev(linearGradient84, "y1", "379.375");
    			attr_dev(linearGradient84, "x2", "1444.87");
    			attr_dev(linearGradient84, "y2", "625.504");
    			attr_dev(linearGradient84, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient84, file$h, 486, 0, 54158);
    			attr_dev(stop170, "stop-color", "#57661F");
    			add_location(stop170, file$h, 491, 0, 54516);
    			attr_dev(stop171, "offset", "0.791667");
    			attr_dev(stop171, "stop-color", "#9CB23E");
    			add_location(stop171, file$h, 492, 0, 54546);
    			attr_dev(linearGradient85, "id", "paint85_linear_637_19820");
    			attr_dev(linearGradient85, "x1", "1079.91");
    			attr_dev(linearGradient85, "y1", "475.777");
    			attr_dev(linearGradient85, "x2", "1185.8");
    			attr_dev(linearGradient85, "y2", "813.588");
    			attr_dev(linearGradient85, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient85, file$h, 490, 0, 54386);
    			attr_dev(stop172, "offset", "0.541667");
    			attr_dev(stop172, "stop-color", "#E85151");
    			add_location(stop172, file$h, 495, 0, 54743);
    			attr_dev(stop173, "offset", "0.994792");
    			attr_dev(stop173, "stop-color", "#B83535");
    			add_location(stop173, file$h, 496, 0, 54791);
    			attr_dev(linearGradient86, "id", "paint86_linear_637_19820");
    			attr_dev(linearGradient86, "x1", "1169.4");
    			attr_dev(linearGradient86, "y1", "142.273");
    			attr_dev(linearGradient86, "x2", "1143.83");
    			attr_dev(linearGradient86, "y2", "392.514");
    			attr_dev(linearGradient86, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient86, file$h, 494, 0, 54613);
    			attr_dev(stop174, "offset", "0.541667");
    			attr_dev(stop174, "stop-color", "#E85151");
    			add_location(stop174, file$h, 499, 0, 54989);
    			attr_dev(stop175, "offset", "0.994792");
    			attr_dev(stop175, "stop-color", "#B83535");
    			add_location(stop175, file$h, 500, 0, 55037);
    			attr_dev(linearGradient87, "id", "paint87_linear_637_19820");
    			attr_dev(linearGradient87, "x1", "921.397");
    			attr_dev(linearGradient87, "y1", "217.678");
    			attr_dev(linearGradient87, "x2", "1113.97");
    			attr_dev(linearGradient87, "y2", "418.502");
    			attr_dev(linearGradient87, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient87, file$h, 498, 0, 54858);
    			attr_dev(stop176, "stop-color", "#57661F");
    			add_location(stop176, file$h, 503, 0, 55235);
    			attr_dev(stop177, "offset", "0.791667");
    			attr_dev(stop177, "stop-color", "#9CB23E");
    			add_location(stop177, file$h, 504, 0, 55265);
    			attr_dev(linearGradient88, "id", "paint88_linear_637_19820");
    			attr_dev(linearGradient88, "x1", "610.276");
    			attr_dev(linearGradient88, "y1", "365.487");
    			attr_dev(linearGradient88, "x2", "614.602");
    			attr_dev(linearGradient88, "y2", "528.207");
    			attr_dev(linearGradient88, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient88, file$h, 502, 0, 55104);
    			attr_dev(stop178, "offset", "0.375");
    			attr_dev(stop178, "stop-color", "#F2AC49");
    			add_location(stop178, file$h, 507, 0, 55462);
    			attr_dev(stop179, "offset", "1");
    			attr_dev(stop179, "stop-color", "#FFCD59");
    			add_location(stop179, file$h, 508, 0, 55507);
    			attr_dev(linearGradient89, "id", "paint89_linear_637_19820");
    			attr_dev(linearGradient89, "x1", "616.31");
    			attr_dev(linearGradient89, "y1", "372.009");
    			attr_dev(linearGradient89, "x2", "685.593");
    			attr_dev(linearGradient89, "y2", "304.903");
    			attr_dev(linearGradient89, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient89, file$h, 506, 0, 55332);
    			attr_dev(stop180, "offset", "0.125");
    			attr_dev(stop180, "stop-color", "#F2AC49");
    			add_location(stop180, file$h, 511, 0, 55698);
    			attr_dev(stop181, "offset", "1");
    			attr_dev(stop181, "stop-color", "#FFCD59");
    			add_location(stop181, file$h, 512, 0, 55743);
    			attr_dev(linearGradient90, "id", "paint90_linear_637_19820");
    			attr_dev(linearGradient90, "x1", "615.233");
    			attr_dev(linearGradient90, "y1", "378.546");
    			attr_dev(linearGradient90, "x2", "626.874");
    			attr_dev(linearGradient90, "y2", "309.806");
    			attr_dev(linearGradient90, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient90, file$h, 510, 0, 55567);
    			attr_dev(stop182, "stop-color", "#57661F");
    			add_location(stop182, file$h, 515, 0, 55934);
    			attr_dev(stop183, "offset", "0.791667");
    			attr_dev(stop183, "stop-color", "#9CB23E");
    			add_location(stop183, file$h, 516, 0, 55964);
    			attr_dev(linearGradient91, "id", "paint91_linear_637_19820");
    			attr_dev(linearGradient91, "x1", "455.907");
    			attr_dev(linearGradient91, "y1", "318.123");
    			attr_dev(linearGradient91, "x2", "528.642");
    			attr_dev(linearGradient91, "y2", "520.694");
    			attr_dev(linearGradient91, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient91, file$h, 514, 0, 55803);
    			attr_dev(stop184, "stop-color", "#F2B091");
    			add_location(stop184, file$h, 519, 0, 56162);
    			attr_dev(stop185, "offset", "0.729167");
    			attr_dev(stop185, "stop-color", "#F26E30");
    			add_location(stop185, file$h, 520, 0, 56192);
    			attr_dev(linearGradient92, "id", "paint92_linear_637_19820");
    			attr_dev(linearGradient92, "x1", "494.522");
    			attr_dev(linearGradient92, "y1", "278.586");
    			attr_dev(linearGradient92, "x2", "481.179");
    			attr_dev(linearGradient92, "y2", "375.228");
    			attr_dev(linearGradient92, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient92, file$h, 518, 0, 56031);
    			attr_dev(stop186, "stop-color", "#F2B091");
    			add_location(stop186, file$h, 523, 0, 56390);
    			attr_dev(stop187, "offset", "0.729167");
    			attr_dev(stop187, "stop-color", "#F26E30");
    			add_location(stop187, file$h, 524, 0, 56420);
    			attr_dev(linearGradient93, "id", "paint93_linear_637_19820");
    			attr_dev(linearGradient93, "x1", "425.564");
    			attr_dev(linearGradient93, "y1", "307.581");
    			attr_dev(linearGradient93, "x2", "417.932");
    			attr_dev(linearGradient93, "y2", "384.555");
    			attr_dev(linearGradient93, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient93, file$h, 522, 0, 56259);
    			attr_dev(stop188, "stop-color", "#F2B091");
    			add_location(stop188, file$h, 527, 0, 56617);
    			attr_dev(stop189, "offset", "0.729167");
    			attr_dev(stop189, "stop-color", "#F26E30");
    			add_location(stop189, file$h, 528, 0, 56647);
    			attr_dev(linearGradient94, "id", "paint94_linear_637_19820");
    			attr_dev(linearGradient94, "x1", "527.523");
    			attr_dev(linearGradient94, "y1", "304.961");
    			attr_dev(linearGradient94, "x2", "498.787");
    			attr_dev(linearGradient94, "y2", "381.13");
    			attr_dev(linearGradient94, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient94, file$h, 526, 0, 56487);
    			attr_dev(stop190, "stop-color", "#F2B091");
    			add_location(stop190, file$h, 531, 0, 56845);
    			attr_dev(stop191, "offset", "0.729167");
    			attr_dev(stop191, "stop-color", "#F26E30");
    			add_location(stop191, file$h, 532, 0, 56875);
    			attr_dev(linearGradient95, "id", "paint95_linear_637_19820");
    			attr_dev(linearGradient95, "x1", "454.969");
    			attr_dev(linearGradient95, "y1", "282.966");
    			attr_dev(linearGradient95, "x2", "445.599");
    			attr_dev(linearGradient95, "y2", "379.272");
    			attr_dev(linearGradient95, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient95, file$h, 530, 0, 56714);
    			attr_dev(stop192, "stop-color", "#57661F");
    			add_location(stop192, file$h, 535, 0, 57071);
    			attr_dev(stop193, "offset", "0.791667");
    			attr_dev(stop193, "stop-color", "#9CB23E");
    			add_location(stop193, file$h, 536, 0, 57101);
    			attr_dev(linearGradient96, "id", "paint96_linear_637_19820");
    			attr_dev(linearGradient96, "x1", "391.375");
    			attr_dev(linearGradient96, "y1", "365.146");
    			attr_dev(linearGradient96, "x2", "517.71");
    			attr_dev(linearGradient96, "y2", "505.06");
    			attr_dev(linearGradient96, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient96, file$h, 534, 0, 56942);
    			attr_dev(stop194, "stop-color", "#57661F");
    			add_location(stop194, file$h, 539, 0, 57298);
    			attr_dev(stop195, "offset", "0.791667");
    			attr_dev(stop195, "stop-color", "#9CB23E");
    			add_location(stop195, file$h, 540, 0, 57328);
    			attr_dev(linearGradient97, "id", "paint97_linear_637_19820");
    			attr_dev(linearGradient97, "x1", "767.58");
    			attr_dev(linearGradient97, "y1", "342.534");
    			attr_dev(linearGradient97, "x2", "815.896");
    			attr_dev(linearGradient97, "y2", "557.668");
    			attr_dev(linearGradient97, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient97, file$h, 538, 0, 57168);
    			attr_dev(stop196, "stop-color", "#F2B091");
    			add_location(stop196, file$h, 543, 0, 57526);
    			attr_dev(stop197, "offset", "0.729167");
    			attr_dev(stop197, "stop-color", "#F26E30");
    			add_location(stop197, file$h, 544, 0, 57556);
    			attr_dev(linearGradient98, "id", "paint98_linear_637_19820");
    			attr_dev(linearGradient98, "x1", "715.413");
    			attr_dev(linearGradient98, "y1", "299.313");
    			attr_dev(linearGradient98, "x2", "757.004");
    			attr_dev(linearGradient98, "y2", "354.375");
    			attr_dev(linearGradient98, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient98, file$h, 542, 0, 57395);
    			attr_dev(stop198, "stop-color", "#F2B091");
    			add_location(stop198, file$h, 547, 0, 57753);
    			attr_dev(stop199, "offset", "0.729167");
    			attr_dev(stop199, "stop-color", "#F26E30");
    			add_location(stop199, file$h, 548, 0, 57783);
    			attr_dev(linearGradient99, "id", "paint99_linear_637_19820");
    			attr_dev(linearGradient99, "x1", "767.555");
    			attr_dev(linearGradient99, "y1", "293.748");
    			attr_dev(linearGradient99, "x2", "798.86");
    			attr_dev(linearGradient99, "y2", "338.677");
    			attr_dev(linearGradient99, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient99, file$h, 546, 0, 57623);
    			attr_dev(stop200, "stop-color", "#F2B091");
    			add_location(stop200, file$h, 551, 0, 57982);
    			attr_dev(stop201, "offset", "0.729167");
    			attr_dev(stop201, "stop-color", "#F26E30");
    			add_location(stop201, file$h, 552, 0, 58012);
    			attr_dev(linearGradient100, "id", "paint100_linear_637_19820");
    			attr_dev(linearGradient100, "x1", "703.829");
    			attr_dev(linearGradient100, "y1", "327.222");
    			attr_dev(linearGradient100, "x2", "747.589");
    			attr_dev(linearGradient100, "y2", "364.214");
    			attr_dev(linearGradient100, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient100, file$h, 550, 0, 57850);
    			attr_dev(stop202, "stop-color", "#F2B091");
    			add_location(stop202, file$h, 555, 0, 58211);
    			attr_dev(stop203, "offset", "0.729167");
    			attr_dev(stop203, "stop-color", "#F26E30");
    			add_location(stop203, file$h, 556, 0, 58241);
    			attr_dev(linearGradient101, "id", "paint101_linear_637_19820");
    			attr_dev(linearGradient101, "x1", "741.252");
    			attr_dev(linearGradient101, "y1", "288.438");
    			attr_dev(linearGradient101, "x2", "780.311");
    			attr_dev(linearGradient101, "y2", "344.714");
    			attr_dev(linearGradient101, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient101, file$h, 554, 0, 58079);
    			attr_dev(stop204, "stop-color", "#57661F");
    			add_location(stop204, file$h, 559, 0, 58440);
    			attr_dev(stop205, "offset", "0.791667");
    			attr_dev(stop205, "stop-color", "#9CB23E");
    			add_location(stop205, file$h, 560, 0, 58470);
    			attr_dev(linearGradient102, "id", "paint102_linear_637_19820");
    			attr_dev(linearGradient102, "x1", "797.585");
    			attr_dev(linearGradient102, "y1", "300.668");
    			attr_dev(linearGradient102, "x2", "846.932");
    			attr_dev(linearGradient102, "y2", "461.373");
    			attr_dev(linearGradient102, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient102, file$h, 558, 0, 58308);
    			attr_dev(stop206, "stop-color", "#57661F");
    			add_location(stop206, file$h, 563, 0, 58669);
    			attr_dev(stop207, "offset", "0.791667");
    			attr_dev(stop207, "stop-color", "#9CB23E");
    			add_location(stop207, file$h, 564, 0, 58699);
    			attr_dev(linearGradient103, "id", "paint103_linear_637_19820");
    			attr_dev(linearGradient103, "x1", "203.267");
    			attr_dev(linearGradient103, "y1", "471.959");
    			attr_dev(linearGradient103, "x2", "129.437");
    			attr_dev(linearGradient103, "y2", "900.535");
    			attr_dev(linearGradient103, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient103, file$h, 562, 0, 58537);
    			attr_dev(stop208, "stop-color", "#FFCD59");
    			add_location(stop208, file$h, 567, 0, 58898);
    			attr_dev(stop209, "offset", "0.895833");
    			attr_dev(stop209, "stop-color", "#F2AC49");
    			add_location(stop209, file$h, 568, 0, 58928);
    			attr_dev(linearGradient104, "id", "paint104_linear_637_19820");
    			attr_dev(linearGradient104, "x1", "266.004");
    			attr_dev(linearGradient104, "y1", "397.653");
    			attr_dev(linearGradient104, "x2", "249.352");
    			attr_dev(linearGradient104, "y2", "442.277");
    			attr_dev(linearGradient104, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient104, file$h, 566, 0, 58766);
    			attr_dev(stop210, "stop-color", "#57661F");
    			add_location(stop210, file$h, 571, 0, 59127);
    			attr_dev(stop211, "offset", "0.791667");
    			attr_dev(stop211, "stop-color", "#9CB23E");
    			add_location(stop211, file$h, 572, 0, 59157);
    			attr_dev(linearGradient105, "id", "paint105_linear_637_19820");
    			attr_dev(linearGradient105, "x1", "532.584");
    			attr_dev(linearGradient105, "y1", "355.728");
    			attr_dev(linearGradient105, "x2", "614.062");
    			attr_dev(linearGradient105, "y2", "572.328");
    			attr_dev(linearGradient105, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient105, file$h, 570, 0, 58995);
    			attr_dev(stop212, "stop-color", "#FFCD59");
    			add_location(stop212, file$h, 575, 0, 59355);
    			attr_dev(stop213, "offset", "0.895833");
    			attr_dev(stop213, "stop-color", "#F2AC49");
    			add_location(stop213, file$h, 576, 0, 59385);
    			attr_dev(linearGradient106, "id", "paint106_linear_637_19820");
    			attr_dev(linearGradient106, "x1", "542.222");
    			attr_dev(linearGradient106, "y1", "312.357");
    			attr_dev(linearGradient106, "x2", "546.59");
    			attr_dev(linearGradient106, "y2", "337.323");
    			attr_dev(linearGradient106, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient106, file$h, 574, 0, 59224);
    			attr_dev(stop214, "stop-color", "#57661F");
    			add_location(stop214, file$h, 579, 0, 59583);
    			attr_dev(stop215, "offset", "0.791667");
    			attr_dev(stop215, "stop-color", "#9CB23E");
    			add_location(stop215, file$h, 580, 0, 59613);
    			attr_dev(linearGradient107, "id", "paint107_linear_637_19820");
    			attr_dev(linearGradient107, "x1", "844.182");
    			attr_dev(linearGradient107, "y1", "386.43");
    			attr_dev(linearGradient107, "x2", "903.647");
    			attr_dev(linearGradient107, "y2", "568.652");
    			attr_dev(linearGradient107, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient107, file$h, 578, 0, 59452);
    			attr_dev(stop216, "offset", "0.541667");
    			attr_dev(stop216, "stop-color", "#E85151");
    			add_location(stop216, file$h, 583, 0, 59812);
    			attr_dev(stop217, "offset", "0.994792");
    			attr_dev(stop217, "stop-color", "#B83535");
    			add_location(stop217, file$h, 584, 0, 59860);
    			attr_dev(linearGradient108, "id", "paint108_linear_637_19820");
    			attr_dev(linearGradient108, "x1", "798.248");
    			attr_dev(linearGradient108, "y1", "249.251");
    			attr_dev(linearGradient108, "x2", "846.117");
    			attr_dev(linearGradient108, "y2", "341.305");
    			attr_dev(linearGradient108, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient108, file$h, 582, 0, 59680);
    			attr_dev(stop218, "offset", "0.541667");
    			attr_dev(stop218, "stop-color", "#E85151");
    			add_location(stop218, file$h, 587, 0, 60059);
    			attr_dev(stop219, "offset", "0.994792");
    			attr_dev(stop219, "stop-color", "#B83535");
    			add_location(stop219, file$h, 588, 0, 60107);
    			attr_dev(linearGradient109, "id", "paint109_linear_637_19820");
    			attr_dev(linearGradient109, "x1", "904.805");
    			attr_dev(linearGradient109, "y1", "240.437");
    			attr_dev(linearGradient109, "x2", "861.519");
    			attr_dev(linearGradient109, "y2", "346.727");
    			attr_dev(linearGradient109, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient109, file$h, 586, 0, 59927);
    			attr_dev(stop220, "stop-color", "#57661F");
    			add_location(stop220, file$h, 591, 0, 60306);
    			attr_dev(stop221, "offset", "0.791667");
    			attr_dev(stop221, "stop-color", "#9CB23E");
    			add_location(stop221, file$h, 592, 0, 60336);
    			attr_dev(linearGradient110, "id", "paint110_linear_637_19820");
    			attr_dev(linearGradient110, "x1", "980.899");
    			attr_dev(linearGradient110, "y1", "428.472");
    			attr_dev(linearGradient110, "x2", "1052.47");
    			attr_dev(linearGradient110, "y2", "793.328");
    			attr_dev(linearGradient110, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient110, file$h, 590, 0, 60174);
    			attr_dev(stop222, "stop-color", "#57661F");
    			add_location(stop222, file$h, 595, 0, 60535);
    			attr_dev(stop223, "offset", "0.791667");
    			attr_dev(stop223, "stop-color", "#9CB23E");
    			add_location(stop223, file$h, 596, 0, 60565);
    			attr_dev(linearGradient111, "id", "paint111_linear_637_19820");
    			attr_dev(linearGradient111, "x1", "937.831");
    			attr_dev(linearGradient111, "y1", "466.763");
    			attr_dev(linearGradient111, "x2", "963.396");
    			attr_dev(linearGradient111, "y2", "683.624");
    			attr_dev(linearGradient111, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient111, file$h, 594, 0, 60403);
    			attr_dev(stop224, "stop-color", "#FFCD59");
    			add_location(stop224, file$h, 599, 0, 60764);
    			attr_dev(stop225, "offset", "0.895833");
    			attr_dev(stop225, "stop-color", "#F2AC49");
    			add_location(stop225, file$h, 600, 0, 60794);
    			attr_dev(linearGradient112, "id", "paint112_linear_637_19820");
    			attr_dev(linearGradient112, "x1", "926.866");
    			attr_dev(linearGradient112, "y1", "363.653");
    			attr_dev(linearGradient112, "x2", "943.519");
    			attr_dev(linearGradient112, "y2", "408.276");
    			attr_dev(linearGradient112, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient112, file$h, 598, 0, 60632);
    			attr_dev(stop226, "stop-color", "#FFCD59");
    			add_location(stop226, file$h, 603, 0, 60994);
    			attr_dev(stop227, "offset", "0.895833");
    			attr_dev(stop227, "stop-color", "#F2AC49");
    			add_location(stop227, file$h, 604, 0, 61024);
    			attr_dev(linearGradient113, "id", "paint113_linear_637_19820");
    			attr_dev(linearGradient113, "x1", "1303.39");
    			attr_dev(linearGradient113, "y1", "-1174.84");
    			attr_dev(linearGradient113, "x2", "692.03");
    			attr_dev(linearGradient113, "y2", "-811.298");
    			attr_dev(linearGradient113, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient113, file$h, 602, 0, 60861);
    			attr_dev(stop228, "offset", "0.541667");
    			attr_dev(stop228, "stop-color", "#E85151");
    			add_location(stop228, file$h, 607, 0, 61224);
    			attr_dev(stop229, "offset", "0.994792");
    			attr_dev(stop229, "stop-color", "#B83535");
    			add_location(stop229, file$h, 608, 0, 61272);
    			attr_dev(linearGradient114, "id", "paint114_linear_637_19820");
    			attr_dev(linearGradient114, "x1", "103.204");
    			attr_dev(linearGradient114, "y1", "153.568");
    			attr_dev(linearGradient114, "x2", "-71.3367");
    			attr_dev(linearGradient114, "y2", "346.942");
    			attr_dev(linearGradient114, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient114, file$h, 606, 0, 61091);
    			add_location(defs, file$h, 149, 0, 34788);
    			attr_dev(svg, "viewBox", "0 0 1280 900");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "top", "48vh");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "100vw");
    			set_style(svg, "z-index", "1");
    			add_location(svg, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, mask);
    			append_dev(mask, rect);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    			append_dev(g, path4);
    			append_dev(g, path5);
    			append_dev(g, path6);
    			append_dev(g, path7);
    			append_dev(g, path8);
    			append_dev(g, path9);
    			append_dev(g, path10);
    			append_dev(g, path11);
    			append_dev(g, path12);
    			append_dev(g, path13);
    			append_dev(g, path14);
    			append_dev(g, path15);
    			append_dev(g, path16);
    			append_dev(g, path17);
    			append_dev(g, path18);
    			append_dev(g, path19);
    			append_dev(g, path20);
    			append_dev(g, path21);
    			append_dev(g, path22);
    			append_dev(g, path23);
    			append_dev(g, path24);
    			append_dev(g, path25);
    			append_dev(g, path26);
    			append_dev(g, path27);
    			append_dev(g, path28);
    			append_dev(g, path29);
    			append_dev(g, path30);
    			append_dev(g, path31);
    			append_dev(g, path32);
    			append_dev(g, path33);
    			append_dev(g, path34);
    			append_dev(g, path35);
    			append_dev(g, path36);
    			append_dev(g, path37);
    			append_dev(g, path38);
    			append_dev(g, path39);
    			append_dev(g, path40);
    			append_dev(g, path41);
    			append_dev(g, path42);
    			append_dev(g, path43);
    			append_dev(g, path44);
    			append_dev(g, path45);
    			append_dev(g, path46);
    			append_dev(g, path47);
    			append_dev(g, path48);
    			append_dev(g, path49);
    			append_dev(g, path50);
    			append_dev(g, path51);
    			append_dev(g, path52);
    			append_dev(g, path53);
    			append_dev(g, path54);
    			append_dev(g, path55);
    			append_dev(g, path56);
    			append_dev(g, path57);
    			append_dev(g, path58);
    			append_dev(g, path59);
    			append_dev(g, path60);
    			append_dev(g, path61);
    			append_dev(g, path62);
    			append_dev(g, path63);
    			append_dev(g, path64);
    			append_dev(g, path65);
    			append_dev(g, path66);
    			append_dev(g, path67);
    			append_dev(g, path68);
    			append_dev(g, path69);
    			append_dev(g, path70);
    			append_dev(g, path71);
    			append_dev(g, path72);
    			append_dev(g, path73);
    			append_dev(g, path74);
    			append_dev(g, path75);
    			append_dev(g, path76);
    			append_dev(g, path77);
    			append_dev(g, path78);
    			append_dev(g, path79);
    			append_dev(g, path80);
    			append_dev(g, path81);
    			append_dev(g, path82);
    			append_dev(g, path83);
    			append_dev(g, path84);
    			append_dev(g, path85);
    			append_dev(g, path86);
    			append_dev(g, path87);
    			append_dev(g, path88);
    			append_dev(g, path89);
    			append_dev(g, path90);
    			append_dev(g, path91);
    			append_dev(g, path92);
    			append_dev(g, path93);
    			append_dev(g, path94);
    			append_dev(g, path95);
    			append_dev(g, path96);
    			append_dev(g, path97);
    			append_dev(g, path98);
    			append_dev(g, path99);
    			append_dev(g, path100);
    			append_dev(g, path101);
    			append_dev(g, path102);
    			append_dev(g, path103);
    			append_dev(g, path104);
    			append_dev(g, path105);
    			append_dev(g, path106);
    			append_dev(g, path107);
    			append_dev(g, path108);
    			append_dev(g, path109);
    			append_dev(g, path110);
    			append_dev(g, path111);
    			append_dev(g, path112);
    			append_dev(g, path113);
    			append_dev(g, path114);
    			append_dev(g, path115);
    			append_dev(g, path116);
    			append_dev(g, path117);
    			append_dev(g, path118);
    			append_dev(g, path119);
    			append_dev(g, path120);
    			append_dev(g, path121);
    			append_dev(g, path122);
    			append_dev(g, path123);
    			append_dev(g, path124);
    			append_dev(g, path125);
    			append_dev(g, path126);
    			append_dev(g, path127);
    			append_dev(g, path128);
    			append_dev(g, path129);
    			append_dev(g, path130);
    			append_dev(g, path131);
    			append_dev(g, path132);
    			append_dev(g, path133);
    			append_dev(g, path134);
    			append_dev(g, path135);
    			append_dev(g, path136);
    			append_dev(g, path137);
    			append_dev(g, path138);
    			append_dev(g, path139);
    			append_dev(g, path140);
    			append_dev(g, path141);
    			append_dev(g, path142);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(defs, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    			append_dev(defs, linearGradient3);
    			append_dev(linearGradient3, stop6);
    			append_dev(linearGradient3, stop7);
    			append_dev(defs, linearGradient4);
    			append_dev(linearGradient4, stop8);
    			append_dev(linearGradient4, stop9);
    			append_dev(defs, linearGradient5);
    			append_dev(linearGradient5, stop10);
    			append_dev(linearGradient5, stop11);
    			append_dev(defs, linearGradient6);
    			append_dev(linearGradient6, stop12);
    			append_dev(linearGradient6, stop13);
    			append_dev(defs, linearGradient7);
    			append_dev(linearGradient7, stop14);
    			append_dev(linearGradient7, stop15);
    			append_dev(defs, linearGradient8);
    			append_dev(linearGradient8, stop16);
    			append_dev(linearGradient8, stop17);
    			append_dev(defs, linearGradient9);
    			append_dev(linearGradient9, stop18);
    			append_dev(linearGradient9, stop19);
    			append_dev(defs, linearGradient10);
    			append_dev(linearGradient10, stop20);
    			append_dev(linearGradient10, stop21);
    			append_dev(defs, linearGradient11);
    			append_dev(linearGradient11, stop22);
    			append_dev(linearGradient11, stop23);
    			append_dev(defs, linearGradient12);
    			append_dev(linearGradient12, stop24);
    			append_dev(linearGradient12, stop25);
    			append_dev(defs, linearGradient13);
    			append_dev(linearGradient13, stop26);
    			append_dev(linearGradient13, stop27);
    			append_dev(defs, linearGradient14);
    			append_dev(linearGradient14, stop28);
    			append_dev(linearGradient14, stop29);
    			append_dev(defs, linearGradient15);
    			append_dev(linearGradient15, stop30);
    			append_dev(linearGradient15, stop31);
    			append_dev(defs, linearGradient16);
    			append_dev(linearGradient16, stop32);
    			append_dev(linearGradient16, stop33);
    			append_dev(defs, linearGradient17);
    			append_dev(linearGradient17, stop34);
    			append_dev(linearGradient17, stop35);
    			append_dev(defs, linearGradient18);
    			append_dev(linearGradient18, stop36);
    			append_dev(linearGradient18, stop37);
    			append_dev(defs, linearGradient19);
    			append_dev(linearGradient19, stop38);
    			append_dev(linearGradient19, stop39);
    			append_dev(defs, linearGradient20);
    			append_dev(linearGradient20, stop40);
    			append_dev(linearGradient20, stop41);
    			append_dev(defs, linearGradient21);
    			append_dev(linearGradient21, stop42);
    			append_dev(linearGradient21, stop43);
    			append_dev(defs, linearGradient22);
    			append_dev(linearGradient22, stop44);
    			append_dev(linearGradient22, stop45);
    			append_dev(defs, linearGradient23);
    			append_dev(linearGradient23, stop46);
    			append_dev(linearGradient23, stop47);
    			append_dev(defs, linearGradient24);
    			append_dev(linearGradient24, stop48);
    			append_dev(linearGradient24, stop49);
    			append_dev(defs, linearGradient25);
    			append_dev(linearGradient25, stop50);
    			append_dev(linearGradient25, stop51);
    			append_dev(defs, linearGradient26);
    			append_dev(linearGradient26, stop52);
    			append_dev(linearGradient26, stop53);
    			append_dev(defs, linearGradient27);
    			append_dev(linearGradient27, stop54);
    			append_dev(linearGradient27, stop55);
    			append_dev(defs, linearGradient28);
    			append_dev(linearGradient28, stop56);
    			append_dev(linearGradient28, stop57);
    			append_dev(defs, linearGradient29);
    			append_dev(linearGradient29, stop58);
    			append_dev(linearGradient29, stop59);
    			append_dev(defs, linearGradient30);
    			append_dev(linearGradient30, stop60);
    			append_dev(linearGradient30, stop61);
    			append_dev(defs, linearGradient31);
    			append_dev(linearGradient31, stop62);
    			append_dev(linearGradient31, stop63);
    			append_dev(defs, linearGradient32);
    			append_dev(linearGradient32, stop64);
    			append_dev(linearGradient32, stop65);
    			append_dev(defs, linearGradient33);
    			append_dev(linearGradient33, stop66);
    			append_dev(linearGradient33, stop67);
    			append_dev(defs, linearGradient34);
    			append_dev(linearGradient34, stop68);
    			append_dev(linearGradient34, stop69);
    			append_dev(defs, linearGradient35);
    			append_dev(linearGradient35, stop70);
    			append_dev(linearGradient35, stop71);
    			append_dev(defs, linearGradient36);
    			append_dev(linearGradient36, stop72);
    			append_dev(linearGradient36, stop73);
    			append_dev(defs, linearGradient37);
    			append_dev(linearGradient37, stop74);
    			append_dev(linearGradient37, stop75);
    			append_dev(defs, linearGradient38);
    			append_dev(linearGradient38, stop76);
    			append_dev(linearGradient38, stop77);
    			append_dev(defs, linearGradient39);
    			append_dev(linearGradient39, stop78);
    			append_dev(linearGradient39, stop79);
    			append_dev(defs, linearGradient40);
    			append_dev(linearGradient40, stop80);
    			append_dev(linearGradient40, stop81);
    			append_dev(defs, linearGradient41);
    			append_dev(linearGradient41, stop82);
    			append_dev(linearGradient41, stop83);
    			append_dev(defs, linearGradient42);
    			append_dev(linearGradient42, stop84);
    			append_dev(linearGradient42, stop85);
    			append_dev(defs, linearGradient43);
    			append_dev(linearGradient43, stop86);
    			append_dev(linearGradient43, stop87);
    			append_dev(defs, linearGradient44);
    			append_dev(linearGradient44, stop88);
    			append_dev(linearGradient44, stop89);
    			append_dev(defs, linearGradient45);
    			append_dev(linearGradient45, stop90);
    			append_dev(linearGradient45, stop91);
    			append_dev(defs, linearGradient46);
    			append_dev(linearGradient46, stop92);
    			append_dev(linearGradient46, stop93);
    			append_dev(defs, linearGradient47);
    			append_dev(linearGradient47, stop94);
    			append_dev(linearGradient47, stop95);
    			append_dev(defs, linearGradient48);
    			append_dev(linearGradient48, stop96);
    			append_dev(linearGradient48, stop97);
    			append_dev(defs, linearGradient49);
    			append_dev(linearGradient49, stop98);
    			append_dev(linearGradient49, stop99);
    			append_dev(defs, linearGradient50);
    			append_dev(linearGradient50, stop100);
    			append_dev(linearGradient50, stop101);
    			append_dev(defs, linearGradient51);
    			append_dev(linearGradient51, stop102);
    			append_dev(linearGradient51, stop103);
    			append_dev(defs, linearGradient52);
    			append_dev(linearGradient52, stop104);
    			append_dev(linearGradient52, stop105);
    			append_dev(defs, linearGradient53);
    			append_dev(linearGradient53, stop106);
    			append_dev(linearGradient53, stop107);
    			append_dev(defs, linearGradient54);
    			append_dev(linearGradient54, stop108);
    			append_dev(linearGradient54, stop109);
    			append_dev(defs, linearGradient55);
    			append_dev(linearGradient55, stop110);
    			append_dev(linearGradient55, stop111);
    			append_dev(defs, linearGradient56);
    			append_dev(linearGradient56, stop112);
    			append_dev(linearGradient56, stop113);
    			append_dev(defs, linearGradient57);
    			append_dev(linearGradient57, stop114);
    			append_dev(linearGradient57, stop115);
    			append_dev(defs, linearGradient58);
    			append_dev(linearGradient58, stop116);
    			append_dev(linearGradient58, stop117);
    			append_dev(defs, linearGradient59);
    			append_dev(linearGradient59, stop118);
    			append_dev(linearGradient59, stop119);
    			append_dev(defs, linearGradient60);
    			append_dev(linearGradient60, stop120);
    			append_dev(linearGradient60, stop121);
    			append_dev(defs, linearGradient61);
    			append_dev(linearGradient61, stop122);
    			append_dev(linearGradient61, stop123);
    			append_dev(defs, linearGradient62);
    			append_dev(linearGradient62, stop124);
    			append_dev(linearGradient62, stop125);
    			append_dev(defs, linearGradient63);
    			append_dev(linearGradient63, stop126);
    			append_dev(linearGradient63, stop127);
    			append_dev(defs, linearGradient64);
    			append_dev(linearGradient64, stop128);
    			append_dev(linearGradient64, stop129);
    			append_dev(defs, linearGradient65);
    			append_dev(linearGradient65, stop130);
    			append_dev(linearGradient65, stop131);
    			append_dev(defs, linearGradient66);
    			append_dev(linearGradient66, stop132);
    			append_dev(linearGradient66, stop133);
    			append_dev(defs, linearGradient67);
    			append_dev(linearGradient67, stop134);
    			append_dev(linearGradient67, stop135);
    			append_dev(defs, linearGradient68);
    			append_dev(linearGradient68, stop136);
    			append_dev(linearGradient68, stop137);
    			append_dev(defs, linearGradient69);
    			append_dev(linearGradient69, stop138);
    			append_dev(linearGradient69, stop139);
    			append_dev(defs, linearGradient70);
    			append_dev(linearGradient70, stop140);
    			append_dev(linearGradient70, stop141);
    			append_dev(defs, linearGradient71);
    			append_dev(linearGradient71, stop142);
    			append_dev(linearGradient71, stop143);
    			append_dev(defs, linearGradient72);
    			append_dev(linearGradient72, stop144);
    			append_dev(linearGradient72, stop145);
    			append_dev(defs, linearGradient73);
    			append_dev(linearGradient73, stop146);
    			append_dev(linearGradient73, stop147);
    			append_dev(defs, linearGradient74);
    			append_dev(linearGradient74, stop148);
    			append_dev(linearGradient74, stop149);
    			append_dev(defs, linearGradient75);
    			append_dev(linearGradient75, stop150);
    			append_dev(linearGradient75, stop151);
    			append_dev(defs, linearGradient76);
    			append_dev(linearGradient76, stop152);
    			append_dev(linearGradient76, stop153);
    			append_dev(defs, linearGradient77);
    			append_dev(linearGradient77, stop154);
    			append_dev(linearGradient77, stop155);
    			append_dev(defs, linearGradient78);
    			append_dev(linearGradient78, stop156);
    			append_dev(linearGradient78, stop157);
    			append_dev(defs, linearGradient79);
    			append_dev(linearGradient79, stop158);
    			append_dev(linearGradient79, stop159);
    			append_dev(defs, linearGradient80);
    			append_dev(linearGradient80, stop160);
    			append_dev(linearGradient80, stop161);
    			append_dev(defs, linearGradient81);
    			append_dev(linearGradient81, stop162);
    			append_dev(linearGradient81, stop163);
    			append_dev(defs, linearGradient82);
    			append_dev(linearGradient82, stop164);
    			append_dev(linearGradient82, stop165);
    			append_dev(defs, linearGradient83);
    			append_dev(linearGradient83, stop166);
    			append_dev(linearGradient83, stop167);
    			append_dev(defs, linearGradient84);
    			append_dev(linearGradient84, stop168);
    			append_dev(linearGradient84, stop169);
    			append_dev(defs, linearGradient85);
    			append_dev(linearGradient85, stop170);
    			append_dev(linearGradient85, stop171);
    			append_dev(defs, linearGradient86);
    			append_dev(linearGradient86, stop172);
    			append_dev(linearGradient86, stop173);
    			append_dev(defs, linearGradient87);
    			append_dev(linearGradient87, stop174);
    			append_dev(linearGradient87, stop175);
    			append_dev(defs, linearGradient88);
    			append_dev(linearGradient88, stop176);
    			append_dev(linearGradient88, stop177);
    			append_dev(defs, linearGradient89);
    			append_dev(linearGradient89, stop178);
    			append_dev(linearGradient89, stop179);
    			append_dev(defs, linearGradient90);
    			append_dev(linearGradient90, stop180);
    			append_dev(linearGradient90, stop181);
    			append_dev(defs, linearGradient91);
    			append_dev(linearGradient91, stop182);
    			append_dev(linearGradient91, stop183);
    			append_dev(defs, linearGradient92);
    			append_dev(linearGradient92, stop184);
    			append_dev(linearGradient92, stop185);
    			append_dev(defs, linearGradient93);
    			append_dev(linearGradient93, stop186);
    			append_dev(linearGradient93, stop187);
    			append_dev(defs, linearGradient94);
    			append_dev(linearGradient94, stop188);
    			append_dev(linearGradient94, stop189);
    			append_dev(defs, linearGradient95);
    			append_dev(linearGradient95, stop190);
    			append_dev(linearGradient95, stop191);
    			append_dev(defs, linearGradient96);
    			append_dev(linearGradient96, stop192);
    			append_dev(linearGradient96, stop193);
    			append_dev(defs, linearGradient97);
    			append_dev(linearGradient97, stop194);
    			append_dev(linearGradient97, stop195);
    			append_dev(defs, linearGradient98);
    			append_dev(linearGradient98, stop196);
    			append_dev(linearGradient98, stop197);
    			append_dev(defs, linearGradient99);
    			append_dev(linearGradient99, stop198);
    			append_dev(linearGradient99, stop199);
    			append_dev(defs, linearGradient100);
    			append_dev(linearGradient100, stop200);
    			append_dev(linearGradient100, stop201);
    			append_dev(defs, linearGradient101);
    			append_dev(linearGradient101, stop202);
    			append_dev(linearGradient101, stop203);
    			append_dev(defs, linearGradient102);
    			append_dev(linearGradient102, stop204);
    			append_dev(linearGradient102, stop205);
    			append_dev(defs, linearGradient103);
    			append_dev(linearGradient103, stop206);
    			append_dev(linearGradient103, stop207);
    			append_dev(defs, linearGradient104);
    			append_dev(linearGradient104, stop208);
    			append_dev(linearGradient104, stop209);
    			append_dev(defs, linearGradient105);
    			append_dev(linearGradient105, stop210);
    			append_dev(linearGradient105, stop211);
    			append_dev(defs, linearGradient106);
    			append_dev(linearGradient106, stop212);
    			append_dev(linearGradient106, stop213);
    			append_dev(defs, linearGradient107);
    			append_dev(linearGradient107, stop214);
    			append_dev(linearGradient107, stop215);
    			append_dev(defs, linearGradient108);
    			append_dev(linearGradient108, stop216);
    			append_dev(linearGradient108, stop217);
    			append_dev(defs, linearGradient109);
    			append_dev(linearGradient109, stop218);
    			append_dev(linearGradient109, stop219);
    			append_dev(defs, linearGradient110);
    			append_dev(linearGradient110, stop220);
    			append_dev(linearGradient110, stop221);
    			append_dev(defs, linearGradient111);
    			append_dev(linearGradient111, stop222);
    			append_dev(linearGradient111, stop223);
    			append_dev(defs, linearGradient112);
    			append_dev(linearGradient112, stop224);
    			append_dev(linearGradient112, stop225);
    			append_dev(defs, linearGradient113);
    			append_dev(linearGradient113, stop226);
    			append_dev(linearGradient113, stop227);
    			append_dev(defs, linearGradient114);
    			append_dev(linearGradient114, stop228);
    			append_dev(linearGradient114, stop229);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Flowers', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Flowers> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Flowers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flowers",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\LandingBg.svelte generated by Svelte v3.46.3 */
    const file$g = "src\\components\\LandingBg.svelte";

    function create_fragment$g(ctx) {
    	let div1;
    	let div0;
    	let sun;
    	let t0;
    	let clouds;
    	let t1;
    	let ground;
    	let t2;
    	let ducks;
    	let t3;
    	let flowers;
    	let current;
    	sun = new Sun({ $$inline: true });
    	clouds = new Clouds({ $$inline: true });
    	ground = new Ground({ $$inline: true });
    	ducks = new Ducks({ $$inline: true });
    	flowers = new Flowers({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(sun.$$.fragment);
    			t0 = space();
    			create_component(clouds.$$.fragment);
    			t1 = space();
    			create_component(ground.$$.fragment);
    			t2 = space();
    			create_component(ducks.$$.fragment);
    			t3 = space();
    			create_component(flowers.$$.fragment);
    			attr_dev(div0, "class", "sky svelte-1l6lmv");
    			add_location(div0, file$g, 10, 2, 309);
    			attr_dev(div1, "class", "full-width svelte-1l6lmv");
    			add_location(div1, file$g, 9, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(sun, div0, null);
    			append_dev(div0, t0);
    			mount_component(clouds, div0, null);
    			append_dev(div1, t1);
    			mount_component(ground, div1, null);
    			append_dev(div1, t2);
    			mount_component(ducks, div1, null);
    			append_dev(div1, t3);
    			mount_component(flowers, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sun.$$.fragment, local);
    			transition_in(clouds.$$.fragment, local);
    			transition_in(ground.$$.fragment, local);
    			transition_in(ducks.$$.fragment, local);
    			transition_in(flowers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sun.$$.fragment, local);
    			transition_out(clouds.$$.fragment, local);
    			transition_out(ground.$$.fragment, local);
    			transition_out(ducks.$$.fragment, local);
    			transition_out(flowers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(sun);
    			destroy_component(clouds);
    			destroy_component(ground);
    			destroy_component(ducks);
    			destroy_component(flowers);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LandingBg', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LandingBg> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Sun, Clouds, Ground, Ducks, Flowers });
    	return [];
    }

    class LandingBg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LandingBg",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\assets\sunMobile.svelte generated by Svelte v3.46.3 */

    const file$f = "src\\components\\assets\\sunMobile.svelte";

    function create_fragment$f(ctx) {
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "33.3955");
    			attr_dev(circle, "cy", "32.9998");
    			attr_dev(circle, "r", "33");
    			attr_dev(circle, "fill", "#FFCD59");
    			add_location(circle, file$f, 1, 0, 155);
    			attr_dev(svg, "width", "67");
    			attr_dev(svg, "height", "66");
    			attr_dev(svg, "viewBox", "0 0 67 66");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "max-width", "10vw");
    			set_style(svg, "top", "4vh");
    			set_style(svg, "left", "8vw");
    			set_style(svg, "position", "absolute");
    			add_location(svg, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SunMobile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SunMobile> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SunMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SunMobile",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\assets\groundMobile.svelte generated by Svelte v3.46.3 */

    const file$e = "src\\components\\assets\\groundMobile.svelte";

    function create_fragment$e(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let rect0;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let rect1;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let rect2;
    	let path22;
    	let path23;
    	let path24;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			rect0 = svg_element("rect");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			rect1 = svg_element("rect");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			rect2 = svg_element("rect");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			attr_dev(path0, "d", "M1111.46 27.507L1111.4 30.7163L1100.28 27.0947L1100.67 6.55466L1104.69 2.55944L1108.85 2.84727L1110.86 24.2859L1111.46 27.507Z");
    			attr_dev(path0, "fill", "#CCB5AA");
    			add_location(path0, file$e, 1, 2, 127);
    			attr_dev(path1, "d", "M1125.95 25.3358L1126.89 30.5451L1112.17 26.021L1112.6 2.91347L1120.73 1.77358L1122.74 22.2122L1125.95 25.3358Z");
    			attr_dev(path1, "fill", "url(#paint0_linear_688_876)");
    			add_location(path1, file$e, 2, 2, 284);
    			attr_dev(path2, "d", "M1088.84 26.2055L1088.76 29.4144L1102.22 26.3154L1102.8 3.21118L1094.73 0.875188L1091.77 23.0656L1088.84 26.2055Z");
    			attr_dev(path2, "fill", "#FFF8F5");
    			add_location(path2, file$e, 3, 2, 446);
    			attr_dev(path3, "d", "M1117.21 25.0174L1117.15 28.2268L1106.04 24.6052L1106.42 4.06516L1110.44 0.069934L1114.6 0.357767L1116.61 21.7964L1117.21 25.0174Z");
    			attr_dev(path3, "fill", "#FFF8F5");
    			add_location(path3, file$e, 4, 2, 590);
    			attr_dev(path4, "d", "M1086.95 31.2781L1081 164.607H1134.48L1127.78 31.2781L1125.42 28.2867L1114.17 24.2271H1107.63L1090.62 27.0047L1086.95 31.2781Z");
    			attr_dev(path4, "fill", "#CCB5AA");
    			add_location(path4, file$e, 5, 2, 751);
    			attr_dev(path5, "d", "M1105.33 33.8574L1093.59 35.3554L1087.79 163.752H1105.55L1105.33 33.8574Z");
    			attr_dev(path5, "fill", "url(#paint1_linear_688_876)");
    			add_location(path5, file$e, 6, 2, 908);
    			attr_dev(path6, "d", "M1117.05 34.7102L1122.65 37.0666L1127.91 164.179H1118.26L1117.05 34.7102Z");
    			attr_dev(path6, "fill", "url(#paint2_linear_688_876)");
    			add_location(path6, file$e, 7, 2, 1032);
    			attr_dev(path7, "d", "M1086.91 137.216L1084.95 164.607H1109.06L1107.57 137.216L1105.55 133.792H1089.55L1086.91 137.216Z");
    			attr_dev(path7, "fill", "#FFF8F5");
    			add_location(path7, file$e, 8, 2, 1156);
    			attr_dev(path8, "d", "M1089.93 138.5L1088.45 164.608H1103.8L1102.66 138.5H1089.93Z");
    			attr_dev(path8, "fill", "#458999");
    			add_location(path8, file$e, 9, 2, 1284);
    			attr_dev(path9, "d", "M1199.39 107.01L1280 107.01L1280 166.416L1199.39 166.416L1199.39 107.01Z");
    			attr_dev(path9, "fill", "#FFF8F5");
    			add_location(path9, file$e, 10, 2, 1375);
    			attr_dev(rect0, "x", "1158.39");
    			attr_dev(rect0, "y", "107.01");
    			attr_dev(rect0, "width", "41.5025");
    			attr_dev(rect0, "height", "59.4056");
    			attr_dev(rect0, "fill", "#CCB5AA");
    			add_location(rect0, file$e, 11, 2, 1478);
    			attr_dev(path10, "d", "M1200.1 107.983L1280 107.982L1280 87.5002L1270.61 80.1223L1192.12 80.1223L1178.02 99.0471L1200.1 107.983Z");
    			attr_dev(path10, "fill", "#E85151");
    			add_location(path10, file$e, 12, 2, 1560);
    			attr_dev(path11, "d", "M1156.38 107.978L1200.01 107.978L1200.01 105.79L1192.12 80.1229L1156.38 106.197L1156.38 107.978Z");
    			attr_dev(path11, "fill", "#B83535");
    			add_location(path11, file$e, 13, 2, 1696);
    			attr_dev(path12, "d", "M1211.29 72.0181L1220.24 72.0181L1220.24 85.0385L1211.29 85.0385L1211.29 72.0181Z");
    			attr_dev(path12, "fill", "#FFF8F5");
    			add_location(path12, file$e, 14, 2, 1823);
    			attr_dev(path13, "d", "M1205.59 72.0181L1211.29 72.0181L1211.29 85.0385L1208.03 80.1558L1205.59 80.1558L1205.59 72.0181Z");
    			attr_dev(path13, "fill", "#CCB5AA");
    			add_location(path13, file$e, 15, 2, 1935);
    			attr_dev(path14, "d", "M1217.8 68.7629L1220.24 72.018L1211.29 72.018L1211.29 68.7629L1217.8 68.7629Z");
    			attr_dev(path14, "fill", "#E85151");
    			add_location(path14, file$e, 16, 2, 2063);
    			attr_dev(path15, "d", "M1211.29 68.7629L1211.29 72.018L1205.59 72.018L1208.03 68.7629L1211.29 68.7629Z");
    			attr_dev(path15, "fill", "#B83535");
    			add_location(path15, file$e, 17, 2, 2171);
    			attr_dev(path16, "d", "M1212.41 68.356L1212.41 68.856L1213.41 68.856L1213.41 68.356L1212.41 68.356ZM1213.41 56.9631C1213.41 56.687 1213.19 56.4631 1212.91 56.4631C1212.64 56.4631 1212.41 56.687 1212.41 56.9631L1213.41 56.9631ZM1213.41 68.356L1213.41 56.9631L1212.41 56.9631L1212.41 68.356L1213.41 68.356Z");
    			attr_dev(path16, "fill", "#FFF8F5");
    			add_location(path16, file$e, 18, 2, 2281);
    			attr_dev(rect1, "x", "1213.32");
    			attr_dev(rect1, "y", "57.3701");
    			attr_dev(rect1, "width", "6.5102");
    			attr_dev(rect1, "height", "4.06888");
    			attr_dev(rect1, "fill", "#E85151");
    			add_location(rect1, file$e, 19, 2, 2593);
    			attr_dev(path17, "d", "M1254.41 72.0178L1263.37 72.0178L1263.37 85.0382L1254.41 85.0382L1254.41 72.0178Z");
    			attr_dev(path17, "fill", "#FFF8F5");
    			add_location(path17, file$e, 20, 2, 2675);
    			attr_dev(path18, "d", "M1248.72 72.0178L1254.41 72.0178L1254.41 85.0382L1251.16 80.1556L1248.72 80.1556L1248.72 72.0178Z");
    			attr_dev(path18, "fill", "#CCB5AA");
    			add_location(path18, file$e, 21, 2, 2787);
    			attr_dev(path19, "d", "M1260.92 68.7627L1263.37 72.0178L1254.41 72.0178L1254.41 68.7627L1260.92 68.7627Z");
    			attr_dev(path19, "fill", "#E85151");
    			add_location(path19, file$e, 22, 2, 2915);
    			attr_dev(path20, "d", "M1254.41 68.7627L1254.41 72.0178L1248.72 72.0178L1251.16 68.7627L1254.41 68.7627Z");
    			attr_dev(path20, "fill", "#B83535");
    			add_location(path20, file$e, 23, 2, 3027);
    			attr_dev(path21, "d", "M1255.54 68.3557L1255.54 68.8557L1256.54 68.8557L1256.54 68.3557L1255.54 68.3557ZM1256.54 56.9629C1256.54 56.6867 1256.32 56.4629 1256.04 56.4629C1255.77 56.4629 1255.54 56.6867 1255.54 56.9629L1256.54 56.9629ZM1256.54 68.3557L1256.54 56.9629L1255.54 56.9629L1255.54 68.3557L1256.54 68.3557Z");
    			attr_dev(path21, "fill", "#FFF8F5");
    			add_location(path21, file$e, 24, 2, 3139);
    			attr_dev(rect2, "x", "1256.45");
    			attr_dev(rect2, "y", "57.3699");
    			attr_dev(rect2, "width", "6.5102");
    			attr_dev(rect2, "height", "4.06888");
    			attr_dev(rect2, "fill", "#458999");
    			add_location(rect2, file$e, 25, 2, 3461);
    			attr_dev(path22, "d", "M0 1272.5H1280V137C1280 137 1222.5 131.5 1079.5 164.5C921.729 200.908 772.5 258.646 578 274.5C390.467 289.786 179.516 274.954 0 298V1272.5Z");
    			attr_dev(path22, "fill", "#57661F");
    			add_location(path22, file$e, 26, 2, 3543);
    			attr_dev(path23, "d", "M1193.97 206.666C1214.92 207.376 1236.46 215.454 1251.46 217.194C1261.61 218.372 1271.2 219.066 1280 219.289L1280 175C1247.3 169.797 1208.21 171.171 1188.9 174.044C1156.95 178.8 1120.52 191.232 1131.83 200.475C1146.93 212.814 1173.02 205.956 1193.97 206.666Z");
    			attr_dev(path23, "fill", "#458999");
    			add_location(path23, file$e, 27, 2, 3713);
    			attr_dev(path24, "d", "M1280 3023.5H0V132C94.498 159.569 150.5 175.403 200.5 183.691C360.288 210.178 549.411 270.167 702 325.669C816.533 367.328 967.822 400.165 1087 401.482C1171 401.482 1241 366.332 1280 366.332V3023.5Z");
    			attr_dev(path24, "fill", "#9CB23E");
    			add_location(path24, file$e, 28, 2, 4002);
    			attr_dev(stop0, "stop-color", "#FFF8F5");
    			add_location(stop0, file$e, 31, 2, 4370);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#CCB5AA");
    			add_location(stop1, file$e, 32, 2, 4402);
    			attr_dev(linearGradient0, "id", "paint0_linear_688_876");
    			attr_dev(linearGradient0, "x1", "1120.86");
    			attr_dev(linearGradient0, "y1", "13.3264");
    			attr_dev(linearGradient0, "x2", "1110.38");
    			attr_dev(linearGradient0, "y2", "16.1897");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$e, 30, 2, 4240);
    			attr_dev(stop2, "stop-color", "#458999");
    			add_location(stop2, file$e, 35, 2, 4596);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#B5E2E8");
    			attr_dev(stop3, "stop-opacity", "0");
    			add_location(stop3, file$e, 36, 2, 4628);
    			attr_dev(linearGradient1, "id", "paint1_linear_688_876");
    			attr_dev(linearGradient1, "x1", "1096.67");
    			attr_dev(linearGradient1, "y1", "33.8574");
    			attr_dev(linearGradient1, "x2", "1096.67");
    			attr_dev(linearGradient1, "y2", "163.752");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$e, 34, 2, 4466);
    			attr_dev(stop4, "stop-color", "#458999");
    			add_location(stop4, file$e, 39, 2, 4839);
    			attr_dev(stop5, "offset", "1");
    			attr_dev(stop5, "stop-color", "#B5E2E8");
    			attr_dev(stop5, "stop-opacity", "0");
    			add_location(stop5, file$e, 40, 2, 4871);
    			attr_dev(linearGradient2, "id", "paint2_linear_688_876");
    			attr_dev(linearGradient2, "x1", "1122.48");
    			attr_dev(linearGradient2, "y1", "34.7102");
    			attr_dev(linearGradient2, "x2", "1122.48");
    			attr_dev(linearGradient2, "y2", "164.179");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$e, 38, 2, 4709);
    			add_location(defs, file$e, 29, 2, 4230);
    			attr_dev(svg, "viewBox", "0 0 1280 3024");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "top", "55vh");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "100vw");
    			add_location(svg, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, rect0);
    			append_dev(svg, path10);
    			append_dev(svg, path11);
    			append_dev(svg, path12);
    			append_dev(svg, path13);
    			append_dev(svg, path14);
    			append_dev(svg, path15);
    			append_dev(svg, path16);
    			append_dev(svg, rect1);
    			append_dev(svg, path17);
    			append_dev(svg, path18);
    			append_dev(svg, path19);
    			append_dev(svg, path20);
    			append_dev(svg, path21);
    			append_dev(svg, rect2);
    			append_dev(svg, path22);
    			append_dev(svg, path23);
    			append_dev(svg, path24);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(defs, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GroundMobile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GroundMobile> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class GroundMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GroundMobile",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\assets\ducksMobile.svelte generated by Svelte v3.46.3 */

    const file$d = "src\\components\\assets\\ducksMobile.svelte";

    function create_fragment$d(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let defs;
    	let radialGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient0;
    	let stop2;
    	let stop3;
    	let radialGradient1;
    	let stop4;
    	let stop5;
    	let linearGradient1;
    	let stop6;
    	let stop7;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			defs = svg_element("defs");
    			radialGradient0 = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient0 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			radialGradient1 = svg_element("radialGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M78.8349 10.177C88.5522 19.0932 95.3054 33.7982 92.6081 47.1258C93.5855 47.2838 94.5723 47.4471 95.569 47.6153C105.605 36.2948 114.474 32.789 120.418 34.7264C132.25 38.5836 145.661 69.6509 137.495 95.5707C131.386 114.961 116.388 128.925 91.2309 134.095C63.2294 139.849 8.99596 141.922 8.99596 91.8966C8.99596 80.3027 11.1847 72.2045 16.6541 65.5478C1.80341 53.8592 9.32119 23.1571 20.2124 11.8745C35.427 -3.88703 63.9835 -3.44996 78.8349 10.177Z");
    			attr_dev(path0, "fill", "url(#paint0_radial_565_657)");
    			add_location(path0, file$d, 1, 0, 157);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M12.7986 42.9196C15.882 41.337 18.7298 39.8753 22.0381 36.4917C25.5923 45.1024 36.1387 49.7484 41.1743 50.8269C41.0408 53.9741 37.6079 58.3283 34.7365 59.8784C31.4046 61.677 22.2114 62.2544 14.167 61.0243C5.36343 59.6782 -1.05909 53.5936 0.951942 49.5515C1.98924 47.4665 4.16354 46.6214 7.01081 45.5147C8.47347 44.9462 10.1137 44.3086 11.8687 43.3985C12.1814 43.2363 12.4912 43.0773 12.7986 42.9196ZM38.3441 52.2137C38.4032 52.2244 38.4616 52.2345 38.5195 52.244C38.5178 52.2623 38.516 52.2807 38.5141 52.2994L38.3441 52.2137Z");
    			attr_dev(path1, "fill", "url(#paint1_linear_565_657)");
    			add_location(path1, file$d, 2, 0, 691);
    			attr_dev(path2, "d", "M49.1187 39.6889C48.4927 41.8079 49.3527 43.9337 51.0396 44.437C52.7266 44.9402 54.6016 43.6304 55.2276 41.5114C55.8536 39.3924 54.9936 37.2666 53.3066 36.7633C51.6197 36.26 49.7447 37.5698 49.1187 39.6889Z");
    			attr_dev(path2, "fill", "#1B2526");
    			add_location(path2, file$d, 3, 0, 1306);
    			attr_dev(path3, "d", "M12.0765 36.7741C11.6445 38.2363 12.0893 39.6588 13.07 39.9514C14.0506 40.244 15.1958 39.2958 15.6278 37.8336C16.0597 36.3714 15.6149 34.9489 14.6343 34.6563C13.6536 34.3637 12.5084 35.3119 12.0765 36.7741Z");
    			attr_dev(path3, "fill", "#1B2526");
    			add_location(path3, file$d, 4, 0, 1541);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "d", "M198.602 38.6798C181.666 54.1693 169.896 79.7151 174.597 102.868C172.894 103.143 171.174 103.426 169.437 103.719C151.946 84.0523 136.488 77.9619 126.129 81.3277C105.507 88.0284 82.1344 141.999 96.3657 187.028C107.012 220.714 133.152 244.973 176.998 253.953C225.8 263.949 320.321 267.551 320.321 180.645C320.321 160.504 316.507 146.436 306.974 134.871C332.857 114.566 319.755 61.2292 300.773 41.6287C274.256 14.2473 224.486 15.0066 198.602 38.6798Z");
    			attr_dev(path4, "fill", "url(#paint2_radial_565_657)");
    			add_location(path4, file$d, 5, 0, 1776);
    			attr_dev(path5, "fill-rule", "evenodd");
    			attr_dev(path5, "clip-rule", "evenodd");
    			attr_dev(path5, "d", "M313.694 95.5607C308.32 92.8114 303.356 90.2722 297.59 84.394C291.396 99.3528 273.015 107.424 264.239 109.297C264.471 114.765 270.454 122.329 275.459 125.022C281.266 128.147 297.288 129.15 311.309 127.013C326.652 124.674 337.846 114.104 334.341 107.082C332.533 103.46 328.743 101.992 323.781 100.069C321.232 99.0814 318.373 97.9738 315.314 96.3928C314.769 96.111 314.229 95.8348 313.694 95.5607ZM269.172 111.707C269.069 111.725 268.967 111.743 268.866 111.759C268.869 111.791 268.872 111.823 268.875 111.856L269.172 111.707Z");
    			attr_dev(path5, "fill", "url(#paint3_linear_565_657)");
    			add_location(path5, file$d, 6, 0, 2312);
    			attr_dev(path6, "d", "M250.393 89.9483C251.484 93.6295 249.985 97.3225 247.045 98.1968C244.105 99.0711 240.837 96.7956 239.746 93.1144C238.655 89.4332 240.154 85.7402 243.094 84.8659C246.034 83.9916 249.302 86.2671 250.393 89.9483Z");
    			attr_dev(path6, "fill", "#1B2526");
    			add_location(path6, file$d, 7, 0, 2925);
    			attr_dev(path7, "d", "M314.952 84.8846C315.705 87.4247 314.93 89.896 313.221 90.4042C311.512 90.9125 309.516 89.2653 308.763 86.7251C308.01 84.185 308.785 81.7137 310.494 81.2054C312.203 80.6972 314.199 82.3444 314.952 84.8846Z");
    			attr_dev(path7, "fill", "#1B2526");
    			add_location(path7, file$d, 8, 0, 3163);
    			attr_dev(stop0, "offset", "0.385417");
    			attr_dev(stop0, "stop-color", "#FFF8F5");
    			add_location(stop0, file$d, 11, 0, 3587);
    			attr_dev(stop1, "offset", "0.875");
    			attr_dev(stop1, "stop-color", "#CCB5AA");
    			add_location(stop1, file$d, 12, 0, 3635);
    			attr_dev(radialGradient0, "id", "paint0_radial_565_657");
    			attr_dev(radialGradient0, "cx", "0");
    			attr_dev(radialGradient0, "cy", "0");
    			attr_dev(radialGradient0, "r", "1");
    			attr_dev(radialGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient0, "gradientTransform", "translate(70.9653 35.8142) rotate(89.6908) scale(131.194 126.068)");
    			add_location(radialGradient0, file$d, 10, 0, 3405);
    			attr_dev(stop2, "offset", "0.125");
    			attr_dev(stop2, "stop-color", "#F2AC49");
    			add_location(stop2, file$d, 15, 0, 3827);
    			attr_dev(stop3, "offset", "1");
    			attr_dev(stop3, "stop-color", "#FFCD59");
    			add_location(stop3, file$d, 16, 0, 3872);
    			attr_dev(linearGradient0, "id", "paint1_linear_565_657");
    			attr_dev(linearGradient0, "x1", "3.63584");
    			attr_dev(linearGradient0, "y1", "61.6402");
    			attr_dev(linearGradient0, "x2", "9.14885");
    			attr_dev(linearGradient0, "y2", "43.5506");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$d, 14, 0, 3699);
    			attr_dev(stop4, "offset", "0.385417");
    			attr_dev(stop4, "stop-color", "#FFF8F5");
    			add_location(stop4, file$d, 19, 0, 4114);
    			attr_dev(stop5, "offset", "0.875");
    			attr_dev(stop5, "stop-color", "#CCB5AA");
    			add_location(stop5, file$d, 20, 0, 4162);
    			attr_dev(radialGradient1, "id", "paint2_radial_565_657");
    			attr_dev(radialGradient1, "cx", "0");
    			attr_dev(radialGradient1, "cy", "0");
    			attr_dev(radialGradient1, "r", "1");
    			attr_dev(radialGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient1, "gradientTransform", "translate(212.318 83.2174) rotate(90.3103) scale(227.915 219.718)");
    			add_location(radialGradient1, file$d, 18, 0, 3932);
    			attr_dev(stop6, "offset", "0.125");
    			attr_dev(stop6, "stop-color", "#F2AC49");
    			add_location(stop6, file$d, 23, 0, 4354);
    			attr_dev(stop7, "offset", "1");
    			attr_dev(stop7, "stop-color", "#FFCD59");
    			add_location(stop7, file$d, 24, 0, 4399);
    			attr_dev(linearGradient1, "id", "paint3_linear_565_657");
    			attr_dev(linearGradient1, "x1", "329.663");
    			attr_dev(linearGradient1, "y1", "128.083");
    			attr_dev(linearGradient1, "x2", "320.111");
    			attr_dev(linearGradient1, "y2", "96.6398");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$d, 22, 0, 4226);
    			add_location(defs, file$d, 9, 0, 3397);
    			attr_dev(svg, "width", "336");
    			attr_dev(svg, "height", "259");
    			attr_dev(svg, "viewBox", "0 0 336 259");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "35vw");
    			set_style(svg, "top", "55vh");
    			set_style(svg, "left", "5vw");
    			add_location(svg, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, defs);
    			append_dev(defs, radialGradient0);
    			append_dev(radialGradient0, stop0);
    			append_dev(radialGradient0, stop1);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop2);
    			append_dev(linearGradient0, stop3);
    			append_dev(defs, radialGradient1);
    			append_dev(radialGradient1, stop4);
    			append_dev(radialGradient1, stop5);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop6);
    			append_dev(linearGradient1, stop7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DucksMobile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DucksMobile> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class DucksMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DucksMobile",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\assets\flowersMobile.svelte generated by Svelte v3.46.3 */

    const file$c = "src\\components\\assets\\flowersMobile.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let mask;
    	let rect;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let path51;
    	let path52;
    	let path53;
    	let path54;
    	let path55;
    	let path56;
    	let path57;
    	let path58;
    	let path59;
    	let path60;
    	let path61;
    	let path62;
    	let path63;
    	let path64;
    	let path65;
    	let path66;
    	let path67;
    	let path68;
    	let path69;
    	let path70;
    	let path71;
    	let path72;
    	let path73;
    	let path74;
    	let path75;
    	let path76;
    	let path77;
    	let path78;
    	let path79;
    	let path80;
    	let path81;
    	let path82;
    	let path83;
    	let path84;
    	let path85;
    	let path86;
    	let path87;
    	let path88;
    	let path89;
    	let path90;
    	let path91;
    	let path92;
    	let path93;
    	let path94;
    	let path95;
    	let path96;
    	let path97;
    	let path98;
    	let path99;
    	let path100;
    	let path101;
    	let path102;
    	let path103;
    	let path104;
    	let path105;
    	let path106;
    	let path107;
    	let path108;
    	let path109;
    	let path110;
    	let path111;
    	let path112;
    	let path113;
    	let path114;
    	let path115;
    	let path116;
    	let path117;
    	let path118;
    	let path119;
    	let path120;
    	let path121;
    	let path122;
    	let path123;
    	let path124;
    	let path125;
    	let path126;
    	let path127;
    	let path128;
    	let path129;
    	let path130;
    	let path131;
    	let path132;
    	let path133;
    	let path134;
    	let path135;
    	let path136;
    	let path137;
    	let path138;
    	let path139;
    	let path140;
    	let path141;
    	let path142;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let stop2;
    	let stop3;
    	let linearGradient2;
    	let stop4;
    	let stop5;
    	let linearGradient3;
    	let stop6;
    	let stop7;
    	let linearGradient4;
    	let stop8;
    	let stop9;
    	let linearGradient5;
    	let stop10;
    	let stop11;
    	let linearGradient6;
    	let stop12;
    	let stop13;
    	let linearGradient7;
    	let stop14;
    	let stop15;
    	let linearGradient8;
    	let stop16;
    	let stop17;
    	let linearGradient9;
    	let stop18;
    	let stop19;
    	let linearGradient10;
    	let stop20;
    	let stop21;
    	let linearGradient11;
    	let stop22;
    	let stop23;
    	let linearGradient12;
    	let stop24;
    	let stop25;
    	let linearGradient13;
    	let stop26;
    	let stop27;
    	let linearGradient14;
    	let stop28;
    	let stop29;
    	let linearGradient15;
    	let stop30;
    	let stop31;
    	let linearGradient16;
    	let stop32;
    	let stop33;
    	let linearGradient17;
    	let stop34;
    	let stop35;
    	let linearGradient18;
    	let stop36;
    	let stop37;
    	let linearGradient19;
    	let stop38;
    	let stop39;
    	let linearGradient20;
    	let stop40;
    	let stop41;
    	let linearGradient21;
    	let stop42;
    	let stop43;
    	let linearGradient22;
    	let stop44;
    	let stop45;
    	let linearGradient23;
    	let stop46;
    	let stop47;
    	let linearGradient24;
    	let stop48;
    	let stop49;
    	let linearGradient25;
    	let stop50;
    	let stop51;
    	let linearGradient26;
    	let stop52;
    	let stop53;
    	let linearGradient27;
    	let stop54;
    	let stop55;
    	let linearGradient28;
    	let stop56;
    	let stop57;
    	let linearGradient29;
    	let stop58;
    	let stop59;
    	let linearGradient30;
    	let stop60;
    	let stop61;
    	let linearGradient31;
    	let stop62;
    	let stop63;
    	let linearGradient32;
    	let stop64;
    	let stop65;
    	let linearGradient33;
    	let stop66;
    	let stop67;
    	let linearGradient34;
    	let stop68;
    	let stop69;
    	let linearGradient35;
    	let stop70;
    	let stop71;
    	let linearGradient36;
    	let stop72;
    	let stop73;
    	let linearGradient37;
    	let stop74;
    	let stop75;
    	let linearGradient38;
    	let stop76;
    	let stop77;
    	let linearGradient39;
    	let stop78;
    	let stop79;
    	let linearGradient40;
    	let stop80;
    	let stop81;
    	let linearGradient41;
    	let stop82;
    	let stop83;
    	let linearGradient42;
    	let stop84;
    	let stop85;
    	let linearGradient43;
    	let stop86;
    	let stop87;
    	let linearGradient44;
    	let stop88;
    	let stop89;
    	let linearGradient45;
    	let stop90;
    	let stop91;
    	let linearGradient46;
    	let stop92;
    	let stop93;
    	let linearGradient47;
    	let stop94;
    	let stop95;
    	let linearGradient48;
    	let stop96;
    	let stop97;
    	let linearGradient49;
    	let stop98;
    	let stop99;
    	let linearGradient50;
    	let stop100;
    	let stop101;
    	let linearGradient51;
    	let stop102;
    	let stop103;
    	let linearGradient52;
    	let stop104;
    	let stop105;
    	let linearGradient53;
    	let stop106;
    	let stop107;
    	let linearGradient54;
    	let stop108;
    	let stop109;
    	let linearGradient55;
    	let stop110;
    	let stop111;
    	let linearGradient56;
    	let stop112;
    	let stop113;
    	let linearGradient57;
    	let stop114;
    	let stop115;
    	let linearGradient58;
    	let stop116;
    	let stop117;
    	let linearGradient59;
    	let stop118;
    	let stop119;
    	let linearGradient60;
    	let stop120;
    	let stop121;
    	let linearGradient61;
    	let stop122;
    	let stop123;
    	let linearGradient62;
    	let stop124;
    	let stop125;
    	let linearGradient63;
    	let stop126;
    	let stop127;
    	let linearGradient64;
    	let stop128;
    	let stop129;
    	let linearGradient65;
    	let stop130;
    	let stop131;
    	let linearGradient66;
    	let stop132;
    	let stop133;
    	let linearGradient67;
    	let stop134;
    	let stop135;
    	let linearGradient68;
    	let stop136;
    	let stop137;
    	let linearGradient69;
    	let stop138;
    	let stop139;
    	let linearGradient70;
    	let stop140;
    	let stop141;
    	let linearGradient71;
    	let stop142;
    	let stop143;
    	let linearGradient72;
    	let stop144;
    	let stop145;
    	let linearGradient73;
    	let stop146;
    	let stop147;
    	let linearGradient74;
    	let stop148;
    	let stop149;
    	let linearGradient75;
    	let stop150;
    	let stop151;
    	let linearGradient76;
    	let stop152;
    	let stop153;
    	let linearGradient77;
    	let stop154;
    	let stop155;
    	let linearGradient78;
    	let stop156;
    	let stop157;
    	let linearGradient79;
    	let stop158;
    	let stop159;
    	let linearGradient80;
    	let stop160;
    	let stop161;
    	let linearGradient81;
    	let stop162;
    	let stop163;
    	let linearGradient82;
    	let stop164;
    	let stop165;
    	let linearGradient83;
    	let stop166;
    	let stop167;
    	let linearGradient84;
    	let stop168;
    	let stop169;
    	let linearGradient85;
    	let stop170;
    	let stop171;
    	let linearGradient86;
    	let stop172;
    	let stop173;
    	let linearGradient87;
    	let stop174;
    	let stop175;
    	let linearGradient88;
    	let stop176;
    	let stop177;
    	let linearGradient89;
    	let stop178;
    	let stop179;
    	let linearGradient90;
    	let stop180;
    	let stop181;
    	let linearGradient91;
    	let stop182;
    	let stop183;
    	let linearGradient92;
    	let stop184;
    	let stop185;
    	let linearGradient93;
    	let stop186;
    	let stop187;
    	let linearGradient94;
    	let stop188;
    	let stop189;
    	let linearGradient95;
    	let stop190;
    	let stop191;
    	let linearGradient96;
    	let stop192;
    	let stop193;
    	let linearGradient97;
    	let stop194;
    	let stop195;
    	let linearGradient98;
    	let stop196;
    	let stop197;
    	let linearGradient99;
    	let stop198;
    	let stop199;
    	let linearGradient100;
    	let stop200;
    	let stop201;
    	let linearGradient101;
    	let stop202;
    	let stop203;
    	let linearGradient102;
    	let stop204;
    	let stop205;
    	let linearGradient103;
    	let stop206;
    	let stop207;
    	let linearGradient104;
    	let stop208;
    	let stop209;
    	let linearGradient105;
    	let stop210;
    	let stop211;
    	let linearGradient106;
    	let stop212;
    	let stop213;
    	let linearGradient107;
    	let stop214;
    	let stop215;
    	let linearGradient108;
    	let stop216;
    	let stop217;
    	let linearGradient109;
    	let stop218;
    	let stop219;
    	let linearGradient110;
    	let stop220;
    	let stop221;
    	let linearGradient111;
    	let stop222;
    	let stop223;
    	let linearGradient112;
    	let stop224;
    	let stop225;
    	let linearGradient113;
    	let stop226;
    	let stop227;
    	let linearGradient114;
    	let stop228;
    	let stop229;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			mask = svg_element("mask");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			path54 = svg_element("path");
    			path55 = svg_element("path");
    			path56 = svg_element("path");
    			path57 = svg_element("path");
    			path58 = svg_element("path");
    			path59 = svg_element("path");
    			path60 = svg_element("path");
    			path61 = svg_element("path");
    			path62 = svg_element("path");
    			path63 = svg_element("path");
    			path64 = svg_element("path");
    			path65 = svg_element("path");
    			path66 = svg_element("path");
    			path67 = svg_element("path");
    			path68 = svg_element("path");
    			path69 = svg_element("path");
    			path70 = svg_element("path");
    			path71 = svg_element("path");
    			path72 = svg_element("path");
    			path73 = svg_element("path");
    			path74 = svg_element("path");
    			path75 = svg_element("path");
    			path76 = svg_element("path");
    			path77 = svg_element("path");
    			path78 = svg_element("path");
    			path79 = svg_element("path");
    			path80 = svg_element("path");
    			path81 = svg_element("path");
    			path82 = svg_element("path");
    			path83 = svg_element("path");
    			path84 = svg_element("path");
    			path85 = svg_element("path");
    			path86 = svg_element("path");
    			path87 = svg_element("path");
    			path88 = svg_element("path");
    			path89 = svg_element("path");
    			path90 = svg_element("path");
    			path91 = svg_element("path");
    			path92 = svg_element("path");
    			path93 = svg_element("path");
    			path94 = svg_element("path");
    			path95 = svg_element("path");
    			path96 = svg_element("path");
    			path97 = svg_element("path");
    			path98 = svg_element("path");
    			path99 = svg_element("path");
    			path100 = svg_element("path");
    			path101 = svg_element("path");
    			path102 = svg_element("path");
    			path103 = svg_element("path");
    			path104 = svg_element("path");
    			path105 = svg_element("path");
    			path106 = svg_element("path");
    			path107 = svg_element("path");
    			path108 = svg_element("path");
    			path109 = svg_element("path");
    			path110 = svg_element("path");
    			path111 = svg_element("path");
    			path112 = svg_element("path");
    			path113 = svg_element("path");
    			path114 = svg_element("path");
    			path115 = svg_element("path");
    			path116 = svg_element("path");
    			path117 = svg_element("path");
    			path118 = svg_element("path");
    			path119 = svg_element("path");
    			path120 = svg_element("path");
    			path121 = svg_element("path");
    			path122 = svg_element("path");
    			path123 = svg_element("path");
    			path124 = svg_element("path");
    			path125 = svg_element("path");
    			path126 = svg_element("path");
    			path127 = svg_element("path");
    			path128 = svg_element("path");
    			path129 = svg_element("path");
    			path130 = svg_element("path");
    			path131 = svg_element("path");
    			path132 = svg_element("path");
    			path133 = svg_element("path");
    			path134 = svg_element("path");
    			path135 = svg_element("path");
    			path136 = svg_element("path");
    			path137 = svg_element("path");
    			path138 = svg_element("path");
    			path139 = svg_element("path");
    			path140 = svg_element("path");
    			path141 = svg_element("path");
    			path142 = svg_element("path");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			linearGradient2 = svg_element("linearGradient");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			linearGradient3 = svg_element("linearGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			linearGradient4 = svg_element("linearGradient");
    			stop8 = svg_element("stop");
    			stop9 = svg_element("stop");
    			linearGradient5 = svg_element("linearGradient");
    			stop10 = svg_element("stop");
    			stop11 = svg_element("stop");
    			linearGradient6 = svg_element("linearGradient");
    			stop12 = svg_element("stop");
    			stop13 = svg_element("stop");
    			linearGradient7 = svg_element("linearGradient");
    			stop14 = svg_element("stop");
    			stop15 = svg_element("stop");
    			linearGradient8 = svg_element("linearGradient");
    			stop16 = svg_element("stop");
    			stop17 = svg_element("stop");
    			linearGradient9 = svg_element("linearGradient");
    			stop18 = svg_element("stop");
    			stop19 = svg_element("stop");
    			linearGradient10 = svg_element("linearGradient");
    			stop20 = svg_element("stop");
    			stop21 = svg_element("stop");
    			linearGradient11 = svg_element("linearGradient");
    			stop22 = svg_element("stop");
    			stop23 = svg_element("stop");
    			linearGradient12 = svg_element("linearGradient");
    			stop24 = svg_element("stop");
    			stop25 = svg_element("stop");
    			linearGradient13 = svg_element("linearGradient");
    			stop26 = svg_element("stop");
    			stop27 = svg_element("stop");
    			linearGradient14 = svg_element("linearGradient");
    			stop28 = svg_element("stop");
    			stop29 = svg_element("stop");
    			linearGradient15 = svg_element("linearGradient");
    			stop30 = svg_element("stop");
    			stop31 = svg_element("stop");
    			linearGradient16 = svg_element("linearGradient");
    			stop32 = svg_element("stop");
    			stop33 = svg_element("stop");
    			linearGradient17 = svg_element("linearGradient");
    			stop34 = svg_element("stop");
    			stop35 = svg_element("stop");
    			linearGradient18 = svg_element("linearGradient");
    			stop36 = svg_element("stop");
    			stop37 = svg_element("stop");
    			linearGradient19 = svg_element("linearGradient");
    			stop38 = svg_element("stop");
    			stop39 = svg_element("stop");
    			linearGradient20 = svg_element("linearGradient");
    			stop40 = svg_element("stop");
    			stop41 = svg_element("stop");
    			linearGradient21 = svg_element("linearGradient");
    			stop42 = svg_element("stop");
    			stop43 = svg_element("stop");
    			linearGradient22 = svg_element("linearGradient");
    			stop44 = svg_element("stop");
    			stop45 = svg_element("stop");
    			linearGradient23 = svg_element("linearGradient");
    			stop46 = svg_element("stop");
    			stop47 = svg_element("stop");
    			linearGradient24 = svg_element("linearGradient");
    			stop48 = svg_element("stop");
    			stop49 = svg_element("stop");
    			linearGradient25 = svg_element("linearGradient");
    			stop50 = svg_element("stop");
    			stop51 = svg_element("stop");
    			linearGradient26 = svg_element("linearGradient");
    			stop52 = svg_element("stop");
    			stop53 = svg_element("stop");
    			linearGradient27 = svg_element("linearGradient");
    			stop54 = svg_element("stop");
    			stop55 = svg_element("stop");
    			linearGradient28 = svg_element("linearGradient");
    			stop56 = svg_element("stop");
    			stop57 = svg_element("stop");
    			linearGradient29 = svg_element("linearGradient");
    			stop58 = svg_element("stop");
    			stop59 = svg_element("stop");
    			linearGradient30 = svg_element("linearGradient");
    			stop60 = svg_element("stop");
    			stop61 = svg_element("stop");
    			linearGradient31 = svg_element("linearGradient");
    			stop62 = svg_element("stop");
    			stop63 = svg_element("stop");
    			linearGradient32 = svg_element("linearGradient");
    			stop64 = svg_element("stop");
    			stop65 = svg_element("stop");
    			linearGradient33 = svg_element("linearGradient");
    			stop66 = svg_element("stop");
    			stop67 = svg_element("stop");
    			linearGradient34 = svg_element("linearGradient");
    			stop68 = svg_element("stop");
    			stop69 = svg_element("stop");
    			linearGradient35 = svg_element("linearGradient");
    			stop70 = svg_element("stop");
    			stop71 = svg_element("stop");
    			linearGradient36 = svg_element("linearGradient");
    			stop72 = svg_element("stop");
    			stop73 = svg_element("stop");
    			linearGradient37 = svg_element("linearGradient");
    			stop74 = svg_element("stop");
    			stop75 = svg_element("stop");
    			linearGradient38 = svg_element("linearGradient");
    			stop76 = svg_element("stop");
    			stop77 = svg_element("stop");
    			linearGradient39 = svg_element("linearGradient");
    			stop78 = svg_element("stop");
    			stop79 = svg_element("stop");
    			linearGradient40 = svg_element("linearGradient");
    			stop80 = svg_element("stop");
    			stop81 = svg_element("stop");
    			linearGradient41 = svg_element("linearGradient");
    			stop82 = svg_element("stop");
    			stop83 = svg_element("stop");
    			linearGradient42 = svg_element("linearGradient");
    			stop84 = svg_element("stop");
    			stop85 = svg_element("stop");
    			linearGradient43 = svg_element("linearGradient");
    			stop86 = svg_element("stop");
    			stop87 = svg_element("stop");
    			linearGradient44 = svg_element("linearGradient");
    			stop88 = svg_element("stop");
    			stop89 = svg_element("stop");
    			linearGradient45 = svg_element("linearGradient");
    			stop90 = svg_element("stop");
    			stop91 = svg_element("stop");
    			linearGradient46 = svg_element("linearGradient");
    			stop92 = svg_element("stop");
    			stop93 = svg_element("stop");
    			linearGradient47 = svg_element("linearGradient");
    			stop94 = svg_element("stop");
    			stop95 = svg_element("stop");
    			linearGradient48 = svg_element("linearGradient");
    			stop96 = svg_element("stop");
    			stop97 = svg_element("stop");
    			linearGradient49 = svg_element("linearGradient");
    			stop98 = svg_element("stop");
    			stop99 = svg_element("stop");
    			linearGradient50 = svg_element("linearGradient");
    			stop100 = svg_element("stop");
    			stop101 = svg_element("stop");
    			linearGradient51 = svg_element("linearGradient");
    			stop102 = svg_element("stop");
    			stop103 = svg_element("stop");
    			linearGradient52 = svg_element("linearGradient");
    			stop104 = svg_element("stop");
    			stop105 = svg_element("stop");
    			linearGradient53 = svg_element("linearGradient");
    			stop106 = svg_element("stop");
    			stop107 = svg_element("stop");
    			linearGradient54 = svg_element("linearGradient");
    			stop108 = svg_element("stop");
    			stop109 = svg_element("stop");
    			linearGradient55 = svg_element("linearGradient");
    			stop110 = svg_element("stop");
    			stop111 = svg_element("stop");
    			linearGradient56 = svg_element("linearGradient");
    			stop112 = svg_element("stop");
    			stop113 = svg_element("stop");
    			linearGradient57 = svg_element("linearGradient");
    			stop114 = svg_element("stop");
    			stop115 = svg_element("stop");
    			linearGradient58 = svg_element("linearGradient");
    			stop116 = svg_element("stop");
    			stop117 = svg_element("stop");
    			linearGradient59 = svg_element("linearGradient");
    			stop118 = svg_element("stop");
    			stop119 = svg_element("stop");
    			linearGradient60 = svg_element("linearGradient");
    			stop120 = svg_element("stop");
    			stop121 = svg_element("stop");
    			linearGradient61 = svg_element("linearGradient");
    			stop122 = svg_element("stop");
    			stop123 = svg_element("stop");
    			linearGradient62 = svg_element("linearGradient");
    			stop124 = svg_element("stop");
    			stop125 = svg_element("stop");
    			linearGradient63 = svg_element("linearGradient");
    			stop126 = svg_element("stop");
    			stop127 = svg_element("stop");
    			linearGradient64 = svg_element("linearGradient");
    			stop128 = svg_element("stop");
    			stop129 = svg_element("stop");
    			linearGradient65 = svg_element("linearGradient");
    			stop130 = svg_element("stop");
    			stop131 = svg_element("stop");
    			linearGradient66 = svg_element("linearGradient");
    			stop132 = svg_element("stop");
    			stop133 = svg_element("stop");
    			linearGradient67 = svg_element("linearGradient");
    			stop134 = svg_element("stop");
    			stop135 = svg_element("stop");
    			linearGradient68 = svg_element("linearGradient");
    			stop136 = svg_element("stop");
    			stop137 = svg_element("stop");
    			linearGradient69 = svg_element("linearGradient");
    			stop138 = svg_element("stop");
    			stop139 = svg_element("stop");
    			linearGradient70 = svg_element("linearGradient");
    			stop140 = svg_element("stop");
    			stop141 = svg_element("stop");
    			linearGradient71 = svg_element("linearGradient");
    			stop142 = svg_element("stop");
    			stop143 = svg_element("stop");
    			linearGradient72 = svg_element("linearGradient");
    			stop144 = svg_element("stop");
    			stop145 = svg_element("stop");
    			linearGradient73 = svg_element("linearGradient");
    			stop146 = svg_element("stop");
    			stop147 = svg_element("stop");
    			linearGradient74 = svg_element("linearGradient");
    			stop148 = svg_element("stop");
    			stop149 = svg_element("stop");
    			linearGradient75 = svg_element("linearGradient");
    			stop150 = svg_element("stop");
    			stop151 = svg_element("stop");
    			linearGradient76 = svg_element("linearGradient");
    			stop152 = svg_element("stop");
    			stop153 = svg_element("stop");
    			linearGradient77 = svg_element("linearGradient");
    			stop154 = svg_element("stop");
    			stop155 = svg_element("stop");
    			linearGradient78 = svg_element("linearGradient");
    			stop156 = svg_element("stop");
    			stop157 = svg_element("stop");
    			linearGradient79 = svg_element("linearGradient");
    			stop158 = svg_element("stop");
    			stop159 = svg_element("stop");
    			linearGradient80 = svg_element("linearGradient");
    			stop160 = svg_element("stop");
    			stop161 = svg_element("stop");
    			linearGradient81 = svg_element("linearGradient");
    			stop162 = svg_element("stop");
    			stop163 = svg_element("stop");
    			linearGradient82 = svg_element("linearGradient");
    			stop164 = svg_element("stop");
    			stop165 = svg_element("stop");
    			linearGradient83 = svg_element("linearGradient");
    			stop166 = svg_element("stop");
    			stop167 = svg_element("stop");
    			linearGradient84 = svg_element("linearGradient");
    			stop168 = svg_element("stop");
    			stop169 = svg_element("stop");
    			linearGradient85 = svg_element("linearGradient");
    			stop170 = svg_element("stop");
    			stop171 = svg_element("stop");
    			linearGradient86 = svg_element("linearGradient");
    			stop172 = svg_element("stop");
    			stop173 = svg_element("stop");
    			linearGradient87 = svg_element("linearGradient");
    			stop174 = svg_element("stop");
    			stop175 = svg_element("stop");
    			linearGradient88 = svg_element("linearGradient");
    			stop176 = svg_element("stop");
    			stop177 = svg_element("stop");
    			linearGradient89 = svg_element("linearGradient");
    			stop178 = svg_element("stop");
    			stop179 = svg_element("stop");
    			linearGradient90 = svg_element("linearGradient");
    			stop180 = svg_element("stop");
    			stop181 = svg_element("stop");
    			linearGradient91 = svg_element("linearGradient");
    			stop182 = svg_element("stop");
    			stop183 = svg_element("stop");
    			linearGradient92 = svg_element("linearGradient");
    			stop184 = svg_element("stop");
    			stop185 = svg_element("stop");
    			linearGradient93 = svg_element("linearGradient");
    			stop186 = svg_element("stop");
    			stop187 = svg_element("stop");
    			linearGradient94 = svg_element("linearGradient");
    			stop188 = svg_element("stop");
    			stop189 = svg_element("stop");
    			linearGradient95 = svg_element("linearGradient");
    			stop190 = svg_element("stop");
    			stop191 = svg_element("stop");
    			linearGradient96 = svg_element("linearGradient");
    			stop192 = svg_element("stop");
    			stop193 = svg_element("stop");
    			linearGradient97 = svg_element("linearGradient");
    			stop194 = svg_element("stop");
    			stop195 = svg_element("stop");
    			linearGradient98 = svg_element("linearGradient");
    			stop196 = svg_element("stop");
    			stop197 = svg_element("stop");
    			linearGradient99 = svg_element("linearGradient");
    			stop198 = svg_element("stop");
    			stop199 = svg_element("stop");
    			linearGradient100 = svg_element("linearGradient");
    			stop200 = svg_element("stop");
    			stop201 = svg_element("stop");
    			linearGradient101 = svg_element("linearGradient");
    			stop202 = svg_element("stop");
    			stop203 = svg_element("stop");
    			linearGradient102 = svg_element("linearGradient");
    			stop204 = svg_element("stop");
    			stop205 = svg_element("stop");
    			linearGradient103 = svg_element("linearGradient");
    			stop206 = svg_element("stop");
    			stop207 = svg_element("stop");
    			linearGradient104 = svg_element("linearGradient");
    			stop208 = svg_element("stop");
    			stop209 = svg_element("stop");
    			linearGradient105 = svg_element("linearGradient");
    			stop210 = svg_element("stop");
    			stop211 = svg_element("stop");
    			linearGradient106 = svg_element("linearGradient");
    			stop212 = svg_element("stop");
    			stop213 = svg_element("stop");
    			linearGradient107 = svg_element("linearGradient");
    			stop214 = svg_element("stop");
    			stop215 = svg_element("stop");
    			linearGradient108 = svg_element("linearGradient");
    			stop216 = svg_element("stop");
    			stop217 = svg_element("stop");
    			linearGradient109 = svg_element("linearGradient");
    			stop218 = svg_element("stop");
    			stop219 = svg_element("stop");
    			linearGradient110 = svg_element("linearGradient");
    			stop220 = svg_element("stop");
    			stop221 = svg_element("stop");
    			linearGradient111 = svg_element("linearGradient");
    			stop222 = svg_element("stop");
    			stop223 = svg_element("stop");
    			linearGradient112 = svg_element("linearGradient");
    			stop224 = svg_element("stop");
    			stop225 = svg_element("stop");
    			linearGradient113 = svg_element("linearGradient");
    			stop226 = svg_element("stop");
    			stop227 = svg_element("stop");
    			linearGradient114 = svg_element("linearGradient");
    			stop228 = svg_element("stop");
    			stop229 = svg_element("stop");
    			attr_dev(rect, "y", "0.000244141");
    			attr_dev(rect, "width", "1280");
    			attr_dev(rect, "height", "900");
    			attr_dev(rect, "fill", "#D9D9D9");
    			add_location(rect, file$c, 2, 0, 252);
    			attr_dev(mask, "id", "mask0_637_19820");
    			set_style(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "1280");
    			attr_dev(mask, "height", "901");
    			add_location(mask, file$c, 1, 0, 134);
    			attr_dev(path0, "d", "M1072.11 379.945L1087.31 384.184C1106.72 338.467 1105.46 262.553 1103.23 213.449L1096.41 213.396C1094.26 266.286 1092.85 330.448 1072.11 379.945Z");
    			attr_dev(path0, "fill", "url(#paint0_linear_637_19820)");
    			add_location(path0, file$c, 5, 0, 361);
    			attr_dev(path1, "d", "M1098.85 232.394C1100.44 235.628 1111.7 232.663 1115.19 230.916C1112.92 222.609 1107.38 181.785 1098.42 178.577C1096.25 177.801 1092.6 178.587 1089.56 182.638C1086.2 187.092 1083.79 203.071 1085.2 210.933C1086.91 220.522 1097.26 229.159 1098.85 232.394Z");
    			attr_dev(path1, "fill", "#B83535");
    			add_location(path1, file$c, 6, 0, 557);
    			attr_dev(path2, "d", "M1087.41 217.88C1088.01 210.761 1102.08 173.883 1113.23 181.637C1131.98 194.668 1130.11 229.022 1108.93 240.011C1094.03 247.743 1086.4 230.045 1087.41 217.88Z");
    			attr_dev(path2, "fill", "url(#paint1_linear_637_19820)");
    			add_location(path2, file$c, 7, 0, 839);
    			attr_dev(path3, "d", "M1107.48 216.793C1109.92 232.812 1101.6 249.673 1083.73 241.209C1059.98 229.962 1058.6 197.359 1075.81 181.345C1086.94 170.986 1106.2 208.441 1107.48 216.793Z");
    			attr_dev(path3, "fill", "url(#paint2_linear_637_19820)");
    			add_location(path3, file$c, 8, 0, 1048);
    			attr_dev(path4, "d", "M311.311 377.238L299.333 373.102C287.574 313.1 304.23 234.141 319.916 176.143L321.434 188.227C310.902 247.149 300.013 318.064 311.311 377.238Z");
    			attr_dev(path4, "fill", "url(#paint3_linear_637_19820)");
    			add_location(path4, file$c, 9, 0, 1257);
    			attr_dev(path5, "d", "M333.029 172.917L315.334 169.595C316.286 163.148 323.719 155.719 327.326 156.781C328.802 157.215 332.967 163.225 333.029 172.917Z");
    			attr_dev(path5, "fill", "url(#paint4_linear_637_19820)");
    			add_location(path5, file$c, 10, 0, 1450);
    			attr_dev(path6, "d", "M319.655 175.209C321.433 171.036 328.122 167.98 333.543 163.903C335.251 169.208 332.859 177.856 330.584 181.842C327.742 186.826 320.589 188.644 318.395 187.315C316.201 185.985 317.919 179.282 319.655 175.209Z");
    			attr_dev(path6, "fill", "#57661F");
    			add_location(path6, file$c, 11, 0, 1630);
    			attr_dev(path7, "d", "M325.256 178.039C324.159 172.761 319.289 163.566 317.241 160.363C313.614 164.328 311.687 172.593 311.956 177.175C312.292 182.902 317.67 188.218 320.227 188.001C322.783 187.783 326.156 182.374 325.256 178.039Z");
    			attr_dev(path7, "fill", "#57661F");
    			add_location(path7, file$c, 12, 0, 1867);
    			attr_dev(path8, "d", "M313.581 244.523C309.29 252.404 307.179 279.14 306.659 291.522C310.557 273.881 318.032 268.234 328.473 251.338C336.943 237.63 342.536 220.236 338.374 205.656C332.137 218.901 317.584 237.171 313.581 244.523Z");
    			attr_dev(path8, "fill", "url(#paint5_linear_637_19820)");
    			add_location(path8, file$c, 13, 0, 2104);
    			attr_dev(path9, "d", "M865.539 417.604L881.346 420.807C899.376 364.926 902.683 315.98 894.093 257.38L887.193 257.782C890.699 317.867 883.44 361.187 865.539 417.604Z");
    			attr_dev(path9, "fill", "url(#paint6_linear_637_19820)");
    			add_location(path9, file$c, 14, 0, 2361);
    			attr_dev(path10, "d", "M858.173 219.359C856.411 221.819 862.185 245.281 866.68 252.165C876.443 267.119 893.078 273.122 906.335 259.021C900.798 252.582 869.115 204.08 858.173 219.359Z");
    			attr_dev(path10, "fill", "url(#paint7_linear_637_19820)");
    			add_location(path10, file$c, 15, 0, 2554);
    			attr_dev(path11, "d", "M886.013 268.35C888.573 271.113 903.103 262.5 906.003 259.416C913.931 250.983 915.449 239.781 913.075 228.976C909.342 221.478 902.467 202.516 893.63 199.194C879.97 194.057 874.057 210.284 871.792 219.627C869.264 239.932 871.991 253.224 886.013 268.35Z");
    			attr_dev(path11, "fill", "url(#paint8_linear_637_19820)");
    			add_location(path11, file$c, 16, 0, 2764);
    			attr_dev(path12, "d", "M903.396 476.315L888.817 476.367C853.285 415.659 841.423 323.584 836.459 254.642L842.691 267.191C853.604 335.181 868.678 416.332 903.396 476.315Z");
    			attr_dev(path12, "fill", "url(#paint9_linear_637_19820)");
    			add_location(path12, file$c, 17, 0, 3066);
    			attr_dev(path13, "d", "M848.476 248.163L827.997 251.268C826.586 243.905 831.841 233.017 836.162 232.801C837.929 232.713 844.732 237.66 848.476 248.163Z");
    			attr_dev(path13, "fill", "url(#paint10_linear_637_19820)");
    			add_location(path13, file$c, 18, 0, 3262);
    			attr_dev(path14, "d", "M834.821 255.726C835.169 250.52 841.274 244.663 845.615 238.178C849.483 243.292 850.165 253.592 849.207 258.785C848.01 265.275 840.932 269.964 838.044 269.352C835.157 268.741 834.48 260.808 834.821 255.726Z");
    			attr_dev(path14, "fill", "#57661F");
    			add_location(path14, file$c, 19, 0, 3442);
    			attr_dev(path15, "d", "M841.977 256.675C838.784 251.359 830.006 243.219 826.567 240.518C824.132 246.199 825.174 255.907 827.204 260.782C829.742 266.875 837.6 270.608 840.294 269.402C842.988 268.196 844.599 261.042 841.977 256.675Z");
    			attr_dev(path15, "fill", "#57661F");
    			add_location(path15, file$c, 20, 0, 3677);
    			attr_dev(path16, "d", "M856.154 331.261C855.275 341.546 862.333 371.286 866.466 384.932C864.007 364.293 869.984 355.325 874.914 333.013C878.914 314.912 878.389 293.898 868.338 279.642C865 290 859 298 856.154 331.261Z");
    			attr_dev(path16, "fill", "url(#paint11_linear_637_19820)");
    			add_location(path16, file$c, 21, 0, 3913);
    			attr_dev(path17, "d", "M1249.73 543.087L1275.29 538.918C1277.56 431.939 1260.5 345.876 1220.93 250.512L1210.58 255.422C1243.07 356.445 1251.56 435.268 1249.73 543.087Z");
    			attr_dev(path17, "fill", "url(#paint12_linear_637_19820)");
    			add_location(path17, file$c, 22, 0, 4158);
    			attr_dev(path18, "d", "M1138.17 205.129C1136.51 210.415 1159.94 247.941 1171.69 257.353C1197.21 277.801 1229.57 278.755 1244.59 246.657C1231.29 238.612 1148.49 172.305 1138.17 205.129Z");
    			attr_dev(path18, "fill", "url(#paint13_linear_637_19820)");
    			add_location(path18, file$c, 23, 0, 4354);
    			attr_dev(path19, "d", "M1214.56 274.483C1220.59 277.829 1240.96 254.554 1244.24 247.533C1253.22 228.337 1249.47 207.981 1239.18 190.537C1228.41 179.622 1205.63 150.554 1188.36 149.815C1161.66 148.672 1160.63 180.277 1162.02 197.825C1169.2 234.596 1181.53 256.165 1214.56 274.483Z");
    			attr_dev(path19, "fill", "url(#paint14_linear_637_19820)");
    			add_location(path19, file$c, 24, 0, 4567);
    			attr_dev(path20, "d", "M1280 173.878L1247.48 165.485C1242.2 157.424 1238.69 152.954 1250.01 148.911C1253.15 147.789 1253.44 138.541 1259.29 136.626C1263.98 135.094 1269.21 134.241 1276.91 136.852C1277.09 132.008 1278.24 129.536 1280 128.773C1280 133 1280 155.5 1280 173.878Z");
    			attr_dev(path20, "fill", "#FFCD59");
    			add_location(path20, file$c, 25, 0, 4875);
    			attr_dev(path21, "d", "M1262.38 158.514C1272.4 154.093 1268.06 137.185 1280 141.805C1280 162 1280 167 1280 194.959C1273.89 193.657 1268.08 191.195 1263.93 188.465C1259.32 185.428 1235.5 165.443 1242.86 158.642C1250.65 151.434 1255.44 161.576 1262.38 158.514Z");
    			attr_dev(path21, "fill", "url(#paint15_linear_637_19820)");
    			add_location(path21, file$c, 26, 0, 5155);
    			attr_dev(path22, "d", "M578.242 449.809L592.125 453.295C624.02 372.733 633.57 300.975 626.526 213.864L622.699 229.013C622.155 311.715 607.668 374.414 578.242 449.809Z");
    			attr_dev(path22, "fill", "url(#paint16_linear_637_19820)");
    			add_location(path22, file$c, 27, 0, 5442);
    			attr_dev(path23, "d", "M605.777 224.686C604.78 221.61 606.065 208.794 608.063 206.371C615.921 196.835 623.804 210.154 627.352 216.56C628.539 218.703 629.459 236.617 629.971 239.848C630.483 243.079 621.513 243.786 619.994 243.516C618.474 243.247 607.024 228.53 605.777 224.686Z");
    			attr_dev(path23, "fill", "url(#paint17_linear_637_19820)");
    			add_location(path23, file$c, 28, 0, 5637);
    			attr_dev(path24, "d", "M630.141 242.034C629.139 241.244 632.373 232.429 633.656 228.94C636.923 220.056 643.287 212.688 646.594 212.861C649.901 213.035 651.697 216.5 652.558 220.985C653.986 228.42 651.394 232.758 646.375 237.801C642.806 241.388 632.864 244.179 630.141 242.034Z");
    			attr_dev(path24, "fill", "url(#paint18_linear_637_19820)");
    			add_location(path24, file$c, 29, 0, 5942);
    			attr_dev(path25, "d", "M625.562 241.863C629.287 245.683 619.383 244.314 617.927 244.055C605.263 241.808 591.487 231.98 597.505 217.449C600.897 209.258 623.038 239.274 625.562 241.863Z");
    			attr_dev(path25, "fill", "url(#paint19_linear_637_19820)");
    			add_location(path25, file$c, 30, 0, 6247);
    			attr_dev(path26, "d", "M625.387 244.196C623.782 244.086 619.635 229.253 620.084 224.578C620.704 218.132 622.811 203.838 629.895 202.868C634.029 202.302 637.936 208.118 639.856 213.557C643.407 223.618 641.852 229.355 636.643 237.656C633.247 243.067 629.858 244.503 625.387 244.196Z");
    			attr_dev(path26, "fill", "url(#paint20_linear_637_19820)");
    			add_location(path26, file$c, 31, 0, 6459);
    			attr_dev(path27, "d", "M428.927 472.823L412.52 476.262C378.644 385.557 369.54 305.178 379.312 208.006L384.374 225.036C383.176 317.448 397.697 387.946 428.927 472.823Z");
    			attr_dev(path27, "fill", "url(#paint21_linear_637_19820)");
    			add_location(path27, file$c, 32, 0, 6768);
    			attr_dev(path28, "d", "M410.822 201.956C412.348 197.544 410.854 179.005 408.039 175.449C396.962 161.461 385.205 180.468 379.902 189.616C378.128 192.677 376.294 218.515 375.464 223.165C374.634 227.816 387.564 229.088 389.766 228.742C391.967 228.396 408.913 207.472 410.822 201.956Z");
    			attr_dev(path28, "fill", "url(#paint22_linear_637_19820)");
    			add_location(path28, file$c, 33, 0, 6963);
    			attr_dev(path29, "d", "M375.157 226.315C376.627 225.204 372.206 212.385 370.452 207.311C365.986 194.393 357.005 183.576 352.226 183.733C347.446 183.891 344.756 188.842 343.386 195.294C341.115 205.987 344.735 212.323 351.839 219.747C356.89 225.026 371.165 229.335 375.157 226.315Z");
    			attr_dev(path29, "fill", "url(#paint23_linear_637_19820)");
    			add_location(path29, file$c, 34, 0, 7272);
    			attr_dev(path30, "d", "M381.772 226.199C376.288 231.608 390.625 229.911 392.734 229.579C411.082 226.692 431.249 212.891 422.97 191.741C418.303 179.82 385.49 222.532 381.772 226.199Z");
    			attr_dev(path30, "fill", "url(#paint24_linear_637_19820)");
    			add_location(path30, file$c, 35, 0, 7580);
    			attr_dev(path31, "d", "M381.96 229.572C384.28 229.458 390.686 208.159 390.169 201.397C389.456 192.073 386.817 171.377 376.618 169.776C370.664 168.842 364.859 177.13 361.934 184.928C356.524 199.353 358.607 207.68 365.894 219.811C370.644 227.719 375.495 229.888 381.96 229.572Z");
    			attr_dev(path31, "fill", "url(#paint25_linear_637_19820)");
    			add_location(path31, file$c, 36, 0, 7790);
    			attr_dev(path32, "d", "M356.501 368.312C360.039 392.616 365.51 459.744 367.066 480.168C360.883 450.65 343.148 417.879 335.001 379.158C328.925 350.276 320.587 313.252 320.587 263.193C333.501 299.904 348.001 309.915 356.501 368.312Z");
    			attr_dev(path32, "fill", "url(#paint26_linear_637_19820)");
    			add_location(path32, file$c, 37, 0, 8094);
    			attr_dev(path33, "d", "M568.707 460.496L556.5 480.5C531 420 519.683 373.145 505.264 210.653L515.916 237.17C536.408 397.446 556.5 448.999 568.707 460.496Z");
    			attr_dev(path33, "fill", "url(#paint27_linear_637_19820)");
    			add_location(path33, file$c, 38, 0, 8353);
    			attr_dev(path34, "d", "M487.13 256.16C493.469 265.659 500.892 268.981 505.278 271.671L531.158 208.118C527.551 198.308 525.934 192.353 515.088 199.591C512.077 201.6 503.837 195.867 498.378 199.726C494.011 202.813 489.879 206.822 487.17 215.214C465.493 200.291 479.729 245.069 487.13 256.16Z");
    			attr_dev(path34, "fill", "#FFCD59");
    			add_location(path34, file$c, 39, 0, 8535);
    			attr_dev(path35, "d", "M515.442 216.582C503.209 223.523 488.77 201.63 488.331 231.61C488.18 241.899 495.306 269.177 507.337 272.992C527.627 279.428 539.626 252.954 540.517 237.323C540.857 231.342 538.872 197.666 528.19 199.665C516.87 201.783 522.6 212.52 515.442 216.582Z");
    			attr_dev(path35, "fill", "url(#paint28_linear_637_19820)");
    			add_location(path35, file$c, 40, 0, 8830);
    			attr_dev(path36, "d", "M53.9836 222.097L44.2942 219.608C48.531 189.382 74.0753 149.373 91.0402 124.411L94.7829 126.502C78.8879 154.942 58.7319 189.379 53.9836 222.097Z");
    			attr_dev(path36, "fill", "url(#paint29_linear_637_19820)");
    			add_location(path36, file$c, 41, 0, 9130);
    			attr_dev(path37, "d", "M95.3377 119.452C93.0552 120.894 86.8835 114.87 85.2903 112.483C89.9707 108.105 109.323 84.5156 116.383 85.813C118.09 86.1267 120.157 87.9692 120.574 91.6397C121.033 95.6756 116.433 106.602 112.486 111.019C107.672 116.407 97.6202 118.009 95.3377 119.452Z");
    			attr_dev(path37, "fill", "#B83535");
    			add_location(path37, file$c, 42, 0, 9326);
    			attr_dev(path38, "d", "M108.367 114.563C110.729 109.874 115.817 81.5128 105.577 82.2593C88.371 83.5138 76.3314 105.78 85.8501 120.509C92.5481 130.873 104.331 122.578 108.367 114.563Z");
    			attr_dev(path38, "fill", "url(#paint30_linear_637_19820)");
    			add_location(path38, file$c, 43, 0, 9609);
    			attr_dev(path39, "d", "M95.7537 106.466C87.9863 115.623 86.8826 129.286 101.761 130.577C121.529 132.291 135.004 112.326 130.004 95.9091C126.77 85.2894 99.8036 101.691 95.7537 106.466Z");
    			attr_dev(path39, "fill", "url(#paint31_linear_637_19820)");
    			add_location(path39, file$c, 44, 0, 9820);
    			attr_dev(path40, "d", "M777.222 398.847L763.891 401.075C754.058 362.959 765.912 301.847 774.589 263.169L780.303 263.648C774.7 305.879 766.781 357.502 777.222 398.847Z");
    			attr_dev(path40, "fill", "url(#paint32_linear_637_19820)");
    			add_location(path40, file$c, 45, 0, 10032);
    			attr_dev(path41, "d", "M774.222 268.887C772.407 271.511 762.914 267.815 760.078 265.956C763.142 259.033 773.276 224.444 781.551 222.59C783.551 222.143 786.65 223.19 788.8 226.987C791.164 231.163 791.215 245.167 788.966 251.793C786.223 259.876 776.036 266.264 774.222 268.887Z");
    			attr_dev(path41, "fill", "#B83535");
    			add_location(path41, file$c, 46, 0, 10227);
    			attr_dev(path42, "d", "M786.126 257.55C786.526 251.36 778.947 218.178 768.161 223.723C750.036 233.04 747.241 262.811 764.397 274.423C776.469 282.593 785.443 268.129 786.126 257.55Z");
    			attr_dev(path42, "fill", "url(#paint33_linear_637_19820)");
    			add_location(path42, file$c, 47, 0, 10508);
    			attr_dev(path43, "d", "M768.671 254.578C764.46 268.124 769.576 283.487 786.347 278.012C808.629 270.738 814.049 242.805 801.025 227.269C792.6 217.22 770.867 247.515 768.671 254.578Z");
    			attr_dev(path43, "fill", "url(#paint34_linear_637_19820)");
    			add_location(path43, file$c, 48, 0, 10717);
    			attr_dev(path44, "d", "M92.6127 368.727L76.9193 376.57C88.5003 306.499 113.5 224.999 170.942 127.127L165.98 156.371C131.5 216.999 110 293.499 92.6127 368.727Z");
    			attr_dev(path44, "fill", "url(#paint35_linear_637_19820)");
    			add_location(path44, file$c, 49, 0, 10926);
    			attr_dev(path45, "d", "M172.382 188.072C163.613 194.363 155.941 194.83 151.166 195.749L149.433 130.919C155.889 123.443 159.303 118.714 166.487 128.727C168.481 131.506 177.679 129.179 181.222 134.41C184.057 138.594 186.377 143.516 185.979 151.841C210.121 145.858 182.621 180.726 172.382 188.072Z");
    			attr_dev(path45, "fill", "#FFCD59");
    			add_location(path45, file$c, 50, 0, 11113);
    			attr_dev(path46, "d", "M160.517 143.638C169.026 153.85 189.087 139.293 179.493 165.957C176.201 175.108 160.817 196.863 148.905 196.233C128.815 195.17 127.015 167.758 131.432 153.636C133.122 148.232 146.091 119.106 154.874 124.43C164.18 130.073 155.538 137.662 160.517 143.638Z");
    			attr_dev(path46, "fill", "url(#paint36_linear_637_19820)");
    			add_location(path46, file$c, 51, 0, 11413);
    			attr_dev(path47, "d", "M104.946 353.432L92.9679 349.296C81.2093 289.294 97.8652 210.335 113.551 152.338L115.069 164.422C104.537 223.344 93.6483 294.258 104.946 353.432Z");
    			attr_dev(path47, "fill", "url(#paint37_linear_637_19820)");
    			add_location(path47, file$c, 52, 0, 11718);
    			attr_dev(path48, "d", "M126.664 149.111L108.969 145.79C109.921 139.342 117.354 131.914 120.961 132.975C122.437 133.41 126.602 139.419 126.664 149.111Z");
    			attr_dev(path48, "fill", "url(#paint38_linear_637_19820)");
    			add_location(path48, file$c, 53, 0, 11915);
    			attr_dev(path49, "d", "M113.29 151.403C115.068 147.231 121.757 144.175 127.178 140.097C128.886 145.402 126.494 154.05 124.219 158.037C121.377 163.02 114.224 164.839 112.03 163.509C109.836 162.18 111.554 155.476 113.29 151.403Z");
    			attr_dev(path49, "fill", "#57661F");
    			add_location(path49, file$c, 54, 0, 12094);
    			attr_dev(path50, "d", "M118.891 154.233C117.794 148.956 112.924 139.76 110.876 136.557C107.249 140.522 105.322 148.787 105.591 153.369C105.927 159.096 111.305 164.412 113.862 164.195C116.418 163.977 119.791 158.568 118.891 154.233Z");
    			attr_dev(path50, "fill", "#57661F");
    			add_location(path50, file$c, 55, 0, 12326);
    			attr_dev(path51, "d", "M52.4696 109.252C54.893 104.563 56.2275 83.5812 53.6547 79.1475C43.5314 61.7024 27.2972 81.0593 19.8815 90.4331C17.4005 93.5693 11.1592 122.177 9.47671 127.244C7.79422 132.312 22.0527 135.833 24.5714 135.802C27.09 135.771 49.4403 115.112 52.4696 109.252Z");
    			attr_dev(path51, "fill", "url(#paint39_linear_637_19820)");
    			add_location(path51, file$c, 56, 0, 12563);
    			attr_dev(path52, "d", "M8.62233 130.718C10.4464 129.713 7.07488 114.731 6.44029 108.696C4.99997 94.9997 -1.76785e-05 98.9998 -8.1983e-05 130.238C3.57991 131.393 6.79907 131.723 8.62233 130.718Z");
    			attr_dev(path52, "fill", "url(#paint40_linear_637_19820)");
    			add_location(path52, file$c, 57, 0, 12869);
    			attr_dev(path53, "d", "M16.0419 131.661C9.02899 136.823 25.3427 137.249 27.7565 137.22C48.75 136.965 73.5479 124.796 67.7156 99.7935C64.4283 85.7013 20.7953 128.162 16.0419 131.661Z");
    			attr_dev(path53, "fill", "url(#paint41_linear_637_19820)");
    			add_location(path53, file$c, 58, 0, 13091);
    			attr_dev(path54, "d", "M15.7046 135.464C18.318 135.714 28.938 112.926 29.4562 105.277C30.1706 94.7309 30.5741 71.1503 19.4237 67.7059C12.9149 65.6954 4.53661 74.7502 1.08314e-06 82.9998C1.03321e-06 100.5 1.08941e-06 109 1.46273e-06 123.5C4.03183 133.117 8.42156 134.77 15.7046 135.464Z");
    			attr_dev(path54, "fill", "url(#paint42_linear_637_19820)");
    			add_location(path54, file$c, 59, 0, 13301);
    			attr_dev(path55, "d", "M1055.55 510.548L1078.95 495.12C1081.54 377.665 1063.13 314.633 1007.47 181.061L1013.38 219.393C1061.33 355.754 1057 395.504 1055.55 510.548Z");
    			attr_dev(path55, "fill", "url(#paint43_linear_637_19820)");
    			add_location(path55, file$c, 60, 0, 13615);
    			attr_dev(path56, "d", "M993.218 252.329C1003.8 262.166 1013.91 264.178 1020.1 266.253L1033.51 181.7C1026.21 170.733 1022.49 163.92 1011.22 175.717C1008.1 178.991 996.268 174.265 990.662 180.466C986.177 185.426 982.249 191.446 981.353 202.416C950.286 190.177 980.866 240.843 993.218 252.329Z");
    			attr_dev(path56, "fill", "#FFCD59");
    			add_location(path56, file$c, 61, 0, 13808);
    			attr_dev(path57, "d", "M1016.6 196.326C1003.54 208.142 979.371 185.422 987.554 222.08C990.363 234.661 1007.08 265.949 1023.03 267.298C1049.91 269.574 1057 234.018 1053.55 214.724C1052.23 207.342 1039.98 166.845 1027.4 172.212C1014.06 177.899 1024.25 189.412 1016.6 196.326Z");
    			attr_dev(path57, "fill", "url(#paint44_linear_637_19820)");
    			add_location(path57, file$c, 62, 0, 14104);
    			attr_dev(path58, "d", "M1136.66 432.432L1148.64 428.296C1160.4 368.294 1143.75 289.336 1128.06 231.338L1126.54 243.422C1137.07 302.344 1147.96 373.258 1136.66 432.432Z");
    			attr_dev(path58, "fill", "url(#paint45_linear_637_19820)");
    			add_location(path58, file$c, 63, 0, 14406);
    			attr_dev(path59, "d", "M1114.95 228.112L1132.64 224.79C1131.69 218.343 1124.26 210.914 1120.65 211.976C1119.17 212.41 1115.01 218.419 1114.95 228.112Z");
    			attr_dev(path59, "fill", "url(#paint46_linear_637_19820)");
    			add_location(path59, file$c, 64, 0, 14602);
    			attr_dev(path60, "d", "M1128.32 230.404C1126.54 226.231 1119.85 223.175 1114.43 219.097C1112.72 224.402 1115.12 233.05 1117.39 237.037C1120.23 242.02 1127.39 243.839 1129.58 242.509C1131.77 241.18 1130.06 234.477 1128.32 230.404Z");
    			attr_dev(path60, "fill", "#57661F");
    			add_location(path60, file$c, 65, 0, 14781);
    			attr_dev(path61, "d", "M1122.72 233.233C1123.82 227.956 1128.69 218.76 1130.73 215.558C1134.36 219.522 1136.29 227.788 1136.02 232.369C1135.68 238.097 1130.31 243.413 1127.75 243.195C1125.19 242.978 1121.82 237.568 1122.72 233.233Z");
    			attr_dev(path61, "fill", "#57661F");
    			add_location(path61, file$c, 66, 0, 15016);
    			attr_dev(path62, "d", "M1134.39 300.718C1138.69 308.598 1140.8 335.334 1141.32 347.717C1137.42 330.075 1129.94 324.429 1119.5 307.533C1111.03 293.825 1105.44 276.43 1109.6 261.85C1115.84 275.095 1130.39 293.366 1134.39 300.718Z");
    			attr_dev(path62, "fill", "url(#paint47_linear_637_19820)");
    			add_location(path62, file$c, 67, 0, 15253);
    			attr_dev(path63, "d", "M1233.24 265.074C1227.71 257.434 1219.76 220.709 1223.12 212.188C1234.9 182.382 1262.95 202.689 1280 217.815C1279.91 246.5 1279.91 265.074 1279.91 300C1265.05 291.222 1238.43 272.238 1233.24 265.074Z");
    			attr_dev(path63, "fill", "url(#paint48_linear_637_19820)");
    			add_location(path63, file$c, 68, 0, 15509);
    			attr_dev(path64, "d", "M1280 308.422C1243.62 311.856 1200.27 296.386 1203.78 252.422C1205.24 234.024 1250.7 261.048 1280 279.822C1280 291 1280 296 1280 308.422Z");
    			attr_dev(path64, "fill", "url(#paint49_linear_637_19820)");
    			add_location(path64, file$c, 69, 0, 15760);
    			attr_dev(path65, "d", "M1280 268.252C1276.45 261.793 1273.72 255.827 1272.85 251.916C1268.78 233.469 1261.21 192.059 1280 183C1280 879.221 1280 -506.161 1280 268.252Z");
    			attr_dev(path65, "fill", "url(#paint50_linear_637_19820)");
    			add_location(path65, file$c, 70, 0, 15949);
    			attr_dev(path66, "d", "M852.5 564L822.529 567.535C765 493 731.617 429.18 689.214 235.667L709.709 265.289C732 384.5 787 492 852.5 564Z");
    			attr_dev(path66, "fill", "url(#paint51_linear_637_19820)");
    			add_location(path66, file$c, 71, 0, 16144);
    			attr_dev(path67, "d", "M743.141 279.48C740.591 292.639 734.064 299.605 730.537 304.508L673.675 247.461C673.126 235.205 672.173 228.025 687.2 230.936C691.37 231.745 697.688 221.798 705.349 223.498C711.477 224.857 717.77 227.321 724.511 235.176C741.202 209.182 746.118 264.115 743.141 279.48Z");
    			attr_dev(path67, "fill", "#FFCD59");
    			add_location(path67, file$c, 72, 0, 16306);
    			attr_dev(path68, "d", "M694.529 249.489C710.922 251.45 716.614 221.197 730.697 253.451C735.531 264.52 740.199 297.281 728.908 306.873C709.866 323.049 684.86 299.839 676.801 283.323C673.718 277.003 660.581 239.648 673.051 236.963C686.266 234.118 684.937 248.342 694.529 249.489Z");
    			attr_dev(path68, "fill", "url(#paint52_linear_637_19820)");
    			add_location(path68, file$c, 73, 0, 16602);
    			attr_dev(path69, "d", "M728.635 431.595C743.003 443.428 772.939 493.859 786.111 517.595C762.572 486.389 745.626 481.55 712.945 457.208C686.43 437.459 660.577 408.136 652.283 376.241C674.959 396.933 715.231 420.557 728.635 431.595Z");
    			attr_dev(path69, "fill", "url(#paint53_linear_637_19820)");
    			add_location(path69, file$c, 74, 0, 16908);
    			attr_dev(path70, "d", "M184.461 654.336L150.588 656.474C132.54 554.511 172.971 398.628 201.511 300.291L215.78 303.11C194.341 411.543 165.448 543.798 184.461 654.336Z");
    			attr_dev(path70, "fill", "url(#paint54_linear_637_19820)");
    			add_location(path70, file$c, 75, 0, 17167);
    			attr_dev(path71, "d", "M209.822 300.456C203.401 308.194 174.607 293.97 166.215 287.35C177.747 266.456 219.111 160.628 245.607 157.091C252.012 156.236 261.455 160.38 267.159 172.898C273.432 186.663 269.728 230.653 260.839 250.842C249.996 275.468 216.244 292.718 209.822 300.456Z");
    			attr_dev(path71, "fill", "#B83535");
    			add_location(path71, file$c, 76, 0, 17361);
    			attr_dev(path72, "d", "M250.333 268.138C253.296 248.81 238.648 142.515 203.246 156.953C143.758 181.213 126.768 273.934 177.442 315.13C213.099 344.118 245.269 301.169 250.333 268.138Z");
    			attr_dev(path72, "fill", "url(#paint55_linear_637_19820)");
    			add_location(path72, file$c, 77, 0, 17644);
    			attr_dev(path73, "d", "M196.338 253.99C179.379 295.367 191.207 345.023 245.382 332.456C317.361 315.759 342.085 229.534 305.472 177.156C281.787 143.273 205.181 232.417 196.338 253.99Z");
    			attr_dev(path73, "fill", "url(#paint56_linear_637_19820)");
    			add_location(path73, file$c, 78, 0, 17855);
    			attr_dev(path74, "d", "M133.151 671.806C132.204 708.804 102.11 804.049 87.1817 847.046C101.629 778.105 92.8012 740.888 92.1494 658.543C91.6206 591.735 102.087 519.504 129.976 480.492C126.28 540.307 134.034 637.289 133.151 671.806Z");
    			attr_dev(path74, "fill", "url(#paint57_linear_637_19820)");
    			add_location(path74, file$c, 79, 0, 18066);
    			attr_dev(path75, "d", "M547.961 484.511L564.548 489.058C583.998 440.322 579.979 358.812 575.939 307.08L568.569 307.01C568.047 363.021 568.771 431.619 547.961 484.511Z");
    			attr_dev(path75, "fill", "url(#paint58_linear_637_19820)");
    			add_location(path75, file$c, 80, 0, 18325);
    			attr_dev(path76, "d", "M573.753 296.011C575.93 300.111 590.28 296.381 594.695 294.176C591.441 283.649 582.665 231.93 571.019 227.847C568.203 226.86 563.546 227.848 559.794 232.972C555.668 238.606 553.217 258.839 555.342 268.8C557.935 280.949 571.576 291.911 573.753 296.011Z");
    			attr_dev(path76, "fill", "#B83535");
    			add_location(path76, file$c, 81, 0, 18520);
    			attr_dev(path77, "d", "M558.47 277.604C558.943 268.588 575.531 221.911 590.181 231.757C614.798 248.302 613.785 291.809 587.015 305.681C568.178 315.442 557.662 293.01 558.47 277.604Z");
    			attr_dev(path77, "fill", "url(#paint59_linear_637_19820)");
    			add_location(path77, file$c, 82, 0, 18800);
    			attr_dev(path78, "d", "M584.205 276.27C587.992 296.565 577.989 317.903 554.678 307.143C523.705 292.846 520.613 251.549 542.075 231.304C555.959 218.208 582.231 265.689 584.205 276.27Z");
    			attr_dev(path78, "fill", "url(#paint60_linear_637_19820)");
    			add_location(path78, file$c, 83, 0, 19010);
    			attr_dev(path79, "d", "M584.481 382.348C575.479 397.801 563.453 447.634 558.565 470.62C570.227 437.215 583.224 425.227 604.372 391.837C621.529 364.748 635.63 331.447 634.283 305.378C620.602 331.147 592.879 367.931 584.481 382.348Z");
    			attr_dev(path79, "fill", "url(#paint61_linear_637_19820)");
    			add_location(path79, file$c, 84, 0, 19221);
    			attr_dev(path80, "d", "M417.279 460.484L398.337 461.205C388.011 392.969 393.45 335.569 414.517 269.224L422.445 270.997C406.993 340.028 407.205 391.652 417.279 460.484Z");
    			attr_dev(path80, "fill", "url(#paint62_linear_637_19820)");
    			add_location(path80, file$c, 85, 0, 19480);
    			attr_dev(path81, "d", "M463.388 231.927C464.965 235.115 453.821 261.235 447.304 268.369C433.146 283.864 412.712 287.676 400.006 268.807C407.649 262.387 453.59 212.132 463.388 231.927Z");
    			attr_dev(path81, "fill", "url(#paint63_linear_637_19820)");
    			add_location(path81, file$c, 86, 0, 19676);
    			attr_dev(path82, "d", "M421.812 283.48C418.318 286.199 403.096 273.456 400.317 269.328C392.718 258.044 393.08 244.763 397.882 232.68C403.632 224.69 415.2 203.998 426.079 201.818C442.898 198.449 446.682 218.391 447.539 229.658C446.624 253.69 440.942 268.59 421.812 283.48Z");
    			attr_dev(path82, "fill", "url(#paint64_linear_637_19820)");
    			add_location(path82, file$c, 87, 0, 19888);
    			attr_dev(path83, "d", "M0.000161372 246C5.50029 235.5 2.50029 240.5 9.29782 227.726L23.6227 233.374C14.0649 257.603 6.20972 279.487 0.000168769 297.588C0.000174531 270.5 7.66142e-05 255.5 0.000161372 246Z");
    			attr_dev(path83, "fill", "url(#paint65_linear_637_19820)");
    			add_location(path83, file$c, 88, 0, 20188);
    			attr_dev(path84, "d", "M111.765 172.234C113.783 178.667 85.2446 224.308 70.9451 235.752C47.8626 254.225 20.1865 259.6 -0.000119585 245.113C-0.000196046 218 -0.000225284 226.5 -0.000115753 210.367C34.2768 186.131 101.666 140.05 111.765 172.234Z");
    			attr_dev(path84, "fill", "url(#paint66_linear_637_19820)");
    			add_location(path84, file$c, 89, 0, 20421);
    			attr_dev(path85, "d", "M18.7711 256.563C15.186 258.549 7.44639 252.808 1.187e-05 245.419C1.50309e-05 206 1.56826e-05 201 1.47253e-05 145.5C13.1144 132.227 29.73 105.784 50.7421 104.897C83.226 103.525 84.4555 141.981 82.7536 163.331C73.9829 208.065 58.9675 234.299 18.7711 256.563Z");
    			attr_dev(path85, "fill", "url(#paint67_linear_637_19820)");
    			add_location(path85, file$c, 90, 0, 20693);
    			attr_dev(path86, "d", "M308.964 802.308L269.49 799.741C245.843 639.587 259.085 504.983 309.063 349.529L322.678 357.854C285.851 519.655 285.912 640.758 308.964 802.308Z");
    			attr_dev(path86, "fill", "url(#paint68_linear_637_19820)");
    			add_location(path86, file$c, 91, 0, 21002);
    			attr_dev(path87, "d", "M319.294 596.225C309.989 633.206 314.447 716.78 307.395 747.649C323.777 705.738 339.045 699.25 356.626 646.438C377.348 584.189 375.147 482.307 373.875 442.835C350.968 493.822 331.347 548.33 319.294 596.225Z");
    			attr_dev(path87, "fill", "url(#paint69_linear_637_19820)");
    			add_location(path87, file$c, 92, 0, 21198);
    			attr_dev(path88, "d", "M280.395 323.892C280.395 342.212 287.343 353.256 290.8 360.751L381.931 298.99C385.855 282.687 389 273.3 368.08 273.3C362.274 273.3 356.382 258.31 345.661 258.599C337.085 258.83 328 260.5 316.913 269.287C301.275 230.068 280.395 302.5 280.395 323.892Z");
    			attr_dev(path88, "fill", "#FFCD59");
    			add_location(path88, file$c, 93, 0, 21456);
    			attr_dev(path89, "d", "M353.421 296.288C330.916 294.657 331.144 252.583 303.86 292.2C294.496 305.796 279.714 348.542 292.371 364.348C313.716 391.005 353.304 366.363 368.412 346.297C374.193 338.618 401.533 291.91 385.498 285.065C368.506 277.812 366.591 297.243 353.421 296.288Z");
    			attr_dev(path89, "fill", "url(#paint70_linear_637_19820)");
    			add_location(path89, file$c, 94, 0, 21734);
    			attr_dev(path90, "d", "M49.7554 813.011L1.80113 804.019C14.797 626.877 31.1824 485.922 121.892 331.429L140.779 340.399C62.6315 504.835 63.7234 634.516 49.7554 813.011Z");
    			attr_dev(path90, "fill", "url(#paint71_linear_637_19820)");
    			add_location(path90, file$c, 95, 0, 22039);
    			attr_dev(path91, "d", "M230.907 357.76C242.043 345.647 263.273 283.633 259.172 268.186C243.038 207.409 178.326 252.31 148.33 274.419C138.294 281.817 96.049 362.74 86.8303 376.602C77.6116 390.464 117.609 412.752 125.21 414.727C132.811 416.702 216.987 372.902 230.907 357.76Z");
    			attr_dev(path91, "fill", "url(#paint72_linear_637_19820)");
    			add_location(path91, file$c, 96, 0, 22235);
    			attr_dev(path92, "d", "M81.4105 386.35C87.7219 384.823 91.4538 337.184 92.917 318.323C96.6429 270.296 82.8218 222.715 67.155 216.506C51.4882 210.297 35.8343 222.517 22.3375 241.443C-0.0302466 272.808 2.76051 298.371 15.2841 332.348C24.1891 356.507 64.2628 390.499 81.4105 386.35Z");
    			attr_dev(path92, "fill", "url(#paint73_linear_637_19820)");
    			add_location(path92, file$c, 97, 0, 22537);
    			attr_dev(path93, "d", "M102.953 395.272C77.6248 405.044 126.343 419.712 133.627 421.604C196.98 438.064 281.551 421.809 284.524 341.822C286.199 296.739 120.122 388.649 102.953 395.272Z");
    			attr_dev(path93, "fill", "url(#paint74_linear_637_19820)");
    			add_location(path93, file$c, 98, 0, 22845);
    			attr_dev(path94, "d", "M98.8181 406.437C106.474 409.331 157.115 349.503 164.949 326.922C175.751 295.789 196.314 225.195 165.602 205.686C147.674 194.298 117.266 212.924 96.8523 234.014C59.0901 273.027 54.1187 302.864 60.6167 352.311C64.8526 384.544 77.4821 398.372 98.8181 406.437Z");
    			attr_dev(path94, "fill", "url(#paint75_linear_637_19820)");
    			add_location(path94, file$c, 99, 0, 23057);
    			attr_dev(path95, "d", "M63.5759 573.554C36.6275 612.306 35.6519 662.421 31.4352 709.36C76.4833 643.944 67.7968 659.098 112.214 607.617C158.489 553.982 194.453 523.579 201.607 457.309C153.857 517.747 93.1402 531.041 63.5759 573.554Z");
    			attr_dev(path95, "fill", "url(#paint76_linear_637_19820)");
    			add_location(path95, file$c, 100, 0, 23366);
    			attr_dev(path96, "d", "M1001.23 814.18L1037.65 809.639C1058.5 624.027 1037.84 469.352 973.99 292.106L972.505 326.348C1018.08 498.705 1019.87 640.713 1001.23 814.18Z");
    			attr_dev(path96, "fill", "url(#paint77_linear_637_19820)");
    			add_location(path96, file$c, 101, 0, 23626);
    			attr_dev(path97, "d", "M912.192 295.563C907.266 288.023 901.368 252.632 904.968 244.659C919.135 213.289 950.048 243.342 964.261 257.973C969.016 262.868 984.565 310.356 988.298 318.668C992.032 326.981 968.434 335.426 964.152 335.81C959.871 336.194 918.349 304.989 912.192 295.563Z");
    			attr_dev(path97, "fill", "url(#paint78_linear_637_19820)");
    			add_location(path97, file$c, 102, 0, 23819);
    			attr_dev(path98, "d", "M990.35 324.419C987.079 323.028 989.34 296.969 990.242 286.653C992.541 260.385 1004.27 235.933 1013.29 233.987C1022.31 232.04 1029.66 240.043 1035.25 251.474C1044.52 270.418 1040.72 283.971 1030.9 301.194C1023.93 313.44 999.237 328.198 990.35 324.419Z");
    			attr_dev(path98, "fill", "url(#paint79_linear_637_19820)");
    			add_location(path98, file$c, 103, 0, 24127);
    			attr_dev(path99, "d", "M977.917 327.303C990.717 334.852 963.093 338.4 958.99 338.768C923.304 341.97 879.096 325.603 884.67 282.145C887.812 257.651 969.241 322.185 977.917 327.303Z");
    			attr_dev(path99, "fill", "url(#paint80_linear_637_19820)");
    			add_location(path99, file$c, 104, 0, 24430);
    			attr_dev(path100, "d", "M979.147 333.703C974.754 334.578 952.778 297.728 950.575 284.831C947.536 267.051 942.769 227.086 961.103 219.308C971.806 214.768 986.554 227.554 995.684 240.775C1012.57 265.23 1012.58 281.788 1004.63 307.905C999.453 324.93 991.392 331.263 979.147 333.703Z");
    			attr_dev(path100, "fill", "url(#paint81_linear_637_19820)");
    			add_location(path100, file$c, 105, 0, 24638);
    			attr_dev(path101, "d", "M1024.74 454.156C1019.22 501.513 1040.56 572.069 1043.39 611.502C1046.66 551.431 1042.75 522.953 1061.39 457.157C1076.52 403.775 1083.79 342.391 1069.42 301.843C1059.31 351.023 1030.57 404.183 1024.74 454.156Z");
    			attr_dev(path101, "fill", "url(#paint82_linear_637_19820)");
    			add_location(path101, file$c, 106, 0, 24945);
    			attr_dev(path102, "d", "M1191.17 920.062L1236.13 921.637C1256.38 785.692 1197.22 580.444 1155.84 450.977L1137.03 455.249C1168.83 596.043 1211.97 775.561 1191.17 920.062Z");
    			attr_dev(path102, "fill", "url(#paint83_linear_637_19820)");
    			add_location(path102, file$c, 107, 0, 25206);
    			attr_dev(path103, "d", "M1213.54 586.447C1209.8 635.387 1243.5 763.759 1257.39 822.6C1247.64 729.604 1257.45 683.309 1269.43 574.777C1279.15 486.723 1275.1 389.954 1243.58 334.529C1240.37 413.957 1217.04 540.788 1213.54 586.447Z");
    			attr_dev(path103, "fill", "url(#paint84_linear_637_19820)");
    			add_location(path103, file$c, 108, 0, 25403);
    			attr_dev(path104, "d", "M1189.74 699.231C1207.84 742.823 1198.15 792.002 1192.3 838.764C1162.17 765.272 1167.44 781.926 1134.98 722.184C1101.15 659.943 1047.99 522.279 1055.08 456.001C1088.9 525.204 1169.88 651.407 1189.74 699.231Z");
    			attr_dev(path104, "fill", "url(#paint85_linear_637_19820)");
    			add_location(path104, file$c, 109, 0, 25659);
    			attr_dev(path105, "d", "M1161.05 433.647C1170.74 442.855 1206.51 419.585 1216.55 409.539C1198.07 383.768 1126.95 250.58 1091.43 250.053C1082.85 249.925 1071.03 256.869 1065.46 274.279C1059.33 293.423 1071.09 350.895 1085.98 376.147C1104.14 406.95 1151.37 424.439 1161.05 433.647Z");
    			attr_dev(path105, "fill", "#B83535");
    			add_location(path105, file$c, 110, 0, 25918);
    			attr_dev(path106, "d", "M1102.55 397.33C1095.62 372.287 1098.34 229.731 1147.31 243.251C1229.6 265.971 1266.51 385.67 1206.08 447.951C1163.55 491.775 1114.39 440.126 1102.55 397.33Z");
    			attr_dev(path106, "fill", "url(#paint86_linear_637_19820)");
    			add_location(path106, file$c, 111, 0, 26202);
    			attr_dev(path107, "d", "M1171.59 370.223C1200.43 422.174 1192.58 489.549 1119.13 481.43C1021.54 470.644 975.437 360.723 1015.57 285.883C1041.53 237.471 1156.55 343.136 1171.59 370.223Z");
    			attr_dev(path107, "fill", "url(#paint87_linear_637_19820)");
    			add_location(path107, file$c, 112, 0, 26411);
    			attr_dev(path108, "d", "M612.218 532.499L585.163 533.529C577 482.499 582.128 451.16 612.218 356.401L623.541 358.934C601.472 457.528 604.414 480.618 612.218 532.499Z");
    			attr_dev(path108, "fill", "url(#paint88_linear_637_19820)");
    			add_location(path108, file$c, 113, 0, 26623);
    			attr_dev(path109, "d", "M682.018 303.131C684.272 307.683 668.355 344.991 659.046 355.179C638.824 377.312 609.64 382.756 591.493 355.806C602.408 346.636 668.025 274.858 682.018 303.131Z");
    			attr_dev(path109, "fill", "url(#paint89_linear_637_19820)");
    			add_location(path109, file$c, 114, 0, 26815);
    			attr_dev(path110, "d", "M622.636 376.761C617.646 380.645 595.906 362.444 591.936 356.55C581.083 340.432 581.6 321.463 588.458 304.205C596.671 292.793 613.194 263.24 628.732 260.126C652.753 255.314 658.158 283.797 659.383 299.889C658.076 334.214 649.96 355.495 622.636 376.761Z");
    			attr_dev(path110, "fill", "url(#paint90_linear_637_19820)");
    			add_location(path110, file$c, 115, 0, 27027);
    			attr_dev(path111, "d", "M535.73 526.635L513.851 537.975C469.496 471.193 467.904 410.603 462.689 298.695L474.493 324.574C492.455 426.998 496.984 468.66 535.73 526.635Z");
    			attr_dev(path111, "fill", "url(#paint91_linear_637_19820)");
    			add_location(path111, file$c, 116, 0, 27331);
    			attr_dev(path112, "d", "M514.029 324.167C515.532 316.752 509.137 287.575 503.847 282.612C483.03 263.086 468.229 296.326 461.677 312.234C459.485 317.556 462.103 359.201 461.771 366.821C461.439 374.441 482.495 373.234 485.958 372.131C489.421 371.028 512.15 333.436 514.029 324.167Z");
    			attr_dev(path112, "fill", "url(#paint92_linear_637_19820)");
    			add_location(path112, file$c, 117, 0, 27525);
    			attr_dev(path113, "d", "M461.956 371.919C464.078 369.779 454.212 350.453 450.3 342.805C440.34 323.331 423.574 308.336 415.927 309.783C408.279 311.23 405.022 319.796 404.21 330.423C402.864 348.036 410.046 357.229 423.063 367.285C432.319 374.434 456.19 377.732 461.956 371.919Z");
    			attr_dev(path113, "fill", "url(#paint93_linear_637_19820)");
    			add_location(path113, file$c, 118, 0, 27832);
    			attr_dev(path114, "d", "M472.563 370.077C464.913 380.072 487.59 373.779 490.909 372.722C519.776 363.529 549.215 336.484 531.353 304.844C521.285 287.011 477.748 363.303 472.563 370.077Z");
    			attr_dev(path114, "fill", "url(#paint94_linear_637_19820)");
    			add_location(path114, file$c, 119, 0, 28135);
    			attr_dev(path115, "d", "M473.591 375.407C477.295 374.646 483.003 339.093 480.715 328.443C477.561 313.76 468.861 281.431 452.123 281.432C442.353 281.433 434.81 296.096 431.788 309.258C426.2 333.606 431.342 346.356 445.667 363.869C455.005 375.286 463.269 377.529 473.591 375.407Z");
    			attr_dev(path115, "fill", "url(#paint95_linear_637_19820)");
    			add_location(path115, file$c, 120, 0, 28347);
    			attr_dev(path116, "d", "M459.411 414.765C480.967 439.298 496.95 503.157 510.847 530.444C485.54 495.876 476.523 474.444 440.59 450.486C411.436 431.049 383.434 399.35 375.396 360.711C400.169 382.148 436.663 388.876 459.411 414.765Z");
    			attr_dev(path116, "fill", "url(#paint96_linear_637_19820)");
    			add_location(path116, file$c, 121, 0, 28652);
    			attr_dev(path117, "d", "M781.498 572.09L808 566.5C808 501.5 803.798 429.1 754.765 328.62L756.084 348.917C794.02 447.685 780.968 514.398 781.498 572.09Z");
    			attr_dev(path117, "fill", "url(#paint97_linear_637_19820)");
    			add_location(path117, file$c, 122, 0, 28909);
    			attr_dev(path118, "d", "M718.527 334.62C715.137 330.487 709.389 309.985 711.002 305.05C717.35 285.634 737.514 301.384 746.837 309.105C749.957 311.688 762.174 338.709 764.91 343.374C767.645 348.039 754.264 354.534 751.762 355.035C749.261 355.536 722.764 339.786 718.527 334.62Z");
    			attr_dev(path118, "fill", "url(#paint98_linear_637_19820)");
    			add_location(path118, file$c, 123, 0, 29088);
    			attr_dev(path119, "d", "M766.488 346.635C764.47 346.024 764.133 330.504 764.004 324.36C763.677 308.716 769.032 293.537 774.227 291.811C779.423 290.084 784.275 294.334 788.306 300.72C794.985 311.303 793.611 319.543 788.926 330.333C785.595 338.005 771.974 348.295 766.488 346.635Z");
    			attr_dev(path119, "fill", "url(#paint99_linear_637_19820)");
    			add_location(path119, file$c, 124, 0, 29392);
    			attr_dev(path120, "d", "M759.338 349.134C767.373 352.767 751.304 356.631 748.906 357.111C728.057 361.288 700.926 354.464 701.429 328.468C701.713 313.815 753.891 346.67 759.338 349.134Z");
    			attr_dev(path120, "fill", "url(#paint100_linear_637_19820)");
    			add_location(path120, file$c, 125, 0, 29698);
    			attr_dev(path121, "d", "M760.474 352.83C757.938 353.629 742.611 333.296 740.484 325.828C737.552 315.533 732.178 292.26 742.496 286.496C748.52 283.131 758.04 289.73 764.275 296.944C775.806 310.29 776.872 320.058 773.857 335.976C771.892 346.353 767.542 350.606 760.474 352.83Z");
    			attr_dev(path121, "fill", "url(#paint101_linear_637_19820)");
    			add_location(path121, file$c, 126, 0, 29911);
    			attr_dev(path122, "d", "M791.258 395.5C787.674 423.652 799.893 465.297 801.319 488.664C803.648 452.991 801.509 436.134 813.001 396.909C822.324 365.085 811.452 309.808 803.181 285.897C796.862 315.178 795.04 365.792 791.258 395.5Z");
    			attr_dev(path122, "fill", "url(#paint102_linear_637_19820)");
    			add_location(path122, file$c, 127, 0, 30214);
    			attr_dev(path123, "d", "M113.323 922.89L86.6345 906.991C88.3252 757.108 167.669 575.891 234.234 444.503L231.854 474.263C177.198 610.441 115.707 775.225 113.323 922.89Z");
    			attr_dev(path123, "fill", "url(#paint103_linear_637_19820)");
    			add_location(path123, file$c, 128, 0, 30471);
    			attr_dev(path124, "d", "M265.318 447.295L224.5 430.5C230 415.5 251.546 401.376 259.675 405.722C263 407.5 270 424 265.318 447.295Z");
    			attr_dev(path124, "fill", "url(#paint104_linear_637_19820)");
    			add_location(path124, file$c, 129, 0, 30667);
    			attr_dev(path125, "d", "M232.074 446.129C238.422 437.001 256 433 271.045 425.915C272.5 439.5 262.446 459.065 255 467.5C245.692 478.044 227.618 478.843 223.014 474.558C218.41 470.273 225.877 455.041 232.074 446.129Z");
    			attr_dev(path125, "fill", "#57661F");
    			add_location(path125, file$c, 130, 0, 30825);
    			attr_dev(path126, "d", "M244.106 455.714C244.106 442.5 237 418 233.682 409.292C223 417 214.254 435.878 212.614 447.009C210.565 460.924 220.824 476.365 227.069 477.117C233.313 477.87 244.106 466.568 244.106 455.714Z");
    			attr_dev(path126, "fill", "#57661F");
    			add_location(path126, file$c, 131, 0, 31044);
    			attr_dev(path127, "d", "M612.683 586.927L596.152 586.813C556.582 517.559 544.222 413.018 539.408 334.789L546.327 349.091C557.896 426.312 574.028 518.504 612.683 586.927Z");
    			attr_dev(path127, "fill", "url(#paint105_linear_637_19820)");
    			add_location(path127, file$c, 132, 0, 31263);
    			attr_dev(path128, "d", "M555.269 335.329L532.012 338.607C530.499 330.241 536.587 317.958 541.488 317.765C543.493 317.686 551.148 323.375 555.269 335.329Z");
    			attr_dev(path128, "fill", "url(#paint106_linear_637_19820)");
    			add_location(path128, file$c, 133, 0, 31461);
    			attr_dev(path129, "d", "M539.696 343.742C540.153 337.843 547.144 331.275 552.143 323.973C556.468 329.817 557.12 341.504 555.972 347.381C554.538 354.726 546.457 359.958 543.19 359.231C539.923 358.503 539.25 349.501 539.696 343.742Z");
    			attr_dev(path129, "fill", "#57661F");
    			add_location(path129, file$c, 134, 0, 31643);
    			attr_dev(path130, "d", "M547.799 344.903C544.242 338.837 534.385 329.504 530.518 326.4C527.69 332.814 528.757 343.834 531 349.384C533.805 356.323 542.671 360.649 545.74 359.314C548.809 357.978 550.721 349.885 547.799 344.903Z");
    			attr_dev(path130, "fill", "#57661F");
    			add_location(path130, file$c, 135, 0, 31878);
    			attr_dev(path131, "d", "M891.718 581.453L872.353 587.932C846.099 531.436 845.511 434.549 846.905 372.96L855.638 372.394C859.933 438.755 863.577 520.12 891.718 581.453Z");
    			attr_dev(path131, "fill", "url(#paint107_linear_637_19820)");
    			add_location(path131, file$c, 136, 0, 32108);
    			attr_dev(path132, "d", "M845.771 359.696C843.459 364.699 826.203 361.219 820.825 358.895C823.992 346.202 831 284.319 844.537 278.714C847.81 277.359 853.395 278.225 858.18 284.052C863.441 290.46 867.674 314.284 865.808 326.231C863.532 340.802 848.082 354.693 845.771 359.696Z");
    			attr_dev(path132, "fill", "#B83535");
    			add_location(path132, file$c, 137, 0, 32304);
    			attr_dev(path133, "d", "M862.678 336.872C861.526 326.216 838.798 271.973 822.078 284.606C793.983 305.835 798.04 357.342 830.684 372.029C853.654 382.363 864.647 355.082 862.678 336.872Z");
    			attr_dev(path133, "fill", "url(#paint108_linear_637_19820)");
    			add_location(path133, file$c, 138, 0, 32583);
    			attr_dev(path134, "d", "M832.084 336.981C828.927 361.287 842.186 385.925 869.113 371.639C904.891 352.659 905.845 303.502 879.074 280.912C861.756 266.299 833.73 324.308 832.084 336.981Z");
    			attr_dev(path134, "fill", "url(#paint109_linear_637_19820)");
    			add_location(path134, file$c, 139, 0, 32796);
    			attr_dev(path135, "d", "M1039.97 813.994L1071.71 795.089C1069.7 616.87 1035.35 561.392 956.202 405.163L959.032 440.55C1024.02 602.474 1037.14 638.411 1039.97 813.994Z");
    			attr_dev(path135, "fill", "url(#paint110_linear_637_19820)");
    			add_location(path135, file$c, 140, 0, 33009);
    			attr_dev(path136, "d", "M1000.17 557.781C1015.1 579.258 1029.68 656.063 1035.11 691.78C1018.23 641.893 994.778 627.898 959.175 582.244C930.29 545.204 908.578 496.569 916.022 453.003C938.288 489.41 986.243 537.743 1000.17 557.781Z");
    			attr_dev(path136, "fill", "url(#paint111_linear_637_19820)");
    			add_location(path136, file$c, 141, 0, 33204);
    			attr_dev(path137, "d", "M927.553 413.295L968.37 396.5C962.87 381.5 941.324 367.375 933.196 371.722C929.871 373.5 922.87 390 927.553 413.295Z");
    			attr_dev(path137, "fill", "url(#paint112_linear_637_19820)");
    			add_location(path137, file$c, 142, 0, 33462);
    			attr_dev(path138, "d", "M960.797 412.129C954.448 403 936.871 399 921.825 391.915C920.37 405.5 930.424 425.065 937.871 433.5C947.179 444.044 965.252 444.843 969.856 440.558C974.461 436.273 966.994 421.04 960.797 412.129Z");
    			attr_dev(path138, "fill", "#57661F");
    			add_location(path138, file$c, 143, 0, 33631);
    			attr_dev(path139, "d", "M948.764 421.713C948.764 408.5 955.871 384 959.189 375.292C969.871 383 978.617 401.878 980.256 413.009C982.305 426.923 972.047 442.365 965.802 443.117C959.557 443.87 948.764 432.567 948.764 421.713Z");
    			attr_dev(path139, "fill", "#57661F");
    			add_location(path139, file$c, 144, 0, 33855);
    			attr_dev(path140, "d", "M1208.93 474.085C1224.14 509.843 1246.8 525.871 1259.73 537.752L1280.06 506.5C1280 374 1280 352.537 1280 295.5C1263.55 302.773 1248.68 312.484 1234.46 338.455C1171.55 274.347 1191.17 432.332 1208.93 474.085Z");
    			attr_dev(path140, "fill", "#FFCD59");
    			add_location(path140, file$c, 145, 0, 34082);
    			attr_dev(path141, "d", "M1280 351.529C1257.95 340.199 1240.37 333.237 1228.16 393.561C1221.27 427.548 1228.08 522.74 1265.77 543.522C1270.56 546.164 1275.31 548.154 1280 549.555C1280 -3729.14 1280 2304.8 1280 351.529Z");
    			attr_dev(path141, "fill", "url(#paint113_linear_637_19820)");
    			add_location(path141, file$c, 146, 0, 34318);
    			attr_dev(path142, "d", "M0.000308697 537.5C107.8 484.655 127.13 333.791 49.8574 264.218C33.588 249.57 20.2471 257.674 0.000138549 276.5C0.000139286 406 0.000307892 423.5 0.000308697 537.5Z");
    			attr_dev(path142, "fill", "url(#paint114_linear_637_19820)");
    			add_location(path142, file$c, 147, 0, 34564);
    			attr_dev(g, "mask", "url(#mask0_637_19820)");
    			add_location(g, file$c, 4, 0, 327);
    			attr_dev(stop0, "stop-color", "#57661F");
    			add_location(stop0, file$c, 151, 0, 34925);
    			attr_dev(stop1, "offset", "0.791667");
    			attr_dev(stop1, "stop-color", "#9CB23E");
    			add_location(stop1, file$c, 152, 0, 34955);
    			attr_dev(linearGradient0, "id", "paint0_linear_637_19820");
    			attr_dev(linearGradient0, "x1", "1105.59");
    			attr_dev(linearGradient0, "y1", "223.953");
    			attr_dev(linearGradient0, "x2", "1065.74");
    			attr_dev(linearGradient0, "y2", "371.238");
    			attr_dev(linearGradient0, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient0, file$c, 150, 0, 34795);
    			attr_dev(stop2, "offset", "0.541667");
    			attr_dev(stop2, "stop-color", "#E85151");
    			add_location(stop2, file$c, 155, 0, 35152);
    			attr_dev(stop3, "offset", "0.994792");
    			attr_dev(stop3, "stop-color", "#B83535");
    			add_location(stop3, file$c, 156, 0, 35200);
    			attr_dev(linearGradient1, "id", "paint1_linear_637_19820");
    			attr_dev(linearGradient1, "x1", "1128.32");
    			attr_dev(linearGradient1, "y1", "157.259");
    			attr_dev(linearGradient1, "x2", "1099.02");
    			attr_dev(linearGradient1, "y2", "220.511");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$c, 154, 0, 35022);
    			attr_dev(stop4, "offset", "0.541667");
    			attr_dev(stop4, "stop-color", "#E85151");
    			add_location(stop4, file$c, 159, 0, 35397);
    			attr_dev(stop5, "offset", "0.994792");
    			attr_dev(stop5, "stop-color", "#B83535");
    			add_location(stop5, file$c, 160, 0, 35445);
    			attr_dev(linearGradient2, "id", "paint2_linear_637_19820");
    			attr_dev(linearGradient2, "x1", "1058.32");
    			attr_dev(linearGradient2, "y1", "155.445");
    			attr_dev(linearGradient2, "x2", "1090.54");
    			attr_dev(linearGradient2, "y2", "223.327");
    			attr_dev(linearGradient2, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient2, file$c, 158, 0, 35267);
    			attr_dev(stop6, "stop-color", "#57661F");
    			add_location(stop6, file$c, 163, 0, 35642);
    			attr_dev(stop7, "offset", "0.791667");
    			attr_dev(stop7, "stop-color", "#9CB23E");
    			add_location(stop7, file$c, 164, 0, 35672);
    			attr_dev(linearGradient3, "id", "paint3_linear_637_19820");
    			attr_dev(linearGradient3, "x1", "309.826");
    			attr_dev(linearGradient3, "y1", "189.678");
    			attr_dev(linearGradient3, "x2", "315.892");
    			attr_dev(linearGradient3, "y2", "366.972");
    			attr_dev(linearGradient3, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient3, file$c, 162, 0, 35512);
    			attr_dev(stop8, "stop-color", "#FFCD59");
    			add_location(stop8, file$c, 167, 0, 35869);
    			attr_dev(stop9, "offset", "0.895833");
    			attr_dev(stop9, "stop-color", "#F2AC49");
    			add_location(stop9, file$c, 168, 0, 35899);
    			attr_dev(linearGradient4, "id", "paint4_linear_637_19820");
    			attr_dev(linearGradient4, "x1", "329.185");
    			attr_dev(linearGradient4, "y1", "153.033");
    			attr_dev(linearGradient4, "x2", "326.236");
    			attr_dev(linearGradient4, "y2", "172.237");
    			attr_dev(linearGradient4, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient4, file$c, 166, 0, 35739);
    			attr_dev(stop10, "stop-color", "#57661F");
    			add_location(stop10, file$c, 171, 0, 36096);
    			attr_dev(stop11, "offset", "0.791667");
    			attr_dev(stop11, "stop-color", "#9CB23E");
    			add_location(stop11, file$c, 172, 0, 36126);
    			attr_dev(linearGradient5, "id", "paint5_linear_637_19820");
    			attr_dev(linearGradient5, "x1", "331.449");
    			attr_dev(linearGradient5, "y1", "211.161");
    			attr_dev(linearGradient5, "x2", "330.811");
    			attr_dev(linearGradient5, "y2", "286.069");
    			attr_dev(linearGradient5, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient5, file$c, 170, 0, 35966);
    			attr_dev(stop12, "stop-color", "#57661F");
    			add_location(stop12, file$c, 175, 0, 36323);
    			attr_dev(stop13, "offset", "0.791667");
    			attr_dev(stop13, "stop-color", "#9CB23E");
    			add_location(stop13, file$c, 176, 0, 36353);
    			attr_dev(linearGradient6, "id", "paint6_linear_637_19820");
    			attr_dev(linearGradient6, "x1", "895.427");
    			attr_dev(linearGradient6, "y1", "266.508");
    			attr_dev(linearGradient6, "x2", "875.931");
    			attr_dev(linearGradient6, "y2", "413.368");
    			attr_dev(linearGradient6, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient6, file$c, 174, 0, 36193);
    			attr_dev(stop14, "offset", "0.375");
    			attr_dev(stop14, "stop-color", "#F2AC49");
    			add_location(stop14, file$c, 179, 0, 36550);
    			attr_dev(stop15, "offset", "1");
    			attr_dev(stop15, "stop-color", "#FFCD59");
    			add_location(stop15, file$c, 180, 0, 36595);
    			attr_dev(linearGradient7, "id", "paint7_linear_637_19820");
    			attr_dev(linearGradient7, "x1", "890.188");
    			attr_dev(linearGradient7, "y1", "266.164");
    			attr_dev(linearGradient7, "x2", "855.901");
    			attr_dev(linearGradient7, "y2", "220.057");
    			attr_dev(linearGradient7, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient7, file$c, 178, 0, 36420);
    			attr_dev(stop16, "offset", "0.125");
    			attr_dev(stop16, "stop-color", "#F2AC49");
    			add_location(stop16, file$c, 183, 0, 36785);
    			attr_dev(stop17, "offset", "1");
    			attr_dev(stop17, "stop-color", "#FFCD59");
    			add_location(stop17, file$c, 184, 0, 36830);
    			attr_dev(linearGradient8, "id", "paint8_linear_637_19820");
    			attr_dev(linearGradient8, "x1", "890.193");
    			attr_dev(linearGradient8, "y1", "270.111");
    			attr_dev(linearGradient8, "x2", "889.952");
    			attr_dev(linearGradient8, "y2", "228.579");
    			attr_dev(linearGradient8, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient8, file$c, 182, 0, 36655);
    			attr_dev(stop18, "stop-color", "#57661F");
    			add_location(stop18, file$c, 187, 0, 37019);
    			attr_dev(stop19, "offset", "0.791667");
    			attr_dev(stop19, "stop-color", "#9CB23E");
    			add_location(stop19, file$c, 188, 0, 37049);
    			attr_dev(linearGradient9, "id", "paint9_linear_637_19820");
    			attr_dev(linearGradient9, "x1", "830.633");
    			attr_dev(linearGradient9, "y1", "273.17");
    			attr_dev(linearGradient9, "x2", "904.477");
    			attr_dev(linearGradient9, "y2", "463.428");
    			attr_dev(linearGradient9, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient9, file$c, 186, 0, 36890);
    			attr_dev(stop20, "stop-color", "#FFCD59");
    			add_location(stop20, file$c, 191, 0, 37247);
    			attr_dev(stop21, "offset", "0.895833");
    			attr_dev(stop21, "stop-color", "#F2AC49");
    			add_location(stop21, file$c, 192, 0, 37277);
    			attr_dev(linearGradient10, "id", "paint10_linear_637_19820");
    			attr_dev(linearGradient10, "x1", "836.759");
    			attr_dev(linearGradient10, "y1", "228.026");
    			attr_dev(linearGradient10, "x2", "840.841");
    			attr_dev(linearGradient10, "y2", "250.002");
    			attr_dev(linearGradient10, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient10, file$c, 190, 0, 37116);
    			attr_dev(stop22, "stop-color", "#57661F");
    			add_location(stop22, file$c, 195, 0, 37475);
    			attr_dev(stop23, "offset", "0.791667");
    			attr_dev(stop23, "stop-color", "#9CB23E");
    			add_location(stop23, file$c, 196, 0, 37505);
    			attr_dev(linearGradient11, "id", "paint11_linear_637_19820");
    			attr_dev(linearGradient11, "x1", "862.905");
    			attr_dev(linearGradient11, "y1", "288.248");
    			attr_dev(linearGradient11, "x2", "890.628");
    			attr_dev(linearGradient11, "y2", "369.848");
    			attr_dev(linearGradient11, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient11, file$c, 194, 0, 37344);
    			attr_dev(stop24, "stop-color", "#57661F");
    			add_location(stop24, file$c, 199, 0, 37703);
    			attr_dev(stop25, "offset", "0.791667");
    			attr_dev(stop25, "stop-color", "#9CB23E");
    			add_location(stop25, file$c, 200, 0, 37733);
    			attr_dev(linearGradient12, "id", "paint12_linear_637_19820");
    			attr_dev(linearGradient12, "x1", "1227.09");
    			attr_dev(linearGradient12, "y1", "265.368");
    			attr_dev(linearGradient12, "x2", "1289.49");
    			attr_dev(linearGradient12, "y2", "523.206");
    			attr_dev(linearGradient12, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient12, file$c, 198, 0, 37572);
    			attr_dev(stop26, "offset", "0.375");
    			attr_dev(stop26, "stop-color", "#F2AC49");
    			add_location(stop26, file$c, 203, 0, 37931);
    			attr_dev(stop27, "offset", "1");
    			attr_dev(stop27, "stop-color", "#FFCD59");
    			add_location(stop27, file$c, 204, 0, 37976);
    			attr_dev(linearGradient13, "id", "paint13_linear_637_19820");
    			attr_dev(linearGradient13, "x1", "1220.58");
    			attr_dev(linearGradient13, "y1", "268.296");
    			attr_dev(linearGradient13, "x2", "1134.62");
    			attr_dev(linearGradient13, "y2", "207.641");
    			attr_dev(linearGradient13, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient13, file$c, 202, 0, 37800);
    			attr_dev(stop28, "offset", "0.125");
    			attr_dev(stop28, "stop-color", "#F2AC49");
    			add_location(stop28, file$c, 207, 0, 38165);
    			attr_dev(stop29, "offset", "1");
    			attr_dev(stop29, "stop-color", "#FFCD59");
    			add_location(stop29, file$c, 208, 0, 38210);
    			attr_dev(linearGradient14, "id", "paint14_linear_637_19820");
    			attr_dev(linearGradient14, "x1", "1222.84");
    			attr_dev(linearGradient14, "y1", "275.16");
    			attr_dev(linearGradient14, "x2", "1198.72");
    			attr_dev(linearGradient14, "y2", "203.04");
    			attr_dev(linearGradient14, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient14, file$c, 206, 0, 38036);
    			attr_dev(stop30, "stop-color", "#FFCD59");
    			add_location(stop30, file$c, 211, 0, 38401);
    			attr_dev(stop31, "offset", "0.895833");
    			attr_dev(stop31, "stop-color", "#F2AC49");
    			add_location(stop31, file$c, 212, 0, 38431);
    			attr_dev(linearGradient15, "id", "paint15_linear_637_19820");
    			attr_dev(linearGradient15, "x1", "1231.58");
    			attr_dev(linearGradient15, "y1", "159.865");
    			attr_dev(linearGradient15, "x2", "1280.73");
    			attr_dev(linearGradient15, "y2", "178.709");
    			attr_dev(linearGradient15, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient15, file$c, 210, 0, 38270);
    			attr_dev(stop32, "stop-color", "#57661F");
    			add_location(stop32, file$c, 215, 0, 38629);
    			attr_dev(stop33, "offset", "0.791667");
    			attr_dev(stop33, "stop-color", "#9CB23E");
    			add_location(stop33, file$c, 216, 0, 38659);
    			attr_dev(linearGradient16, "id", "paint16_linear_637_19820");
    			attr_dev(linearGradient16, "x1", "633.812");
    			attr_dev(linearGradient16, "y1", "231.266");
    			attr_dev(linearGradient16, "x2", "597.165");
    			attr_dev(linearGradient16, "y2", "442.045");
    			attr_dev(linearGradient16, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient16, file$c, 214, 0, 38498);
    			attr_dev(stop34, "stop-color", "#F2B091");
    			add_location(stop34, file$c, 219, 0, 38855);
    			attr_dev(stop35, "offset", "0.729167");
    			attr_dev(stop35, "stop-color", "#F26E30");
    			add_location(stop35, file$c, 220, 0, 38885);
    			attr_dev(linearGradient17, "id", "paint17_linear_637_19820");
    			attr_dev(linearGradient17, "x1", "611.812");
    			attr_dev(linearGradient17, "y1", "204.113");
    			attr_dev(linearGradient17, "x2", "623.091");
    			attr_dev(linearGradient17, "y2", "244.3");
    			attr_dev(linearGradient17, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient17, file$c, 218, 0, 38726);
    			attr_dev(stop36, "stop-color", "#F2B091");
    			add_location(stop36, file$c, 223, 0, 39082);
    			attr_dev(stop37, "offset", "0.729167");
    			attr_dev(stop37, "stop-color", "#F26E30");
    			add_location(stop37, file$c, 224, 0, 39112);
    			attr_dev(linearGradient18, "id", "paint18_linear_637_19820");
    			attr_dev(linearGradient18, "x1", "642.409");
    			attr_dev(linearGradient18, "y1", "212.481");
    			attr_dev(linearGradient18, "x2", "650.13");
    			attr_dev(linearGradient18, "y2", "244.692");
    			attr_dev(linearGradient18, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient18, file$c, 222, 0, 38952);
    			attr_dev(stop38, "stop-color", "#F2B091");
    			add_location(stop38, file$c, 227, 0, 39310);
    			attr_dev(stop39, "offset", "0.729167");
    			attr_dev(stop39, "stop-color", "#F26E30");
    			add_location(stop39, file$c, 228, 0, 39340);
    			attr_dev(linearGradient19, "id", "paint19_linear_637_19820");
    			attr_dev(linearGradient19, "x1", "599.131");
    			attr_dev(linearGradient19, "y1", "217.277");
    			attr_dev(linearGradient19, "x2", "615.618");
    			attr_dev(linearGradient19, "y2", "247.765");
    			attr_dev(linearGradient19, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient19, file$c, 226, 0, 39179);
    			attr_dev(stop40, "stop-color", "#F2B091");
    			add_location(stop40, file$c, 231, 0, 39537);
    			attr_dev(stop41, "offset", "0.729167");
    			attr_dev(stop41, "stop-color", "#F26E30");
    			add_location(stop41, file$c, 232, 0, 39567);
    			attr_dev(linearGradient20, "id", "paint20_linear_637_19820");
    			attr_dev(linearGradient20, "x1", "628.765");
    			attr_dev(linearGradient20, "y1", "203.687");
    			attr_dev(linearGradient20, "x2", "638.35");
    			attr_dev(linearGradient20, "y2", "244.001");
    			attr_dev(linearGradient20, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient20, file$c, 230, 0, 39407);
    			attr_dev(stop42, "stop-color", "#57661F");
    			add_location(stop42, file$c, 235, 0, 39765);
    			attr_dev(stop43, "offset", "0.791667");
    			attr_dev(stop43, "stop-color", "#9CB23E");
    			add_location(stop43, file$c, 236, 0, 39795);
    			attr_dev(linearGradient21, "id", "paint21_linear_637_19820");
    			attr_dev(linearGradient21, "x1", "370.805");
    			attr_dev(linearGradient21, "y1", "227.312");
    			attr_dev(linearGradient21, "x2", "407.028");
    			attr_dev(linearGradient21, "y2", "464.082");
    			attr_dev(linearGradient21, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient21, file$c, 234, 0, 39634);
    			attr_dev(stop44, "stop-color", "#F2B091");
    			add_location(stop44, file$c, 239, 0, 39993);
    			attr_dev(stop45, "offset", "0.729167");
    			attr_dev(stop45, "stop-color", "#F26E30");
    			add_location(stop45, file$c, 240, 0, 40023);
    			attr_dev(linearGradient22, "id", "paint22_linear_637_19820");
    			attr_dev(linearGradient22, "x1", "402.689");
    			attr_dev(linearGradient22, "y1", "172.084");
    			attr_dev(linearGradient22, "x2", "385.271");
    			attr_dev(linearGradient22, "y2", "229.787");
    			attr_dev(linearGradient22, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient22, file$c, 238, 0, 39862);
    			attr_dev(stop46, "stop-color", "#F2B091");
    			add_location(stop46, file$c, 243, 0, 40220);
    			attr_dev(stop47, "offset", "0.729167");
    			attr_dev(stop47, "stop-color", "#F26E30");
    			add_location(stop47, file$c, 244, 0, 40250);
    			attr_dev(linearGradient23, "id", "paint23_linear_637_19820");
    			attr_dev(linearGradient23, "x1", "358.279");
    			attr_dev(linearGradient23, "y1", "183.302");
    			attr_dev(linearGradient23, "x2", "346.223");
    			attr_dev(linearGradient23, "y2", "229.59");
    			attr_dev(linearGradient23, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient23, file$c, 242, 0, 40090);
    			attr_dev(stop48, "stop-color", "#F2B091");
    			add_location(stop48, file$c, 247, 0, 40444);
    			attr_dev(stop49, "offset", "0.729167");
    			attr_dev(stop49, "stop-color", "#F26E30");
    			add_location(stop49, file$c, 248, 0, 40474);
    			attr_dev(linearGradient24, "id", "paint24_linear_637_19820");
    			attr_dev(linearGradient24, "x1", "420.626");
    			attr_dev(linearGradient24, "y1", "191.447");
    			attr_dev(linearGradient24, "x2", "395.963");
    			attr_dev(linearGradient24, "y2", "235");
    			attr_dev(linearGradient24, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient24, file$c, 246, 0, 40317);
    			attr_dev(stop50, "stop-color", "#F2B091");
    			add_location(stop50, file$c, 251, 0, 40671);
    			attr_dev(stop51, "offset", "0.729167");
    			attr_dev(stop51, "stop-color", "#F26E30");
    			add_location(stop51, file$c, 252, 0, 40701);
    			attr_dev(linearGradient25, "id", "paint25_linear_637_19820");
    			attr_dev(linearGradient25, "x1", "378.225");
    			attr_dev(linearGradient25, "y1", "170.991");
    			attr_dev(linearGradient25, "x2", "363.25");
    			attr_dev(linearGradient25, "y2", "228.924");
    			attr_dev(linearGradient25, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient25, file$c, 250, 0, 40541);
    			attr_dev(stop52, "stop-color", "#57661F");
    			add_location(stop52, file$c, 255, 0, 40899);
    			attr_dev(stop53, "offset", "0.791667");
    			attr_dev(stop53, "stop-color", "#9CB23E");
    			add_location(stop53, file$c, 256, 0, 40929);
    			attr_dev(linearGradient26, "id", "paint26_linear_637_19820");
    			attr_dev(linearGradient26, "x1", "330.886");
    			attr_dev(linearGradient26, "y1", "277.099");
    			attr_dev(linearGradient26, "x2", "333.881");
    			attr_dev(linearGradient26, "y2", "466.389");
    			attr_dev(linearGradient26, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient26, file$c, 254, 0, 40768);
    			attr_dev(stop54, "stop-color", "#57661F");
    			add_location(stop54, file$c, 259, 0, 41127);
    			attr_dev(stop55, "offset", "0.791667");
    			attr_dev(stop55, "stop-color", "#9CB23E");
    			add_location(stop55, file$c, 260, 0, 41157);
    			attr_dev(linearGradient27, "id", "paint27_linear_637_19820");
    			attr_dev(linearGradient27, "x1", "496.315");
    			attr_dev(linearGradient27, "y1", "233.947");
    			attr_dev(linearGradient27, "x2", "595.862");
    			attr_dev(linearGradient27, "y2", "442.363");
    			attr_dev(linearGradient27, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient27, file$c, 258, 0, 40996);
    			attr_dev(stop56, "stop-color", "#FFCD59");
    			add_location(stop56, file$c, 263, 0, 41355);
    			attr_dev(stop57, "offset", "0.895833");
    			attr_dev(stop57, "stop-color", "#F2AC49");
    			add_location(stop57, file$c, 264, 0, 41385);
    			attr_dev(linearGradient28, "id", "paint28_linear_637_19820");
    			attr_dev(linearGradient28, "x1", "537.562");
    			attr_dev(linearGradient28, "y1", "189.334");
    			attr_dev(linearGradient28, "x2", "520.211");
    			attr_dev(linearGradient28, "y2", "254.907");
    			attr_dev(linearGradient28, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient28, file$c, 262, 0, 41224);
    			attr_dev(stop58, "stop-color", "#57661F");
    			add_location(stop58, file$c, 267, 0, 41583);
    			attr_dev(stop59, "offset", "0.791667");
    			attr_dev(stop59, "stop-color", "#9CB23E");
    			add_location(stop59, file$c, 268, 0, 41613);
    			attr_dev(linearGradient29, "id", "paint29_linear_637_19820");
    			attr_dev(linearGradient29, "x1", "86.3353");
    			attr_dev(linearGradient29, "y1", "129.227");
    			attr_dev(linearGradient29, "x2", "62.2975");
    			attr_dev(linearGradient29, "y2", "220.006");
    			attr_dev(linearGradient29, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient29, file$c, 266, 0, 41452);
    			attr_dev(stop60, "offset", "0.541667");
    			attr_dev(stop60, "stop-color", "#E85151");
    			add_location(stop60, file$c, 271, 0, 41811);
    			attr_dev(stop61, "offset", "0.994792");
    			attr_dev(stop61, "stop-color", "#B83535");
    			add_location(stop61, file$c, 272, 0, 41859);
    			attr_dev(linearGradient30, "id", "paint30_linear_637_19820");
    			attr_dev(linearGradient30, "x1", "105.185");
    			attr_dev(linearGradient30, "y1", "61.3743");
    			attr_dev(linearGradient30, "x2", "100.375");
    			attr_dev(linearGradient30, "y2", "111.979");
    			attr_dev(linearGradient30, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient30, file$c, 270, 0, 41680);
    			attr_dev(stop62, "offset", "0.541667");
    			attr_dev(stop62, "stop-color", "#E85151");
    			add_location(stop62, file$c, 275, 0, 42057);
    			attr_dev(stop63, "offset", "0.994792");
    			attr_dev(stop63, "stop-color", "#B83535");
    			add_location(stop63, file$c, 276, 0, 42105);
    			attr_dev(linearGradient31, "id", "paint31_linear_637_19820");
    			attr_dev(linearGradient31, "x1", "151.361");
    			attr_dev(linearGradient31, "y1", "86.1087");
    			attr_dev(linearGradient31, "x2", "105.267");
    			attr_dev(linearGradient31, "y2", "118.309");
    			attr_dev(linearGradient31, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient31, file$c, 274, 0, 41926);
    			attr_dev(stop64, "stop-color", "#57661F");
    			add_location(stop64, file$c, 279, 0, 42303);
    			attr_dev(stop65, "offset", "0.791667");
    			attr_dev(stop65, "stop-color", "#9CB23E");
    			add_location(stop65, file$c, 280, 0, 42333);
    			attr_dev(linearGradient32, "id", "paint32_linear_637_19820");
    			attr_dev(linearGradient32, "x1", "771.128");
    			attr_dev(linearGradient32, "y1", "271.396");
    			attr_dev(linearGradient32, "x2", "790.298");
    			attr_dev(linearGradient32, "y2", "391.323");
    			attr_dev(linearGradient32, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient32, file$c, 278, 0, 42172);
    			attr_dev(stop66, "offset", "0.541667");
    			attr_dev(stop66, "stop-color", "#E85151");
    			add_location(stop66, file$c, 283, 0, 42528);
    			attr_dev(stop67, "offset", "0.994792");
    			attr_dev(stop67, "stop-color", "#B83535");
    			add_location(stop67, file$c, 284, 0, 42576);
    			attr_dev(linearGradient33, "id", "paint33_linear_637_19820");
    			attr_dev(linearGradient33, "x1", "758.08");
    			attr_dev(linearGradient33, "y1", "201.2");
    			attr_dev(linearGradient33, "x2", "776.244");
    			attr_dev(linearGradient33, "y2", "258.436");
    			attr_dev(linearGradient33, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient33, file$c, 282, 0, 42400);
    			attr_dev(stop68, "offset", "0.541667");
    			attr_dev(stop68, "stop-color", "#E85151");
    			add_location(stop68, file$c, 287, 0, 42774);
    			attr_dev(stop69, "offset", "0.994792");
    			attr_dev(stop69, "stop-color", "#B83535");
    			add_location(stop69, file$c, 288, 0, 42822);
    			attr_dev(linearGradient34, "id", "paint34_linear_637_19820");
    			attr_dev(linearGradient34, "x1", "819.711");
    			attr_dev(linearGradient34, "y1", "206.743");
    			attr_dev(linearGradient34, "x2", "784.488");
    			attr_dev(linearGradient34, "y2", "263.055");
    			attr_dev(linearGradient34, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient34, file$c, 286, 0, 42643);
    			attr_dev(stop70, "stop-color", "#57661F");
    			add_location(stop70, file$c, 291, 0, 43020);
    			attr_dev(stop71, "offset", "0.791667");
    			attr_dev(stop71, "stop-color", "#9CB23E");
    			add_location(stop71, file$c, 292, 0, 43050);
    			attr_dev(linearGradient35, "id", "paint35_linear_637_19820");
    			attr_dev(linearGradient35, "x1", "153.972");
    			attr_dev(linearGradient35, "y1", "140.209");
    			attr_dev(linearGradient35, "x2", "91.9516");
    			attr_dev(linearGradient35, "y2", "362.651");
    			attr_dev(linearGradient35, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient35, file$c, 290, 0, 42889);
    			attr_dev(stop72, "stop-color", "#FFCD59");
    			add_location(stop72, file$c, 295, 0, 43248);
    			attr_dev(stop73, "offset", "0.895833");
    			attr_dev(stop73, "stop-color", "#F2AC49");
    			add_location(stop73, file$c, 296, 0, 43278);
    			attr_dev(linearGradient36, "id", "paint36_linear_637_19820");
    			attr_dev(linearGradient36, "x1", "150.023");
    			attr_dev(linearGradient36, "y1", "112.172");
    			attr_dev(linearGradient36, "x2", "143.539");
    			attr_dev(linearGradient36, "y2", "175.949");
    			attr_dev(linearGradient36, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient36, file$c, 294, 0, 43117);
    			attr_dev(stop74, "stop-color", "#57661F");
    			add_location(stop74, file$c, 299, 0, 43476);
    			attr_dev(stop75, "offset", "0.791667");
    			attr_dev(stop75, "stop-color", "#9CB23E");
    			add_location(stop75, file$c, 300, 0, 43506);
    			attr_dev(linearGradient37, "id", "paint37_linear_637_19820");
    			attr_dev(linearGradient37, "x1", "103.461");
    			attr_dev(linearGradient37, "y1", "165.872");
    			attr_dev(linearGradient37, "x2", "109.527");
    			attr_dev(linearGradient37, "y2", "343.167");
    			attr_dev(linearGradient37, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient37, file$c, 298, 0, 43345);
    			attr_dev(stop76, "stop-color", "#FFCD59");
    			add_location(stop76, file$c, 303, 0, 43703);
    			attr_dev(stop77, "offset", "0.895833");
    			attr_dev(stop77, "stop-color", "#F2AC49");
    			add_location(stop77, file$c, 304, 0, 43733);
    			attr_dev(linearGradient38, "id", "paint38_linear_637_19820");
    			attr_dev(linearGradient38, "x1", "122.82");
    			attr_dev(linearGradient38, "y1", "129.228");
    			attr_dev(linearGradient38, "x2", "119.871");
    			attr_dev(linearGradient38, "y2", "148.431");
    			attr_dev(linearGradient38, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient38, file$c, 302, 0, 43573);
    			attr_dev(stop78, "stop-color", "#F2B091");
    			add_location(stop78, file$c, 307, 0, 43931);
    			attr_dev(stop79, "offset", "0.729167");
    			attr_dev(stop79, "stop-color", "#F26E30");
    			add_location(stop79, file$c, 308, 0, 43961);
    			attr_dev(linearGradient39, "id", "paint39_linear_637_19820");
    			attr_dev(linearGradient39, "x1", "48.2151");
    			attr_dev(linearGradient39, "y1", "74.5145");
    			attr_dev(linearGradient39, "x2", "19.3739");
    			attr_dev(linearGradient39, "y2", "136.242");
    			attr_dev(linearGradient39, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient39, file$c, 306, 0, 43800);
    			attr_dev(stop80, "stop-color", "#F2B091");
    			add_location(stop80, file$c, 311, 0, 44159);
    			attr_dev(stop81, "offset", "0.729167");
    			attr_dev(stop81, "stop-color", "#F26E30");
    			add_location(stop81, file$c, 312, 0, 44189);
    			attr_dev(linearGradient40, "id", "paint40_linear_637_19820");
    			attr_dev(linearGradient40, "x1", "3.8508");
    			attr_dev(linearGradient40, "y1", "102.421");
    			attr_dev(linearGradient40, "x2", "-10.3894");
    			attr_dev(linearGradient40, "y2", "123.341");
    			attr_dev(linearGradient40, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient40, file$c, 310, 0, 44028);
    			attr_dev(stop82, "stop-color", "#F2B091");
    			add_location(stop82, file$c, 315, 0, 44387);
    			attr_dev(stop83, "offset", "0.729167");
    			attr_dev(stop83, "stop-color", "#F26E30");
    			add_location(stop83, file$c, 316, 0, 44417);
    			attr_dev(linearGradient41, "id", "paint41_linear_637_19820");
    			attr_dev(linearGradient41, "x1", "65.1417");
    			attr_dev(linearGradient41, "y1", "99.0843");
    			attr_dev(linearGradient41, "x2", "30.4896");
    			attr_dev(linearGradient41, "y2", "143.808");
    			attr_dev(linearGradient41, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient41, file$c, 314, 0, 44256);
    			attr_dev(stop84, "stop-color", "#F2B091");
    			add_location(stop84, file$c, 319, 0, 44616);
    			attr_dev(stop85, "offset", "0.729167");
    			attr_dev(stop85, "stop-color", "#F26E30");
    			add_location(stop85, file$c, 320, 0, 44646);
    			attr_dev(linearGradient42, "id", "paint42_linear_637_19820");
    			attr_dev(linearGradient42, "x1", "21.3834");
    			attr_dev(linearGradient42, "y1", "69.3088");
    			attr_dev(linearGradient42, "x2", "-6.10211");
    			attr_dev(linearGradient42, "y2", "129.589");
    			attr_dev(linearGradient42, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient42, file$c, 318, 0, 44484);
    			attr_dev(stop86, "stop-color", "#57661F");
    			add_location(stop86, file$c, 323, 0, 44844);
    			attr_dev(stop87, "offset", "0.791667");
    			attr_dev(stop87, "stop-color", "#9CB23E");
    			add_location(stop87, file$c, 324, 0, 44874);
    			attr_dev(linearGradient43, "id", "paint43_linear_637_19820");
    			attr_dev(linearGradient43, "x1", "1025.69");
    			attr_dev(linearGradient43, "y1", "200.768");
    			attr_dev(linearGradient43, "x2", "1065.36");
    			attr_dev(linearGradient43, "y2", "493.805");
    			attr_dev(linearGradient43, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient43, file$c, 322, 0, 44713);
    			attr_dev(stop88, "stop-color", "#FFCD59");
    			add_location(stop88, file$c, 327, 0, 45072);
    			attr_dev(stop89, "offset", "0.895833");
    			attr_dev(stop89, "stop-color", "#F2AC49");
    			add_location(stop89, file$c, 328, 0, 45102);
    			attr_dev(linearGradient44, "id", "paint44_linear_637_19820");
    			attr_dev(linearGradient44, "x1", "1035.94");
    			attr_dev(linearGradient44, "y1", "157.049");
    			attr_dev(linearGradient44, "x2", "1032.83");
    			attr_dev(linearGradient44, "y2", "241.696");
    			attr_dev(linearGradient44, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient44, file$c, 326, 0, 44941);
    			attr_dev(stop90, "stop-color", "#57661F");
    			add_location(stop90, file$c, 331, 0, 45300);
    			attr_dev(stop91, "offset", "0.791667");
    			attr_dev(stop91, "stop-color", "#9CB23E");
    			add_location(stop91, file$c, 332, 0, 45330);
    			attr_dev(linearGradient45, "id", "paint45_linear_637_19820");
    			attr_dev(linearGradient45, "x1", "1138.15");
    			attr_dev(linearGradient45, "y1", "244.873");
    			attr_dev(linearGradient45, "x2", "1132.08");
    			attr_dev(linearGradient45, "y2", "422.167");
    			attr_dev(linearGradient45, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient45, file$c, 330, 0, 45169);
    			attr_dev(stop92, "stop-color", "#FFCD59");
    			add_location(stop92, file$c, 335, 0, 45528);
    			attr_dev(stop93, "offset", "0.895833");
    			attr_dev(stop93, "stop-color", "#F2AC49");
    			add_location(stop93, file$c, 336, 0, 45558);
    			attr_dev(linearGradient46, "id", "paint46_linear_637_19820");
    			attr_dev(linearGradient46, "x1", "1118.79");
    			attr_dev(linearGradient46, "y1", "208.228");
    			attr_dev(linearGradient46, "x2", "1121.74");
    			attr_dev(linearGradient46, "y2", "227.432");
    			attr_dev(linearGradient46, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient46, file$c, 334, 0, 45397);
    			attr_dev(stop94, "stop-color", "#57661F");
    			add_location(stop94, file$c, 339, 0, 45756);
    			attr_dev(stop95, "offset", "0.791667");
    			attr_dev(stop95, "stop-color", "#9CB23E");
    			add_location(stop95, file$c, 340, 0, 45786);
    			attr_dev(linearGradient47, "id", "paint47_linear_637_19820");
    			attr_dev(linearGradient47, "x1", "1116.53");
    			attr_dev(linearGradient47, "y1", "267.356");
    			attr_dev(linearGradient47, "x2", "1117.16");
    			attr_dev(linearGradient47, "y2", "342.264");
    			attr_dev(linearGradient47, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient47, file$c, 338, 0, 45625);
    			attr_dev(stop96, "stop-color", "#F2B091");
    			add_location(stop96, file$c, 343, 0, 45983);
    			attr_dev(stop97, "offset", "0.729167");
    			attr_dev(stop97, "stop-color", "#F26E30");
    			add_location(stop97, file$c, 344, 0, 46013);
    			attr_dev(linearGradient48, "id", "paint48_linear_637_19820");
    			attr_dev(linearGradient48, "x1", "1227.95");
    			attr_dev(linearGradient48, "y1", "202.814");
    			attr_dev(linearGradient48, "x2", "1298.4");
    			attr_dev(linearGradient48, "y2", "283.853");
    			attr_dev(linearGradient48, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient48, file$c, 342, 0, 45853);
    			attr_dev(stop98, "stop-color", "#F2B091");
    			add_location(stop98, file$c, 347, 0, 46211);
    			attr_dev(stop99, "offset", "0.729167");
    			attr_dev(stop99, "stop-color", "#F26E30");
    			add_location(stop99, file$c, 348, 0, 46241);
    			attr_dev(linearGradient49, "id", "paint49_linear_637_19820");
    			attr_dev(linearGradient49, "x1", "1205.85");
    			attr_dev(linearGradient49, "y1", "251.343");
    			attr_dev(linearGradient49, "x2", "1277.29");
    			attr_dev(linearGradient49, "y2", "311.161");
    			attr_dev(linearGradient49, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient49, file$c, 346, 0, 46080);
    			attr_dev(stop100, "stop-color", "#F2B091");
    			add_location(stop100, file$c, 351, 0, 46438);
    			attr_dev(stop101, "offset", "0.729167");
    			attr_dev(stop101, "stop-color", "#F26E30");
    			add_location(stop101, file$c, 352, 0, 46468);
    			attr_dev(linearGradient50, "id", "paint50_linear_637_19820");
    			attr_dev(linearGradient50, "x1", "1272.4");
    			attr_dev(linearGradient50, "y1", "38.8921");
    			attr_dev(linearGradient50, "x2", "1321.16");
    			attr_dev(linearGradient50, "y2", "45.2045");
    			attr_dev(linearGradient50, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient50, file$c, 350, 0, 46308);
    			attr_dev(stop102, "stop-color", "#57661F");
    			add_location(stop102, file$c, 355, 0, 46666);
    			attr_dev(stop103, "offset", "0.791667");
    			attr_dev(stop103, "stop-color", "#9CB23E");
    			add_location(stop103, file$c, 356, 0, 46696);
    			attr_dev(linearGradient51, "id", "paint51_linear_637_19820");
    			attr_dev(linearGradient51, "x1", "684.766");
    			attr_dev(linearGradient51, "y1", "265.774");
    			attr_dev(linearGradient51, "x2", "842.461");
    			attr_dev(linearGradient51, "y2", "550.415");
    			attr_dev(linearGradient51, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient51, file$c, 354, 0, 46535);
    			attr_dev(stop104, "stop-color", "#FFCD59");
    			add_location(stop104, file$c, 359, 0, 46894);
    			attr_dev(stop105, "offset", "0.895833");
    			attr_dev(stop105, "stop-color", "#F2AC49");
    			add_location(stop105, file$c, 360, 0, 46924);
    			attr_dev(linearGradient52, "id", "paint52_linear_637_19820");
    			attr_dev(linearGradient52, "x1", "658.216");
    			attr_dev(linearGradient52, "y1", "230.034");
    			attr_dev(linearGradient52, "x2", "706.763");
    			attr_dev(linearGradient52, "y2", "293.139");
    			attr_dev(linearGradient52, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient52, file$c, 358, 0, 46763);
    			attr_dev(stop106, "stop-color", "#57661F");
    			add_location(stop106, file$c, 363, 0, 47119);
    			attr_dev(stop107, "offset", "0.791667");
    			attr_dev(stop107, "stop-color", "#9CB23E");
    			add_location(stop107, file$c, 364, 0, 47149);
    			attr_dev(linearGradient53, "id", "paint53_linear_637_19820");
    			attr_dev(linearGradient53, "x1", "668.256");
    			attr_dev(linearGradient53, "y1", "381.26");
    			attr_dev(linearGradient53, "x2", "748.6");
    			attr_dev(linearGradient53, "y2", "524.425");
    			attr_dev(linearGradient53, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient53, file$c, 362, 0, 46991);
    			attr_dev(stop108, "stop-color", "#57661F");
    			add_location(stop108, file$c, 367, 0, 47346);
    			attr_dev(stop109, "offset", "0.791667");
    			attr_dev(stop109, "stop-color", "#9CB23E");
    			add_location(stop109, file$c, 368, 0, 47376);
    			attr_dev(linearGradient54, "id", "paint54_linear_637_19820");
    			attr_dev(linearGradient54, "x1", "191.385");
    			attr_dev(linearGradient54, "y1", "320.764");
    			attr_dev(linearGradient54, "x2", "209.09");
    			attr_dev(linearGradient54, "y2", "638.868");
    			attr_dev(linearGradient54, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient54, file$c, 366, 0, 47216);
    			attr_dev(stop110, "offset", "0.541667");
    			attr_dev(stop110, "stop-color", "#E85151");
    			add_location(stop110, file$c, 371, 0, 47574);
    			attr_dev(stop111, "offset", "0.994792");
    			attr_dev(stop111, "stop-color", "#B83535");
    			add_location(stop111, file$c, 372, 0, 47622);
    			attr_dev(linearGradient55, "id", "paint55_linear_637_19820");
    			attr_dev(linearGradient55, "x1", "177.801");
    			attr_dev(linearGradient55, "y1", "83.4444");
    			attr_dev(linearGradient55, "x2", "219.054");
    			attr_dev(linearGradient55, "y2", "268.192");
    			attr_dev(linearGradient55, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient55, file$c, 370, 0, 47443);
    			attr_dev(stop112, "offset", "0.541667");
    			attr_dev(stop112, "stop-color", "#E85151");
    			add_location(stop112, file$c, 375, 0, 47820);
    			attr_dev(stop113, "offset", "0.994792");
    			attr_dev(stop113, "stop-color", "#B83535");
    			add_location(stop113, file$c, 376, 0, 47868);
    			attr_dev(linearGradient56, "id", "paint56_linear_637_19820");
    			attr_dev(linearGradient56, "x1", "369.813");
    			attr_dev(linearGradient56, "y1", "117.851");
    			attr_dev(linearGradient56, "x2", "243.669");
    			attr_dev(linearGradient56, "y2", "284.972");
    			attr_dev(linearGradient56, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient56, file$c, 374, 0, 47689);
    			attr_dev(stop114, "stop-color", "#57661F");
    			add_location(stop114, file$c, 379, 0, 48067);
    			attr_dev(stop115, "offset", "0.791667");
    			attr_dev(stop115, "stop-color", "#9CB23E");
    			add_location(stop115, file$c, 380, 0, 48097);
    			attr_dev(linearGradient57, "id", "paint57_linear_637_19820");
    			attr_dev(linearGradient57, "x1", "137.798");
    			attr_dev(linearGradient57, "y1", "515.894");
    			attr_dev(linearGradient57, "x2", "-41.2734");
    			attr_dev(linearGradient57, "y2", "677.601");
    			attr_dev(linearGradient57, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient57, file$c, 378, 0, 47935);
    			attr_dev(stop116, "stop-color", "#57661F");
    			add_location(stop116, file$c, 383, 0, 48295);
    			attr_dev(stop117, "offset", "0.791667");
    			attr_dev(stop117, "stop-color", "#9CB23E");
    			add_location(stop117, file$c, 384, 0, 48325);
    			attr_dev(linearGradient58, "id", "paint58_linear_637_19820");
    			attr_dev(linearGradient58, "x1", "578.856");
    			attr_dev(linearGradient58, "y1", "318.281");
    			attr_dev(linearGradient58, "x2", "537.332");
    			attr_dev(linearGradient58, "y2", "474.301");
    			attr_dev(linearGradient58, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient58, file$c, 382, 0, 48164);
    			attr_dev(stop118, "offset", "0.541667");
    			attr_dev(stop118, "stop-color", "#E85151");
    			add_location(stop118, file$c, 387, 0, 48523);
    			attr_dev(stop119, "offset", "0.994792");
    			attr_dev(stop119, "stop-color", "#B83535");
    			add_location(stop119, file$c, 388, 0, 48571);
    			attr_dev(linearGradient59, "id", "paint59_linear_637_19820");
    			attr_dev(linearGradient59, "x1", "608.576");
    			attr_dev(linearGradient59, "y1", "200.913");
    			attr_dev(linearGradient59, "x2", "572.605");
    			attr_dev(linearGradient59, "y2", "280.561");
    			attr_dev(linearGradient59, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient59, file$c, 386, 0, 48392);
    			attr_dev(stop120, "offset", "0.541667");
    			attr_dev(stop120, "stop-color", "#E85151");
    			add_location(stop120, file$c, 391, 0, 48768);
    			attr_dev(stop121, "offset", "0.994792");
    			attr_dev(stop121, "stop-color", "#B83535");
    			add_location(stop121, file$c, 392, 0, 48816);
    			attr_dev(linearGradient60, "id", "paint60_linear_637_19820");
    			attr_dev(linearGradient60, "x1", "518.55");
    			attr_dev(linearGradient60, "y1", "198.462");
    			attr_dev(linearGradient60, "x2", "559.904");
    			attr_dev(linearGradient60, "y2", "285.838");
    			attr_dev(linearGradient60, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient60, file$c, 390, 0, 48638);
    			attr_dev(stop122, "stop-color", "#57661F");
    			add_location(stop122, file$c, 395, 0, 49014);
    			attr_dev(stop123, "offset", "0.791667");
    			attr_dev(stop123, "stop-color", "#9CB23E");
    			add_location(stop123, file$c, 396, 0, 49044);
    			attr_dev(linearGradient61, "id", "paint61_linear_637_19820");
    			attr_dev(linearGradient61, "x1", "622.151");
    			attr_dev(linearGradient61, "y1", "316.991");
    			attr_dev(linearGradient61, "x2", "639.385");
    			attr_dev(linearGradient61, "y2", "449.931");
    			attr_dev(linearGradient61, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient61, file$c, 394, 0, 48883);
    			attr_dev(stop124, "stop-color", "#57661F");
    			add_location(stop124, file$c, 399, 0, 49241);
    			attr_dev(stop125, "offset", "0.791667");
    			attr_dev(stop125, "stop-color", "#9CB23E");
    			add_location(stop125, file$c, 400, 0, 49271);
    			attr_dev(linearGradient62, "id", "paint62_linear_637_19820");
    			attr_dev(linearGradient62, "x1", "411.24");
    			attr_dev(linearGradient62, "y1", "279.558");
    			attr_dev(linearGradient62, "x2", "406.027");
    			attr_dev(linearGradient62, "y2", "453.601");
    			attr_dev(linearGradient62, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient62, file$c, 398, 0, 49111);
    			attr_dev(stop126, "offset", "0.375");
    			attr_dev(stop126, "stop-color", "#F2AC49");
    			add_location(stop126, file$c, 403, 0, 49469);
    			attr_dev(stop127, "offset", "1");
    			attr_dev(stop127, "stop-color", "#FFCD59");
    			add_location(stop127, file$c, 404, 0, 49514);
    			attr_dev(linearGradient63, "id", "paint63_linear_637_19820");
    			attr_dev(linearGradient63, "x1", "417.382");
    			attr_dev(linearGradient63, "y1", "280.152");
    			attr_dev(linearGradient63, "x2", "465.891");
    			attr_dev(linearGradient63, "y2", "233.168");
    			attr_dev(linearGradient63, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient63, file$c, 402, 0, 49338);
    			attr_dev(stop128, "offset", "0.125");
    			attr_dev(stop128, "stop-color", "#F2AC49");
    			add_location(stop128, file$c, 407, 0, 49705);
    			attr_dev(stop129, "offset", "1");
    			attr_dev(stop129, "stop-color", "#FFCD59");
    			add_location(stop129, file$c, 408, 0, 49750);
    			attr_dev(linearGradient64, "id", "paint64_linear_637_19820");
    			attr_dev(linearGradient64, "x1", "416.628");
    			attr_dev(linearGradient64, "y1", "284.729");
    			attr_dev(linearGradient64, "x2", "424.778");
    			attr_dev(linearGradient64, "y2", "236.601");
    			attr_dev(linearGradient64, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient64, file$c, 406, 0, 49574);
    			attr_dev(stop130, "stop-color", "#57661F");
    			add_location(stop130, file$c, 411, 0, 49941);
    			attr_dev(stop131, "offset", "0.791667");
    			attr_dev(stop131, "stop-color", "#9CB23E");
    			add_location(stop131, file$c, 412, 0, 49971);
    			attr_dev(linearGradient65, "id", "paint65_linear_637_19820");
    			attr_dev(linearGradient65, "x1", "17.3193");
    			attr_dev(linearGradient65, "y1", "229.435");
    			attr_dev(linearGradient65, "x2", "7.28157");
    			attr_dev(linearGradient65, "y2", "293.748");
    			attr_dev(linearGradient65, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient65, file$c, 410, 0, 49810);
    			attr_dev(stop132, "offset", "0.375");
    			attr_dev(stop132, "stop-color", "#F2AC49");
    			add_location(stop132, file$c, 415, 0, 50169);
    			attr_dev(stop133, "offset", "1");
    			attr_dev(stop133, "stop-color", "#FFCD59");
    			add_location(stop133, file$c, 416, 0, 50214);
    			attr_dev(linearGradient66, "id", "paint66_linear_637_19820");
    			attr_dev(linearGradient66, "x1", "13.1294");
    			attr_dev(linearGradient66, "y1", "248.462");
    			attr_dev(linearGradient66, "x2", "116.437");
    			attr_dev(linearGradient66, "y2", "175.749");
    			attr_dev(linearGradient66, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient66, file$c, 414, 0, 50038);
    			attr_dev(stop134, "offset", "0.125");
    			attr_dev(stop134, "stop-color", "#F2AC49");
    			add_location(stop134, file$c, 419, 0, 50405);
    			attr_dev(stop135, "offset", "1");
    			attr_dev(stop135, "stop-color", "#FFCD59");
    			add_location(stop135, file$c, 420, 0, 50450);
    			attr_dev(linearGradient67, "id", "paint67_linear_637_19820");
    			attr_dev(linearGradient67, "x1", "9.39286");
    			attr_dev(linearGradient67, "y1", "256.825");
    			attr_dev(linearGradient67, "x2", "38.9079");
    			attr_dev(linearGradient67, "y2", "169.573");
    			attr_dev(linearGradient67, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient67, file$c, 418, 0, 50274);
    			attr_dev(stop136, "stop-color", "#57661F");
    			add_location(stop136, file$c, 423, 0, 50641);
    			attr_dev(stop137, "offset", "0.791667");
    			attr_dev(stop137, "stop-color", "#9CB23E");
    			add_location(stop137, file$c, 424, 0, 50671);
    			attr_dev(linearGradient68, "id", "paint68_linear_637_19820");
    			attr_dev(linearGradient68, "x1", "296.502");
    			attr_dev(linearGradient68, "y1", "375.553");
    			attr_dev(linearGradient68, "x2", "277.834");
    			attr_dev(linearGradient68, "y2", "783.705");
    			attr_dev(linearGradient68, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient68, file$c, 422, 0, 50510);
    			attr_dev(stop138, "stop-color", "#57661F");
    			add_location(stop138, file$c, 427, 0, 50869);
    			attr_dev(stop139, "offset", "0.791667");
    			attr_dev(stop139, "stop-color", "#9CB23E");
    			add_location(stop139, file$c, 428, 0, 50899);
    			attr_dev(linearGradient69, "id", "paint69_linear_637_19820");
    			attr_dev(linearGradient69, "x1", "363.341");
    			attr_dev(linearGradient69, "y1", "457.369");
    			attr_dev(linearGradient69, "x2", "211.542");
    			attr_dev(linearGradient69, "y2", "647.662");
    			attr_dev(linearGradient69, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient69, file$c, 426, 0, 50738);
    			attr_dev(stop140, "stop-color", "#FFCD59");
    			add_location(stop140, file$c, 431, 0, 51097);
    			attr_dev(stop141, "offset", "0.895833");
    			attr_dev(stop141, "stop-color", "#F2AC49");
    			add_location(stop141, file$c, 432, 0, 51127);
    			attr_dev(linearGradient70, "id", "paint70_linear_637_19820");
    			attr_dev(linearGradient70, "x1", "407.206");
    			attr_dev(linearGradient70, "y1", "279.625");
    			attr_dev(linearGradient70, "x2", "325.656");
    			attr_dev(linearGradient70, "y2", "351.678");
    			attr_dev(linearGradient70, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient70, file$c, 430, 0, 50966);
    			attr_dev(stop142, "stop-color", "#57661F");
    			add_location(stop142, file$c, 435, 0, 51326);
    			attr_dev(stop143, "offset", "0.791667");
    			attr_dev(stop143, "stop-color", "#9CB23E");
    			add_location(stop143, file$c, 436, 0, 51356);
    			attr_dev(linearGradient71, "id", "paint71_linear_637_19820");
    			attr_dev(linearGradient71, "x1", "112.364");
    			attr_dev(linearGradient71, "y1", "355.112");
    			attr_dev(linearGradient71, "x2", "-21.1857");
    			attr_dev(linearGradient71, "y2", "775.787");
    			attr_dev(linearGradient71, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient71, file$c, 434, 0, 51194);
    			attr_dev(stop144, "stop-color", "#F2B091");
    			add_location(stop144, file$c, 439, 0, 51554);
    			attr_dev(stop145, "offset", "0.729167");
    			attr_dev(stop145, "stop-color", "#F26E30");
    			add_location(stop145, file$c, 440, 0, 51584);
    			attr_dev(linearGradient72, "id", "paint72_linear_637_19820");
    			attr_dev(linearGradient72, "x1", "246.613");
    			attr_dev(linearGradient72, "y1", "249.788");
    			attr_dev(linearGradient72, "x2", "109.216");
    			attr_dev(linearGradient72, "y2", "411.786");
    			attr_dev(linearGradient72, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient72, file$c, 438, 0, 51423);
    			attr_dev(stop146, "stop-color", "#F2B091");
    			add_location(stop146, file$c, 443, 0, 51783);
    			attr_dev(stop147, "offset", "0.729167");
    			attr_dev(stop147, "stop-color", "#F26E30");
    			add_location(stop147, file$c, 444, 0, 51813);
    			attr_dev(linearGradient73, "id", "paint73_linear_637_19820");
    			attr_dev(linearGradient73, "x1", "87.3258");
    			attr_dev(linearGradient73, "y1", "223.622");
    			attr_dev(linearGradient73, "x2", "-16.6982");
    			attr_dev(linearGradient73, "y2", "356.265");
    			attr_dev(linearGradient73, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient73, file$c, 442, 0, 51651);
    			attr_dev(stop148, "stop-color", "#F2B091");
    			add_location(stop148, file$c, 447, 0, 52011);
    			attr_dev(stop149, "offset", "0.729167");
    			attr_dev(stop149, "stop-color", "#F26E30");
    			add_location(stop149, file$c, 448, 0, 52041);
    			attr_dev(linearGradient74, "id", "paint74_linear_637_19820");
    			attr_dev(linearGradient74, "x1", "277.364");
    			attr_dev(linearGradient74, "y1", "337.578");
    			attr_dev(linearGradient74, "x2", "136.442");
    			attr_dev(linearGradient74, "y2", "443.664");
    			attr_dev(linearGradient74, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient74, file$c, 446, 0, 51880);
    			attr_dev(stop150, "stop-color", "#F2B091");
    			add_location(stop150, file$c, 451, 0, 52239);
    			attr_dev(stop151, "offset", "0.729167");
    			attr_dev(stop151, "stop-color", "#F26E30");
    			add_location(stop151, file$c, 452, 0, 52269);
    			attr_dev(linearGradient75, "id", "paint75_linear_637_19820");
    			attr_dev(linearGradient75, "x1", "169.089");
    			attr_dev(linearGradient75, "y1", "211.872");
    			attr_dev(linearGradient75, "x2", "39.2634");
    			attr_dev(linearGradient75, "y2", "378.044");
    			attr_dev(linearGradient75, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient75, file$c, 450, 0, 52108);
    			attr_dev(stop152, "stop-color", "#57661F");
    			add_location(stop152, file$c, 455, 0, 52467);
    			attr_dev(stop153, "offset", "0.791667");
    			attr_dev(stop153, "stop-color", "#9CB23E");
    			add_location(stop153, file$c, 456, 0, 52497);
    			attr_dev(linearGradient76, "id", "paint76_linear_637_19820");
    			attr_dev(linearGradient76, "x1", "178.801");
    			attr_dev(linearGradient76, "y1", "467.394");
    			attr_dev(linearGradient76, "x2", "55.7172");
    			attr_dev(linearGradient76, "y2", "700.473");
    			attr_dev(linearGradient76, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient76, file$c, 454, 0, 52336);
    			attr_dev(stop154, "stop-color", "#57661F");
    			add_location(stop154, file$c, 459, 0, 52695);
    			attr_dev(stop155, "offset", "0.791667");
    			attr_dev(stop155, "stop-color", "#9CB23E");
    			add_location(stop155, file$c, 460, 0, 52725);
    			attr_dev(linearGradient77, "id", "paint77_linear_637_19820");
    			attr_dev(linearGradient77, "x1", "998.899");
    			attr_dev(linearGradient77, "y1", "324.442");
    			attr_dev(linearGradient77, "x2", "1043.97");
    			attr_dev(linearGradient77, "y2", "787.832");
    			attr_dev(linearGradient77, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient77, file$c, 458, 0, 52564);
    			attr_dev(stop156, "stop-color", "#F2B091");
    			add_location(stop156, file$c, 463, 0, 52923);
    			attr_dev(stop157, "offset", "0.729167");
    			attr_dev(stop157, "stop-color", "#F26E30");
    			add_location(stop157, file$c, 464, 0, 52953);
    			attr_dev(linearGradient78, "id", "paint78_linear_637_19820");
    			attr_dev(linearGradient78, "x1", "913.401");
    			attr_dev(linearGradient78, "y1", "235.851");
    			attr_dev(linearGradient78, "x2", "973.053");
    			attr_dev(linearGradient78, "y2", "335.658");
    			attr_dev(linearGradient78, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient78, file$c, 462, 0, 52792);
    			attr_dev(stop158, "stop-color", "#F2B091");
    			add_location(stop158, file$c, 467, 0, 53151);
    			attr_dev(stop159, "offset", "0.729167");
    			attr_dev(stop159, "stop-color", "#F26E30");
    			add_location(stop159, file$c, 468, 0, 53181);
    			attr_dev(linearGradient79, "id", "paint79_linear_637_19820");
    			attr_dev(linearGradient79, "x1", "1001.76");
    			attr_dev(linearGradient79, "y1", "236.018");
    			attr_dev(linearGradient79, "x2", "1046.03");
    			attr_dev(linearGradient79, "y2", "316.979");
    			attr_dev(linearGradient79, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient79, file$c, 466, 0, 53020);
    			attr_dev(stop160, "stop-color", "#F2B091");
    			add_location(stop160, file$c, 471, 0, 53379);
    			attr_dev(stop161, "offset", "0.729167");
    			attr_dev(stop161, "stop-color", "#F26E30");
    			add_location(stop161, file$c, 472, 0, 53409);
    			attr_dev(linearGradient80, "id", "paint80_linear_637_19820");
    			attr_dev(linearGradient80, "x1", "888.917");
    			attr_dev(linearGradient80, "y1", "280.496");
    			attr_dev(linearGradient80, "x2", "955.491");
    			attr_dev(linearGradient80, "y2", "350.427");
    			attr_dev(linearGradient80, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient80, file$c, 470, 0, 53248);
    			attr_dev(stop162, "stop-color", "#F2B091");
    			add_location(stop162, file$c, 475, 0, 53607);
    			attr_dev(stop163, "offset", "0.729167");
    			attr_dev(stop163, "stop-color", "#F26E30");
    			add_location(stop163, file$c, 476, 0, 53637);
    			attr_dev(linearGradient81, "id", "paint81_linear_637_19820");
    			attr_dev(linearGradient81, "x1", "958.665");
    			attr_dev(linearGradient81, "y1", "222.336");
    			attr_dev(linearGradient81, "x2", "1013.85");
    			attr_dev(linearGradient81, "y2", "323.716");
    			attr_dev(linearGradient81, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient81, file$c, 474, 0, 53476);
    			attr_dev(stop164, "stop-color", "#57661F");
    			add_location(stop164, file$c, 479, 0, 53835);
    			attr_dev(stop165, "offset", "0.791667");
    			attr_dev(stop165, "stop-color", "#9CB23E");
    			add_location(stop165, file$c, 480, 0, 53865);
    			attr_dev(linearGradient82, "id", "paint82_linear_637_19820");
    			attr_dev(linearGradient82, "x1", "1057.67");
    			attr_dev(linearGradient82, "y1", "326.276");
    			attr_dev(linearGradient82, "x2", "1153.25");
    			attr_dev(linearGradient82, "y2", "543.587");
    			attr_dev(linearGradient82, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient82, file$c, 478, 0, 53704);
    			attr_dev(stop166, "stop-color", "#57661F");
    			add_location(stop166, file$c, 483, 0, 54060);
    			attr_dev(stop167, "offset", "0.791667");
    			attr_dev(stop167, "stop-color", "#9CB23E");
    			add_location(stop167, file$c, 484, 0, 54090);
    			attr_dev(linearGradient83, "id", "paint83_linear_637_19820");
    			attr_dev(linearGradient83, "x1", "1170");
    			attr_dev(linearGradient83, "y1", "477.763");
    			attr_dev(linearGradient83, "x2", "1158.34");
    			attr_dev(linearGradient83, "y2", "900.468");
    			attr_dev(linearGradient83, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient83, file$c, 482, 0, 53932);
    			attr_dev(stop168, "stop-color", "#57661F");
    			add_location(stop168, file$c, 487, 0, 54288);
    			attr_dev(stop169, "offset", "0.791667");
    			attr_dev(stop169, "stop-color", "#9CB23E");
    			add_location(stop169, file$c, 488, 0, 54318);
    			attr_dev(linearGradient84, "id", "paint84_linear_637_19820");
    			attr_dev(linearGradient84, "x1", "1229.26");
    			attr_dev(linearGradient84, "y1", "379.375");
    			attr_dev(linearGradient84, "x2", "1444.87");
    			attr_dev(linearGradient84, "y2", "625.504");
    			attr_dev(linearGradient84, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient84, file$c, 486, 0, 54157);
    			attr_dev(stop170, "stop-color", "#57661F");
    			add_location(stop170, file$c, 491, 0, 54515);
    			attr_dev(stop171, "offset", "0.791667");
    			attr_dev(stop171, "stop-color", "#9CB23E");
    			add_location(stop171, file$c, 492, 0, 54545);
    			attr_dev(linearGradient85, "id", "paint85_linear_637_19820");
    			attr_dev(linearGradient85, "x1", "1079.91");
    			attr_dev(linearGradient85, "y1", "475.777");
    			attr_dev(linearGradient85, "x2", "1185.8");
    			attr_dev(linearGradient85, "y2", "813.588");
    			attr_dev(linearGradient85, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient85, file$c, 490, 0, 54385);
    			attr_dev(stop172, "offset", "0.541667");
    			attr_dev(stop172, "stop-color", "#E85151");
    			add_location(stop172, file$c, 495, 0, 54742);
    			attr_dev(stop173, "offset", "0.994792");
    			attr_dev(stop173, "stop-color", "#B83535");
    			add_location(stop173, file$c, 496, 0, 54790);
    			attr_dev(linearGradient86, "id", "paint86_linear_637_19820");
    			attr_dev(linearGradient86, "x1", "1169.4");
    			attr_dev(linearGradient86, "y1", "142.273");
    			attr_dev(linearGradient86, "x2", "1143.83");
    			attr_dev(linearGradient86, "y2", "392.514");
    			attr_dev(linearGradient86, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient86, file$c, 494, 0, 54612);
    			attr_dev(stop174, "offset", "0.541667");
    			attr_dev(stop174, "stop-color", "#E85151");
    			add_location(stop174, file$c, 499, 0, 54988);
    			attr_dev(stop175, "offset", "0.994792");
    			attr_dev(stop175, "stop-color", "#B83535");
    			add_location(stop175, file$c, 500, 0, 55036);
    			attr_dev(linearGradient87, "id", "paint87_linear_637_19820");
    			attr_dev(linearGradient87, "x1", "921.397");
    			attr_dev(linearGradient87, "y1", "217.678");
    			attr_dev(linearGradient87, "x2", "1113.97");
    			attr_dev(linearGradient87, "y2", "418.502");
    			attr_dev(linearGradient87, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient87, file$c, 498, 0, 54857);
    			attr_dev(stop176, "stop-color", "#57661F");
    			add_location(stop176, file$c, 503, 0, 55234);
    			attr_dev(stop177, "offset", "0.791667");
    			attr_dev(stop177, "stop-color", "#9CB23E");
    			add_location(stop177, file$c, 504, 0, 55264);
    			attr_dev(linearGradient88, "id", "paint88_linear_637_19820");
    			attr_dev(linearGradient88, "x1", "610.276");
    			attr_dev(linearGradient88, "y1", "365.487");
    			attr_dev(linearGradient88, "x2", "614.602");
    			attr_dev(linearGradient88, "y2", "528.207");
    			attr_dev(linearGradient88, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient88, file$c, 502, 0, 55103);
    			attr_dev(stop178, "offset", "0.375");
    			attr_dev(stop178, "stop-color", "#F2AC49");
    			add_location(stop178, file$c, 507, 0, 55461);
    			attr_dev(stop179, "offset", "1");
    			attr_dev(stop179, "stop-color", "#FFCD59");
    			add_location(stop179, file$c, 508, 0, 55506);
    			attr_dev(linearGradient89, "id", "paint89_linear_637_19820");
    			attr_dev(linearGradient89, "x1", "616.31");
    			attr_dev(linearGradient89, "y1", "372.009");
    			attr_dev(linearGradient89, "x2", "685.593");
    			attr_dev(linearGradient89, "y2", "304.903");
    			attr_dev(linearGradient89, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient89, file$c, 506, 0, 55331);
    			attr_dev(stop180, "offset", "0.125");
    			attr_dev(stop180, "stop-color", "#F2AC49");
    			add_location(stop180, file$c, 511, 0, 55697);
    			attr_dev(stop181, "offset", "1");
    			attr_dev(stop181, "stop-color", "#FFCD59");
    			add_location(stop181, file$c, 512, 0, 55742);
    			attr_dev(linearGradient90, "id", "paint90_linear_637_19820");
    			attr_dev(linearGradient90, "x1", "615.233");
    			attr_dev(linearGradient90, "y1", "378.546");
    			attr_dev(linearGradient90, "x2", "626.874");
    			attr_dev(linearGradient90, "y2", "309.806");
    			attr_dev(linearGradient90, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient90, file$c, 510, 0, 55566);
    			attr_dev(stop182, "stop-color", "#57661F");
    			add_location(stop182, file$c, 515, 0, 55933);
    			attr_dev(stop183, "offset", "0.791667");
    			attr_dev(stop183, "stop-color", "#9CB23E");
    			add_location(stop183, file$c, 516, 0, 55963);
    			attr_dev(linearGradient91, "id", "paint91_linear_637_19820");
    			attr_dev(linearGradient91, "x1", "455.907");
    			attr_dev(linearGradient91, "y1", "318.123");
    			attr_dev(linearGradient91, "x2", "528.642");
    			attr_dev(linearGradient91, "y2", "520.694");
    			attr_dev(linearGradient91, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient91, file$c, 514, 0, 55802);
    			attr_dev(stop184, "stop-color", "#F2B091");
    			add_location(stop184, file$c, 519, 0, 56161);
    			attr_dev(stop185, "offset", "0.729167");
    			attr_dev(stop185, "stop-color", "#F26E30");
    			add_location(stop185, file$c, 520, 0, 56191);
    			attr_dev(linearGradient92, "id", "paint92_linear_637_19820");
    			attr_dev(linearGradient92, "x1", "494.522");
    			attr_dev(linearGradient92, "y1", "278.586");
    			attr_dev(linearGradient92, "x2", "481.179");
    			attr_dev(linearGradient92, "y2", "375.228");
    			attr_dev(linearGradient92, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient92, file$c, 518, 0, 56030);
    			attr_dev(stop186, "stop-color", "#F2B091");
    			add_location(stop186, file$c, 523, 0, 56389);
    			attr_dev(stop187, "offset", "0.729167");
    			attr_dev(stop187, "stop-color", "#F26E30");
    			add_location(stop187, file$c, 524, 0, 56419);
    			attr_dev(linearGradient93, "id", "paint93_linear_637_19820");
    			attr_dev(linearGradient93, "x1", "425.564");
    			attr_dev(linearGradient93, "y1", "307.581");
    			attr_dev(linearGradient93, "x2", "417.932");
    			attr_dev(linearGradient93, "y2", "384.555");
    			attr_dev(linearGradient93, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient93, file$c, 522, 0, 56258);
    			attr_dev(stop188, "stop-color", "#F2B091");
    			add_location(stop188, file$c, 527, 0, 56616);
    			attr_dev(stop189, "offset", "0.729167");
    			attr_dev(stop189, "stop-color", "#F26E30");
    			add_location(stop189, file$c, 528, 0, 56646);
    			attr_dev(linearGradient94, "id", "paint94_linear_637_19820");
    			attr_dev(linearGradient94, "x1", "527.523");
    			attr_dev(linearGradient94, "y1", "304.961");
    			attr_dev(linearGradient94, "x2", "498.787");
    			attr_dev(linearGradient94, "y2", "381.13");
    			attr_dev(linearGradient94, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient94, file$c, 526, 0, 56486);
    			attr_dev(stop190, "stop-color", "#F2B091");
    			add_location(stop190, file$c, 531, 0, 56844);
    			attr_dev(stop191, "offset", "0.729167");
    			attr_dev(stop191, "stop-color", "#F26E30");
    			add_location(stop191, file$c, 532, 0, 56874);
    			attr_dev(linearGradient95, "id", "paint95_linear_637_19820");
    			attr_dev(linearGradient95, "x1", "454.969");
    			attr_dev(linearGradient95, "y1", "282.966");
    			attr_dev(linearGradient95, "x2", "445.599");
    			attr_dev(linearGradient95, "y2", "379.272");
    			attr_dev(linearGradient95, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient95, file$c, 530, 0, 56713);
    			attr_dev(stop192, "stop-color", "#57661F");
    			add_location(stop192, file$c, 535, 0, 57070);
    			attr_dev(stop193, "offset", "0.791667");
    			attr_dev(stop193, "stop-color", "#9CB23E");
    			add_location(stop193, file$c, 536, 0, 57100);
    			attr_dev(linearGradient96, "id", "paint96_linear_637_19820");
    			attr_dev(linearGradient96, "x1", "391.375");
    			attr_dev(linearGradient96, "y1", "365.146");
    			attr_dev(linearGradient96, "x2", "517.71");
    			attr_dev(linearGradient96, "y2", "505.06");
    			attr_dev(linearGradient96, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient96, file$c, 534, 0, 56941);
    			attr_dev(stop194, "stop-color", "#57661F");
    			add_location(stop194, file$c, 539, 0, 57297);
    			attr_dev(stop195, "offset", "0.791667");
    			attr_dev(stop195, "stop-color", "#9CB23E");
    			add_location(stop195, file$c, 540, 0, 57327);
    			attr_dev(linearGradient97, "id", "paint97_linear_637_19820");
    			attr_dev(linearGradient97, "x1", "767.58");
    			attr_dev(linearGradient97, "y1", "342.534");
    			attr_dev(linearGradient97, "x2", "815.896");
    			attr_dev(linearGradient97, "y2", "557.668");
    			attr_dev(linearGradient97, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient97, file$c, 538, 0, 57167);
    			attr_dev(stop196, "stop-color", "#F2B091");
    			add_location(stop196, file$c, 543, 0, 57525);
    			attr_dev(stop197, "offset", "0.729167");
    			attr_dev(stop197, "stop-color", "#F26E30");
    			add_location(stop197, file$c, 544, 0, 57555);
    			attr_dev(linearGradient98, "id", "paint98_linear_637_19820");
    			attr_dev(linearGradient98, "x1", "715.413");
    			attr_dev(linearGradient98, "y1", "299.313");
    			attr_dev(linearGradient98, "x2", "757.004");
    			attr_dev(linearGradient98, "y2", "354.375");
    			attr_dev(linearGradient98, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient98, file$c, 542, 0, 57394);
    			attr_dev(stop198, "stop-color", "#F2B091");
    			add_location(stop198, file$c, 547, 0, 57752);
    			attr_dev(stop199, "offset", "0.729167");
    			attr_dev(stop199, "stop-color", "#F26E30");
    			add_location(stop199, file$c, 548, 0, 57782);
    			attr_dev(linearGradient99, "id", "paint99_linear_637_19820");
    			attr_dev(linearGradient99, "x1", "767.555");
    			attr_dev(linearGradient99, "y1", "293.748");
    			attr_dev(linearGradient99, "x2", "798.86");
    			attr_dev(linearGradient99, "y2", "338.677");
    			attr_dev(linearGradient99, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient99, file$c, 546, 0, 57622);
    			attr_dev(stop200, "stop-color", "#F2B091");
    			add_location(stop200, file$c, 551, 0, 57981);
    			attr_dev(stop201, "offset", "0.729167");
    			attr_dev(stop201, "stop-color", "#F26E30");
    			add_location(stop201, file$c, 552, 0, 58011);
    			attr_dev(linearGradient100, "id", "paint100_linear_637_19820");
    			attr_dev(linearGradient100, "x1", "703.829");
    			attr_dev(linearGradient100, "y1", "327.222");
    			attr_dev(linearGradient100, "x2", "747.589");
    			attr_dev(linearGradient100, "y2", "364.214");
    			attr_dev(linearGradient100, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient100, file$c, 550, 0, 57849);
    			attr_dev(stop202, "stop-color", "#F2B091");
    			add_location(stop202, file$c, 555, 0, 58210);
    			attr_dev(stop203, "offset", "0.729167");
    			attr_dev(stop203, "stop-color", "#F26E30");
    			add_location(stop203, file$c, 556, 0, 58240);
    			attr_dev(linearGradient101, "id", "paint101_linear_637_19820");
    			attr_dev(linearGradient101, "x1", "741.252");
    			attr_dev(linearGradient101, "y1", "288.438");
    			attr_dev(linearGradient101, "x2", "780.311");
    			attr_dev(linearGradient101, "y2", "344.714");
    			attr_dev(linearGradient101, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient101, file$c, 554, 0, 58078);
    			attr_dev(stop204, "stop-color", "#57661F");
    			add_location(stop204, file$c, 559, 0, 58439);
    			attr_dev(stop205, "offset", "0.791667");
    			attr_dev(stop205, "stop-color", "#9CB23E");
    			add_location(stop205, file$c, 560, 0, 58469);
    			attr_dev(linearGradient102, "id", "paint102_linear_637_19820");
    			attr_dev(linearGradient102, "x1", "797.585");
    			attr_dev(linearGradient102, "y1", "300.668");
    			attr_dev(linearGradient102, "x2", "846.932");
    			attr_dev(linearGradient102, "y2", "461.373");
    			attr_dev(linearGradient102, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient102, file$c, 558, 0, 58307);
    			attr_dev(stop206, "stop-color", "#57661F");
    			add_location(stop206, file$c, 563, 0, 58668);
    			attr_dev(stop207, "offset", "0.791667");
    			attr_dev(stop207, "stop-color", "#9CB23E");
    			add_location(stop207, file$c, 564, 0, 58698);
    			attr_dev(linearGradient103, "id", "paint103_linear_637_19820");
    			attr_dev(linearGradient103, "x1", "203.267");
    			attr_dev(linearGradient103, "y1", "471.959");
    			attr_dev(linearGradient103, "x2", "129.437");
    			attr_dev(linearGradient103, "y2", "900.535");
    			attr_dev(linearGradient103, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient103, file$c, 562, 0, 58536);
    			attr_dev(stop208, "stop-color", "#FFCD59");
    			add_location(stop208, file$c, 567, 0, 58897);
    			attr_dev(stop209, "offset", "0.895833");
    			attr_dev(stop209, "stop-color", "#F2AC49");
    			add_location(stop209, file$c, 568, 0, 58927);
    			attr_dev(linearGradient104, "id", "paint104_linear_637_19820");
    			attr_dev(linearGradient104, "x1", "266.004");
    			attr_dev(linearGradient104, "y1", "397.653");
    			attr_dev(linearGradient104, "x2", "249.352");
    			attr_dev(linearGradient104, "y2", "442.277");
    			attr_dev(linearGradient104, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient104, file$c, 566, 0, 58765);
    			attr_dev(stop210, "stop-color", "#57661F");
    			add_location(stop210, file$c, 571, 0, 59126);
    			attr_dev(stop211, "offset", "0.791667");
    			attr_dev(stop211, "stop-color", "#9CB23E");
    			add_location(stop211, file$c, 572, 0, 59156);
    			attr_dev(linearGradient105, "id", "paint105_linear_637_19820");
    			attr_dev(linearGradient105, "x1", "532.584");
    			attr_dev(linearGradient105, "y1", "355.728");
    			attr_dev(linearGradient105, "x2", "614.062");
    			attr_dev(linearGradient105, "y2", "572.328");
    			attr_dev(linearGradient105, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient105, file$c, 570, 0, 58994);
    			attr_dev(stop212, "stop-color", "#FFCD59");
    			add_location(stop212, file$c, 575, 0, 59354);
    			attr_dev(stop213, "offset", "0.895833");
    			attr_dev(stop213, "stop-color", "#F2AC49");
    			add_location(stop213, file$c, 576, 0, 59384);
    			attr_dev(linearGradient106, "id", "paint106_linear_637_19820");
    			attr_dev(linearGradient106, "x1", "542.222");
    			attr_dev(linearGradient106, "y1", "312.357");
    			attr_dev(linearGradient106, "x2", "546.59");
    			attr_dev(linearGradient106, "y2", "337.323");
    			attr_dev(linearGradient106, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient106, file$c, 574, 0, 59223);
    			attr_dev(stop214, "stop-color", "#57661F");
    			add_location(stop214, file$c, 579, 0, 59582);
    			attr_dev(stop215, "offset", "0.791667");
    			attr_dev(stop215, "stop-color", "#9CB23E");
    			add_location(stop215, file$c, 580, 0, 59612);
    			attr_dev(linearGradient107, "id", "paint107_linear_637_19820");
    			attr_dev(linearGradient107, "x1", "844.182");
    			attr_dev(linearGradient107, "y1", "386.43");
    			attr_dev(linearGradient107, "x2", "903.647");
    			attr_dev(linearGradient107, "y2", "568.652");
    			attr_dev(linearGradient107, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient107, file$c, 578, 0, 59451);
    			attr_dev(stop216, "offset", "0.541667");
    			attr_dev(stop216, "stop-color", "#E85151");
    			add_location(stop216, file$c, 583, 0, 59811);
    			attr_dev(stop217, "offset", "0.994792");
    			attr_dev(stop217, "stop-color", "#B83535");
    			add_location(stop217, file$c, 584, 0, 59859);
    			attr_dev(linearGradient108, "id", "paint108_linear_637_19820");
    			attr_dev(linearGradient108, "x1", "798.248");
    			attr_dev(linearGradient108, "y1", "249.251");
    			attr_dev(linearGradient108, "x2", "846.117");
    			attr_dev(linearGradient108, "y2", "341.305");
    			attr_dev(linearGradient108, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient108, file$c, 582, 0, 59679);
    			attr_dev(stop218, "offset", "0.541667");
    			attr_dev(stop218, "stop-color", "#E85151");
    			add_location(stop218, file$c, 587, 0, 60058);
    			attr_dev(stop219, "offset", "0.994792");
    			attr_dev(stop219, "stop-color", "#B83535");
    			add_location(stop219, file$c, 588, 0, 60106);
    			attr_dev(linearGradient109, "id", "paint109_linear_637_19820");
    			attr_dev(linearGradient109, "x1", "904.805");
    			attr_dev(linearGradient109, "y1", "240.437");
    			attr_dev(linearGradient109, "x2", "861.519");
    			attr_dev(linearGradient109, "y2", "346.727");
    			attr_dev(linearGradient109, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient109, file$c, 586, 0, 59926);
    			attr_dev(stop220, "stop-color", "#57661F");
    			add_location(stop220, file$c, 591, 0, 60305);
    			attr_dev(stop221, "offset", "0.791667");
    			attr_dev(stop221, "stop-color", "#9CB23E");
    			add_location(stop221, file$c, 592, 0, 60335);
    			attr_dev(linearGradient110, "id", "paint110_linear_637_19820");
    			attr_dev(linearGradient110, "x1", "980.899");
    			attr_dev(linearGradient110, "y1", "428.472");
    			attr_dev(linearGradient110, "x2", "1052.47");
    			attr_dev(linearGradient110, "y2", "793.328");
    			attr_dev(linearGradient110, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient110, file$c, 590, 0, 60173);
    			attr_dev(stop222, "stop-color", "#57661F");
    			add_location(stop222, file$c, 595, 0, 60534);
    			attr_dev(stop223, "offset", "0.791667");
    			attr_dev(stop223, "stop-color", "#9CB23E");
    			add_location(stop223, file$c, 596, 0, 60564);
    			attr_dev(linearGradient111, "id", "paint111_linear_637_19820");
    			attr_dev(linearGradient111, "x1", "937.831");
    			attr_dev(linearGradient111, "y1", "466.763");
    			attr_dev(linearGradient111, "x2", "963.396");
    			attr_dev(linearGradient111, "y2", "683.624");
    			attr_dev(linearGradient111, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient111, file$c, 594, 0, 60402);
    			attr_dev(stop224, "stop-color", "#FFCD59");
    			add_location(stop224, file$c, 599, 0, 60763);
    			attr_dev(stop225, "offset", "0.895833");
    			attr_dev(stop225, "stop-color", "#F2AC49");
    			add_location(stop225, file$c, 600, 0, 60793);
    			attr_dev(linearGradient112, "id", "paint112_linear_637_19820");
    			attr_dev(linearGradient112, "x1", "926.866");
    			attr_dev(linearGradient112, "y1", "363.653");
    			attr_dev(linearGradient112, "x2", "943.519");
    			attr_dev(linearGradient112, "y2", "408.276");
    			attr_dev(linearGradient112, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient112, file$c, 598, 0, 60631);
    			attr_dev(stop226, "stop-color", "#FFCD59");
    			add_location(stop226, file$c, 603, 0, 60993);
    			attr_dev(stop227, "offset", "0.895833");
    			attr_dev(stop227, "stop-color", "#F2AC49");
    			add_location(stop227, file$c, 604, 0, 61023);
    			attr_dev(linearGradient113, "id", "paint113_linear_637_19820");
    			attr_dev(linearGradient113, "x1", "1303.39");
    			attr_dev(linearGradient113, "y1", "-1174.84");
    			attr_dev(linearGradient113, "x2", "692.03");
    			attr_dev(linearGradient113, "y2", "-811.298");
    			attr_dev(linearGradient113, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient113, file$c, 602, 0, 60860);
    			attr_dev(stop228, "offset", "0.541667");
    			attr_dev(stop228, "stop-color", "#E85151");
    			add_location(stop228, file$c, 607, 0, 61223);
    			attr_dev(stop229, "offset", "0.994792");
    			attr_dev(stop229, "stop-color", "#B83535");
    			add_location(stop229, file$c, 608, 0, 61271);
    			attr_dev(linearGradient114, "id", "paint114_linear_637_19820");
    			attr_dev(linearGradient114, "x1", "103.204");
    			attr_dev(linearGradient114, "y1", "153.568");
    			attr_dev(linearGradient114, "x2", "-71.3367");
    			attr_dev(linearGradient114, "y2", "346.942");
    			attr_dev(linearGradient114, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient114, file$c, 606, 0, 61090);
    			add_location(defs, file$c, 149, 0, 34787);
    			attr_dev(svg, "viewBox", "0 0 1280 900");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "top", "67vh");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "width", "100vw");
    			set_style(svg, "z-index", "1");
    			add_location(svg, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, mask);
    			append_dev(mask, rect);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    			append_dev(g, path4);
    			append_dev(g, path5);
    			append_dev(g, path6);
    			append_dev(g, path7);
    			append_dev(g, path8);
    			append_dev(g, path9);
    			append_dev(g, path10);
    			append_dev(g, path11);
    			append_dev(g, path12);
    			append_dev(g, path13);
    			append_dev(g, path14);
    			append_dev(g, path15);
    			append_dev(g, path16);
    			append_dev(g, path17);
    			append_dev(g, path18);
    			append_dev(g, path19);
    			append_dev(g, path20);
    			append_dev(g, path21);
    			append_dev(g, path22);
    			append_dev(g, path23);
    			append_dev(g, path24);
    			append_dev(g, path25);
    			append_dev(g, path26);
    			append_dev(g, path27);
    			append_dev(g, path28);
    			append_dev(g, path29);
    			append_dev(g, path30);
    			append_dev(g, path31);
    			append_dev(g, path32);
    			append_dev(g, path33);
    			append_dev(g, path34);
    			append_dev(g, path35);
    			append_dev(g, path36);
    			append_dev(g, path37);
    			append_dev(g, path38);
    			append_dev(g, path39);
    			append_dev(g, path40);
    			append_dev(g, path41);
    			append_dev(g, path42);
    			append_dev(g, path43);
    			append_dev(g, path44);
    			append_dev(g, path45);
    			append_dev(g, path46);
    			append_dev(g, path47);
    			append_dev(g, path48);
    			append_dev(g, path49);
    			append_dev(g, path50);
    			append_dev(g, path51);
    			append_dev(g, path52);
    			append_dev(g, path53);
    			append_dev(g, path54);
    			append_dev(g, path55);
    			append_dev(g, path56);
    			append_dev(g, path57);
    			append_dev(g, path58);
    			append_dev(g, path59);
    			append_dev(g, path60);
    			append_dev(g, path61);
    			append_dev(g, path62);
    			append_dev(g, path63);
    			append_dev(g, path64);
    			append_dev(g, path65);
    			append_dev(g, path66);
    			append_dev(g, path67);
    			append_dev(g, path68);
    			append_dev(g, path69);
    			append_dev(g, path70);
    			append_dev(g, path71);
    			append_dev(g, path72);
    			append_dev(g, path73);
    			append_dev(g, path74);
    			append_dev(g, path75);
    			append_dev(g, path76);
    			append_dev(g, path77);
    			append_dev(g, path78);
    			append_dev(g, path79);
    			append_dev(g, path80);
    			append_dev(g, path81);
    			append_dev(g, path82);
    			append_dev(g, path83);
    			append_dev(g, path84);
    			append_dev(g, path85);
    			append_dev(g, path86);
    			append_dev(g, path87);
    			append_dev(g, path88);
    			append_dev(g, path89);
    			append_dev(g, path90);
    			append_dev(g, path91);
    			append_dev(g, path92);
    			append_dev(g, path93);
    			append_dev(g, path94);
    			append_dev(g, path95);
    			append_dev(g, path96);
    			append_dev(g, path97);
    			append_dev(g, path98);
    			append_dev(g, path99);
    			append_dev(g, path100);
    			append_dev(g, path101);
    			append_dev(g, path102);
    			append_dev(g, path103);
    			append_dev(g, path104);
    			append_dev(g, path105);
    			append_dev(g, path106);
    			append_dev(g, path107);
    			append_dev(g, path108);
    			append_dev(g, path109);
    			append_dev(g, path110);
    			append_dev(g, path111);
    			append_dev(g, path112);
    			append_dev(g, path113);
    			append_dev(g, path114);
    			append_dev(g, path115);
    			append_dev(g, path116);
    			append_dev(g, path117);
    			append_dev(g, path118);
    			append_dev(g, path119);
    			append_dev(g, path120);
    			append_dev(g, path121);
    			append_dev(g, path122);
    			append_dev(g, path123);
    			append_dev(g, path124);
    			append_dev(g, path125);
    			append_dev(g, path126);
    			append_dev(g, path127);
    			append_dev(g, path128);
    			append_dev(g, path129);
    			append_dev(g, path130);
    			append_dev(g, path131);
    			append_dev(g, path132);
    			append_dev(g, path133);
    			append_dev(g, path134);
    			append_dev(g, path135);
    			append_dev(g, path136);
    			append_dev(g, path137);
    			append_dev(g, path138);
    			append_dev(g, path139);
    			append_dev(g, path140);
    			append_dev(g, path141);
    			append_dev(g, path142);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(linearGradient1, stop2);
    			append_dev(linearGradient1, stop3);
    			append_dev(defs, linearGradient2);
    			append_dev(linearGradient2, stop4);
    			append_dev(linearGradient2, stop5);
    			append_dev(defs, linearGradient3);
    			append_dev(linearGradient3, stop6);
    			append_dev(linearGradient3, stop7);
    			append_dev(defs, linearGradient4);
    			append_dev(linearGradient4, stop8);
    			append_dev(linearGradient4, stop9);
    			append_dev(defs, linearGradient5);
    			append_dev(linearGradient5, stop10);
    			append_dev(linearGradient5, stop11);
    			append_dev(defs, linearGradient6);
    			append_dev(linearGradient6, stop12);
    			append_dev(linearGradient6, stop13);
    			append_dev(defs, linearGradient7);
    			append_dev(linearGradient7, stop14);
    			append_dev(linearGradient7, stop15);
    			append_dev(defs, linearGradient8);
    			append_dev(linearGradient8, stop16);
    			append_dev(linearGradient8, stop17);
    			append_dev(defs, linearGradient9);
    			append_dev(linearGradient9, stop18);
    			append_dev(linearGradient9, stop19);
    			append_dev(defs, linearGradient10);
    			append_dev(linearGradient10, stop20);
    			append_dev(linearGradient10, stop21);
    			append_dev(defs, linearGradient11);
    			append_dev(linearGradient11, stop22);
    			append_dev(linearGradient11, stop23);
    			append_dev(defs, linearGradient12);
    			append_dev(linearGradient12, stop24);
    			append_dev(linearGradient12, stop25);
    			append_dev(defs, linearGradient13);
    			append_dev(linearGradient13, stop26);
    			append_dev(linearGradient13, stop27);
    			append_dev(defs, linearGradient14);
    			append_dev(linearGradient14, stop28);
    			append_dev(linearGradient14, stop29);
    			append_dev(defs, linearGradient15);
    			append_dev(linearGradient15, stop30);
    			append_dev(linearGradient15, stop31);
    			append_dev(defs, linearGradient16);
    			append_dev(linearGradient16, stop32);
    			append_dev(linearGradient16, stop33);
    			append_dev(defs, linearGradient17);
    			append_dev(linearGradient17, stop34);
    			append_dev(linearGradient17, stop35);
    			append_dev(defs, linearGradient18);
    			append_dev(linearGradient18, stop36);
    			append_dev(linearGradient18, stop37);
    			append_dev(defs, linearGradient19);
    			append_dev(linearGradient19, stop38);
    			append_dev(linearGradient19, stop39);
    			append_dev(defs, linearGradient20);
    			append_dev(linearGradient20, stop40);
    			append_dev(linearGradient20, stop41);
    			append_dev(defs, linearGradient21);
    			append_dev(linearGradient21, stop42);
    			append_dev(linearGradient21, stop43);
    			append_dev(defs, linearGradient22);
    			append_dev(linearGradient22, stop44);
    			append_dev(linearGradient22, stop45);
    			append_dev(defs, linearGradient23);
    			append_dev(linearGradient23, stop46);
    			append_dev(linearGradient23, stop47);
    			append_dev(defs, linearGradient24);
    			append_dev(linearGradient24, stop48);
    			append_dev(linearGradient24, stop49);
    			append_dev(defs, linearGradient25);
    			append_dev(linearGradient25, stop50);
    			append_dev(linearGradient25, stop51);
    			append_dev(defs, linearGradient26);
    			append_dev(linearGradient26, stop52);
    			append_dev(linearGradient26, stop53);
    			append_dev(defs, linearGradient27);
    			append_dev(linearGradient27, stop54);
    			append_dev(linearGradient27, stop55);
    			append_dev(defs, linearGradient28);
    			append_dev(linearGradient28, stop56);
    			append_dev(linearGradient28, stop57);
    			append_dev(defs, linearGradient29);
    			append_dev(linearGradient29, stop58);
    			append_dev(linearGradient29, stop59);
    			append_dev(defs, linearGradient30);
    			append_dev(linearGradient30, stop60);
    			append_dev(linearGradient30, stop61);
    			append_dev(defs, linearGradient31);
    			append_dev(linearGradient31, stop62);
    			append_dev(linearGradient31, stop63);
    			append_dev(defs, linearGradient32);
    			append_dev(linearGradient32, stop64);
    			append_dev(linearGradient32, stop65);
    			append_dev(defs, linearGradient33);
    			append_dev(linearGradient33, stop66);
    			append_dev(linearGradient33, stop67);
    			append_dev(defs, linearGradient34);
    			append_dev(linearGradient34, stop68);
    			append_dev(linearGradient34, stop69);
    			append_dev(defs, linearGradient35);
    			append_dev(linearGradient35, stop70);
    			append_dev(linearGradient35, stop71);
    			append_dev(defs, linearGradient36);
    			append_dev(linearGradient36, stop72);
    			append_dev(linearGradient36, stop73);
    			append_dev(defs, linearGradient37);
    			append_dev(linearGradient37, stop74);
    			append_dev(linearGradient37, stop75);
    			append_dev(defs, linearGradient38);
    			append_dev(linearGradient38, stop76);
    			append_dev(linearGradient38, stop77);
    			append_dev(defs, linearGradient39);
    			append_dev(linearGradient39, stop78);
    			append_dev(linearGradient39, stop79);
    			append_dev(defs, linearGradient40);
    			append_dev(linearGradient40, stop80);
    			append_dev(linearGradient40, stop81);
    			append_dev(defs, linearGradient41);
    			append_dev(linearGradient41, stop82);
    			append_dev(linearGradient41, stop83);
    			append_dev(defs, linearGradient42);
    			append_dev(linearGradient42, stop84);
    			append_dev(linearGradient42, stop85);
    			append_dev(defs, linearGradient43);
    			append_dev(linearGradient43, stop86);
    			append_dev(linearGradient43, stop87);
    			append_dev(defs, linearGradient44);
    			append_dev(linearGradient44, stop88);
    			append_dev(linearGradient44, stop89);
    			append_dev(defs, linearGradient45);
    			append_dev(linearGradient45, stop90);
    			append_dev(linearGradient45, stop91);
    			append_dev(defs, linearGradient46);
    			append_dev(linearGradient46, stop92);
    			append_dev(linearGradient46, stop93);
    			append_dev(defs, linearGradient47);
    			append_dev(linearGradient47, stop94);
    			append_dev(linearGradient47, stop95);
    			append_dev(defs, linearGradient48);
    			append_dev(linearGradient48, stop96);
    			append_dev(linearGradient48, stop97);
    			append_dev(defs, linearGradient49);
    			append_dev(linearGradient49, stop98);
    			append_dev(linearGradient49, stop99);
    			append_dev(defs, linearGradient50);
    			append_dev(linearGradient50, stop100);
    			append_dev(linearGradient50, stop101);
    			append_dev(defs, linearGradient51);
    			append_dev(linearGradient51, stop102);
    			append_dev(linearGradient51, stop103);
    			append_dev(defs, linearGradient52);
    			append_dev(linearGradient52, stop104);
    			append_dev(linearGradient52, stop105);
    			append_dev(defs, linearGradient53);
    			append_dev(linearGradient53, stop106);
    			append_dev(linearGradient53, stop107);
    			append_dev(defs, linearGradient54);
    			append_dev(linearGradient54, stop108);
    			append_dev(linearGradient54, stop109);
    			append_dev(defs, linearGradient55);
    			append_dev(linearGradient55, stop110);
    			append_dev(linearGradient55, stop111);
    			append_dev(defs, linearGradient56);
    			append_dev(linearGradient56, stop112);
    			append_dev(linearGradient56, stop113);
    			append_dev(defs, linearGradient57);
    			append_dev(linearGradient57, stop114);
    			append_dev(linearGradient57, stop115);
    			append_dev(defs, linearGradient58);
    			append_dev(linearGradient58, stop116);
    			append_dev(linearGradient58, stop117);
    			append_dev(defs, linearGradient59);
    			append_dev(linearGradient59, stop118);
    			append_dev(linearGradient59, stop119);
    			append_dev(defs, linearGradient60);
    			append_dev(linearGradient60, stop120);
    			append_dev(linearGradient60, stop121);
    			append_dev(defs, linearGradient61);
    			append_dev(linearGradient61, stop122);
    			append_dev(linearGradient61, stop123);
    			append_dev(defs, linearGradient62);
    			append_dev(linearGradient62, stop124);
    			append_dev(linearGradient62, stop125);
    			append_dev(defs, linearGradient63);
    			append_dev(linearGradient63, stop126);
    			append_dev(linearGradient63, stop127);
    			append_dev(defs, linearGradient64);
    			append_dev(linearGradient64, stop128);
    			append_dev(linearGradient64, stop129);
    			append_dev(defs, linearGradient65);
    			append_dev(linearGradient65, stop130);
    			append_dev(linearGradient65, stop131);
    			append_dev(defs, linearGradient66);
    			append_dev(linearGradient66, stop132);
    			append_dev(linearGradient66, stop133);
    			append_dev(defs, linearGradient67);
    			append_dev(linearGradient67, stop134);
    			append_dev(linearGradient67, stop135);
    			append_dev(defs, linearGradient68);
    			append_dev(linearGradient68, stop136);
    			append_dev(linearGradient68, stop137);
    			append_dev(defs, linearGradient69);
    			append_dev(linearGradient69, stop138);
    			append_dev(linearGradient69, stop139);
    			append_dev(defs, linearGradient70);
    			append_dev(linearGradient70, stop140);
    			append_dev(linearGradient70, stop141);
    			append_dev(defs, linearGradient71);
    			append_dev(linearGradient71, stop142);
    			append_dev(linearGradient71, stop143);
    			append_dev(defs, linearGradient72);
    			append_dev(linearGradient72, stop144);
    			append_dev(linearGradient72, stop145);
    			append_dev(defs, linearGradient73);
    			append_dev(linearGradient73, stop146);
    			append_dev(linearGradient73, stop147);
    			append_dev(defs, linearGradient74);
    			append_dev(linearGradient74, stop148);
    			append_dev(linearGradient74, stop149);
    			append_dev(defs, linearGradient75);
    			append_dev(linearGradient75, stop150);
    			append_dev(linearGradient75, stop151);
    			append_dev(defs, linearGradient76);
    			append_dev(linearGradient76, stop152);
    			append_dev(linearGradient76, stop153);
    			append_dev(defs, linearGradient77);
    			append_dev(linearGradient77, stop154);
    			append_dev(linearGradient77, stop155);
    			append_dev(defs, linearGradient78);
    			append_dev(linearGradient78, stop156);
    			append_dev(linearGradient78, stop157);
    			append_dev(defs, linearGradient79);
    			append_dev(linearGradient79, stop158);
    			append_dev(linearGradient79, stop159);
    			append_dev(defs, linearGradient80);
    			append_dev(linearGradient80, stop160);
    			append_dev(linearGradient80, stop161);
    			append_dev(defs, linearGradient81);
    			append_dev(linearGradient81, stop162);
    			append_dev(linearGradient81, stop163);
    			append_dev(defs, linearGradient82);
    			append_dev(linearGradient82, stop164);
    			append_dev(linearGradient82, stop165);
    			append_dev(defs, linearGradient83);
    			append_dev(linearGradient83, stop166);
    			append_dev(linearGradient83, stop167);
    			append_dev(defs, linearGradient84);
    			append_dev(linearGradient84, stop168);
    			append_dev(linearGradient84, stop169);
    			append_dev(defs, linearGradient85);
    			append_dev(linearGradient85, stop170);
    			append_dev(linearGradient85, stop171);
    			append_dev(defs, linearGradient86);
    			append_dev(linearGradient86, stop172);
    			append_dev(linearGradient86, stop173);
    			append_dev(defs, linearGradient87);
    			append_dev(linearGradient87, stop174);
    			append_dev(linearGradient87, stop175);
    			append_dev(defs, linearGradient88);
    			append_dev(linearGradient88, stop176);
    			append_dev(linearGradient88, stop177);
    			append_dev(defs, linearGradient89);
    			append_dev(linearGradient89, stop178);
    			append_dev(linearGradient89, stop179);
    			append_dev(defs, linearGradient90);
    			append_dev(linearGradient90, stop180);
    			append_dev(linearGradient90, stop181);
    			append_dev(defs, linearGradient91);
    			append_dev(linearGradient91, stop182);
    			append_dev(linearGradient91, stop183);
    			append_dev(defs, linearGradient92);
    			append_dev(linearGradient92, stop184);
    			append_dev(linearGradient92, stop185);
    			append_dev(defs, linearGradient93);
    			append_dev(linearGradient93, stop186);
    			append_dev(linearGradient93, stop187);
    			append_dev(defs, linearGradient94);
    			append_dev(linearGradient94, stop188);
    			append_dev(linearGradient94, stop189);
    			append_dev(defs, linearGradient95);
    			append_dev(linearGradient95, stop190);
    			append_dev(linearGradient95, stop191);
    			append_dev(defs, linearGradient96);
    			append_dev(linearGradient96, stop192);
    			append_dev(linearGradient96, stop193);
    			append_dev(defs, linearGradient97);
    			append_dev(linearGradient97, stop194);
    			append_dev(linearGradient97, stop195);
    			append_dev(defs, linearGradient98);
    			append_dev(linearGradient98, stop196);
    			append_dev(linearGradient98, stop197);
    			append_dev(defs, linearGradient99);
    			append_dev(linearGradient99, stop198);
    			append_dev(linearGradient99, stop199);
    			append_dev(defs, linearGradient100);
    			append_dev(linearGradient100, stop200);
    			append_dev(linearGradient100, stop201);
    			append_dev(defs, linearGradient101);
    			append_dev(linearGradient101, stop202);
    			append_dev(linearGradient101, stop203);
    			append_dev(defs, linearGradient102);
    			append_dev(linearGradient102, stop204);
    			append_dev(linearGradient102, stop205);
    			append_dev(defs, linearGradient103);
    			append_dev(linearGradient103, stop206);
    			append_dev(linearGradient103, stop207);
    			append_dev(defs, linearGradient104);
    			append_dev(linearGradient104, stop208);
    			append_dev(linearGradient104, stop209);
    			append_dev(defs, linearGradient105);
    			append_dev(linearGradient105, stop210);
    			append_dev(linearGradient105, stop211);
    			append_dev(defs, linearGradient106);
    			append_dev(linearGradient106, stop212);
    			append_dev(linearGradient106, stop213);
    			append_dev(defs, linearGradient107);
    			append_dev(linearGradient107, stop214);
    			append_dev(linearGradient107, stop215);
    			append_dev(defs, linearGradient108);
    			append_dev(linearGradient108, stop216);
    			append_dev(linearGradient108, stop217);
    			append_dev(defs, linearGradient109);
    			append_dev(linearGradient109, stop218);
    			append_dev(linearGradient109, stop219);
    			append_dev(defs, linearGradient110);
    			append_dev(linearGradient110, stop220);
    			append_dev(linearGradient110, stop221);
    			append_dev(defs, linearGradient111);
    			append_dev(linearGradient111, stop222);
    			append_dev(linearGradient111, stop223);
    			append_dev(defs, linearGradient112);
    			append_dev(linearGradient112, stop224);
    			append_dev(linearGradient112, stop225);
    			append_dev(defs, linearGradient113);
    			append_dev(linearGradient113, stop226);
    			append_dev(linearGradient113, stop227);
    			append_dev(defs, linearGradient114);
    			append_dev(linearGradient114, stop228);
    			append_dev(linearGradient114, stop229);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlowersMobile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FlowersMobile> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class FlowersMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlowersMobile",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\LandingBgMobile.svelte generated by Svelte v3.46.3 */
    const file$b = "src\\components\\LandingBgMobile.svelte";

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let sun;
    	let t0;
    	let clouds;
    	let t1;
    	let ground;
    	let t2;
    	let ducks;
    	let t3;
    	let flowers;
    	let current;
    	sun = new SunMobile({ $$inline: true });
    	clouds = new Clouds({ $$inline: true });
    	ground = new GroundMobile({ $$inline: true });
    	ducks = new DucksMobile({ $$inline: true });
    	flowers = new FlowersMobile({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(sun.$$.fragment);
    			t0 = space();
    			create_component(clouds.$$.fragment);
    			t1 = space();
    			create_component(ground.$$.fragment);
    			t2 = space();
    			create_component(ducks.$$.fragment);
    			t3 = space();
    			create_component(flowers.$$.fragment);
    			attr_dev(div0, "class", "sky svelte-1l6lmv");
    			add_location(div0, file$b, 10, 2, 335);
    			attr_dev(div1, "class", "full-width svelte-1l6lmv");
    			add_location(div1, file$b, 9, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(sun, div0, null);
    			append_dev(div0, t0);
    			mount_component(clouds, div0, null);
    			append_dev(div1, t1);
    			mount_component(ground, div1, null);
    			append_dev(div1, t2);
    			mount_component(ducks, div1, null);
    			append_dev(div1, t3);
    			mount_component(flowers, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sun.$$.fragment, local);
    			transition_in(clouds.$$.fragment, local);
    			transition_in(ground.$$.fragment, local);
    			transition_in(ducks.$$.fragment, local);
    			transition_in(flowers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sun.$$.fragment, local);
    			transition_out(clouds.$$.fragment, local);
    			transition_out(ground.$$.fragment, local);
    			transition_out(ducks.$$.fragment, local);
    			transition_out(flowers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(sun);
    			destroy_component(clouds);
    			destroy_component(ground);
    			destroy_component(ducks);
    			destroy_component(flowers);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LandingBgMobile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LandingBgMobile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Sun: SunMobile, Clouds, Ground: GroundMobile, Ducks: DucksMobile, Flowers: FlowersMobile });
    	return [];
    }

    class LandingBgMobile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LandingBgMobile",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Landing.svelte generated by Svelte v3.46.3 */
    const file$a = "src\\components\\Landing.svelte";

    // (28:2) {:else}
    function create_else_block(ctx) {
    	let landingbg;
    	let t0;
    	let nav;
    	let t1;
    	let div;
    	let h40;
    	let t3;
    	let h1;
    	let t5;
    	let h41;
    	let current;
    	landingbg = new LandingBg({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(landingbg.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "APRIL 12 - 14, 2024";
    			t3 = space();
    			h1 = element("h1");
    			h1.textContent = "HackKU24";
    			t5 = space();
    			h41 = element("h4");
    			h41.textContent = "The University of Kansas";
    			add_location(h40, file$a, 31, 8, 859);
    			add_location(h1, file$a, 32, 8, 897);
    			add_location(h41, file$a, 33, 8, 925);
    			attr_dev(div, "class", "landing-text-container svelte-vcv1fz");
    			attr_dev(div, "id", "landing-text");
    			add_location(div, file$a, 30, 6, 795);
    		},
    		m: function mount(target, anchor) {
    			mount_component(landingbg, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t3);
    			append_dev(div, h1);
    			append_dev(div, t5);
    			append_dev(div, h41);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(landingbg.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(landingbg.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(landingbg, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(28:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if smallScreen}
    function create_if_block$1(ctx) {
    	let landingbgmobile;
    	let t0;
    	let navmobile;
    	let t1;
    	let div1;
    	let h40;
    	let t3;
    	let div0;
    	let h10;
    	let t5;
    	let h11;
    	let t7;
    	let h41;
    	let current;
    	landingbgmobile = new LandingBgMobile({ $$inline: true });
    	navmobile = new NavMobile({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(landingbgmobile.$$.fragment);
    			t0 = space();
    			create_component(navmobile.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "APRIL 12 - 14, 2024";
    			t3 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Hack";
    			t5 = space();
    			h11 = element("h1");
    			h11.textContent = "KU24";
    			t7 = space();
    			h41 = element("h4");
    			h41.textContent = "The University of Kansas";
    			add_location(h40, file$a, 20, 8, 551);
    			add_location(h10, file$a, 22, 10, 628);
    			add_location(h11, file$a, 23, 10, 654);
    			attr_dev(div0, "class", "divided-title svelte-vcv1fz");
    			add_location(div0, file$a, 21, 8, 589);
    			add_location(h41, file$a, 25, 8, 693);
    			attr_dev(div1, "class", "landing-text-mobile-container svelte-vcv1fz");
    			attr_dev(div1, "id", "landing-text");
    			add_location(div1, file$a, 19, 6, 480);
    		},
    		m: function mount(target, anchor) {
    			mount_component(landingbgmobile, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(navmobile, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h40);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t5);
    			append_dev(div0, h11);
    			append_dev(div1, t7);
    			append_dev(div1, h41);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(landingbgmobile.$$.fragment, local);
    			transition_in(navmobile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(landingbgmobile.$$.fragment, local);
    			transition_out(navmobile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(landingbgmobile, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(navmobile, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:4) {#if smallScreen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[2]);
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*smallScreen*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "landing svelte-vcv1fz");
    			attr_dev(div0, "id", "landing");
    			add_location(div0, file$a, 15, 2, 367);
    			add_location(div1, file$a, 14, 0, 358);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let smallScreen;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Landing', slots, []);
    	let threshold = 840;
    	let innerWidth;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Landing> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, innerWidth = window.innerWidth);
    	}

    	$$self.$capture_state = () => ({
    		Nav,
    		NavMobile,
    		LandingBg,
    		LandingBgMobile,
    		threshold,
    		innerWidth,
    		smallScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('threshold' in $$props) $$invalidate(3, threshold = $$props.threshold);
    		if ('innerWidth' in $$props) $$invalidate(0, innerWidth = $$props.innerWidth);
    		if ('smallScreen' in $$props) $$invalidate(1, smallScreen = $$props.smallScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*innerWidth*/ 1) {
    			$$invalidate(1, smallScreen = innerWidth < threshold);
    		}
    	};

    	return [innerWidth, smallScreen, onwindowresize];
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\assets\heart-red-shad.svelte generated by Svelte v3.46.3 */

    const file$9 = "src\\components\\assets\\heart-red-shad.svelte";

    function create_fragment$9(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M1.14311 3.61656C-4.69948 11.6501 13.5139 31.5839 18.354 31.5838C23.194 31.5838 38.7911 11.684 35.5643 3.61656C32.2884 -4.57375 21.2224 4.87141 18.354 10.6083C14.5889 4.69217 5.44583 -2.29963 1.14311 3.61656Z");
    			attr_dev(path, "fill", "#B83535");
    			add_location(path, file$9, 1, 0, 97);
    			attr_dev(svg, "width", "36");
    			attr_dev(svg, "height", "32");
    			attr_dev(svg, "viewBox", "0 0 36 32");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heart_red_shad', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Heart_red_shad> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Heart_red_shad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heart_red_shad",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.46.3 */
    const file$8 = "src\\components\\About.svelte";

    function create_fragment$8(ctx) {
    	let div10;
    	let div9;
    	let div8;
    	let h2;
    	let t1;
    	let div0;
    	let p;
    	let t3;
    	let div7;
    	let h3;
    	let t5;
    	let div6;
    	let div1;
    	let heart0;
    	let t6;
    	let div4;
    	let div2;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div3;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t10;
    	let div5;
    	let heart1;
    	let t11;
    	let svg;
    	let path;
    	let current;
    	heart0 = new Heart_red_shad({ $$inline: true });
    	heart1 = new Heart_red_shad({ $$inline: true });

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h2 = element("h2");
    			h2.textContent = "What is HackKU?";
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "HackKU is the annual 36-hour hackathon hosted at the University of Kansas, \r\n          where students have the opportunity to innovate new ideas, discover different paths, \r\n          and push the boundaries of technology. Work with teams of up to four people to \r\n          create unique solutions to real-world problems. No experience necessary!";
    			t3 = space();
    			div7 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Check out previous HackKU events";
    			t5 = space();
    			div6 = element("div");
    			div1 = element("div");
    			create_component(heart0.$$.fragment);
    			t6 = space();
    			div4 = element("div");
    			div2 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t7 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t8 = space();
    			div3 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t9 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t10 = space();
    			div5 = element("div");
    			create_component(heart1.$$.fragment);
    			t11 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(h2, "z-index", "2");
    			add_location(h2, file$8, 8, 6, 226);
    			attr_dev(p, "class", "description-text svelte-lx7llz");
    			add_location(p, file$8, 10, 8, 321);
    			attr_dev(div0, "class", "description-container svelte-lx7llz");
    			add_location(div0, file$8, 9, 6, 276);
    			add_location(h3, file$8, 18, 8, 783);
    			attr_dev(div1, "class", "heart svelte-lx7llz");
    			add_location(div1, file$8, 20, 10, 882);
    			if (!src_url_equal(img0.src, img0_src_value = "images/20.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "previous-button shrink svelte-lx7llz");
    			attr_dev(img0, "alt", "HackKU20");
    			add_location(img0, file$8, 25, 73, 1103);
    			attr_dev(a0, "href", "https://hackku-2020.devpost.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 25, 14, 1044);
    			if (!src_url_equal(img1.src, img1_src_value = "images/21.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "previous-button shrink svelte-lx7llz");
    			attr_dev(img1, "alt", "HackKU21");
    			add_location(img1, file$8, 26, 73, 1255);
    			attr_dev(a1, "href", "https://hackku-2021.devpost.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 26, 14, 1196);
    			attr_dev(div2, "class", "button-container svelte-lx7llz");
    			add_location(div2, file$8, 24, 12, 998);
    			if (!src_url_equal(img2.src, img2_src_value = "images/22.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "previous-button shrink svelte-lx7llz");
    			attr_dev(img2, "alt", "HackKU22");
    			add_location(img2, file$8, 29, 73, 1471);
    			attr_dev(a2, "href", "https://hackku-2022.devpost.com/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$8, 29, 14, 1412);
    			if (!src_url_equal(img3.src, img3_src_value = "images/23.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "previous-button shrink svelte-lx7llz");
    			attr_dev(img3, "alt", "HackKU23");
    			add_location(img3, file$8, 30, 73, 1623);
    			attr_dev(a3, "href", "https://hackku-2023.devpost.com/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$8, 30, 14, 1564);
    			attr_dev(div3, "class", "button-container svelte-lx7llz");
    			add_location(div3, file$8, 28, 12, 1366);
    			attr_dev(div4, "class", "button-container svelte-lx7llz");
    			add_location(div4, file$8, 23, 10, 954);
    			attr_dev(div5, "class", "heart svelte-lx7llz");
    			add_location(div5, file$8, 33, 10, 1750);
    			attr_dev(div6, "class", "button-heart-container svelte-lx7llz");
    			add_location(div6, file$8, 19, 8, 834);
    			attr_dev(div7, "class", "about-container svelte-lx7llz");
    			add_location(div7, file$8, 17, 6, 744);
    			attr_dev(div8, "class", "about-container svelte-lx7llz");
    			add_location(div8, file$8, 7, 4, 189);
    			attr_dev(path, "fill", "var(--blue-lt)");
    			attr_dev(path, "fill-opacity", "1");
    			attr_dev(path, "d", "M0,224L80,218.7C160,213,320,203,480,170.7C640,139,800,85,960,90.7C1120,96,1280,160,1360,192L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z");
    			add_location(path, file$8, 39, 87, 1941);
    			attr_dev(svg, "class", "wave-bottom svelte-lx7llz");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1440 320");
    			add_location(svg, file$8, 39, 4, 1858);
    			attr_dev(div9, "class", "section");
    			set_style(div9, "background-color", "var(--green)");
    			attr_dev(div9, "id", "about");
    			add_location(div9, file$8, 6, 2, 113);
    			add_location(div10, file$8, 5, 0, 104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h2);
    			append_dev(div8, t1);
    			append_dev(div8, div0);
    			append_dev(div0, p);
    			append_dev(div8, t3);
    			append_dev(div8, div7);
    			append_dev(div7, h3);
    			append_dev(div7, t5);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			mount_component(heart0, div1, null);
    			append_dev(div6, t6);
    			append_dev(div6, div4);
    			append_dev(div4, div2);
    			append_dev(div2, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t7);
    			append_dev(div2, a1);
    			append_dev(a1, img1);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, a2);
    			append_dev(a2, img2);
    			append_dev(div3, t9);
    			append_dev(div3, a3);
    			append_dev(a3, img3);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			mount_component(heart1, div5, null);
    			append_dev(div9, t11);
    			append_dev(div9, svg);
    			append_dev(svg, path);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(heart0.$$.fragment, local);
    			transition_in(heart1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(heart0.$$.fragment, local);
    			transition_out(heart1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(heart0);
    			destroy_component(heart1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Heart: Heart_red_shad });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Faq.svelte generated by Svelte v3.46.3 */
    const file$7 = "src\\components\\Faq.svelte";

    function create_fragment$7(ctx) {
    	let div24;
    	let div23;
    	let h2;
    	let t1;
    	let div5;
    	let h30;
    	let t3;
    	let button0;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let t5;
    	let div0;
    	let p0;
    	let t7;
    	let button1;
    	let span1;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let t9;
    	let div1;
    	let p1;
    	let t11;
    	let button2;
    	let span2;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let t13;
    	let div2;
    	let p2;
    	let t15;
    	let button3;
    	let span3;
    	let img3;
    	let img3_src_value;
    	let t16;
    	let t17;
    	let div3;
    	let p3;
    	let t18;
    	let a0;
    	let t20;
    	let t21;
    	let button4;
    	let span4;
    	let img4;
    	let img4_src_value;
    	let t22;
    	let t23;
    	let div4;
    	let p4;
    	let t24;
    	let a1;
    	let t26;
    	let a2;
    	let t28;
    	let t29;
    	let div13;
    	let h31;
    	let t31;
    	let button5;
    	let span5;
    	let img5;
    	let img5_src_value;
    	let t32;
    	let t33;
    	let div6;
    	let p5;
    	let t35;
    	let button6;
    	let span6;
    	let img6;
    	let img6_src_value;
    	let t36;
    	let t37;
    	let div7;
    	let p6;
    	let t39;
    	let button7;
    	let span7;
    	let img7;
    	let img7_src_value;
    	let t40;
    	let t41;
    	let div8;
    	let p7;
    	let t43;
    	let button8;
    	let span8;
    	let img8;
    	let img8_src_value;
    	let t44;
    	let t45;
    	let div9;
    	let p8;
    	let t47;
    	let button9;
    	let span9;
    	let img9;
    	let img9_src_value;
    	let t48;
    	let t49;
    	let div10;
    	let p9;
    	let t50;
    	let a3;
    	let t52;
    	let t53;
    	let button10;
    	let span10;
    	let img10;
    	let img10_src_value;
    	let t54;
    	let t55;
    	let div11;
    	let p10;
    	let b0;
    	let t57;
    	let br0;
    	let b1;
    	let t59;
    	let br1;
    	let b2;
    	let t61;
    	let br2;
    	let b3;
    	let t63;
    	let t64;
    	let button11;
    	let span11;
    	let img11;
    	let img11_src_value;
    	let t65;
    	let t66;
    	let div12;
    	let p11;
    	let t68;
    	let div17;
    	let h32;
    	let t70;
    	let button12;
    	let span12;
    	let img12;
    	let img12_src_value;
    	let t71;
    	let t72;
    	let div14;
    	let p12;
    	let t74;
    	let button13;
    	let span13;
    	let img13;
    	let img13_src_value;
    	let t75;
    	let t76;
    	let div15;
    	let p13;
    	let t78;
    	let button14;
    	let span14;
    	let img14;
    	let img14_src_value;
    	let t79;
    	let t80;
    	let div16;
    	let p14;
    	let t82;
    	let div22;
    	let h33;
    	let t84;
    	let button15;
    	let span15;
    	let img15;
    	let img15_src_value;
    	let t85;
    	let t86;
    	let div18;
    	let p15;
    	let t88;
    	let button16;
    	let span16;
    	let img16;
    	let img16_src_value;
    	let t89;
    	let t90;
    	let div19;
    	let p16;
    	let t92;
    	let button17;
    	let span17;
    	let img17;
    	let img17_src_value;
    	let t93;
    	let t94;
    	let div20;
    	let p17;
    	let t95;
    	let a4;
    	let t97;
    	let t98;
    	let button18;
    	let span18;
    	let img18;
    	let img18_src_value;
    	let t99;
    	let t100;
    	let div21;
    	let p18;
    	let t102;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div24 = element("div");
    			div23 = element("div");
    			h2 = element("h2");
    			h2.textContent = "FAQ";
    			t1 = space();
    			div5 = element("div");
    			h30 = element("h3");
    			h30.textContent = "General";
    			t3 = space();
    			button0 = element("button");
    			span0 = element("span");
    			img0 = element("img");
    			t4 = text("\r\n        What is HackKU?");
    			t5 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "HackKU is the annual 36-hour hackathon hosted by students at the University of Kansas School of Engineering.";
    			t7 = space();
    			button1 = element("button");
    			span1 = element("span");
    			img1 = element("img");
    			t8 = text("\r\n        What is a hackathon?");
    			t9 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "A hackathon is a weekend-long competition where students work individually or on teams to develop their programming skills through working on a software/hardware project, attending workshops, and collaborating with peers and mentors. Participants interact with industry sponsors, compete for prizes, and get lots of free food and swag!";
    			t11 = space();
    			button2 = element("button");
    			span2 = element("span");
    			img2 = element("img");
    			t12 = text("\r\n        What if I’ve never hacked before?");
    			t13 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "No experience is necessary to attend! There will be workshops and prizes geared specifically towards beginner hackers, and lots of mentors to provide support throughout the event.";
    			t15 = space();
    			button3 = element("button");
    			span3 = element("span");
    			img3 = element("img");
    			t16 = text("\r\n        As an MLH-affiliated event, all participants will be expected to follow the MLH Code of Conduct. What does this mean?");
    			t17 = space();
    			div3 = element("div");
    			p3 = element("p");
    			t18 = text("Read the MLH Code of Conduct ");
    			a0 = element("a");
    			a0.textContent = "here";
    			t20 = text("!");
    			t21 = space();
    			button4 = element("button");
    			span4 = element("span");
    			img4 = element("img");
    			t22 = text("\r\n        I still have questions!");
    			t23 = space();
    			div4 = element("div");
    			p4 = element("p");
    			t24 = text("Check out the ");
    			a1 = element("a");
    			a1.textContent = "HackerDoc";
    			t26 = text(" or contact us at ");
    			a2 = element("a");
    			a2.textContent = "hack@ku.edu";
    			t28 = text(" any questions or concerns :)");
    			t29 = space();
    			div13 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Logistics";
    			t31 = space();
    			button5 = element("button");
    			span5 = element("span");
    			img5 = element("img");
    			t32 = text("\r\n        When and where is HackKU?");
    			t33 = space();
    			div6 = element("div");
    			p5 = element("p");
    			p5.textContent = "HackKU24 will take place from the evening of April 12 until early afternoon on April 14 at the University of Kansas School of Engineering.";
    			t35 = space();
    			button6 = element("button");
    			span6 = element("span");
    			img6 = element("img");
    			t36 = text("\r\n        What will I eat?");
    			t37 = space();
    			div7 = element("div");
    			p6 = element("p");
    			p6.textContent = "All meals, snacks, and drinks from Friday dinner through Sunday breakfast will be provided for free.";
    			t39 = space();
    			button7 = element("button");
    			span7 = element("span");
    			img7 = element("img");
    			t40 = text("\r\n        Where will I sleep?");
    			t41 = space();
    			div8 = element("div");
    			p7 = element("p");
    			p7.textContent = "Hackers are free to come and go during the 36-hour hacking period. The University of Kansas' School of Engineering is open 24/7, though we encourage local hackers to head home to freshen up and get some rest.";
    			t43 = space();
    			button8 = element("button");
    			span8 = element("span");
    			img8 = element("img");
    			t44 = text("\r\n        What is the cost?");
    			t45 = space();
    			div9 = element("div");
    			p8 = element("p");
    			p8.textContent = "Nothing! Participation is completely free.";
    			t47 = space();
    			button9 = element("button");
    			span9 = element("span");
    			img9 = element("img");
    			t48 = text("\r\n        Will there be any travel reimbursement?");
    			t49 = space();
    			div10 = element("div");
    			p9 = element("p");
    			t50 = text("We are offering travel reimbursements for HackKU24! Check out ");
    			a3 = element("a");
    			a3.textContent = "this link";
    			t52 = text(" learn more and apply now.");
    			t53 = space();
    			button10 = element("button");
    			span10 = element("span");
    			img10 = element("img");
    			t54 = text("\r\n        What should I bring?");
    			t55 = space();
    			div11 = element("div");
    			p10 = element("p");
    			b0 = element("b");
    			b0.textContent = "Hardware:";
    			t57 = text(" Bring your hacking device and any accessories (like chargers!) required");
    			br0 = element("br");
    			b1 = element("b");
    			b1.textContent = "Sleeping:";
    			t59 = text(" Feel free to bring a sleeping bag, pillow, and/or blankets");
    			br1 = element("br");
    			b2 = element("b");
    			b2.textContent = "Personal Hygiene:";
    			t61 = text(" Please bring personal hygiene products, and a bath towel if you choose to use the provided showers");
    			br2 = element("br");
    			b3 = element("b");
    			b3.textContent = "Reusable Water Bottle:";
    			t63 = text(" Please bring your own reusable water bottle to reduce waste!");
    			t64 = space();
    			button11 = element("button");
    			span11 = element("span");
    			img11 = element("img");
    			t65 = text("\r\n        Free swag?");
    			t66 = space();
    			div12 = element("div");
    			p11 = element("p");
    			p11.textContent = "All swag will be distributed at HackKU24.";
    			t68 = space();
    			div17 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Registration";
    			t70 = space();
    			button12 = element("button");
    			span12 = element("span");
    			img12 = element("img");
    			t71 = text("\r\n        Who can participate in HackKU?");
    			t72 = space();
    			div14 = element("div");
    			p12 = element("p");
    			p12.textContent = "HackKU24 is open to all high school through college and university students. All high schoolers under the age of 18 must be accompanied by an adult chaperone.";
    			t74 = space();
    			button13 = element("button");
    			span13 = element("span");
    			img13 = element("img");
    			t75 = text("\r\n        When is registration open?");
    			t76 = space();
    			div15 = element("div");
    			p13 = element("p");
    			p13.textContent = "Registration will open in January 2024 and close on March 29th.";
    			t78 = space();
    			button14 = element("button");
    			span14 = element("span");
    			img14 = element("img");
    			t79 = text("\r\n        What if I don’t have a team yet?");
    			t80 = space();
    			div16 = element("div");
    			p14 = element("p");
    			p14.textContent = "You can participate individually or on a team of up to four. If you would like to work with a team, each team member must register individually. There will be a team formation event to find others to hack with. Additionally, there will be a teambuilding channel on Discord to find teammates before the event.";
    			t82 = space();
    			div22 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Competition Details";
    			t84 = space();
    			button15 = element("button");
    			span15 = element("span");
    			img15 = element("img");
    			t85 = text("\r\n        What are the general rules?");
    			t86 = space();
    			div18 = element("div");
    			p15 = element("p");
    			p15.textContent = "All code for your project MUST be written by the members of your team during HackKU, between the hours of 8PM on April 12th and 8AM on April 14th.";
    			t88 = space();
    			button16 = element("button");
    			span16 = element("span");
    			img16 = element("img");
    			t89 = text("\r\n        What should I build?");
    			t90 = space();
    			div19 = element("div");
    			p16 = element("p");
    			p16.textContent = "Anything! You can submit your project on either the surprise Themed Track or the General Track, and there will be a variety of challenges to attempt as well.";
    			t92 = space();
    			button17 = element("button");
    			span17 = element("span");
    			img17 = element("img");
    			t93 = text("\r\n        What can I win?");
    			t94 = space();
    			div20 = element("div");
    			p17 = element("p");
    			t95 = text("Prize information is available on the ");
    			a4 = element("a");
    			a4.textContent = "HackerDoc";
    			t97 = text(".");
    			t98 = space();
    			button18 = element("button");
    			span18 = element("span");
    			img18 = element("img");
    			t99 = text("\r\n        Do I have to submit a project to attend?");
    			t100 = space();
    			div21 = element("div");
    			p18 = element("p");
    			p18.textContent = "You must submit a project to receive swag, food, and travel reimbursement (if applicable). We encourage everyone to submit their projects even if they are incomplete!";
    			t102 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(h2, "margin", "0");
    			add_location(h2, file$7, 23, 4, 561);
    			add_location(h30, file$7, 25, 6, 629);
    			if (!src_url_equal(img0.src, img0_src_value = "images/heart-red.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img0, "alt", "heart-icon");
    			add_location(img0, file$7, 27, 14, 694);
    			add_location(span0, file$7, 27, 8, 688);
    			attr_dev(button0, "class", "question svelte-1qp4v4");
    			add_location(button0, file$7, 26, 6, 653);
    			add_location(p0, file$7, 31, 8, 849);
    			attr_dev(div0, "class", "answer svelte-1qp4v4");
    			add_location(div0, file$7, 30, 6, 819);
    			if (!src_url_equal(img1.src, img1_src_value = "images/heart-red-shad.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img1, "alt", "heart-icon");
    			add_location(img1, file$7, 34, 14, 1027);
    			add_location(span1, file$7, 34, 8, 1021);
    			attr_dev(button1, "class", "question svelte-1qp4v4");
    			add_location(button1, file$7, 33, 6, 986);
    			add_location(p1, file$7, 38, 8, 1192);
    			attr_dev(div1, "class", "answer svelte-1qp4v4");
    			add_location(div1, file$7, 37, 6, 1162);
    			if (!src_url_equal(img2.src, img2_src_value = "images/heart-red.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img2, "alt", "heart-icon");
    			add_location(img2, file$7, 41, 14, 1597);
    			add_location(span2, file$7, 41, 8, 1591);
    			attr_dev(button2, "class", "question svelte-1qp4v4");
    			add_location(button2, file$7, 40, 6, 1556);
    			add_location(p2, file$7, 45, 8, 1770);
    			attr_dev(div2, "class", "answer svelte-1qp4v4");
    			add_location(div2, file$7, 44, 6, 1740);
    			if (!src_url_equal(img3.src, img3_src_value = "images/heart-red-shad.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img3, "alt", "heart-icon");
    			add_location(img3, file$7, 48, 14, 2019);
    			add_location(span3, file$7, 48, 8, 2013);
    			attr_dev(button3, "class", "question svelte-1qp4v4");
    			add_location(button3, file$7, 47, 6, 1978);
    			attr_dev(a0, "href", "https://static.mlh.io/docs/mlh-code-of-conduct.pdf");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "link svelte-1qp4v4");
    			add_location(a0, file$7, 52, 40, 2313);
    			add_location(p3, file$7, 52, 8, 2281);
    			attr_dev(div3, "class", "answer svelte-1qp4v4");
    			add_location(div3, file$7, 51, 6, 2251);
    			if (!src_url_equal(img4.src, img4_src_value = "images/heart-red.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img4, "alt", "heart-icon");
    			add_location(img4, file$7, 55, 14, 2480);
    			add_location(span4, file$7, 55, 8, 2474);
    			attr_dev(button4, "class", "question svelte-1qp4v4");
    			add_location(button4, file$7, 54, 6, 2439);
    			attr_dev(a1, "href", "https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "link svelte-1qp4v4");
    			add_location(a1, file$7, 59, 25, 2660);
    			attr_dev(a2, "href", "mailto: hack@ku.edu");
    			attr_dev(a2, "class", "link svelte-1qp4v4");
    			add_location(a2, file$7, 59, 185, 2820);
    			add_location(p4, file$7, 59, 8, 2643);
    			attr_dev(div4, "class", "answer svelte-1qp4v4");
    			add_location(div4, file$7, 58, 6, 2613);
    			attr_dev(div5, "class", "faq-section svelte-1qp4v4");
    			add_location(div5, file$7, 24, 4, 596);
    			add_location(h31, file$7, 63, 6, 2982);
    			if (!src_url_equal(img5.src, img5_src_value = "images/heart-red-shad.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img5, "alt", "heart-icon");
    			add_location(img5, file$7, 65, 14, 3049);
    			add_location(span5, file$7, 65, 8, 3043);
    			attr_dev(button5, "class", "question svelte-1qp4v4");
    			add_location(button5, file$7, 64, 6, 3008);
    			add_location(p5, file$7, 69, 8, 3219);
    			attr_dev(div6, "class", "answer svelte-1qp4v4");
    			add_location(div6, file$7, 68, 6, 3189);
    			if (!src_url_equal(img6.src, img6_src_value = "images/heart-red.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img6, "alt", "heart-icon");
    			add_location(img6, file$7, 72, 14, 3427);
    			add_location(span6, file$7, 72, 8, 3421);
    			attr_dev(button6, "class", "question svelte-1qp4v4");
    			add_location(button6, file$7, 71, 6, 3386);
    			add_location(p6, file$7, 76, 8, 3583);
    			attr_dev(div7, "class", "answer svelte-1qp4v4");
    			add_location(div7, file$7, 75, 6, 3553);
    			if (!src_url_equal(img7.src, img7_src_value = "images/heart-red-shad.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img7, "alt", "heart-icon");
    			add_location(img7, file$7, 79, 14, 3753);
    			add_location(span7, file$7, 79, 8, 3747);
    			attr_dev(button7, "class", "question svelte-1qp4v4");
    			add_location(button7, file$7, 78, 6, 3712);
    			add_location(p7, file$7, 83, 8, 3917);
    			attr_dev(div8, "class", "answer svelte-1qp4v4");
    			add_location(div8, file$7, 82, 6, 3887);
    			if (!src_url_equal(img8.src, img8_src_value = "images/heart-red.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img8, "alt", "heart-icon");
    			add_location(img8, file$7, 86, 14, 4195);
    			add_location(span8, file$7, 86, 8, 4189);
    			attr_dev(button8, "class", "question svelte-1qp4v4");
    			add_location(button8, file$7, 85, 6, 4154);
    			add_location(p8, file$7, 90, 8, 4352);
    			attr_dev(div9, "class", "answer svelte-1qp4v4");
    			add_location(div9, file$7, 89, 6, 4322);
    			if (!src_url_equal(img9.src, img9_src_value = "images/heart-red-shad.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img9, "alt", "heart-icon");
    			add_location(img9, file$7, 93, 14, 4464);
    			add_location(span9, file$7, 93, 8, 4458);
    			attr_dev(button9, "class", "question svelte-1qp4v4");
    			add_location(button9, file$7, 92, 6, 4423);
    			attr_dev(a3, "href", "https://forms.gle/Eiv8VGULvbVaUBPp7");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "link svelte-1qp4v4");
    			add_location(a3, file$7, 97, 74, 4714);
    			add_location(p9, file$7, 97, 8, 4648);
    			attr_dev(div10, "class", "answer svelte-1qp4v4");
    			add_location(div10, file$7, 96, 6, 4618);
    			if (!src_url_equal(img10.src, img10_src_value = "images/heart-red.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img10, "alt", "heart-icon");
    			add_location(img10, file$7, 100, 14, 4896);
    			add_location(span10, file$7, 100, 8, 4890);
    			attr_dev(button10, "class", "question svelte-1qp4v4");
    			add_location(button10, file$7, 99, 6, 4855);
    			add_location(b0, file$7, 104, 11, 5059);
    			add_location(br0, file$7, 104, 99, 5147);
    			add_location(b1, file$7, 104, 103, 5151);
    			add_location(br1, file$7, 104, 178, 5226);
    			add_location(b2, file$7, 104, 182, 5230);
    			add_location(br2, file$7, 104, 305, 5353);
    			add_location(b3, file$7, 104, 309, 5357);
    			add_location(p10, file$7, 104, 8, 5056);
    			attr_dev(div11, "class", "answer svelte-1qp4v4");
    			add_location(div11, file$7, 103, 6, 5026);
    			if (!src_url_equal(img11.src, img11_src_value = "images/heart-red-shad.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img11, "alt", "heart-icon");
    			add_location(img11, file$7, 107, 14, 5515);
    			add_location(span11, file$7, 107, 8, 5509);
    			attr_dev(button11, "class", "question svelte-1qp4v4");
    			add_location(button11, file$7, 106, 6, 5474);
    			add_location(p11, file$7, 111, 8, 5670);
    			attr_dev(div12, "class", "answer svelte-1qp4v4");
    			add_location(div12, file$7, 110, 6, 5640);
    			attr_dev(div13, "class", "faq-section svelte-1qp4v4");
    			add_location(div13, file$7, 62, 4, 2949);
    			add_location(h32, file$7, 115, 6, 5784);
    			if (!src_url_equal(img12.src, img12_src_value = "images/heart-red-shad.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img12, "alt", "heart-icon");
    			add_location(img12, file$7, 117, 14, 5854);
    			add_location(span12, file$7, 117, 8, 5848);
    			attr_dev(button12, "class", "question svelte-1qp4v4");
    			add_location(button12, file$7, 116, 6, 5813);
    			add_location(p12, file$7, 121, 8, 6029);
    			attr_dev(div14, "class", "answer svelte-1qp4v4");
    			add_location(div14, file$7, 120, 6, 5999);
    			if (!src_url_equal(img13.src, img13_src_value = "images/heart-red.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img13, "alt", "heart-icon");
    			add_location(img13, file$7, 124, 14, 6257);
    			add_location(span13, file$7, 124, 8, 6251);
    			attr_dev(button13, "class", "question svelte-1qp4v4");
    			add_location(button13, file$7, 123, 6, 6216);
    			add_location(p13, file$7, 128, 8, 6423);
    			attr_dev(div15, "class", "answer svelte-1qp4v4");
    			add_location(div15, file$7, 127, 6, 6393);
    			if (!src_url_equal(img14.src, img14_src_value = "images/heart-red-shad.png")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img14, "alt", "heart-icon");
    			add_location(img14, file$7, 131, 14, 6556);
    			add_location(span14, file$7, 131, 8, 6550);
    			attr_dev(button14, "class", "question svelte-1qp4v4");
    			add_location(button14, file$7, 130, 6, 6515);
    			add_location(p14, file$7, 135, 8, 6733);
    			attr_dev(div16, "class", "answer svelte-1qp4v4");
    			add_location(div16, file$7, 134, 6, 6703);
    			attr_dev(div17, "class", "faq-section svelte-1qp4v4");
    			add_location(div17, file$7, 114, 4, 5751);
    			add_location(h33, file$7, 139, 6, 7113);
    			if (!src_url_equal(img15.src, img15_src_value = "images/heart-red.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img15, "alt", "heart-icon");
    			add_location(img15, file$7, 141, 14, 7190);
    			add_location(span15, file$7, 141, 8, 7184);
    			attr_dev(button15, "class", "question svelte-1qp4v4");
    			add_location(button15, file$7, 140, 6, 7149);
    			add_location(p15, file$7, 145, 8, 7357);
    			attr_dev(div18, "class", "answer svelte-1qp4v4");
    			add_location(div18, file$7, 144, 6, 7327);
    			if (!src_url_equal(img16.src, img16_src_value = "images/heart-red-shad.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img16, "alt", "heart-icon");
    			add_location(img16, file$7, 148, 14, 7573);
    			add_location(span16, file$7, 148, 8, 7567);
    			attr_dev(button16, "class", "question svelte-1qp4v4");
    			add_location(button16, file$7, 147, 6, 7532);
    			add_location(p16, file$7, 152, 8, 7738);
    			attr_dev(div19, "class", "answer svelte-1qp4v4");
    			add_location(div19, file$7, 151, 6, 7708);
    			if (!src_url_equal(img17.src, img17_src_value = "images/heart-red.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img17, "alt", "heart-icon");
    			add_location(img17, file$7, 155, 14, 7965);
    			add_location(span17, file$7, 155, 8, 7959);
    			attr_dev(button17, "class", "question svelte-1qp4v4");
    			add_location(button17, file$7, 154, 6, 7924);
    			attr_dev(a4, "href", "https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "link svelte-1qp4v4");
    			add_location(a4, file$7, 159, 49, 8161);
    			add_location(p17, file$7, 159, 8, 8120);
    			attr_dev(div20, "class", "answer svelte-1qp4v4");
    			add_location(div20, file$7, 158, 6, 8090);
    			if (!src_url_equal(img18.src, img18_src_value = "images/heart-red-shad.png")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "class", "heart-icon svelte-1qp4v4");
    			attr_dev(img18, "alt", "heart-icon");
    			add_location(img18, file$7, 162, 14, 8371);
    			add_location(span18, file$7, 162, 8, 8365);
    			attr_dev(button18, "class", "question svelte-1qp4v4");
    			add_location(button18, file$7, 161, 6, 8330);
    			add_location(p18, file$7, 166, 8, 8556);
    			attr_dev(div21, "class", "answer svelte-1qp4v4");
    			add_location(div21, file$7, 165, 6, 8526);
    			attr_dev(div22, "class", "faq-section svelte-1qp4v4");
    			add_location(div22, file$7, 138, 4, 7080);
    			attr_dev(path, "fill", "var(--off-white)");
    			attr_dev(path, "fill-opacity", "1");
    			attr_dev(path, "d", "M0,256L80,229.3C160,203,320,149,480,149.3C640,149,800,203,960,218.7C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z");
    			add_location(path, file$7, 169, 87, 8844);
    			attr_dev(svg, "class", "wave-bottom svelte-1qp4v4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1440 320");
    			add_location(svg, file$7, 169, 4, 8761);
    			attr_dev(div23, "class", "section faq-container svelte-1qp4v4");
    			attr_dev(div23, "id", "faq");
    			add_location(div23, file$7, 22, 2, 511);
    			add_location(div24, file$7, 21, 0, 502);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
    			append_dev(div24, div23);
    			append_dev(div23, h2);
    			append_dev(div23, t1);
    			append_dev(div23, div5);
    			append_dev(div5, h30);
    			append_dev(div5, t3);
    			append_dev(div5, button0);
    			append_dev(button0, span0);
    			append_dev(span0, img0);
    			append_dev(button0, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div0);
    			append_dev(div0, p0);
    			append_dev(div5, t7);
    			append_dev(div5, button1);
    			append_dev(button1, span1);
    			append_dev(span1, img1);
    			append_dev(button1, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div1);
    			append_dev(div1, p1);
    			append_dev(div5, t11);
    			append_dev(div5, button2);
    			append_dev(button2, span2);
    			append_dev(span2, img2);
    			append_dev(button2, t12);
    			append_dev(div5, t13);
    			append_dev(div5, div2);
    			append_dev(div2, p2);
    			append_dev(div5, t15);
    			append_dev(div5, button3);
    			append_dev(button3, span3);
    			append_dev(span3, img3);
    			append_dev(button3, t16);
    			append_dev(div5, t17);
    			append_dev(div5, div3);
    			append_dev(div3, p3);
    			append_dev(p3, t18);
    			append_dev(p3, a0);
    			append_dev(p3, t20);
    			append_dev(div5, t21);
    			append_dev(div5, button4);
    			append_dev(button4, span4);
    			append_dev(span4, img4);
    			append_dev(button4, t22);
    			append_dev(div5, t23);
    			append_dev(div5, div4);
    			append_dev(div4, p4);
    			append_dev(p4, t24);
    			append_dev(p4, a1);
    			append_dev(p4, t26);
    			append_dev(p4, a2);
    			append_dev(p4, t28);
    			append_dev(div23, t29);
    			append_dev(div23, div13);
    			append_dev(div13, h31);
    			append_dev(div13, t31);
    			append_dev(div13, button5);
    			append_dev(button5, span5);
    			append_dev(span5, img5);
    			append_dev(button5, t32);
    			append_dev(div13, t33);
    			append_dev(div13, div6);
    			append_dev(div6, p5);
    			append_dev(div13, t35);
    			append_dev(div13, button6);
    			append_dev(button6, span6);
    			append_dev(span6, img6);
    			append_dev(button6, t36);
    			append_dev(div13, t37);
    			append_dev(div13, div7);
    			append_dev(div7, p6);
    			append_dev(div13, t39);
    			append_dev(div13, button7);
    			append_dev(button7, span7);
    			append_dev(span7, img7);
    			append_dev(button7, t40);
    			append_dev(div13, t41);
    			append_dev(div13, div8);
    			append_dev(div8, p7);
    			append_dev(div13, t43);
    			append_dev(div13, button8);
    			append_dev(button8, span8);
    			append_dev(span8, img8);
    			append_dev(button8, t44);
    			append_dev(div13, t45);
    			append_dev(div13, div9);
    			append_dev(div9, p8);
    			append_dev(div13, t47);
    			append_dev(div13, button9);
    			append_dev(button9, span9);
    			append_dev(span9, img9);
    			append_dev(button9, t48);
    			append_dev(div13, t49);
    			append_dev(div13, div10);
    			append_dev(div10, p9);
    			append_dev(p9, t50);
    			append_dev(p9, a3);
    			append_dev(p9, t52);
    			append_dev(div13, t53);
    			append_dev(div13, button10);
    			append_dev(button10, span10);
    			append_dev(span10, img10);
    			append_dev(button10, t54);
    			append_dev(div13, t55);
    			append_dev(div13, div11);
    			append_dev(div11, p10);
    			append_dev(p10, b0);
    			append_dev(p10, t57);
    			append_dev(p10, br0);
    			append_dev(p10, b1);
    			append_dev(p10, t59);
    			append_dev(p10, br1);
    			append_dev(p10, b2);
    			append_dev(p10, t61);
    			append_dev(p10, br2);
    			append_dev(p10, b3);
    			append_dev(p10, t63);
    			append_dev(div13, t64);
    			append_dev(div13, button11);
    			append_dev(button11, span11);
    			append_dev(span11, img11);
    			append_dev(button11, t65);
    			append_dev(div13, t66);
    			append_dev(div13, div12);
    			append_dev(div12, p11);
    			append_dev(div23, t68);
    			append_dev(div23, div17);
    			append_dev(div17, h32);
    			append_dev(div17, t70);
    			append_dev(div17, button12);
    			append_dev(button12, span12);
    			append_dev(span12, img12);
    			append_dev(button12, t71);
    			append_dev(div17, t72);
    			append_dev(div17, div14);
    			append_dev(div14, p12);
    			append_dev(div17, t74);
    			append_dev(div17, button13);
    			append_dev(button13, span13);
    			append_dev(span13, img13);
    			append_dev(button13, t75);
    			append_dev(div17, t76);
    			append_dev(div17, div15);
    			append_dev(div15, p13);
    			append_dev(div17, t78);
    			append_dev(div17, button14);
    			append_dev(button14, span14);
    			append_dev(span14, img14);
    			append_dev(button14, t79);
    			append_dev(div17, t80);
    			append_dev(div17, div16);
    			append_dev(div16, p14);
    			append_dev(div23, t82);
    			append_dev(div23, div22);
    			append_dev(div22, h33);
    			append_dev(div22, t84);
    			append_dev(div22, button15);
    			append_dev(button15, span15);
    			append_dev(span15, img15);
    			append_dev(button15, t85);
    			append_dev(div22, t86);
    			append_dev(div22, div18);
    			append_dev(div18, p15);
    			append_dev(div22, t88);
    			append_dev(div22, button16);
    			append_dev(button16, span16);
    			append_dev(span16, img16);
    			append_dev(button16, t89);
    			append_dev(div22, t90);
    			append_dev(div22, div19);
    			append_dev(div19, p16);
    			append_dev(div22, t92);
    			append_dev(div22, button17);
    			append_dev(button17, span17);
    			append_dev(span17, img17);
    			append_dev(button17, t93);
    			append_dev(div22, t94);
    			append_dev(div22, div20);
    			append_dev(div20, p17);
    			append_dev(p17, t95);
    			append_dev(p17, a4);
    			append_dev(p17, t97);
    			append_dev(div22, t98);
    			append_dev(div22, button18);
    			append_dev(button18, span18);
    			append_dev(span18, img18);
    			append_dev(button18, t99);
    			append_dev(div22, t100);
    			append_dev(div22, div21);
    			append_dev(div21, p18);
    			append_dev(div23, t102);
    			append_dev(div23, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div24);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Faq', slots, []);

    	onMount(() => {
    		let acc = document.getElementsByClassName("question");
    		let i;

    		for (i = 0; i < acc.length; i++) {
    			acc[i].addEventListener("click", function () {
    				this.classList.toggle("active");
    				let answer = this.nextElementSibling;

    				if (answer.style.display === "block") {
    					answer.style.display = "none";
    				} else {
    					answer.style.display = "block";
    				}
    			});
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Faq> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class Faq extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Faq",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Sponsors.svelte generated by Svelte v3.46.3 */
    const file$6 = "src\\components\\Sponsors.svelte";

    function create_fragment$6(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let duv;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let span1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let p;
    	let t4;
    	let br;
    	let t5;
    	let a0;
    	let t7;
    	let h30;
    	let t9;
    	let div1;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let h31;
    	let t12;
    	let div2;
    	let img3;
    	let img3_src_value;
    	let t13;
    	let h32;
    	let t15;
    	let div3;
    	let a1;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			duv = element("duv");
    			span0 = element("span");
    			img0 = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Sponsors";
    			t2 = space();
    			span1 = element("span");
    			img1 = element("img");
    			t3 = space();
    			p = element("p");
    			t4 = text("Interested in sponsoring HackKU24?");
    			br = element("br");
    			t5 = text("Contact us at ");
    			a0 = element("a");
    			a0.textContent = "hack@ku.edu";
    			t7 = space();
    			h30 = element("h3");
    			h30.textContent = "MEGA Tier";
    			t9 = space();
    			div1 = element("div");
    			img2 = element("img");
    			t10 = space();
    			h31 = element("h3");
    			h31.textContent = "KILA Tier";
    			t12 = space();
    			div2 = element("div");
    			img3 = element("img");
    			t13 = space();
    			h32 = element("h3");
    			h32.textContent = "In-Kind";
    			t15 = space();
    			div3 = element("div");
    			a1 = element("a");
    			img4 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = "images/flower-left.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "flower-decor svelte-13t1lq1");
    			attr_dev(img0, "alt", "flower-decor");
    			add_location(img0, file$6, 8, 14, 181);
    			add_location(span0, file$6, 8, 8, 175);
    			set_style(h2, "margin", "0 0");
    			add_location(h2, file$6, 9, 8, 272);
    			if (!src_url_equal(img1.src, img1_src_value = "images/flower-right.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "flower-decor svelte-13t1lq1");
    			attr_dev(img1, "alt", "flower-decor");
    			add_location(img1, file$6, 10, 14, 324);
    			add_location(span1, file$6, 10, 8, 318);
    			attr_dev(duv, "class", "flower-decor-container svelte-13t1lq1");
    			add_location(duv, file$6, 7, 6, 129);
    			add_location(br, file$6, 12, 82, 504);
    			attr_dev(a0, "href", "mailto:hack@ku.edu");
    			attr_dev(a0, "class", "email-link turn-red svelte-13t1lq1");
    			add_location(a0, file$6, 12, 100, 522);
    			set_style(p, "margin-top", "0");
    			set_style(p, "text-align", "center");
    			add_location(p, file$6, 12, 6, 428);
    			add_location(div0, file$6, 6, 4, 116);
    			attr_dev(h30, "id", "sponsors-divider");
    			add_location(h30, file$6, 37, 4, 1555);
    			if (!src_url_equal(img2.src, img2_src_value = "images/Netsmart.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Netsmart");
    			attr_dev(img2, "class", "svelte-13t1lq1");
    			add_location(img2, file$6, 39, 6, 1638);
    			attr_dev(div1, "class", "sponsors-tier svelte-13t1lq1");
    			add_location(div1, file$6, 38, 4, 1601);
    			attr_dev(h31, "id", "sponsors-divider");
    			add_location(h31, file$6, 42, 4, 1704);
    			if (!src_url_equal(img3.src, img3_src_value = "images/Tradebot.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Tradebot");
    			attr_dev(img3, "class", "svelte-13t1lq1");
    			add_location(img3, file$6, 44, 6, 1787);
    			attr_dev(div2, "class", "sponsors-tier svelte-13t1lq1");
    			add_location(div2, file$6, 43, 4, 1750);
    			attr_dev(h32, "id", "sponsors-divider");
    			add_location(h32, file$6, 47, 4, 1853);
    			if (!src_url_equal(img4.src, img4_src_value = "images/standoutStickers.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Standout Stickers Logo");
    			attr_dev(img4, "class", "sponsor-logo svelte-13t1lq1");
    			add_location(img4, file$6, 49, 80, 2008);
    			attr_dev(a1, "href", "http://hackp.ac/mlh-StandOutStickers-hackathons");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$6, 49, 6, 1934);
    			attr_dev(div3, "class", "sponsors-tier svelte-13t1lq1");
    			add_location(div3, file$6, 48, 4, 1897);
    			attr_dev(div4, "class", "section sponsors-section svelte-13t1lq1");
    			attr_dev(div4, "id", "sponsors");
    			add_location(div4, file$6, 5, 2, 58);
    			add_location(div5, file$6, 4, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, duv);
    			append_dev(duv, span0);
    			append_dev(span0, img0);
    			append_dev(duv, t0);
    			append_dev(duv, h2);
    			append_dev(duv, t2);
    			append_dev(duv, span1);
    			append_dev(span1, img1);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(p, t4);
    			append_dev(p, br);
    			append_dev(p, t5);
    			append_dev(p, a0);
    			append_dev(div4, t7);
    			append_dev(div4, h30);
    			append_dev(div4, t9);
    			append_dev(div4, div1);
    			append_dev(div1, img2);
    			append_dev(div4, t10);
    			append_dev(div4, h31);
    			append_dev(div4, t12);
    			append_dev(div4, div2);
    			append_dev(div2, img3);
    			append_dev(div4, t13);
    			append_dev(div4, h32);
    			append_dev(div4, t15);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    			append_dev(a1, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sponsors', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sponsors> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Sponsors extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sponsors",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Organizer.svelte generated by Svelte v3.46.3 */
    const file$5 = "src\\components\\Organizer.svelte";

    // (29:0) {#if name}
    function create_if_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h4;
    	let t1_value = /*data*/ ctx[1].display + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*data*/ ctx[1].title + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = /*data*/ ctx[1].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image svelte-gy6zrp");
    			attr_dev(img, "alt", "contact1");
    			attr_dev(img, "id", "portrait");
    			add_location(img, file$5, 30, 2, 575);
    			attr_dev(h4, "class", "organizer-text svelte-gy6zrp");
    			add_location(h4, file$5, 31, 2, 644);
    			attr_dev(p, "class", "organizer-text svelte-gy6zrp");
    			set_style(p, "margin", "0");
    			add_location(p, file$5, 32, 2, 694);
    			attr_dev(div, "class", "organizer shrink svelte-gy6zrp");
    			add_location(div, file$5, 29, 1, 491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h4);
    			append_dev(h4, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && !src_url_equal(img.src, img_src_value = /*data*/ ctx[1].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 2 && t1_value !== (t1_value = /*data*/ ctx[1].display + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 2 && t3_value !== (t3_value = /*data*/ ctx[1].title + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(29:0) {#if name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*name*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*name*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Organizer', slots, []);
    	let { name } = $$props;
    	let { data } = $$props;
    	const writable_props = ['name', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Organizer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.open(data.link, "_blank");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ name, data });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, data, click_handler];
    }

    class Organizer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Organizer",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Organizer> was created without expected prop 'name'");
    		}

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<Organizer> was created without expected prop 'data'");
    		}
    	}

    	get name() {
    		throw new Error("<Organizer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Organizer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Organizer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Organizer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Contact.svelte generated by Svelte v3.46.3 */

    const { Object: Object_1 } = globals;
    const file$4 = "src\\components\\Contact.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i][0];
    	child_ctx[2] = list[i][1];
    	return child_ctx;
    }

    // (74:6) {#each Object.entries(organizers) as [name, data]}
    function create_each_block(ctx) {
    	let organizer;
    	let current;

    	organizer = new Organizer({
    			props: {
    				name: /*name*/ ctx[1],
    				data: /*data*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(organizer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(organizer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(organizer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(organizer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(organizer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(74:6) {#each Object.entries(organizers) as [name, data]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div1;
    	let current;
    	let each_value = Object.entries(/*organizers*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Meet the Team";
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img.src, img_src_value = "images/contactDecor.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "decor svelte-14g3lp1");
    			attr_dev(img, "alt", "duck decor");
    			add_location(img, file$4, 70, 9, 1845);
    			add_location(div0, file$4, 70, 4, 1840);
    			attr_dev(h2, "class", "header svelte-14g3lp1");
    			add_location(h2, file$4, 71, 4, 1925);
    			attr_dev(div1, "class", "contact-gallery svelte-14g3lp1");
    			add_location(div1, file$4, 72, 4, 1968);
    			attr_dev(div2, "class", "section contact-section svelte-14g3lp1");
    			attr_dev(div2, "id", "contact");
    			add_location(div2, file$4, 69, 2, 1784);
    			add_location(div3, file$4, 68, 0, 1775);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, organizers*/ 1) {
    				each_value = Object.entries(/*organizers*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);

    	let organizers = {
    		"zoe": {
    			display: "Zoe Kulphongpatana",
    			title: "Director",
    			link: "https://www.linkedin.com/in/kulphongpatana/",
    			image: "images/zoe.jpg"
    		},
    		"james": {
    			display: "James Hurd",
    			title: "Vice Director",
    			link: "https://jameshurd.net/",
    			image: "images/james.png"
    		},
    		"firangiz": {
    			display: "Firangiz Ganbarli",
    			title: "Logistics",
    			link: "https://www.linkedin.com/in/firangizg/",
    			image: "images/firangiz.jpg"
    		},
    		"raven": {
    			display: "Raven Duong",
    			title: "Logistics",
    			link: "https://www.linkedin.com/in/mai-duong-0128h/",
    			image: "images/raven.jpg"
    		},
    		"shayna": {
    			display: "Shayna Weinstein",
    			title: "Logistics",
    			link: "https://www.linkedin.com/in/shayna-weinstein/",
    			image: "images/shayna.jpg"
    		},
    		"michelle": {
    			display: "Michelle Chen",
    			title: "Finance",
    			link: "https://www.linkedin.com/in/michelle-chen3/",
    			image: "images/michelle.jpg"
    		},
    		"kevinh": {
    			display: "Kevinh Nguyen",
    			title: "Sponsorship",
    			link: "https://www.linkedin.com/in/kevinh-nguyen/",
    			image: "images/kevinh.png"
    		},
    		"nathan": {
    			display: "Nathan Dodson",
    			title: "Sponsorship",
    			link: "https://www.nathandodson.com/",
    			image: "images/nathan.jpeg"
    		},
    		"sungin": {
    			display: "Sungin Huh",
    			title: "Food",
    			link: "https://www.linkedin.com/in/sunginhuh/",
    			image: "images/sungin.jpg"
    		},
    		"anh": {
    			display: "Anh Hoang",
    			title: "Marketing",
    			link: "https://www.linkedin.com/in/anh-hoang-54a4b1291/",
    			image: "images/anh.jpg"
    		}
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Organizer, organizers });

    	$$self.$inject_state = $$props => {
    		if ('organizers' in $$props) $$invalidate(0, organizers = $$props.organizers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [organizers];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Heart.svelte generated by Svelte v3.46.3 */

    const file$3 = "src\\components\\Heart.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let svg0;
    	let defs;
    	let style;
    	let t0;
    	let path0;
    	let t1;
    	let div0;
    	let svg1;
    	let path1;
    	let div1_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t0 = text(".inner-heart {\r\n          -webkit-mask: rectangle(0, 0, 0%, 0%);\r\n                  mask: rectangle(0, 0, 0%, 0%)\r\n        }");
    			path0 = svg_element("path");
    			t1 = space();
    			div0 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			add_location(style, file$3, 25, 6, 628);
    			add_location(defs, file$3, 24, 4, 614);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M45.5395 7.43083C40.4936 10.364 35.481 15.8568 33.5021 19.8145L31.5275 23.7637L29.1569 20.0387C26.454 15.7915 21.788 11.1475 17.152 8.68768C14.8375 7.45958 12.7402 6.88741 11.02 6.98246C9.424 7.07065 7.99481 7.73216 6.78233 9.39932C5.23373 11.5286 5.04835 14.7799 6.4384 19.1148C7.80477 23.3758 10.5319 28.1253 13.8539 32.6174C17.1632 37.0922 20.9644 41.1793 24.3537 44.1222C26.051 45.5959 27.5981 46.7417 28.889 47.5038C30.2759 48.3226 31.0394 48.4999 31.2661 48.4999C31.463 48.4999 32.1501 48.346 33.4105 47.5472C34.5866 46.8018 35.9864 45.673 37.5273 44.2063C40.6022 41.2795 44.038 37.1997 47.1151 32.7101C50.1959 28.2151 52.8474 23.4109 54.423 19.0506C56.0415 14.5715 56.3372 11.0761 55.4497 8.85732C54.4717 6.41212 53.1553 5.68216 51.838 5.53135C50.2462 5.34912 48.0739 5.95759 45.5395 7.43083ZM52.4067 0.563795C55.8418 0.957058 58.5476 3.1389 60.0921 7.00045C61.6893 10.9937 60.846 15.9883 59.1254 20.7498C57.3619 25.63 54.4742 30.8171 51.2393 35.5368C48.0008 40.2619 44.3444 44.6204 40.9745 47.828C39.2929 49.4286 37.6321 50.7912 36.0872 51.7703C34.6267 52.696 32.9327 53.4999 31.2661 53.4999C29.6293 53.4999 27.8857 52.7178 26.3471 51.8094C24.7125 50.8444 22.9155 49.4952 21.0756 47.8976C17.3903 44.6978 13.3439 40.3368 9.8338 35.5904C6.33647 30.8613 3.2724 25.6162 1.6772 20.6416C0.105683 15.7408 -0.211679 10.5151 2.73866 6.45845L4.76049 7.92889L2.73866 6.45845C4.83937 3.56999 7.65519 2.16076 10.7442 1.99008C13.709 1.82626 16.7368 2.8071 19.4956 4.27092C23.8226 6.56688 28.0035 10.325 31.0985 14.1883C34.0072 10.0933 38.4795 5.75138 43.0267 3.1081C45.9357 1.41714 49.246 0.201951 52.4067 0.563795Z");
    			attr_dev(path0, "fill", "#E85151");
    			add_location(path0, file$3, 31, 4, 796);
    			attr_dev(svg0, "id", "Layer_1");
    			set_style(svg0, "height", /*width*/ ctx[0] + "rem");
    			set_style(svg0, "width", /*width*/ ctx[0] + "rem");
    			attr_dev(svg0, "data-name", "Layer 1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 75 45");
    			attr_dev(svg0, "class", "svelte-14y73wj");
    			add_location(svg0, file$3, 23, 2, 468);
    			attr_dev(path1, "d", "M2.0395 4.929C-6.95838 17.301 21.0912 48 28.5451 48C35.9989 48 60.0193 17.3532 55.0499 4.929C50.0048 -7.68449 32.9626 6.86152 28.5451 15.6966C22.7467 6.58548 8.66589 -4.18223 2.0395 4.929Z");
    			attr_dev(path1, "fill", "#E85151");
    			add_location(path1, file$3, 35, 6, 2686);
    			attr_dev(svg1, "id", "Layer_1");
    			set_style(svg1, "height", /*width*/ ctx[0] + "rem");
    			set_style(svg1, "width", /*width*/ ctx[0] + "rem");
    			attr_dev(svg1, "data-name", "Layer 1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 70 40");
    			attr_dev(svg1, "class", "svelte-14y73wj");
    			add_location(svg1, file$3, 34, 4, 2538);
    			attr_dev(div0, "class", "inner-heart-container svelte-14y73wj");
    			toggle_class(div0, "full", /*full*/ ctx[1]);
    			add_location(div0, file$3, 33, 2, 2486);
    			attr_dev(div1, "style", div1_style_value = `width: ${/*width*/ ctx[0]}rem; height: ${/*width*/ ctx[0]}rem; position: relative; cursor:pointer;`);
    			add_location(div1, file$3, 22, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg0);
    			append_dev(svg0, defs);
    			append_dev(defs, style);
    			append_dev(style, t0);
    			append_dev(svg0, path0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, svg1);
    			append_dev(svg1, path1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1) {
    				set_style(svg0, "height", /*width*/ ctx[0] + "rem");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg0, "width", /*width*/ ctx[0] + "rem");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg1, "height", /*width*/ ctx[0] + "rem");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg1, "width", /*width*/ ctx[0] + "rem");
    			}

    			if (dirty & /*full*/ 2) {
    				toggle_class(div0, "full", /*full*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 1 && div1_style_value !== (div1_style_value = `width: ${/*width*/ ctx[0]}rem; height: ${/*width*/ ctx[0]}rem; position: relative; cursor:pointer;`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heart', slots, []);
    	let { width = 5 } = $$props;
    	let full = false;
    	const writable_props = ['width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Heart> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, full = !full);

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ width, full });

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('full' in $$props) $$invalidate(1, full = $$props.full);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, full, click_handler];
    }

    class Heart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heart",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get width() {
    		throw new Error("<Heart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Heart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\assets\scallop.svelte generated by Svelte v3.46.3 */

    const file$2 = "src\\components\\assets\\scallop.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M78 12.5C61.3334 -4.16667 44.6667 -4.16667 28 12.5C19 3.5 9 -0.64 0 0.08V50H1280V10.58C1279.33 11.1933 1278.67 11.8333 1278 12.5C1261.33 -4.16667 1244.67 -4.16667 1228 12.5C1211.33 -4.16667 1194.67 -4.16667 1178 12.5C1161.33 -4.16667 1144.67 -4.16667 1128 12.5C1111.33 -4.16667 1094.67 -4.16667 1078 12.5C1061.33 -4.16667 1044.67 -4.16667 1028 12.5C1011.33 -4.16667 994.667 -4.16667 978 12.5C961.333 -4.16667 944.667 -4.16667 928 12.5C911.333 -4.16667 894.667 -4.16667 878 12.5C861.333 -4.16667 844.667 -4.16667 828 12.5C811.333 -4.16667 794.667 -4.16667 778 12.5C761.333 -4.16667 744.667 -4.16667 728 12.5C711.333 -4.16667 694.667 -4.16667 678 12.5C661.333 -4.16667 644.667 -4.16667 628 12.5C611.333 -4.16667 594.667 -4.16667 578 12.5C561.333 -4.16667 544.667 -4.16667 528 12.5C511.333 -4.16667 494.667 -4.16667 478 12.5C461.333 -4.16667 444.667 -4.16667 428 12.5C411.333 -4.16667 394.667 -4.16667 378 12.5C361.333 -4.16667 344.667 -4.16667 328 12.5C311.333 -4.16667 294.667 -4.16667 278 12.5C261.333 -4.16667 244.667 -4.16667 228 12.5C211.333 -4.16667 194.667 -4.16667 178 12.5C161.333 -4.16667 144.667 -4.16667 128 12.5C111.333 -4.16667 94.6667 -4.16667 78 12.5Z");
    			attr_dev(path, "fill", "#F2AC49");
    			add_location(path, file$2, 1, 0, 96);
    			attr_dev(svg, "viewBox", "0 0 1280 50");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "width", "100vw");
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scallop', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scallop> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Scallop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scallop",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.46.3 */
    const file$1 = "src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div2;
    	let div0;
    	let heart;
    	let t0;
    	let p;
    	let t2;
    	let div1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let scallop;
    	let current;
    	heart = new Heart({ $$inline: true });
    	scallop = new Scallop({ $$inline: true });

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(heart.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "Made with love by the HackKU24 team";
    			t2 = space();
    			div1 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t3 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t4 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t5 = space();
    			create_component(scallop.$$.fragment);
    			attr_dev(p, "class", "heart-message svelte-3xsj23");
    			add_location(p, file$1, 10, 6, 237);
    			attr_dev(div0, "class", "heart-container svelte-3xsj23");
    			add_location(div0, file$1, 8, 4, 183);
    			if (!src_url_equal(img0.src, img0_src_value = "images/instagram.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "contact-icon shrink svelte-3xsj23");
    			attr_dev(img0, "alt", "Instagram icon");
    			add_location(img0, file$1, 13, 69, 419);
    			attr_dev(a0, "href", "https://www.instagram.com/thehackku/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 13, 6, 356);
    			if (!src_url_equal(img1.src, img1_src_value = "images/email.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "contact-icon shrink svelte-3xsj23");
    			attr_dev(img1, "alt", "Email icon");
    			add_location(img1, file$1, 14, 36, 544);
    			attr_dev(a1, "href", "mailto: hack@ku.edu");
    			add_location(a1, file$1, 14, 6, 514);
    			if (!src_url_equal(img2.src, img2_src_value = "images/github.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "contact-icon shrink svelte-3xsj23");
    			attr_dev(img2, "alt", "GitHub icon");
    			add_location(img2, file$1, 15, 61, 686);
    			attr_dev(a2, "href", "https://github.com/theHackKU");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$1, 15, 6, 631);
    			attr_dev(div1, "class", "links-container svelte-3xsj23");
    			add_location(div1, file$1, 12, 4, 319);
    			attr_dev(div2, "class", "footer-container svelte-3xsj23");
    			add_location(div2, file$1, 7, 2, 147);
    			add_location(footer, file$1, 6, 0, 135);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, div0);
    			mount_component(heart, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div1, t4);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div2, t5);
    			mount_component(scallop, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(heart.$$.fragment, local);
    			transition_in(scallop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(heart.$$.fragment, local);
    			transition_out(scallop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(heart);
    			destroy_component(scallop);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Heart, Scallop });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let landing;
    	let t0;
    	let about;
    	let t1;
    	let faq;
    	let t2;
    	let sponsors;
    	let t3;
    	let contact;
    	let t4;
    	let footer;
    	let t5;
    	let a;
    	let img;
    	let img_src_value;
    	let current;
    	landing = new Landing({ $$inline: true });
    	about = new About({ $$inline: true });
    	faq = new Faq({ $$inline: true });
    	sponsors = new Sponsors({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(landing.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(faq.$$.fragment);
    			t2 = space();
    			create_component(sponsors.$$.fragment);
    			t3 = space();
    			create_component(contact.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			t5 = space();
    			a = element("a");
    			img = element("img");
    			attr_dev(div, "class", "site-container");
    			add_location(div, file, 11, 1, 358);
    			if (!src_url_equal(img.src, img_src_value = "https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-yellow.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Major League Hacking 2024 Hackathon Season");
    			set_style(img, "width", "100%");
    			add_location(img, file, 19, 266, 747);
    			attr_dev(a, "id", "mlh-trust-badge");
    			set_style(a, "display", "block");
    			set_style(a, "max-width", "100px");
    			set_style(a, "min-width", "60px");
    			set_style(a, "position", "fixed");
    			set_style(a, "right", "25px");
    			set_style(a, "top", "0");
    			set_style(a, "width", "8%");
    			set_style(a, "z-index", "1000000");
    			attr_dev(a, "href", "https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=yellow");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 19, 1, 482);
    			add_location(main, file, 10, 0, 349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(landing, div, null);
    			append_dev(div, t0);
    			mount_component(about, div, null);
    			append_dev(div, t1);
    			mount_component(faq, div, null);
    			append_dev(div, t2);
    			mount_component(sponsors, div, null);
    			append_dev(div, t3);
    			mount_component(contact, div, null);
    			append_dev(div, t4);
    			mount_component(footer, div, null);
    			append_dev(main, t5);
    			append_dev(main, a);
    			append_dev(a, img);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(landing.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(faq.$$.fragment, local);
    			transition_in(sponsors.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(landing.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(faq.$$.fragment, local);
    			transition_out(sponsors.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(landing);
    			destroy_component(about);
    			destroy_component(faq);
    			destroy_component(sponsors);
    			destroy_component(contact);
    			destroy_component(footer);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Landing,
    		About,
    		Faq,
    		Sponsors,
    		Contact,
    		Footer
    	});

    	return [];
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
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
