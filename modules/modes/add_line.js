import { actionAddEntity } from '../actions/add_entity';
import { actionAddMidpoint } from '../actions/add_midpoint';
import { actionAddVertex } from '../actions/add_vertex';

import { behaviorAddWay } from '../behavior/add_way';
import { modeBrowse } from './browse';
import { modeSelect } from './select';
import { modeDrawLine } from './draw_line';
import { osmNode, osmWay } from '../osm';


export function modeAddLine(context, mode) {
    mode.id = 'add-line';

    var behavior = behaviorAddWay(context)
        .on('start', start)
        .on('startFromWay', startFromWay)
        .on('startFromNode', startFromNode)
        .on('cancel', cancel)
        .on('finish', finish);

    mode.defaultTags = {};
    if (mode.preset) mode.defaultTags = mode.preset.setTags(mode.defaultTags, 'line');

    var _repeatAddedFeature = false;
    var _allAddedEntityIDs = [];

    mode.repeatAddedFeature = function(val) {
        if (!arguments.length || val === undefined) return _repeatAddedFeature;
        _repeatAddedFeature = val;
        return mode;
    };

    mode.addedEntityIDs = function() {
        return _allAddedEntityIDs.filter(function(id) {
            return context.hasEntity(id);
        });
    };

    mode.addAddedEntityID = function(entityID) {
        if (_allAddedEntityIDs.indexOf(entityID) === -1) {
            _allAddedEntityIDs.push(entityID);
        }
    };

    mode.defaultNodeTags = null;

    function start(loc) {
        var startGraph = context.graph();
        var node = osmNode({ loc: loc, tags: mode.defaultNodeTags || {} });
        var way = osmWay({ tags: mode.defaultTags });

        context.perform(
            actionAddEntity(node),
            actionAddEntity(way),
            actionAddVertex(way.id, node.id)
        );

<<<<<<< HEAD
        context.enter(modeDrawLine(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function startFromWay(loc, edge) {
        var startGraph = context.graph();
        var node = osmNode({ loc: loc, tags: mode.defaultNodeTags || {} });
        var way = osmWay({ tags: mode.defaultTags });

        context.perform(
            actionAddEntity(node),
            actionAddEntity(way),
            actionAddVertex(way.id, node.id),
            actionAddMidpoint({ loc: loc, edge: edge }, node)
        );

<<<<<<< HEAD
        context.enter(modeDrawLine(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function startFromNode(node) {
        var startGraph = context.graph();
        var way = osmWay({ tags: mode.defaultTags });

        context.perform(
            actionAddEntity(way),
            actionAddVertex(way.id, node.id)
        );

<<<<<<< HEAD
        context.enter(modeDrawLine(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
    }


    function enterDrawMode(way, startGraph) {
        _allAddedEntityIDs.push(way.id);
        var drawMode = modeDrawLine(context, {
            wayID: way.id,
            startGraph: startGraph,
            baselineGraph: context.graph(),
            button: mode.button,
            defaultNodeTags: mode.defaultNodeTags,
            addMode: mode
        });
        context.enter(drawMode);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function undone() {
        context.enter(modeBrowse(context));
    }


    function cancel() {
        context.enter(modeBrowse(context));
    }

    function finish() {
        mode.finish();
    }

    mode.finish = function() {
        if (mode.addedEntityIDs().length) {
            context.enter(
                modeSelect(context, mode.addedEntityIDs()).newFeature(true)
            );
        } else {
            context.enter(
                modeBrowse(context)
            );
        }
    };


    mode.enter = function() {
        context.install(behavior);
        context.history()
            .on('undone.add_line', undone);
    };


    mode.exit = function() {
        context.uninstall(behavior);
        context.history()
            .on('undone.add_line', null);
    };

    return mode;
}
