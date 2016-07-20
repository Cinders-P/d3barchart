
$('#info').hide();
$(function () {
	$('#info').hide();

	let xpos = 0;
	let ypos = 0;
	$( document ).on( "mousemove", function( event ) {
	  xpos = event.pageX;
	  ypos = event.pageY;
	});
	$.ajax({
		url: 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json',
		type: 'GET',
		async: true, // async false will fail due to CORS
		dataType: "json", // important! comes back as string otherwise... -_-
		beforeSend(xhr) {
			xhr.withCredentials = true;
		},
		success(j) {
			const data = j.data;

			let height = 500;
			let width = 1000;

			const margin = {top: 20, right: 30, bottom: 50, left: 65};
			width = width - margin.left - margin.right;
			height = height - margin.top - margin.bottom;

			const chart = d3.select(".chart")  // using svg so height/width are attributes instead of styles
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			const y = d3.scaleLinear()
				.range([height, 0]) // want height to be placed @ bottom so we start at height
				.domain([0, d3.max(data, function (d) {return d[1]; })]);

			const x = d3.scaleLinear()
				.domain([0, height  - margin.top - margin.bottom])
				.range([0, width - margin.left]);

			const yAxis = d3.axisLeft().scale(y);
			const xAxis = d3.axisBottom().scale(x).tickFormat((d, i) => {
				console.log(i);
				 return (data[Math.floor((data.length-20) * 0.14) * i + 20])[0].slice(0, 4);
			 });

			const yAxisGroup = chart.append('g').call(yAxis)
				.append("text") // axis label
				.attr("class", "ylabel")
				.attr("text-anchor", "end")
				.attr("x", -height/2 + 40)
				.attr("y", -55)
				.attr("transform", "rotate(270)")
				.html("Billion USD ($)");
			const xAxisGroup = chart.append('g').call(xAxis).attr('transform', 'translate( 0,' + height + ')')
				.append("text") // axis label
				.attr("class", "xlabel")
				.attr("text-anchor", "end")
				.attr("x", width - 200)
				.attr("y", 40)
				.html("Notes: A Guide to the National Income and Product Accounts of the United States (NIPA) - (http://www.bea.gov/national/pdf/nipaguid.pdf)");

			const barWidth = width / data.length;



			const bar = chart.selectAll('g') // the <g> tag is used in svg to group elements
				.data(data) // joins elements to data, returning new updated selection for enter/exit
				.enter().append('g')
				.attr('class', 'databar')
				.attr('transform', function (d, i) { // starts at index 20 for some  reason...
					console.log(i);
					console.log(d);
					return 'translate(' + ((i * barWidth) - margin.left) + ', 0)'; });



			// that only made the groups to apply the transform, now have to draw the shapes
			bar.append('rect')
				.attr('name', function (d, i) {
					return d })
				.attr('y', function (d) {
					return y(d[1]); })
				.attr('height', function (d) {
					return height - y(d[1]); })
				.attr('width', (barWidth + 1)); // +1 so there isn't a weird gap in-between the bars

			let fade = '';
			$('.databar').hover(function(e) {
				let pair = $(e.target).attr('name');
				pair = pair.split(',');
				clearTimeout(fade);
				$('#info').fadeIn(200).css('top', ypos + 5).css('left', xpos + 5);
				$('#info p:first-child').text('Date: ' + pair[0]);
				$('#info p:last-child').text('Amt: ' + Math.floor(pair[1]));
			}, function(e) {
				fade = setTimeout(function() {
					$('#info').fadeOut(200);
				}, 300);
			});

		},
		error(error) {
			console.error(error);
		},
	});
});
