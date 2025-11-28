export class ChangePasswordRequestDto {
  id: mongoose.Types.ObjectId;
  currentPassword: string;
  newPassword: string;
}
