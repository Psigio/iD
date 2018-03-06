// @flow
import _map from 'lodash-es/map';

import { t, textDirection } from './locale';
import { utilDetect } from './detect';
import { remove as removeDiacritics } from 'diacritics';
import { fixRTLTextForSvg, rtlRegex } from './svg_paths_rtl_fix';

// For Flow to work, we need to import the relevant types here to avoid redefining them
import type { coreGraphType } from '../core/graph';
import type { entityType } from '../osm/entity';

export function utilTagText(entity: entityType): string {
    return _map(entity.tags, function (v, k) {
        return k + '=' + v;
    }).join(', ');
}


export function utilEntitySelector(ids: string[]): string {
    return ids.length ? '.' + ids.join(',.') : 'nothing';
}


export function utilEntityOrMemberSelector(ids: string[], graph: coreGraphType): string {
    var s = utilEntitySelector(ids);

    ids.forEach(function (id) {
        var entity = graph.hasEntity(id);
        if (entity && entity.type === 'relation') {
            entity.members.forEach(function (member: entityType) {
                s += ',.' + member.id;
            });
        }
    });

    return s;
}


export function utilGetAllNodes(ids: string[], graph: coreGraphType) {
    var seen = {};
    var nodes = [];
    ids.forEach(getNodes);
    return nodes;

    function getNodes(id: string) {
        if (seen[id]) return;
        seen[id] = true;

        var entity = graph.hasEntity(id);
        if (!entity) return;

        if (entity.type === 'node') {
            nodes.push(entity);
        } else if (entity.type === 'way') {
            entity.nodes.forEach(getNodes);
        } else {
            entity.members.map(function (member: entityType) { return member.id; }).forEach(getNodes);
        }
    }
}


export function utilDisplayName(entity: entityType): string {
    var localizedNameKey = 'name:' + utilDetect().locale.toLowerCase().split('-')[0],
        name = entity.tags[localizedNameKey] || entity.tags.name || '',
        network = entity.tags.cycle_network || entity.tags.network;

    if (!name && entity.tags.ref) {
        name = entity.tags.ref;
        if (network) {
            name = network + ' ' + name;
        }
    }

    return name;
}


export function utilDisplayNameForPath(entity: entityType): string {
    var name = utilDisplayName(entity);
    var isFirefox = utilDetect().browser.toLowerCase().indexOf('firefox') > -1;

    if (!isFirefox && name && rtlRegex.test(name)) {
        name = fixRTLTextForSvg(name);
    }

    return name;
}


export function utilDisplayType(id: string): string {
    return {
        n: t('inspector.node'),
        w: t('inspector.way'),
        r: t('inspector.relation')
    }[id.charAt(0)];
}


export function utilStringQs(str: string): any {
    return str.split('&').reduce(function (obj: any, pair: string) {
        var parts = pair.split('=');
        if (parts.length === 2) {
            obj[parts[0]] = (null === parts[1]) ? '' : decodeURIComponent(parts[1]);
        }
        return obj;
    }, {});
}


export function utilQsString(obj: any, noencode: boolean): string {
    function softEncode(s) {
        // encode everything except special characters used in certain hash parameters:
        // "/" in map states, ":", ",", {" and "}" in background
        return encodeURIComponent(s).replace(/(%2F|%3A|%2C|%7B|%7D)/g, decodeURIComponent);
    }
    return Object.keys(obj).sort().map(function (key) {
        return encodeURIComponent(key) + '=' + (
            noencode ? softEncode(obj[key]) : encodeURIComponent(obj[key]));
    }).join('&');
}


export function utilPrefixDOMProperty(property: string): any {
    var prefixes = ['webkit', 'ms', 'moz', 'o'],
        i = -1,
        n = prefixes.length,
        s = document.body;

    // If document body is null, return false immediately
    if (s === null) {
        return false;
    }

    if (s !== null && property in s)
        return property;

    property = property.substr(0, 1).toUpperCase() + property.substr(1);

    while (++i < n)
        if (prefixes[i] + property in s)
            return prefixes[i] + property;

    return false;
}


