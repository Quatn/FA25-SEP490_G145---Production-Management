import { formatDateForInput, minDate } from "@/utils/dateUtils";
import { Box, Collapsible, createListCollection, Field, Flex, HStack, Input, RadioGroup, Select } from "@chakra-ui/react";

interface FilterProps {
    collapsible: any;
    startDate: string;
    endDate: string;
    setStartDate: (startDate: string) => void;
    setEndDate: (endDate: string) => void;
    setSort: (sort: string) => void;
    setTransactionType: (type: string) => void;
}

export const SemiFinishedTransactionHistoryFilter: React.FC<FilterProps> = (
    {
        startDate,
        endDate,
        collapsible,
        setStartDate,
        setEndDate,
        setSort,
        setTransactionType,
    }
) => {
    const today = new Date();
    const localDate = formatDateForInput(today);
    const transactionTypeCollection = createListCollection({
        items: [
            { label: "Nhập", value: "IMPORT" },
            { label: "Xuất", value: "EXPORT" },
        ],
    })
    return (
        <Collapsible.RootProvider value={collapsible}>
            <Collapsible.Content>
                <Box padding="4" borderWidth="1px" rounded="l3">
                    <Flex direction="row" gap={3} justifyContent={"flex-start"}>

                        <Field.Root orientation="vertical">
                            <Field.Label fontSize="lg">Từ ngày</Field.Label>
                            <Input
                                type="date"
                                onChange={(e) => setStartDate(e.target.value)}
                                max={minDate(localDate, endDate)}
                                width="200px"
                            />
                        </Field.Root>

                        <Field.Root orientation="vertical">
                            <Field.Label fontSize="lg">Đến ngày</Field.Label>
                            <Input
                                type="date"
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={localDate}
                                width="200px"
                            />
                        </Field.Root>

                        <Field.Root orientation="vertical">
                            <Field.Label fontSize="lg">Loại thao tác</Field.Label>
                            <Select.Root
                                collection={transactionTypeCollection}
                                size="sm"
                                width="320px"
                                onValueChange={(e) => setTransactionType(e.value[0])}>
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger>
                                        <Select.ValueText placeholder="Chọn thao tác" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.ClearTrigger />
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner>
                                    <Select.Content>
                                        {transactionTypeCollection.items.map((transactionType) => (
                                            <Select.Item item={transactionType} key={transactionType.value}>
                                                {transactionType.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                        </Field.Root>
                    </Flex>
                    <Flex direction="row" gap={3} justifyContent={"flex-start"} mt={10}>
                        <Field.Root orientation="vertical">
                            <Field.Label fontSize="lg">Sắp xếp theo thời gian tạo phiếu</Field.Label>
                            <RadioGroup.Root defaultValue={'ASC'} onValueChange={(e) => setSort(e.value ?? 'ASC')}>
                                <HStack gap="6">
                                    <RadioGroup.Item value={'ASC'}>
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>{'Tăng dần'}</RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                    <RadioGroup.Item value={'DESC'}>
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>{'Giảm dần'}</RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                </HStack>
                            </RadioGroup.Root>
                        </Field.Root>
                    </Flex>
                </Box>
            </Collapsible.Content>
        </Collapsible.RootProvider>
    );
}