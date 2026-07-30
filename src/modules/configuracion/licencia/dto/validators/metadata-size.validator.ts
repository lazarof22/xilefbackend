import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom que rechaza si `JSON.stringify(metadata)` supera `maxChars`.
 * Aplica a campos de tipo objeto opcional con `@ValidateIf((o) => o.metadata)`.
 */
@ValidatorConstraint({ name: 'MetadataSize', async: false })
export class MetadataSize implements ValidatorConstraintInterface {
  validate(value: Record<string, unknown>, args: ValidationArguments): boolean {
    if (value === undefined || value === null) return true;
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch {
      return false;
    }
    const maxChars = (args.constraints[0] as number) ?? 4096;
    return serialized.length <= maxChars;
  }

  defaultMessage(args: ValidationArguments): string {
    const maxChars = (args.constraints[0] as number) ?? 4096;
    return `metadata serializado excede ${maxChars} caracteres`;
  }
}
