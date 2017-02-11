export default {

    title:{
        text: null
    },

    legend: {
        enabled: false
    },

    chart: {
        type: 'candlestick',

        /** TEMP STYLING **/
        spacingTop: 0,
        spacingRight: 10,
        // // spacingRight: 60,
        // spacingBottom: 0,
        // // spacingLeft: 0,
        plotBorderWidth: 0,
        // // marginRight: 0,//-60, //this does move the chart but you'll need to recompute it
        marginLeft: 0,//-60,  //whenever the page changes width
        marginTop: 0,
        marginBottom: 20,

        /** TURN OFF ALL ANIMATIONS **/
        animation: false
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

    plotOptions: {
        bar: {
            minPointLength: 5
        },
        series: {
            gapSize: 10,
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
            }
        }
    },

    xAxis: [
        {
            labels: {
                step: 1, // Disable label rotating when there is not enough space
                style: {
                    fontSize: '8px',
                    rotation: 0
                }
            },
            lineColor: '#707073',
            gridLineWidth: 1,
            gridLineDashStyle: 'ShortDash',
            gridZIndex: -1,
            tickPixelInterval: 60
        }
    ],

    yAxis: [
        {
            labels: {
                align: 'left',
                x: 5,
                format: '{value:.5f}'
            },
            gridLineWidth: 1,
            gridLineDashStyle: 'ShortDash',
            gridZIndex: -1,
            tickPixelInterval: 30,
            height: '73%',
            lineWidth: 1,
            borderWidth: 3,
            borderColor: '#FF0000',
            plotLines: [
                {
                    color: 'red', // Color value
                    dashStyle: 'longdashdot', // Style of the plot line. Default to solid
                }
            ]
        },
        {
            labels: {
                align: 'left',
                x: 5
            },
            gridLineWidth: 1,
            gridLineDashStyle: 'ShortDash',
            gridZIndex: -1,
            tickPixelInterval: 30,
            top: '75%',
            offset: 0,
            height: '25%',
            lineWidth: 1,
            style: {
                fontSize: '10px'
            }
        }
    ],

    series: [
        {
            data: [],
            //minPointLength: 1,
            dataGrouping: {
                enabled: false
            }
        },
        {
            type: 'column',
            name: 'Volume',
            data: [],
            //minPointLength: 1,
            yAxis: 1,
            dataGrouping: {
                enabled: false
            }
        }
    ]
}