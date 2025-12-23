"use client";

import { PrintColor } from "@/types/PrintColor";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { ButtonGroup, IconButton, Pagination, Spinner, Text } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import PrintColorRestoreTable from "./PrintColorRestoreTable";
import PrintColorDetailDialog from "./PrintColorDetailDialog";
import { useGetDeletedPrintColorQuery, useRestorePrintColorMutation } from "@/service/api/printColorApiSlice";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";
import DataLoading from "../common/DataLoading";

const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
]

const PrintColorRestoreList: React.FC = () => {

    const hydrating: boolean = useAppSelector((state) =>
        state.auth.hydrating
    );

    const userState: UserState | null = useAppSelector((state) =>
        state.auth.userState
    );

    const writeAllowed =
        check.nonEmptyArray(userState?.accessPrivileges) &&
        EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

    const [restoreItem] = useRestorePrintColorMutation();

    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: dataResp, error, isLoading } = useGetDeletedPrintColorQuery({ page: page, limit: limit });

    const items = dataResp?.data?.data ?? [];
    const totalPages = dataResp?.data?.totalPages ?? 1;

    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<PrintColor | undefined>(undefined);

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

    const handleOpenDetail = (item?: PrintColor) => {
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

    const handleRestore = async (data: PrintColor) => {

        if (!handleValidateAccess()) return;

        handleMutation(
            () => restoreItem(data).unwrap(),
            `Đã khôi phục màu in ${data.code}`,
            'Khôi phục thất bại',
        );
    }

    if (hydrating) {
        return <DataLoading />
    }

    if (isLoading) return <Text>Đang tải dữ liệu...</Text>;
    if (error) return <Text>Không thể tải dữ liệu. Vui lòng thử lại.</Text>;

    return (
        <>

            <PrintColorDetailDialog
                isOpen={detailOpen}
                onClose={handleCloseDetail}
                initialData={selected} />

            {isLoading ? (<Spinner />) : (
                <>

                    <PrintColorRestoreTable
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

export default PrintColorRestoreList;