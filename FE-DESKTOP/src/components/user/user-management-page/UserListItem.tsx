"use client"

import { Field } from "@/components/ui/field";
import { ALL_ACCESS_PRIVILEGE_VALUES } from "@/types/AccessPrivileges";
import { Employee } from "@/types/Employee";
import { Role } from "@/types/Role";
import { Box, Button, Card, createListCollection, DataList, HStack, Input, Portal, Select, Stack, Strong, Text } from "@chakra-ui/react";
import { AddUserForm } from "./AddUserForm";
import { useState } from "react";
import { EditUserForm } from "./EditUserForm";

const getStats = (employee: Employee) => {
  return [
    { label: "Mã nhân viên", value: employee.code },
    { label: "Chức vụ", value: (employee.role as Role).name },
    { label: "Email", value: employee.email },
    { label: "Số điện thoại", value: employee.contactNumber },
  ]
}

export type UserManagementListItemProps = {
  employee: Employee
}

export default function UserManagementListItem(props: UserManagementListItemProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <Card.Root flexDirection="row" overflow="hidden">
      <Card.Body>
        <Card.Description>
          <Strong color="fg">{props.employee.name}</Strong>
        </Card.Description>
        <DataList.Root orientation="horizontal">
          {getStats(props.employee).map((item) => (
            <DataList.Item key={item.label}>
              <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
              <DataList.ItemValue>{item.value}</DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      </Card.Body>
      <Card.Footer>
        {props.employee.user ? <Stack justifyContent={"start"} h={"full"} pt={5} width="16rem">
          <EditUserForm user={props.employee.user} />
        </Stack> : <Stack justifyContent={"start"} h={"full"} pt={5} width="16rem">
          {!showForm && <Button size="sm" colorPalette={"blue"} onClick={() => setShowForm(true)}>Add user</Button>}
          {showForm && <AddUserForm employee={props.employee} />}
        </Stack>}
      </Card.Footer>
    </Card.Root>
  )
}
