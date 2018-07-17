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
        return t('operations.detachNode.description');
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
        var restrictionIDs = [];

        // Get the relevant nodes
        var nodes = selectedIDs
            .map(function (id) { return graph.entity(id); }); // Get the coresponding node

        // Disable if the nodes have multiple relations with conflicting roles
        nodes.forEach(function (node) {
            var seen = {};
            relations = graph.parentRelations(node);

            relations.forEach(function (relation) {
                relation = relations[j];
                role = relation.memberById(node.id).role || '';

                // if this node is a via node in a restriction, remember for later
                if (relation.isValidRestriction()) {
                    restrictionIDs.push(relation.id);
                }

                if (seen[relation.id] !== undefined && seen[relation.id] !== role) {
                    return 'relation';
                } else {
                    seen[relation.id] = role;
                }
            });
        });

        // Choose a survivor node, prefer an existing (not new) node - #4974
        var survivor = nodes.find(function (n) { return n.version !== undefined; }); // If the node has a version, it's already present

        // Gather restrictions for parent ways
        var restrictionsForParentWays = _flatMap(nodes, function (node) {
            return _flatMap(graph.parentWays(node), function (parent) {
                return _flatMap(graph.parentRelations(parent), function (relation) {
                    return relation.isValidRestriction() ? relation.id : null;
                });
            });
        }).filter(isNotNull);

        // Test all restrictions
        restrictionIDs = _uniq(restrictionIDs.concat(restrictionsForParentWays));
        // Get the complete entities
        var relations = restrictionIDs.map(function (id) {
            var node = graph.entity(id);
            return node.isComplete(graph) ? node : null;
        }).filter(isNotNull);

        relations.forEach(function (relation) {

            var memberWays = _uniq(relation.members // Unique here?
                .filter(function (m) { return m.type === 'way'; })
                .map(function (m) { return graph.entity(m.id); }));

            var f = relation.memberByRole('from');
            var t = relation.memberByRole('to');
            var isUturn = (f.id === t.id);

            // 2a. disable if connection would damage a restriction
            // (a key node is a node at the junction of ways)
            var collectedNodes = relation.members
                .map(function (member) { return graph.hasEntity(member.id) })
                .filter(function (member) { return member })
                .reduce(function (acc, member) {
                    var role = member.role || '';
                    var memberId = member.id;
                    var node = { id: memberId, role: role, keyfrom: [], keyto: [] };
                    if (member.type === 'node' && role === 'via') {
                        node.keyfrom.push(memberId);
                        node.keyto.push(memberId);
                    } else if (member.type === 'way') {
                        node.waynodes = member.nodes;
                        if (role === 'from' || role === 'via') {
                            node.keyfrom.push(entity.first());
                            node.keyfrom.push(entity.last());
                        }
                        if (role === 'to' || role === 'via') {
                            node.keyto.push(entity.first());
                            node.keyto.push(entity.last());
                        }
                    }
                    return acc.concat(node);
                }, []);

            var uniqueKeyfrom = _uniq(collectedNodes.map(function (n) { n.keyfrom }).filter(hasDuplicates));
            var uniqueKeyto = _uniq(collectedNodes.map(function (n) { n.keyto }).filter(hasDuplicates));

            var filter = keyNodeFilter(uniqueKeyfrom, uniqueKeyto);
            var fromNodes = idsByRole(collectedNodes, 'from').filter(filter);
            var viaNodes = idsByRole(collectedNodes, 'via').filter(filter);
            var toNodes = idsByRole(collectedNodes, 'to').filter(filter);

            var connectFrom = false;
            var connectVia = false;
            var connectTo = false;
            var connectKeyFrom = false;
            var connectKeyTo = false;

            for (j = 0; j < nodeIDs.length; j++) {
                var n = nodeIDs[j];
                if (fromNodes.indexOf(n) !== -1) { connectFrom = true; }
                if (viaNodes.indexOf(n) !== -1) { connectVia = true; }
                if (toNodes.indexOf(n) !== -1) { connectTo = true; }
                if (uniqueKeyfrom.indexOf(n) !== -1) { connectKeyFrom = true; }
                if (uniqueKeyto.indexOf(n) !== -1) { connectKeyTo = true; }
            }
            if (connectFrom && connectTo && !isUturn) { return 'restriction'; }
            if (connectFrom && connectVia) { return 'restriction'; }
            if (connectTo && connectVia) { return 'restriction'; }

            // connecting to a key node -
            // if both nodes are on a member way (i.e. part of the turn restriction),
            // the connecting node must be adjacent to the key node.
            if (connectKeyFrom || connectKeyTo) {
                if (nodeIDs.length !== 2) { return 'restriction'; }

                var n0id = nodeIDs[0];
                var n1id = nodeIDs[1];
                var nodesFound = memberWays.reduce(function (acc, way) {
                    return {
                        n0: way.contains(n0id) ? n0id : acc.n0,
                        n1: way.contains(n1id) ? n1id : acc.n1
                    };
                }, { n0: null, n1: null });
                if (nodesFound.n0 && nodesFound.n1) {    // both nodes are part of the restriction
                    var ok = memberWays.find(function (way) {
                        return way.areAdjacent(nodesFound.n0, nodesFound.n1);
                    }).map(function (value) { return value !== undefined; });
                    if (!ok) {
                        return 'restriction';
                    }
                }
            }

            // 2b. disable if nodes being connected will destroy a member way in a restriction
            // (to test, make a copy and try actually connecting the nodes)
            var anyDegenerate = memberWays.first(function (way) {
                var clone = way.update({}); // make copy
                var survivorId = survivor.id;
                var updatedClone = nodeIDs.reduce(function (acc, nodeID) {
                    if (nodeID === survivorId) {
                        return acc;
                    }
                    if (acc.areAdjacent(nodeID, survivorId)) {
                        return acc.removeNode(nodeID);
                    }
                    return acc.replaceNode(nodeID, survivorId);
                }, clone);
                if (updatedClone.isDegenerate) {
                    return true;
                }
            });
            if (anyDegenerate === true) {
                return 'restriction';
            }
        });

        // All relations tested - not disabled
        return false;

        function isNotNull(item) {
            return item !== null;
        }
        function idsByRole(collection, role) {
            collection.filter(function (n) { return n.role === role; }).map(function (n) { return n.id });
        }

        // if a key node appears multiple times (indexOf !== lastIndexOf) it's a FROM-VIA or TO-VIA junction
        function hasDuplicates(n, i, arr) {
            return arr.indexOf(n) !== arr.lastIndexOf(n);
        }

        function keyNodeFilter(froms, tos) {
            return function (n) {
                return froms.indexOf(n) === -1 && tos.indexOf(n) === -1;
            };
        }
    };

    return operation;
}
