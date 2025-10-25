"use client";
import { useEntityForm } from "../hook/usePaperStorageEntityForm";
import { EntityDialog } from "./EntityDialog";
import { useGetPaperColorsQuery, useAddPaperColorsMutation, useUpdatePaperColorMutation, useDeletePaperColorMutation } from "../../service/api/paperRollStorageApiSlice";
import { Text } from "@chakra-ui/react";

const PaperColorForm = () => {
    const {
        data: colorsData,
        isLoading: isColorsLoading,
        error: colorsError,
    } = useGetPaperColorsQuery({ page: 1, limit: 20, });
    const [addColor] = useAddPaperColorsMutation();
    const [updateColor] = useUpdatePaperColorMutation();
    const [deleteColor] = useDeletePaperColorMutation();

    const {
        rows,
        fileInputRef,
        handleAddRow,
        handleChange,
        handleEdit,
        handleRemoveRow,
        handleSaveOrUpdate,
        handleSaveAll,
        handleRemoveInvalidRows,
        handleResetRows,
        handleImportExcel,
        getValidRows,
    } = useEntityForm({
        initialData: colorsData?.paperColors,
        onSave: async (data) => {
            const payload = { ...data };
            return addColor([payload]).unwrap();
        },
        onUpdate: async (data) => {
            const payload = { ...data };
            return updateColor(payload).unwrap();
        },
        onDelete: async (code) => deleteColor(code).unwrap(),
        entityLabel: "màu giấy",
    });

    if (isColorsLoading) return <Text>Loading...</Text>;
    if (colorsError) return <Text>Error loading data</Text>;

    return (
        <EntityDialog
            title="Tạo màu giấy"
            rows={rows}
            fileInputRef={fileInputRef}
            onImportExcel={handleImportExcel}
            onAddRow={handleAddRow}
            onSaveAll={handleSaveAll}
            onRemoveInvalidRows={handleRemoveInvalidRows}
            onReset={handleResetRows}
            getValidRows={getValidRows}
            onChange={handleChange}
            onSaveOrUpdate={handleSaveOrUpdate}
            onRemove={handleRemoveRow}
            onEdit={handleEdit}
        />
    );
};

export default PaperColorForm;
