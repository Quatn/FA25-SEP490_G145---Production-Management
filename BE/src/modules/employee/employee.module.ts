import { Module } from "@nestjs/common";
import { EmployeeController } from "./employee.controller";
import { EmployeeService } from "./employee.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Employee, EmployeeSchema } from "./schemas/employee.schema";
import { Role, RoleSchema } from "./schemas/role.schema";
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    RoleModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule { }
