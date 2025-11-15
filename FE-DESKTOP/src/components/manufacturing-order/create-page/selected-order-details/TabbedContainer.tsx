"use client";

import {
  useManufacturingOrderCreatePageDispatch,
  useManufacturingOrderCreatePageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Button, Group, HStack, Tabs } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import CreatePageManufacturingOrderTable from "./details-table-tab/Table";

export default function ManufacturingOrderCreatePageSelectedOrdersDetails() {
  const { groupType } = useManufacturingOrderCreatePageState();
  const dispatch = useManufacturingOrderCreatePageDispatch();

  return (
    <Tabs.Root defaultValue="members">
      <Tabs.List>
        <Tabs.Trigger value="members">
          <LuUser />
          Thông tin các lệnh sẽ tạo
        </Tabs.Trigger>
        <Tabs.Trigger value="projects">
          <LuFolder />
          Kiểm tra nguyên phụ liệu
        </Tabs.Trigger>
        <Tabs.Trigger value="tasks">
          <LuSquareCheck />
          Kiểm tra tồn kho hàng
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="members">
        <CreatePageManufacturingOrderTable />
      </Tabs.Content>
      <Tabs.Content value="projects">Manage your projects</Tabs.Content>
      <Tabs.Content value="tasks">
        Manage your tasks for freelancers
      </Tabs.Content>
    </Tabs.Root>
  );
}
