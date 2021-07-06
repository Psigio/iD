export function svgIcon(name, svgklass, useklass) {
    return function drawIcon(selection) {
<<<<<<< HEAD
        selection.selectAll('svg.icon' + (svgklass ? '.' + svgklass.split(' ')[0] : ''))
=======
        selection.selectAll('svg.icon' + (svgklass ? '.' + svgklass : ''))
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            .data([0])
            .enter()
            .append('svg')
            .attr('class', 'icon ' + (svgklass || ''))
            .append('use')
            .attr('xlink:href', name)
            .attr('class', useklass);
    };
}
