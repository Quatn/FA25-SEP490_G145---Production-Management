import { DailyChartItem } from "@/types/SemiFinishedTransaction";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, LabelList, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

interface ChartProps {
    chartData: DailyChartItem[];
}

const SemiFinishedVolumeChart: React.FC<ChartProps> = ({ chartData }) => {
    const chart = useChart({
        data: chartData,
        series: [
            { name: "import", label: 'Số phôi nhập', color: "green.solid" },
            { name: "export", label: 'Số phôi xuất', color: "red.solid" },
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
                <Legend content={<Chart.Legend interaction="hover" />} />
                {chart.series.map((item) => (
                    <Line
                        key={item.name}
                        dot={false}
                        dataKey={chart.key(item.name)}
                        fill={chart.color(item.color)}
                        stroke={chart.color(item.color)}
                        strokeWidth={2}
                    >
                    </Line>
                ))}
            </LineChart>
        </Chart.Root>
    );
};

export default SemiFinishedVolumeChart;