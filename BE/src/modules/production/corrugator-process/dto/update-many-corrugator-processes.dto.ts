// // src/modules/corrugator-process/dto/update-many-corrugator-processes.dto.ts

// import { IsArray, IsEnum, IsMongoId } from 'class-validator';
// import { CorrugatorProcessStatus } from '../../schemas/corrugator-process.schema';

// /**
//  * DTO để cập nhật trạng thái cho nhiều quy trình sóng cùng lúc
//  */
// export class UpdateManyCorrugatorProcessesDto {
//   /**
//    * Danh sách ID của các quy trình sóng cần cập nhật
//    */
//   @IsArray()
//   @IsMongoId({ each: true })
//   processIds: string[];

//   /**
//    * Trạng thái mới (RUNNING, PAUSED, CANCELLED, COMPLETED)
//    */
//   @IsEnum(CorrugatorProcessStatus, {
//     message: `Trạng thái không hợp lệ. Phải là một trong các giá trị: RUNNING, PAUSED, CANCELLED, COMPLETED`,
//   })
//   status: CorrugatorProcessStatus;
// }

