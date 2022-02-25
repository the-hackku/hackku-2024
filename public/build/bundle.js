
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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

    /* src/components/Heart.svelte generated by Svelte v3.46.3 */

    const file$4 = "src/components/Heart.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let svg0;
    	let defs0;
    	let style0;
    	let t0;
    	let path0;
    	let t1;
    	let div0;
    	let svg1;
    	let defs1;
    	let style1;
    	let t2;
    	let path1;
    	let div1_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			style0 = svg_element("style");
    			t0 = text(".cls-1 {\n                    fill:#e8000d;\n                }\n                .innerHeart {\n                    -webkit-mask: rectangle(0, 0, 0%, 0%);\n                            mask: rectangle(0, 0, 0%, 0%)\n                }");
    			path0 = svg_element("path");
    			t1 = space();
    			div0 = element("div");
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			style1 = svg_element("style");
    			t2 = text(".innerHeart {\n                        fill:#e8000d;\n                    }");
    			path1 = svg_element("path");
    			add_location(style0, file$4, 29, 12, 662);
    			add_location(defs0, file$4, 28, 8, 643);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M23.48,10.3c.49-.61.92-1.22,1.43-1.76a10.46,10.46,0,0,1,14.2-1.08,10,10,0,0,1,3.58,9,19.43,19.43,0,0,1-3.94,9.62,47.79,47.79,0,0,1-9.22,9.57c-1.68,1.36-3.46,2.59-5.19,3.88a1.25,1.25,0,0,1-1.58,0A57.25,57.25,0,0,1,8.94,27a23.07,23.07,0,0,1-4.2-8.2,11,11,0,0,1,.85-8.55,9.46,9.46,0,0,1,9.14-5,10.41,10.41,0,0,1,8.48,4.7A4.56,4.56,0,0,1,23.48,10.3ZM14.33,7.24A7.79,7.79,0,0,0,6.9,12.35a9.66,9.66,0,0,0-.07,6.24A22.25,22.25,0,0,0,11,26.21,57.16,57.16,0,0,0,23.28,37.43c.24.17.37.06.54-.06A62.82,62.82,0,0,0,32.71,30a32.77,32.77,0,0,0,6.14-8.14,13.69,13.69,0,0,0,1.71-6.94,7.84,7.84,0,0,0-3.47-6.36A8.51,8.51,0,0,0,24.43,13c-.18.56-.47.8-.94.79a.94.94,0,0,1-1-.75A8.66,8.66,0,0,0,14.33,7.24Z");
    			add_location(path0, file$4, 38, 8, 944);
    			attr_dev(svg0, "id", "Layer_1");
    			set_style(svg0, "height", /*width*/ ctx[0] + "px");
    			set_style(svg0, "width", /*width*/ ctx[0] + "px");
    			attr_dev(svg0, "data-name", "Layer 1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 47 45");
    			attr_dev(svg0, "class", "svelte-1jz5o04");
    			add_location(svg0, file$4, 27, 4, 496);
    			add_location(style1, file$4, 43, 16, 1894);
    			add_location(defs1, file$4, 42, 12, 1871);
    			attr_dev(path1, "class", "innerHeart");
    			attr_dev(path1, "d", "M39.11,7.46a10.46,10.46,0,0,0-14.2,1.08c-.5.54-.94,1.15-1.43,1.76a4.56,4.56,0,0,0-.27-.39,10.41,10.41,0,0,0-8.48-4.7,9.46,9.46,0,0,0-9.14,5,11,11,0,0,0-.85,8.55A23.07,23.07,0,0,0,8.94,27,57.25,57.25,0,0,0,22.76,39.57a1.25,1.25,0,0,0,1.58,0c1.73-1.29,3.51-2.52,5.19-3.88a47.79,47.79,0,0,0,9.22-9.57,19.43,19.43,0,0,0,3.94-9.62A10.06,10.06,0,0,0,39.11,7.46Z");
    			add_location(path1, file$4, 48, 12, 2036);
    			attr_dev(svg1, "id", "Layer_1");
    			set_style(svg1, "height", /*width*/ ctx[0] + "px");
    			set_style(svg1, "width", /*width*/ ctx[0] + "px");
    			attr_dev(svg1, "data-name", "Layer 1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 47 45");
    			attr_dev(svg1, "class", "svelte-1jz5o04");
    			add_location(svg1, file$4, 41, 8, 1720);
    			attr_dev(div0, "class", "innerHeartCont svelte-1jz5o04");
    			toggle_class(div0, "full", /*full*/ ctx[1]);
    			add_location(div0, file$4, 40, 4, 1672);
    			attr_dev(div1, "style", div1_style_value = `width: ${/*width*/ ctx[0]}px; height: ${/*width*/ ctx[0]}px; position: relative; cursor:pointer;`);
    			add_location(div1, file$4, 25, 0, 370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, style0);
    			append_dev(style0, t0);
    			append_dev(svg0, path0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, style1);
    			append_dev(style1, t2);
    			append_dev(svg1, path1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1) {
    				set_style(svg0, "height", /*width*/ ctx[0] + "px");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg0, "width", /*width*/ ctx[0] + "px");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg1, "height", /*width*/ ctx[0] + "px");
    			}

    			if (dirty & /*width*/ 1) {
    				set_style(svg1, "width", /*width*/ ctx[0] + "px");
    			}

    			if (dirty & /*full*/ 2) {
    				toggle_class(div0, "full", /*full*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 1 && div1_style_value !== (div1_style_value = `width: ${/*width*/ ctx[0]}px; height: ${/*width*/ ctx[0]}px; position: relative; cursor:pointer;`)) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Heart', slots, []);
    	let { width = 100 } = $$props;
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Heart",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get width() {
    		throw new Error("<Heart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Heart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    /* src/components/HackKU.svelte generated by Svelte v3.46.3 */

    const file$3 = "src/components/HackKU.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".cls-1{fill:none;}.cls-1,.cls-2{stroke:#e8000d;stroke-linejoin:round;stroke-width:4px;}.cls-2{fill:#e8000d;}");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			add_location(style, file$3, 0, 101, 101);
    			add_location(defs, file$3, 0, 95, 95);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M51.43,48,39.69,45.86V34.45H92.53V45.86L79.15,48V87h44.69V48.15l-12.23-2.29V34.45H163.8V45.86L151.73,48v95.25l12.07,1.63v10.76H111.61V144.86l12.23-1.8V100.82H79.15v42.41l13.38,1.63v10.76H39.36V144.86l12.07-1.63Z");
    			add_location(path0, file$3, 0, 231, 231);
    			attr_dev(path1, "class", "cls-1");
    			attr_dev(path1, "d", "M189.16,107.51q14.6-7.67,38.4-7.83V96.42a26.9,26.9,0,0,0-1.3-9.3A9.31,9.31,0,0,0,221.53,82q-3.42-1.72-10.11-1.72a49.83,49.83,0,0,0-14.27,1.88,104.85,104.85,0,0,0-13.13,5l-5.55-11.74A53,53,0,0,1,187,70.24,71.68,71.68,0,0,1,201.06,65a66.71,66.71,0,0,1,17.21-2.2q13,0,20.47,3.43a20.62,20.62,0,0,1,10.6,10.6q3.18,7.17,3.18,19.57v48.44H261v10.27q-3.75.83-10.44,1.63a95.42,95.42,0,0,1-11.42.82q-6.19,0-8.23-1.8t-2-7.17v-3.75a38.35,38.35,0,0,1-10.93,8.72,31.79,31.79,0,0,1-15.82,3.84,29.16,29.16,0,0,1-13.94-3.35,24.81,24.81,0,0,1-10-9.62,29,29,0,0,1-3.67-14.92Q174.56,115.17,189.16,107.51Zm32.21,33.19a24.23,24.23,0,0,0,6.19-4.16V110.61q-12.72,0-18.83,4.57a14,14,0,0,0-6.12,11.74q0,7.33,3.26,11.41a10.87,10.87,0,0,0,9,4.08A15.41,15.41,0,0,0,221.37,140.7Z");
    			add_location(path1, file$3, 0, 468, 468);
    			attr_dev(path2, "class", "cls-1");
    			attr_dev(path2, "d", "M273.88,85.49a41.4,41.4,0,0,1,16.47-16.88,49.21,49.21,0,0,1,24.47-6,67.4,67.4,0,0,1,11.82.9,86,86,0,0,1,10.19,2.52c3.16.88,5.11,1.37,5.88,1.47l-1.15,29.52H325.09l-4.24-18.75a4.18,4.18,0,0,0-2.69-3,14,14,0,0,0-5.3-.9q-7.67,0-12,7.5t-4.32,25q0,16.64,5.46,25.52t14.76,8.89a41.55,41.55,0,0,0,22.18-6.2l4.41,9.62q-3.92,4.41-12.89,8.57a46.75,46.75,0,0,1-19.89,4.16q-21.37,0-32-12.64T268,110.94Q268,96.42,273.88,85.49Z");
    			add_location(path2, file$3, 0, 1242, 1242);
    			attr_dev(path3, "class", "cls-1");
    			attr_dev(path3, "d", "M362.44,37.87l-11.09-2.12V25.8l32.45-3.91h.49L389,25.31v76.17l-.49,8,30.66-32.29-12.07-1.8V65.11h44.37V75.38L438.11,77.5,420.5,94.3l26.91,49.09,8.48,1.47v10.76H410.55V144.86l7.34-1.47L401.74,111.1l-13.21,13.7.33,8.32v10.27l9.46,1.47v10.76H353.47V144.86l9-1.47Z");
    			add_location(path3, file$3, 0, 1679, 1679);
    			attr_dev(path4, "class", "cls-2");
    			attr_dev(path4, "d", "M539.55,149.67q-3.42-6-10.27-19.49Q518.68,108,513,100.33L499.76,115.5v27.73l13.53,1.63v10.76H459.47V144.86l12.56-1.8V48.15l-12.56-2.29V34.45h52.36V45.86l-12.07,2.29V98.87l39.79-50.72-13.21-2.29V34.45h46.48V45.7L558.47,48,529.11,81.25a72.91,72.91,0,0,1,12.15,14.93q6.29,9.7,15.25,25.52,6,10.61,9,15.49t4.82,5.87l7.82,1.8v10.76H545.26C543.74,155.62,541.83,153.64,539.55,149.67Z");
    			add_location(path4, file$3, 0, 1965, 1965);
    			attr_dev(path5, "class", "cls-2");
    			attr_dev(path5, "d", "M602.67,144.69q-12.57-12.23-12.56-38.32V48.15L580,45.86V34.45h52.67V45.86L619,48.31v60.34q0,36.85,25.6,36.86,12.72,0,18.67-9.7t6-26.83V48.15l-14-2.29V34.45h42.4V45.86l-10.76,2.29v59.36q0,25.44-12.48,37.43t-33.84,12Q615.22,156.93,602.67,144.69Z");
    			add_location(path5, file$3, 0, 2366, 2366);
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 724 180");
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HackKU', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HackKU> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HackKU extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HackKU",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/RegisterButton.svelte generated by Svelte v3.46.3 */

    const file$2 = "src/components/RegisterButton.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let svg;
    	let defs;
    	let style;
    	let t1;
    	let circle;
    	let path;
    	let t2;
    	let div3;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t1 = text(".fduhsiaf{fill:#f2f2dd;}.fjdsoiufhdsi{fill:#e8000d;}");
    			circle = svg_element("circle");
    			path = svg_element("path");
    			t2 = space();
    			div3 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "skewed absolute w-[180px] h-[180px] bg-[#0051ba] py-4 px-8 text-xl rounded-[100%] svelte-1g1zd37");
    			add_location(div0, file$2, 21, 4, 504);
    			add_location(style, file$2, 24, 131, 914);
    			add_location(defs, file$2, 24, 125, 908);
    			attr_dev(circle, "class", "fduhsiaf");
    			attr_dev(circle, "cx", "16");
    			attr_dev(circle, "cy", "16");
    			attr_dev(circle, "r", "6.26");
    			add_location(circle, file$2, 24, 205, 988);
    			attr_dev(path, "class", "fjdsoiufhdsi");
    			attr_dev(path, "d", "M30,14A12,12,0,0,1,18,2a2,2,0,0,0-4,0A12,12,0,0,1,2,14a2,2,0,0,0,0,4A12,12,0,0,1,14,30a2,2,0,0,0,4,0A12,12,0,0,1,30,18a2,2,0,0,0,0-4ZM9.74,16A16.1,16.1,0,0,0,16,9.74,16.1,16.1,0,0,0,22.26,16,16.1,16.1,0,0,0,16,22.26,16.1,16.1,0,0,0,9.74,16Z");
    			add_location(path, file$2, 24, 256, 1039);
    			attr_dev(svg, "class", "h-full");
    			attr_dev(svg, "id", "fdjhsuiobsdo");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			add_location(svg, file$2, 24, 12, 795);
    			attr_dev(div1, "class", "w-[30px] h-[30px] star svelte-1g1zd37");
    			add_location(div1, file$2, 23, 8, 746);
    			attr_dev(div2, "class", "skewed absolute w-[240px] h-[240px] border-[4px] border-[#e8000d] rounded-[100%] flex justify-center items-center svelte-1g1zd37");
    			add_location(div2, file$2, 22, 4, 610);
    			attr_dev(div3, "class", "absolute w-[180px] h-[180px] text-[#f2f2dd] flex justify-center items-center");
    			add_location(div3, file$2, 27, 4, 1349);
    			attr_dev(div4, "class", "cursor-pointer italic w-[240px] h-[100px] flex relative justify-center items-center animated svelte-1g1zd37");
    			add_location(div4, file$2, 20, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t1);
    			append_dev(svg, circle);
    			append_dev(svg, path);
    			append_dev(div4, t2);
    			append_dev(div4, div3);

    			if (default_slot) {
    				default_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div4,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RegisterButton', slots, ['default']);

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ['onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RegisterButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, $$scope, slots];
    }

    class RegisterButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegisterButton",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get onClick() {
    		throw new Error("<RegisterButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<RegisterButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MemberButton.svelte generated by Svelte v3.46.3 */

    const file$1 = "src/components/MemberButton.svelte";

    // (21:0) {#if name}
    function create_if_block$1(ctx) {
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div1;
    	let t2_value = /*data*/ ctx[1].display + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*data*/ ctx[1].title + "";
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			attr_dev(img0, "class", "hand absolute w-[60px] left-[10px] top-[90px] svelte-16na7xf");
    			attr_dev(img0, "alt", "hand");
    			if (!src_url_equal(img0.src, img0_src_value = `${/*hands*/ ctx[2][Math.floor(Math.random() * /*hands*/ ctx[2].length)]}.png`)) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$1, 23, 8, 570);
    			attr_dev(img1, "alt", /*name*/ ctx[0]);
    			if (!src_url_equal(img1.src, img1_src_value = `${/*name*/ ctx[0]}.png`)) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$1, 24, 8, 714);
    			attr_dev(div0, "class", "handCont cursor-pointer relative overflow-hidden w-[250px] h-[250px] border-[#e8000d] border-4 rounded-full svelte-16na7xf");
    			add_location(div0, file$1, 22, 4, 390);
    			attr_dev(div1, "class", "text-center red font-bold text-2xl");
    			add_location(div1, file$1, 26, 4, 768);
    			attr_dev(div2, "class", "text-center red text-lg");
    			add_location(div2, file$1, 27, 4, 841);
    			attr_dev(div3, "class", "flex flex-col gap-4");
    			add_location(div3, file$1, 21, 0, 352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(img1, "alt", /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1 && !src_url_equal(img1.src, img1_src_value = `${/*name*/ ctx[0]}.png`)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*data*/ 2 && t2_value !== (t2_value = /*data*/ ctx[1].display + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 2 && t4_value !== (t4_value = /*data*/ ctx[1].title + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:0) {#if name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*name*/ ctx[0] && create_if_block$1(ctx);

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
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MemberButton', slots, []);
    	let { name } = $$props;
    	let { data } = $$props;
    	const hands = ["peace", "wave"];
    	const writable_props = ['name', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MemberButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => window.open(data.link, "_blank");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ name, data, hands });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, data, hands, click_handler];
    }

    class MemberButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MemberButton",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<MemberButton> was created without expected prop 'name'");
    		}

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<MemberButton> was created without expected prop 'data'");
    		}
    	}

    	get name() {
    		throw new Error("<MemberButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MemberButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<MemberButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<MemberButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.3 */

    const { Object: Object_1, window: window_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i][0];
    	child_ctx[18] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (1088:1) {#if hamburgerExpanded}
    function create_if_block_4(ctx) {
    	let div2;
    	let div1;
    	let svg;
    	let defs;
    	let style;
    	let t0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let t1;
    	let div0;
    	let t3;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*links*/ ctx[7];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t0 = text(".navBarLogoSvg{fill:#e8000d;}");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "X";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(style, file, 1090, 111, 22603);
    			add_location(defs, file, 1090, 105, 22597);
    			attr_dev(path0, "class", "navBarLogoSvg");
    			attr_dev(path0, "d", "M126.44,12.56H74.25a2,2,0,0,0-2,2V26a2,2,0,0,0,1.63,2l10.6,2V65.07H43.79V29.8L55.48,28a2,2,0,0,0,1.69-2V14.56a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V26a2,2,0,0,0,1.64,2l10.1,1.83v91.82L1.73,123A2,2,0,0,0,0,125v10.76a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.62-1.41V82.94H84.48v38.51L74,123a2,2,0,0,0-1.71,2v10.76a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V125a2,2,0,0,0-1.73-2l-10.34-1.4V29.77l10.41-1.83a2,2,0,0,0,1.66-2V14.56A2,2,0,0,0,126.44,12.56Zm-2,11.73L114,26.12a2,2,0,0,0-1.65,2v95.25a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.55a2,2,0,0,0,1.71-2V80.94a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.42v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V28.09a2,2,0,0,0-1.65-2L4.33,24.3V16.56H53.17v7.71L41.48,26.12a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V28.26a2,2,0,0,0-1.63-2l-10.6-2V16.56h48.19Z");
    			add_location(path0, file, 1090, 162, 22654);
    			attr_dev(path1, "class", "navBarLogoSvg");
    			attr_dev(path1, "d", "M190.2,88.72c-8.87,0-15.62,1.67-20,5A16,16,0,0,0,163.25,107c0,5.34,1.25,9.6,3.7,12.67a12.82,12.82,0,0,0,10.53,4.82,17.45,17.45,0,0,0,7.39-1.9h0a26.41,26.41,0,0,0,6.7-4.51,2,2,0,0,0,.63-1.46V90.72A2,2,0,0,0,190.2,88.72Zm-2,27a23.29,23.29,0,0,1-5,3.25,13.59,13.59,0,0,1-5.67,1.51,8.89,8.89,0,0,1-7.41-3.32c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.14Z");
    			add_location(path1, file, 1090, 1025, 23517);
    			attr_dev(path2, "class", "navBarLogoSvg");
    			attr_dev(path2, "d", "M223.64,123h-6.48V76.53c0-8.5-1.13-15.36-3.36-20.38a22.64,22.64,0,0,0-11.59-11.61c-5.19-2.39-12.36-3.6-21.3-3.6a68.42,68.42,0,0,0-17.72,2.27,73.21,73.21,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.27,7.27,0,0,1,187,68a25,25,0,0,1,1.17,8.58v1.29c-15.22.31-27.78,3-37.33,8-10.4,5.46-15.67,13.47-15.67,23.79a31.18,31.18,0,0,0,3.94,15.93A26.93,26.93,0,0,0,149.88,136a31.37,31.37,0,0,0,14.88,3.58,34,34,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a99.17,99.17,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V125A2,2,0,0,0,223.64,123Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a95.69,95.69,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.3s-1.36-1.77-1.36-5.67V125a2,2,0,0,0-3.54-1.28A36.68,36.68,0,0,1,179.61,132a30.11,30.11,0,0,1-14.85,3.58,27.37,27.37,0,0,1-13-3.11,23,23,0,0,1-9.16-8.87,27.13,27.13,0,0,1-3.4-13.91c0-8.84,4.42-15.47,13.53-20.25,9.39-4.93,22-7.49,37.49-7.6a2,2,0,0,0,2-2V76.53a28.66,28.66,0,0,0-1.43-10,11.3,11.3,0,0,0-5.71-6.21c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,102.94,102.94,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.12,69.12,0,0,1,13.71-5.07,64.43,64.43,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.52,18.52,0,0,1,9.61,9.59c2,4.51,3,10.82,3,18.76V125a2,2,0,0,0,2,2h6.48Z");
    			add_location(path2, file, 1090, 1454, 23946);
    			attr_dev(path3, "class", "navBarLogoSvg");
    			attr_dev(path3, "d", "M303.41,114.35a2,2,0,0,0-1.23-1.08,2,2,0,0,0-1.63.21,39.82,39.82,0,0,1-21.14,5.9c-5.5,0-9.77-2.59-13.05-7.93-3.43-5.58-5.17-13.81-5.17-24.48,0-11.23,1.36-19.28,4.06-23.95,2.51-4.38,5.87-6.5,10.25-6.5a12.29,12.29,0,0,1,4.54.74,2.14,2.14,0,0,1,1.5,1.61l4.24,18.76a2,2,0,0,0,2,1.55H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37,0-1.61-.3-5.55-1.39a86.84,86.84,0,0,0-10.44-2.59,69.52,69.52,0,0,0-12.17-.93A51.33,51.33,0,0,0,252,47a43.58,43.58,0,0,0-17.25,17.68c-4,7.54-6.11,16.42-6.11,26.39,0,14.55,3.72,26.37,11.07,35.12s18.7,13.36,33.5,13.36A48.85,48.85,0,0,0,294,135.18c6.29-2.91,10.71-5.87,13.53-9a2,2,0,0,0,.33-2.17Zm-11.14,17.2a44.93,44.93,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.93s-10.13-19-10.13-32.55c0-9.3,1.89-17.54,5.63-24.5A39.71,39.71,0,0,1,254,50.47a47.42,47.42,0,0,1,23.49-5.7,65.39,65.39,0,0,1,11.46.87,84.51,84.51,0,0,1,10,2.48c2.06.57,3.42.93,4.34,1.15l-1,25.91H289.33L285.44,58a6.15,6.15,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,25.95,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.84,16.46,9.84A43.81,43.81,0,0,0,300.69,118l2.92,6.38C301.13,126.81,297.33,129.21,292.27,131.55Z");
    			add_location(path3, file, 1090, 2876, 25368);
    			attr_dev(path4, "class", "navBarLogoSvg");
    			attr_dev(path4, "d", "M541.29,123l-7.5-1.72c-.49-.36-1.7-1.5-3.88-5-2-3.25-5-8.44-9-15.43-6-10.52-11.12-19.14-15.31-25.62a80.69,80.69,0,0,0-11-14L522.13,30l13.65-2.17a2,2,0,0,0,1.68-2V14.56a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V26a2,2,0,0,0,1.66,2l9.91,1.72L464.4,73.19V29.91l10.44-2a2,2,0,0,0,1.63-2V14.56a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V26a2,2,0,0,0,1.65,2l10.91,2v91.51L421.83,123a1.54,1.54,0,0,1-3,0l-7.53-1.3L385.63,74.8l16.05-15.31,12.76-2a2,2,0,0,0,1.69-2V45.22a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V55.49a2,2,0,0,0,1.7,2l8.26,1.23L353.5,84.22l.16-2.51V5.42a2,2,0,0,0-.83-1.62L348.11.38A2,2,0,0,0,346.93,0h-.73L313.75,3.93a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V121.8l-7.29,1.2a2,2,0,0,0-1.68,2v10.76a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V125a2,2,0,0,0-1.7-2l-7.76-1.2v-8.64l-.29-7.47,10.65-11.05,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2v10.76a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.77-1.41V96.36l11-12.67c3.62,5.43,8.55,14.65,14.69,27.5,4.56,9,8,15.6,10.33,19.59,2.76,4.81,5.06,6.95,7.44,6.95h32.94a2,2,0,0,0,2-2V125A2,2,0,0,0,541.29,123ZM416.53,133.73H375.19v-7.12l5.73-1.15a2,2,0,0,0,1.4-2.85L366.17,90.32a2,2,0,0,0-3.23-.5l-13.21,13.7a2,2,0,0,0-.56,1.47l.33,8.24V123.5a2,2,0,0,0,1.69,2l7.77,1.2v7H318.11v-7.06l7.29-1.19a2,2,0,0,0,1.68-2V18a2,2,0,0,0-1.63-2L316,14.21V7.69L346.32,4l3.34,2.42V81.53l-.48,7.93a2,2,0,0,0,1.2,2,2,2,0,0,0,2.24-.45l30.66-32.3a2,2,0,0,0,.44-2,2,2,0,0,0-1.59-1.33l-10.36-1.54V47.22h40.36v6.57l-11.69,1.85a2,2,0,0,0-1.07.53L381.76,73a2,2,0,0,0-.38,2.41l26.91,49.09a2,2,0,0,0,1.42,1l6.82,1.18Z");
    			add_location(path4, file, 1090, 4065, 26557);
    			attr_dev(path5, "class", "navBarLogoSvg");
    			attr_dev(path5, "d", "M660.23,12.56H617.82a2,2,0,0,0-2,2V26a2,2,0,0,0,1.68,2l12.35,2V89.09c0,11-1.91,19.66-5.66,25.78-3.61,5.89-9.16,8.75-17,8.75-15.88,0-23.6-11.4-23.6-34.86V30.09l12-2.15a2,2,0,0,0,1.65-2V14.56a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V26a2,2,0,0,0,1.56,2l8.55,1.94V86.48c0,17.88,4.43,31.25,13.16,39.76h0c8.72,8.49,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.55s13.09-21.42,13.09-38.87V29.88l9.18-1.95a2,2,0,0,0,1.59-2V14.56A2,2,0,0,0,660.23,12.56Z");
    			add_location(path5, file, 1090, 5638, 28130);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "viewBox", "0 0 662.23 139.69");
    			add_location(svg, file, 1090, 4, 22496);
    			attr_dev(div0, "class", "font-sans font-bold text-3xl scale-x-125 red cursor-pointer");
    			add_location(div0, file, 1091, 4, 28618);
    			attr_dev(div1, "class", "h-12 flex justify-between items-center my-2");
    			add_location(div1, file, 1089, 3, 22434);
    			attr_dev(div2, "class", "fixed z-20 top-0 left-0 w-screen h-screen flex flex-col p-4 gap-2 justify-between bg-[#f2f2dd]");
    			add_location(div2, file, 1088, 2, 22263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t0);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*click_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*links*/ 128) {
    				each_value_4 = /*links*/ ctx[7];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(1088:1) {#if hamburgerExpanded}",
    		ctx
    	});

    	return block;
    }

    // (1094:3) {#each links as link}
    function create_each_block_4(ctx) {
    	let div;
    	let t_value = /*link*/ ctx[27].display + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "hover:bg-[#e8000d] hover:text-[#f2f2dd] cursor-pointer flex-grow flex justify-center items-center");
    			add_location(div, file, 1094, 4, 28738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*link*/ ctx[27].action, false, false, false);
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
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(1094:3) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    // (1101:1) {#if scrollY >= innerHeight && !hamburgerExpanded}
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let svg;
    	let defs;
    	let style;
    	let t0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*smallScreen*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t0 = text(".navBarLogoSvg{fill:#e8000d;}");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t1 = space();
    			if_block.c();
    			add_location(style, file, 1103, 160, 29290);
    			add_location(defs, file, 1103, 154, 29284);
    			attr_dev(path0, "class", "navBarLogoSvg");
    			attr_dev(path0, "d", "M126.44,12.56H74.25a2,2,0,0,0-2,2V26a2,2,0,0,0,1.63,2l10.6,2V65.07H43.79V29.8L55.48,28a2,2,0,0,0,1.69-2V14.56a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V26a2,2,0,0,0,1.64,2l10.1,1.83v91.82L1.73,123A2,2,0,0,0,0,125v10.76a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.62-1.41V82.94H84.48v38.51L74,123a2,2,0,0,0-1.71,2v10.76a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V125a2,2,0,0,0-1.73-2l-10.34-1.4V29.77l10.41-1.83a2,2,0,0,0,1.66-2V14.56A2,2,0,0,0,126.44,12.56Zm-2,11.73L114,26.12a2,2,0,0,0-1.65,2v95.25a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.55a2,2,0,0,0,1.71-2V80.94a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.42v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V28.09a2,2,0,0,0-1.65-2L4.33,24.3V16.56H53.17v7.71L41.48,26.12a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V28.26a2,2,0,0,0-1.63-2l-10.6-2V16.56h48.19Z");
    			add_location(path0, file, 1103, 211, 29341);
    			attr_dev(path1, "class", "navBarLogoSvg");
    			attr_dev(path1, "d", "M190.2,88.72c-8.87,0-15.62,1.67-20,5A16,16,0,0,0,163.25,107c0,5.34,1.25,9.6,3.7,12.67a12.82,12.82,0,0,0,10.53,4.82,17.45,17.45,0,0,0,7.39-1.9h0a26.41,26.41,0,0,0,6.7-4.51,2,2,0,0,0,.63-1.46V90.72A2,2,0,0,0,190.2,88.72Zm-2,27a23.29,23.29,0,0,1-5,3.25,13.59,13.59,0,0,1-5.67,1.51,8.89,8.89,0,0,1-7.41-3.32c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.14Z");
    			add_location(path1, file, 1103, 1074, 30204);
    			attr_dev(path2, "class", "navBarLogoSvg");
    			attr_dev(path2, "d", "M223.64,123h-6.48V76.53c0-8.5-1.13-15.36-3.36-20.38a22.64,22.64,0,0,0-11.59-11.61c-5.19-2.39-12.36-3.6-21.3-3.6a68.42,68.42,0,0,0-17.72,2.27,73.21,73.21,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.27,7.27,0,0,1,187,68a25,25,0,0,1,1.17,8.58v1.29c-15.22.31-27.78,3-37.33,8-10.4,5.46-15.67,13.47-15.67,23.79a31.18,31.18,0,0,0,3.94,15.93A26.93,26.93,0,0,0,149.88,136a31.37,31.37,0,0,0,14.88,3.58,34,34,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a99.17,99.17,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V125A2,2,0,0,0,223.64,123Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a95.69,95.69,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.3s-1.36-1.77-1.36-5.67V125a2,2,0,0,0-3.54-1.28A36.68,36.68,0,0,1,179.61,132a30.11,30.11,0,0,1-14.85,3.58,27.37,27.37,0,0,1-13-3.11,23,23,0,0,1-9.16-8.87,27.13,27.13,0,0,1-3.4-13.91c0-8.84,4.42-15.47,13.53-20.25,9.39-4.93,22-7.49,37.49-7.6a2,2,0,0,0,2-2V76.53a28.66,28.66,0,0,0-1.43-10,11.3,11.3,0,0,0-5.71-6.21c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,102.94,102.94,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.12,69.12,0,0,1,13.71-5.07,64.43,64.43,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.52,18.52,0,0,1,9.61,9.59c2,4.51,3,10.82,3,18.76V125a2,2,0,0,0,2,2h6.48Z");
    			add_location(path2, file, 1103, 1503, 30633);
    			attr_dev(path3, "class", "navBarLogoSvg");
    			attr_dev(path3, "d", "M303.41,114.35a2,2,0,0,0-1.23-1.08,2,2,0,0,0-1.63.21,39.82,39.82,0,0,1-21.14,5.9c-5.5,0-9.77-2.59-13.05-7.93-3.43-5.58-5.17-13.81-5.17-24.48,0-11.23,1.36-19.28,4.06-23.95,2.51-4.38,5.87-6.5,10.25-6.5a12.29,12.29,0,0,1,4.54.74,2.14,2.14,0,0,1,1.5,1.61l4.24,18.76a2,2,0,0,0,2,1.55H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37,0-1.61-.3-5.55-1.39a86.84,86.84,0,0,0-10.44-2.59,69.52,69.52,0,0,0-12.17-.93A51.33,51.33,0,0,0,252,47a43.58,43.58,0,0,0-17.25,17.68c-4,7.54-6.11,16.42-6.11,26.39,0,14.55,3.72,26.37,11.07,35.12s18.7,13.36,33.5,13.36A48.85,48.85,0,0,0,294,135.18c6.29-2.91,10.71-5.87,13.53-9a2,2,0,0,0,.33-2.17Zm-11.14,17.2a44.93,44.93,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.93s-10.13-19-10.13-32.55c0-9.3,1.89-17.54,5.63-24.5A39.71,39.71,0,0,1,254,50.47a47.42,47.42,0,0,1,23.49-5.7,65.39,65.39,0,0,1,11.46.87,84.51,84.51,0,0,1,10,2.48c2.06.57,3.42.93,4.34,1.15l-1,25.91H289.33L285.44,58a6.15,6.15,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,25.95,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.84,16.46,9.84A43.81,43.81,0,0,0,300.69,118l2.92,6.38C301.13,126.81,297.33,129.21,292.27,131.55Z");
    			add_location(path3, file, 1103, 2925, 32055);
    			attr_dev(path4, "class", "navBarLogoSvg");
    			attr_dev(path4, "d", "M541.29,123l-7.5-1.72c-.49-.36-1.7-1.5-3.88-5-2-3.25-5-8.44-9-15.43-6-10.52-11.12-19.14-15.31-25.62a80.69,80.69,0,0,0-11-14L522.13,30l13.65-2.17a2,2,0,0,0,1.68-2V14.56a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V26a2,2,0,0,0,1.66,2l9.91,1.72L464.4,73.19V29.91l10.44-2a2,2,0,0,0,1.63-2V14.56a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V26a2,2,0,0,0,1.65,2l10.91,2v91.51L421.83,123a1.54,1.54,0,0,1-3,0l-7.53-1.3L385.63,74.8l16.05-15.31,12.76-2a2,2,0,0,0,1.69-2V45.22a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V55.49a2,2,0,0,0,1.7,2l8.26,1.23L353.5,84.22l.16-2.51V5.42a2,2,0,0,0-.83-1.62L348.11.38A2,2,0,0,0,346.93,0h-.73L313.75,3.93a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V121.8l-7.29,1.2a2,2,0,0,0-1.68,2v10.76a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V125a2,2,0,0,0-1.7-2l-7.76-1.2v-8.64l-.29-7.47,10.65-11.05,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2v10.76a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.77-1.41V96.36l11-12.67c3.62,5.43,8.55,14.65,14.69,27.5,4.56,9,8,15.6,10.33,19.59,2.76,4.81,5.06,6.95,7.44,6.95h32.94a2,2,0,0,0,2-2V125A2,2,0,0,0,541.29,123ZM416.53,133.73H375.19v-7.12l5.73-1.15a2,2,0,0,0,1.4-2.85L366.17,90.32a2,2,0,0,0-3.23-.5l-13.21,13.7a2,2,0,0,0-.56,1.47l.33,8.24V123.5a2,2,0,0,0,1.69,2l7.77,1.2v7H318.11v-7.06l7.29-1.19a2,2,0,0,0,1.68-2V18a2,2,0,0,0-1.63-2L316,14.21V7.69L346.32,4l3.34,2.42V81.53l-.48,7.93a2,2,0,0,0,1.2,2,2,2,0,0,0,2.24-.45l30.66-32.3a2,2,0,0,0,.44-2,2,2,0,0,0-1.59-1.33l-10.36-1.54V47.22h40.36v6.57l-11.69,1.85a2,2,0,0,0-1.07.53L381.76,73a2,2,0,0,0-.38,2.41l26.91,49.09a2,2,0,0,0,1.42,1l6.82,1.18Z");
    			add_location(path4, file, 1103, 4114, 33244);
    			attr_dev(path5, "class", "navBarLogoSvg");
    			attr_dev(path5, "d", "M660.23,12.56H617.82a2,2,0,0,0-2,2V26a2,2,0,0,0,1.68,2l12.35,2V89.09c0,11-1.91,19.66-5.66,25.78-3.61,5.89-9.16,8.75-17,8.75-15.88,0-23.6-11.4-23.6-34.86V30.09l12-2.15a2,2,0,0,0,1.65-2V14.56a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V26a2,2,0,0,0,1.56,2l8.55,1.94V86.48c0,17.88,4.43,31.25,13.16,39.76h0c8.72,8.49,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.55s13.09-21.42,13.09-38.87V29.88l9.18-1.95a2,2,0,0,0,1.59-2V14.56A2,2,0,0,0,660.23,12.56Z");
    			add_location(path5, file, 1103, 5687, 34817);
    			attr_dev(svg, "class", "link");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "viewBox", "0 0 662.23 139.69");
    			add_location(svg, file, 1103, 4, 29134);
    			attr_dev(div0, "id", "navBarLogo");
    			add_location(div0, file, 1102, 3, 29108);
    			attr_dev(div1, "id", "navbar");
    			add_location(div1, file, 1101, 2, 29051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t0);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(div1, t1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler_1*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
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
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 200 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 200 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(1101:1) {#if scrollY >= innerHeight && !hamburgerExpanded}",
    		ctx
    	});

    	return block;
    }

    // (1116:3) {:else}
    function create_else_block_1(ctx) {
    	let div1;
    	let div0;
    	let svg;
    	let defs;
    	let style;
    	let t;
    	let line0;
    	let line1;
    	let line2;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t = text(".hamburgerMenuSvg{fill:none;stroke:#e8000d;stroke-linecap:round;stroke-miterlimit:10;stroke-width:4px;}");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			add_location(style, file, 1118, 105, 35919);
    			add_location(defs, file, 1118, 99, 35913);
    			attr_dev(line0, "class", "hamburgerMenuSvg");
    			attr_dev(line0, "x1", "6.36");
    			attr_dev(line0, "y1", "9.61");
    			attr_dev(line0, "x2", "47.33");
    			attr_dev(line0, "y2", "9.61");
    			add_location(line0, file, 1118, 230, 36044);
    			attr_dev(line1, "class", "hamburgerMenuSvg");
    			attr_dev(line1, "x1", "6.52");
    			attr_dev(line1, "y1", "27");
    			attr_dev(line1, "x2", "47.48");
    			attr_dev(line1, "y2", "27");
    			add_location(line1, file, 1118, 303, 36117);
    			attr_dev(line2, "class", "hamburgerMenuSvg");
    			attr_dev(line2, "x1", "6.67");
    			attr_dev(line2, "y1", "44.39");
    			attr_dev(line2, "x2", "47.64");
    			attr_dev(line2, "y2", "44.39");
    			add_location(line2, file, 1118, 372, 36186);
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 54 54");
    			add_location(svg, file, 1118, 6, 35820);
    			attr_dev(div0, "class", "hamburgerMenu cursor-pointer");
    			add_location(div0, file, 1117, 5, 35715);
    			attr_dev(div1, "class", "linkCont");
    			add_location(div1, file, 1116, 4, 35672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler_2*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(1116:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1106:3) {#if !smallScreen}
    function create_if_block_2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value_3 = /*links*/ ctx[7];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "linkCont");
    			add_location(div, file, 1106, 4, 35337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*links*/ 128) {
    				each_value_3 = /*links*/ ctx[7];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(1106:3) {#if !smallScreen}",
    		ctx
    	});

    	return block;
    }

    // (1111:6) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t_value = /*link*/ ctx[27].display + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "link");
    			add_location(div, file, 1111, 7, 35559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*link*/ ctx[27].action, false, false, false);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(1111:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1109:6) {#if link.display == "register now!"}
    function create_if_block_3(ctx) {
    	let div;
    	let t_value = /*link*/ ctx[27].display + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "link");
    			set_style(div, "color", "#0051ba");
    			add_location(div, file, 1109, 7, 35453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*link*/ ctx[27].action, false, false, false);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(1109:6) {#if link.display == \\\"register now!\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1108:5) {#each links as link}
    function create_each_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*link*/ ctx[27].display == "register now!") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(1108:5) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    // (1146:4) {#if !smallScreen}
    function create_if_block(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let div4;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t2 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t3 = space();
    			div4 = element("div");
    			img4 = element("img");
    			attr_dev(img0, "id", "mascot-filled");
    			if (!src_url_equal(img0.src, img0_src_value = "mascot-filled.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "mascot");
    			add_location(img0, file, 1147, 6, 44964);
    			attr_dev(div0, "class", "pattern-image");
    			add_location(div0, file, 1146, 5, 44930);
    			attr_dev(img1, "id", "mascot-unfilled");
    			if (!src_url_equal(img1.src, img1_src_value = "mascot-unfilled.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "mascot");
    			add_location(img1, file, 1150, 6, 45077);
    			attr_dev(div1, "class", "pattern-image");
    			add_location(div1, file, 1149, 5, 45043);
    			attr_dev(img2, "id", "mascot-filled");
    			if (!src_url_equal(img2.src, img2_src_value = "mascot-filled.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "mascot");
    			add_location(img2, file, 1153, 6, 45194);
    			attr_dev(div2, "class", "pattern-image");
    			add_location(div2, file, 1152, 5, 45160);
    			attr_dev(img3, "id", "mascot-unfilled");
    			if (!src_url_equal(img3.src, img3_src_value = "mascot-unfilled.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "mascot");
    			add_location(img3, file, 1156, 6, 45307);
    			attr_dev(div3, "class", "pattern-image");
    			add_location(div3, file, 1155, 5, 45273);
    			attr_dev(img4, "id", "mascot-filled");
    			if (!src_url_equal(img4.src, img4_src_value = "mascot-filled.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "mascot");
    			add_location(img4, file, 1159, 6, 45424);
    			attr_dev(div4, "class", "pattern-image");
    			add_location(div4, file, 1158, 5, 45390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img2);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img3);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, img4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(1146:4) {#if !smallScreen}",
    		ctx
    	});

    	return block;
    }

    // (1165:4) <RegisterButton>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("learn more");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(1165:4) <RegisterButton>",
    		ctx
    	});

    	return block;
    }

    // (1182:5) <RegisterButton>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("register now");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(1182:5) <RegisterButton>",
    		ctx
    	});

    	return block;
    }

    // (1197:5) {#each Object.keys(schedule) as day}
    function create_each_block_2(ctx) {
    	let div;
    	let t_value = /*day*/ ctx[24] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[16](/*day*/ ctx[24]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "border-[3px] border-b-0 border-[#e8000d] rounded-t-lg py-2 px-4 cursor-pointer");
    			toggle_class(div, "selected", /*selectedDay*/ ctx[5] == /*day*/ ctx[24]);
    			add_location(div, file, 1197, 6, 46771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*selectedDay, schedule*/ 544) {
    				toggle_class(div, "selected", /*selectedDay*/ ctx[5] == /*day*/ ctx[24]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(1197:5) {#each Object.keys(schedule) as day}",
    		ctx
    	});

    	return block;
    }

    // (1205:5) {#each schedule[selectedDay] as event}
    function create_each_block_1(ctx) {
    	let div0;
    	let t0_value = /*event*/ ctx[21].time + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*event*/ ctx[21].event + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*event*/ ctx[21].location + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			add_location(div0, file, 1205, 6, 47243);
    			add_location(div1, file, 1206, 6, 47273);
    			add_location(div2, file, 1207, 6, 47304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDay*/ 32 && t0_value !== (t0_value = /*event*/ ctx[21].time + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*selectedDay*/ 32 && t2_value !== (t2_value = /*event*/ ctx[21].event + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*selectedDay*/ 32 && t4_value !== (t4_value = /*event*/ ctx[21].location + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(1205:5) {#each schedule[selectedDay] as event}",
    		ctx
    	});

    	return block;
    }

    // (1338:3) {#each Object.entries(members) as [name, data]}
    function create_each_block(ctx) {
    	let memberbutton;
    	let current;

    	memberbutton = new MemberButton({
    			props: {
    				name: /*name*/ ctx[17],
    				data: /*data*/ ctx[18]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(memberbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(memberbutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(memberbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(memberbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(memberbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(1338:3) {#each Object.entries(members) as [name, data]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let main;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div11;
    	let div2;
    	let svg;
    	let defs;
    	let style;
    	let t4;
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
    	let t5;
    	let div3;
    	let t7;
    	let div10;
    	let div8;
    	let div4;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div6;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let div7;
    	let img3;
    	let img3_src_value;
    	let t11;
    	let t12;
    	let div9;
    	let registerbutton0;
    	let t13;
    	let div16;
    	let div12;
    	let t15;
    	let br0;
    	let t16;
    	let div14;
    	let t17;
    	let br1;
    	let t18;
    	let br2;
    	let t19;
    	let a;
    	let div13;
    	let registerbutton1;
    	let t20;
    	let div15;
    	let img4;
    	let img4_src_value;
    	let t21;
    	let div33;
    	let div17;
    	let t23;
    	let div32;
    	let div20;
    	let div18;
    	let t24;
    	let div19;
    	let i0;
    	let t26;
    	let i1;
    	let t28;
    	let i2;
    	let t30;
    	let t31;
    	let div31;
    	let div21;
    	let t33;
    	let div22;
    	let t35;
    	let div23;
    	let t37;
    	let div24;
    	let t39;
    	let div25;
    	let t40;
    	let div26;
    	let t41;
    	let div27;
    	let t42;
    	let div28;
    	let t43;
    	let div29;
    	let t44;
    	let div30;
    	let t45;
    	let div46;
    	let div34;
    	let t47;
    	let br3;
    	let t48;
    	let div45;
    	let button0;
    	let t50;
    	let div35;
    	let p0;
    	let t52;
    	let button1;
    	let t54;
    	let div36;
    	let p1;
    	let t56;
    	let button2;
    	let t58;
    	let div37;
    	let p2;
    	let t60;
    	let button3;
    	let t62;
    	let div38;
    	let p3;
    	let t64;
    	let button4;
    	let t66;
    	let div39;
    	let p4;
    	let t68;
    	let button5;
    	let t70;
    	let div40;
    	let p5;
    	let b0;
    	let t72;
    	let br4;
    	let t73;
    	let b1;
    	let t75;
    	let br5;
    	let t76;
    	let b2;
    	let t78;
    	let br6;
    	let t79;
    	let b3;
    	let t81;
    	let br7;
    	let t82;
    	let button6;
    	let t84;
    	let div41;
    	let p6;
    	let t86;
    	let button7;
    	let t88;
    	let div42;
    	let p7;
    	let t90;
    	let button8;
    	let t92;
    	let div43;
    	let p8;
    	let t94;
    	let button9;
    	let t96;
    	let div44;
    	let p9;
    	let t98;
    	let div57;
    	let div47;
    	let t100;
    	let div56;
    	let ul;
    	let li0;
    	let t101;
    	let br8;
    	let t102;
    	let div49;
    	let div48;
    	let p10;
    	let t104;
    	let br9;
    	let t105;
    	let br10;
    	let t106;
    	let li1;
    	let t107;
    	let br11;
    	let t108;
    	let div51;
    	let div50;
    	let p11;
    	let t110;
    	let br12;
    	let t111;
    	let br13;
    	let t112;
    	let li2;
    	let t113;
    	let br14;
    	let t114;
    	let div53;
    	let div52;
    	let p12;
    	let t116;
    	let br15;
    	let t117;
    	let br16;
    	let t118;
    	let li3;
    	let t119;
    	let br17;
    	let t120;
    	let div55;
    	let div54;
    	let p13;
    	let t122;
    	let div62;
    	let div58;
    	let t124;
    	let br18;
    	let t125;
    	let br19;
    	let t126;
    	let br20;
    	let t127;
    	let br21;
    	let t128;
    	let div59;
    	let t129;
    	let br22;
    	let t130;
    	let br23;
    	let t131;
    	let br24;
    	let t132;
    	let br25;
    	let t133;
    	let div61;
    	let heart;
    	let t134;
    	let div60;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[10]);
    	add_render_callback(/*onwindowscroll*/ ctx[11]);
    	let if_block0 = /*hamburgerExpanded*/ ctx[0] && create_if_block_4(ctx);
    	let if_block1 = /*scrollY*/ ctx[4] >= /*innerHeight*/ ctx[3] && !/*hamburgerExpanded*/ ctx[0] && create_if_block_1(ctx);
    	let if_block2 = !/*smallScreen*/ ctx[2] && create_if_block(ctx);

    	registerbutton0 = new RegisterButton({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	registerbutton1 = new RegisterButton({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_2 = Object.keys(/*schedule*/ ctx[9]);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*schedule*/ ctx[9][/*selectedDay*/ ctx[5]];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Object.entries(/*members*/ ctx[6]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	heart = new Heart({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div11 = element("div");
    			div2 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t4 = text(".mainLogoSvg{fill:#e8000d;}");
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
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "April 8 - 10";
    			t7 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div4 = element("div");
    			img0 = element("img");
    			t8 = space();
    			div5 = element("div");
    			img1 = element("img");
    			t9 = space();
    			div6 = element("div");
    			img2 = element("img");
    			t10 = space();
    			div7 = element("div");
    			img3 = element("img");
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();
    			div9 = element("div");
    			create_component(registerbutton0.$$.fragment);
    			t13 = space();
    			div16 = element("div");
    			div12 = element("div");
    			div12.textContent = "What is HackKU?";
    			t15 = space();
    			br0 = element("br");
    			t16 = space();
    			div14 = element("div");
    			t17 = text("HackKU is an annual 36-hour hackathon hosted by the University of Kansas, where students can have the opportunity to innovate new ideas, discover different paths, and push the boundaries of technology. Work with teams of up to four people to create unique solutions to real-world problems. Projects can range from web applications and video games to drones and fitness devices.\n\t\t\t");
    			br1 = element("br");
    			t18 = space();
    			br2 = element("br");
    			t19 = space();
    			a = element("a");
    			div13 = element("div");
    			create_component(registerbutton1.$$.fragment);
    			t20 = space();
    			div15 = element("div");
    			img4 = element("img");
    			t21 = space();
    			div33 = element("div");
    			div17 = element("div");
    			div17.textContent = "Schedule";
    			t23 = space();
    			div32 = element("div");
    			div20 = element("div");
    			div18 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t24 = space();
    			div19 = element("div");
    			i0 = element("i");
    			i0.textContent = "Time";
    			t26 = space();
    			i1 = element("i");
    			i1.textContent = "Event";
    			t28 = space();
    			i2 = element("i");
    			i2.textContent = "Location";
    			t30 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t31 = space();
    			div31 = element("div");
    			div21 = element("div");
    			div21.textContent = "Housekeeping";
    			t33 = space();
    			div22 = element("div");
    			div22.textContent = "2/16 registration opens";
    			t35 = space();
    			div23 = element("div");
    			div23.textContent = "3/16 early registration closes";
    			t37 = space();
    			div24 = element("div");
    			div24.textContent = "4/6 late registration closes";
    			t39 = space();
    			div25 = element("div");
    			t40 = space();
    			div26 = element("div");
    			t41 = space();
    			div27 = element("div");
    			t42 = space();
    			div28 = element("div");
    			t43 = space();
    			div29 = element("div");
    			t44 = space();
    			div30 = element("div");
    			t45 = space();
    			div46 = element("div");
    			div34 = element("div");
    			div34.textContent = "Question & Answers";
    			t47 = space();
    			br3 = element("br");
    			t48 = space();
    			div45 = element("div");
    			button0 = element("button");
    			button0.textContent = "What is HackKU?";
    			t50 = space();
    			div35 = element("div");
    			p0 = element("p");
    			p0.textContent = "The annual 36-hour hackathon hosted by students at the University of Kansas.";
    			t52 = space();
    			button1 = element("button");
    			button1.textContent = "When is HackKU?";
    			t54 = space();
    			div36 = element("div");
    			p1 = element("p");
    			p1.textContent = "HackKU will run from 5:00 pm April 8 until 12:00 pm April 10 in the Engineering Complex at the University of Kansas.";
    			t56 = space();
    			button2 = element("button");
    			button2.textContent = "Who can participate in HackKU?";
    			t58 = space();
    			div37 = element("div");
    			p2 = element("p");
    			p2.textContent = "HackKU is open to all college and university students, both undergraduate and graduate. Unfortunately, high school students may not participate in HackKU.";
    			t60 = space();
    			button3 = element("button");
    			button3.textContent = "What is the cost?";
    			t62 = space();
    			div38 = element("div");
    			p3 = element("p");
    			p3.textContent = "Nothing! It’s free to participate. Meals, drinks, and snacks are provided.";
    			t64 = space();
    			button4 = element("button");
    			button4.textContent = "Is coding experience required?";
    			t66 = space();
    			div39 = element("div");
    			p4 = element("p");
    			p4.textContent = "No! All students who want to learn about coding, technology, design, and building new things are welcome. If you’re a beginner, this is the perfect opportunity to learn something new!";
    			t68 = space();
    			button5 = element("button");
    			button5.textContent = "What should I bring?";
    			t70 = space();
    			div40 = element("div");
    			p5 = element("p");
    			b0 = element("b");
    			b0.textContent = "Hardware:";
    			t72 = text(" Bring your hacking device and any accessories it requires.");
    			br4 = element("br");
    			t73 = space();
    			b1 = element("b");
    			b1.textContent = "Sleeping:";
    			t75 = text(" Feel free to bring a sleeping bag, pillows, and/or blankets.");
    			br5 = element("br");
    			t76 = space();
    			b2 = element("b");
    			b2.textContent = "Personal Hygiene:";
    			t78 = text(" Showers will be provided. Bring a bath towel and personal hygiene products.");
    			br6 = element("br");
    			t79 = space();
    			b3 = element("b");
    			b3.textContent = "Photo ID:";
    			t81 = text(" You must bring a photo ID with you to check in, and the name on the ID must match the name entered during registration.");
    			br7 = element("br");
    			t82 = space();
    			button6 = element("button");
    			button6.textContent = "Are meals provided?";
    			t84 = space();
    			div41 = element("div");
    			p6 = element("p");
    			p6.textContent = "Yes. You will be able to access food with a badge and ticket given during registration.";
    			t86 = space();
    			button7 = element("button");
    			button7.textContent = "What is the wifi?";
    			t88 = space();
    			div42 = element("div");
    			p7 = element("p");
    			p7.textContent = "You will be able to log in to KU GUEST.";
    			t90 = space();
    			button8 = element("button");
    			button8.textContent = "I’m stuck. How do I get help?";
    			t92 = space();
    			div43 = element("div");
    			p8 = element("p");
    			p8.textContent = "There will be a lot of different ways to get help. We will have mentors, both students, and engineers from industry, in the #mentoring channel on Discord";
    			t94 = space();
    			button9 = element("button");
    			button9.textContent = "What if I need to contact the organizers?";
    			t96 = space();
    			div44 = element("div");
    			p9 = element("p");
    			p9.textContent = "Message us in the #ask-the-organizers channel! There will always be a couple of organizers online that will be able to answer questions. For urgent event-related problems, please go to LEEP2 1415A, or reach out to any HackKU organizer.";
    			t98 = space();
    			div57 = element("div");
    			div47 = element("div");
    			div47.textContent = "Sponsors";
    			t100 = space();
    			div56 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			t101 = text("Peta Tier\n\t\t\t\t\t");
    			br8 = element("br");
    			t102 = space();
    			div49 = element("div");
    			div48 = element("div");
    			p10 = element("p");
    			p10.textContent = "Coming Soon!";
    			t104 = space();
    			br9 = element("br");
    			t105 = space();
    			br10 = element("br");
    			t106 = space();
    			li1 = element("li");
    			t107 = text("Tera Tier\n\t\t\t\t\t");
    			br11 = element("br");
    			t108 = space();
    			div51 = element("div");
    			div50 = element("div");
    			p11 = element("p");
    			p11.textContent = "Coming Soon!";
    			t110 = space();
    			br12 = element("br");
    			t111 = space();
    			br13 = element("br");
    			t112 = space();
    			li2 = element("li");
    			t113 = text("Giga Tier\n\t\t\t\t\t");
    			br14 = element("br");
    			t114 = space();
    			div53 = element("div");
    			div52 = element("div");
    			p12 = element("p");
    			p12.textContent = "Coming soon!";
    			t116 = space();
    			br15 = element("br");
    			t117 = space();
    			br16 = element("br");
    			t118 = space();
    			li3 = element("li");
    			t119 = text("Mega Tier\n\t\t\t\t\t");
    			br17 = element("br");
    			t120 = space();
    			div55 = element("div");
    			div54 = element("div");
    			p13 = element("p");
    			p13.textContent = "Coming Soon!";
    			t122 = space();
    			div62 = element("div");
    			div58 = element("div");
    			div58.textContent = "Meet the Team";
    			t124 = space();
    			br18 = element("br");
    			t125 = space();
    			br19 = element("br");
    			t126 = space();
    			br20 = element("br");
    			t127 = space();
    			br21 = element("br");
    			t128 = space();
    			div59 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t129 = space();
    			br22 = element("br");
    			t130 = space();
    			br23 = element("br");
    			t131 = space();
    			br24 = element("br");
    			t132 = space();
    			br25 = element("br");
    			t133 = space();
    			div61 = element("div");
    			create_component(heart.$$.fragment);
    			t134 = space();
    			div60 = element("div");
    			div60.textContent = "made with love by the HackKU team";
    			attr_dev(div0, "class", "z-20");
    			attr_dev(div0, "id", "blueChecker");
    			add_location(div0, file, 1098, 1, 28921);
    			attr_dev(div1, "class", "z-20");
    			attr_dev(div1, "id", "redChecker");
    			add_location(div1, file, 1099, 1, 28960);
    			add_location(style, file, 1127, 110, 36482);
    			add_location(defs, file, 1127, 104, 36476);
    			attr_dev(path0, "class", "mainLogoSvg");
    			attr_dev(path0, "d", "M126.44,23.32H74.25a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.63,2l10.6,2V75.84H43.79V40.57l11.69-1.86a2,2,0,0,0,1.69-2V25.32a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.64,2l10.1,1.82v91.82l-10.34,1.4a2,2,0,0,0-1.73,2V146.5a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.76-2l-11.62-1.42V93.7H84.48v38.51L74,133.75a2,2,0,0,0-1.71,2V146.5a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.73-2l-10.34-1.4V40.54l10.41-1.83a2,2,0,0,0,1.66-2V25.32A2,2,0,0,0,126.44,23.32Zm-2,11.74L114,36.89a2,2,0,0,0-1.65,2V134.1a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.54a2,2,0,0,0,1.71-2V91.7a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.41v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V38.86a2,2,0,0,0-1.65-2L4.33,35.07V27.32H53.17V35L41.48,36.88a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V39a2,2,0,0,0-1.63-2l-10.6-2V27.32h48.19Z");
    			add_location(path0, file, 1127, 159, 36531);
    			attr_dev(path1, "class", "mainLogoSvg");
    			attr_dev(path1, "d", "M190.2,99.48c-8.87,0-15.62,1.67-20,5a16,16,0,0,0-6.92,13.34c0,5.34,1.25,9.61,3.7,12.67a12.83,12.83,0,0,0,10.53,4.83,17.32,17.32,0,0,0,7.39-1.91h0a26.65,26.65,0,0,0,6.7-4.5,2,2,0,0,0,.63-1.46V101.48A2,2,0,0,0,190.2,99.48Zm-2,27a22.56,22.56,0,0,1-5,3.25,13.47,13.47,0,0,1-5.67,1.52,8.9,8.9,0,0,1-7.41-3.33c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.13Z");
    			add_location(path1, file, 1127, 1035, 37407);
    			attr_dev(path2, "class", "mainLogoSvg");
    			attr_dev(path2, "d", "M223.64,133.73h-6.48V87.3c0-8.51-1.13-15.36-3.36-20.39a22.62,22.62,0,0,0-11.59-11.6c-5.19-2.4-12.36-3.61-21.3-3.61A68.42,68.42,0,0,0,163.19,54a73.84,73.84,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.33,7.33,0,0,1,187,78.71a25.11,25.11,0,0,1,1.17,8.59v1.28c-15.22.32-27.78,3-37.33,8-10.4,5.46-15.67,13.46-15.67,23.78a31.18,31.18,0,0,0,3.94,15.93,26.93,26.93,0,0,0,10.74,10.38,31.25,31.25,0,0,0,14.88,3.58,33.9,33.9,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a97.05,97.05,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V135.73A2,2,0,0,0,223.64,133.73Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a93.54,93.54,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.29s-1.36-1.78-1.36-5.68v-3.75a2,2,0,0,0-2-2,2,2,0,0,0-1.54.72,36.68,36.68,0,0,1-10.36,8.26,30,30,0,0,1-14.85,3.58,27.26,27.26,0,0,1-13-3.11,23,23,0,0,1-9.16-8.86,27.19,27.19,0,0,1-3.4-13.92c0-8.84,4.42-15.46,13.53-20.24,9.39-4.94,22-7.5,37.49-7.6a2,2,0,0,0,2-2V87.3a28.63,28.63,0,0,0-1.43-10,11.28,11.28,0,0,0-5.71-6.22c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,104.93,104.93,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.75,69.75,0,0,1,13.71-5.07,64.86,64.86,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.5,18.5,0,0,1,9.61,9.6c2,4.5,3,10.81,3,18.76v48.43a2,2,0,0,0,2,2h6.48Z");
    			add_location(path2, file, 1127, 1462, 37834);
    			attr_dev(path3, "class", "mainLogoSvg");
    			attr_dev(path3, "d", "M303.41,125.12a2,2,0,0,0-2.86-.88,39.83,39.83,0,0,1-21.14,5.91c-5.5,0-9.77-2.6-13.05-7.94-3.43-5.57-5.17-13.81-5.17-24.48,0-11.22,1.36-19.28,4.06-24,2.51-4.38,5.87-6.5,10.25-6.5A12.08,12.08,0,0,1,280,68a2.12,2.12,0,0,1,1.5,1.6l4.24,18.76a2,2,0,0,0,2,1.56H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37-.05-1.61-.31-5.55-1.4a88.78,88.78,0,0,0-10.44-2.59,70.59,70.59,0,0,0-12.17-.92A51.23,51.23,0,0,0,252,57.75a43.5,43.5,0,0,0-17.25,17.67c-4,7.55-6.11,16.43-6.11,26.39,0,14.56,3.72,26.37,11.07,35.13s18.7,13.35,33.5,13.35A49,49,0,0,0,294,146c6.29-2.92,10.71-5.88,13.53-9a2,2,0,0,0,.33-2.16Zm-11.14,17.2a45.07,45.07,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.92s-10.13-19-10.13-32.56c0-9.3,1.89-17.54,5.63-24.49A39.67,39.67,0,0,1,254,61.23a47.41,47.41,0,0,1,23.49-5.69,66.47,66.47,0,0,1,11.46.86,82.71,82.71,0,0,1,10,2.49c2.06.57,3.42.92,4.34,1.15l-1,25.91H289.33l-3.89-17.21a6.19,6.19,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,26,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.85,16.46,9.85a43.82,43.82,0,0,0,21.28-5.37l2.92,6.39C301.13,137.57,297.33,140,292.27,142.32Z");
    			add_location(path3, file, 1127, 2911, 39283);
    			attr_dev(path4, "class", "mainLogoSvg");
    			attr_dev(path4, "d", "M541.29,133.78l-7.5-1.72c-.49-.35-1.7-1.49-3.88-5-2-3.26-5-8.45-9-15.43-6-10.53-11.12-19.15-15.31-25.63a81.08,81.08,0,0,0-11-14l27.59-31.27,13.65-2.17a2,2,0,0,0,1.68-2V25.32a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.66,2l9.91,1.71L464.4,84V40.68l10.44-2a2,2,0,0,0,1.63-2V25.32a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.65,2l10.91,2v91.52l-10.84,1.54a1.54,1.54,0,0,1-3,0l-7.53-1.3-25.71-46.9,16.05-15.3,12.76-2a2,2,0,0,0,1.69-2V56a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V66.26a2,2,0,0,0,1.7,2l8.26,1.22L353.5,95l.16-2.51V16.19a2,2,0,0,0-.83-1.62l-4.72-3.43a2.1,2.1,0,0,0-1.18-.38h-.49l-.24,0-32.45,3.91a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V132.57l-7.29,1.19a2,2,0,0,0-1.68,2V146.5a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.7-2l-7.76-1.21v-8.64l-.29-7.46,10.65-11,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2V146.5a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.76-2l-11.77-1.42v-25.2l11-12.68c3.62,5.43,8.55,14.65,14.69,27.51,4.56,9,8,15.6,10.33,19.58,2.76,4.81,5.06,7,7.44,7h32.94a2,2,0,0,0,2-2V135.73A2,2,0,0,0,541.29,133.78ZM416.53,144.5H375.19v-7.13l5.73-1.14a2.05,2.05,0,0,0,1.41-1.09,2,2,0,0,0,0-1.77l-16.15-32.29a2,2,0,0,0-3.23-.49l-13.21,13.7a2,2,0,0,0-.56,1.46l.33,8.24v10.28a2,2,0,0,0,1.69,2l7.77,1.21v7.05H318.11v-7.07l7.29-1.19a2,2,0,0,0,1.68-2V28.75a2,2,0,0,0-1.63-2L316,25V18.45l30.33-3.66,3.34,2.42V92.29l-.48,7.93a2,2,0,0,0,3.44,1.5l30.66-32.29a2,2,0,0,0-1.15-3.36l-10.36-1.54V58h40.36v6.57L400.44,66.4a2.09,2.09,0,0,0-1.07.53l-17.61,16.8a2,2,0,0,0-.38,2.41l26.91,49.09a2.06,2.06,0,0,0,1.42,1l6.82,1.18Z");
    			add_location(path4, file, 1127, 4066, 40438);
    			attr_dev(path5, "class", "mainLogoSvg");
    			attr_dev(path5, "d", "M660.23,23.32H617.82a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.68,2l12.35,2V99.85c0,11-1.91,19.67-5.66,25.79-3.61,5.88-9.16,8.75-17,8.75-15.88,0-23.6-11.41-23.6-34.86V40.86l12-2.15a2,2,0,0,0,1.65-2V25.32a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.56,1.95l8.55,1.93V97.24c0,17.88,4.43,31.26,13.16,39.76h0c8.72,8.5,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.54s13.09-21.43,13.09-38.87V40.64l9.18-2a2,2,0,0,0,1.59-1.95V25.32A2,2,0,0,0,660.23,23.32Z");
    			add_location(path5, file, 1127, 5669, 42041);
    			attr_dev(path6, "class", "mainLogoSvg");
    			attr_dev(path6, "d", "M756.84,115.34l-11.25-2.28a2,2,0,0,0-2.18,1.06l-6,11.9-36.32,3.36a144.75,144.75,0,0,0,20.82-17A126.51,126.51,0,0,0,743.1,85.44c5.42-9.46,8.17-18.27,8.17-26.2C751.27,48,747.6,38.8,740.36,32S723,21.85,710.13,21.85a55.73,55.73,0,0,0-44.67,21.69,2,2,0,0,0,.13,2.53l8.64,9.62a2,2,0,0,0,1.41.66,1.92,1.92,0,0,0,1.46-.56c2.79-2.67,5.1-4.74,6.88-6.15a27.27,27.27,0,0,1,6.75-3.71,25.53,25.53,0,0,1,9.45-1.65c5.52,0,9.93,1.57,13.5,4.79s5.21,7.77,5.21,14.09c0,7.78-2.44,16.24-7.26,25.14a117.94,117.94,0,0,1-19.32,25.9h0a140.22,140.22,0,0,1-25.17,20.66,2,2,0,0,0-.79,2.42l3.92,9.95a2,2,0,0,0,1.86,1.27H752a2,2,0,0,0,2-1.7l4.4-29.2A2,2,0,0,0,756.84,115.34Z");
    			add_location(path6, file, 1127, 6153, 42525);
    			attr_dev(path7, "class", "mainLogoSvg");
    			attr_dev(path7, "d", "M854.7,115.34l-11.26-2.28a2,2,0,0,0-2.18,1.06l-6,11.9-36.31,3.36a144.67,144.67,0,0,0,20.81-17A126.2,126.2,0,0,0,841,85.44c5.42-9.46,8.17-18.27,8.17-26.2,0-11.28-3.67-20.44-10.9-27.22S820.84,21.85,808,21.85a55.73,55.73,0,0,0-44.66,21.69,2,2,0,0,0,.12,2.53l8.64,9.62a2,2,0,0,0,1.42.66,2,2,0,0,0,1.46-.56c2.78-2.67,5.09-4.74,6.87-6.15a27.27,27.27,0,0,1,6.75-3.71A25.53,25.53,0,0,1,798,44.28c5.52,0,9.94,1.57,13.5,4.79s5.22,7.77,5.22,14.09c0,7.78-2.45,16.24-7.26,25.14a118,118,0,0,1-19.33,25.9h0A140.16,140.16,0,0,1,765,134.86a2,2,0,0,0-.79,2.42l3.91,9.95A2,2,0,0,0,770,148.5H849.9a2,2,0,0,0,2-1.7l4.41-29.2A2,2,0,0,0,854.7,115.34Z");
    			add_location(path7, file, 1127, 6828, 43200);
    			attr_dev(path8, "class", "mainLogoSvg");
    			attr_dev(path8, "d", "M877.46,106.42h16a2,2,0,0,0,2-1.86l7-102.42a2,2,0,0,0-.53-1.51A2,2,0,0,0,900.45,0H870.28a2,2,0,0,0-2,2.14l7.17,102.42A2,2,0,0,0,877.46,106.42Z");
    			add_location(path8, file, 1127, 7487, 43859);
    			attr_dev(path9, "class", "mainLogoSvg");
    			attr_dev(path9, "d", "M899.11,122.18c-3-3.05-7-4.59-12-4.59a19,19,0,0,0-12.81,4.64,15.47,15.47,0,0,0-5.5,12.2,14.29,14.29,0,0,0,4.9,11,15.94,15.94,0,0,0,11,4.35c5.57,0,10.15-1.47,13.61-4.38s5.35-7.13,5.35-12.3A15.14,15.14,0,0,0,899.11,122.18Z");
    			add_location(path9, file, 1127, 7661, 44033);
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 903.59 150.45");
    			add_location(svg, file, 1127, 3, 36375);
    			attr_dev(div2, "class", "flex ");
    			add_location(div2, file, 1126, 2, 36352);
    			attr_dev(div3, "class", "red font-bold text-[2em] my-4");
    			add_location(div3, file, 1129, 2, 44305);
    			attr_dev(img0, "id", "mascot-filled");
    			if (!src_url_equal(img0.src, img0_src_value = "mascot-filled.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "mascot");
    			add_location(img0, file, 1134, 5, 44491);
    			attr_dev(div4, "class", "pattern-image");
    			add_location(div4, file, 1133, 4, 44458);
    			attr_dev(img1, "id", "mascot-unfilled");
    			if (!src_url_equal(img1.src, img1_src_value = "mascot-unfilled.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "mascot");
    			add_location(img1, file, 1137, 5, 44601);
    			attr_dev(div5, "class", "pattern-image");
    			add_location(div5, file, 1136, 4, 44568);
    			attr_dev(img2, "id", "mascot-filled");
    			if (!src_url_equal(img2.src, img2_src_value = "mascot-filled.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "mascot");
    			add_location(img2, file, 1140, 5, 44715);
    			attr_dev(div6, "class", "pattern-image");
    			add_location(div6, file, 1139, 4, 44682);
    			attr_dev(img3, "id", "mascot-unfilled");
    			if (!src_url_equal(img3.src, img3_src_value = "mascot-unfilled.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "mascot");
    			add_location(img3, file, 1143, 5, 44825);
    			attr_dev(div7, "class", "pattern-image");
    			add_location(div7, file, 1142, 4, 44792);
    			attr_dev(div8, "class", "flex gap-2");
    			add_location(div8, file, 1132, 3, 44429);
    			attr_dev(div9, "class", "flex justify-center");
    			add_location(div9, file, 1163, 3, 45521);
    			attr_dev(div10, "class", "flex-grow flex flex-col justify-end gap-6");
    			add_location(div10, file, 1130, 2, 44369);
    			attr_dev(div11, "class", "section");
    			attr_dev(div11, "id", "home");
    			add_location(div11, file, 1125, 1, 36318);
    			attr_dev(div12, "class", "header red");
    			add_location(div12, file, 1171, 2, 45714);
    			add_location(br0, file, 1174, 2, 45769);
    			add_location(br1, file, 1177, 3, 46214);
    			add_location(br2, file, 1178, 3, 46222);
    			attr_dev(div13, "id", "RegisterButtonCont");
    			add_location(div13, file, 1180, 4, 46281);
    			attr_dev(a, "href", "https://forms.gle/KwRNWYcxXyqf3EdZ7");
    			add_location(a, file, 1179, 3, 46230);
    			attr_dev(div14, "class", "paragraph");
    			attr_dev(div14, "id", "about");
    			set_style(div14, "width", "45%");
    			add_location(div14, file, 1175, 2, 45776);
    			attr_dev(img4, "id", "laptop-mascot");
    			if (!src_url_equal(img4.src, img4_src_value = "2022-18.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "laptop-mascot");
    			attr_dev(img4, "class", "laptop-mascot");
    			add_location(img4, file, 1186, 3, 46401);
    			add_location(div15, file, 1185, 2, 46392);
    			attr_dev(div16, "class", "section");
    			attr_dev(div16, "id", "about");
    			add_location(div16, file, 1170, 1, 45679);
    			attr_dev(div17, "class", "header red");
    			add_location(div17, file, 1190, 2, 46542);
    			attr_dev(div18, "class", "flex");
    			add_location(div18, file, 1195, 4, 46704);
    			add_location(i0, file, 1201, 5, 47142);
    			add_location(i1, file, 1202, 5, 47159);
    			add_location(i2, file, 1203, 5, 47177);
    			attr_dev(div19, "class", "border-[3px] border-[#e8000d] rounded-lg rounded-tl-none p-4 blue grid grid-cols-[100px_2fr_1fr] grid-rows-[repeat(10,40px)] max-w-[600px] flex-grow");
    			add_location(div19, file, 1200, 4, 46974);
    			attr_dev(div20, "class", "flex flex-col flex-grow");
    			add_location(div20, file, 1194, 3, 46662);
    			attr_dev(div21, "class", "border-[4px] rounded-t p-2 min-h-[20px] border-b-0 border-[#e80008] header blue");
    			add_location(div21, file, 1215, 4, 47892);
    			attr_dev(div22, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div22, file, 1216, 4, 48008);
    			attr_dev(div23, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div23, file, 1217, 4, 48113);
    			attr_dev(div24, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div24, file, 1218, 4, 48225);
    			attr_dev(div25, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div25, file, 1219, 4, 48335);
    			attr_dev(div26, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div26, file, 1220, 4, 48417);
    			attr_dev(div27, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div27, file, 1221, 4, 48499);
    			attr_dev(div28, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div28, file, 1222, 4, 48581);
    			attr_dev(div29, "class", "border-[4px] p-2 min-h-[40px] border-b-0 border-[#e80008]");
    			add_location(div29, file, 1223, 4, 48663);
    			attr_dev(div30, "class", "border-[4px] rounded-b p-2 min-h-[40px] border-[#e80008]");
    			add_location(div30, file, 1224, 4, 48745);
    			attr_dev(div31, "class", "flex flex-col w-[500px] sm:text-base");
    			add_location(div31, file, 1214, 3, 47837);
    			attr_dev(div32, "class", "flex mt-10 flex-wrap justify-center items-center gap-8");
    			add_location(div32, file, 1193, 2, 46590);
    			attr_dev(div33, "class", "section");
    			attr_dev(div33, "id", "schedule");
    			add_location(div33, file, 1189, 1, 46504);
    			attr_dev(div34, "class", "header red");
    			add_location(div34, file, 1229, 2, 48883);
    			add_location(br3, file, 1232, 2, 48941);
    			attr_dev(button0, "class", "accordion");
    			add_location(button0, file, 1234, 3, 48981);
    			add_location(p0, file, 1236, 4, 49059);
    			attr_dev(div35, "class", "panel");
    			add_location(div35, file, 1235, 3, 49035);
    			attr_dev(button1, "class", "accordion");
    			add_location(button1, file, 1238, 3, 49156);
    			add_location(p1, file, 1240, 4, 49234);
    			attr_dev(div36, "class", "panel");
    			add_location(div36, file, 1239, 3, 49210);
    			attr_dev(button2, "class", "accordion");
    			add_location(button2, file, 1242, 3, 49371);
    			add_location(p2, file, 1244, 4, 49464);
    			attr_dev(div37, "class", "panel");
    			add_location(div37, file, 1243, 3, 49440);
    			attr_dev(button3, "class", "accordion");
    			add_location(button3, file, 1246, 3, 49639);
    			add_location(p3, file, 1248, 4, 49719);
    			attr_dev(div38, "class", "panel");
    			add_location(div38, file, 1247, 3, 49695);
    			attr_dev(button4, "class", "accordion");
    			add_location(button4, file, 1250, 3, 49814);
    			add_location(p4, file, 1252, 4, 49907);
    			attr_dev(div39, "class", "panel");
    			add_location(div39, file, 1251, 3, 49883);
    			attr_dev(button5, "class", "accordion");
    			add_location(button5, file, 1254, 3, 50111);
    			add_location(b0, file, 1257, 5, 50203);
    			add_location(br4, file, 1257, 80, 50278);
    			add_location(b1, file, 1258, 5, 50288);
    			add_location(br5, file, 1258, 82, 50365);
    			add_location(b2, file, 1259, 5, 50375);
    			add_location(br6, file, 1259, 105, 50475);
    			add_location(b3, file, 1260, 5, 50485);
    			add_location(br7, file, 1260, 141, 50621);
    			add_location(p5, file, 1256, 4, 50194);
    			attr_dev(div40, "class", "panel");
    			add_location(div40, file, 1255, 3, 50170);
    			attr_dev(button6, "class", "accordion");
    			add_location(button6, file, 1263, 3, 50648);
    			add_location(p6, file, 1265, 4, 50730);
    			attr_dev(div41, "class", "panel");
    			add_location(div41, file, 1264, 3, 50706);
    			attr_dev(button7, "class", "accordion");
    			add_location(button7, file, 1267, 3, 50838);
    			add_location(p7, file, 1269, 4, 50918);
    			attr_dev(div42, "class", "panel");
    			add_location(div42, file, 1268, 3, 50894);
    			attr_dev(button8, "class", "accordion");
    			add_location(button8, file, 1271, 3, 50978);
    			add_location(p8, file, 1273, 4, 51070);
    			attr_dev(div43, "class", "panel");
    			add_location(div43, file, 1272, 3, 51046);
    			attr_dev(button9, "class", "accordion");
    			add_location(button9, file, 1275, 3, 51244);
    			add_location(p9, file, 1277, 4, 51348);
    			attr_dev(div44, "class", "panel");
    			add_location(div44, file, 1276, 3, 51324);
    			attr_dev(div45, "class", "qanda-container");
    			add_location(div45, file, 1233, 2, 48948);
    			attr_dev(div46, "class", "section");
    			attr_dev(div46, "id", "faq");
    			add_location(div46, file, 1228, 1, 48850);
    			attr_dev(div47, "class", "header");
    			add_location(div47, file, 1282, 2, 51658);
    			add_location(br8, file, 1288, 5, 51783);
    			attr_dev(p10, "class", "paragraph");
    			add_location(p10, file, 1291, 7, 51857);
    			attr_dev(div48, "class", "sponsor-image");
    			add_location(div48, file, 1290, 6, 51822);
    			attr_dev(div49, "class", "sponsors");
    			add_location(div49, file, 1289, 5, 51793);
    			attr_dev(li0, "class", "subheader");
    			add_location(li0, file, 1287, 4, 51746);
    			add_location(br9, file, 1295, 4, 51934);
    			add_location(br10, file, 1296, 4, 51943);
    			add_location(br11, file, 1298, 5, 51989);
    			attr_dev(p11, "class", "paragraph");
    			add_location(p11, file, 1301, 7, 52063);
    			attr_dev(div50, "class", "sponsor-image");
    			add_location(div50, file, 1300, 6, 52028);
    			attr_dev(div51, "class", "sponsors");
    			add_location(div51, file, 1299, 5, 51999);
    			attr_dev(li1, "class", "subheader");
    			add_location(li1, file, 1297, 4, 51952);
    			add_location(br12, file, 1305, 4, 52140);
    			add_location(br13, file, 1306, 4, 52149);
    			add_location(br14, file, 1308, 5, 52195);
    			attr_dev(p12, "class", "paragraph");
    			add_location(p12, file, 1311, 7, 52269);
    			attr_dev(div52, "class", "sponsor-image");
    			add_location(div52, file, 1310, 6, 52234);
    			attr_dev(div53, "class", "sponsors");
    			add_location(div53, file, 1309, 5, 52205);
    			attr_dev(li2, "class", "subheader");
    			add_location(li2, file, 1307, 4, 52158);
    			add_location(br15, file, 1315, 4, 52346);
    			add_location(br16, file, 1316, 4, 52355);
    			add_location(br17, file, 1318, 5, 52401);
    			attr_dev(p13, "class", "paragraph");
    			add_location(p13, file, 1321, 7, 52475);
    			attr_dev(div54, "class", "sponsor-image");
    			add_location(div54, file, 1320, 6, 52440);
    			attr_dev(div55, "class", "sponsors");
    			add_location(div55, file, 1319, 5, 52411);
    			attr_dev(li3, "class", "subheader");
    			add_location(li3, file, 1317, 4, 52364);
    			set_style(ul, "list-style", "none");
    			add_location(ul, file, 1286, 3, 51711);
    			add_location(div56, file, 1285, 2, 51702);
    			attr_dev(div57, "class", "section");
    			attr_dev(div57, "id", "sponsors");
    			add_location(div57, file, 1281, 1, 51620);
    			attr_dev(div58, "class", "header");
    			add_location(div58, file, 1329, 2, 52637);
    			add_location(br18, file, 1332, 2, 52686);
    			add_location(br19, file, 1333, 2, 52693);
    			add_location(br20, file, 1334, 2, 52700);
    			add_location(br21, file, 1335, 2, 52707);
    			attr_dev(div59, "class", "flex flex-wrap gap-8");
    			set_style(div59, "justify-content", "center");
    			add_location(div59, file, 1336, 2, 52714);
    			add_location(br22, file, 1341, 2, 52888);
    			add_location(br23, file, 1342, 2, 52895);
    			add_location(br24, file, 1343, 2, 52902);
    			add_location(br25, file, 1344, 2, 52909);
    			attr_dev(div60, "class", "caption inline text-center");
    			add_location(div60, file, 1348, 3, 53042);
    			attr_dev(div61, "class", "flex flex-col items-center");
    			add_location(div61, file, 1345, 2, 52916);
    			attr_dev(div62, "class", "section");
    			attr_dev(div62, "id", "contact");
    			set_style(div62, "min-height", "65vh");
    			add_location(div62, file, 1328, 1, 52575);
    			attr_dev(main, "class", "text-base sm:text-xl relative");
    			add_location(main, file, 1085, 0, 22190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, div0);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t3);
    			append_dev(main, div11);
    			append_dev(div11, div2);
    			append_dev(div2, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t4);
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
    			append_dev(div11, t5);
    			append_dev(div11, div3);
    			append_dev(div11, t7);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, div4);
    			append_dev(div4, img0);
    			append_dev(div8, t8);
    			append_dev(div8, div5);
    			append_dev(div5, img1);
    			append_dev(div8, t9);
    			append_dev(div8, div6);
    			append_dev(div6, img2);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div7, img3);
    			append_dev(div8, t11);
    			if (if_block2) if_block2.m(div8, null);
    			append_dev(div10, t12);
    			append_dev(div10, div9);
    			mount_component(registerbutton0, div9, null);
    			append_dev(main, t13);
    			append_dev(main, div16);
    			append_dev(div16, div12);
    			append_dev(div16, t15);
    			append_dev(div16, br0);
    			append_dev(div16, t16);
    			append_dev(div16, div14);
    			append_dev(div14, t17);
    			append_dev(div14, br1);
    			append_dev(div14, t18);
    			append_dev(div14, br2);
    			append_dev(div14, t19);
    			append_dev(div14, a);
    			append_dev(a, div13);
    			mount_component(registerbutton1, div13, null);
    			append_dev(div16, t20);
    			append_dev(div16, div15);
    			append_dev(div15, img4);
    			append_dev(main, t21);
    			append_dev(main, div33);
    			append_dev(div33, div17);
    			append_dev(div33, t23);
    			append_dev(div33, div32);
    			append_dev(div32, div20);
    			append_dev(div20, div18);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div18, null);
    			}

    			append_dev(div20, t24);
    			append_dev(div20, div19);
    			append_dev(div19, i0);
    			append_dev(div19, t26);
    			append_dev(div19, i1);
    			append_dev(div19, t28);
    			append_dev(div19, i2);
    			append_dev(div19, t30);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div19, null);
    			}

    			append_dev(div32, t31);
    			append_dev(div32, div31);
    			append_dev(div31, div21);
    			append_dev(div31, t33);
    			append_dev(div31, div22);
    			append_dev(div31, t35);
    			append_dev(div31, div23);
    			append_dev(div31, t37);
    			append_dev(div31, div24);
    			append_dev(div31, t39);
    			append_dev(div31, div25);
    			append_dev(div31, t40);
    			append_dev(div31, div26);
    			append_dev(div31, t41);
    			append_dev(div31, div27);
    			append_dev(div31, t42);
    			append_dev(div31, div28);
    			append_dev(div31, t43);
    			append_dev(div31, div29);
    			append_dev(div31, t44);
    			append_dev(div31, div30);
    			append_dev(main, t45);
    			append_dev(main, div46);
    			append_dev(div46, div34);
    			append_dev(div46, t47);
    			append_dev(div46, br3);
    			append_dev(div46, t48);
    			append_dev(div46, div45);
    			append_dev(div45, button0);
    			append_dev(div45, t50);
    			append_dev(div45, div35);
    			append_dev(div35, p0);
    			append_dev(div45, t52);
    			append_dev(div45, button1);
    			append_dev(div45, t54);
    			append_dev(div45, div36);
    			append_dev(div36, p1);
    			append_dev(div45, t56);
    			append_dev(div45, button2);
    			append_dev(div45, t58);
    			append_dev(div45, div37);
    			append_dev(div37, p2);
    			append_dev(div45, t60);
    			append_dev(div45, button3);
    			append_dev(div45, t62);
    			append_dev(div45, div38);
    			append_dev(div38, p3);
    			append_dev(div45, t64);
    			append_dev(div45, button4);
    			append_dev(div45, t66);
    			append_dev(div45, div39);
    			append_dev(div39, p4);
    			append_dev(div45, t68);
    			append_dev(div45, button5);
    			append_dev(div45, t70);
    			append_dev(div45, div40);
    			append_dev(div40, p5);
    			append_dev(p5, b0);
    			append_dev(p5, t72);
    			append_dev(p5, br4);
    			append_dev(p5, t73);
    			append_dev(p5, b1);
    			append_dev(p5, t75);
    			append_dev(p5, br5);
    			append_dev(p5, t76);
    			append_dev(p5, b2);
    			append_dev(p5, t78);
    			append_dev(p5, br6);
    			append_dev(p5, t79);
    			append_dev(p5, b3);
    			append_dev(p5, t81);
    			append_dev(p5, br7);
    			append_dev(div45, t82);
    			append_dev(div45, button6);
    			append_dev(div45, t84);
    			append_dev(div45, div41);
    			append_dev(div41, p6);
    			append_dev(div45, t86);
    			append_dev(div45, button7);
    			append_dev(div45, t88);
    			append_dev(div45, div42);
    			append_dev(div42, p7);
    			append_dev(div45, t90);
    			append_dev(div45, button8);
    			append_dev(div45, t92);
    			append_dev(div45, div43);
    			append_dev(div43, p8);
    			append_dev(div45, t94);
    			append_dev(div45, button9);
    			append_dev(div45, t96);
    			append_dev(div45, div44);
    			append_dev(div44, p9);
    			append_dev(main, t98);
    			append_dev(main, div57);
    			append_dev(div57, div47);
    			append_dev(div57, t100);
    			append_dev(div57, div56);
    			append_dev(div56, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t101);
    			append_dev(li0, br8);
    			append_dev(li0, t102);
    			append_dev(li0, div49);
    			append_dev(div49, div48);
    			append_dev(div48, p10);
    			append_dev(ul, t104);
    			append_dev(ul, br9);
    			append_dev(ul, t105);
    			append_dev(ul, br10);
    			append_dev(ul, t106);
    			append_dev(ul, li1);
    			append_dev(li1, t107);
    			append_dev(li1, br11);
    			append_dev(li1, t108);
    			append_dev(li1, div51);
    			append_dev(div51, div50);
    			append_dev(div50, p11);
    			append_dev(ul, t110);
    			append_dev(ul, br12);
    			append_dev(ul, t111);
    			append_dev(ul, br13);
    			append_dev(ul, t112);
    			append_dev(ul, li2);
    			append_dev(li2, t113);
    			append_dev(li2, br14);
    			append_dev(li2, t114);
    			append_dev(li2, div53);
    			append_dev(div53, div52);
    			append_dev(div52, p12);
    			append_dev(ul, t116);
    			append_dev(ul, br15);
    			append_dev(ul, t117);
    			append_dev(ul, br16);
    			append_dev(ul, t118);
    			append_dev(ul, li3);
    			append_dev(li3, t119);
    			append_dev(li3, br17);
    			append_dev(li3, t120);
    			append_dev(li3, div55);
    			append_dev(div55, div54);
    			append_dev(div54, p13);
    			append_dev(main, t122);
    			append_dev(main, div62);
    			append_dev(div62, div58);
    			append_dev(div62, t124);
    			append_dev(div62, br18);
    			append_dev(div62, t125);
    			append_dev(div62, br19);
    			append_dev(div62, t126);
    			append_dev(div62, br20);
    			append_dev(div62, t127);
    			append_dev(div62, br21);
    			append_dev(div62, t128);
    			append_dev(div62, div59);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div59, null);
    			}

    			append_dev(div62, t129);
    			append_dev(div62, br22);
    			append_dev(div62, t130);
    			append_dev(div62, br23);
    			append_dev(div62, t131);
    			append_dev(div62, br24);
    			append_dev(div62, t132);
    			append_dev(div62, br25);
    			append_dev(div62, t133);
    			append_dev(div62, div61);
    			mount_component(heart, div61, null);
    			append_dev(div61, t134);
    			append_dev(div61, div60);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[10]),
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[11]();
    					}),
    					listen_dev(div9, "click", /*click_handler_3*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*scrollY*/ 16 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*scrollY*/ ctx[4]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*hamburgerExpanded*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*hamburgerExpanded*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*scrollY*/ ctx[4] >= /*innerHeight*/ ctx[3] && !/*hamburgerExpanded*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*scrollY, innerHeight, hamburgerExpanded*/ 25) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!/*smallScreen*/ ctx[2]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(div8, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const registerbutton0_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				registerbutton0_changes.$$scope = { dirty, ctx };
    			}

    			registerbutton0.$set(registerbutton0_changes);
    			const registerbutton1_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				registerbutton1_changes.$$scope = { dirty, ctx };
    			}

    			registerbutton1.$set(registerbutton1_changes);

    			if (dirty[0] & /*selectedDay, schedule*/ 544) {
    				each_value_2 = Object.keys(/*schedule*/ ctx[9]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div18, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty[0] & /*schedule, selectedDay*/ 544) {
    				each_value_1 = /*schedule*/ ctx[9][/*selectedDay*/ ctx[5]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div19, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*members*/ 64) {
    				each_value = Object.entries(/*members*/ ctx[6]);
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
    						each_blocks[i].m(div59, null);
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
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(registerbutton0.$$.fragment, local);
    			transition_in(registerbutton1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(heart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(registerbutton0.$$.fragment, local);
    			transition_out(registerbutton1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(heart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(registerbutton0);
    			destroy_component(registerbutton1);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(heart);
    			mounted = false;
    			run_all(dispose);
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
    	let smallScreen;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let members = {
    		"firangiz": {
    			display: "Firangiz Ganbarli",
    			title: "Head Chair",
    			link: "https://www.linkedin.com/in/firangizganbarli/"
    		},
    		"jerusha": {
    			display: "Jerusha Rowden",
    			title: "Vice Chair",
    			link: "https://www.linkedin.com/in/jerusha-rowden/"
    		},
    		"skyler": {
    			display: "Skyler Bosch",
    			title: "Sponsorship Chair",
    			link: "https://www.linkedin.com/in/skyler-bosch-37393a159/"
    		},
    		"zoe": {
    			display: "Zoe Kulphongpatana",
    			title: "Website Chair",
    			link: "https://www.linkedin.com/in/zoe-kulphongpatana-b9a9151b6/"
    		}
    	};

    	let links = [
    		{
    			display: "about",
    			action: () => scrollToID("about")
    		},
    		{
    			display: "schedule",
    			action: () => scrollToID("schedule")
    		},
    		{
    			display: "faq",
    			action: () => scrollToID("faq")
    		},
    		{
    			display: "sponsors",
    			action: () => scrollToID("sponsors")
    		},
    		{
    			display: "contact us",
    			action: () => scrollToID("contact")
    		},
    		{
    			display: "register now!",
    			action: () => window.open("https://forms.gle/KwRNWYcxXyqf3EdZ7", "_blank")
    		}
    	];

    	const scrollToID = id => {
    		window.scrollTo({
    			top: document.getElementById(id).offsetTop - 60,
    			behavior: 'smooth'
    		});
    	};

    	let hamburgerExpanded = false;
    	let innerHeight;
    	let innerWidth;
    	let scrollY;
    	let selectedDay = "friday";

    	let schedule = {
    		friday: [
    			{
    				time: "5:00 PM",
    				event: "Opening Ceremonies",
    				location: "Eaton 2"
    			}
    		],
    		saturday: [
    			{
    				time: "TBD",
    				event: "Coming soon!",
    				location: "TBD"
    			}
    		],
    		sunday: [
    			{
    				time: "TBD",
    				event: "Coming soon!",
    				location: "TBD"
    			}
    		]
    	};

    	onMount(() => {
    		let acc = document.getElementsByClassName("accordion");
    		let i;

    		for (i = 0; i < acc.length; i++) {
    			acc[i].addEventListener("click", function () {
    				this.classList.toggle("active");
    				let panel = this.nextElementSibling;

    				if (panel.style.display === "block") {
    					panel.style.display = "none";
    				} else {
    					panel.style.display = "block";
    				}
    			});
    		}
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(3, innerHeight = window_1.innerHeight);
    		$$invalidate(1, innerWidth = window_1.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(4, scrollY = window_1.pageYOffset);
    	}

    	const click_handler = () => $$invalidate(0, hamburgerExpanded = false);
    	const click_handler_1 = () => scrollToID("home");
    	const click_handler_2 = () => $$invalidate(0, hamburgerExpanded = !hamburgerExpanded);
    	const click_handler_3 = () => scrollToID("about");
    	const click_handler_4 = day => $$invalidate(5, selectedDay = day);

    	$$self.$capture_state = () => ({
    		Heart,
    		fade,
    		fly,
    		NavBarLogo: HackKU,
    		RegisterButton,
    		MemberButton,
    		onMount,
    		members,
    		links,
    		scrollToID,
    		hamburgerExpanded,
    		innerHeight,
    		innerWidth,
    		scrollY,
    		selectedDay,
    		schedule,
    		smallScreen
    	});

    	$$self.$inject_state = $$props => {
    		if ('members' in $$props) $$invalidate(6, members = $$props.members);
    		if ('links' in $$props) $$invalidate(7, links = $$props.links);
    		if ('hamburgerExpanded' in $$props) $$invalidate(0, hamburgerExpanded = $$props.hamburgerExpanded);
    		if ('innerHeight' in $$props) $$invalidate(3, innerHeight = $$props.innerHeight);
    		if ('innerWidth' in $$props) $$invalidate(1, innerWidth = $$props.innerWidth);
    		if ('scrollY' in $$props) $$invalidate(4, scrollY = $$props.scrollY);
    		if ('selectedDay' in $$props) $$invalidate(5, selectedDay = $$props.selectedDay);
    		if ('schedule' in $$props) $$invalidate(9, schedule = $$props.schedule);
    		if ('smallScreen' in $$props) $$invalidate(2, smallScreen = $$props.smallScreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*innerWidth*/ 2) {
    			$$invalidate(2, smallScreen = innerWidth < 750);
    		}

    		if ($$self.$$.dirty[0] & /*hamburgerExpanded, smallScreen*/ 5) {
    			$$invalidate(0, hamburgerExpanded = hamburgerExpanded && smallScreen);
    		}
    	};

    	return [
    		hamburgerExpanded,
    		innerWidth,
    		smallScreen,
    		innerHeight,
    		scrollY,
    		selectedDay,
    		members,
    		links,
    		scrollToID,
    		schedule,
    		onwindowresize,
    		onwindowscroll,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

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
