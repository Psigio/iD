import { osmNode } from '../osm';

export function actionDetachNode(nodeId) {
    return function (graph) {
        // Get the point in question
        var node = graph.entity(nodeId);
        // Get all of the ways & relations it's currently attached to
        var parentWays = graph.parentWays(node);
        var parentRels = graph.parentRelations(node);
        // Create a new node to replace the one we will detach
        var replacementNode = osmNode({ loc: node.loc });
        // We need to process each way in turn, updating the graph as we go
        var updatedWaysGraph = parentWays
            .reduce(function (accGraph, parentWay) {
                // Make a note of where in the way our target node is inside this way
                var originalIndex = parentWay.nodes.indexOf(nodeId);
                // Swap out the target node for the replacement
                var updatedWay = parentWay
                    .removeNode(nodeId) // Remove our target node from the parent way
                    .addNode(replacementNode.id, originalIndex); // Add in the replacement node in its place
                // Update the graph with the updated way
                return accGraph.replace(updatedWay);
            },
                // Seed the reduction with the input graph, updated to include the replacementNode so
                // that is accessible to the ways when we add it in to them
                graph.replace(replacementNode));
        // Process any relations too
        return parentRels
            .reduce(function (accGraph, parentRel) {
                // For the moment, move the relationship to the new node
                // Get role & index of original
                var originalMember = parentRel.memberById(nodeId);
                var newMember = { id: replacementNode.id, type: 'node', role: originalMember.role };
                var updatedRel = parentRel.removeMembersWithID(nodeId)
                    .addMember(newMember, originalMember.index);
                return accGraph.replace(updatedRel);
            }, updatedWaysGraph);
    };
}
