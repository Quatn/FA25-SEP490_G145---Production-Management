"use client"
import { Field, Input } from "@chakra-ui/react"
import { useState } from "react"

export default function TestDataOutsideControlledInput() {
  const [input, setInput] = useState("")

  return (
    <Field.Root m={2}>
      <Field.Label>
        Unrelated Input Field <Field.RequiredIndicator />
      </Field.Label>
      <Input value={input} onChange={(e) => setInput(e.target.value)} bg={"bg"} />
      <Field.HelperText>This is an unrelated input field, spamming inputs in it does not cause anything to re-render, not causing any lag but not doing anything either.</Field.HelperText>
    </Field.Root>
  )
}
