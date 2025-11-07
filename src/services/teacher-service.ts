import apiClient from './api';

export interface TeacherRequestsDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  paymentType?: string;
  branchName?: string[];
  fees?: number;
  paid?: number;
  remainingAmount?: number;
  education?: string;
  markshit?: string;
  invoice?: string;
}

export async function deleteTeacher(id: number): Promise<void> {
  await apiClient.delete(`/teachers/${id}`);
}

export interface TeacherResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  masterAdminName?: string;
  role?: string;
  branchNames?: string[];
}

export async function createTeacherWithImages(
  data: TeacherRequestsDto,
  options: {
    masterAdminId: number;
    addharImage?: File | null;
    markshitImage?: File | null;
  }
): Promise<TeacherResponseDto> {
  const fd = new FormData();

  fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (options.addharImage) fd.append('addharImage', options.addharImage);
  if (options.markshitImage) fd.append('markshitImage', options.markshitImage);

  const res = await apiClient.post< TeacherResponseDto >(
    `/teachers`,
    fd,
    {
      params: { masterAdminId: options.masterAdminId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return res.data;
}
