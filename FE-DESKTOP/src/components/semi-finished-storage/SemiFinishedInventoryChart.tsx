import { DailyChartItem } from "@/types/SemiFinishedTransaction";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

interface ChartProps {
    chartData: DailyChartItem[];
}

const SemiFinishedInventoryChart: React.FC<ChartProps> = ({ chartData }) => {
    const chart = useChart({
        data: chartData,
        series: [
            { name: "stock", label: 'Tồn kho' ,color: "blue.solid" },
        ],
    });

    return (
        <Chart.Root chart={chart}>
            <LineChart data={chart.data}>
                <CartesianGrid stroke={chart.color("border")} vertical={false} />
                <XAxis dataKey="time" />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    stroke={chart.color("border")}
                    label={{ value: "Số lượng", position: "left", angle: -90 }}
                />
                <Tooltip
                    animationDuration={100}
                    cursor={false}
                    content={<Chart.Tooltip />}
                />
                <Line
                    dot={true}
                    dataKey="stock"
                    stroke={chart.color("blue.solid")}
                    strokeWidth={2}
                >
                </Line>
            </LineChart>
        </Chart.Root>
    );
};

export default SemiFinishedInventoryChart;