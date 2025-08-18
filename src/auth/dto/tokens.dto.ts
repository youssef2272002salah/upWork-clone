import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      fullName: 'John Doe',
      email: 'user@example.com',
      profilePicture: 'https://example.com/profile.jpg',
      role: 'user',
    },
    description: 'User information',
  })
  user: {
    id: string;
    fullName: string;
    email: string;
    profilePicture: string;
    role: string;
  };
}