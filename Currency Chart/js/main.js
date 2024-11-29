$(document).ready(function () {
    var currencySelect = $("#Currency");
    var timeSelect = $("#Time-selection");
    var ctx = $("#cryptoChart")[0].getContext("2d");
    var chart;

    function showLoader() {
        $("#loading").show();
    }

    function hideLoader() {
        $("#loading").hide();
    }

    function fetchCurrencies() {
        const url = "https://api.coinex.com/perpetual/v1/market/list";
        $.ajax({
            url: url,
            method: "GET",
            beforeSend: showLoader,
            success: function (data) {
                populateCurrencySelect(data);
            },
            error: handleError,
            complete: hideLoader,
        });
    }

    function populateCurrencySelect(data) {
        currencySelect.empty();
        $.each(data.data, function (index, market) {
            var option = $("<option></option>")
                .val(market.name)
                .text(market.name);
            currencySelect.append(option);
        });
    }

    function fetchTimeData(currency, time) {
        if (!currency) {
            console.error("Currency is not selected.");
            return;
        }
        const url = `https://api.coinex.com/perpetual/v1/market/kline?market=${currency}&type=${time}`;

        $.ajax({
            url: url,
            method: "GET",
            beforeSend: showLoader,
            success: function (data) {
                try {
                    const candlestickData = data.data.map((point) => {
                        return {
                            x: point[0] * 1000, // Convert to milliseconds
                            o: parseFloat(point[1]), // Open
                            h: parseFloat(point[2]), // High
                            l: parseFloat(point[3]), // Low
                            c: parseFloat(point[4]), // Close
                            v: parseFloat(point[5]), // Volume (ZRX)
                            qv: parseFloat(point[6]), // Quote Volume (USDT)
                        };
                    });
                    renderChart(candlestickData);
                } catch (error) {
                    console.error("Error processing fetched data:", error);
                    alert("Failed to process time data.");
                }
            },
            error: handleError,
            complete: hideLoader,
        });
    }

    function renderChart(candlestickData) {
        if (chart) {
            chart.destroy();
        }

        const minTimestamp = Math.min(...candlestickData.map((data) => data.x));
        const maxTimestamp = Math.max(...candlestickData.map((data) => data.x));

        const rangeInMillis = maxTimestamp - minTimestamp;
        let timeUnit;

        if (rangeInMillis < 60 * 60 * 1000) {
            timeUnit = "minute";
        } else if (rangeInMillis < 24 * 60 * 60 * 1000) {
            timeUnit = "hour";
        } else {
            timeUnit = "day";
        }

        // Create the candlestick chart
        chart = new Chart(ctx, {
            type: "candlestick",
            data: {
                datasets: [
                    {
                        label: "نمودار شمعی ",
                        data: candlestickData,
                    },
                    {
                        label: "حجم معاملات (ZRX)",
                        type: "bar",
                        data: candlestickData.map((point) => ({
                            x: point.x,
                            y: point.v,
                        })),
                        hidden: true,
                        backgroundColor: "rgba(0, 123, 255, 0.5)",
                        yAxisID: "y-volume",
                        barThickness: 6,
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                    },
                    {
                        label: "حجم معاملات به دلار (USDT)",
                        type: "bar",
                        data: candlestickData.map((point) => ({
                            x: point.x,
                            y: point.qv,
                        })),
                        hidden: true,
                        backgroundColor: "rgba(4, 111, 8, 1)",
                        yAxisID: "y-quote-volume",
                        barThickness: 6,
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            onPanStart({ chart, point }) {
                                const area = chart.chartArea;
                                const w25 = area.width * 0.25;
                                const h25 = area.height * 0.25;
                                if (
                                    point.x < area.left + w25 ||
                                    point.x > area.right - w25 ||
                                    point.y < area.top + h25 ||
                                    point.y > area.bottom - h25
                                ) {
                                    return false;
                                }
                            },
                            mode: "xy",
                            modifierKey: "ctrl",
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },

                            mode: "xy",
                        },
                    },
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: timeUnit,
                            tooltipFormat: "ll HH:mm",
                            displayFormats: {
                                minute: "HH:mm",
                                hour: "MMM D HH:mm",
                                day: "MMM D",
                            },
                        },
                        bounds: "data",
                        min: minTimestamp,
                        max: maxTimestamp,
                        title: {
                            display: true,
                            text: "تاریخ و زمان ",
                        },
                    },
                    y: {
                        type: "linear",
                        position: "left",
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: "قیمت به دلار (USDT)",
                        },
                    },
                    "y-volume": {
                        type: "linear",
                        position: "right",
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: "حجم معاملات (ZRX)",
                        },
                    },
                    "y-quote-volume": {
                        type: "linear",
                        position: "right",
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: "حجم معاملات به دلار (USDT)",
                        },
                    },
                },
            },
        });
        $("#resetZoom").click(function () {
            if (chart) {
                chart.resetZoom();
            }
        });
    }

    currencySelect.change(function () {
        var currency = $(this).val();
        var time = timeSelect.val();
        fetchTimeData(currency, time);
    });

    timeSelect.change(function () {
        var currency = currencySelect.val();
        var time = $(this).val();
        fetchTimeData(currency, time);
    });

    function handleError(jqXHR, textStatus, errorThrown) {
        console.error(
            "مشکلی در دریافت اطلاعات به وجود آمد:",
            textStatus,
            errorThrown
        );
        alert(
            `دریافت اطلاعات ناموفق بود. Status: ${textStatus}, Error: ${errorThrown}`
        );
    }

    fetchCurrencies();
});
