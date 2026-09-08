import { Type, Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

@ValidatorConstraint({ name: 'uniqueOrderProductIds', async: false })
export class UniqueOrderProductIdsConstraint implements ValidatorConstraintInterface {
  validate(items: CreateOrderItemDto[] | undefined): boolean {
    if (!Array.isArray(items)) {
      return false;
    }

    const ids = items.map((item) => item.productId);
    return new Set(ids).size === ids.length;
  }

  defaultMessage(): string {
    return 'items must not contain duplicate productId values';
  }
}

export class CreateOrderItemDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  productId!: string;

  @Type(() => Number)
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @Max(1000, { message: 'quantity must not exceed 1000' })
  quantity!: number;
}

export class CreateOrderDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @Transform(trimString)
  @IsEmail()
  @MaxLength(255)
  userEmail!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  userPhone!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'items must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @Validate(UniqueOrderProductIdsConstraint)
  items!: CreateOrderItemDto[];
}