export function utilPrefixCSSProperty(property: string): any {
    var prefixes = ['webkit', 'ms', 'Moz', 'O'],
        i = -1,
        n = prefixes.length,
        s = document.body;
    // If document body is null or the style is null, return false immediately
    if (s === null || s.style === null) {
        return false;
    }
    s = s.style;
    if (property.toLowerCase() in s)
        return property.toLowerCase();

    while (++i < n)
        if (prefixes[i] + property in s)
            return '-' + prefixes[i].toLowerCase() + property.replace(/([A-Z])/g, '-$1').toLowerCase();

    return false;
}


var transformProperty;
// Note the el is of type HtmlElement, but because we use the style property in a way which isn't compatible with the type (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) we have to set this to "any" for now.  Once refactored we can use the correct type
export function utilSetTransform(el: any, x: number, y: number, scale: number): any {
    var prop = transformProperty = transformProperty || utilPrefixCSSProperty('Transform'),
        translate = utilDetect().opera ?
            'translate(' + x + 'px,' + y + 'px)' :
            'translate3d(' + x + 'px,' + y + 'px,0)';
    return el.style(prop, translate + (scale ? ' scale(' + scale + ')' : ''));
}


// Calculates Levenshtein distance between two strings
// see:  https://en.wikipedia.org/wiki/Levenshtein_distance
// first converts the strings to lowercase and replaces diacritic marks with ascii equivalents.
export function utilEditDistance(a: string, b: string): number {
    a = removeDiacritics(a.toLowerCase());
    b = removeDiacritics(b.toLowerCase());
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (var j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }
    return matrix[b.length][a.length];
}


// a d3.mouse-alike which
// 1. Only works on HTML elements, not SVG
// 2. Does not cause style recalculation
// Note that we use an inline Flow return type
export function utilFastMouse(container: Element): (e: MouseEvent) => number[] {
    var rect = container.getBoundingClientRect(),
        rectLeft = rect.left,
        rectTop = rect.top,
        clientLeft = +container.clientLeft,
        clientTop = +container.clientTop;
    if (textDirection === 'rtl') {
        rectLeft = 0;
    }
    return function (e: MouseEvent) {
        return [
            e.clientX - rectLeft - clientLeft,
            e.clientY - rectTop - clientTop];
    };
}


/* eslint-disable no-proto */
export var utilGetPrototypeOf = Object.getPrototypeOf || function (obj: any) { return obj.__proto__; };
/* eslint-enable no-proto */


// Not sure what these types are, so setting to any for now
export function utilAsyncMap(inputs: any[], func: (any, Function) => void, callback: (errors: any[], results: any[]) => void): void {
    var remaining = inputs.length,
        results = [],
        errors = [];

    inputs.forEach(function (d, i) {
        func(d, function done(err, data) {
            errors[i] = err;
            results[i] = data;
            remaining--;
            if (!remaining) callback(errors, results);
        });
    });
}


// wraps an index to an interval [0..length-1]
export function utilWrap(index: number, length: number): number {
    if (index < 0)
        index += Math.ceil(-index / length) * length;
    return index % length;
}


/**
 * a replacement for functor
 *
 * @param {*} value any value
 * @returns {Function} a function that returns that value or the value if it's a function
 */
export function utilFunctor(value: any): any {
    if (typeof value === 'function') return value;
    return function () {
        return value;
    };
}


export function utilNoAuto(selection: any) {
    var isText = (selection.size() && selection.node().tagName.toLowerCase() === 'textarea');

    return selection
        .attr('autocomplete', 'off')
        .attr('autocorrect', 'off')
        .attr('autocapitalize', 'off')
        .attr('spellcheck', isText ? 'true' : 'false');
}
