"use client"

import DataEmpty from "@/components/common/DataEmpty";
import DataFetchError from "@/components/common/DataFetchError";
import DataLoading from "@/components/common/DataLoading";
import { useUserManagementPageDispatch, useUserManagementPageState } from "@/context/user/userManagementPageContext";
import { useGetEmployeesForUserListsQuery } from "@/service/api/employeeApiSlice";
import { Box, Stack } from "@chakra-ui/react"
import check from "check-types";
import { useEffect } from "react";
import UserManagementListItem from "./UserListItem";
import { Employee } from "@/types/Employee";
import { deserializeEmployee } from "@/utils/deserializers/deserializeEmployee";

export default function UserManagementList() {
  const { page, limit, search } = useUserManagementPageState()
  const dispatch = useUserManagementPageDispatch()

  const {
    data: fullDetailEmployeesPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetEmployeesForUserListsQuery({ page, limit, query: search });

  const employeePaginatedList = fullDetailEmployeesPaginatedResponse?.data

  useEffect(() => {
    dispatch({
      type: "SET_TOTAL_ITEMS",
      payload: employeePaginatedList ? employeePaginatedList.totalItems : 0,
    });
  }, [dispatch, employeePaginatedList, employeePaginatedList?.totalItems]);

  if (isFetchingList) {
    return (
      <DataLoading />
    );
  }

  if (fetchError) {
    return <DataFetchError />
  }

  if (check.undefined(employeePaginatedList) || check.emptyArray(employeePaginatedList.data)) {
    return <DataEmpty />
  }

  const listData: Employee[] = employeePaginatedList.data.filter(empl => !check.string(empl.role)).map(empl => deserializeEmployee(empl))

  return (
    <Stack gap={8}>
      {listData.map(empl => (
        <UserManagementListItem key={empl._id} employee={empl} />
      ))}
    </Stack>
  )
}
