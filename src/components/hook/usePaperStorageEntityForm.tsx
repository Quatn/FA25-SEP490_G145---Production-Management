import { useState, useRef, useEffect } from "react";
import { EntityRow, BaseEntity, UseEntityFormOptions } from "@/types/paperStorage.types";
import { validateEntityRows } from "@/utils/paperEntityHelpers";
import { importEntitiesFromExcel } from "@/utils/importFromExcel";
import { toaster } from "@/components/ui/toaster";

export const useEntityForm = <T extends BaseEntity>({
    initialData = [],
    onSave,
    onUpdate,
    onDelete,
    entityLabel = "Dòng",
}: UseEntityFormOptions<T>) => {
    const [rows, setRows] = useState<EntityRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        if (!initialData || initialData.length === 0) return;
        if (initialData.length === 0) {
            handleAddRow();
        } else {
            const initialized = initialData.map((item) => ({
                ...item,
                isSaved: true,
                isEditing: false,
                isLoading: false,
                error: {},
            }));
            setRows(validateEntityRows(initialized));
        }
        hasInitialized.current = true;
    }, [initialData]);

    const extractEntity = <T extends BaseEntity>(row: EntityRow): T => {
        const { code, name, ...rest } = row;
        return { code, name } as T;
    };

    const getValidRows = () =>
        rows.filter(
            (r) =>
                (r.code.trim() || r.name.trim()) &&
                !r.error?.code &&
                !r.error?.name &&
                (!r.isSaved || r.isEditing)
        );

    const updateRow = (index: number, updates: Partial<EntityRow>) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            return validateEntityRows(updated);
        });
    };

    const handleAddRow = () => {
        setRows((prev) => validateEntityRows([
            ...prev,
            {
                code: "",
                name: "",
                isSaved: false,
                isEditing: true,
                isLoading: false,
                error: {},
            },
        ]));
    };

    const handleChange = (index: number, field: keyof EntityRow, value: string) => {
        updateRow(index, { [field]: value });
    };

    const handleEdit = (index: number) => {
        updateRow(index, { isEditing: true });
    };

    const handleSaveOrUpdate = async (index: number) => {
        const row = rows[index];
        updateRow(index, { isLoading: true });

        try {
            row.isSaved
                ? await onUpdate(extractEntity<T>(row))
                : await onSave(extractEntity<T>(row));

            updateRow(index, {
                isSaved: true,
                isEditing: false,
                isLoading: false,
            });

            toaster.create({
                title: `${row.isSaved ? "Cập nhật" : "Lưu"} thành công`,
                description: `Đã ${row.isSaved ? "cập nhật" : "lưu"} ${entityLabel} ${row.code} - ${row.name}`,
                type: "success",
                closable: true,
            });

        } catch {
            toaster.create({
                title: `${row.isSaved ? "Cập nhật" : "Lưu"} thất bại`,
                description: "Thử lại sau",
                type: "error",
                closable: true,
            });
            updateRow(index, { isLoading: false });
        }
    };

    const handleSaveAll = async () => {
        const validRows = getValidRows();

        setRows((prev) =>
            prev.map((r) =>
                validRows.some((vr) => vr.code === r.code) ? { ...r, isLoading: true } : r
            )
        );

        const promises = validRows.map(async (row) =>
            row.isSaved ? await onUpdate(extractEntity<T>(row))
                : await onSave(extractEntity<T>(row))
        );

        const results = await Promise.allSettled(promises);

        const updatedRows = [...rows];
        results.forEach((result, i) => {
            const targetIndex = rows.findIndex((r) => r === validRows[i]);
            const row = validRows[i];

            if (result.status === "fulfilled") {
                updatedRows[targetIndex] = {
                    ...row,
                    isSaved: true,
                    isEditing: false,
                    isLoading: false,
                };

                toaster.create({
                    description: `${row.code} - ${row.name} đã lưu thành công`,
                    type: "success",
                    closable: true,
                });
            } else {
                updatedRows[targetIndex] = { ...row, isLoading: false };

                toaster.create({
                    description: `${row.code || "(không mã)"} - ${row.name || "(không tên)"} lỗi khi lưu`,
                    type: "error",
                    closable: true,
                });
            }
        });

        setRows(updatedRows.filter((row) => !(row.code.trim() === "" && row.name.trim() === "")));
    };

    const handleRemoveInvalidRows = () => {
        setRows((prev) =>
            validateEntityRows(
                prev.filter((r) => !r.error?.code && !r.error?.name)
            )
        );
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imported = await importEntitiesFromExcel(file);
        const merged = [...rows, ...imported];
        const validated = validateEntityRows(merged);
        setRows(validated);

        const errorCount = validated.filter((r) => r.error?.code || r.error?.name).length;
        toaster.create({
            description: `Đã nhập ${imported.length} dòng từ Excel${errorCount > 0 ? ` (${errorCount} dòng có lỗi)` : ""}`,
            type: errorCount > 0 ? "warning" : "success",
        });
    };

    const handleRemoveRow = async (index: number) => {
        const row = rows[index];
        if (!row?.isSaved) {
            setRows((prev) => validateEntityRows(prev.filter((_, i) => i !== index)));
            return;
        }

        updateRow(index, { isDeleting: true });

        try {
            await onDelete(extractEntity<T>(row).code);
            setRows((prev) => prev.filter((_, i) => i !== index));

            toaster.create({
                title: 'Xóa thành công',
                description: `Đã xóa ${row.code} - ${row.name} `,
                type: "success",
                action: {
                    label: "Hoàn tác",
                    onClick: () => {
                        setTimeout(() => {
                            const restoredRow = { ...row, isDeleting: false, isSaved: false };
                            setRows((prev) => {
                                const insertPos = Math.min(index, prev.length);
                                const updated = [...prev];
                                updated.splice(insertPos, 0, restoredRow);
                                return validateEntityRows(updated);
                            });
                        }, 0);
                    },
                },
            });

        } catch {
            toaster.create({
                title: "Xóa thất bại",
                description: "Thử lại sau",
                type: "error",
                closable: true,
            });
            updateRow(index, { isDeleting: false });
        }
    };

    const handleResetRows = () => {
        setRows((prev) =>
            prev.filter(
                (row) =>
                    (row.code.trim() !== "" || row.name.trim() !== "") &&
                    !row.error?.code &&
                    !row.error?.name &&
                    row.isSaved &&
                    !row.isEditing
            )
        );
    }

    return {
        rows,
        fileInputRef,
        handleAddRow,
        updateRow,
        handleChange,
        handleEdit,
        handleRemoveRow,
        handleSaveOrUpdate,
        handleSaveAll,
        handleRemoveInvalidRows,
        handleResetRows,
        handleImportExcel,
        getValidRows,
    };
}
