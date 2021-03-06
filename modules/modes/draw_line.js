import { t } from '../core/localizer';
import { behaviorDrawWay } from '../behavior/draw_way';
import { modeSelect } from './select';
import { utilDisplayLabel } from '../util';

export function modeDrawLine(context, mode) {

<<<<<<< HEAD
export function modeDrawLine(context, wayID, startGraph, button, affix, continuing) {
    var mode = {
        button: button,
        id: 'draw-line'
    };

    var behavior = behaviorDrawWay(context, wayID, mode, startGraph)
        .on('rejectedSelfIntersection.modeDrawLine', function() {
            context.ui().flash
                .iconName('#iD-icon-no')
                .label(t('self_intersection.error.lines'))();
        });

    mode.isContinuing = !!mode.affix;

    mode.preset = context.presets().match(context.entity(mode.wayID), context.graph());

    var behavior;

    mode.enter = function() {
        behavior
            .nodeIndex(affix === 'prefix' ? 0 : undefined);
=======
    if (!mode) mode = {};

    mode.id = 'draw-line';
    mode.button = mode.button || 'line';
    mode.title =  (mode.addMode && mode.addMode.title) || utilDisplayLabel(context.entity(mode.wayID), context);
    mode.geometry = 'line';

    mode.isContinuing = !!mode.affix;

    mode.preset = context.presets().match(context.entity(mode.wayID), context.graph());

    var behavior;

    mode.enter = function() {

        if (mode.addMode) {
            // add in case this draw mode was entered from somewhere besides the add mode itself
            mode.addMode.addAddedEntityID(mode.wayID);
        }

        var way = context.entity(mode.wayID);
        var index = (mode.affix === 'prefix') ? 0 : undefined;
        var headID = (mode.affix === 'prefix') ? way.first() : way.last();

        behavior = behaviorDrawWay(context, mode.wayID, index, mode, mode.startGraph, mode.baselineGraph)
            .tail(t('modes.draw_line.tail'));

        var addNode = behavior.addNode;
        behavior.addNode = function(node, d) {
            if (node.id === headID) {
                behavior.finish();
            } else {
                addNode(node, d);
            }
        };
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        context.install(behavior);
    };

    mode.exit = function() {
        context.uninstall(behavior);
    };

<<<<<<< HEAD
=======
    mode.repeatAddedFeature = function(val) {
        if (mode.addMode) return mode.addMode.repeatAddedFeature(val);
    };

    mode.addedEntityIDs = function() {
        if (mode.addMode) return mode.addMode.addedEntityIDs();
    };

    mode.didFinishAdding = function() {
        if (mode.repeatAddedFeature()) {
            context.enter(mode.addMode);
        }
        else {
            context.enter(modeSelect(context, mode.addedEntityIDs() || [mode.wayID]).newFeature(!mode.isContinuing));
        }
    };


>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    mode.selectedIDs = function() {
        return [mode.wayID];
    };

    mode.activeID = function() {
        return (behavior && behavior.activeID()) || [];
    };


    mode.finish = function(skipCompletion) {
        if (skipCompletion) {
            mode.didFinishAdding = function() {};
        }
        return behavior.finish();
    };


    return mode;
}
