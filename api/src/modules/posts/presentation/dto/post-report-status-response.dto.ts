import type { ReportPostResult } from '@/modules/posts/application/services/report-post.service.js';

export class PostReportStatusResponseDto {
  reported!: boolean;
  alreadyReported!: boolean;

  static fromReportResult(
    result: ReportPostResult,
  ): PostReportStatusResponseDto {
    const dto = new PostReportStatusResponseDto();
    dto.reported = true;
    dto.alreadyReported = result.alreadyReported;

    return dto;
  }

  static fromReported(reported: boolean): PostReportStatusResponseDto {
    const dto = new PostReportStatusResponseDto();
    dto.reported = reported;
    dto.alreadyReported = reported;

    return dto;
  }
}
