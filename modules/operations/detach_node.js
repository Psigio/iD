import { actionDetachNode } from '../actions/index';
import { behaviorOperation } from '../behavior/index';
import { modeMove } from '../modes/index';
import { t } from '../util/locale';
import _flatMap from 'lodash-es/flatMap';
import _uniq from 'lodash-es/uniq';

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
        var restrictionViaNodeIds = _flatMap(nodes, function (node) {
            // Get the relations that this node belongs to
            var relationsFromNode = graph.parentRelations(node);
            // Check each relation in turn
            return _flatMap(relationsFromNode, function (relation) {
                // Check to see if this is a restriction relation, if not return null
                if (!relation.isValidRestriction()) {
                    console.log('nul');
                    return null;
                }
                // We have identified that it is a restriction, extract the via members
                // The via members can be either nodes or ways.  Ways do not prevent us removing a node
                // from within them, as it is the way itself which is in the relation with the via role,
                // and not the consitutent nodes (so if we switch out a constituent node, the way id
                // does not change and therefore the relation will not be affected).  Therefore we 
                // only need to examine the standalone nodes
                var viaNodes = relation.members.filter(function (m) { return m.role === 'via' && m.type === 'node'; })
                    .map(function (m) { return m.id; });
                // As this operation only works on Nodes, we only need to check the via role
                // https://wiki.openstreetmap.org/wiki/Relation:restriction indicates that
                // from & to roles are only appropriate for Ways
                // TODO: add logic for location_hint nodes also
                return viaNodes;
            });
        }).filter(function (i) { return i !== null; });

        // Get unique list of ids in restrictionViaNodes to simplify checking
        var viaNodeIds = _uniq(restrictionViaNodeIds);

        // Now we have a list of via nodes, we should prevent detachment if the target node is in this list
        var anyVias = nodes.filter(function (n) {
            return viaNodeIds.indexOf(n.id) !== -1;
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
