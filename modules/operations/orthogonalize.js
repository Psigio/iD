import { t } from '../core/localizer';
import { actionOrthogonalize } from '../actions/orthogonalize';
import { behaviorOperation } from '../behavior/operation';
import { utilGetAllNodes } from '../util';


<<<<<<< HEAD
export function operationOrthogonalize(context, selectedIDs) {
    var _extent;
    var _type;
    var _actions = selectedIDs.map(chooseAction).filter(Boolean);
    var _amount = _actions.length === 1 ? 'single' : 'multiple';
    var _coords = utilGetAllNodes(selectedIDs, context.graph())
        .map(function(n) { return n.loc; });
=======
export function operationOrthogonalize(selectedIDs, context) {
    var _extent;
    var type;
    var actions = selectedIDs.map(chooseAction).filter(Boolean);
    var amount = actions.length === 1 ? 'single' : 'multiple';
    var nodes = utilGetAllNodes(selectedIDs, context.graph());
    var coords = nodes.map(function(n) { return n.loc; });
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444


    function chooseAction(entityID) {

        var entity = context.entity(entityID);
<<<<<<< HEAD
        var geometry = entity.geometry(context.graph());
=======
        var geometry = context.geometry(entityID);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        if (!_extent) {
            _extent =  entity.extent(context.graph());
        } else {
            _extent = _extent.extend(entity.extent(context.graph()));
        }

        // square a line/area
        if (entity.type === 'way' && new Set(entity.nodes).size > 2 ) {
<<<<<<< HEAD
            if (_type && _type !== 'feature') return null;
            _type = 'feature';
=======
            if (type && type !== 'feature') return null;
            type = 'feature';
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            return actionOrthogonalize(entityID, context.projection);

        // square a single vertex
        } else if (geometry === 'vertex') {
<<<<<<< HEAD
            if (_type && _type !== 'corner') return null;
            _type = 'corner';
=======
            if (type && type !== 'corner') return null;
            type = 'corner';
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            var graph = context.graph();
            var parents = graph.parentWays(entity);
            if (parents.length === 1) {
                var way = parents[0];
                if (way.nodes.indexOf(entityID) !== -1) {
                    return actionOrthogonalize(way.id, context.projection, entityID);
                }
            }
        }

        return null;
    }


    var operation = function() {
<<<<<<< HEAD
        if (!_actions.length) return;

        var combinedAction = function(graph, t) {
            _actions.forEach(function(action) {
=======
        if (!actions.length) return;

        var combinedAction = function(graph, t) {
            actions.forEach(function(action) {
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
                if (!action.disabled(graph)) {
                    graph = action(graph, t);
                }
            });
            return graph;
        };
        combinedAction.transitionable = true;

        context.perform(combinedAction, operation.annotation());

        window.setTimeout(function() {
            context.validator().validate();
        }, 300);  // after any transition
    };


<<<<<<< HEAD
    operation.available = function() {
        return _actions.length && selectedIDs.length === _actions.length;
=======
    operation.available = function(situation) {
        if (!actions.length || selectedIDs.length !== actions.length) return false;

        if (situation === 'toolbar' &&
            actions.every(function(action) {
                return action.disabled(context.graph()) === 'end_vertex';
            })) return false;

        return true;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };


    // don't cache this because the visible extent could change
    operation.disabled = function() {
<<<<<<< HEAD
        if (!_actions.length) return '';

        var actionDisableds = _actions.map(function(action) {
            return action.disabled(context.graph());
        }).filter(Boolean);

        if (actionDisableds.length === _actions.length) {
            // none of the features can be squared

            if (new Set(actionDisableds).size > 1) {
                return 'multiple_blockers';
            }
            return actionDisableds[0];
        } else if (_extent &&
                   _extent.percentContainedIn(context.map().extent()) < 0.8) {
=======
        if (!actions.length) return '';

        var actionDisabled;

        var actionDisableds = {};

        if (actions.every(function(action) {
            var disabled = action.disabled(context.graph());
            if (disabled) actionDisableds[disabled] = true;
            return disabled;
        })) {
            actionDisabled = actions[0].disabled(context.graph());
        }

        if (actionDisabled) {
            if (Object.keys(actionDisableds).length > 1) {
                return 'multiple_blockers';
            }
            return actionDisabled;
        } else if (type !== 'corner' &&
                   _extent.percentContainedIn(context.extent()) < 0.8) {
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            return 'too_large';
        } else if (someMissing()) {
            return 'not_downloaded';
        } else if (selectedIDs.some(context.hasHiddenConnections)) {
            return 'connected_to_hidden';
        }

        return false;


        function someMissing() {
            if (context.inIntro()) return false;
            var osm = context.connection();
            if (osm) {
                var missing = _coords.filter(function(loc) { return !osm.isDataLoaded(loc); });
                if (missing.length) {
                    missing.forEach(function(loc) { context.loadTileAtLoc(loc); });
                    return true;
                }
            }
            return false;
        }
    };


    operation.tooltip = function() {
        var disable = operation.disabled();
        return disable ?
<<<<<<< HEAD
            t('operations.orthogonalize.' + disable + '.' + _amount) :
            t('operations.orthogonalize.description.' + _type + '.' + _amount);
=======
            t('operations.orthogonalize.' + disable + '.' + amount) :
            t('operations.orthogonalize.description.' + type + '.' + amount);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };


    operation.annotation = function() {
<<<<<<< HEAD
        return t('operations.orthogonalize.annotation.' + _type, { n: _actions.length });
=======
        return t('operations.orthogonalize.annotation.' + type + '.' + amount);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };


    operation.id = 'orthogonalize';
    operation.keys = [t('operations.orthogonalize.key')];
    operation.title = t('operations.orthogonalize.title');
    operation.behavior = behaviorOperation(context).which(operation);

    return operation;
}
