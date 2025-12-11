"use client";
import { useGetSemiFinishedGoodVolumeChartDataQuery } from "@/service/api/semiFinishedGoodTransactionApiSlice";
import { Box, GridItem, Heading, HStack, Input, SimpleGrid, Spinner } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import SemiFinishedVolumeChart from "./SemiFinishedVolumeChart";
import SemiFinishedInventoryChart from "./SemiFinishedInventoryChart";
import { useState } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

const SemiFinishedDashBoard: React.FC = () => {
    const today = new Date();
    const localDate = formatDateForInput(today);

    const [inventoryChartDate, setInventoryChartDate] = useState(localDate);

    const [volumeChartDate, setVolumeChartDate] = useState(localDate);

    const { data, isLoading, error } = useGetSemiFinishedGoodVolumeChartDataQuery({ date: inventoryChartDate });

    const chartData = data?.data || [];

    const handleInvalidDate = (value: string) => {
        if (value) {
            setInventoryChartDate(value);
        } else toaster.create({ title: "Nhắc nhở", description: "Không được phép xóa ngày", type: "error", closable: true });
    }

    if (isLoading) return <Spinner />;
    if (error) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <Box
            m={5}
            p={2}
            flexGrow={1}
            boxSizing={"border-box"}
            rounded={"sm"}
            colorPalette={"gray"}
            backgroundColor={"colorPalette.subtle"}
        >
            <SimpleGrid columns={{ md: 1, lg: 2 }} gap="40px" mx={5}>
                <GridItem colSpan={{ base: 1 }}>
                    <Box bg="bg" p={2} rounded={"sm"}>
                        <HStack mb={5} justifyContent={"space-between"}>
                            <Heading mb={5} size={"sm"}>Đồ thị tồn kho phôi theo ngày</Heading>
                            <Input
                                type="date"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleInvalidDate(e.target.value);
                                    }
                                }}
                                required={true}
                                max={localDate}
                                value={inventoryChartDate}
                                width="200px"
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' || e.key === 'Delete') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </HStack>
                        <SemiFinishedInventoryChart chartData={chartData} />
                    </Box>
                </GridItem>

                <GridItem colSpan={{ base: 1 }}>
                    <Box bg="bg" p={2} rounded={"sm"}>
                        <HStack mb={5} justifyContent={"space-between"}>
                            <Heading mb={5} size={"sm"}>Đồ thị nhập xuất kho phôi theo ngày</Heading>
                            <Input
                                type="date"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setVolumeChartDate(e.target.value);
                                    }
                                }}
                                max={localDate}
                                value={volumeChartDate}
                                width="200px"
                            />
                        </HStack>
                        <SemiFinishedVolumeChart chartData={chartData} />
                    </Box>
                </GridItem>

            </SimpleGrid>
        </Box>
    );
}

export default SemiFinishedDashBoard;