import { actionAddEntity } from '../actions/add_entity';
import { actionAddMidpoint } from '../actions/add_midpoint';
import { actionAddVertex } from '../actions/add_vertex';

import { behaviorAddWay } from '../behavior/add_way';
import { modeBrowse } from './browse';
import { modeSelect } from './select';
import { modeDrawArea } from './draw_area';
import { osmNode, osmWay } from '../osm';


export function modeAddArea(context, mode) {
    mode.id = 'add-area';

    var behavior = behaviorAddWay(context)
        .on('start', start)
        .on('startFromWay', startFromWay)
        .on('startFromNode', startFromNode)
        .on('cancel', cancel)
        .on('finish', finish);

    var defaultTags = { area: 'yes' };
    if (mode.preset) defaultTags = mode.preset.setTags(defaultTags, 'area');

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


    function actionClose(wayId) {
        return function (graph) {
            return graph.replace(graph.entity(wayId).close());
        };
    }


    function start(loc) {
        var startGraph = context.graph();
        var node = osmNode({ loc: loc });
        var way = osmWay({ tags: defaultTags });

        context.perform(
            actionAddEntity(node),
            actionAddEntity(way),
            actionAddVertex(way.id, node.id),
            actionClose(way.id)
        );

<<<<<<< HEAD
        context.enter(modeDrawArea(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function startFromWay(loc, edge) {
        var startGraph = context.graph();
        var node = osmNode({ loc: loc });
        var way = osmWay({ tags: defaultTags });

        context.perform(
            actionAddEntity(node),
            actionAddEntity(way),
            actionAddVertex(way.id, node.id),
            actionClose(way.id),
            actionAddMidpoint({ loc: loc, edge: edge }, node)
        );

<<<<<<< HEAD
        context.enter(modeDrawArea(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function startFromNode(node) {
        var startGraph = context.graph();
        var way = osmWay({ tags: defaultTags });

        context.perform(
            actionAddEntity(way),
            actionAddVertex(way.id, node.id),
            actionClose(way.id)
        );

<<<<<<< HEAD
        context.enter(modeDrawArea(context, way.id, startGraph, mode.button));
=======
        enterDrawMode(way, startGraph);
    }


    function enterDrawMode(way, startGraph) {
        _allAddedEntityIDs.push(way.id);
        var drawMode = modeDrawArea(context, way.id, startGraph, context.graph(), mode.button, mode);
        context.enter(drawMode);
    }


    function undone() {
        context.enter(modeBrowse(context));
    }


    function cancel() {
        context.enter(modeBrowse(context));
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
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
            .on('undone.add_area', undone);
    };


    mode.exit = function() {
        context.uninstall(behavior);
        context.history()
            .on('undone.add_area', null);
    };


    return mode;
}
