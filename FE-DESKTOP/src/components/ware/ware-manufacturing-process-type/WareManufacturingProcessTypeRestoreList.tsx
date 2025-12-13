"use client";

import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { ButtonGroup, IconButton, Pagination, Spinner, Text } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import WareManufacturingProcessTypeRestoreTable from "./WareManufacturingProcessTypeRestoreTable";
import WareManufacturingProcessTypeDetailDialog from "./WareManufacturingProcessTypeDetailDialog";
import { useGetDeletedWareManufacturingProcessTypeQuery, useRestoreWareManufacturingProcessTypeMutation } from "@/service/api/wareManufacturingProcessTypeApiSlice";

const WareManufacturingProcessTypeRestoreList: React.FC = () => {

    const [restoreItem] = useRestoreWareManufacturingProcessTypeMutation();

    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: dataResp, error, isLoading } = useGetDeletedWareManufacturingProcessTypeQuery({ page: page, limit: limit });

    const items = dataResp?.data?.data ?? [];
    const totalPages = dataResp?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<WareManufacturingProcessType | undefined>(undefined);

    const handleOpenDetail = (item?: WareManufacturingProcessType) => {
        setSelected(item);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelected(undefined);
    }

    const handleMutation = async (
        fn: Function,
        successMessage: string,
        errorMessage: string
    ) => {
        try {
            await fn();
            toaster.create({
                title: "Thành công",
                description: successMessage,
                type: "success",
                closable: true,
            });
        } catch (error: any) {
            const msg = error?.data?.message || error?.message || "Đã xảy ra lỗi, thử lại sau";
            toaster.create({
                title: errorMessage,
                description: msg,
                type: "error",
                closable: true,
            });
        }
    };

    const handleRestore = async (data: WareManufacturingProcessType) => {
        handleMutation(
            () => restoreItem(data).unwrap(),
            `Đã khôi phục loại gia công mã hàng ${data.code}`,
            'Khôi phục thất bại',
        );
    }

    if (isLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (error) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (
        <>

            <WareManufacturingProcessTypeDetailDialog
                isOpen={detailOpen}
                onClose={handleCloseDetail}
                initialData={selected} />

            {isLoading ? (<Spinner />) : (
                <>

                    <WareManufacturingProcessTypeRestoreTable
                        page={page}
                        limit={limit}
                        items={items}
                        onRestore={handleRestore}
                        onDetail={handleOpenDetail}
                    />

                    <Pagination.Root
                        count={totalPages * limit}
                        pageSize={limit}
                        page={page}
                        siblingCount={2}
                        onPageChange={(e) => setPage(e.page)}
                    >
                        <ButtonGroup variant="ghost" size="sm" mt={4} justifyContent="center">
                            <Pagination.PrevTrigger asChild>
                                <IconButton aria-label="Previous page">
                                    <HiChevronLeft />
                                </IconButton>
                            </Pagination.PrevTrigger>

                            <Pagination.Items
                                render={(pageItem) => (
                                    <IconButton
                                        key={pageItem.value}
                                        variant={{ base: "ghost", _selected: "outline" }}
                                        onClick={() => setPage(pageItem.value)}
                                    >
                                        {pageItem.value}
                                    </IconButton>
                                )}
                            />

                            <Pagination.NextTrigger asChild>
                                <IconButton aria-label="Next page">
                                    <HiChevronRight />
                                </IconButton>
                            </Pagination.NextTrigger>
                        </ButtonGroup>
                    </Pagination.Root>
                </>
            )}
        </>
    );
}

export default WareManufacturingProcessTypeRestoreList;