export const HighchartsDefaultTheme = {

	title: {
		text: null
	},

	legend: {
		enabled: false
	},

	tooltip: {
		animation: false,
		shadow: false,
		followTouchMove: false
	},

	chart: {
		type: 'candlestick',

		/** TEMP STYLING **/
		spacingTop: 0,
		spacingRight: 4,
		spacingLeft: 0,
		spacingBottom: 0,
		// plotBorderWidth: 1,
		// marginRight: 0,//-60, //this does move the chart but you'll need to recompute it
		// marginLeft: 0, // -60,  //whenever the page changes width
		// marginTop: 0,
		marginBottom: 15,
		animation: false
		//
		// /** TURN OFF ALL ANIMATIONS **/
		// animation: false
	},

	credits: {
		enabled: false
	},

	scrollbar: {
		enabled: false
	},

	navigator: {
		enabled: false
	},

	rangeSelector: {
		enabled: false,
		inputEnabled: false
	},

	/**
	 * Supposed to fix cropping of bars on resize.
	 * But keep getting error 'Cannot read property 'dataGrouping' of undefined'
	 */
	responsive2: {
		rules: [{
			chartOptions: {
				plotOptions: {
					series: {
						dataGrouping: {
							groupPixelWidth: 30
						}
					}
				}
			},
			condition: {
				minWidth: 300
			}
		}]
	},

	xAxis: [
		{
			labels: {
				step: 1, // Disable label rotating when there is not enough space
				staggerLines: false,
				format: '{value:%d-%m %H:%M}',
				y: 12
			},
			minorGridLineWidth: 0,
			lineColor: '#d2d2d5',
			lineWidth: 1,
			gridLineWidth: 1,
			gridLineDashStyle: 'dot',
			gridZIndex: -1,
			tickPixelInterval: 80,
			minorTickLength: 0,

			// Fill empty time gaps (when there are no bars)
			ordinal: true
		},
		{
			labels: {
				step: 1, // Disable label rotating when there is not enough space
				staggerLines: false,
			},
			lineWidth: 0,
			gridLineWidth: 1,
			gridLineDashStyle: 'dot',
			gridZIndex: -1,

			// Fill empty time gaps (when there are no bars)
			ordinal: true
		}
	],

	yAxis: [
		{
			labels: {
				align: 'left',
				y: 3,
				x: 5,
				format: '{value:.4f}',
				staggerLines: false,
			},
			showFirstLabel: false,
			tickPixelInterval: 70,
			height: '70%',
			minorTickLength: 0,
			tickLength: 0
		},
		{
			labels: {
				align: 'left',
				y: 3,
				x: 5,
				formatter: function () {
					if (this.isFirst === true || this.isLast === true) {
						return this.value;
					}
				}
			},
			showLastLabel: true,
			title: {
				align: 'middle',
				text: 'Volume',
				offset: 0,
				// y: -10,
				x: 10
			},
			gridLineWidth: 0,
			top: '70%',
			height: '30%',
			minorTickLength: 0,
			tickLength: 0
		}
	],

	series: [
		{
			data: [],
			minPointLength: 1,
			dataGrouping: {
				enabled: false
			},
			crisp: false
		},
		{
			type: 'column',
			name: 'Volume',
			data: [],
			// minPointLength: 1,
			yAxis: 1,
			dataGrouping: {
				enabled: false
			},
			crisp: false
		}
	],
	plotOptions: {
		bar: {
			minPointLength: 1,
			pointWidth: 5,
			// maxPointWidth: 5,
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		series: {
			gapSize: 10,
			pointWidth: 4,
			groupPadding: 0.6,
			lineWidth: 1,
			marker: {
				lineColor: null,
				states: {
					hover: {
						radius: 3
					}
				}
			},
			states: {
				hover: {
					lineWidth: 1,
					halo: !1
				}
			},
			animation: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},

		area: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		arearange: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		areaspline: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		areasplinerange: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		boxplot: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		bubble: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		column: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		columnrange: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		errorbar: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		funnel: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		gauge: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		heatmap: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		line: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		pie: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		polygon: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		pyramid: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		scatter: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		solidgauge: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		spline: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		treemap: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
		waterfall: {
			animation: false,
			enableMouseTracking: false,
			stickyTracking: true,
			shadow: false,
			dataLabels: {style: {textShadow: false}}
		},
	},
};