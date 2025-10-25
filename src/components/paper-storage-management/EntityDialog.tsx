import { EntityRowItem } from "./EntityRowItem";
import { EntityRow } from "@/types/paperStorage.types";

import {
  Dialog,
  Portal,
  Flex,
  Button,
  Spacer,
  Icon,
  Input,
  CloseButton,
} from "@chakra-ui/react";
import { PiMicrosoftExcelLogoThin } from "react-icons/pi";
import { HiX } from "react-icons/hi";

interface EntityDialogProps {
  title: string;
  labelPrefix?: string;
  rows: EntityRow[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddRow: () => void;
  onSaveAll: () => void;
  onRemoveInvalidRows: () => void;
  onReset: () => void;
  getValidRows: () => EntityRow[];
  onChange: (index: number, field: keyof EntityRow, value: string) => void;
  onSaveOrUpdate: (index: number) => void;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

export const EntityDialog = ({
  title,
  labelPrefix = "Dòng",
  rows,
  fileInputRef,
  onImportExcel,
  onAddRow,
  onSaveAll,
  onRemoveInvalidRows,
  onReset,
  getValidRows,
  onChange,
  onSaveOrUpdate,
  onRemove,
  onEdit,
}: EntityDialogProps) => (
  <Dialog.Root size="lg" placement="top" scrollBehavior="inside" motionPreset="slide-in-bottom" closeOnInteractOutside={false} modal={false}>
    <Dialog.Trigger asChild>
      <Button variant="outline" size="sm">Open Dialog</Button>
    </Dialog.Trigger>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                variant="outline"
                color="white"
                backgroundColor="red"
                size="lg"
                onClick={onReset}
              >
                <HiX />
              </CloseButton>
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <Flex gap={3} justify="flex-start" direction="row">
              <Input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={onImportExcel}
              />
              <Button colorPalette="green" onClick={() => fileInputRef.current?.click()}>
                Nhập từ <Icon><PiMicrosoftExcelLogoThin /></Icon> Excel
              </Button>
            </Flex>

            <Flex gap={3} direction="column" marginTop="10">
              {rows.map((row, index) => (
                <EntityRowItem
                  key={index}
                  row={row}
                  index={index}
                  onChange={onChange}
                  onSaveOrUpdate={onSaveOrUpdate}
                  onRemove={onRemove}
                  onEdit={onEdit}
                  labelPrefix={labelPrefix}
                />
              ))}
            </Flex>

            <Flex marginTop={10} gap={3} justify="flex-start" direction="row">
              <Button variant="surface" onClick={onAddRow}>Thêm 1 dòng</Button>
              <Spacer />
              <Button
                colorPalette="blue"
                onClick={onSaveAll}
                disabled={!getValidRows().length}
              >
                Lưu {getValidRows().length} dòng hợp lệ
              </Button>
              <Button colorPalette="red" onClick={onRemoveInvalidRows}>
                Xóa dòng lỗi
              </Button>
            </Flex>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);