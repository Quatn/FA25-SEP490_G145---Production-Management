"use client"
import { Field, Input } from "@chakra-ui/react"
import { useDataTableDispatch, useDataTableSelector } from "../ui/data-table/Provider"
import { ChangeEvent } from "react"

export const TestDataTableQueryInput = () => {
  const query = useDataTableSelector((s) => s.query)
  const dispatch = useDataTableDispatch()
  const handleSetQuery = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_QUERY", payload: e.target.value })
  }

  console.log("TestDataTableQueryInput re-rendered")

  return (
    <Field.Root required m={2}>
      <Field.Label>
        Dispatching Input Field <Field.RequiredIndicator />
      </Field.Label>
      <Input value={query} onChange={handleSetQuery} bg={"bg"} />
      <Field.HelperText>This is identical the TestDataTableQueryInput defined in the TestDataTable component, just defined and used outside of the file. They&lsquo;re both in the same provider so they access and send message to the same store.</Field.HelperText>
    </Field.Root>
  )
}
