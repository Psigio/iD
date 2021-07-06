import { dispatch as d3_dispatch } from 'd3-dispatch';

import {
    select as d3_select
} from 'd3-selection';

import { presetManager } from '../presets';
import { t } from '../core/localizer';
import { actionAddMidpoint } from '../actions/add_midpoint';
import { actionChangeTags } from '../actions/change_tags';
import { actionMoveNode } from '../actions/move_node';
import { behaviorDraw } from './draw';
import { geoChooseEdge, geoHasSelfIntersections } from '../geo';
import { modeBrowse } from '../modes/browse';
import { modeSelect } from '../modes/select';
import { osmNode } from '../osm/node';
import { utilRebind } from '../util/rebind';
import { utilKeybinding } from '../util';

export function behaviorDrawWay(context, wayID, mode, startGraph) {

    var dispatch = d3_dispatch('rejectedSelfIntersection');

    var behavior = behaviorDraw(context);

<<<<<<< HEAD
    // Must be set by `drawWay.nodeIndex` before each install of this behavior.
    var _nodeIndex;

    var _origWay;
    var _wayGeometry;
    var _headNodeID;
    var _annotation;

    var _pointerHasMoved = false;

    // The osmNode to be placed.
    // This is temporary and just follows the mouse cursor until an "add" event occurs.
    var _drawNode;

    var _didResolveTempEdit = false;

    function createDrawNode(loc) {
        // don't make the draw node until we actually need it
        _drawNode = osmNode({ loc: loc });

        context.pauseChangeDispatch();
        context.replace(function actionAddDrawNode(graph) {
            // add the draw node to the graph and insert it into the way
            var way = graph.entity(wayID);
            return graph
                .replace(_drawNode)
                .replace(way.addNode(_drawNode.id, _nodeIndex));
        }, _annotation);
        context.resumeChangeDispatch();

        setActiveElements();
    }

    function removeDrawNode() {

        context.pauseChangeDispatch();
        context.replace(
            function actionDeleteDrawNode(graph) {
               var way = graph.entity(wayID);
               return graph
                   .replace(way.removeNode(_drawNode.id))
                   .remove(_drawNode);
           },
            _annotation
        );
        _drawNode = undefined;
        context.resumeChangeDispatch();
    }
=======
    var end = osmNode({ loc: context.map().mouseCoordinates() });

    // Add the drawing node to the graph.
    // We must make sure to remove this edit later if drawing is canceled.
    context.pauseChangeDispatch();
    context.perform(_actionAddDrawNode(), annotation);
    context.resumeChangeDispatch();
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444


    function keydown(d3_event) {
        if (d3_event.keyCode === utilKeybinding.modifierCodes.alt) {
            if (context.surface().classed('nope')) {
                context.surface()
                    .classed('nope-suppressed', true);
            }
            context.surface()
                .classed('nope', false)
                .classed('nope-disabled', true);
        }
    }


    function keyup(d3_event) {
        if (d3_event.keyCode === utilKeybinding.modifierCodes.alt) {
            if (context.surface().classed('nope-suppressed')) {
                context.surface()
                    .classed('nope', true);
            }
            context.surface()
                .classed('nope-suppressed', false)
                .classed('nope-disabled', false);
        }
    }


    function allowsVertex(d) {
        return d.geometry(context.graph()) === 'vertex' || presetManager.allowsVertex(d, context.graph());
    }


    // related code
    // - `mode/drag_node.js`     `doMove()`
    // - `behavior/draw.js`      `click()`
    // - `behavior/draw_way.js`  `move()`
    function move(d3_event, datum) {

        var loc = context.map().mouseCoordinates();

        if (!_drawNode) createDrawNode(loc);

        context.surface().classed('nope-disabled', d3_event.altKey);

        var targetLoc = datum && datum.properties && datum.properties.entity &&
            allowsVertex(datum.properties.entity) && datum.properties.entity.loc;
        var targetNodes = datum && datum.properties && datum.properties.nodes;

        if (targetLoc) {   // snap to node/vertex - a point target with `.loc`
            loc = targetLoc;

        } else if (targetNodes) {   // snap to way - a line target with `.nodes`
            var choice = geoChooseEdge(targetNodes, context.map().mouse(), context.projection, _drawNode.id);
            if (choice) {
                loc = choice.loc;
            }
        } else {
            if (context.storage('line-segments') === 'orthogonal') {
                var orthoLoc = orthogonalLoc(loc);
                if (orthoLoc) loc = orthoLoc;
            }
<<<<<<< HEAD
        }

        context.replace(actionMoveNode(_drawNode.id, loc), _annotation);
        _drawNode = context.entity(_drawNode.id);
        checkGeometry(true /* includeDrawNode */);
    }

    function orthogonalLoc(mouseLoc) {
        var way = context.hasEntity(wayID);
        if (!way) return null;

        if (way.nodes.length - 1 < (way.isArea() ? 3 : 2)) return null;

        var node1, node2;
        if (way.isArea() ? way.nodes[way.nodes.length - 2] === end.id : way.last() === end.id) {
            var baselineNodeIndex = way.isClosed() ? way.nodes.length - 3 : way.nodes.length - 2;
            node1 = context.hasEntity(way.nodes[baselineNodeIndex - 1]);
            node2 = context.hasEntity(way.nodes[baselineNodeIndex]);
        } else {
            node1 = context.hasEntity(way.nodes[2]);
            node2 = context.hasEntity(way.nodes[1]);
        }


        if (!node1 || !node2 ||
            node1.loc === node2.loc) return null;

        var projection = context.projection;

        var pA = projection(node1.loc),
            pB = projection(node2.loc),
            p3 = projection(mouseLoc);

        var xA = pA[0],
            yA = pA[1],
            xB = pB[0],
            yB = pB[1],
            x3 = p3[0],
            y3 = p3[1];

        var x1 = xB,
            y1 = yB,
            x2 = xB + 1,
            y2;

        if (xA === xB) {
            y2 = y1;
        } else {
            var slope = (yB-yA)/(xB-xA);
            var perpSlope = -1/slope;
            var b = yB - perpSlope*xB;
            y2 = perpSlope * x2 + b;
        }

        var k = ((y2-y1) * (x3-x1) - (x2-x1) * (y3-y1)) / (Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
        var x4 = x3 - k * (y2-y1);
        var y4 = y3 + k * (x2-x1);

        if (!isFinite(x4) || !isFinite(y4)) return null;

        return projection.invert([x4, y4]);
=======
        }

        context.replace(actionMoveNode(end.id, loc), annotation);
        end = context.entity(end.id);
        checkGeometry(false);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }

    function orthogonalLoc(mouseLoc) {
        var way = context.hasEntity(wayID);
        if (!way) return null;

        if (way.nodes.length - 1 < (way.isArea() ? 3 : 2)) return null;

        var node1, node2;
        if (way.isArea() ? way.nodes[way.nodes.length - 2] === end.id : way.last() === end.id) {
            var baselineNodeIndex = way.isClosed() ? way.nodes.length - 3 : way.nodes.length - 2;
            node1 = context.hasEntity(way.nodes[baselineNodeIndex - 1]);
            node2 = context.hasEntity(way.nodes[baselineNodeIndex]);
        } else {
            node1 = context.hasEntity(way.nodes[2]);
            node2 = context.hasEntity(way.nodes[1]);
        }


        if (!node1 || !node2 ||
            node1.loc === node2.loc) return null;

        var projection = context.projection;

        var pA = projection(node1.loc),
            pB = projection(node2.loc),
            p3 = projection(mouseLoc);

        var xA = pA[0],
            yA = pA[1],
            xB = pB[0],
            yB = pB[1],
            x3 = p3[0],
            y3 = p3[1];

        var x1 = xB,
            y1 = yB,
            x2 = xB + 1,
            y2;

        if (xA === xB) {
            y2 = y1;
        } else {
            var slope = (yB-yA)/(xB-xA);
            var perpSlope = -1/slope;
            var b = yB - perpSlope*xB;
            y2 = perpSlope * x2 + b;
        }

        var k = ((y2-y1) * (x3-x1) - (x2-x1) * (y3-y1)) / (Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
        var x4 = x3 - k * (y2-y1);
        var y4 = y3 + k * (x2-x1);

        if (!isFinite(x4) || !isFinite(y4)) return null;

        return projection.invert([x4, y4]);
    }


    // Check whether this edit causes the geometry to break.
    // If so, class the surface with a nope cursor.
    // `includeDrawNode` - Only check the relevant line segments if finishing drawing
    function checkGeometry(includeDrawNode) {
        var nopeDisabled = context.surface().classed('nope-disabled');
        var isInvalid = isInvalidGeometry(includeDrawNode);

        if (nopeDisabled) {
            context.surface()
                .classed('nope', false)
                .classed('nope-suppressed', isInvalid);
        } else {
            context.surface()
                .classed('nope', isInvalid)
                .classed('nope-suppressed', false);
        }
    }


    function isInvalidGeometry(includeDrawNode) {

        var testNode = _drawNode;

        // we only need to test the single way we're drawing
        var parentWay = context.graph().entity(wayID);
        var nodes = context.graph().childNodes(parentWay).slice();  // shallow copy

        if (includeDrawNode) {
            if (parentWay.isClosed()) {
                // don't test the last segment for closed ways - #4655
                // (still test the first segment)
                nodes.pop();
            }
        } else { // discount the draw node

            if (parentWay.isClosed()) {
                if (nodes.length < 3) return false;
                if (_drawNode) nodes.splice(-2, 1);
                testNode = nodes[nodes.length - 2];
            } else {
                // there's nothing we need to test if we ignore the draw node on open ways
                return false;
            }
        }

        return testNode && geoHasSelfIntersections(nodes, testNode.id);
    }


    function undone() {
<<<<<<< HEAD

        // undoing removed the temp edit
        _didResolveTempEdit = true;

        context.pauseChangeDispatch();

        var nextMode;

        if (context.graph() === startGraph) {
            // We've undone back to the initial state before we started drawing.
            // Just exit the draw mode without undoing whatever we did before
            // we entered the draw mode.
            nextMode = modeSelect(context, [wayID]);
        } else {
            // The `undo` only removed the temporary edit, so here we have to
            // manually undo to actually remove the last node we added. We can't
            // use the `undo` function since the initial "add" graph doesn't have
            // an annotation and so cannot be undone to.
            context.pop(1);

            // continue drawing
            nextMode = mode;
=======
        shouldResetOnOff = false;
        context.pauseChangeDispatch();

        if (context.graph() === baselineGraph || context.graph() === startGraph) {    // We've undone back to the beginning
            // baselineGraph may be behind startGraph if this way was added rather than continued
            resetToStartGraph();
            context.resumeChangeDispatch();
            context.enter(modeSelect(context, [wayID]));
        } else {
            // Remove whatever segment was drawn previously
            context.pop(1);

            context.resumeChangeDispatch();
            // continue drawing
            context.enter(mode);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        }

        // clear the redo stack by adding and removing a blank edit
        context.perform(actionNoop());
        context.pop(1);

        context.resumeChangeDispatch();
        context.enter(nextMode);
    }


    function setActiveElements() {
        if (!_drawNode) return;

        context.surface().selectAll('.' + _drawNode.id)
            .classed('active', true);
    }


    function resetToStartGraph() {
        while (context.graph() !== startGraph) {
            context.pop();
        }
    }


    var drawWay = function(surface) {
        _drawNode = undefined;
        _didResolveTempEdit = false;
        _origWay = context.entity(wayID);

        if (typeof _nodeIndex === 'number') {
            _headNodeID = _origWay.nodes[_nodeIndex];
        } else if (_origWay.isClosed()) {
            _headNodeID = _origWay.nodes[_origWay.nodes.length - 2];
        } else {
            _headNodeID = _origWay.nodes[_origWay.nodes.length - 1];
        }

        _wayGeometry = _origWay.geometry(context.graph());
        _annotation = t((_origWay.nodes.length === (_origWay.isClosed() ? 2 : 1) ?
            'operations.start.annotation.' :
            'operations.continue.annotation.') + _wayGeometry
        );
        _pointerHasMoved = false;

        // Push an annotated state for undo to return back to.
        // We must make sure to replace or remove it later.
        context.pauseChangeDispatch();
        context.perform(actionNoop(), _annotation);
        context.resumeChangeDispatch();

        behavior.hover()
            .initialNodeID(_headNodeID);

        behavior
            .on('move', function() {
                _pointerHasMoved = true;
                move.apply(this, arguments);
            })
            .on('down', function() {
                move.apply(this, arguments);
            })
            .on('downcancel', function() {
                if (_drawNode) removeDrawNode();
            })
            .on('click', drawWay.add)
            .on('clickWay', drawWay.addWay)
            .on('clickNode', drawWay.addNode)
            .on('undo', context.undo)
            .on('cancel', drawWay.cancel)
            .on('finish', drawWay.finish);

        d3_select(window)
            .on('keydown.drawWay', keydown)
            .on('keyup.drawWay', keyup);

        context.map()
            .dblclickZoomEnable(false)
            .on('drawn.draw', setActiveElements);

        setActiveElements();

        surface.call(behavior);

        context.history()
            .on('undone.draw', undone);
    };

    var shouldResetOnOff = true;
    drawWay.off = function(surface) {
<<<<<<< HEAD

        if (!_didResolveTempEdit) {
            // Drawing was interrupted unexpectedly.
            // This can happen if the user changes modes,
            // clicks geolocate button, a hashchange event occurs, etc.

=======
        // Drawing was interrupted unexpectedly.
        // This can happen if the user changes modes,
        // clicks geolocate button, a hashchange event occurs, etc.

        if (shouldResetOnOff) {
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            context.pauseChangeDispatch();
            resetToStartGraph();
            context.resumeChangeDispatch();
        }

        _drawNode = undefined;
        _nodeIndex = undefined;

        context.map()
            .on('drawn.draw', null);

        surface.call(behavior.off)
            .selectAll('.active')
            .classed('active', false);

        surface
            .classed('nope', false)
            .classed('nope-suppressed', false)
            .classed('nope-disabled', false);

        d3_select(window)
            .on('keydown.drawWay', null)
            .on('keyup.drawWay', null);

        context.history()
            .on('undone.draw', null);
    };


    function attemptAdd(d, loc, doAdd) {

        if (_drawNode) {
            // move the node to the final loc in case move wasn't called
            // consistently (e.g. on touch devices)
            context.replace(actionMoveNode(_drawNode.id, loc), _annotation);
            _drawNode = context.entity(_drawNode.id);
        } else {
            createDrawNode(loc);
        }

        checkGeometry(true /* includeDrawNode */);
        if ((d && d.properties && d.properties.nope) || context.surface().classed('nope')) {
            if (!_pointerHasMoved) {
                // prevent the temporary draw node from appearing on touch devices
                removeDrawNode();
            }
            dispatch.call('rejectedSelfIntersection', this);
            return;   // can't click here
        }

<<<<<<< HEAD
        context.pauseChangeDispatch();
        doAdd();
        // we just replaced the temporary edit with the real one
        _didResolveTempEdit = true;
        context.resumeChangeDispatch();

=======
        if (mode.defaultNodeTags && Object.keys(mode.defaultNodeTags).length) {
            context.replace(actionChangeTags(end.id, mode.defaultNodeTags), annotation);
        }

        shouldResetOnOff = false;
        checkGeometry(false);   // finishDraw = false
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        context.enter(mode);
    }


<<<<<<< HEAD
    // Accept the current position of the drawing node
    drawWay.add = function(loc, d) {
        attemptAdd(d, loc, function() {
            // don't need to do anything extra
        });
    };

=======
    // Connect the way to an existing way.
    drawWay.addWay = function(loc, edge, d) {
        if ((d && d.properties && d.properties.nope) || context.surface().classed('nope')) {
            return;   // can't click here
        }
        shouldResetOnOff = false;

        context.pauseChangeDispatch();
        
        if (mode.defaultNodeTags && Object.keys(mode.defaultNodeTags).length) {
            context.replace(actionChangeTags(end.id, mode.defaultNodeTags), annotation);
        }

        context.replace(
            actionAddMidpoint({ loc: loc, edge: edge }, end),
            annotation
        );
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    // Connect the way to an existing way
    drawWay.addWay = function(loc, edge, d) {
        attemptAdd(d, loc, function() {
            context.replace(
                actionAddMidpoint({ loc: loc, edge: edge }, _drawNode),
                _annotation
            );
        });
    };


    // Connect the way to an existing node
    drawWay.addNode = function(node, d) {
<<<<<<< HEAD

        // finish drawing if the mapper targets the prior node
        if (node.id === _headNodeID ||
            // or the first node when drawing an area
            (_origWay.isClosed() && node.id === _origWay.first())) {
            drawWay.finish();
            return;
        }
=======
        if ((d && d.properties && d.properties.nope) || context.surface().classed('nope')) {
            return;   // can't click here
        }
        shouldResetOnOff = false;

        context.pauseChangeDispatch();

        context.replace(
            _actionReplaceDrawNode(node),
            annotation
        );
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        attemptAdd(d, node.loc, function() {
            context.replace(
                function actionReplaceDrawNode(graph) {
                    // remove the temporary draw node and insert the existing node
                    // at the same index

                    graph = graph
                        .replace(graph.entity(wayID).removeNode(_drawNode.id))
                        .remove(_drawNode);
                    return graph
                        .replace(graph.entity(wayID).addNode(node.id, _nodeIndex));
                },
                _annotation
            );
        });
    };


    // Finish the draw operation, removing the temporary edit.
    // If the way has enough nodes to be valid, it's selected.
    // Otherwise, delete everything and return to browse mode.
    drawWay.finish = function() {
<<<<<<< HEAD
        checkGeometry(false /* includeDrawNode */);
        if (context.surface().classed('nope')) {
            dispatch.call('rejectedSelfIntersection', this);
            return;   // can't click here
        }

        context.pauseChangeDispatch();
        // remove the temporary edit
        context.pop(1);
        _didResolveTempEdit = true;
        context.resumeChangeDispatch();

=======
        shouldResetOnOff = false;
        checkGeometry(true);   // finishDraw = true
        if (context.surface().classed('nope')) {
            return false;   // can't click here
        }

        context.pauseChangeDispatch();
        context.pop(1);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        var way = context.hasEntity(wayID);
        if (!way || way.isDegenerate()) {
            drawWay.cancel();
            return false;
        }

        window.setTimeout(function() {
            context.map().dblclickZoomEnable(true);
        }, 1000);

        mode.didFinishAdding();

        return true;
    };


    // Cancel the draw operation, delete everything, and return to browse mode.
    drawWay.cancel = function() {
        shouldResetOnOff = false;
        context.pauseChangeDispatch();
        resetToStartGraph();
        context.resumeChangeDispatch();

        window.setTimeout(function() {
            context.map().dblclickZoomEnable(true);
        }, 1000);

        context.surface()
            .classed('nope', false)
            .classed('nope-disabled', false)
            .classed('nope-suppressed', false);

        context.enter(modeBrowse(context));
    };


    drawWay.nodeIndex = function(val) {
        if (!arguments.length) return _nodeIndex;
        _nodeIndex = val;
        return drawWay;
    };


    drawWay.activeID = function() {
        if (!arguments.length) return _drawNode && _drawNode.id;
        // no assign
        return drawWay;
    };


    return utilRebind(drawWay, dispatch, 'on');
}
