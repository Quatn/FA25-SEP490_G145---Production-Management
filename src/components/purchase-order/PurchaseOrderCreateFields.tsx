import { Field, Input } from "@chakra-ui/react";

export default function PurchaseOrderCreateFields() {
  return (
    <>
      <Field.Root invalid>
        <Field.Root>
          <Field.Label>Id</Field.Label>
          <Input placeholder="" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Customer Code</Field.Label>
          <Input placeholder="" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Order Date</Field.Label>
          <Input placeholder="" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Delivery Adress</Field.Label>
          <Input placeholder="" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Payment Terms</Field.Label>
          <Input placeholder="" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Notes</Field.Label>
          <Input placeholder="" />
        </Field.Root>
      </Field.Root>
    </>
  );
}
