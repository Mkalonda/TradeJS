const
	Highcharts = require('highcharts'),
	Highstock = require('highcharts/highstock');

Highstock.theme = Highcharts.theme = {
	// colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
	//     '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],

	colors: ['#9aee7e', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
		'#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],

	loading: {
		style: {
			backgroundColor: '#000',
			color: '#fff',
			fontSize: '20px'
		},
		labelStyle: {
			display: 'block',
			width: '136px',
			height: '26px',
			margin: '0 auto',
			backgroundColor: '#000'
		}
	},
	chart: {
		backgroundColor: '#000',
		// backgroundColor: {
		//     color: "black",
		//     linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
		//     stops: [
		//         [0, '#000'],
		//         [1, '#3e3e40']
		//     ]
		// },
		style: {
			fontFamily: '\'Unica One\', sans-serif'
		},
		plotBorderColor: '#606063'
	},
	title: {
		style: {
			color: '#E0E0E3',
			textTransform: 'uppercase',
			fontSize: '20px'
		}
	},
	subtitle: {
		style: {
			color: '#E0E0E3',
			textTransform: 'uppercase'
		}
	},
	xAxis: {
		gridLineColor: '#707073',
		labels: {
			style: {
				color: '#E0E0E3'
			}
		},
		lineColor: '#707073',
		tickColor: '#707073',
		tickLength: 0,
		minorTickLength: 0,
		minorGridLineColor: '#505053',
		title: {
			style: {
				color: '#A0A0A3'

			}
		},
		type: 'datetime'
	},
	yAxis: {
		gridLineColor: '#707073',
		labels: {
			style: {
				color: '#E0E0E3'
			}
		},
		lineColor: '#707073',
		minorGridLineColor: '#505053',
		tickColor: '#707073',
		tickWidth: 1,
		tickLength: 0,
		gridLineWidth: 1,
		gridLineDashStyle: 'dot',
		gridZIndex: -1,
		lineWidth: 1,
		offset: 0,
		borderWidth: 3,
		title: {
			style: {
				color: '#A0A0A3'
			}
		}
	},
	tooltip: {
		backgroundColor: 'rgba(0, 0, 0, 0.85)',
		style: {
			color: '#F0F0F0'
		}
	},
	plotOptions: {
		series: {
			shadow: false,
			animation: false, // Disable initialize animation
			dataLabels: {
				color: '#B0B0B3'
			},
			marker: {
				lineColor: 'white'
			},
			minPointLength: 1
		},
		boxplot: {
			fillColor: '#505053'
		},
		candlestick: {
			lineColor: 'white',
			// lineWidth: 0,
			color: '#fff',
			upColor: '#00ee5e'
		},
		errorbar: {
			color: 'white'
		},
		map: {
			shadow: false
		}
	},
	legend: {
		itemStyle: {
			color: '#E0E0E3'
		},
		itemHoverStyle: {
			color: '#FFF'
		},
		itemHiddenStyle: {
			color: '#606063'
		}
	},
	labels: {
		style: {
			color: '#707073',
			fontSize: '12px',
			rotation: 0
		}
	},

	drilldown: {
		activeAxisLabelStyle: {
			color: '#F0F0F3'
		},
		activeDataLabelStyle: {
			color: '#F0F0F3'
		}
	},

	scrollbar: {
		enabled: false,
	},

	// special colors for some of the
	dataLabelsColor: '#B0B0B3',
	textColor: '#C0C0C0',
	contrastTextColor: '#F0F0F3',
	maskColor: 'rgba(255,255,255,0.3)'
};


// Apply the theme
Highcharts.setOptions(Highcharts.theme);
Highstock.setOptions(Highstock.theme);

export {}