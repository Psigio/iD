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
            // Get the relations that this node belongs to and the relations any way the node belongs to
            var relationsFromNode = graph.parentRelations(node);
            var relationsFromWays = graph.parentWays(node).reduce(function (acc, parentWay) {
                // Get all of the relations from the way
                var wayRelations = graph.parentRelations(parentWay);
                return acc.concat(_flatMap(wayRelations, function (r) { return r; }));
            }, []);
            var allRelations = relationsFromNode.concat(relationsFromWays);
            // Check each relation in turn
            return _flatMap(allRelations, function (relation) {
                // Check to see if this is a restriction relation, if not return null
                if (!relation.isValidRestriction()) {
                    return null;
                }
                // We have identified that it is a restriction, extract the via members
                var viaMembers = relation.members.filter(function (m) { return m.role === 'via'; });
                // As via members can be either nodes or ways, we need to expand those ways out to their constituent nodes
                var viaNodes = _flatMap(viaMembers, function (member) {
                    if (member.type === 'node') {
                        return member.id;
                    }
                    if (member.type === 'way') {
                        // Get all of the nodes from the way
                        var way = graph.entity(member.id);
                        return _flatMap(way.nodes, function (wayMemberId) {
                            return wayMemberId;
                        });
                    }
                    // Unhandled type
                    return null;
                });
                return viaNodes;
            });
        }).filter(isNotNull);

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

function isNotNull(item) {
    return item !== null;
}
