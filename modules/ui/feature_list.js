import {
    select as d3_select
} from 'd3-selection';
import * as sexagesimal from '@mapbox/sexagesimal';

import { presetManager } from '../presets';
import { t } from '../core/localizer';
import { dmsCoordinatePair } from '../util/units';
import { coreGraph } from '../core/graph';
import { geoSphericalDistance } from '../geo/geo';
<<<<<<< HEAD
import { geoExtent } from '../geo';
=======
import { geoExtent, geoChooseEdge } from '../geo';
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
import { modeSelect } from '../modes/select';
import { osmEntity } from '../osm/entity';
import { services } from '../services';
import { svgIcon } from '../svg/icon';
import { uiCmd } from './cmd';

import {
    utilDisplayName,
    utilDisplayType,
    utilHighlightEntities,
    utilNoAuto
} from '../util';


export function uiFeatureList(context) {
    var _geocodeResults;

    var search = d3_select(null),
        list = d3_select(null);

    context
        .on('exit.feature-list', clearSearch);
    context.map()
        .on('drawn.feature-list', mapDrawn);

    context.keybinding()
        .on(uiCmd('⌘F'), focusSearch);

<<<<<<< HEAD
    function featureList(selection) {
        var header = selection
            .append('div')
            .attr('class', 'header fillL');

        header
            .append('h3')
            .html(t.html('inspector.feature_list'));
=======

    function featureList(selection) {
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        var searchWrap = selection
            .append('div')
            .attr('class', 'search-header');

<<<<<<< HEAD
        searchWrap
            .call(svgIcon('#iD-icon-search', 'pre-text'));

        var search = searchWrap
=======
        search = searchWrap
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            .append('input')
            .attr('class', 'feature-search')
            .attr('placeholder', t('inspector.feature_list'))
            .attr('type', 'search')
            .call(utilNoAuto)
            .on('keypress', keypress)
            .on('keydown', keydown)
            .on('input', inputevent);

        var listWrap = selection
            .append('div')
            .attr('class', 'inspector-body');

        list = listWrap
            .append('div')
            .attr('class', 'feature-list');

    }

    function focusSearch() {
        var mode = context.mode() && context.mode().id;
        if (mode !== 'browse') return;

        d3_event.preventDefault();
        search.node().focus();
    }

<<<<<<< HEAD
        function focusSearch(d3_event) {
            var mode = context.mode() && context.mode().id;
            if (mode !== 'browse') return;
=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    function keydown() {
        if (d3_event.keyCode === 27) {  // escape
            search.node().blur();
        }
    }


<<<<<<< HEAD
        function keydown(d3_event) {
            if (d3_event.keyCode === 27) {  // escape
                search.node().blur();
            }
=======
    function keypress() {
        var q = search.property('value'),
            items = list.selectAll('.feature-list-item');
        if (d3_event.keyCode === 13 && q.length && items.size()) {  // return
            click(items.datum());
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        }
    }


<<<<<<< HEAD
        function keypress(d3_event) {
            var q = search.property('value'),
                items = list.selectAll('.feature-list-item');
            if (d3_event.keyCode === 13 && // ↩ Return
                q.length &&
                items.size()) {
                click(d3_event, items.datum());
            }
        }
=======
    function inputevent() {
        _geocodeResults = undefined;
        drawList();
    }

>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    function clearSearch() {
        search.property('value', '');
        drawList();
    }
<<<<<<< HEAD


=======


>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    function mapDrawn(e) {
        if (e.full) {
            drawList();
        }
    }


    function features() {
        var result = [];
        var graph = context.graph();
        var visibleCenter = context.map().extent().center();
        var q = search.property('value').toLowerCase();

        if (!q) return result;

        var idMatch = q.match(/^([nwr])([0-9]+)$/);

        if (idMatch) {
            result.push({
                id: idMatch[0],
                geometry: idMatch[1] === 'n' ? 'point' : idMatch[1] === 'w' ? 'line' : 'relation',
                type: idMatch[1] === 'n' ? t('inspector.node') : idMatch[1] === 'w' ? t('inspector.way') : t('inspector.relation'),
                name: idMatch[2]
            });
        }

        var locationMatch = sexagesimal.pair(q.toUpperCase()) || q.match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/);

        if (locationMatch) {
            var loc = [parseFloat(locationMatch[0]), parseFloat(locationMatch[1])];
            result.push({
                id: -1,
                geometry: 'point',
                type: t('inspector.location'),
                name: dmsCoordinatePair([loc[1], loc[0]]),
                location: loc
            });
        }

        var allEntities = graph.entities;
        var localResults = [];
        for (var id in allEntities) {
            var entity = allEntities[id];
            if (!entity) continue;

<<<<<<< HEAD
        function features() {
            var result = [];
            var graph = context.graph();
            var visibleCenter = context.map().extent().center();
            var q = search.property('value').toLowerCase();
=======
            var name = utilDisplayName(entity) || '';
            if (name.toLowerCase().indexOf(q) < 0) continue;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

            var matched = context.presets().match(entity, graph);
            var type = (matched && matched.name()) || utilDisplayType(entity.id);

<<<<<<< HEAD
            var locationMatch = sexagesimal.pair(q.toUpperCase()) || q.match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/);

                result.push({
                    id: tempEntity.id,
                    geometry: tempEntity.geometry(tempGraph),
                    type: type,
                    name: d.display_name,
                    extent: new geoExtent(
                        [parseFloat(d.boundingbox[3]), parseFloat(d.boundingbox[0])],
                        [parseFloat(d.boundingbox[2]), parseFloat(d.boundingbox[1])])
                });
            }
        });

            // A location search takes priority over an ID search
            var idMatch = !locationMatch && q.match(/(?:^|\W)(node|way|relation|[nwr])\W?0*([1-9]\d*)(?:\W|$)/i);

            if (idMatch) {
                var elemType = idMatch[1].charAt(0);
                var elemId = idMatch[2];
                result.push({
                    id: elemType + elemId,
                    geometry: elemType === 'n' ? 'point' : elemType === 'w' ? 'line' : 'relation',
                    type: elemType === 'n' ? t('inspector.node') : elemType === 'w' ? t('inspector.way') : t('inspector.relation'),
                    name: elemId
=======
            var extent = entity.extent(graph);
            var distance = extent ? geoSphericalDistance(visibleCenter, extent.center()) : 0;

            localResults.push({
                id: entity.id,
                entity: entity,
                geometry: context.geometry(entity.id),
                type: type,
                name: name,
                distance: distance
            });

            if (localResults.length > 100) break;
        }
        localResults = localResults.sort(function byDistance(a, b) {
            return a.distance - b.distance;
        });
        result = result.concat(localResults);

        (_geocodeResults || []).forEach(function(d) {
            if (d.osm_type && d.osm_id) {    // some results may be missing these - #1890

                // Make a temporary osmEntity so we can preset match
                // and better localize the search result - #4725
                var id = osmEntity.id.fromOSM(d.osm_type, d.osm_id);
                var tags = {};
                tags[d.class] = d.type;

                var attrs = { id: id, type: d.osm_type, tags: tags };
                if (d.osm_type === 'way') {   // for ways, add some fake closed nodes
                    attrs.nodes = ['a','a'];  // so that geometry area is possible
                }

                var tempEntity = osmEntity(attrs);
                var tempGraph = coreGraph([tempEntity]);
                var matched = context.presets().match(tempEntity, tempGraph);
                var type = (matched && matched.name()) || utilDisplayType(id);

                result.push({
                    id: tempEntity.id,
                    geometry: tempEntity.geometry(tempGraph),
                    type: type,
                    name: d.display_name,
                    extent: new geoExtent(
                        [parseFloat(d.boundingbox[3]), parseFloat(d.boundingbox[0])],
                        [parseFloat(d.boundingbox[2]), parseFloat(d.boundingbox[1])])
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
                });
            }
        });

<<<<<<< HEAD
            var allEntities = graph.entities;
            var localResults = [];
            for (var id in allEntities) {
                var entity = allEntities[id];
                if (!entity) continue;

                var name = utilDisplayName(entity) || '';
                if (name.toLowerCase().indexOf(q) < 0) continue;

                var matched = presetManager.match(entity, graph);
                var type = (matched && matched.name()) || utilDisplayType(entity.id);
                var extent = entity.extent(graph);
                var distance = extent ? geoSphericalDistance(visibleCenter, extent.center()) : 0;

                localResults.push({
                    id: entity.id,
                    entity: entity,
                    geometry: entity.geometry(graph),
                    type: type,
                    name: name,
                    distance: distance
                });

                if (localResults.length > 100) break;
            }
            localResults = localResults.sort(function byDistance(a, b) {
                return a.distance - b.distance;
            });
            result = result.concat(localResults);

            (_geocodeResults || []).forEach(function(d) {
                if (d.osm_type && d.osm_id) {    // some results may be missing these - #1890

                    // Make a temporary osmEntity so we can preset match
                    // and better localize the search result - #4725
                    var id = osmEntity.id.fromOSM(d.osm_type, d.osm_id);
                    var tags = {};
                    tags[d.class] = d.type;

                    var attrs = { id: id, type: d.osm_type, tags: tags };
                    if (d.osm_type === 'way') {   // for ways, add some fake closed nodes
                        attrs.nodes = ['a','a'];  // so that geometry area is possible
                    }

                    var tempEntity = osmEntity(attrs);
                    var tempGraph = coreGraph([tempEntity]);
                    var matched = presetManager.match(tempEntity, tempGraph);
                    var type = (matched && matched.name()) || utilDisplayType(id);

                    result.push({
                        id: tempEntity.id,
                        geometry: tempEntity.geometry(tempGraph),
                        type: type,
                        name: d.display_name,
                        extent: new geoExtent(
                            [parseFloat(d.boundingbox[3]), parseFloat(d.boundingbox[0])],
                            [parseFloat(d.boundingbox[2]), parseFloat(d.boundingbox[1])])
                    });
                }
            });

            if (q.match(/^[0-9]+$/)) {
                // if query is just a number, possibly an OSM ID without a prefix
                result.push({
                    id: 'n' + q,
                    geometry: 'point',
                    type: t('inspector.node'),
                    name: q
                });
                result.push({
                    id: 'w' + q,
                    geometry: 'line',
                    type: t('inspector.way'),
                    name: q
                });
                result.push({
                    id: 'r' + q,
                    geometry: 'relation',
                    type: t('inspector.relation'),
                    name: q
                });
            }

            return result;
        }
=======
        return result;
    }


    function drawList() {
        if (search.empty()) return;

        var value = search.property('value');
        var results = features();

        list.classed('filtered', value.length);

        list.selectAll('.feature-list-item')
            .data([-1])
            .remove();

        var items = list.selectAll('.feature-list-item')
            .data(results, function(d) { return d.id; });
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        var enter = items.enter()
            .insert('button', '.geocode-item')
            .attr('class', 'feature-list-item sep-top')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('click', click);

<<<<<<< HEAD
        function drawList() {
            var value = search.property('value');
            var results = features();

            list.classed('filtered', value.length);

            var resultsIndicator = list.selectAll('.no-results-item')
                .data([0])
                .enter()
                .append('button')
                .property('disabled', true)
                .attr('class', 'no-results-item')
                .call(svgIcon('#iD-icon-alert', 'pre-text'));

            resultsIndicator.append('span')
                .attr('class', 'entity-name');

            list.selectAll('.no-results-item .entity-name')
                .html(t.html('geocoder.no_results_worldwide'));

            if (services.geocoder) {
              list.selectAll('.geocode-item')
                  .data([0])
                  .enter()
                  .append('button')
                  .attr('class', 'geocode-item secondary-action')
                  .on('click', geocoderSearch)
                  .append('div')
                  .attr('class', 'label')
                  .append('span')
                  .attr('class', 'entity-name')
                  .html(t.html('geocoder.search'));
            }
=======
        var label = enter
            .append('div')
            .attr('class', 'label');

        label
            .append('span')
            .attr('class', 'entity-geom-icon')
            .each(function(d) {
                d3_select(this)
                    .call(svgIcon('#iD-icon-' + d.geometry, 'pre-text'));
            });
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        label
            .append('span')
            .attr('class', 'entity-type')
            .text(function(d) { return d.type; });

        label
            .append('span')
            .attr('class', 'entity-name')
            .text(function(d) { return d.name; });

        enter
            .style('opacity', 0)
            .transition()
            .style('opacity', 1);

        items.order();

        items.exit()
            .remove();


        var resultsIndicator = list.selectAll('.no-results-item')
            .data((value.length && !results.length) ? [0] : []);

<<<<<<< HEAD
            label
                .append('span')
                .attr('class', 'entity-type')
                .html(function(d) { return d.type; });

            label
                .append('span')
                .attr('class', 'entity-name')
                .html(function(d) { return d.name; });
=======
        resultsIndicator.exit().remove();

        resultsIndicator
            .enter()
            .insert('button', '.geocode-item')
            .property('disabled', true)
            .attr('class', 'no-results-item')
            .call(svgIcon('#iD-icon-alert', 'pre-text'))
            .append('span')
            .attr('class', 'entity-name')
            .text(t('geocoder.no_results_worldwide'));
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        var geocodeItem = list.selectAll('.geocode-item')
            .data((services.geocoder && value && _geocodeResults === undefined) ? [0] : []);

        geocodeItem.exit().remove();

        geocodeItem
            .enter()
            .append('button')
            .attr('class', 'geocode-item secondary')
            .on('click', geocoderSearch)
            .append('div')
            .attr('class', 'label')
            .append('span')
            .attr('class', 'entity-name')
            .text(t('geocoder.search'));
    }


<<<<<<< HEAD
        function mouseover(d3_event, d) {
            if (d.id === -1) return;

            utilHighlightEntities([d.id], true, context);
        }


        function mouseout(d3_event, d) {
            if (d.id === -1) return;

            utilHighlightEntities([d.id], false, context);
        }


        function click(d3_event, d) {
            d3_event.preventDefault();

            if (d.location) {
                context.map().centerZoomEase([d.location[1], d.location[0]], 19);

            } else if (d.entity) {
                utilHighlightEntities([d.id], false, context);

                context.enter(modeSelect(context, [d.entity.id]));
                context.map().zoomToEase(d.entity);

            } else {
                // download, zoom to, and select the entity with the given ID
                context.zoomToEntity(d.id);
=======
    function mouseover(d) {
        if (d.id === -1) return;

        context.surface().selectAll(utilEntityOrMemberSelector([d.id], context.graph()))
            .classed('hover', true);
    }


    function mouseout() {
        context.surface().selectAll('.hover')
            .classed('hover', false);
    }


    function click(d) {
        d3_event.preventDefault();
        if (d.location) {
            context.map().centerZoomEase([d.location[1], d.location[0]], 19);
        }
        else if (d.entity) {
            if (d.entity.type === 'node') {
                context.map().center(d.entity.loc);
            } else if (d.entity.type === 'way') {
                var center = context.projection(context.map().center());
                var edge = geoChooseEdge(context.childNodes(d.entity), center, context.projection);
                context.map().center(edge.loc);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            }
            context.enter(modeSelect(context, [d.entity.id]));
        } else {
            context.zoomToEntity(d.id);
        }
    }


    function geocoderSearch() {
        services.geocoder.search(search.property('value'), function (err, resp) {
            _geocodeResults = resp || [];
            drawList();
        });
    }


    return featureList;
}
