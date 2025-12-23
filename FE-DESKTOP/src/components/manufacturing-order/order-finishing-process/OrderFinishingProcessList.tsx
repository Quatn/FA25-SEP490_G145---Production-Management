"use client";

import { useGetOrderFinishingProcesssQuery, useUpdateManyOrderFinishingProcessMutation, useUpdateOrderFinishingProcessMutation } from "@/service/api/orderFinishingProcessApiSlice";
import { Flex, Input, InputGroup, Spinner, Tabs, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import OrderFinishingProcessTable from "./OrderFinishingProcessTable";
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus";
import { LuSquareCheck } from "react-icons/lu";
import { VscRunAll } from "react-icons/vsc";
import OrderFinishingProcessDialog from "./OrderFinishingProcessDialog";
import { UserState } from "@/types/UserState";
import { useAppSelector } from "@/service/hooks";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import ManufacturingOrderDetailsDialog from "../order-details-dialog/Dialog";
import { useGetSemiFinishedGoodByManufacturingOrderIdQuery } from "@/service/api/semiFinishedGoodApiSlice";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import check from "check-types";
import DataLoading from "@/components/common/DataLoading";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "manufacturing-order-readWrite",
]

const OrderFinishingProcessList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

    const [scheduledPage, setScheduledPage] = useState(1);
    const [inProductionPage, setInProductionPage] = useState(1);
    const [finishedProductionPage, setFinishedProductionPage] = useState(1);
    const limit = 5;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOFP, setSelectedOFP] = useState<OrderFinishingProcess | undefined>(undefined);
    const [updateToStatus, setUpdateToStatus] = useState<OrderFinishingProcessStatus | undefined>(undefined);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const {
        data: scheduledData,
        error: scheduledError,
        isLoading: scheduledLoading
    } = useGetOrderFinishingProcesssQuery({
        page: scheduledPage,
        limit,
        search: debouncedSearch,
        status: OrderFinishingProcessStatus.Scheduled,
    });
    const {
        data: inProductionData,
        error: inProductionError,
        isLoading: inProductionLoading
    } = useGetOrderFinishingProcesssQuery({
        page: inProductionPage,
        limit,
        search: debouncedSearch,
        status: OrderFinishingProcessStatus.InProduction,
    });
    const {
        data: finishedProductionData,
        error: finishedProductionError,
        isLoading: finishedProductionLoading
    } = useGetOrderFinishingProcesssQuery({
        page: finishedProductionPage,
        limit,
        search: debouncedSearch,
        status: OrderFinishingProcessStatus.FinishedProduction,
    });

    const {
        data: semiFinishedGoodData,
        currentData: semiFinishedGoodCurrentData,
        error: semiFinishedGoodError,
        isLoading: semiFinishedGoodLoading,
    } = useGetSemiFinishedGoodByManufacturingOrderIdQuery(
        { moId: selectedOFP?.manufacturingOrder._id as string },
        { skip: !selectedOFP?.manufacturingOrder._id }
    );

    // const [updateMany, {isLoading: isUpdateManyLoading }] = useUpdateManyOrderFinishingProcessMutation();
    const [updateOne, { isLoading: isUpdateOneLoading }] = useUpdateOrderFinishingProcessMutation();

    const scheduledOFP: OrderFinishingProcess[] = scheduledData?.data?.data ?? [];
    const inProductionOFP: OrderFinishingProcess[] = inProductionData?.data?.data ?? [];
    const finishedProductionOFP: OrderFinishingProcess[] = finishedProductionData?.data?.data ?? [];

    const selectedSemiFinishedGood = semiFinishedGoodCurrentData?.data;

    const scheduledTotalPages: number = scheduledData?.data.totalPages ?? 0;
    const inProductionTotalPages: number = inProductionData?.data.totalPages ?? 0;
    const finishedProductionTotalPages: number = finishedProductionData?.data.totalPages ?? 0;

    // handle bulk update later

    // const [selection, setSelection] = useState<string[]>([])

    // const handleBulkUpdateStatus = async () => {

    //     try {
    //         const docs = await updateMany({
    //             ids: selection,
    //             data: {
    //                 status: OrderFinishingProcessStatus.InProduction,
    //             }
    //         }).unwrap();

    //         toaster.create({
    //             title: "Thành công",
    //             description: `Bắt đầu gia công ${docs.data.modified} kế hoạch`,
    //             type: "success",
    //             closable: true,
    //         });
    //     } catch (error: any) {
    //         const msg =
    //             error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
    //         toaster.create({
    //             title: "Thao tác thất bại",
    //             description: msg,
    //             type: "error",
    //             closable: true,
    //         });
    //     }
    // };

    const handleValidateAccess = (): boolean => {
        if (!writeAllowed) {
            toaster.create({
                title: "Quyền truy cập bị từ chối",
                description: "Bạn không có quyền thao tác chức năng này",
                type: "error",
                closable: true,
            });
            return false;
        }
        return true;
    }

    const handleUpdateOne = async (
        updateId: string,
        updateStatus: OrderFinishingProcessStatus,
        updateCompletedAmount?: number,) => {
        const today = new Date();
        const localDate = today.toISOString().split("T")[0];
        try {
            const updateData: Partial<OrderFinishingProcess> = {};

            updateData.status = updateStatus;

            if (updateStatus == OrderFinishingProcessStatus.InProduction) {
                updateData.employee = userState?.employeeId ?? "";
                updateData.startedAt = localDate;
            }

            if (updateStatus == OrderFinishingProcessStatus.FinishedProduction) {
                if (updateCompletedAmount !== undefined) updateData.completedAmount = updateCompletedAmount;
                updateData.completedAt = localDate;
            }

            const docs = await updateOne({
                id: updateId,
                data: updateData,
            }).unwrap();

            toaster.create({
                title: "Thành công",
                description: `${docs.data.status == OrderFinishingProcessStatus.InProduction ? 'Bắt đầu' : 'Hoàn thành'} kế hoạch ${docs.data.code}`,
                type: "success",
                closable: true,
            });
        } catch (error: any) {
            const msg =
                error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: "Thao tác thất bại",
                description: msg,
                type: "error",
                closable: true,
            });
        }
    };

    const handleOpenAlertDialog = (tableStatus: OrderFinishingProcessStatus, ofp: OrderFinishingProcess) => {

        if (!handleValidateAccess()) return;

        if (tableStatus == OrderFinishingProcessStatus.Scheduled) setUpdateToStatus(OrderFinishingProcessStatus.InProduction);
        if (tableStatus == OrderFinishingProcessStatus.InProduction) setUpdateToStatus(OrderFinishingProcessStatus.FinishedProduction);
        setSelectedOFP(ofp);
        setDialogOpen(true);
    }

    const handleCloseAlertDialog = () => {
        setDialogOpen(false);
        setSelectedOFP(undefined);
    };

    if (hydrating) {
        return <DataLoading />
    }

    if (scheduledLoading || inProductionLoading || finishedProductionLoading) return <Spinner />;
    if (scheduledError || inProductionError || finishedProductionError) {
        toaster.create({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error", closable: true });
        return <div>Không thể tải dữ liệu.</div>;
    }

    return (
        <>

            <OrderFinishingProcessDialog
                isOpen={dialogOpen}
                onClose={handleCloseAlertDialog}
                initialData={selectedOFP}
                semiFinishedGood={selectedSemiFinishedGood}
                updateToStatus={updateToStatus}
                onUpdate={handleUpdateOne} />

            <Flex direction="row" mb={4}>
                <InputGroup w={"full"} maxW={"sm"}>
                    <Input
                        size="lg"
                        placeholder="Tìm kiếm"
                        value={search}
                        onChange={(e) => {
                            setScheduledPage(1);
                            setInProductionPage(1);
                            setFinishedProductionPage(1);
                            setSearch(e.target.value);
                        }} />
                </InputGroup>
            </Flex>

            <ManufacturingOrderDialogProvider initialState={{ tab: "processes" }}>
                <Tabs.Root
                    lazyMount
                    unmountOnExit
                    defaultValue={'list'}
                    variant={"outline"}>
                    <Tabs.List colorPalette={'green'}>
                        <Tabs.Trigger fontWeight={'bold'} value={'list'}>
                            <VscRunAll />
                            Danh sách kế hoạch gia công
                        </Tabs.Trigger>
                        <Tabs.Trigger fontWeight={'bold'} value={'history'}>
                            <LuSquareCheck />
                            Lịch sử hoàn thành
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value={'list'}>

                        <Text fontSize={'lg'} fontWeight={'bold'}>Bảng kế hoạch chạy</Text>
                        <OrderFinishingProcessTable
                            tableStatus={OrderFinishingProcessStatus.InProduction}
                            items={inProductionOFP}
                            page={inProductionPage}
                            limit={limit}
                            handlePagination={setInProductionPage}
                            totalPages={inProductionTotalPages}
                            handleUpdate={handleOpenAlertDialog} />

                        <Text mt={5} fontSize={'lg'} fontWeight={'bold'}>Danh sách kế hoạch chờ</Text>
                        <OrderFinishingProcessTable
                            tableStatus={OrderFinishingProcessStatus.Scheduled}
                            items={scheduledOFP}
                            page={scheduledPage}
                            limit={limit}
                            handlePagination={setScheduledPage}
                            totalPages={scheduledTotalPages}
                            handleUpdate={handleOpenAlertDialog} />
                    </Tabs.Content>
                    <Tabs.Content value={'history'}>
                        <OrderFinishingProcessTable
                            tableStatus={OrderFinishingProcessStatus.FinishedProduction}
                            items={finishedProductionOFP}
                            page={finishedProductionPage}
                            limit={limit}
                            handlePagination={setFinishedProductionPage}
                            totalPages={finishedProductionTotalPages}
                            handleUpdate={handleOpenAlertDialog} />
                    </Tabs.Content>
                </Tabs.Root>

                <ManufacturingOrderDetailsDialog />
            </ManufacturingOrderDialogProvider>

        </>
    );
}

export default OrderFinishingProcessList;
