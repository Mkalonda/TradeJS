export default {

    chart: {
        type: 'candlestick',
        height: 300,

        /** TEMP STYLING **/
        spacingTop: 0,
        spacingRight: 20,
        // spacingRight: 60,
        spacingBottom: 0,
        // spacingLeft: 0,
        plotBorderWidth: 0,
        // marginRight: 0,//-60, //this does move the chart but you'll need to recompute it
        marginLeft: 0,//-60,  //whenever the page changes width
        marginTop: 0,
        marginBottom: 0
    },

    credits: {
        enabled: false
    },

    navigator: {
        enabled: false
    },

    rangeSelector: {
        enabled: false,
        inputEnabled: false
    },

    xAxis: {
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
        tickPixelInterval: 40
    },

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
                    // value: 3, // Value of where the line will appear
                    // width: 2 // Width of the line
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
            minPointLength: 1,
            dataGrouping: {
                enabled: false
            }
        },
        {
            type: 'column',
            name: 'Volume',
            data: [],
            minPointLength: 1,
            yAxis: 1,
            dataGrouping: {
                enabled: false
            }
        }
    ]
}