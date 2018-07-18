import { actionDetachNode } from '../actions/index';
import { behaviorOperation } from '../behavior/index';
import { modeMove } from '../modes/index';
import { t } from '../util/locale';
import _flatMap from 'lodash-es/flatMap';

export function operationDetachNode(selectedIDs, context) {
    var selectedNode = selectedIDs[0];
    var operation = function () {
        context.perform(actionDetachNode(selectedNode));
        context.enter(modeMove(context, [selectedNode], context.graph));
    };
    var hasTags = function (entity) {
        return Object.keys(entity.tags).length > 0;
    };
    operation.available = function () {
        // Check multiple items aren't selected
        if (selectedIDs.length !== 1) {
            return false;
        }
        // Get the entity itself
        var graph = context.graph();
        var entity = graph.hasEntity(selectedNode);
        if (!entity) {
            // This probably isn't possible
            return false;
        }
        // Confirm entity is a node with tags
        if (entity.type === 'node' && hasTags(entity)) {
            // Confirm that the node is owned by at least 1 parent way
            var parentWays = graph.parentWays(entity);
            return parentWays && parentWays.length > 0;
        }
        // Not appropriate
        return false;
    };
    operation.disabled = function () {
        return false;
    };
    operation.tooltip = function () {
        var disableReason = operation.disabled();
        return disableReason
            ? t('operations.detachNode.' + disableReason)
            : t('operations.detachNode.description');
    };
    operation.annotation = function () {
        return t('operations.detachNode.annotation');
    };
    operation.id = 'detachNode';
    operation.keys = [t('operations.detachNode.key')];
    operation.title = t('operations.detachNode.title');
    operation.behavior = behaviorOperation(context).which(operation);

    operation.disabled = function () {
        var graph = context.graph();
        // We should prevent the node being detached if it represents a via node of a turn restriction
        var nodes = selectedIDs.map(function (i) { return graph.entity(i); });
        // Get all via nodes of restrictions involving the target nodes
        var restrictionViaNodes = _flatMap(nodes, function (node) {
            // Get the relations that this node belongs to
            var relationsForNode = graph.parentRelations(node);
            // Check each relation in turn
            return _flatMap(relationsForNode, function (relation) {
                // Check to see if this is a restriction relation, if not return null
                if (!relation.isValidRestriction()) {
                    return null;
                }
                // We have identified that it is a restriction, extract the via nodes
                var viaNodes = relation.members.filter(function (m) { return m.role === 'via'; });
                return viaNodes;
            });
        }).filter(isNotNull);

        // Now we have a list of via nodes, we should prevent detachment if the target node is in this list
        var anyVias = nodes.filter(function (n) {
            var nodeId = n.id;
            return restrictionViaNodes
                .map(function (r) { return r.id; })
                .indexOf(nodeId) !== -1;
        });
        if (anyVias.length > 0) {
            // The node is a via, do not permit
            return 'via_restriction';
        }
        // We are ok to proceed
        return false;
    };

    return operation;
}

function isNotNull(item) {
    return item !== null;
}
